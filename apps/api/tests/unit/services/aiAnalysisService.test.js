import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock GoogleGenerativeAI BEFORE importing service
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn().mockReturnValue({
  generateContent: mockGenerateContent,
});

vi.mock("@/db/index.js");
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}));

describe("AI Analysis Service", () => {
  let mockDb;
  let aiAnalysisService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const { db } = await import("@/db/index.js");
    mockDb = db;

    mockDb.select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    });

    // Import service AFTER mocks are setup
    const service = await import("@/services/aiAnalysisService.js");
    aiAnalysisService = service.aiAnalysisService;
  });

  describe("getSalesAndInventoryData", () => {
    it("should get sales and inventory data for default period", async () => {
      const mockSalesData = [
        {
          medicationId: "med-1",
          medicationName: "Paracetamol",
          variantId: "var-1",
          variantName: "500mg",
          totalQuantitySold: 100,
          totalRevenue: 500000,
          orderCount: 10,
        },
      ];

      const mockInventoryData = [
        {
          variantId: "var-1",
          medicationName: "Paracetamol",
          totalStock: 200,
          availableStock: 150,
          nearestExpiry: new Date("2025-12-31"),
        },
      ];

      // First call for sales data (with orderBy), second call for inventory data (with groupBy only)
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Sales data query - ends with .orderBy()
          return {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockResolvedValue(mockSalesData),
          };
        } else {
          // Inventory data query - ends with .groupBy() directly (no orderBy)
          return {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockResolvedValue(mockInventoryData),
          };
        }
      });

      const result = await aiAnalysisService.getSalesAndInventoryData(90);

      expect(result.salesData).toEqual(mockSalesData);
      expect(result.inventoryData).toEqual(mockInventoryData);
      expect(result.daysAnalyzed).toBe(90);
    });

    it("should identify low stock items", async () => {
      const mockInventoryData = [
        {
          variantId: "var-1",
          medicationName: "Medicine A",
          totalStock: 15,
          availableStock: 10,
        },
        {
          variantId: "var-2",
          medicationName: "Medicine B",
          totalStock: 50,
          availableStock: 50,
        },
      ];

      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockResolvedValue([]),
          };
        } else {
          return {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockResolvedValue(mockInventoryData),
          };
        }
      });

      const result = await aiAnalysisService.getSalesAndInventoryData();

      expect(result.lowStockItems).toHaveLength(1);
      expect(result.lowStockItems[0].medicationName).toBe("Medicine A");
    });

    it("should identify expiring soon items", async () => {
      const soonExpiry = new Date();
      soonExpiry.setDate(soonExpiry.getDate() + 30);

      const mockInventoryData = [
        {
          variantId: "var-1",
          medicationName: "Medicine A",
          nearestExpiry: soonExpiry,
          availableStock: 100,
        },
      ];

      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockResolvedValue([]),
          };
        } else {
          return {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockResolvedValue(mockInventoryData),
          };
        }
      });

      const result = await aiAnalysisService.getSalesAndInventoryData();

      expect(result.expiringSoonItems).toHaveLength(1);
    });
  });

  describe("generatePurchaseRecommendations", () => {
    it("should generate AI recommendations successfully", async () => {
      // Mock sales and inventory data with proper call sequence
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Sales data
          return {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockResolvedValue([]),
          };
        } else {
          // Inventory data
          return {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockResolvedValue([]),
          };
        }
      });

      // Mock Gemini AI response
      const mockAiResponse = {
        forecastingMethodology: {
          method: "Time Series Analysis",
          principles: ["Demand forecasting", "Safety stock calculation"],
          standards: ["EOQ", "Reorder Point"],
          calculation: "Average Daily Demand = Total Sold / Days Analyzed",
          rationale: "Based on historical sales data",
        },
        summary: {
          overallAssessment: "Stable growth in sales",
          keyInsights: ["Top selling items identified", "Low stock alerts"],
        },
        priorityRecommendations: [
          {
            priority: "HIGH",
            productName: "Paracetamol 500mg",
            currentStock: 10,
            recommendedQuantity: 200,
            reasoning: "High demand, low stock",
            expectedBenefit: "Prevent stockout",
            estimatedCost: 5000000,
          },
        ],
        categoryInsights: [],
        warnings: [],
        financialProjection: {
          estimatedTotalInvestment: 5000000,
          expectedROI: "20%",
          paybackPeriod: "30 days",
        },
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockAiResponse),
        },
      });

      const result =
        await aiAnalysisService.generatePurchaseRecommendations(90);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("forecastingMethodology");
      expect(result.data.priorityRecommendations).toHaveLength(1);
      expect(result.metadata.analyzedPeriod).toBe(90);
    });

    it("should handle AI rate limiting with retry", async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockResolvedValue([]),
          };
        } else {
          return {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockResolvedValue([]),
          };
        }
      });

      // First call fails with 429, second succeeds
      mockGenerateContent
        .mockRejectedValueOnce({
          status: 429,
          errorDetails: [
            {
              "@type": "type.googleapis.com/google.rpc.RetryInfo",
              retryDelay: "1s",
            },
          ],
        })
        .mockResolvedValueOnce({
          response: {
            text: () =>
              JSON.stringify({
                forecastingMethodology: {},
                summary: {},
                priorityRecommendations: [],
                categoryInsights: [],
                warnings: [],
                financialProjection: {},
              }),
          },
        });

      // Mock setTimeout to avoid actual delay
      vi.useFakeTimers();
      const promise = aiAnalysisService.generatePurchaseRecommendations(90);
      await vi.runAllTimersAsync();
      const result = await promise;
      vi.useRealTimers();

      expect(result.success).toBe(true);
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });

    it("should throw error if AI returns invalid JSON", async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockResolvedValue([]),
          };
        } else {
          return {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockResolvedValue([]),
          };
        }
      });

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => "Invalid JSON response",
        },
      });

      await expect(
        aiAnalysisService.generatePurchaseRecommendations()
      ).rejects.toThrow("AI response is not valid JSON");
    });
  });

  describe("getQuickInsights", () => {
    it("should get quick insights without full AI analysis", async () => {
      const mockSalesData = [
        {
          medicationId: "med-1",
          totalQuantitySold: 100,
          totalRevenue: 500000,
        },
      ];

      const mockOrderStats = [{ totalOrders: 50 }];

      // Mock all 3 queries (sales, inventory, order stats)
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Sales data
          return {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockResolvedValue(mockSalesData),
          };
        } else if (callCount === 2) {
          // Inventory data
          return {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockResolvedValue([]),
          };
        } else {
          // Order stats
          return {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue(mockOrderStats),
          };
        }
      });

      const result = await aiAnalysisService.getQuickInsights(30);

      expect(result.summary).toBeDefined();
      expect(result.summary.totalRevenue).toBe(500000);
      expect(result.summary.totalOrders).toBe(50);
      expect(result.criticalActions).toBeDefined();
    });

    it("should handle zero orders gracefully", async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockResolvedValue([]),
          };
        } else if (callCount === 2) {
          return {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockResolvedValue([]),
          };
        } else {
          return {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue([{ totalOrders: 0 }]),
          };
        }
      });

      const result = await aiAnalysisService.getQuickInsights();

      expect(result.summary.averageOrderValue).toBe(0);
    });
  });
});
