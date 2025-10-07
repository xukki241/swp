import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import {
  users,
  userCredentials,
  userRegistrations,
} from "../db/schema/index.js";

/**
 * Get all registration requests (User Story 2)
 * @param {string} status - Filter by status (pending, approved, rejected)
 * @returns {Promise<Array>} List of registration requests
 */
export const getAllRegistrations = async (status = null) => {
  try {
    let query = db.select().from(userRegistrations);

    if (status) {
      query = query.where(eq(userRegistrations.status, status));
    }

    const registrations = await query;
    return registrations;
  } catch (error) {
    throw new Error(`Failed to fetch registrations: ${error.message}`);
  }
};

/**
 * Get registration by ID
 * @param {bigint} id - Registration ID
 * @returns {Promise<Object|null>} Registration object or null
 */
export const getRegistrationById = async (id) => {
  try {
    const [registration] = await db
      .select()
      .from(userRegistrations)
      .where(eq(userRegistrations.id, id))
      .limit(1);

    return registration || null;
  } catch (error) {
    throw new Error(`Failed to fetch registration: ${error.message}`);
  }
};

/**
 * Approve registration request (User Story 2)
 * @param {bigint} registrationId - Registration ID
 * @param {string} password - Password for the new user
 * @param {string} role - Role to assign (staff, sales)
 * @returns {Promise<Object>} Approval result with created user
 */
export const approveRegistration = async (
  registrationId,
  password,
  role = "staff"
) => {
  try {
    // Get registration
    const [registration] = await db
      .select()
      .from(userRegistrations)
      .where(eq(userRegistrations.id, registrationId))
      .limit(1);

    if (!registration) {
      throw new Error("Registration not found");
    }

    if (registration.status !== "pending") {
      throw new Error(`Registration already ${registration.status}`);
    }

    // Check if email already exists in users
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, registration.email))
      .limit(1);

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name: registration.name,
        email: registration.email,
        phone: registration.phone,
        address: registration.address,
        role: role,
        status: "active",
      })
      .returning();

    // Hash password and create credentials
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.insert(userCredentials).values({
      userId: newUser.id,
      provider: "local",
      identifier: registration.email,
      secret: hashedPassword,
    });

    // Update registration status
    await db
      .update(userRegistrations)
      .set({ status: "approved" })
      .where(eq(userRegistrations.id, registrationId));

    return {
      success: true,
      message: "Registration approved and user created successfully",
      user: newUser,
    };
  } catch (error) {
    throw new Error(`Failed to approve registration: ${error.message}`);
  }
};

/**
 * Reject registration request (User Story 2)
 * @param {bigint} registrationId - Registration ID
 * @returns {Promise<Object>} Rejection result
 */
export const rejectRegistration = async (registrationId) => {
  try {
    // Get registration
    const [registration] = await db
      .select()
      .from(userRegistrations)
      .where(eq(userRegistrations.id, registrationId))
      .limit(1);

    if (!registration) {
      throw new Error("Registration not found");
    }

    if (registration.status !== "pending") {
      throw new Error(`Registration already ${registration.status}`);
    }

    // Update registration status
    const [updatedRegistration] = await db
      .update(userRegistrations)
      .set({ status: "rejected" })
      .where(eq(userRegistrations.id, registrationId))
      .returning();

    return {
      success: true,
      message: "Registration rejected successfully",
      registration: updatedRegistration,
    };
  } catch (error) {
    throw new Error(`Failed to reject registration: ${error.message}`);
  }
};

/**
 * Delete registration request
 * @param {bigint} registrationId - Registration ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteRegistration = async (registrationId) => {
  try {
    const [deleted] = await db
      .delete(userRegistrations)
      .where(eq(userRegistrations.id, registrationId))
      .returning();

    if (!deleted) {
      throw new Error("Registration not found");
    }

    return {
      success: true,
      message: "Registration deleted successfully",
      registration: deleted,
    };
  } catch (error) {
    throw new Error(`Failed to delete registration: ${error.message}`);
  }
};
