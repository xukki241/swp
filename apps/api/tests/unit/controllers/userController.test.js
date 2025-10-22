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
});
