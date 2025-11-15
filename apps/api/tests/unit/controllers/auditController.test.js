import { beforeEach, describe, expect, it, vi } from "vitest";

import { auditController } from "@/controllers/auditController.js";
import { auditService } from "@/services/auditService.js";

vi.mock("@/services/auditService.js");
vi.mock("@/utils/logger.js", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AuditController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      user: { id: "user-1" },
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe("getAll", () => {
    it("should fetch all audit logs with default pagination", async () => {
      const mockResult = {
        data: [
          { id: "1", action: "CREATE", entity: "user" },
          { id: "2", action: "UPDATE", entity: "user" },
        ],
        pagination: {
          page: 1,
          limit: 50,
          total: 2,
          totalPages: 1,
        },
      };

      auditService.getAll.mockResolvedValue(mockResult);

      await auditController.getAll(req, res);

      expect(auditService.getAll).toHaveBeenCalledWith({
        userId: undefined,
        action: undefined,
        entity: undefined,
        entityId: undefined,
        startDate: undefined,
        endDate: undefined,
        page: 1,
        limit: 50,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Audit logs retrieved successfully",
        data: mockResult.data,
        pagination: mockResult.pagination,
      });
    });

    it("should fetch audit logs with filters", async () => {
      req.query = {
        userId: "user-1",
        action: "CREATE",
        entity: "medication",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        page: "2",
        limit: "25",
      };

      const mockResult = {
        data: [{ id: "1", action: "CREATE", entity: "medication" }],
        pagination: {
          page: 2,
          limit: 25,
          total: 50,
          totalPages: 2,
        },
      };

      auditService.getAll.mockResolvedValue(mockResult);

      await auditController.getAll(req, res);

      expect(auditService.getAll).toHaveBeenCalledWith({
        userId: "user-1",
        action: "CREATE",
        entity: "medication",
        entityId: undefined,
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        page: 2,
        limit: 25,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Audit logs retrieved successfully",
        data: mockResult.data,
        pagination: mockResult.pagination,
      });
    });
  });

  describe("getById", () => {
    it("should fetch audit log by id", async () => {
      const mockLog = {
        id: "log-1",
        action: "CREATE",
        entity: "user",
        userId: "user-1",
      };

      req.params.id = "log-1";
      auditService.getById.mockResolvedValue(mockLog);

      await auditController.getById(req, res);

      expect(auditService.getById).toHaveBeenCalledWith("log-1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Audit log retrieved successfully",
        data: mockLog,
      });
    });

    it("should return 404 if audit log not found", async () => {
      req.params.id = "log-999";
      auditService.getById.mockResolvedValue(null);

      await auditController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Audit log not found",
      });
    });
  });

  describe("getByEntity", () => {
    it("should fetch audit logs by entity", async () => {
      const mockLogs = [
        { id: "1", action: "CREATE", entity: "medication", entityId: "med-1" },
        { id: "2", action: "UPDATE", entity: "medication", entityId: "med-1" },
      ];

      req.params = { entity: "medication", entityId: "med-1" };
      auditService.getByEntity.mockResolvedValue(mockLogs);

      await auditController.getByEntity(req, res);

      expect(auditService.getByEntity).toHaveBeenCalledWith(
        "medication",
        "med-1"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Entity audit logs retrieved successfully",
        data: mockLogs,
      });
    });
  });

  describe("getByUser", () => {
    it("should fetch audit logs by user with default limit", async () => {
      const mockLogs = [
        { id: "1", action: "CREATE", userId: "user-1" },
        { id: "2", action: "UPDATE", userId: "user-1" },
      ];

      req.params.userId = "user-1";
      auditService.getByUser.mockResolvedValue(mockLogs);

      await auditController.getByUser(req, res);

      expect(auditService.getByUser).toHaveBeenCalledWith("user-1", {
        limit: 100,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User audit logs retrieved successfully",
        data: mockLogs,
      });
    });

    it("should fetch audit logs by user with custom limit", async () => {
      const mockLogs = [{ id: "1", action: "CREATE", userId: "user-1" }];

      req.params.userId = "user-1";
      req.query.limit = "50";
      auditService.getByUser.mockResolvedValue(mockLogs);

      await auditController.getByUser(req, res);

      expect(auditService.getByUser).toHaveBeenCalledWith("user-1", {
        limit: 50,
      });
    });
  });

  describe("getStatistics", () => {
    it("should fetch audit statistics without filters", async () => {
      const mockStats = {
        totalLogs: 1000,
        byAction: {
          CREATE: 400,
          UPDATE: 300,
          DELETE: 300,
        },
        byEntity: {
          user: 500,
          medication: 500,
        },
      };

      auditService.getStatistics.mockResolvedValue(mockStats);

      await auditController.getStatistics(req, res);

      expect(auditService.getStatistics).toHaveBeenCalledWith({
        startDate: undefined,
        endDate: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Audit statistics retrieved successfully",
        data: mockStats,
      });
    });

    it("should fetch audit statistics with date filters", async () => {
      req.query = {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      };

      const mockStats = {
        totalLogs: 500,
        byAction: { CREATE: 200 },
      };

      auditService.getStatistics.mockResolvedValue(mockStats);

      await auditController.getStatistics(req, res);

      expect(auditService.getStatistics).toHaveBeenCalledWith({
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      });
    });
  });

  describe("cleanup", () => {
    it("should cleanup old audit logs with default days", async () => {
      auditService.deleteOldLogs.mockResolvedValue(500);

      await auditController.cleanup(req, res);

      expect(auditService.deleteOldLogs).toHaveBeenCalledWith(90);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Successfully deleted 500 old audit logs",
        data: {
          deletedCount: 500,
          daysKept: 90,
        },
      });
    });

    it("should cleanup old audit logs with custom days", async () => {
      req.query.daysToKeep = "30";
      auditService.deleteOldLogs.mockResolvedValue(1000);

      await auditController.cleanup(req, res);

      expect(auditService.deleteOldLogs).toHaveBeenCalledWith(30);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Successfully deleted 1000 old audit logs",
        data: {
          deletedCount: 1000,
          daysKept: 30,
        },
      });
    });
  });
});
