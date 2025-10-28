import { beforeEach, describe, expect, it, vi } from "vitest";

import { auditService } from "@/services/auditService.js";

// Mock dependencies
vi.mock("@/db/index.js");
vi.mock("@/utils/logger.js");

describe("auditService", () => {
  let mockDb;
  let mockLogger;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Import mocked modules
    const { db } = await import("@/db/index.js");
    const logger = await import("@/utils/logger.js");

    mockDb = db;
    mockLogger = logger.default;
  });

  describe("log", () => {
    it("should create an audit log entry successfully", async () => {
      const auditData = {
        userId: "user-123",
        action: "CREATE",
        entity: "medication",
        entityId: "med-456",
        changes: { name: "Test Med" },
      };

      const mockAuditLog = {
        id: "audit-1",
        ...auditData,
        createdAt: new Date(),
      };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockAuditLog]),
        }),
      });

      const result = await auditService.log(auditData);

      expect(result).toEqual(mockAuditLog);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Audit log created"),
        expect.objectContaining({
          userId: auditData.userId,
          entityId: auditData.entityId,
        })
      );
    });

    it("should create audit log with null optional fields", async () => {
      const auditData = {
        action: "LOGIN",
        entity: "user",
      };

      const mockAuditLog = {
        id: "audit-2",
        userId: null,
        action: "LOGIN",
        entity: "user",
        entityId: null,
        changes: null,
        createdAt: new Date(),
      };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockAuditLog]),
        }),
      });

      const result = await auditService.log(auditData);

      expect(result).toEqual(mockAuditLog);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("should handle errors gracefully and return null", async () => {
      const auditData = {
        action: "UPDATE",
        entity: "user",
      };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error("DB Error")),
        }),
      });

      const result = await auditService.log(auditData);

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to create audit log:",
        expect.any(Error)
      );
    });
  });

  describe("getAll", () => {
    it("should get all audit logs with pagination", async () => {
      const mockLogs = [
        { id: "audit-1", action: "CREATE", entity: "user" },
        { id: "audit-2", action: "UPDATE", entity: "medication" },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 2 }]),
        }),
      });

      mockDb.query = {
        auditLogs: {
          findMany: vi.fn().mockResolvedValue(mockLogs),
        },
      };

      const result = await auditService.getAll({ page: 1, limit: 50 });

      expect(result.data).toEqual(mockLogs);
      expect(result.pagination).toEqual({
        total: 2,
        page: 1,
        limit: 50,
        totalPages: 1,
      });
    });

    it("should filter by userId", async () => {
      const mockLogs = [{ id: "audit-1", userId: "user-123" }];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 1 }]),
        }),
      });

      mockDb.query = {
        auditLogs: {
          findMany: vi.fn().mockResolvedValue(mockLogs),
        },
      };

      const result = await auditService.getAll({ userId: "user-123" });

      expect(result.data).toEqual(mockLogs);
      expect(mockDb.query.auditLogs.findMany).toHaveBeenCalled();
    });

    it("should filter by action", async () => {
      const mockLogs = [{ id: "audit-1", action: "CREATE" }];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 1 }]),
        }),
      });

      mockDb.query = {
        auditLogs: {
          findMany: vi.fn().mockResolvedValue(mockLogs),
        },
      };

      await auditService.getAll({ action: "CREATE" });

      expect(mockDb.query.auditLogs.findMany).toHaveBeenCalled();
    });

    it("should filter by entity", async () => {
      const mockLogs = [{ id: "audit-1", entity: "medication" }];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 1 }]),
        }),
      });

      mockDb.query = {
        auditLogs: {
          findMany: vi.fn().mockResolvedValue(mockLogs),
        },
      };

      await auditService.getAll({ entity: "medication" });

      expect(mockDb.query.auditLogs.findMany).toHaveBeenCalled();
    });

    it("should filter by entityId", async () => {
      const mockLogs = [{ id: "audit-1", entityId: "entity-123" }];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 1 }]),
        }),
      });

      mockDb.query = {
        auditLogs: {
          findMany: vi.fn().mockResolvedValue(mockLogs),
        },
      };

      await auditService.getAll({ entityId: "entity-123" });

      expect(mockDb.query.auditLogs.findMany).toHaveBeenCalled();
    });

    it("should filter by date range", async () => {
      const mockLogs = [{ id: "audit-1", createdAt: new Date() }];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 1 }]),
        }),
      });

      mockDb.query = {
        auditLogs: {
          findMany: vi.fn().mockResolvedValue(mockLogs),
        },
      };

      await auditService.getAll({
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      });

      expect(mockDb.query.auditLogs.findMany).toHaveBeenCalled();
    });

    it("should handle pagination with custom page and limit", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 100 }]),
        }),
      });

      mockDb.query = {
        auditLogs: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      const result = await auditService.getAll({ page: 2, limit: 25 });

      expect(result.pagination.totalPages).toBe(4);
      expect(result.pagination.page).toBe(2);
    });
  });

  describe("getById", () => {
    it("should get audit log by ID", async () => {
      const mockLog = {
        id: "audit-1",
        action: "CREATE",
        entity: "user",
        user: { id: "user-1", username: "testuser" },
      };

      mockDb.query = {
        auditLogs: {
          findFirst: vi.fn().mockResolvedValue(mockLog),
        },
      };

      const result = await auditService.getById("audit-1");

      expect(result).toEqual(mockLog);
      expect(mockDb.query.auditLogs.findFirst).toHaveBeenCalled();
    });

    it("should return null if audit log not found", async () => {
      mockDb.query = {
        auditLogs: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      };

      const result = await auditService.getById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("getByEntity", () => {
    it("should get audit logs for a specific entity", async () => {
      const mockLogs = [
        { id: "audit-1", entity: "medication", entityId: "med-123" },
        { id: "audit-2", entity: "medication", entityId: "med-123" },
      ];

      mockDb.query = {
        auditLogs: {
          findMany: vi.fn().mockResolvedValue(mockLogs),
        },
      };

      const result = await auditService.getByEntity("medication", "med-123");

      expect(result).toEqual(mockLogs);
      expect(mockDb.query.auditLogs.findMany).toHaveBeenCalled();
    });

    it("should return empty array if no logs found", async () => {
      mockDb.query = {
        auditLogs: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      const result = await auditService.getByEntity("user", "user-999");

      expect(result).toEqual([]);
    });
  });

  describe("getByUser", () => {
    it("should get audit logs for a specific user", async () => {
      const mockLogs = [
        { id: "audit-1", userId: "user-123", action: "CREATE" },
        { id: "audit-2", userId: "user-123", action: "UPDATE" },
      ];

      mockDb.query = {
        auditLogs: {
          findMany: vi.fn().mockResolvedValue(mockLogs),
        },
      };

      const result = await auditService.getByUser("user-123");

      expect(result).toEqual(mockLogs);
      expect(mockDb.query.auditLogs.findMany).toHaveBeenCalled();
    });

    it("should respect custom limit option", async () => {
      mockDb.query = {
        auditLogs: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      await auditService.getByUser("user-123", { limit: 50 });

      expect(mockDb.query.auditLogs.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 50 })
      );
    });

    it("should use default limit of 100", async () => {
      mockDb.query = {
        auditLogs: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      await auditService.getByUser("user-123");

      expect(mockDb.query.auditLogs.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 })
      );
    });
  });

  describe("getStatistics", () => {
    it("should get audit statistics", async () => {
      const mockActionStats = [
        { action: "CREATE", count: 10 },
        { action: "UPDATE", count: 5 },
      ];

      const mockEntityStats = [
        { entity: "user", count: 8 },
        { entity: "medication", count: 7 },
      ];

      mockDb.select.mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue(mockActionStats),
          }),
          groupBy: vi.fn().mockResolvedValue(mockEntityStats),
        }),
      }));

      // Mock for action stats
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue(mockActionStats),
          }),
        }),
      });

      // Mock for entity stats
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue(mockEntityStats),
          }),
        }),
      });

      // Mock for total count
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ total: 15 }]),
        }),
      });

      const result = await auditService.getStatistics();

      expect(result.total).toBe(15);
      expect(result.byAction).toEqual(mockActionStats);
      expect(result.byEntity).toEqual(mockEntityStats);
    });

    it("should filter statistics by date range", async () => {
      mockDb.select.mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      }));

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ total: 0 }]),
        }),
      });

      await auditService.getStatistics({
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      });

      expect(mockDb.select).toHaveBeenCalled();
    });
  });

  describe("deleteOldLogs", () => {
    it("should delete old audit logs", async () => {
      const mockDeletedLogs = [
        { id: "audit-1" },
        { id: "audit-2" },
        { id: "audit-3" },
      ];

      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue(mockDeletedLogs),
        }),
      });

      const result = await auditService.deleteOldLogs(90);

      expect(result).toBe(3);
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Deleted 3 audit logs")
      );
    });

    it("should use default of 90 days if not specified", async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });

      await auditService.deleteOldLogs();

      expect(mockDb.delete).toHaveBeenCalled();
    });

    it("should handle custom retention period", async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });

      await auditService.deleteOldLogs(30);

      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("30 days")
      );
    });
  });
});
