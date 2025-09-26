import { crudControllerFactory } from "../common/index.js";
import userService from "../services/users.service.js";
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  getUserByEmailParamsSchema,
  getUserByRoleParamsSchema,
  getUsersQuerySchema,
  userResponseSchema,
} from "../validation/schemas/users.js";

/**
 * Transform response to exclude sensitive data using Zod schema
 */
const transformResponse = (user) => {
  try {
    return userResponseSchema.parse(user);
  } catch (error) {
    // Fallback to manual exclusion if schema parsing fails
    const { password, ...safeUser } = user;
    return safeUser;
  }
};

/**
 * Zod validation functions for CRUD factory
 */
const validateCreate = (data) => {
  try {
    createUserSchema.parse(data);
    return null; // No error
  } catch (error) {
    return error.errors.map((err) => err.message).join(", ");
  }
};

const validateUpdate = (data) => {
  try {
    updateUserSchema.parse(data);
    return null; // No error
  } catch (error) {
    return error.errors.map((err) => err.message).join(", ");
  }
};

/**
 * Create user controller with CRUD operations
 */
const userController = crudControllerFactory(userService, {
  entityName: "User",
  allowedSortFields: ["id", "name", "email", "phone", "status", "roleId"],
  validateCreate,
  validateUpdate,
  transformResponse,
});

/**
 * Additional user-specific controller methods
 */

/**
 * Get user by email
 * GET /users/email/:email
 */
userController.getByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Validate email parameter using Zod
    try {
      getUserByEmailParamsSchema.parse({ email });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Invalid email parameter",
        details: error.errors.map((err) => err.message),
      });
    }

    const user = await userService.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Not found",
        message: `User with email ${email} not found`,
      });
    }

    // Transform response to exclude sensitive data
    const responseData = transformResponse(user);

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error getting user by email:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to get user",
    });
  }
};

/**
 * Update user status
 * PATCH /users/:id/status
 */
userController.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate ID parameter
    if (!id || !/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID",
        message: "ID must be a valid number",
      });
    }

    // Validate status using Zod
    try {
      updateUserStatusSchema.parse({ status });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Invalid status",
        details: error.errors.map((err) => err.message),
      });
    }

    const updated = await userService.updateById(id, { status });

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Not found",
        message: `User with ID ${id} not found`,
      });
    }

    // Transform response to exclude sensitive data
    const responseData = transformResponse(updated);

    res.json({
      success: true,
      data: responseData,
      message: "User status updated successfully",
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to update user status",
    });
  }
};

/**
 * Get users by role
 * GET /users/role/:roleId
 */
userController.getByRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    // Use validated query if available, otherwise fall back to raw query
    const queryParams = req.validatedQuery || req.query;

    let result;
    // Validate role ID parameter using Zod
    try {
      const validatedParams = getUserByRoleParamsSchema.parse({ roleId });
      const validatedQuery = getUsersQuerySchema.parse(queryParams);

      // Use validated and transformed values
      const roleIdNum = validatedParams.roleId;
      const { page, limit, orderBy, orderDirection } = validatedQuery;

      result = await userService.findMany({
        where: { roleId: roleIdNum },
        page,
        limit,
        orderBy,
        orderDirection,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Invalid parameters",
        details: error.errors?.map((err) => err.message) || [error.message],
      });
    }

    // Transform response data to exclude sensitive information
    const responseData = {
      ...result,
      data: result.data.map(transformResponse),
    };

    res.json({
      success: true,
      ...responseData,
    });
  } catch (error) {
    console.error("Error getting users by role:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to get users by role",
    });
  }
};

/**
 * Get active users
 * GET /users/active
 */
userController.getActive = async (req, res) => {
  try {
    // Use validated query if available, otherwise fall back to raw query
    const queryParams = req.validatedQuery || req.query;

    // Validate query parameters using Zod
    let validatedQuery;
    try {
      validatedQuery = getUsersQuerySchema.parse(queryParams);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Invalid query parameters",
        details: error.errors?.map((err) => err.message) || [error.message],
      });
    }

    const { page, limit, search, orderBy, orderDirection } = validatedQuery;

    const result = await userService.findMany({
      where: { status: "active" },
      search,
      page,
      limit,
      orderBy,
      orderDirection,
    });

    // Transform response data to exclude sensitive information
    const responseData = {
      ...result,
      data: result.data.map(transformResponse),
    };

    res.json({
      success: true,
      ...responseData,
    });
  } catch (error) {
    console.error("Error getting active users:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to get active users",
    });
  }
};

/**
 * Bulk create users
 * POST /users/bulk
 */
userController.bulkCreate = async (req, res) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid users array",
        message: "Users must be a non-empty array",
      });
    }

    const results = [];
    const errors = [];

    // Process each user
    for (let i = 0; i < users.length; i++) {
      try {
        const userData = users[i];

        // Validate user data
        try {
          validateCreate(userData);
        } catch (validationError) {
          errors.push({
            index: i,
            error: validationError,
            data: userData,
          });
          continue;
        }

        const created = await userService.create(userData);
        const responseData = transformResponse(created);
        results.push(responseData);
      } catch (error) {
        errors.push({
          index: i,
          error: error.message,
          data: users[i],
        });
      }
    }

    const response = {
      success: errors.length === 0,
      data: results,
      message: `Bulk create completed: ${results.length}/${users.length} users created`,
    };

    if (errors.length > 0) {
      response.errors = errors;
      response.message += ` (${errors.length} failed)`;
    }

    const statusCode = errors.length === 0 ? 201 : 207; // 207 Multi-Status
    res.status(statusCode).json(response);
  } catch (error) {
    console.error("Error bulk creating users:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to bulk create users",
    });
  }
};

export default userController;
