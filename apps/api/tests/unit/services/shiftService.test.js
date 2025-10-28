import { beforeEach, describe, expect, it, vi } from "vitest";

import * as shiftService from "@/services/shiftService.js";

vi.mock("@/db/index.js");
vi.mock("@/utils/logger.js");

describe("shiftService", () => {
  let mockDb;

  beforeEach(async () => {
    vi.clearAllMocks();

    const { db } = await import("@/db/index.js");
    mockDb = db;
  });

  describe("getAllShifts", () => {
    it("should get all shifts", async () => {
      const mockShifts = [
        { id: "shift-1", name: "Morning", startTime: "08:00" },
        { id: "shift-2", name: "Evening", startTime: "16:00" },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockShifts),
        }),
      });

      const result = await shiftService.getAllShifts();

      expect(result).toEqual(mockShifts);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockRejectedValue(new Error("DB Error")),
        }),
      });

      await expect(shiftService.getAllShifts()).rejects.toThrow(
        "Failed to fetch shifts"
      );
    });
  });

  describe("getShiftById", () => {
    it("should get shift by ID", async () => {
      const mockShift = { id: "shift-1", name: "Morning" };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockShift]),
          }),
        }),
      });

      const result = await shiftService.getShiftById("shift-1");

      expect(result).toEqual(mockShift);
    });

    it("should return null if shift not found", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await shiftService.getShiftById("nonexistent");

      expect(result).toBeNull();
    });

    it("should handle errors", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error("DB Error")),
          }),
        }),
      });

      await expect(shiftService.getShiftById("shift-1")).rejects.toThrow(
        "Failed to fetch shift"
      );
    });
  });

  describe("createShift", () => {
    it("should create a new shift", async () => {
      const shiftData = {
        name: "Morning",
        shiftType: "regular",
        startTime: "08:00",
        endTime: "16:00",
      };

      const mockShift = { id: "shift-1", ...shiftData };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockShift]),
        }),
      });

      const result = await shiftService.createShift(shiftData);

      expect(result).toEqual(mockShift);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error("DB Error")),
        }),
      });

      await expect(shiftService.createShift({})).rejects.toThrow(
        "Failed to create shift"
      );
    });
  });

  describe("updateShift", () => {
    it("should update a shift", async () => {
      const updateData = { name: "Updated Morning" };
      const mockShift = { id: "shift-1", ...updateData };

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockShift]),
          }),
        }),
      });

      const result = await shiftService.updateShift("shift-1", updateData);

      expect(result).toEqual(mockShift);
    });

    it("should return null if shift not found", async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await shiftService.updateShift("nonexistent", {});

      expect(result).toBeNull();
    });

    it("should handle errors", async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockRejectedValue(new Error("DB Error")),
          }),
        }),
      });

      await expect(shiftService.updateShift("shift-1", {})).rejects.toThrow(
        "Failed to update shift"
      );
    });
  });

  describe("deleteShift", () => {
    it("should delete a shift without assignments", async () => {
      const mockShift = { id: "shift-1", name: "Morning" };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockShift]),
        }),
      });

      const result = await shiftService.deleteShift("shift-1");

      expect(result).toEqual(mockShift);
    });

    it("should throw error if shift has assignments", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "assign-1" }]),
          }),
        }),
      });

      await expect(shiftService.deleteShift("shift-1")).rejects.toThrow(
        "Cannot delete shift that has assignments"
      );
    });

    it("should handle errors", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error("DB Error")),
          }),
        }),
      });

      await expect(shiftService.deleteShift("shift-1")).rejects.toThrow(
        "Failed to delete shift"
      );
    });
  });

  describe("getAllShiftAssignments", () => {
    it("should get all assignments without filters", async () => {
      const mockAssignments = [
        { assignment: { id: "assign-1" }, user: {}, shift: {} },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockResolvedValue(mockAssignments),
        }),
      });

      const result = await shiftService.getAllShiftAssignments({});

      expect(result).toEqual(mockAssignments);
    });

    it("should filter by userId", async () => {
      const mockResult = [];
      const mockQuery = {
        where: vi.fn().mockResolvedValue(mockResult),
      };
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnValue(mockQuery),
      };
      mockDb.select.mockReturnValue(mockChain);

      await shiftService.getAllShiftAssignments({ userId: "user-1" });

      expect(mockDb.select).toHaveBeenCalled();
    });

    it("should filter by shiftId", async () => {
      const mockResult = [];
      const mockQuery = {
        where: vi.fn().mockResolvedValue(mockResult),
      };
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnValue(mockQuery),
      };
      mockDb.select.mockReturnValue(mockChain);

      await shiftService.getAllShiftAssignments({ shiftId: "shift-1" });

      expect(mockDb.select).toHaveBeenCalled();
    });

    it("should filter by date range", async () => {
      const mockResult = [];
      const mockQuery = {
        where: vi.fn().mockResolvedValue(mockResult),
      };
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnValue(mockQuery),
      };
      mockDb.select.mockReturnValue(mockChain);

      await shiftService.getAllShiftAssignments({
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      });

      expect(mockDb.select).toHaveBeenCalled();
    });

    it("should filter by status", async () => {
      const mockResult = [];
      const mockQuery = {
        where: vi.fn().mockResolvedValue(mockResult),
      };
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnValue(mockQuery),
      };
      mockDb.select.mockReturnValue(mockChain);

      await shiftService.getAllShiftAssignments({ status: "scheduled" });

      expect(mockDb.select).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockRejectedValue(new Error("DB Error")),
        }),
      });

      await expect(shiftService.getAllShiftAssignments({})).rejects.toThrow(
        "Failed to fetch shift assignments"
      );
    });
  });

  describe("getShiftAssignmentById", () => {
    it("should get assignment by ID", async () => {
      const mockAssignment = {
        assignment: { id: "assign-1" },
        user: {},
        shift: {},
      };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([mockAssignment]),
        }),
      });

      const result = await shiftService.getShiftAssignmentById("assign-1");

      expect(result).toEqual(mockAssignment);
    });

    it("should return null if not found", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await shiftService.getShiftAssignmentById("nonexistent");

      expect(result).toBeNull();
    });

    it("should handle errors", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockRejectedValue(new Error("DB Error")),
        }),
      });

      await expect(
        shiftService.getShiftAssignmentById("assign-1")
      ).rejects.toThrow("Failed to fetch shift assignment");
    });
  });

  describe("createShiftAssignment", () => {
    it("should create a shift assignment", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const assignmentData = {
        userId: "user-1",
        shiftId: "shift-1",
        assignedDate: futureDate.toISOString(),
      };

      const mockAssignment = { id: "assign-1", ...assignmentData };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockAssignment]),
        }),
      });

      const result = await shiftService.createShiftAssignment(assignmentData);

      expect(result).toBeDefined();
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("should throw error for past dates", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const assignmentData = {
        userId: "user-1",
        shiftId: "shift-1",
        assignedDate: pastDate.toISOString(),
      };

      await expect(
        shiftService.createShiftAssignment(assignmentData)
      ).rejects.toThrow("Cannot assign shifts for past dates");
    });

    it("should throw error if user already has assignment on date", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const assignmentData = {
        userId: "user-1",
        shiftId: "shift-1",
        assignedDate: futureDate.toISOString(),
      };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "existing" }]),
          }),
        }),
      });

      await expect(
        shiftService.createShiftAssignment(assignmentData)
      ).rejects.toThrow("User already has a shift assignment on this date");
    });

    it("should handle errors", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error("DB Error")),
        }),
      });

      await expect(
        shiftService.createShiftAssignment({
          userId: "user-1",
          shiftId: "shift-1",
          assignedDate: futureDate.toISOString(),
        })
      ).rejects.toThrow("Failed to create shift assignment");
    });
  });

  describe("createBatchShiftAssignments", () => {
    it("should create multiple assignments", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const assignments = [
        {
          userId: "user-1",
          shiftId: "shift-1",
          assignedDate: futureDate.toISOString(),
        },
        {
          userId: "user-2",
          shiftId: "shift-2",
          assignedDate: futureDate.toISOString(),
        },
      ];

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue(assignments),
        }),
      });

      const result =
        await shiftService.createBatchShiftAssignments(assignments);

      expect(result).toHaveLength(2);
    });

    it("should throw error if any date is in the past", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const assignments = [
        {
          userId: "user-1",
          shiftId: "shift-1",
          assignedDate: pastDate.toISOString(),
        },
      ];

      await expect(
        shiftService.createBatchShiftAssignments(assignments)
      ).rejects.toThrow("Cannot assign shifts for past dates");
    });

    it("should handle duplicate constraint error", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const assignments = [
        {
          userId: "user-1",
          shiftId: "shift-1",
          assignedDate: futureDate.toISOString(),
        },
      ];

      const error = new Error("Duplicate");
      error.code = "23505";

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(error),
        }),
      });

      await expect(
        shiftService.createBatchShiftAssignments(assignments)
      ).rejects.toThrow(
        "One or more users already have shift assignments on the specified dates"
      );
    });

    it("should handle other errors", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error("DB Error")),
        }),
      });

      await expect(
        shiftService.createBatchShiftAssignments([
          {
            userId: "user-1",
            shiftId: "shift-1",
            assignedDate: futureDate.toISOString(),
          },
        ])
      ).rejects.toThrow("Failed to create shift assignments");
    });
  });

  describe("updateShiftAssignment", () => {
    it("should update an assignment", async () => {
      const updateData = { notes: "Updated" };
      const mockAssignment = { id: "assign-1", ...updateData };

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockAssignment]),
          }),
        }),
      });

      const result = await shiftService.updateShiftAssignment(
        "assign-1",
        updateData
      );

      expect(result).toEqual(mockAssignment);
    });

    it("should return null if assignment not found", async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await shiftService.updateShiftAssignment(
        "nonexistent",
        {}
      );

      expect(result).toBeNull();
    });

    it("should handle errors", async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockRejectedValue(new Error("DB Error")),
          }),
        }),
      });

      await expect(
        shiftService.updateShiftAssignment("assign-1", {})
      ).rejects.toThrow("Failed to update shift assignment");
    });
  });

  describe("deleteShiftAssignment", () => {
    it("should delete an assignment", async () => {
      const mockAssignment = { id: "assign-1" };

      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockAssignment]),
        }),
      });

      const result = await shiftService.deleteShiftAssignment("assign-1");

      expect(result).toEqual(mockAssignment);
    });

    it("should return null if assignment not found", async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await shiftService.deleteShiftAssignment("nonexistent");

      expect(result).toBeNull();
    });

    it("should handle errors", async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error("DB Error")),
        }),
      });

      await expect(
        shiftService.deleteShiftAssignment("assign-1")
      ).rejects.toThrow("Failed to delete shift assignment");
    });
  });

  describe("checkInShift", () => {
    it("should check in to a shift", async () => {
      const mockAssignment = {
        id: "assign-1",
        status: "checked-in",
        actualCheckIn: new Date(),
      };

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockAssignment]),
          }),
        }),
      });

      const result = await shiftService.checkInShift("assign-1");

      expect(result).toEqual(mockAssignment);
    });

    it("should return null if assignment not found", async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await shiftService.checkInShift("nonexistent");

      expect(result).toBeNull();
    });

    it("should handle errors", async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockRejectedValue(new Error("DB Error")),
          }),
        }),
      });

      await expect(shiftService.checkInShift("assign-1")).rejects.toThrow(
        "Failed to check in"
      );
    });
  });

  describe("checkOutShift", () => {
    it("should check out from a shift", async () => {
      const mockAssignment = {
        id: "assign-1",
        status: "checked-out",
        actualCheckOut: new Date(),
      };

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockAssignment]),
          }),
        }),
      });

      const result = await shiftService.checkOutShift("assign-1");

      expect(result).toEqual(mockAssignment);
    });

    it("should return null if assignment not found", async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await shiftService.checkOutShift("nonexistent");

      expect(result).toBeNull();
    });

    it("should handle errors", async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockRejectedValue(new Error("DB Error")),
          }),
        }),
      });

      await expect(shiftService.checkOutShift("assign-1")).rejects.toThrow(
        "Failed to check out"
      );
    });
  });

  describe("getUserSchedule", () => {
    it("should get user schedule for date range", async () => {
      const mockSchedule = [
        { assignment: { id: "assign-1" }, shift: { name: "Morning" } },
      ];

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockSchedule),
      };
      mockDb.select.mockReturnValue(mockChain);

      const result = await shiftService.getUserSchedule(
        "user-1",
        "2024-01-01",
        "2024-12-31"
      );

      expect(result).toEqual(mockSchedule);
    });

    it("should handle errors", async () => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockRejectedValue(new Error("DB Error")),
      };
      mockDb.select.mockReturnValue(mockChain);

      await expect(
        shiftService.getUserSchedule("user-1", "2024-01-01", "2024-12-31")
      ).rejects.toThrow("Failed to fetch user schedule");
    });
  });

  describe("getStaffByShiftAndDate", () => {
    it("should get staff for shift and date", async () => {
      const mockStaff = [
        { assignment: { id: "assign-1" }, user: { name: "John" } },
      ];

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockStaff),
      };
      mockDb.select.mockReturnValue(mockChain);

      const result = await shiftService.getStaffByShiftAndDate(
        "shift-1",
        "2024-01-01"
      );

      expect(result).toEqual(mockStaff);
    });

    it("should handle errors", async () => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockRejectedValue(new Error("DB Error")),
      };
      mockDb.select.mockReturnValue(mockChain);

      await expect(
        shiftService.getStaffByShiftAndDate("shift-1", "2024-01-01")
      ).rejects.toThrow("Failed to fetch staff");
    });
  });
});
