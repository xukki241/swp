import * as shiftService from "../services/shiftService.js";
import logger from "../utils/logger.js";

/**
 * Shift Controllers
 */

/**
 * @route GET /api/shifts
 * @desc Get all shifts
 */
export const getAllShifts = async (req, res, next) => {
  try {
    const shifts = await shiftService.getAllShifts();

    res.status(200).json({
      success: true,
      data: shifts,
      meta: {
        total: shifts.length,
      },
    });
  } catch (error) {
    logger.error("Error fetching shifts:", error);
    next(error);
  }
};

/**
 * @route GET /api/shifts/:id
 * @desc Get shift by ID
 */
export const getShiftById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shift = await shiftService.getShiftById(id);

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    res.status(200).json({
      success: true,
      data: shift,
    });
  } catch (error) {
    logger.error("Error fetching shift:", error);
    next(error);
  }
};

/**
 * @route POST /api/shifts
 * @desc Create new shift
 * @access Owner only
 */
export const createShift = async (req, res, next) => {
  try {
    const shiftData = req.body;
    const shift = await shiftService.createShift(shiftData);

    res.status(201).json({
      success: true,
      message: "Shift created successfully",
      data: shift,
    });
  } catch (error) {
    logger.error("Error creating shift:", error);
    next(error);
  }
};

/**
 * @route PATCH /api/shifts/:id
 * @desc Update shift
 * @access Owner only
 */
export const updateShift = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shiftData = req.body;
    const shift = await shiftService.updateShift(id, shiftData);

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Shift updated successfully",
      data: shift,
    });
  } catch (error) {
    logger.error("Error updating shift:", error);
    next(error);
  }
};

/**
 * @route DELETE /api/shifts/:id
 * @desc Delete shift
 * @access Owner only
 */
export const deleteShift = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shift = await shiftService.deleteShift(id);

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Shift deleted successfully",
      data: shift,
    });
  } catch (error) {
    logger.error("Error deleting shift:", error);
    next(error);
  }
};

/**
 * Shift Assignment Controllers
 */

/**
 * @route GET /api/shift-assignments
 * @desc Get all shift assignments with filters
 * @query userId, shiftId, startDate, endDate, status
 */
export const getAllShiftAssignments = async (req, res, next) => {
  try {
    const { userId, shiftId, startDate, endDate, status } = req.query;

    const assignments = await shiftService.getAllShiftAssignments({
      userId,
      shiftId,
      startDate,
      endDate,
      status,
    });

    res.status(200).json({
      success: true,
      data: assignments,
      meta: {
        total: assignments.length,
      },
    });
  } catch (error) {
    logger.error("Error fetching shift assignments:", error);
    next(error);
  }
};

/**
 * @route GET /api/shift-assignments/:id
 * @desc Get shift assignment by ID
 */
export const getShiftAssignmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const assignment = await shiftService.getShiftAssignmentById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Shift assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    logger.error("Error fetching shift assignment:", error);
    next(error);
  }
};

/**
 * @route POST /api/shift-assignments
 * @desc Create shift assignment(s) - single or batch
 * @access Owner only
 */
export const createShiftAssignment = async (req, res, next) => {
  try {
    const data = req.body;
    const createdBy = req.user.id;

    // Check if batch or single
    // Support both: direct array OR { assignments: [...] }
    const isBatch = Array.isArray(data) || data.assignments;

    if (isBatch) {
      // Batch creation
      const assignmentsArray = Array.isArray(data) ? data : data.assignments;
      const assignments = assignmentsArray.map((item) => ({
        ...item,
        createdBy,
      }));

      const result =
        await shiftService.createBatchShiftAssignments(assignments);

      return res.status(201).json({
        success: true,
        message: `${result.length} shift assignments created successfully`,
        data: result,
      });
    } else {
      // Single creation
      const assignmentData = {
        ...data,
        createdBy,
      };

      const assignment =
        await shiftService.createShiftAssignment(assignmentData);

      return res.status(201).json({
        success: true,
        message: "Shift assignment created successfully",
        data: assignment,
      });
    }
  } catch (error) {
    logger.error("Error creating shift assignment:", error);
    next(error);
  }
};

/**
 * @route PATCH /api/shift-assignments/:id
 * @desc Update shift assignment
 * @access Owner only
 */
export const updateShiftAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const assignmentData = req.body;

    const assignment = await shiftService.updateShiftAssignment(
      id,
      assignmentData
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Shift assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Shift assignment updated successfully",
      data: assignment,
    });
  } catch (error) {
    logger.error("Error updating shift assignment:", error);
    next(error);
  }
};

/**
 * @route POST /api/shift-assignments/:id/confirm
 * @desc Confirm shift assignment
 * @access Private (self or owner)
 */
export const confirmShift = async (req, res, next) => {
  try {
    const { id } = req.params;

    const assignment = await shiftService.confirmShift(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Shift assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Shift confirmed successfully",
      data: assignment,
    });
  } catch (error) {
    logger.error("Error confirming shift:", error);
    next(error);
  }
};

/**
 * @route POST /api/shift-assignments/:id/check-in
 * @desc Check in to shift
 * @access Private (self or owner)
 */
export const checkInShift = async (req, res, next) => {
  try {
    const { id } = req.params;

    const assignment = await shiftService.checkInShift(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Shift assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Checked in successfully",
      data: assignment,
    });
  } catch (error) {
    logger.error("Error checking in:", error);
    next(error);
  }
};

/**
 * @route POST /api/shift-assignments/:id/check-out
 * @desc Check out from shift
 * @access Private (self or owner)
 */
export const checkOutShift = async (req, res, next) => {
  try {
    const { id } = req.params;

    const assignment = await shiftService.checkOutShift(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Shift assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Checked out successfully",
      data: assignment,
    });
  } catch (error) {
    logger.error("Error checking out:", error);
    next(error);
  }
};

/**
 * @route DELETE /api/shift-assignments/:id
 * @desc Delete shift assignment
 * @access Owner only
 */
export const deleteShiftAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const assignment = await shiftService.deleteShiftAssignment(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Shift assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Shift assignment deleted successfully",
      data: assignment,
    });
  } catch (error) {
    logger.error("Error deleting shift assignment:", error);
    next(error);
  }
};

/**
 * @route GET /api/users/:userId/schedule
 * @desc Get user's schedule
 * @query startDate, endDate
 */
export const getUserSchedule = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    const schedule = await shiftService.getUserSchedule(
      userId,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: schedule,
      meta: {
        total: schedule.length,
      },
    });
  } catch (error) {
    logger.error("Error fetching user schedule:", error);
    next(error);
  }
};

/**
 * @route GET /api/shifts/:shiftId/staff
 * @desc Get staff working in a specific shift on a date
 * @query date (required)
 */
export const getStaffByShiftAndDate = async (req, res, next) => {
  try {
    const { shiftId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "date query parameter is required",
      });
    }

    const staff = await shiftService.getStaffByShiftAndDate(shiftId, date);

    res.status(200).json({
      success: true,
      data: staff,
      meta: {
        total: staff.length,
      },
    });
  } catch (error) {
    logger.error("Error fetching staff for shift:", error);
    next(error);
  }
};
