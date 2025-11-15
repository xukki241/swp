import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/db/index.js";
import * as shiftService from "@/services/shiftService.js";

vi.mock("@/db/index.js", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
}));

describe("Shift Service (deleteShift & createShiftAssignment)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  // deleteShift
  describe("deleteShift()", () => {
    it("should delete shift successfully when no assignments exist", async () => {
      const mockShift = { id: "shift-1", name: "Morning" };

      db.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      db.delete.mockReturnValue({
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockShift]),
      });

      const result = await shiftService.deleteShift("shift-1");

      expect(result).toEqual(mockShift);
    });

    it("should throw error if shift has existing assignments", async () => {
      db.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: "assign-1" }]),
      });

      await expect(shiftService.deleteShift("shift-1")).rejects.toThrow(
        "Cannot delete shift that has assignments"
      );
    });

    it("should handle database error properly", async () => {
      db.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockRejectedValue(new Error("DB Error")),
      });

      await expect(shiftService.deleteShift("shift-1")).rejects.toThrow(
        "Failed to delete shift"
      );
    });
  });

  // createShiftAssignment
  describe("createShiftAssignment()", () => {
    (it("should create shift assignment successfully for valid future date"),
      async () => {
        const nowDate = new Date();
        nowDate.setDate(nowDate.getDate());

        const mockAssignment = {
          id: "assign-0",
          userId: "user-0",
          shiftId: "shift-0",
          assignedDate: nowDate.toDateString(),
        };

        db.select.mockReturnValue({
          from: vi.fn().mockReturnThis,
          where: vi.fn().mockReturnThis,
          limit: vi.fn().mockResolvedValue([]),
        });

        db.insert.mockReturnValue({
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([mockAssignment]),
        });
        const result = await shiftService.createShiftAssignment(mockAssignment);

        expect(result).toEqual(mockAssignment);
        expect(db.insert).toHaveBeenCalled();
      });
    it("should create shift assignment successfully for valid future date", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const mockAssignment = {
        id: "assign-1",
        userId: "user-1",
        shiftId: "shift-1",
        assignedDate: futureDate.toISOString(),
      };

      db.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      db.insert.mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockAssignment]),
      });

      const result = await shiftService.createShiftAssignment(mockAssignment);

      expect(result).toEqual(mockAssignment);
      expect(db.insert).toHaveBeenCalled();
    });

    it("should throw error when assigned date is in the past", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const data = {
        userId: "user-1",
        shiftId: "shift-1",
        assignedDate: pastDate.toISOString(),
      };

      await expect(shiftService.createShiftAssignment(data)).rejects.toThrow(
        "Cannot assign shifts for past dates"
      );
    });

    it("should throw error if user already has an assignment that date", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      const data = {
        userId: "user-1",
        shiftId: "shift-1",
        assignedDate: futureDate.toISOString(),
      };

      db.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: "existing" }]),
      });

      await expect(shiftService.createShiftAssignment(data)).rejects.toThrow(
        "User already has a shift assignment on this date"
      );
    });

    it("should throw generic error if DB insert fails", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const data = {
        userId: "user-1",
        shiftId: "shift-1",
        assignedDate: futureDate.toISOString(),
      };

      db.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      db.insert.mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error("DB Error")),
      });

      await expect(shiftService.createShiftAssignment(data)).rejects.toThrow(
        "Failed to create shift assignment"
      );
    });
  });

  describe("getAllShifts()", () => {
    it("should get all shifts", async () => {
      const mockShifts = [
        { id: "shift-1", name: "Morning", startTime: "08:00" },
        { id: "shift-2", name: "Evening", startTime: "14:00" },
      ];

      db.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockShifts),
      });

      const result = await shiftService.getAllShifts();

      expect(result).toEqual(mockShifts);
      expect(result.length).toBe(2);
    });
  });

  describe("getShiftById()", () => {
    it("should get shift by id", async () => {
      const mockShift = { id: "shift-1", name: "Morning" };

      db.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockShift]),
      });

      const result = await shiftService.getShiftById("shift-1");

      expect(result).toEqual(mockShift);
    });

    it("should return null if shift not found", async () => {
      db.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      const result = await shiftService.getShiftById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("createShift()", () => {
    it("should create new shift", async () => {
      const shiftData = {
        name: "Night",
        shiftType: "full",
        startTime: "22:00",
        endTime: "06:00",
      };

      const mockCreatedShift = { id: "shift-3", ...shiftData };

      db.insert.mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockCreatedShift]),
      });

      const result = await shiftService.createShift(shiftData);

      expect(result).toEqual(mockCreatedShift);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe("updateShift()", () => {
    it("should update shift", async () => {
      const updateData = { name: "Updated Morning" };
      const mockUpdatedShift = {
        id: "shift-1",
        name: "Updated Morning",
      };

      db.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockUpdatedShift]),
      });

      const result = await shiftService.updateShift("shift-1", updateData);

      expect(result).toEqual(mockUpdatedShift);
    });

    it("should return null if shift not found", async () => {
      db.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
      });

      const result = await shiftService.updateShift("non-existent", {
        name: "test",
      });

      expect(result).toBeNull();
    });
  });

  describe("confirmShift()", () => {
    it("should confirm scheduled shift", async () => {
      const mockAssignment = {
        id: "assign-1",
        status: "scheduled",
      };

      const mockConfirmedAssignment = {
        id: "assign-1",
        status: "confirmed",
      };

      db.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockAssignment]),
      });

      db.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockConfirmedAssignment]),
      });

      const result = await shiftService.confirmShift("assign-1");

      expect(result.status).toBe("confirmed");
    });

    it("should throw error if shift not found", async () => {
      db.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      await expect(shiftService.confirmShift("non-existent")).rejects.toThrow(
        "Shift assignment not found"
      );
    });

    it("should throw error if shift not scheduled", async () => {
      const mockAssignment = {
        id: "assign-1",
        status: "confirmed",
      };

      db.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockAssignment]),
      });

      await expect(shiftService.confirmShift("assign-1")).rejects.toThrow(
        "Only scheduled shifts can be confirmed"
      );
    });
  });

  describe("checkInShift()", () => {
    it("should check in shift", async () => {
      const mockCheckedInAssignment = {
        id: "assign-1",
        status: "in_progress",
        checkInTime: expect.any(Date),
      };

      db.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockCheckedInAssignment]),
      });

      const result = await shiftService.checkInShift("assign-1");

      expect(result.status).toBe("in_progress");
    });
  });

  describe("checkOutShift()", () => {
    it("should check out shift", async () => {
      const mockCheckedOutAssignment = {
        id: "assign-1",
        status: "completed",
        checkOutTime: expect.any(Date),
      };

      db.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockCheckedOutAssignment]),
      });

      const result = await shiftService.checkOutShift("assign-1");

      expect(result.status).toBe("completed");
    });
  });

  describe("getAllShiftAssignments()", () => {
    it("should get all shift assignments", async () => {
      const mockAssignments = [
        {
          assignment: { id: "assign-1" },
          user: { id: "user-1", name: "John" },
          shift: { id: "shift-1", name: "Morning" },
        },
      ];

      db.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockAssignments),
      });

      const result = await shiftService.getAllShiftAssignments();

      expect(result).toEqual(mockAssignments);
    });

    it("should filter assignments by userId", async () => {
      // Mock with conditional where() call - orderBy returns object with where method
      db.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      await shiftService.getAllShiftAssignments({ userId: "user-1" });

      expect(db.select).toHaveBeenCalled();
    });
  });

  describe("createBatchShiftAssignments()", () => {
    it("should create multiple assignments", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const assignments = [
        {
          userId: "user-1",
          shiftId: "shift-1",
          assignedDate: futureDate.toISOString(),
          createdBy: "admin-1",
        },
        {
          userId: "user-2",
          shiftId: "shift-1",
          assignedDate: futureDate.toISOString(),
          createdBy: "admin-1",
        },
      ];

      const mockCreatedAssignments = [
        { id: "assign-1", userId: "user-1" },
        { id: "assign-2", userId: "user-2" },
      ];

      db.insert.mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue(mockCreatedAssignments),
      });

      const result =
        await shiftService.createBatchShiftAssignments(assignments);

      expect(result.length).toBe(2);
      expect(db.insert).toHaveBeenCalled();
    });

    it("should throw error if any date is in past", async () => {
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
  });

  describe("getUserSchedule()", () => {
    it("should get user schedule for date range", async () => {
      const mockSchedule = [
        {
          assignment: { id: "assign-1", assignedDate: new Date() },
          shift: { id: "shift-1", name: "Morning" },
        },
      ];

      db.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockSchedule),
      });

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const result = await shiftService.getUserSchedule(
        "user-1",
        startDate,
        endDate
      );

      expect(result).toEqual(mockSchedule);
    });
  });

  describe("getStaffByShiftAndDate()", () => {
    it("should get staff for specific shift and date", async () => {
      const mockStaff = [
        {
          assignment: { id: "assign-1" },
          user: { id: "user-1", name: "John" },
        },
      ];

      db.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockStaff),
      });

      const result = await shiftService.getStaffByShiftAndDate(
        "shift-1",
        new Date()
      );

      expect(result).toEqual(mockStaff);
    });
  });
});
