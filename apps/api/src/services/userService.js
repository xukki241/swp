import { eq, ilike, or, and } from "drizzle-orm";

import { db } from "../db/index.js";
import { users } from "../db/schema/index.js";

/**
 * Get all users with optional search
 * @param {Object} options - Query options
 * @param {string} options.search - Search term for name, email, or phone
 * @returns {Promise<Array>} List of users
 */
export const getAllUsers = async ({ search } = {}) => {
  try {
    let query = db.select().from(users);

    if (search) {
      query = query.where(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.phone, `%${search}%`)
        )
      );
    }

    const result = await query;
    return result;
  } catch (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
};

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null
 */
export const getUserById = async (id) => {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
};

/**
 * Create a new user
 * @param {Object} userData - User data
 * @param {string} userData.name - User name
 * @param {string} userData.email - User email
 * @param {string} userData.phone - User phone
 * @param {string} userData.address - User address
 * @param {string} userData.role - User role (admin, manager, staff)
 * @param {string} userData.status - User status (active, inactive, suspended)
 * @returns {Promise<Object>} Created user
 */
export const createUser = async (userData) => {
  try {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  } catch (error) {
    if (error.code === "23505") {
      // Unique violation
      throw new Error("User with this email or phone already exists");
    }
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

/**
 * Update user by ID
 * @param {number} id - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object|null>} Updated user or null
 */
export const updateUser = async (id, userData) => {
  try {
    const result = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();

    return result[0] || null;
  } catch (error) {
    if (error.code === "23505") {
      // Unique violation
      throw new Error("User with this email or phone already exists");
    }
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

/**
 * Delete user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} Deleted user or null
 */
export const deleteUser = async (id) => {
  try {
    const result = await db.delete(users).where(eq(users.id, id)).returning();

    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
};

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null
 */
export const getUserByEmail = async (email) => {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to fetch user by email: ${error.message}`);
  }
};

/**
 * Get user by phone
 * @param {string} phone - User phone
 * @returns {Promise<Object|null>} User object or null
 */
export const getUserByPhone = async (phone) => {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to fetch user by phone: ${error.message}`);
  }
};

/**
 * Get all staff accounts (User Story 6)
 * @param {Object} options - Query options
 * @param {string} options.search - Search term for name, email, or phone
 * @param {string} options.role - Filter by role
 * @param {string} options.status - Filter by status
 * @returns {Promise<Array>} List of staff users
 */
export const getAllStaff = async ({ search, role, status } = {}) => {
  try {
    let query = db.select().from(users);

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.phone, `%${search}%`)
        )
      );
    }

    if (role) {
      conditions.push(eq(users.role, role));
    }

    if (status) {
      conditions.push(eq(users.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(
        conditions.length === 1 ? conditions[0] : and(...conditions)
      );
    }

    const result = await query;
    return result;
  } catch (error) {
    throw new Error(`Failed to fetch staff: ${error.message}`);
  }
};

/**
 * Activate user account (User Story 8)
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} Updated user or null
 */
export const activateUser = async (id) => {
  try {
    const result = await db
      .update(users)
      .set({ status: "active" })
      .where(eq(users.id, id))
      .returning();

    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to activate user: ${error.message}`);
  }
};

/**
 * Deactivate user account (User Story 8)
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} Updated user or null
 */
export const deactivateUser = async (id) => {
  try {
    const result = await db
      .update(users)
      .set({ status: "inactive" })
      .where(eq(users.id, id))
      .returning();

    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to deactivate user: ${error.message}`);
  }
};

/**
 * Suspend user account (User Story 8)
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} Updated user or null
 */
export const suspendUser = async (id) => {
  try {
    const result = await db
      .update(users)
      .set({ status: "suspended" })
      .where(eq(users.id, id))
      .returning();

    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to suspend user: ${error.message}`);
  }
};
