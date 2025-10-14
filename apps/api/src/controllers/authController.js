import * as authService from "../services/authService.js";
import logger from "../utils/logger.js";

/**
 * Register new user (User Story 1)
 * @route POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, phone, address, password } = req.body;

    // Validation
    if (!name || !email || !phone || !address || !password) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required (name, email, phone, address, password)",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate phone (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone must be 10 digits",
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const result = await authService.register({
      name,
      email,
      phone,
      address,
      password,
    });

    res.status(201).json(result);
  } catch (error) {
    logger.error("Error in register controller:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Login user (User Story 3)
 * @route POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await authService.login(email, password);

    res.status(200).json(result);
  } catch (error) {
    logger.error("Error in login controller:", error);
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Logout user (User Story 4)
 * @route POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    // In JWT-based auth, logout is handled client-side by removing the token
    // Server can optionally maintain a blacklist of tokens
    res.status(200).json({
      success: true,
      message: "Logout successful. Please remove the token from client.",
    });
  } catch (error) {
    logger.error("Error in logout controller:", error);
    next(error);
  }
};

/**
 * Reset password (User Story 5)
 * @route POST /api/auth/reset-password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    // Validation
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const result = await authService.resetPassword(email, newPassword);

    res.status(200).json(result);
  } catch (error) {
    logger.error("Error in resetPassword controller:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Change password (for logged-in users)
 * @route POST /api/auth/change-password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.userId; // From auth middleware

    // Validation
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const result = await authService.changePassword(
      userId, // UUID is a string
      oldPassword,
      newPassword
    );

    res.status(200).json(result);
  } catch (error) {
    logger.error("Error in changePassword controller:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get current user info
 * @route GET /api/auth/me
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    // User info is already in req.user from auth middleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    logger.error("Error in getCurrentUser controller:", error);
    next(error);
  }
};

/**
 * Request password reset OTP (Forgot Password Step 1)
 * @route POST /api/auth/forgot-password
 */
export const requestPasswordReset = async (req, res, next) => {
  try {
    const { identifier } = req.body;

    // Validation
    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Only support email now (SMS removed)
    const result = await authService.requestPasswordReset(identifier, "email");

    res.status(200).json(result);
  } catch (error) {
    logger.error("Error in requestPasswordReset controller:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Verify OTP and reset password (Forgot Password Step 2)
 * @route POST /api/auth/verify-reset-otp
 */
export const verifyOTPAndResetPassword = async (req, res, next) => {
  try {
    const { identifier, otp, newPassword, method } = req.body;

    // Validation
    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be 6 digits",
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Only support email now (SMS removed)
    const result = await authService.verifyOTPAndResetPassword(
      identifier,
      otp,
      newPassword,
      "email"
    );

    res.status(200).json(result);
  } catch (error) {
    logger.error("Error in verifyOTPAndResetPassword controller:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
