import express from "express";

import * as shiftController from "../controllers/shiftController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

export const shiftAssignmentRouter = express.Router();

// All routes require authentication
shiftAssignmentRouter.use(authenticate);

/**
 * SHIFT ASSIGNMENT ROUTES
 */

/**
 * @route   GET /api/shift-assignments
 * @desc    Get all shift assignments with optional filters
 * @query   userId - Filter by user ID
 * @query   shiftId - Filter by shift ID
 * @query   startDate - Filter by start date (YYYY-MM-DD)
 * @query   endDate - Filter by end date (YYYY-MM-DD)
 * @query   status - Filter by status (scheduled, confirmed, in_progress, completed, cancelled, absent)
 * @access  Private
 */
shiftAssignmentRouter.get("/", shiftController.getAllShiftAssignments);

/**
 * @route   GET /api/shift-assignments/:id
 * @desc    Get shift assignment by ID
 * @access  Private
 */
shiftAssignmentRouter.get("/:id", shiftController.getShiftAssignmentById);

/**
 * @route   POST /api/shift-assignments
 * @desc    Create shift assignment(s) - accepts single object or array for batch
 * @body    Single: { userId, shiftId, assignedDate, notes? }
 * @body    Batch: [{ userId, shiftId, assignedDate, notes? }, ...]
 * @access  Owner only
 */
shiftAssignmentRouter.post(
    "/",
    authorize("owner"),
    shiftController.createShiftAssignment
);

/**
 * @route   PATCH /api/shift-assignments/:id
 * @desc    Update shift assignment (status, notes, etc.)
 * @access  Owner only
 */
shiftAssignmentRouter.patch(
    "/:id",
    authorize("owner"),
    shiftController.updateShiftAssignment
);

/**
 * @route   POST /api/shift-assignments/:id/check-in
 * @desc    Check in to shift (start working)
 * @access  Private (self or owner)
 */
shiftAssignmentRouter.post("/:id/check-in", shiftController.checkInShift);

/**
 * @route   POST /api/shift-assignments/:id/check-out
 * @desc    Check out from shift (finish working)
 * @access  Private (self or owner)
 */
shiftAssignmentRouter.post("/:id/check-out", shiftController.checkOutShift);

/**
 * @route   DELETE /api/shift-assignments/:id
 * @desc    Delete shift assignment
 * @access  Owner only
 */
shiftAssignmentRouter.delete(
    "/:id",
    authorize("owner"),
    shiftController.deleteShiftAssignment
);

export default shiftAssignmentRouter;
