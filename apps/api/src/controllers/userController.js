import * as userService from "../services/userService.js";
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
      data: users,
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
    const id = req.params.id; // UUID is a string
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
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
      data: user,
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
    const id = req.params.id; // UUID is a string
    const currentUserId = req.user.userId; // UUID is a string
    const { name, email, phone, address, role, status } = req.body;

    // Check if user exists
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent changing own role
    if (
      id === currentUserId &&
      role !== undefined &&
      role !== existingUser.role
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    // Prevent changing own status
    if (
      id === currentUserId &&
      status !== undefined &&
      status !== existingUser.status
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own status",
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
      data: user,
    });
  } catch (error) {
    logger.error("Error in updateUser controller:", error);
    next(error);
  }
};

/**
 * Delete user by ID (Soft delete - sets status to suspended)
 * @route DELETE /api/users/:id
 */
export const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id; // UUID is a string
    const currentUserId = req.user.userId; // UUID is a string

    // Prevent deleting self
    if (id === currentUserId) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Soft delete: suspend the user instead of hard delete
    const user = await userService.suspendUser(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted (suspended) successfully",
      data: user,
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
      data: staff,
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
    const id = req.params.id; // UUID is a string

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
      data: user,
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
    const id = req.params.id; // UUID is a string
    const currentUserId = req.user.userId; // UUID is a string

    // Prevent deactivating self
    if (id === currentUserId) {
      return res.status(403).json({
        success: false,
        message: "You cannot deactivate your own account",
      });
    }

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
      data: user,
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
    const id = req.params.id; // UUID is a string
    const currentUserId = req.user.userId; // UUID is a string

    // Prevent suspending self
    if (id === currentUserId) {
      return res.status(403).json({
        success: false,
        message: "You cannot suspend your own account",
      });
    }

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
      data: user,
    });
  } catch (error) {
    logger.error("Error in suspendUser controller:", error);
    next(error);
  }
};
