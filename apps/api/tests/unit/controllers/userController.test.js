import { beforeEach, describe, expect, it, vi } from "vitest";

import * as userController from "@/controllers/userController.js";
import * as userService from "@/services/userService.js";
import logger from "@/utils/logger.js";

vi.mock("@/services/userService.js");

describe("UserController", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {}, user: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  describe("getAllUsers", () => {
    it("should return all users", async () => {
      req.query = { search: "john" };
      userService.getAllUsers.mockResolvedValue([{ id: 1n }, { id: 2n }]);

      await userController.getAllUsers(req, res, next);

      expect(userService.getAllUsers).toHaveBeenCalledWith({ search: "john" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: [{ id: 1n }, { id: 2n }],
      });
    });

    it("should handle errors", async () => {
      userService.getAllUsers.mockRejectedValue(new Error("Database error"));

      await userController.getAllUsers(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("getUserById", () => {
    it("should return user by id", async () => {
      req.params = { id: "1" };
      userService.getUserById.mockResolvedValue({ id: 1n, name: "John" });

      await userController.getUserById(req, res, next);

      expect(userService.getUserById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      userService.getUserById.mockResolvedValue(null);

      await userController.getUserById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("createUser", () => {
    it("should create user", async () => {
      req.body = {
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        address: "123 Main St",
      };
      userService.getUserByEmail.mockResolvedValue(null);
      userService.getUserByPhone.mockResolvedValue(null);
      userService.createUser.mockResolvedValue({ id: 1n, ...req.body });

      await userController.createUser(req, res, next);

      expect(userService.createUser).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should return 400 if required fields missing", async () => {
      req.body = { name: "John" };

      await userController.createUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 409 if email exists", async () => {
      req.body = {
        name: "John",
        email: "john@example.com",
        phone: "1234567890",
      };
      userService.getUserByEmail.mockResolvedValue({ id: 2n });

      await userController.createUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    it("should return 409 if phone exists", async () => {
      req.body = {
        name: "John",
        email: "john@example.com",
        phone: "1234567890",
      };
      userService.getUserByEmail.mockResolvedValue(null);
      userService.getUserByPhone.mockResolvedValue({ id: 2n });

      await userController.createUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe("updateUser", () => {
    it("should update user", async () => {
      req.params = { id: "1" };
      req.body = { name: "John Updated" };
      req.user = { userId: "2" };
      userService.getUserById.mockResolvedValue({ id: 1n, name: "John" });
      userService.updateUser.mockResolvedValue({
        id: 1n,
        name: "John Updated",
      });

      await userController.updateUser(req, res, next);

      expect(userService.updateUser).toHaveBeenCalledWith("1", {
        name: "John Updated",
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if user not found", async () => {
      req.params = { id: "999" };
      req.user = { userId: "1" };
      userService.getUserById.mockResolvedValue(null);

      await userController.updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should prevent changing own role", async () => {
      req.params = { id: "1" };
      req.body = { role: "admin" };
      req.user = { userId: "1" };
      userService.getUserById.mockResolvedValue({ id: 1n, role: "staff" });

      await userController.updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("should prevent changing own status", async () => {
      req.params = { id: "1" };
      req.body = { status: "suspended" };
      req.user = { userId: "1" };
      userService.getUserById.mockResolvedValue({ id: 1n, status: "active" });

      await userController.updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe("deleteUser", () => {
    it("should soft delete user", async () => {
      req.params = { id: "1" };
      req.user = { userId: "2" };
      userService.suspendUser.mockResolvedValue({
        id: 1n,
        status: "suspended",
      });

      await userController.deleteUser(req, res, next);

      expect(userService.suspendUser).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("activateUser", () => {
    it("should activate user", async () => {
      req.params = { id: "1" };
      userService.activateUser.mockResolvedValue({ id: 1n, status: "active" });

      await userController.activateUser(req, res, next);

      expect(userService.activateUser).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("deactivateUser", () => {
    it("should deactivate user", async () => {
      req.params = { id: "1" };
      req.user = { userId: "2" };
      userService.deactivateUser.mockResolvedValue({
        id: 1n,
        status: "inactive",
      });

      await userController.deactivateUser(req, res, next);

      expect(userService.deactivateUser).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("suspendUser", () => {
    it("should suspend user", async () => {
      req.params = { id: "1" };
      req.user = { userId: "2" };
      userService.suspendUser.mockResolvedValue({
        id: 1n,
        status: "suspended",
      });

      await userController.suspendUser(req, res, next);

      expect(userService.suspendUser).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("getAllStaff", () => {
    it("should return all staff accounts", async () => {
      req.query = { role: "staff", status: "active" };
      const mockStaff = [
        { id: 1n, role: "staff", status: "active" },
        { id: 2n, role: "staff", status: "active" },
      ];
      userService.getAllStaff.mockResolvedValue(mockStaff);

      await userController.getAllStaff(req, res, next);

      expect(userService.getAllStaff).toHaveBeenCalledWith({
        role: "staff",
        status: "active",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockStaff,
      });
    });

    it("should handle errors", async () => {
      userService.getAllStaff.mockRejectedValue(new Error("Database error"));

      await userController.getAllStaff(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("createUser - additional validations", () => {
    it("should use default role and status", async () => {
      req.body = {
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "0987654321",
      };
      userService.getUserByEmail.mockResolvedValue(null);
      userService.getUserByPhone.mockResolvedValue(null);
      userService.createUser.mockResolvedValue({
        id: 1n,
        ...req.body,
        role: "staff",
        status: "active",
      });

      await userController.createUser(req, res, next);

      expect(userService.createUser).toHaveBeenCalledWith({
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "0987654321",
        address: null,
        role: "staff",
        status: "active",
      });
    });

    it("should include optional address field", async () => {
      req.body = {
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "0987654321",
        address: "456 Oak St",
        role: "manager",
        status: "active",
      };
      userService.getUserByEmail.mockResolvedValue(null);
      userService.getUserByPhone.mockResolvedValue(null);
      userService.createUser.mockResolvedValue({ id: 1n, ...req.body });

      await userController.createUser(req, res, next);

      expect(userService.createUser).toHaveBeenCalledWith({
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "0987654321",
        address: "456 Oak St",
        role: "manager",
        status: "active",
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should handle createUser errors", async () => {
      req.body = {
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "0987654321",
      };
      userService.getUserByEmail.mockResolvedValue(null);
      userService.getUserByPhone.mockResolvedValue(null);
      userService.createUser.mockRejectedValue(new Error("Creation failed"));

      await userController.createUser(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("updateUser - email and phone uniqueness", () => {
    it("should allow updating same email (no change)", async () => {
      req.params = { id: "1" };
      req.body = { email: "john@example.com" };
      req.user = { userId: "2" };
      const existingUser = { id: 1n, email: "john@example.com" };
      userService.getUserById.mockResolvedValue(existingUser);
      userService.updateUser.mockResolvedValue(existingUser);

      await userController.updateUser(req, res, next);

      expect(userService.updateUser).toHaveBeenCalledWith("1", {
        email: "john@example.com",
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 409 if new email already exists", async () => {
      req.params = { id: "1" };
      req.body = { email: "newemail@example.com" };
      req.user = { userId: "2" };
      userService.getUserById.mockResolvedValue({
        id: 1n,
        email: "old@example.com",
      });
      userService.getUserByEmail.mockResolvedValue({ id: 2n });

      await userController.updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User with this email already exists",
      });
    });

    it("should allow updating same phone (no change)", async () => {
      req.params = { id: "1" };
      req.body = { phone: "1234567890" };
      req.user = { userId: "2" };
      const existingUser = { id: 1n, phone: "1234567890" };
      userService.getUserById.mockResolvedValue(existingUser);
      userService.updateUser.mockResolvedValue(existingUser);

      await userController.updateUser(req, res, next);

      expect(userService.updateUser).toHaveBeenCalledWith("1", {
        phone: "1234567890",
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 409 if new phone already exists", async () => {
      req.params = { id: "1" };
      req.body = { phone: "9999999999" };
      req.user = { userId: "2" };
      userService.getUserById.mockResolvedValue({
        id: 1n,
        phone: "1111111111",
      });
      userService.getUserByPhone.mockResolvedValue({ id: 2n });

      await userController.updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User with this phone already exists",
      });
    });

    it("should handle multiple field updates", async () => {
      req.params = { id: "1" };
      req.body = {
        name: "Updated Name",
        email: "updated@example.com",
        phone: "5555555555",
        address: "789 New St",
      };
      req.user = { userId: "2" };
      userService.getUserById.mockResolvedValue({
        id: 1n,
        name: "Old Name",
        email: "old@example.com",
        phone: "1111111111",
      });
      userService.getUserByEmail.mockResolvedValue(null);
      userService.getUserByPhone.mockResolvedValue(null);
      userService.updateUser.mockResolvedValue({ id: 1n, ...req.body });

      await userController.updateUser(req, res, next);

      expect(userService.updateUser).toHaveBeenCalledWith("1", {
        name: "Updated Name",
        email: "updated@example.com",
        phone: "5555555555",
        address: "789 New St",
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should handle updateUser errors", async () => {
      req.params = { id: "1" };
      req.body = { name: "Updated Name" };
      req.user = { userId: "2" };
      userService.getUserById.mockResolvedValue({ id: 1n, name: "Old Name" });
      userService.updateUser.mockRejectedValue(new Error("Update failed"));

      await userController.updateUser(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("deleteUser - preventing self-deletion", () => {
    it("should prevent self-deletion", async () => {
      req.params = { id: "1" };
      req.user = { userId: "1" };

      await userController.deleteUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "You cannot delete your own account",
      });
    });

    it("should return 404 if user not found", async () => {
      req.params = { id: "999" };
      req.user = { userId: "1" };
      userService.suspendUser.mockResolvedValue(null);

      await userController.deleteUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should handle deleteUser errors", async () => {
      req.params = { id: "2" };
      req.user = { userId: "1" };
      userService.suspendUser.mockRejectedValue(new Error("Delete failed"));

      await userController.deleteUser(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("activateUser - edge cases", () => {
    it("should return 404 if user not found", async () => {
      req.params = { id: "999" };
      userService.activateUser.mockResolvedValue(null);

      await userController.activateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should handle activateUser errors", async () => {
      req.params = { id: "1" };
      userService.activateUser.mockRejectedValue(
        new Error("Activation failed")
      );

      await userController.activateUser(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("deactivateUser - preventing self-deactivation", () => {
    it("should prevent self-deactivation", async () => {
      req.params = { id: "1" };
      req.user = { userId: "1" };

      await userController.deactivateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "You cannot deactivate your own account",
      });
    });

    it("should return 404 if user not found", async () => {
      req.params = { id: "999" };
      req.user = { userId: "1" };
      userService.deactivateUser.mockResolvedValue(null);

      await userController.deactivateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should handle deactivateUser errors", async () => {
      req.params = { id: "2" };
      req.user = { userId: "1" };
      userService.deactivateUser.mockRejectedValue(
        new Error("Deactivation failed")
      );

      await userController.deactivateUser(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("suspendUser - preventing self-suspension", () => {
    it("should prevent self-suspension", async () => {
      req.params = { id: "1" };
      req.user = { userId: "1" };

      await userController.suspendUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "You cannot suspend your own account",
      });
    });

    it("should return 404 if user not found", async () => {
      req.params = { id: "999" };
      req.user = { userId: "1" };
      userService.suspendUser.mockResolvedValue(null);

      await userController.suspendUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should handle suspendUser errors", async () => {
      req.params = { id: "2" };
      req.user = { userId: "1" };
      userService.suspendUser.mockRejectedValue(new Error("Suspension failed"));

      await userController.suspendUser(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });
});
