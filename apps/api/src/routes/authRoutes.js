import express from "express";

import * as authController from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (first user becomes owner, others create registration request)
 * @access  Public
 * @body    { name, email, phone, address, password }
 */
router.post("/register", authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 * @body    { email, password }
 */
router.post("/login", authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Public
 */
router.post("/logout", authController.logout);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password for forgotten password
 * @access  Public
 * @body    { email, newPassword }
 */
router.post("/reset-password", authController.resetPassword);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password for logged-in user
 * @access  Private
 * @body    { oldPassword, newPassword }
 */
router.post("/change-password", authenticate, authController.changePassword);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get("/me", authenticate, authController.getCurrentUser);

export default router;
