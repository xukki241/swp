import userService from "../services/users.service.js";

import { crudControllerFactory } from "./common/index.js";

/**
 * Transform response to exclude sensitive data
 */
const transformResponse = user => {
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

/**
 * Create user controller with CRUD operations
 */
const userController = crudControllerFactory(userService, {
  entityName: "User",
  allowedSortFields: ["id", "name", "email", "phone", "status", "roleId"],
  transformResponse,
});

/**
 * Additional user-specific controller methods
 */

/**
 * Get user by email
 * GET /users/email/:email
 */
userController.getByEmail = async (request, res) => {
  try {
    const { email } = request.params;

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
userController.updateStatus = async (request, res) => {
  try {
    const { id } = request.params;
    const { status } = request.body;

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
userController.getByRole = async (request, res) => {
  try {
    const { roleId } = request.params;
    const queryParameters = request.query;

    // Convert roleId to number and set defaults for pagination
    const roleIdNumber = Number.parseInt(roleId, 10);
    const page = Number.parseInt(queryParameters.page, 10) || 1;
    const limit = Number.parseInt(queryParameters.limit, 10) || 10;
    const orderBy = queryParameters.orderBy || "name";
    const orderDirection = queryParameters.orderDirection || "asc";

    const result = await userService.findMany({
      where: { roleId: roleIdNumber },
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
userController.getActive = async (request, res) => {
  try {
    const queryParameters = request.query;

    // Set defaults for pagination and search
    const page = Number.parseInt(queryParameters.page, 10) || 1;
    const limit = Number.parseInt(queryParameters.limit, 10) || 10;
    const search = queryParameters.search || "";
    const orderBy = queryParameters.orderBy || "name";
    const orderDirection = queryParameters.orderDirection || "asc";

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
userController.bulkCreate = async (request, res) => {
  try {
    const { users } = request.body;

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
    for (const [index, userData] of users.entries()) {
      try {
        const created = await userService.create(userData);
        const responseData = transformResponse(created);
        results.push(responseData);
      } catch (error) {
        // If all previous attempts failed, this might be a system error
        if (results.length === 0 && errors.length === index) {
          // All attempts have failed so far, this could be a system error
          throw error;
        }
        errors.push({
          index,
          error: error.message,
          data: userData,
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
