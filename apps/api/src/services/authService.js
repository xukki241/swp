import bcrypt from "bcryptjs";
import { eq, count } from "drizzle-orm";
import jwt from "jsonwebtoken";

import config from "../config/environment.js";
import { db } from "../db/index.js";
import {
  users,
  userCredentials,
  userRegistrations,
} from "../db/schema/index.js";

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
      throw new Error("Email already has a pending registration");
    }

    // Check if phone exists in pending registrations
    const existingPhoneRegistration = await db
      .select()
      .from(userRegistrations)
      .where(eq(userRegistrations.phone, phone))
      .limit(1);

    if (existingPhoneRegistration.length > 0) {
      throw new Error("Phone number already has a pending registration");
    }

    // Check if this is the first user
    const userCount = await db.select({ count: count() }).from(users);
    const isFirstUser = userCount[0].count === 0;

    if (isFirstUser) {
      // First user becomes owner automatically
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
      const [registration] = await db
        .insert(userRegistrations)
        .values({
          name,
          email,
          phone,
          address,
          status: "pending",
        })
        .returning();

      // Note: Password will be set when approved
      // Store password temporarily (in real app, send via email or set during approval)
      const hashedPassword = await bcrypt.hash(password, 10);

      return {
        success: true,
        message: "Registration request submitted. Waiting for owner approval.",
        registration,
        isOwner: false,
        tempPassword: hashedPassword, // Store this somewhere safe or send via email
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
 * @returns {Promise<Object>} Login result with token
 */
export const login = async (email, password) => {
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

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id.toString(),
        email: user.email,
        role: user.role,
      },
      config.jwtSecret || "your-secret-key",
      { expiresIn: "24h" }
    );

    return {
      success: true,
      message: "Login successful",
      token,
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
 * @param {bigint} userId - User ID
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
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
