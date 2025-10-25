import express from "express";

import * as registrationController from "../controllers/registrationController.js";
import { createAuditLog } from "../middleware/auditLog.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

export const registrationRouter = express.Router();

// All registration routes require authentication and owner role

/**
 * @route   GET /api/registrations
 * @desc    Get all registration requests (owner only)
 * @access  Private (Owner)
 * @query   status - Filter by status (pending, approved, rejected)
 */
registrationRouter.get(
  "/",
  authenticate,
  authorize("owner"),
  registrationController.getAllRegistrations
);

/**
 * @route   GET /api/registrations/:id
 * @desc    Get registration by ID (owner only)
 * @access  Private (Owner)
 */
registrationRouter.get(
  "/:id",
  authenticate,
  authorize("owner"),
  registrationController.getRegistrationById
);

/**
 * @route   POST /api/registrations/:id/approve
 * @desc    Approve registration request and create user (owner only)
 * @access  Private (Owner)
 * @body    { password, role? }
 */
registrationRouter.post(
  "/:id/approve",
  authenticate,
  authorize("owner"),
  createAuditLog("APPROVE", "registration_request"),
  registrationController.approveRegistration
);

/**
 * @route   POST /api/registrations/:id/reject
 * @desc    Reject registration request (owner only)
 * @access  Private (Owner)
 */
registrationRouter.post(
  "/:id/reject",
  authenticate,
  authorize("owner"),
  createAuditLog("REJECT", "registration_request"),
  registrationController.rejectRegistration
);

/**
 * @route   DELETE /api/registrations/:id
 * @desc    Delete registration request (owner only)
 * @access  Private (Owner)
 */
registrationRouter.delete(
  "/:id",
  authenticate,
  authorize("owner"),
  createAuditLog("DELETE", "registration_request"),
  registrationController.deleteRegistration
);

export default registrationRouter;
