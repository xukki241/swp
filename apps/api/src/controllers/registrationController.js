import * as registrationService from "../services/registrationService.js";
import logger from "../utils/logger.js";

/**
 * Get all registration requests (User Story 2)
 * @route GET /api/registrations
 */
export const getAllRegistrations = async (req, res, next) => {
  try {
    const { status } = req.query;

    const registrations = await registrationService.getAllRegistrations(status);

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    logger.error("Error in getAllRegistrations controller:", error);
    next(error);
  }
};

/**
 * Get registration by ID
 * @route GET /api/registrations/:id
 */
export const getRegistrationById = async (req, res, next) => {
  try {
    const id = req.params.id; // UUID is a string

    const registration = await registrationService.getRegistrationById(id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    logger.error("Error in getRegistrationById controller:", error);
    next(error);
  }
};

/**
 * Approve registration request (User Story 2)
 * @route POST /api/registrations/:id/approve
 */
export const approveRegistration = async (req, res, _next) => {
  try {
    const id = req.params.id; // UUID is a string
    const { role } = req.body;

    // Validate role
    const validRoles = ["staff", "sales"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'staff' or 'sales'",
      });
    }

    const result = await registrationService.approveRegistration(
      id,
      role || "staff"
    );

    res.status(200).json(result);
  } catch (error) {
    logger.error("Error in approveRegistration controller:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Reject registration request (User Story 2)
 * @route POST /api/registrations/:id/reject
 */
export const rejectRegistration = async (req, res, _next) => {
  try {
    const id = req.params.id; // UUID is a string

    const result = await registrationService.rejectRegistration(id);

    res.status(200).json(result);
  } catch (error) {
    logger.error("Error in rejectRegistration controller:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete registration request
 * @route DELETE /api/registrations/:id
 */
export const deleteRegistration = async (req, res, _next) => {
  try {
    const id = req.params.id; // UUID is a string

    const result = await registrationService.deleteRegistration(id);

    res.status(200).json(result);
  } catch (error) {
    logger.error("Error in deleteRegistration controller:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
