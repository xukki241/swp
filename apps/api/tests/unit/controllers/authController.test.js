import { beforeEach, describe, expect, it, vi } from "vitest";

import * as authController from "@/controllers/authController.js";
import * as authService from "@/services/authService.js";
import logger from "@/utils/logger.js";

vi.mock("@/services/authService.js");

describe("AuthController", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      user: {},
      params: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      req.body = {
        name: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        address: "123 Main St",
        password: "password123",
      };

      const mockResult = {
        success: true,
        message: "Registration successful",
        user: { id: 1n, name: "Test User", email: "test@example.com" },
      };

      authService.register.mockResolvedValue(mockResult);

      await authController.register(req, res, next);

      expect(authService.register).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        address: "123 Main St",
        password: "password123",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("should return 400 if required fields are missing", async () => {
      req.body = {
        name: "Test User",
        email: "test@example.com",
        // missing phone, address, password
      };

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message:
          "All fields are required (name, email, phone, address, password)",
      });
    });

    it("should return 400 if email format is invalid", async () => {
      req.body = {
        name: "Test User",
        email: "invalid-email",
        phone: "1234567890",
        address: "123 Main St",
        password: "password123",
      };

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid email format",
      });
    });

    it("should return 400 if phone format is invalid", async () => {
      req.body = {
        name: "Test User",
        email: "test@example.com",
        phone: "123", // invalid phone
        address: "123 Main St",
        password: "password123",
      };

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Phone must be 10 digits",
      });
    });

    it("should return 400 if password is too short", async () => {
      req.body = {
        name: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        address: "123 Main St",
        password: "12345", // too short
      };

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Password must be at least 6 characters",
      });
    });

    it("should handle service errors", async () => {
      req.body = {
        name: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        address: "123 Main St",
        password: "password123",
      };

      const error = new Error("Email already exists");
      authService.register.mockRejectedValue(error);

      await authController.register(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Email already exists",
      });
    });
  });

  describe("login", () => {
    it("should login user successfully", async () => {
      req.body = {
        email: "test@example.com",
        password: "password123",
      };

      const mockResult = {
        success: true,
        token: "jwt-token",
        user: { id: 1n, email: "test@example.com" },
      };

      authService.login.mockResolvedValue(mockResult);

      await authController.login(req, res, next);

      expect(authService.login).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("should return 400 if email or password is missing", async () => {
      req.body = { email: "test@example.com" }; // missing password

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Email and password are required",
      });
    });

    it("should handle login errors", async () => {
      req.body = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const error = new Error("Invalid credentials");
      authService.login.mockRejectedValue(error);

      await authController.login(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid credentials",
      });
    });
  });

  describe("logout", () => {
    it("should logout user successfully", async () => {
      await authController.logout(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Logout successful. Please remove token from client.",
      });
    });

    it("should handle errors", async () => {
      res.status.mockImplementation(() => {
        throw new Error("Something went wrong");
      });

      await authController.logout(req, res, next);

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("resetPassword", () => {
    it("should reset password successfully", async () => {
      req.body = {
        email: "test@example.com",
        newPassword: "newpassword123",
      };

      const mockResult = {
        success: true,
        message: "Password reset successful",
      };

      authService.resetPassword.mockResolvedValue(mockResult);

      await authController.resetPassword(req, res, next);

      expect(authService.resetPassword).toHaveBeenCalledWith(
        "test@example.com",
        "newpassword123"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("should return 400 if email or newPassword is missing", async () => {
      req.body = { email: "test@example.com" }; // missing newPassword

      await authController.resetPassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Email and new password are required",
      });
    });

    it("should return 400 if new password is too short", async () => {
      req.body = {
        email: "test@example.com",
        newPassword: "12345", // too short
      };

      await authController.resetPassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Password must be at least 6 characters",
      });
    });

    it("should handle service errors", async () => {
      req.body = {
        email: "test@example.com",
        newPassword: "newpassword123",
      };

      const error = new Error("User not found");
      authService.resetPassword.mockRejectedValue(error);

      await authController.resetPassword(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      req.body = {
        oldPassword: "oldpassword123",
        newPassword: "newpassword123",
      };
      req.user = { userId: "1" };

      const mockResult = {
        success: true,
        message: "Password changed successfully",
      };

      authService.changePassword.mockResolvedValue(mockResult);

      await authController.changePassword(req, res, next);

      expect(authService.changePassword).toHaveBeenCalledWith(
        "1",
        "oldpassword123",
        "newpassword123"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("should return 400 if oldPassword or newPassword is missing", async () => {
      req.body = { oldPassword: "oldpassword123" }; // missing newPassword
      req.user = { userId: "1" };

      await authController.changePassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Old password and new password are required",
      });
    });

    it("should return 400 if new password is too short", async () => {
      req.body = {
        oldPassword: "oldpassword123",
        newPassword: "12345", // too short
      };
      req.user = { userId: "1" };

      await authController.changePassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Password must be at least 6 characters",
      });
    });

    it("should handle service errors", async () => {
      req.body = {
        oldPassword: "wrongpassword",
        newPassword: "newpassword123",
      };
      req.user = { userId: "1" };

      const error = new Error("Old password is incorrect");
      authService.changePassword.mockRejectedValue(error);

      await authController.changePassword(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Old password is incorrect",
      });
    });
  });

  describe("getCurrentUser", () => {
    it("should return current user info", async () => {
      req.user = {
        userId: "1",
        email: "test@example.com",
        role: "staff",
      };

      await authController.getCurrentUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: req.user,
      });
    });

    it("should handle errors", async () => {
      req.user = { userId: "1" };
      res.status.mockImplementationOnce(() => {
        throw new Error("Unexpected error");
      });

      await authController.getCurrentUser(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("requestPasswordReset", () => {
    it("should return 400 if identifier is missing", async () => {
      req.body = {}; // missing identifier

      await authController.requestPasswordReset(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Email is required",
      });
    });
  });
});
