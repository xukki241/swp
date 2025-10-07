import * as userService from "../services/userService.js";
import { convertBigIntIds } from "../utils/bigint.js";
import logger from "../utils/logger.js";

/**
 * Get all users
 * @route GET /api/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const users = await userService.getAllUsers({ search });

    res.status(200).json({
      success: true,
      count: users.length,
      data: convertBigIntIds(users),
    });
  } catch (error) {
    logger.error("Error in getAllUsers controller:", error);
    next(error);
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 */
export const getUserById = async (req, res, next) => {
  try {
    const id = BigInt(req.params.id);
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: convertBigIntIds(user),
    });
  } catch (error) {
    logger.error("Error in getUserById controller:", error);
    next(error);
  }
};

/**
 * Create a new user
 * @route POST /api/users
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, email, phone, address, role, status } = req.body;

    // Validation
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and phone are required",
      });
    }

    // Check if email already exists
    const existingUserByEmail = await userService.getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Check if phone already exists
    const existingUserByPhone = await userService.getUserByPhone(phone);
    if (existingUserByPhone) {
      return res.status(409).json({
        success: false,
        message: "User with this phone already exists",
      });
    }

    const userData = {
      name,
      email,
      phone,
      address: address || null,
      role: role || "staff",
      status: status || "active",
    };

    const user = await userService.createUser(userData);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: convertBigIntIds(user),
    });
  } catch (error) {
    logger.error("Error in createUser controller:", error);
    next(error);
  }
};

/**
 * Update user by ID
 * @route PUT /api/users/:id
 */
export const updateUser = async (req, res, next) => {
  try {
    const id = BigInt(req.params.id);
    const { name, email, phone, address, role, status } = req.body;

    // Check if user exists
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if email is being changed and already exists
    if (email && email !== existingUser.email) {
      const existingUserByEmail = await userService.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
      }
    }

    // Check if phone is being changed and already exists
    if (phone && phone !== existingUser.phone) {
      const existingUserByPhone = await userService.getUserByPhone(phone);
      if (existingUserByPhone) {
        return res.status(409).json({
          success: false,
          message: "User with this phone already exists",
        });
      }
    }

    const userData = {};
    if (name !== undefined) {
      userData.name = name;
    }
    if (email !== undefined) {
      userData.email = email;
    }
    if (phone !== undefined) {
      userData.phone = phone;
    }
    if (address !== undefined) {
      userData.address = address;
    }
    if (role !== undefined) {
      userData.role = role;
    }
    if (status !== undefined) {
      userData.status = status;
    }

    const user = await userService.updateUser(id, userData);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: convertBigIntIds(user),
    });
  } catch (error) {
    logger.error("Error in updateUser controller:", error);
    next(error);
  }
};

/**
 * Delete user by ID
 * @route DELETE /api/users/:id
 */
export const deleteUser = async (req, res, next) => {
  try {
    const id = BigInt(req.params.id);

    const user = await userService.deleteUser(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: convertBigIntIds(user),
    });
  } catch (error) {
    logger.error("Error in deleteUser controller:", error);
    next(error);
  }
};

/**
 * Get all staff accounts (User Story 6)
 * @route GET /api/users/staff
 */
export const getAllStaff = async (req, res, next) => {
  try {
    const { search, role, status } = req.query;
    const staff = await userService.getAllStaff({ search, role, status });

    res.status(200).json({
      success: true,
      count: staff.length,
      data: convertBigIntIds(staff),
    });
  } catch (error) {
    logger.error("Error in getAllStaff controller:", error);
    next(error);
  }
};

/**
 * Activate user account (User Story 8)
 * @route PATCH /api/users/:id/activate
 */
export const activateUser = async (req, res, next) => {
  try {
    const id = BigInt(req.params.id);

    const user = await userService.activateUser(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User activated successfully",
      data: convertBigIntIds(user),
    });
  } catch (error) {
    logger.error("Error in activateUser controller:", error);
    next(error);
  }
};

/**
 * Deactivate user account (User Story 8)
 * @route PATCH /api/users/:id/deactivate
 */
export const deactivateUser = async (req, res, next) => {
  try {
    const id = BigInt(req.params.id);

    const user = await userService.deactivateUser(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      data: convertBigIntIds(user),
    });
  } catch (error) {
    logger.error("Error in deactivateUser controller:", error);
    next(error);
  }
};

/**
 * Suspend user account (User Story 8)
 * @route PATCH /api/users/:id/suspend
 */
export const suspendUser = async (req, res, next) => {
  try {
    const id = BigInt(req.params.id);

    const user = await userService.suspendUser(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User suspended successfully",
      data: convertBigIntIds(user),
    });
  } catch (error) {
    logger.error("Error in suspendUser controller:", error);
    next(error);
  }
};
