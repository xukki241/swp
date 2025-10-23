import express from "express";

import * as shiftController from "../controllers/shiftController.js";
import * as userController from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

export const userRouter = express.Router();

/**
 * @route   GET /api/users/staff
 * @desc    Get all staff accounts with filtering (owner only)
 * @access  Private (Owner)
 * @query   search - Search term for name, email, or phone
 * @query   role - Filter by role
 * @query   status - Filter by status
 */
userRouter.get(
  "/staff",
  authenticate,
  authorize("owner"),
  userController.getAllStaff
);

/**
 * @route   PATCH /api/users/:id/activate
 * @desc    Activate user account (owner only)
 * @access  Private (Owner)
 */
userRouter.patch(
  "/:id/activate",
  authenticate,
  authorize("owner"),
  userController.activateUser
);

/**
 * @route   PATCH /api/users/:id/deactivate
 * @desc    Deactivate user account (owner only)
 * @access  Private (Owner)
 */
userRouter.patch(
  "/:id/deactivate",
  authenticate,
  authorize("owner"),
  userController.deactivateUser
);

/**
 * @route   PATCH /api/users/:id/suspend
 * @desc    Suspend user account (owner only)
 * @access  Private (Owner)
 */
userRouter.patch(
  "/:id/suspend",
  authenticate,
  authorize("owner"),
  userController.suspendUser
);

/**
 * @route   GET /api/users
 * @desc    Get all users (with optional search)
 * @access  Private (Owner)
 * @query   search - Search term for name, email, or phone
 */
userRouter.get(
  "/",
  authenticate,
  authorize("owner"),
  userController.getAllUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Owner, or self)
 */
userRouter.get("/:id", authenticate, userController.getUserById);

/**
 * @route   GET /api/users/:userId/schedule
 * @desc    Get user's shift schedule
 * @query   startDate - Required (YYYY-MM-DD)
 * @query   endDate - Required (YYYY-MM-DD)
 * @access  Private (Owner, or self)
 */
userRouter.get("/:userId/schedule", authenticate, shiftController.getUserSchedule);

/**
 * @route   POST /api/users
 * @desc    Create a new user (owner only)
 * @access  Private (Owner)
 * @body    { name, email, phone, address?, role?, status? }
 */
userRouter.post(
  "/",
  authenticate,
  authorize("owner"),
  userController.createUser
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID (owner only)
 * @access  Private (Owner)
 * @body    { name?, email?, phone?, address?, role?, status? }
 */
userRouter.put(
  "/:id",
  authenticate,
  authorize("owner"),
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID (owner only)
 * @access  Private (Owner)
 */
userRouter.delete(
  "/:id",
  authenticate,
  authorize("owner"),
  userController.deleteUser
);

export default userRouter;
