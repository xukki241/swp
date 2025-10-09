import { describe, it, expect, vi, beforeEach } from "vitest";

import * as registrationController from "@/controllers/registrationController.js";
import * as registrationService from "@/services/registrationService.js";
import logger from "@/utils/logger.js";

vi.mock("@/services/registrationService.js");

describe("RegistrationController", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  describe("getAllRegistrations", () => {
    it("should return all registrations", async () => {
      req.query = { status: "pending" };
      const mockRegs = [
        { id: 1n, status: "pending" },
        { id: 2n, status: "pending" },
      ];
      registrationService.getAllRegistrations.mockResolvedValue(mockRegs);

      await registrationController.getAllRegistrations(req, res, next);

      expect(registrationService.getAllRegistrations).toHaveBeenCalledWith(
        "pending"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockRegs,
      });
    });

    it("should handle errors", async () => {
      registrationService.getAllRegistrations.mockRejectedValue(
        new Error("Database error")
      );

      await registrationController.getAllRegistrations(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("getRegistrationById", () => {
    it("should return registration by id", async () => {
      req.params = { id: "1" };
      registrationService.getRegistrationById.mockResolvedValue({ id: 1n });

      await registrationController.getRegistrationById(req, res, next);

      expect(registrationService.getRegistrationById).toHaveBeenCalledWith(1n);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      registrationService.getRegistrationById.mockResolvedValue(null);

      await registrationController.getRegistrationById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("approveRegistration", () => {
    it("should approve registration with default role", async () => {
      req.params = { id: "1" };
      req.body = {};
      registrationService.approveRegistration.mockResolvedValue({
        success: true,
      });

      await registrationController.approveRegistration(req, res, next);

      expect(registrationService.approveRegistration).toHaveBeenCalledWith(
        1n,
        "staff"
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should approve registration with specified role", async () => {
      req.params = { id: "1" };
      req.body = { role: "sales" };
      registrationService.approveRegistration.mockResolvedValue({
        success: true,
      });

      await registrationController.approveRegistration(req, res, next);

      expect(registrationService.approveRegistration).toHaveBeenCalledWith(
        1n,
        "sales"
      );
    });

    it("should return 400 for invalid role", async () => {
      req.params = { id: "1" };
      req.body = { role: "admin" };

      await registrationController.approveRegistration(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid role. Must be 'staff' or 'sales'",
      });
    });

    it("should handle errors", async () => {
      req.params = { id: "1" };
      req.body = {};
      registrationService.approveRegistration.mockRejectedValue(
        new Error("Error")
      );

      await registrationController.approveRegistration(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("rejectRegistration", () => {
    it("should reject registration", async () => {
      req.params = { id: "1" };
      registrationService.rejectRegistration.mockResolvedValue({
        success: true,
      });

      await registrationController.rejectRegistration(req, res, next);

      expect(registrationService.rejectRegistration).toHaveBeenCalledWith(1n);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should handle errors", async () => {
      req.params = { id: "1" };
      registrationService.rejectRegistration.mockRejectedValue(
        new Error("Error")
      );

      await registrationController.rejectRegistration(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("deleteRegistration", () => {
    it("should delete registration", async () => {
      req.params = { id: "1" };
      registrationService.deleteRegistration.mockResolvedValue({
        success: true,
      });

      await registrationController.deleteRegistration(req, res, next);

      expect(registrationService.deleteRegistration).toHaveBeenCalledWith(1n);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should handle errors", async () => {
      req.params = { id: "1" };
      registrationService.deleteRegistration.mockRejectedValue(
        new Error("Error")
      );

      await registrationController.deleteRegistration(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
