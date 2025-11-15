import { beforeEach, describe, expect, it, vi } from "vitest";
import * as shiftController from "../../../src/controllers/shiftController.js";
import * as shiftService from "../../../src/services/shiftService.js";
import logger from "../../../src/utils/logger.js";

vi.mock("../../../src/services/shiftService.js");
vi.mock("../../../src/utils/logger.js");

describe("shiftController", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {},
      user: { id: "user-123" },
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe("getAllShifts", () => {
    it("should return all shifts", async () => {
      const mockShifts = [
        { id: "1", name: "Morning", startTime: "08:00", endTime: "12:00" },
        { id: "2", name: "Evening", startTime: "13:00", endTime: "17:00" },
      ];
      shiftService.getAllShifts.mockResolvedValue(mockShifts);

      await shiftController.getAllShifts(req, res, next);

      expect(shiftService.getAllShifts).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockShifts,
        meta: { total: 2 },
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      shiftService.getAllShifts.mockRejectedValue(error);

      await shiftController.getAllShifts(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(
        "Error fetching shifts:",
        error
      );
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getShiftById", () => {
    it("should return shift by id", async () => {
      const mockShift = {
        id: "1",
        name: "Morning",
        startTime: "08:00",
        endTime: "12:00",
      };
      req.params.id = "1";
      shiftService.getShiftById.mockResolvedValue(mockShift);

      await shiftController.getShiftById(req, res, next);

      expect(shiftService.getShiftById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockShift,
      });
    });

    it("should return 404 if shift not found", async () => {
      req.params.id = "999";
      shiftService.getShiftById.mockResolvedValue(null);

      await shiftController.getShiftById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Shift not found",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      req.params.id = "1";
      shiftService.getShiftById.mockRejectedValue(error);

      await shiftController.getShiftById(req, res, next);

      expect(logger.error).toHaveBeenCalledWith("Error fetching shift:", error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("createShift", () => {
    it("should create a new shift", async () => {
      const shiftData = {
        name: "Morning",
        startTime: "08:00",
        endTime: "12:00",
      };
      const mockShift = { id: "1", ...shiftData };
      req.body = shiftData;
      shiftService.createShift.mockResolvedValue(mockShift);

      await shiftController.createShift(req, res, next);

      expect(shiftService.createShift).toHaveBeenCalledWith(shiftData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Shift created successfully",
        data: mockShift,
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Creation failed");
      req.body = { name: "Morning" };
      shiftService.createShift.mockRejectedValue(error);

      await shiftController.createShift(req, res, next);

      expect(logger.error).toHaveBeenCalledWith("Error creating shift:", error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("updateShift", () => {
    it("should update a shift", async () => {
      const shiftData = { name: "Updated Morning" };
      const mockShift = { id: "1", ...shiftData };
      req.params.id = "1";
      req.body = shiftData;
      shiftService.updateShift.mockResolvedValue(mockShift);

      await shiftController.updateShift(req, res, next);

      expect(shiftService.updateShift).toHaveBeenCalledWith("1", shiftData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Shift updated successfully",
        data: mockShift,
      });
    });

    it("should return 404 if shift not found", async () => {
      req.params.id = "999";
      req.body = { name: "Updated" };
      shiftService.updateShift.mockResolvedValue(null);

      await shiftController.updateShift(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Shift not found",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Update failed");
      req.params.id = "1";
      req.body = { name: "Updated" };
      shiftService.updateShift.mockRejectedValue(error);

      await shiftController.updateShift(req, res, next);

      expect(logger.error).toHaveBeenCalledWith("Error updating shift:", error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteShift", () => {
    it("should delete a shift", async () => {
      const mockShift = { id: "1", name: "Morning" };
      req.params.id = "1";
      shiftService.deleteShift.mockResolvedValue(mockShift);

      await shiftController.deleteShift(req, res, next);

      expect(shiftService.deleteShift).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Shift deleted successfully",
        data: mockShift,
      });
    });

    it("should return 404 if shift not found", async () => {
      req.params.id = "999";
      shiftService.deleteShift.mockResolvedValue(null);

      await shiftController.deleteShift(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Shift not found",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Delete failed");
      req.params.id = "1";
      shiftService.deleteShift.mockRejectedValue(error);

      await shiftController.deleteShift(req, res, next);

      expect(logger.error).toHaveBeenCalledWith("Error deleting shift:", error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getAllShiftAssignments", () => {
    it("should return all shift assignments with filters", async () => {
      const mockAssignments = [
        { id: "1", userId: "user-1", shiftId: "shift-1" },
        { id: "2", userId: "user-2", shiftId: "shift-2" },
      ];
      req.query = {
        userId: "user-1",
        shiftId: "shift-1",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
        status: "confirmed",
      };
      shiftService.getAllShiftAssignments.mockResolvedValue(mockAssignments);

      await shiftController.getAllShiftAssignments(req, res, next);

      expect(shiftService.getAllShiftAssignments).toHaveBeenCalledWith({
        userId: "user-1",
        shiftId: "shift-1",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
        status: "confirmed",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockAssignments,
        meta: { total: 2 },
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      shiftService.getAllShiftAssignments.mockRejectedValue(error);

      await shiftController.getAllShiftAssignments(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(
        "Error fetching shift assignments:",
        error
      );
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getShiftAssignmentById", () => {
    it("should return shift assignment by id", async () => {
      const mockAssignment = { id: "1", userId: "user-1", shiftId: "shift-1" };
      req.params.id = "1";
      shiftService.getShiftAssignmentById.mockResolvedValue(mockAssignment);

      await shiftController.getShiftAssignmentById(req, res, next);

      expect(shiftService.getShiftAssignmentById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockAssignment,
      });
    });

    it("should return 404 if shift assignment not found", async () => {
      req.params.id = "999";
      shiftService.getShiftAssignmentById.mockResolvedValue(null);

      await shiftController.getShiftAssignmentById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Shift assignment not found",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      req.params.id = "1";
      shiftService.getShiftAssignmentById.mockRejectedValue(error);

      await shiftController.getShiftAssignmentById(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(
        "Error fetching shift assignment:",
        error
      );
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("createShiftAssignment", () => {
    it("should create a single shift assignment", async () => {
      const assignmentData = {
        userId: "user-1",
        shiftId: "shift-1",
        date: "2024-01-01",
      };
      const mockAssignment = {
        id: "1",
        ...assignmentData,
        createdBy: "user-123",
      };
      req.body = assignmentData;
      shiftService.createShiftAssignment.mockResolvedValue(mockAssignment);

      await shiftController.createShiftAssignment(req, res, next);

      expect(shiftService.createShiftAssignment).toHaveBeenCalledWith({
        ...assignmentData,
        createdBy: "user-123",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Shift assignment created successfully",
        data: mockAssignment,
      });
    });

    it("should create batch shift assignments from array", async () => {
      const assignmentsArray = [
        { userId: "user-1", shiftId: "shift-1", date: "2024-01-01" },
        { userId: "user-2", shiftId: "shift-2", date: "2024-01-02" },
      ];
      const mockAssignments = assignmentsArray.map((a, idx) => ({
        id: `${idx + 1}`,
        ...a,
        createdBy: "user-123",
      }));
      req.body = assignmentsArray;
      shiftService.createBatchShiftAssignments.mockResolvedValue(
        mockAssignments
      );

      await shiftController.createShiftAssignment(req, res, next);

      expect(shiftService.createBatchShiftAssignments).toHaveBeenCalledWith(
        assignmentsArray.map((a) => ({ ...a, createdBy: "user-123" }))
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "2 shift assignments created successfully",
        data: mockAssignments,
      });
    });

    it("should create batch shift assignments from object with assignments property", async () => {
      const assignmentsArray = [
        { userId: "user-1", shiftId: "shift-1", date: "2024-01-01" },
        { userId: "user-2", shiftId: "shift-2", date: "2024-01-02" },
      ];
      const mockAssignments = assignmentsArray.map((a, idx) => ({
        id: `${idx + 1}`,
        ...a,
        createdBy: "user-123",
      }));
      req.body = { assignments: assignmentsArray };
      shiftService.createBatchShiftAssignments.mockResolvedValue(
        mockAssignments
      );

      await shiftController.createShiftAssignment(req, res, next);

      expect(shiftService.createBatchShiftAssignments).toHaveBeenCalledWith(
        assignmentsArray.map((a) => ({ ...a, createdBy: "user-123" }))
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "2 shift assignments created successfully",
        data: mockAssignments,
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Creation failed");
      req.body = { userId: "user-1", shiftId: "shift-1" };
      shiftService.createShiftAssignment.mockRejectedValue(error);

      await shiftController.createShiftAssignment(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(
        "Error creating shift assignment:",
        error
      );
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("updateShiftAssignment", () => {
    it("should update a shift assignment", async () => {
      const assignmentData = { status: "confirmed" };
      const mockAssignment = { id: "1", ...assignmentData };
      req.params.id = "1";
      req.body = assignmentData;
      shiftService.updateShiftAssignment.mockResolvedValue(mockAssignment);

      await shiftController.updateShiftAssignment(req, res, next);

      expect(shiftService.updateShiftAssignment).toHaveBeenCalledWith(
        "1",
        assignmentData
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Shift assignment updated successfully",
        data: mockAssignment,
      });
    });

    it("should return 404 if shift assignment not found", async () => {
      req.params.id = "999";
      req.body = { status: "confirmed" };
      shiftService.updateShiftAssignment.mockResolvedValue(null);

      await shiftController.updateShiftAssignment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Shift assignment not found",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Update failed");
      req.params.id = "1";
      req.body = { status: "confirmed" };
      shiftService.updateShiftAssignment.mockRejectedValue(error);

      await shiftController.updateShiftAssignment(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(
        "Error updating shift assignment:",
        error
      );
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("confirmShift", () => {
    it("should confirm a shift assignment", async () => {
      const mockAssignment = { id: "1", status: "confirmed" };
      req.params.id = "1";
      shiftService.confirmShift.mockResolvedValue(mockAssignment);

      await shiftController.confirmShift(req, res, next);

      expect(shiftService.confirmShift).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Shift confirmed successfully",
        data: mockAssignment,
      });
    });

    it("should return 404 if shift assignment not found", async () => {
      req.params.id = "999";
      shiftService.confirmShift.mockResolvedValue(null);

      await shiftController.confirmShift(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Shift assignment not found",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Confirm failed");
      req.params.id = "1";
      shiftService.confirmShift.mockRejectedValue(error);

      await shiftController.confirmShift(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(
        "Error confirming shift:",
        error
      );
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("checkInShift", () => {
    it("should check in to a shift assignment", async () => {
      const mockAssignment = { id: "1", status: "checked-in" };
      req.params.id = "1";
      shiftService.checkInShift.mockResolvedValue(mockAssignment);

      await shiftController.checkInShift(req, res, next);

      expect(shiftService.checkInShift).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Checked in successfully",
        data: mockAssignment,
      });
    });

    it("should return 404 if shift assignment not found", async () => {
      req.params.id = "999";
      shiftService.checkInShift.mockResolvedValue(null);

      await shiftController.checkInShift(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Shift assignment not found",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Check-in failed");
      req.params.id = "1";
      shiftService.checkInShift.mockRejectedValue(error);

      await shiftController.checkInShift(req, res, next);

      expect(logger.error).toHaveBeenCalledWith("Error checking in:", error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("checkOutShift", () => {
    it("should check out from a shift assignment", async () => {
      const mockAssignment = { id: "1", status: "completed" };
      req.params.id = "1";
      shiftService.checkOutShift.mockResolvedValue(mockAssignment);

      await shiftController.checkOutShift(req, res, next);

      expect(shiftService.checkOutShift).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Checked out successfully",
        data: mockAssignment,
      });
    });

    it("should return 404 if shift assignment not found", async () => {
      req.params.id = "999";
      shiftService.checkOutShift.mockResolvedValue(null);

      await shiftController.checkOutShift(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Shift assignment not found",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Check-out failed");
      req.params.id = "1";
      shiftService.checkOutShift.mockRejectedValue(error);

      await shiftController.checkOutShift(req, res, next);

      expect(logger.error).toHaveBeenCalledWith("Error checking out:", error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteShiftAssignment", () => {
    it("should delete a shift assignment", async () => {
      const mockAssignment = { id: "1", userId: "user-1" };
      req.params.id = "1";
      shiftService.deleteShiftAssignment.mockResolvedValue(mockAssignment);

      await shiftController.deleteShiftAssignment(req, res, next);

      expect(shiftService.deleteShiftAssignment).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Shift assignment deleted successfully",
        data: mockAssignment,
      });
    });

    it("should return 404 if shift assignment not found", async () => {
      req.params.id = "999";
      shiftService.deleteShiftAssignment.mockResolvedValue(null);

      await shiftController.deleteShiftAssignment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Shift assignment not found",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Delete failed");
      req.params.id = "1";
      shiftService.deleteShiftAssignment.mockRejectedValue(error);

      await shiftController.deleteShiftAssignment(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(
        "Error deleting shift assignment:",
        error
      );
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getUserSchedule", () => {
    it("should return user schedule", async () => {
      const mockSchedule = [
        { id: "1", date: "2024-01-01", shiftId: "shift-1" },
        { id: "2", date: "2024-01-02", shiftId: "shift-2" },
      ];
      req.params.userId = "user-1";
      req.query = { startDate: "2024-01-01", endDate: "2024-01-31" };
      shiftService.getUserSchedule.mockResolvedValue(mockSchedule);

      await shiftController.getUserSchedule(req, res, next);

      expect(shiftService.getUserSchedule).toHaveBeenCalledWith(
        "user-1",
        "2024-01-01",
        "2024-01-31"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSchedule,
        meta: { total: 2 },
      });
    });

    it("should return 400 if startDate is missing", async () => {
      req.params.userId = "user-1";
      req.query = { endDate: "2024-01-31" };

      await shiftController.getUserSchedule(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "startDate and endDate are required",
      });
    });

    it("should return 400 if endDate is missing", async () => {
      req.params.userId = "user-1";
      req.query = { startDate: "2024-01-01" };

      await shiftController.getUserSchedule(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "startDate and endDate are required",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      req.params.userId = "user-1";
      req.query = { startDate: "2024-01-01", endDate: "2024-01-31" };
      shiftService.getUserSchedule.mockRejectedValue(error);

      await shiftController.getUserSchedule(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(
        "Error fetching user schedule:",
        error
      );
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getStaffByShiftAndDate", () => {
    it("should return staff working in a shift on a date", async () => {
      const mockStaff = [
        { id: "user-1", name: "John Doe" },
        { id: "user-2", name: "Jane Smith" },
      ];
      req.params.shiftId = "shift-1";
      req.query = { date: "2024-01-01" };
      shiftService.getStaffByShiftAndDate.mockResolvedValue(mockStaff);

      await shiftController.getStaffByShiftAndDate(req, res, next);

      expect(shiftService.getStaffByShiftAndDate).toHaveBeenCalledWith(
        "shift-1",
        "2024-01-01"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockStaff,
        meta: { total: 2 },
      });
    });

    it("should return 400 if date is missing", async () => {
      req.params.shiftId = "shift-1";
      req.query = {};

      await shiftController.getStaffByShiftAndDate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "date query parameter is required",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      req.params.shiftId = "shift-1";
      req.query = { date: "2024-01-01" };
      shiftService.getStaffByShiftAndDate.mockRejectedValue(error);

      await shiftController.getStaffByShiftAndDate(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(
        "Error fetching staff for shift:",
        error
      );
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
