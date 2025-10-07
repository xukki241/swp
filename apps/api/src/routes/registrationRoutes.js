import express from "express";

import * as registrationController from "../controllers/registrationController.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// All registration routes require authentication and owner role

/**
 * @route   GET /api/registrations
 * @desc    Get all registration requests (owner only)
 * @access  Private (Owner)
 * @query   status - Filter by status (pending, approved, rejected)
 */
router.get(
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
router.get(
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
router.post(
  "/:id/approve",
  authenticate,
  authorize("owner"),
  registrationController.approveRegistration
);

/**
 * @route   POST /api/registrations/:id/reject
 * @desc    Reject registration request (owner only)
 * @access  Private (Owner)
 */
router.post(
  "/:id/reject",
  authenticate,
  authorize("owner"),
  registrationController.rejectRegistration
);

/**
 * @route   DELETE /api/registrations/:id
 * @desc    Delete registration request (owner only)
 * @access  Private (Owner)
 */
router.delete(
  "/:id",
  authenticate,
  authorize("owner"),
  registrationController.deleteRegistration
);

export default router;
