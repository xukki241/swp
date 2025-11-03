import bcrypt from "bcryptjs";
import crypto from "crypto";
import { and, count, eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

import config from "../config/environment.js";
import { db } from "../db/index.js";
import {
  passwordResetTokens,
  refreshTokens,
  userCredentials,
  userRegistrations,
  users,
} from "../db/schema/index.js";
import { sendOTPEmail } from "../utils/email.js";
import { generateOTP, getOTPExpiration, isOTPExpired } from "../utils/otp.js";

/**
 * Register a new user (User Story 1)
 * First user becomes owner, subsequent users create registration requests
 * @param {Object} registrationData - Registration data
 * @returns {Promise<Object>} Registration result
 */
export const register = async ({ name, email, phone, address, password }) => {
  try {
    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("Email already registered");
    }

    // Check if phone already exists
    const existingPhone = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    if (existingPhone.length > 0) {
      throw new Error("Phone number already registered");
    }

    // Check if email exists in pending registrations
    const existingRegistration = await db
      .select()
      .from(userRegistrations)
      .where(eq(userRegistrations.email, email))
      .limit(1);

    if (existingRegistration.length > 0) {
      const status = existingRegistration[0].status;
      if (status === "pending") {
        throw new Error("Email already has a pending registration");
      } else if (status === "approved") {
        throw new Error("Email already registered");
      }
      // If status is "rejected", allow re-registration by deleting old record
      if (status === "rejected") {
        await db
          .delete(userRegistrations)
          .where(eq(userRegistrations.id, existingRegistration[0].id));
      }
    }

    // Check if phone exists in pending registrations
    const existingPhoneRegistration = await db
      .select()
      .from(userRegistrations)
      .where(eq(userRegistrations.phone, phone))
      .limit(1);

    if (existingPhoneRegistration.length > 0) {
      const status = existingPhoneRegistration[0].status;
      if (status === "pending") {
        throw new Error("Phone number already has a pending registration");
      } else if (status === "approved") {
        throw new Error("Phone number already registered");
      }
      // If status is "rejected", allow re-registration by deleting old record
      if (status === "rejected") {
        await db
          .delete(userRegistrations)
          .where(eq(userRegistrations.id, existingPhoneRegistration[0].id));
      }
    }

    // Check if this is the first active user (becomes owner/admin)
    const activeUserCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.status, "active"));
    const isFirstActiveUser = activeUserCount[0].count === 0;

    if (isFirstActiveUser) {
      // First active user becomes owner automatically
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          name,
          email,
          phone,
          address,
          role: "owner",
          status: "active",
        })
        .returning();

      // Create credentials
      await db.insert(userCredentials).values({
        userId: newUser.id,
        provider: "local",
        identifier: email,
        secret: hashedPassword,
      });

      return {
        success: true,
        message: "Owner account created successfully",
        user: newUser,
        isOwner: true,
      };
    } else {
      // Create registration request for staff
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(password, 10);

      const [registration] = await db
        .insert(userRegistrations)
        .values({
          name,
          email,
          phone,
          address,
          password: hashedPassword,
          status: "pending",
        })
        .returning();

      return {
        success: true,
        message: "Registration request submitted. Waiting for owner approval.",
        registration: {
          id: registration.id.toString(),
          name: registration.name,
          email: registration.email,
          phone: registration.phone,
          address: registration.address,
          status: registration.status,
        },
        isOwner: false,
      };
    }
  } catch (error) {
    throw new Error(`Registration failed: ${error.message}`);
  }
};

/**
 * Login user (User Story 3)
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} options - Additional options (deviceInfo, ipAddress)
 * @returns {Promise<Object>} Login result with token
 */
export const login = async (email, password, options = {}) => {
  try {
    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check if user is active
    if (user.status !== "active") {
      throw new Error(
        `Account is ${user.status}. Please contact administrator.`
      );
    }

    // Get user credentials
    const [credentials] = await db
      .select()
      .from(userCredentials)
      .where(eq(userCredentials.userId, user.id))
      .limit(1);

    if (!credentials) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, credentials.secret);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT tokens
    // Access token: short-lived (15 minutes)
    const accessToken = jwt.sign(
      {
        userId: user.id.toString(),
        email: user.email,
        role: user.role,
        type: "access",
      },
      config.jwtSecret || "your-secret-key",
      { expiresIn: "15m" }
    );

    // Refresh token: long-lived (7 days)
    // Generate a random token string
    const refreshTokenString = crypto.randomBytes(40).toString("hex");

    // Create JWT with the random token
    const refreshToken = jwt.sign(
      {
        userId: user.id.toString(),
        email: user.email,
        token: refreshTokenString,
        type: "refresh",
      },
      config.jwtSecret || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Hash the refresh token before storing in DB
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshTokenString)
      .digest("hex");

    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save refresh token to database
    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
      deviceInfo: options.deviceInfo || null,
      ipAddress: options.ipAddress || null,
      isRevoked: false,
    });

    return {
      success: true,
      message: "Login successful",
      token: accessToken, // Keep as 'token' for backward compatibility
      accessToken,
      refreshToken,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    };
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
};

/**
 * Reset password (User Story 5)
 * @param {string} email - User email
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Reset result
 */
export const resetPassword = async (email, newPassword) => {
  try {
    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    // Get user credentials
    const [credentials] = await db
      .select()
      .from(userCredentials)
      .where(eq(userCredentials.userId, user.id))
      .limit(1);

    if (!credentials) {
      throw new Error("User credentials not found");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .update(userCredentials)
      .set({ secret: hashedPassword })
      .where(eq(userCredentials.userId, user.id));

    return {
      success: true,
      message: "Password reset successfully",
    };
  } catch (error) {
    throw new Error(`Password reset failed: ${error.message}`);
  }
};

/**
 * Change password (for logged-in users)
 * @param {number} userId - User ID
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Change result
 */
export const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    // Get user credentials
    const [credentials] = await db
      .select()
      .from(userCredentials)
      .where(eq(userCredentials.userId, userId))
      .limit(1);

    if (!credentials) {
      throw new Error("User credentials not found");
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      credentials.secret
    );

    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .update(userCredentials)
      .set({ secret: hashedPassword })
      .where(eq(userCredentials.userId, userId));

    return {
      success: true,
      message: "Password changed successfully",
    };
  } catch (error) {
    throw new Error(`Password change failed: ${error.message}`);
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Decoded token
 */
export const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret || "your-secret-key");
    return decoded;
  } catch {
    throw new Error("Invalid or expired token");
  }
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token (JWT)
 * @returns {Promise<Object>} New access token
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    // Verify refresh token JWT
    const decoded = jwt.verify(
      refreshToken,
      config.jwtSecret || "your-secret-key"
    );

    // Check if token type is refresh
    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    // Hash the token string to compare with DB
    const tokenHash = crypto
      .createHash("sha256")
      .update(decoded.token)
      .digest("hex");

    // Check if refresh token exists in database and is valid
    const [storedToken] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, parseInt(decoded.userId)),
          eq(refreshTokens.tokenHash, tokenHash)
        )
      )
      .limit(1);

    if (!storedToken) {
      throw new Error("Invalid refresh token");
    }

    // Check if token is revoked
    if (storedToken.isRevoked) {
      throw new Error("Refresh token has been revoked");
    }

    // Check if token is expired
    if (new Date() > new Date(storedToken.expiresAt)) {
      throw new Error("Refresh token has expired");
    }

    // Get user to verify they still exist and are active
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(decoded.userId)))
      .limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.status !== "active") {
      throw new Error("Account is not active");
    }

    // Update lastUsedAt timestamp
    await db
      .update(refreshTokens)
      .set({ lastUsedAt: new Date() })
      .where(eq(refreshTokens.id, storedToken.id));

    // Generate new access token
    const accessToken = jwt.sign(
      {
        userId: user.id.toString(),
        email: user.email,
        role: user.role,
        type: "access",
      },
      config.jwtSecret || "your-secret-key",
      { expiresIn: "15m" }
    );

    return {
      success: true,
      message: "Token refreshed successfully",
      token: accessToken,
      accessToken,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    };
  } catch (error) {
    throw new Error(`Token refresh failed: ${error.message}`);
  }
};

/**
 * Revoke refresh token (logout)
 * @param {string} refreshToken - Refresh token to revoke
 * @returns {Promise<Object>} Revoke result
 */
export const revokeRefreshToken = async (refreshToken) => {
  try {
    // Verify and decode the refresh token
    const decoded = jwt.verify(
      refreshToken,
      config.jwtSecret || "your-secret-key"
    );

    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    // Hash the token to find it in DB
    const tokenHash = crypto
      .createHash("sha256")
      .update(decoded.token)
      .digest("hex");

    // Mark token as revoked
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(
        and(
          eq(refreshTokens.userId, parseInt(decoded.userId)),
          eq(refreshTokens.tokenHash, tokenHash)
        )
      );

    return {
      success: true,
      message: "Refresh token revoked successfully",
    };
  } catch (error) {
    // Even if revoke fails, we can still proceed with logout on client side
    console.error("Error revoking refresh token:", error);
    return {
      success: true,
      message: "Logout successful",
    };
  }
};

/**
 * Revoke all refresh tokens for a user (logout from all devices)
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Revoke result
 */
export const revokeAllRefreshTokens = async (userId) => {
  try {
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.userId, userId));

    return {
      success: true,
      message: "All refresh tokens revoked successfully",
    };
  } catch (error) {
    throw new Error(`Failed to revoke all tokens: ${error.message}`);
  }
};

/**
 * Request password reset OTP (Forgot Password Step 1)
 * @param {string} identifier - Email or phone number
 * @param {string} _method - 'email' or 'sms'
 * @returns {Promise<Object>} Request result
 */
export const requestPasswordReset = async (identifier, _method = "email") => {
  try {
    // Find user by email only (SMS removed)
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, identifier))
      .limit(1);

    if (!user) {
      // Don't reveal if user exists or not (security)
      return {
        success: true,
        message:
          "If an account exists with this email, you will receive an OTP.",
      };
    }

    // Check if user is active
    if (user.status !== "active") {
      throw new Error(
        `Account is ${user.status}. Please contact administrator.`
      );
    }

    // Invalidate all previous OTP tokens for this user
    await db
      .update(passwordResetTokens)
      .set({ isUsed: true })
      .where(
        and(
          eq(passwordResetTokens.userId, user.id),
          eq(passwordResetTokens.isUsed, false)
        )
      );

    // Generate OTP
    const otp = generateOTP(6);
    const expiresAt = getOTPExpiration(10); // 10 minutes

    // Save OTP to database
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token: otp,
      method: "email",
      expiresAt: expiresAt,
      isUsed: false,
    });

    // Send OTP via email only
    await sendOTPEmail(identifier, otp);

    return {
      success: true,
      message: "OTP sent successfully via email",
      expiresIn: "10 minutes",
    };
  } catch (error) {
    throw new Error(`Failed to request password reset: ${error.message}`);
  }
};

/**
 * Verify OTP and reset password (Forgot Password Step 2)
 * @param {string} identifier - Email or phone number
 * @param {string} otp - One-time password
 * @param {string} newPassword - New password
 * @param {string} _method - 'email' or 'sms'
 * @returns {Promise<Object>} Reset result
 */
export const verifyOTPAndResetPassword = async (
  identifier,
  otp,
  newPassword,
  _method = "email"
) => {
  try {
    // Find user by email only (SMS removed)
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, identifier))
      .limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    // Find valid OTP token
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.userId, user.id),
          eq(passwordResetTokens.token, otp),
          eq(passwordResetTokens.method, "email"),
          eq(passwordResetTokens.isUsed, false)
        )
      )
      .orderBy(passwordResetTokens.createdAt)
      .limit(1);

    if (!resetToken) {
      throw new Error("Invalid OTP");
    }

    // Check if OTP is expired
    if (isOTPExpired(resetToken.expiresAt)) {
      // Mark as used
      await db
        .update(passwordResetTokens)
        .set({ isUsed: true })
        .where(eq(passwordResetTokens.id, resetToken.id));

      throw new Error("OTP has expired");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .update(userCredentials)
      .set({ secret: hashedPassword })
      .where(eq(userCredentials.userId, user.id));

    // Mark OTP as used
    await db
      .update(passwordResetTokens)
      .set({ isUsed: true })
      .where(eq(passwordResetTokens.id, resetToken.id));

    return {
      success: true,
      message: "Password reset successfully",
    };
  } catch (error) {
    throw new Error(`Failed to reset password: ${error.message}`);
  }
};
