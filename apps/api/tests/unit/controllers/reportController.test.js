import { beforeEach, describe, expect, it, vi } from "vitest";

import { reportController } from "@/controllers/reportController.js";
import { reportService } from "@/services/reportService.js";

vi.mock("@/services/reportService.js");

describe("ReportController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a report with valid type", async () => {
      req.body = {
        type: "sales_summary",
        parameters: { startDate: "2025-01-01", endDate: "2025-12-31" },
      };

      const mockReport = {
        id: "report-1",
        type: "sales_summary",
        generatedAt: new Date(),
      };

      reportService.create.mockResolvedValue(mockReport);

      await reportController.create(req, res);

      expect(reportService.create).toHaveBeenCalledWith({
        type: "sales_summary",
        parameters: { startDate: "2025-01-01", endDate: "2025-12-31" },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Report generated successfully",
        data: mockReport,
      });
    });

    it("should return 400 for invalid report type", async () => {
      req.body = {
        type: "invalid_type",
        parameters: {},
      };

      await reportController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining("Invalid report type"),
      });
      expect(reportService.create).not.toHaveBeenCalled();
    });

    it("should accept all valid report types", async () => {
      const validTypes = [
        "sales_summary",
        "inventory_on_hand",
        "expiry_dates",
        "low_stock",
        "daily_sales",
        "weekly_sales",
        "monthly_sales",
      ];

      for (const type of validTypes) {
        vi.clearAllMocks();
        req.body = { type, parameters: {} };
        reportService.create.mockResolvedValue({ id: "1", type });

        await reportController.create(req, res);

        expect(reportService.create).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
      }
    });
  });

  describe("getAll", () => {
    it("should fetch all reports without filters", async () => {
      const mockReports = [
        { id: "1", type: "daily_sales" },
        { id: "2", type: "monthly_sales" },
      ];

      reportService.getAll.mockResolvedValue(mockReports);

      await reportController.getAll(req, res);

      expect(reportService.getAll).toHaveBeenCalledWith({
        type: undefined,
        startDate: undefined,
        endDate: undefined,
        limit: undefined,
        offset: undefined,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Reports retrieved successfully",
        data: mockReports,
        count: 2,
      });
    });

    it("should fetch reports with filters", async () => {
      req.query = {
        type: "daily_sales",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        limit: "10",
        offset: "0",
      };

      const mockReports = [{ id: "1", type: "daily_sales" }];
      reportService.getAll.mockResolvedValue(mockReports);

      await reportController.getAll(req, res);

      expect(reportService.getAll).toHaveBeenCalledWith({
        type: "daily_sales",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        limit: 10,
        offset: 0,
      });
    });
  });

  describe("getById", () => {
    it("should fetch report by id", async () => {
      const mockReport = {
        id: "report-1",
        type: "sales_summary",
        data: { total: 1000 },
      };

      req.params.id = "report-1";
      reportService.getById.mockResolvedValue(mockReport);

      await reportController.getById(req, res);

      expect(reportService.getById).toHaveBeenCalledWith("report-1");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Report retrieved successfully",
        data: mockReport,
      });
    });

    it("should return 404 if report not found", async () => {
      req.params.id = "report-999";
      const error = new Error("Report not found");
      reportService.getById.mockRejectedValue(error);

      await reportController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Report not found",
      });
    });
  });

  describe("delete", () => {
    it("should delete report successfully", async () => {
      req.params.id = "report-1";
      reportService.delete.mockResolvedValue();

      await reportController.delete(req, res);

      expect(reportService.delete).toHaveBeenCalledWith("report-1");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Report deleted successfully",
      });
    });

    it("should return 404 if report not found", async () => {
      req.params.id = "report-999";
      const error = new Error("Report not found");
      reportService.delete.mockRejectedValue(error);

      await reportController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Report not found",
      });
    });
  });

  describe("generateDaily", () => {
    it("should generate daily sales report", async () => {
      req.query.date = "2025-11-13";

      const mockReport = {
        id: "report-1",
        type: "daily_sales",
        data: { total: 500 },
      };

      reportService.create.mockResolvedValue(mockReport);

      await reportController.generateDaily(req, res);

      expect(reportService.create).toHaveBeenCalledWith({
        type: "daily_sales",
        parameters: { date: "2025-11-13" },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Daily sales report generated successfully",
        data: mockReport,
      });
    });
  });

  describe("generateWeekly", () => {
    it("should generate weekly sales report", async () => {
      req.query.weekStart = "2025-11-10";

      const mockReport = {
        id: "report-1",
        type: "weekly_sales",
        data: { total: 3500 },
      };

      reportService.create.mockResolvedValue(mockReport);

      await reportController.generateWeekly(req, res);

      expect(reportService.create).toHaveBeenCalledWith({
        type: "weekly_sales",
        parameters: { weekStart: "2025-11-10" },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Weekly sales report generated successfully",
        data: mockReport,
      });
    });
  });

  describe("generateMonthly", () => {
    it("should generate monthly sales report with year and month", async () => {
      req.query = { year: "2025", month: "11" };

      const mockReport = {
        id: "report-1",
        type: "monthly_sales",
        data: { total: 15000 },
      };

      reportService.create.mockResolvedValue(mockReport);

      await reportController.generateMonthly(req, res);

      expect(reportService.create).toHaveBeenCalledWith({
        type: "monthly_sales",
        parameters: {
          year: 2025,
          month: 10, // November is month 10 (0-indexed)
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Monthly sales report generated successfully",
        data: mockReport,
      });
    });

    it("should generate monthly sales report without parameters", async () => {
      const mockReport = {
        id: "report-1",
        type: "monthly_sales",
        data: { total: 15000 },
      };

      reportService.create.mockResolvedValue(mockReport);

      await reportController.generateMonthly(req, res);

      expect(reportService.create).toHaveBeenCalledWith({
        type: "monthly_sales",
        parameters: {
          year: undefined,
          month: undefined,
        },
      });
    });
  });
});
