import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock GoogleGenerativeAI BEFORE importing service
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn().mockReturnValue({
  generateContent: mockGenerateContent,
});

// Mock external dependencies
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}));
vi.mock("mammoth");
vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => {
  const mockGetDocument = vi.fn();
  return {
    default: {
      getDocument: mockGetDocument,
    },
    getDocument: mockGetDocument, // Export at module level too
  };
});
vi.mock("@/utils/logger.js");

describe("ContractParserService", () => {
  let contractParserService;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Import service AFTER mocks are setup
    contractParserService = await import("@/services/contractParserService.js");
  });

  describe("parseContractFile - PDF", () => {
    it("should parse PDF contract with AI successfully", async () => {
      const mockPdfBuffer = Buffer.from("mock pdf content");
      const mockAiParsedData = {
        supplier: {
          name: "Công ty Dược phẩm A",
          address: "123 Đường ABC",
          phone: "0123456789",
          email: "contact@company.com",
        },
        contractDetails: {
          contractNumber: "HĐ001",
          contractDate: "2025-01-01",
          effectiveDate: "2025-01-15",
          deliveryDays: 7,
          totalAmount: 10000000,
        },
        medications: [
          {
            medicationName: "Paracetamol",
            variantName: "Paracetamol 500mg Viên nén",
            supplierSku: "VP-PAR500",
            leadTimeDays: 5,
            purchasePrice: 50000,
          },
        ],
      };

      // Mock pdfjs
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjsLib.default.getDocument.mockReturnValue({
        promise: Promise.resolve({
          numPages: 1,
          getPage: vi.fn().mockResolvedValue({
            getTextContent: vi.fn().mockResolvedValue({
              items: [{ str: "Contract text content" }],
            }),
          }),
        }),
      });

      // Setup AI mock to return valid JSON
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockAiParsedData),
        },
      });

      const result = await contractParserService.parseContractFile(
        mockPdfBuffer,
        "application/pdf"
      );

      expect(result.success).toBe(true);
      expect(result.parsedBy).toBe("ai");
      expect(result.data.supplier.name).toBe("Công ty Dược phẩm A");
      expect(result.data.medications).toHaveLength(1);
    });

    it("should fallback to regex parsing if AI fails", async () => {
      const mockPdfBuffer = Buffer.from("mock pdf content");

      // Mock pdfjs
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjsLib.default.getDocument.mockReturnValue({
        promise: Promise.resolve({
          numPages: 1,
          getPage: vi.fn().mockResolvedValue({
            getTextContent: vi.fn().mockResolvedValue({
              items: [
                { str: "Tên Bên bán: Công ty ABC" },
                { str: "Email: test@example.com" },
                { str: "Số: HĐ001" },
              ],
            }),
          }),
        }),
      });

      // Make AI mock fail
      mockGenerateContent.mockRejectedValue(new Error("AI parsing failed"));

      const result = await contractParserService.parseContractFile(
        mockPdfBuffer,
        "application/pdf"
      );

      expect(result.success).toBe(true);
      expect(result.parsedBy).toBe("regex");
    });
  });

  describe("parseContractFile - DOCX", () => {
    it("should parse DOCX contract with regex", async () => {
      const mockDocxBuffer = Buffer.from("mock docx content");
      const mockExtractedText = `
        Tên Bên bán: Công ty Dược phẩm XYZ
        Địa chỉ: 456 Đường DEF
        Điện thoại: 0987654321
        Email: contact@xyz.com
        Số: HĐ002
        ngày 15 tháng 01 năm 2025
      `;

      // Mock mammoth
      const mammoth = await import("mammoth");
      mammoth.default.extractRawText = vi.fn().mockResolvedValue({
        value: mockExtractedText,
      });

      const result = await contractParserService.parseContractFile(
        mockDocxBuffer,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );

      expect(result.success).toBe(true);
      expect(result.parsedBy).toBe("regex");
      expect(result.data.supplier).toBeDefined();
    });
  });

  describe("parseContractFile - error handling", () => {
    it("should throw error for unsupported file type", async () => {
      const mockBuffer = Buffer.from("mock content");

      await expect(
        contractParserService.parseContractFile(mockBuffer, "image/png")
      ).rejects.toThrow("Unsupported file type");
    });

    it("should throw error if PDF extraction fails", async () => {
      const mockPdfBuffer = Buffer.from("invalid pdf");

      // Mock pdfjs to fail
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjsLib.default.getDocument.mockReturnValue({
        promise: Promise.reject(new Error("Invalid PDF")),
      });

      await expect(
        contractParserService.parseContractFile(
          mockPdfBuffer,
          "application/pdf"
        )
      ).rejects.toThrow("Failed to parse contract");
    });
  });

  describe("matchMedicationsWithDatabase", () => {
    it("should match medications with exact name", () => {
      const contractMeds = [
        {
          medicationName: "Paracetamol",
          variantName: "500mg",
          supplierSku: "PAR-500",
        },
      ];

      const dbMeds = [
        { id: "med-1", name: "Paracetamol" },
        { id: "med-2", name: "Ibuprofen" },
      ];

      const result = contractParserService.matchMedicationsWithDatabase(
        contractMeds,
        dbMeds
      );

      expect(result[0].medicationId).toBe("med-1");
      expect(result[0].matchConfidence).toBe("high");
    });

    it("should match medications with partial name", () => {
      const contractMeds = [
        {
          medicationName: "Para",
          variantName: "500mg",
          supplierSku: "PAR-500",
        },
      ];

      const dbMeds = [{ id: "med-1", name: "Paracetamol" }];

      const result = contractParserService.matchMedicationsWithDatabase(
        contractMeds,
        dbMeds
      );

      expect(result[0].medicationId).toBe("med-1");
      expect(result[0].matchConfidence).toBe("medium");
    });

    it("should return low confidence if no match found", () => {
      const contractMeds = [
        {
          medicationName: "Unknown Medicine",
          variantName: "100mg",
          supplierSku: "UNK-100",
        },
      ];

      const dbMeds = [{ id: "med-1", name: "Paracetamol" }];

      const result = contractParserService.matchMedicationsWithDatabase(
        contractMeds,
        dbMeds
      );

      expect(result[0].medicationId).toBeNull();
      expect(result[0].matchConfidence).toBe("low");
    });

    it("should handle empty arrays", () => {
      const result = contractParserService.matchMedicationsWithDatabase([], []);

      expect(result).toEqual([]);
    });

    it("should handle case-insensitive matching", () => {
      const contractMeds = [
        {
          medicationName: "PARACETAMOL",
          variantName: "500mg",
        },
      ];

      const dbMeds = [{ id: "med-1", name: "paracetamol" }];

      const result = contractParserService.matchMedicationsWithDatabase(
        contractMeds,
        dbMeds
      );

      expect(result[0].medicationId).toBe("med-1");
      // Case-insensitive match returns "medium" confidence, not "high"
      expect(result[0].matchConfidence).toBe("medium");
    });
  });
});
