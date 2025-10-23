import express from "express";

import * as shiftController from "../controllers/shiftController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

export const shiftRouter = express.Router();

// All routes require authentication
shiftRouter.use(authenticate);

/**
 * SHIFT MANAGEMENT ROUTES
 */

/**
 * @route   GET /api/shifts
 * @desc    Get all shifts (shift definitions)
 * @access  Private
 */
shiftRouter.get("/", shiftController.getAllShifts);

/**
 * @route   GET /api/shifts/:id
 * @desc    Get shift by ID
 * @access  Private
 */
shiftRouter.get("/:id", shiftController.getShiftById);

/**
 * @route   POST /api/shifts
 * @desc    Create new shift
 * @access  Owner only
 */
shiftRouter.post("/", authorize("owner"), shiftController.createShift);

/**
 * @route   PATCH /api/shifts/:id
 * @desc    Update shift
 * @access  Owner only
 */
shiftRouter.patch("/:id", authorize("owner"), shiftController.updateShift);

/**
 * @route   DELETE /api/shifts/:id
 * @desc    Delete shift
 * @access  Owner only
 */
shiftRouter.delete("/:id", authorize("owner"), shiftController.deleteShift);

/**
 * @route   GET /api/shifts/:shiftId/staff
 * @desc    Get staff working in a shift on a specific date
 * @query   date - Required (YYYY-MM-DD)
 * @access  Private
 */
shiftRouter.get("/:shiftId/staff", shiftController.getStaffByShiftAndDate);

export default shiftRouter;
