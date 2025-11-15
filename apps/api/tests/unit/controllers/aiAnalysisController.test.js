import { beforeEach, describe, expect, it, vi } from "vitest";

import * as aiAnalysisController from "../../../src/controllers/aiAnalysisController.js";
import { aiAnalysisService } from "../../../src/services/aiAnalysisService.js";
import logger from "../../../src/utils/logger.js";

vi.mock("../../../src/services/aiAnalysisService.js");
vi.mock("../../../src/utils/logger.js");

describe("aiAnalysisController", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe("getPurchaseRecommendations", () => {
    it("should return purchase recommendations with default daysBack", async () => {
      const mockRecommendations = {
        success: true,
        data: {
          priorityRecommendations: [
            { medicationId: "1", name: "Aspirin", recommendedQuantity: 100 },
            {
              medicationId: "2",
              name: "Paracetamol",
              recommendedQuantity: 200,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      };

      aiAnalysisService.generatePurchaseRecommendations.mockResolvedValue(
        mockRecommendations
      );

      await aiAnalysisController.getPurchaseRecommendations(req, res, next);

      expect(
        aiAnalysisService.generatePurchaseRecommendations
      ).toHaveBeenCalledWith(90);
      expect(logger.info).toHaveBeenCalledWith(
        "[AI Analysis] Generating purchase recommendations for 90 days"
      );
      expect(logger.info).toHaveBeenCalledWith(
        "[AI Analysis] Successfully generated recommendations: 2 items"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRecommendations);
    });

    it("should use custom daysBack from query", async () => {
      req.query.daysBack = "30";

      const mockRecommendations = {
        success: true,
        data: {
          priorityRecommendations: [
            { medicationId: "1", name: "Aspirin", recommendedQuantity: 50 },
          ],
        },
      };

      aiAnalysisService.generatePurchaseRecommendations.mockResolvedValue(
        mockRecommendations
      );

      await aiAnalysisController.getPurchaseRecommendations(req, res, next);

      expect(
        aiAnalysisService.generatePurchaseRecommendations
      ).toHaveBeenCalledWith(30);
      expect(logger.info).toHaveBeenCalledWith(
        "[AI Analysis] Generating purchase recommendations for 30 days"
      );
    });

    it("should handle empty recommendations", async () => {
      const mockRecommendations = {
        success: true,
        data: {
          priorityRecommendations: [],
        },
      };

      aiAnalysisService.generatePurchaseRecommendations.mockResolvedValue(
        mockRecommendations
      );

      await aiAnalysisController.getPurchaseRecommendations(req, res, next);

      expect(logger.info).toHaveBeenCalledWith(
        "[AI Analysis] Successfully generated recommendations: 0 items"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRecommendations);
    });

    it("should handle missing priorityRecommendations property", async () => {
      const mockRecommendations = {
        success: true,
        data: {},
      };

      aiAnalysisService.generatePurchaseRecommendations.mockResolvedValue(
        mockRecommendations
      );

      await aiAnalysisController.getPurchaseRecommendations(req, res, next);

      expect(logger.info).toHaveBeenCalledWith(
        "[AI Analysis] Successfully generated recommendations: 0 items"
      );
      expect(res.json).toHaveBeenCalledWith(mockRecommendations);
    });

    it("should handle errors", async () => {
      const error = new Error("AI service unavailable");
      aiAnalysisService.generatePurchaseRecommendations.mockRejectedValue(
        error
      );

      await aiAnalysisController.getPurchaseRecommendations(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(
        "[AI Analysis] Error generating recommendations:",
        error
      );
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getQuickInsights", () => {
    it("should return quick insights with default daysBack", async () => {
      const mockInsights = {
        totalSales: 50000,
        totalOrders: 120,
        lowStockItems: 5,
        topSellingMedications: [
          { name: "Aspirin", quantity: 1000 },
          { name: "Paracetamol", quantity: 850 },
        ],
      };

      aiAnalysisService.getQuickInsights.mockResolvedValue(mockInsights);

      await aiAnalysisController.getQuickInsights(req, res, next);

      expect(aiAnalysisService.getQuickInsights).toHaveBeenCalledWith(30);
      expect(logger.info).toHaveBeenCalledWith(
        "[AI Analysis] Fetching quick insights for 30 days"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockInsights,
      });
    });

    it("should use custom daysBack from query", async () => {
      req.query.daysBack = "60";

      const mockInsights = {
        totalSales: 100000,
        totalOrders: 250,
      };

      aiAnalysisService.getQuickInsights.mockResolvedValue(mockInsights);

      await aiAnalysisController.getQuickInsights(req, res, next);

      expect(aiAnalysisService.getQuickInsights).toHaveBeenCalledWith(60);
      expect(logger.info).toHaveBeenCalledWith(
        "[AI Analysis] Fetching quick insights for 60 days"
      );
    });

    it("should handle errors", async () => {
      const error = new Error("Database connection failed");
      aiAnalysisService.getQuickInsights.mockRejectedValue(error);

      await aiAnalysisController.getQuickInsights(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(
        "[AI Analysis] Error fetching insights:",
        error
      );
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getSalesInventoryData", () => {
    it("should return sales and inventory data with default daysBack", async () => {
      const mockData = {
        salesData: [
          { date: "2024-01-01", total: 5000 },
          { date: "2024-01-02", total: 6000 },
        ],
        inventoryData: [
          { medicationId: "1", currentStock: 500, minimumStock: 100 },
          { medicationId: "2", currentStock: 300, minimumStock: 50 },
        ],
      };

      aiAnalysisService.getSalesAndInventoryData.mockResolvedValue(mockData);

      await aiAnalysisController.getSalesInventoryData(req, res, next);

      expect(aiAnalysisService.getSalesAndInventoryData).toHaveBeenCalledWith(
        90
      );
      expect(logger.info).toHaveBeenCalledWith(
        "[AI Analysis] Fetching sales and inventory data for 90 days"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });

    it("should use custom daysBack from query", async () => {
      req.query.daysBack = "180";

      const mockData = {
        salesData: [],
        inventoryData: [],
      };

      aiAnalysisService.getSalesAndInventoryData.mockResolvedValue(mockData);

      await aiAnalysisController.getSalesInventoryData(req, res, next);

      expect(aiAnalysisService.getSalesAndInventoryData).toHaveBeenCalledWith(
        180
      );
      expect(logger.info).toHaveBeenCalledWith(
        "[AI Analysis] Fetching sales and inventory data for 180 days"
      );
    });

    it("should handle errors", async () => {
      const error = new Error("Data fetch failed");
      aiAnalysisService.getSalesAndInventoryData.mockRejectedValue(error);

      await aiAnalysisController.getSalesInventoryData(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(
        "[AI Analysis] Error fetching data:",
        error
      );
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
