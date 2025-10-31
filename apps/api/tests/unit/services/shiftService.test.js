import { beforeEach, describe, expect, it, vi } from "vitest";

import * as shiftService from "@/services/shiftService.js";

vi.mock("@/db/index.js", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
  },
}));

import { db } from "@/db/index.js";

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
});
