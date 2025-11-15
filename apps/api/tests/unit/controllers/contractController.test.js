import { beforeEach, describe, expect, it, vi } from "vitest";

import * as contractController from "../../../src/controllers/contractController.js";
import * as contractParserService from "../../../src/services/contractParserService.js";
import { fileService } from "../../../src/services/fileService.js";
import * as medicationService from "../../../src/services/medicationService.js";
import * as medicationVariantService from "../../../src/services/medicationVariantService.js";
import logger from "../../../src/utils/logger.js";

vi.mock("../../../src/services/contractParserService.js");
vi.mock("../../../src/services/fileService.js");
vi.mock("../../../src/services/medicationService.js");
vi.mock("../../../src/services/medicationVariantService.js");
vi.mock("../../../src/utils/logger.js");

describe("contractController", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe("parseContract", () => {
    it("should return 400 if fileId is missing", async () => {
      req.body = {};

      await contractController.parseContract(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "File ID is required",
      });
    });

    it("should return 404 if file not found", async () => {
      req.body = { fileId: "non-existent-file-id" };
      fileService.getFileWithBlob.mockResolvedValue(null);

      await contractController.parseContract(req, res, next);

      expect(fileService.getFileWithBlob).toHaveBeenCalledWith(
        "non-existent-file-id"
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "File not found",
      });
    });

    it("should return 400 if file type is unsupported", async () => {
      req.body = { fileId: "file-123" };
      const mockFile = {
        id: "file-123",
        mimeType: "image/jpeg",
        blob: Buffer.from("fake image data"),
      };
      fileService.getFileWithBlob.mockResolvedValue(mockFile);

      await contractController.parseContract(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unsupported file type. Only PDF and DOC/DOCX are supported.",
      });
    });

    it("should parse PDF contract successfully", async () => {
      req.body = { fileId: "file-123" };

      const mockFile = {
        id: "file-123",
        mimeType: "application/pdf",
        blob: Buffer.from("fake pdf data"),
      };

      const mockParsedData = {
        success: true,
        data: {
          supplier: {
            name: "ABC Pharma",
            contactPerson: "John Doe",
          },
          medications: [
            {
              name: "Aspirin",
              variantName: "100mg Tablet",
              supplierSku: "ASP-100",
              quantity: 1000,
              unitPrice: 5.5,
            },
          ],
          contract: {
            number: "CT-2024-001",
            date: "2024-01-15",
          },
        },
      };

      const mockMedications = [
        {
          id: "med-1",
          name: "Aspirin",
          genericName: "Aspirin",
        },
      ];

      const mockVariants = [
        {
          id: "var-1",
          medicationId: "med-1",
          name: "100mg Tablet",
          sku: "ASP-100",
        },
      ];

      fileService.getFileWithBlob.mockResolvedValue(mockFile);
      contractParserService.parseContractFile.mockResolvedValue(mockParsedData);
      medicationService.getAllMedications.mockResolvedValue(mockMedications);
      contractParserService.matchMedicationsWithDatabase.mockReturnValue([
        {
          name: "Aspirin",
          variantName: "100mg Tablet",
          supplierSku: "ASP-100",
          quantity: 1000,
          unitPrice: 5.5,
          medicationId: "med-1",
        },
      ]);
      medicationVariantService.getAllMedicationVariants.mockResolvedValue(
        mockVariants
      );

      await contractController.parseContract(req, res, next);

      expect(fileService.getFileWithBlob).toHaveBeenCalledWith("file-123");
      expect(contractParserService.parseContractFile).toHaveBeenCalledWith(
        mockFile.blob,
        mockFile.mimeType
      );
      expect(medicationService.getAllMedications).toHaveBeenCalled();
      expect(
        contractParserService.matchMedicationsWithDatabase
      ).toHaveBeenCalledWith(mockParsedData.data.medications, mockMedications);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Contract parsed successfully",
        data: expect.objectContaining({
          supplier: mockParsedData.data.supplier,
          contract: mockParsedData.data.contract,
          medications: expect.arrayContaining([
            expect.objectContaining({
              medicationId: "med-1",
              medicationVariantId: "var-1",
            }),
          ]),
        }),
      });
    });

    it("should parse DOCX contract successfully", async () => {
      req.body = { fileId: "file-456" };

      const mockFile = {
        id: "file-456",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        blob: Buffer.from("fake docx data"),
      };

      const mockParsedData = {
        success: true,
        data: {
          supplier: { name: "XYZ Pharma" },
          medications: [],
          contract: { number: "CT-2024-002" },
        },
      };

      fileService.getFileWithBlob.mockResolvedValue(mockFile);
      contractParserService.parseContractFile.mockResolvedValue(mockParsedData);
      medicationService.getAllMedications.mockResolvedValue([]);
      contractParserService.matchMedicationsWithDatabase.mockReturnValue([]);
      medicationVariantService.getAllMedicationVariants.mockResolvedValue([]);

      await contractController.parseContract(req, res, next);

      expect(contractParserService.parseContractFile).toHaveBeenCalledWith(
        mockFile.blob,
        mockFile.mimeType
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Contract parsed successfully",
        })
      );
    });

    it("should parse DOC contract successfully", async () => {
      req.body = { fileId: "file-789" };

      const mockFile = {
        id: "file-789",
        mimeType: "application/msword",
        blob: Buffer.from("fake doc data"),
      };

      const mockParsedData = {
        success: true,
        data: {
          supplier: { name: "LMN Pharma" },
          medications: [],
          contract: { number: "CT-2024-003" },
        },
      };

      fileService.getFileWithBlob.mockResolvedValue(mockFile);
      contractParserService.parseContractFile.mockResolvedValue(mockParsedData);
      medicationService.getAllMedications.mockResolvedValue([]);
      contractParserService.matchMedicationsWithDatabase.mockReturnValue([]);
      medicationVariantService.getAllMedicationVariants.mockResolvedValue([]);

      await contractController.parseContract(req, res, next);

      expect(contractParserService.parseContractFile).toHaveBeenCalledWith(
        mockFile.blob,
        mockFile.mimeType
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });

    it("should handle medications without matched variants", async () => {
      req.body = { fileId: "file-123" };

      const mockFile = {
        id: "file-123",
        mimeType: "application/pdf",
        blob: Buffer.from("fake pdf data"),
      };

      const mockParsedData = {
        success: true,
        data: {
          supplier: { name: "ABC Pharma" },
          medications: [
            {
              name: "Unknown Drug",
              variantName: "50mg Capsule",
              quantity: 100,
            },
          ],
          contract: { number: "CT-2024-001" },
        },
      };

      fileService.getFileWithBlob.mockResolvedValue(mockFile);
      contractParserService.parseContractFile.mockResolvedValue(mockParsedData);
      medicationService.getAllMedications.mockResolvedValue([]);
      contractParserService.matchMedicationsWithDatabase.mockReturnValue([
        {
          name: "Unknown Drug",
          variantName: "50mg Capsule",
          quantity: 100,
          medicationId: null, // Not matched
        },
      ]);
      medicationVariantService.getAllMedicationVariants.mockResolvedValue([]);

      await contractController.parseContract(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            medications: expect.arrayContaining([
              expect.objectContaining({
                name: "Unknown Drug",
                medicationId: null,
              }),
            ]),
          }),
        })
      );
    });

    it("should match variants by fuzzy name matching", async () => {
      req.body = { fileId: "file-123" };

      const mockFile = {
        id: "file-123",
        mimeType: "application/pdf",
        blob: Buffer.from("fake pdf data"),
      };

      const mockParsedData = {
        success: true,
        data: {
          supplier: { name: "ABC Pharma" },
          medications: [
            {
              name: "Paracetamol",
              variantName: "500mg (Tablet)",
              quantity: 500,
            },
          ],
          contract: { number: "CT-2024-001" },
        },
      };

      const mockMedications = [
        {
          id: "med-2",
          name: "Paracetamol",
        },
      ];

      const mockVariants = [
        {
          id: "var-2",
          medicationId: "med-2",
          name: "500mg Tablet",
          sku: null,
        },
      ];

      fileService.getFileWithBlob.mockResolvedValue(mockFile);
      contractParserService.parseContractFile.mockResolvedValue(mockParsedData);
      medicationService.getAllMedications.mockResolvedValue(mockMedications);
      contractParserService.matchMedicationsWithDatabase.mockReturnValue([
        {
          name: "Paracetamol",
          variantName: "500mg (Tablet)",
          quantity: 500,
          medicationId: "med-2",
        },
      ]);
      medicationVariantService.getAllMedicationVariants.mockResolvedValue(
        mockVariants
      );

      await contractController.parseContract(req, res, next);

      // Check that final match log was called (not just any info log)
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("✅ Final match:")
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            medications: expect.arrayContaining([
              expect.objectContaining({
                medicationVariantId: "var-2",
                variantName: "500mg Tablet",
              }),
            ]),
          }),
        })
      );
    });

    it("should log warning when no variant match found", async () => {
      req.body = { fileId: "file-123" };

      const mockFile = {
        id: "file-123",
        mimeType: "application/pdf",
        blob: Buffer.from("fake pdf data"),
      };

      const mockParsedData = {
        success: true,
        data: {
          supplier: { name: "ABC Pharma" },
          medications: [
            {
              name: "Ibuprofen",
              variantName: "200mg Tablet",
              quantity: 300,
            },
          ],
          contract: { number: "CT-2024-001" },
        },
      };

      const mockMedications = [
        {
          id: "med-3",
          name: "Ibuprofen",
        },
      ];

      const mockVariants = [
        {
          id: "var-3",
          medicationId: "med-3",
          name: "400mg Tablet", // Different dosage
          sku: null,
        },
      ];

      fileService.getFileWithBlob.mockResolvedValue(mockFile);
      contractParserService.parseContractFile.mockResolvedValue(mockParsedData);
      medicationService.getAllMedications.mockResolvedValue(mockMedications);
      contractParserService.matchMedicationsWithDatabase.mockReturnValue([
        {
          name: "Ibuprofen",
          variantName: "200mg Tablet",
          quantity: 300,
          medicationId: "med-3",
        },
      ]);
      medicationVariantService.getAllMedicationVariants.mockResolvedValue(
        mockVariants
      );

      await contractController.parseContract(req, res, next);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("⚠️ No variant match found")
      );
    });

    it("should handle errors", async () => {
      req.body = { fileId: "file-123" };
      const error = new Error("File processing error");
      fileService.getFileWithBlob.mockRejectedValue(error);

      await contractController.parseContract(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(
        "Error parsing contract:",
        error
      );
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
