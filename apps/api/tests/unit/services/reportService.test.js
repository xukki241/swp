import { describe, it, expect, vi, beforeEach } from "vitest";

import { db } from "@/db/index.js";
import { reportService } from "@/services/reportService.js";

// Mock the database
vi.mock("@/db/index.js", () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  },
}));

describe("ReportService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a sales_summary report", async () => {
      const mockReportData = {
        type: "sales_summary",
        parameters: {
          startDate: "2025-01-01T00:00:00.000Z",
          endDate: "2025-01-31T23:59:59.999Z",
        },
      };

      const mockGeneratedData = {
        period: {
          startDate: "2025-01-01T00:00:00.000Z",
          endDate: "2025-01-31T23:59:59.999Z",
        },
        summary: {
          totalOrders: 50,
          totalRevenue: 15000000,
        },
        salesByStatus: [],
        topSellingMedications: [],
        salesByPaymentMethod: [],
      };

      const mockInsertedReport = {
        id: 1,
        type: "sales_summary",
        reportDate: new Date(),
        data: mockGeneratedData,
        parameters: mockReportData.parameters,
      };

      // Mock the generateSalesSummary method
      vi.spyOn(reportService, "generateSalesSummary").mockResolvedValue(
        mockGeneratedData
      );

      // Mock the database insert
      const mockReturning = vi.fn().mockResolvedValue([mockInsertedReport]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      db.insert.mockReturnValue({ values: mockValues });

      const result = await reportService.create(mockReportData);

      expect(result).toEqual(mockInsertedReport);
      expect(reportService.generateSalesSummary).toHaveBeenCalledWith(
        mockReportData.parameters
      );
      expect(db.insert).toHaveBeenCalled();
    });

    it("should create a daily_sales report", async () => {
      const mockReportData = {
        type: "daily_sales",
        parameters: { date: "2025-01-15T00:00:00.000Z" },
      };

      const mockGeneratedData = {
        period: {
          startDate: "2025-01-15T00:00:00.000Z",
          endDate: "2025-01-15T23:59:59.999Z",
        },
        summary: {
          totalOrders: 10,
          totalRevenue: 3000000,
        },
      };

      vi.spyOn(reportService, "generateDailySales").mockResolvedValue(
        mockGeneratedData
      );

      const mockInsertedReport = {
        id: 2,
        type: "daily_sales",
        reportDate: new Date(),
        data: mockGeneratedData,
        parameters: mockReportData.parameters,
      };

      const mockReturning = vi.fn().mockResolvedValue([mockInsertedReport]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      db.insert.mockReturnValue({ values: mockValues });

      const result = await reportService.create(mockReportData);

      expect(result).toEqual(mockInsertedReport);
      expect(reportService.generateDailySales).toHaveBeenCalledWith(
        mockReportData.parameters
      );
    });

    it("should throw error for unsupported report type", async () => {
      const mockReportData = {
        type: "invalid_type",
        parameters: {},
      };

      await expect(reportService.create(mockReportData)).rejects.toThrow(
        "Unsupported report type: invalid_type"
      );
    });
  });

  describe("getAll", () => {
    it("should fetch all reports without filters", async () => {
      const mockReports = [
        {
          id: 1,
          type: "daily_sales",
          reportDate: new Date(),
          data: {},
          parameters: {},
        },
        {
          id: 2,
          type: "weekly_sales",
          reportDate: new Date(),
          data: {},
          parameters: {},
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockReports),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await reportService.getAll();

      expect(result).toEqual(mockReports);
      expect(mockQuery.limit).toHaveBeenCalledWith(50);
      expect(mockQuery.offset).toHaveBeenCalledWith(0);
    });

    it("should filter reports by type", async () => {
      const mockReports = [
        {
          id: 1,
          type: "daily_sales",
          reportDate: new Date(),
          data: {},
          parameters: {},
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockReports),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await reportService.getAll({ type: "daily_sales" });

      expect(result).toEqual(mockReports);
      expect(mockQuery.where).toHaveBeenCalled();
    });

    it("should apply pagination", async () => {
      const mockReports = [];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockReports),
      };
      db.select.mockReturnValue(mockQuery);

      await reportService.getAll({ limit: 20, offset: 40 });

      expect(mockQuery.limit).toHaveBeenCalledWith(20);
      expect(mockQuery.offset).toHaveBeenCalledWith(40);
    });
  });

  describe("getById", () => {
    it("should fetch a report by ID", async () => {
      const mockReport = {
        id: 1,
        type: "monthly_sales",
        reportDate: new Date(),
        data: { summary: {} },
        parameters: { year: 2025, month: 0 },
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockReport]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await reportService.getById(1);

      expect(result).toEqual(mockReport);
      expect(mockQuery.where).toHaveBeenCalled();
    });

    it("should throw error if report not found", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

      await expect(reportService.getById(999)).rejects.toThrow(
        "Report not found"
      );
    });
  });

  describe("delete", () => {
    it("should delete a report by ID", async () => {
      const mockDeletedReport = {
        id: 1,
        type: "daily_sales",
        reportDate: new Date(),
        data: {},
        parameters: {},
      };

      const mockReturning = vi.fn().mockResolvedValue([mockDeletedReport]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      db.delete.mockReturnValue({ where: mockWhere });

      const result = await reportService.delete(1);

      expect(result).toEqual(mockDeletedReport);
      expect(db.delete).toHaveBeenCalled();
    });

    it("should throw error if report to delete not found", async () => {
      const mockReturning = vi.fn().mockResolvedValue([]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      db.delete.mockReturnValue({ where: mockWhere });

      await expect(reportService.delete(999)).rejects.toThrow(
        "Report not found"
      );
    });
  });

  describe("generateSalesSummary", () => {
    it("should generate sales summary with date range", async () => {
      const mockParameters = {
        startDate: "2025-01-01T00:00:00.000Z",
        endDate: "2025-01-31T23:59:59.999Z",
      };

      // Mock database queries
      const mockSummaryQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi
          .fn()
          .mockResolvedValue([{ totalOrders: 100, totalRevenue: 50000000 }]),
      };

      const mockStatusQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockResolvedValue([
          { status: "paid", count: 80, totalAmount: 40000000 },
          { status: "pending", count: 20, totalAmount: 10000000 },
        ]),
      };

      const mockTopSellingQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            medicationId: 1,
            medicationName: "Paracetamol",
            variantName: "500mg",
            totalQuantity: 500,
            totalRevenue: 5000000,
          },
        ]),
      };

      const mockPaymentMethodQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockResolvedValue([
          { paymentMethod: "cash", count: 60, totalAmount: 30000000 },
          {
            paymentMethod: "bank_transfer",
            count: 40,
            totalAmount: 20000000,
          },
        ]),
      };

      db.select
        .mockReturnValueOnce(mockSummaryQuery)
        .mockReturnValueOnce(mockStatusQuery)
        .mockReturnValueOnce(mockTopSellingQuery)
        .mockReturnValueOnce(mockPaymentMethodQuery);

      const result = await reportService.generateSalesSummary(mockParameters);

      expect(result).toHaveProperty("period");
      expect(result).toHaveProperty("summary");
      expect(result).toHaveProperty("salesByStatus");
      expect(result).toHaveProperty("topSellingMedications");
      expect(result).toHaveProperty("salesByPaymentMethod");
      expect(result.summary.totalOrders).toBe(100);
      expect(result.summary.totalRevenue).toBe(50000000);
    });

    it("should use default date range if not provided", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      db.select.mockReturnValue(mockQuery);

      const result = await reportService.generateSalesSummary({});

      expect(result).toHaveProperty("period");
      expect(result.period.startDate).toBeDefined();
      expect(result.period.endDate).toBeDefined();
    });
  });

  describe("generateLowStock", () => {
    it("should generate low stock report with default threshold", async () => {
      const mockStockLevels = [
        {
          variantId: 1,
          medicationName: "Paracetamol",
          variantName: "500mg",
          sku: "PARA-500",
          totalQuantity: 50,
          totalReserved: 5,
          availableQuantity: 45,
          minStockLevel: 100,
        },
        {
          variantId: 2,
          medicationName: "Ibuprofen",
          variantName: "200mg",
          sku: "IBU-200",
          totalQuantity: 5,
          totalReserved: 0,
          availableQuantity: 5,
          minStockLevel: 20,
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockStockLevels),
      };

      db.select.mockReturnValue(mockQuery);

      const result = await reportService.generateLowStock({ threshold: 10 });

      expect(result).toHaveProperty("summary");
      expect(result).toHaveProperty("lowStockItems");
      expect(result).toHaveProperty("criticalStockItems");
      expect(result.threshold).toBe(10);
    });
  });

  describe("generateExpiryDates", () => {
    it("should generate expiry dates report with custom days ahead", async () => {
      const mockExpiringItems = [
        {
          inventoryId: 1,
          medicationName: "Paracetamol",
          variantName: "500mg",
          sku: "PARA-500",
          quantity: 100,
          reservedQuantity: 10,
          availableQuantity: 90,
          batchNumber: "BATCH001",
          expiryDate: new Date("2025-02-15"),
          daysUntilExpiry: 5,
          binId: 1,
        },
        {
          inventoryId: 2,
          medicationName: "Ibuprofen",
          variantName: "200mg",
          sku: "IBU-200",
          quantity: 50,
          reservedQuantity: 0,
          availableQuantity: 50,
          batchNumber: "BATCH002",
          expiryDate: new Date("2025-03-01"),
          daysUntilExpiry: 20,
          binId: 2,
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockExpiringItems),
      };

      db.select.mockReturnValue(mockQuery);

      const result = await reportService.generateExpiryDates({
        daysAhead: 60,
      });

      expect(result).toHaveProperty("summary");
      expect(result).toHaveProperty("expired");
      expect(result).toHaveProperty("expiringWithin7Days");
      expect(result).toHaveProperty("expiringWithin30Days");
      expect(result).toHaveProperty("expiringWithin90Days");
      expect(result.daysAhead).toBe(60);
    });
  });

  describe("generateWeeklySales", () => {
    it("should generate weekly sales report with daily breakdown", async () => {
      const mockWeeklySummary = {
        period: {
          startDate: "2025-01-06T00:00:00.000Z",
          endDate: "2025-01-12T23:59:59.999Z",
        },
        summary: {
          totalOrders: 70,
          totalRevenue: 21000000,
        },
        salesByStatus: [],
        topSellingMedications: [],
        salesByPaymentMethod: [],
      };

      vi.spyOn(reportService, "generateSalesSummary").mockResolvedValue(
        mockWeeklySummary
      );

      const mockDayQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi
          .fn()
          .mockResolvedValue([{ totalOrders: 10, totalRevenue: 3000000 }]),
      };

      db.select.mockReturnValue(mockDayQuery);

      const result = await reportService.generateWeeklySales({
        weekStart: "2025-01-06T00:00:00.000Z",
      });

      expect(result).toHaveProperty("weekRange");
      expect(result).toHaveProperty("dailyBreakdown");
      expect(result.dailyBreakdown).toHaveLength(7);
    });
  });

  describe("generateMonthly Sales", () => {
    it("should generate monthly sales report with weekly breakdown", async () => {
      const mockMonthlySummary = {
        period: {
          startDate: "2025-01-01T00:00:00.000Z",
          endDate: "2025-01-31T23:59:59.999Z",
        },
        summary: {
          totalOrders: 300,
          totalRevenue: 90000000,
        },
        salesByStatus: [],
        topSellingMedications: [],
        salesByPaymentMethod: [],
      };

      vi.spyOn(reportService, "generateSalesSummary").mockResolvedValue(
        mockMonthlySummary
      );

      const mockWeekQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi
          .fn()
          .mockResolvedValue([{ totalOrders: 70, totalRevenue: 21000000 }]),
      };

      db.select.mockReturnValue(mockWeekQuery);

      const result = await reportService.generateMonthlySales({
        year: 2025,
        month: 1,
      });

      expect(result).toHaveProperty("monthInfo");
      expect(result).toHaveProperty("weeklyBreakdown");
      expect(result.monthInfo.year).toBe(2025);
      expect(result.monthInfo.month).toBe(1);
    });
  });
});
