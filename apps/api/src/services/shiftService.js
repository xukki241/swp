import { and, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "../db/index.js";
import { shiftAssignments, shifts, users } from "../db/schema/index.js";

/**
 * Shift Service
 * Quản lý các ca làm việc (shift definitions)
 */

/**
 * Lấy tất cả ca làm việc
 */
export const getAllShifts = async () => {
  try {
    const result = await db.select().from(shifts).orderBy(shifts.startTime);
    return result;
  } catch (error) {
    throw new Error(`Failed to fetch shifts: ${error.message}`);
  }
};

/**
 * Lấy shift theo ID
 */
export const getShiftById = async (id) => {
  try {
    const result = await db
      .select()
      .from(shifts)
      .where(eq(shifts.id, id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to fetch shift: ${error.message}`);
  }
};

/**
 * Tạo shift mới
 * @param {Object} shiftData - { name, shiftType, startTime, endTime, description }
 */
export const createShift = async (shiftData) => {
  try {
    const result = await db.insert(shifts).values(shiftData).returning();
    return result[0];
  } catch (error) {
    throw new Error(`Failed to create shift: ${error.message}`);
  }
};

/**
 * Cập nhật shift
 */
export const updateShift = async (id, shiftData) => {
  try {
    const result = await db
      .update(shifts)
      .set({ ...shiftData, updatedAt: sql`now()` })
      .where(eq(shifts.id, id))
      .returning();
    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to update shift: ${error.message}`);
  }
};

/**
 * Xóa shift
 */
export const deleteShift = async (id) => {
  try {
    // Check if shift is being used in assignments
    const assignments = await db
      .select()
      .from(shiftAssignments)
      .where(eq(shiftAssignments.shiftId, id))
      .limit(1);

    if (assignments.length > 0) {
      throw new Error(
        "Cannot delete shift that has assignments. Please delete assignments first."
      );
    }

    const result = await db.delete(shifts).where(eq(shifts.id, id)).returning();
    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to delete shift: ${error.message}`);
  }
};

/**
 * Shift Assignment Service
 * Quản lý phân ca cho nhân viên
 */

/**
 * Lấy tất cả shift assignments với filter
 * @param {Object} options - { userId, shiftId, startDate, endDate, status }
 */
export const getAllShiftAssignments = async ({
  userId,
  shiftId,
  startDate,
  endDate,
  status,
} = {}) => {
  try {
    const conditions = [];

    if (userId) {
      conditions.push(eq(shiftAssignments.userId, userId));
    }

    if (shiftId) {
      conditions.push(eq(shiftAssignments.shiftId, shiftId));
    }

    if (startDate) {
      // Convert string to Date for Drizzle ORM
      const startDateObj =
        typeof startDate === "string" ? new Date(startDate) : startDate;
      conditions.push(gte(shiftAssignments.assignedDate, startDateObj));
    }

    if (endDate) {
      // Convert string to Date for Drizzle ORM
      const endDateObj =
        typeof endDate === "string" ? new Date(endDate) : endDate;
      conditions.push(lte(shiftAssignments.assignedDate, endDateObj));
    }

    if (status) {
      conditions.push(eq(shiftAssignments.status, status));
    }

    let query = db
      .select({
        assignment: shiftAssignments,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          role: users.role,
        },
        shift: shifts,
      })
      .from(shiftAssignments)
      .leftJoin(users, eq(shiftAssignments.userId, users.id))
      .leftJoin(shifts, eq(shiftAssignments.shiftId, shifts.id))
      .orderBy(shiftAssignments.assignedDate, shiftAssignments.shiftId);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;
    return result;
  } catch (error) {
    throw new Error(`Failed to fetch shift assignments: ${error.message}`);
  }
};

/**
 * Lấy shift assignment theo ID
 */
export const getShiftAssignmentById = async (id) => {
  try {
    const result = await db
      .select({
        assignment: shiftAssignments,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          role: users.role,
        },
        shift: shifts,
      })
      .from(shiftAssignments)
      .leftJoin(users, eq(shiftAssignments.userId, users.id))
      .leftJoin(shifts, eq(shiftAssignments.shiftId, shifts.id))
      .where(eq(shiftAssignments.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to fetch shift assignment: ${error.message}`);
  }
};

/**
 * Tạo shift assignment mới (phân ca)
 * @param {Object} assignmentData - { userId, shiftId, assignedDate, createdBy, notes }
 */
export const createShiftAssignment = async (assignmentData) => {
  try {
    // Convert assignedDate string to Date if needed
    const assignedDate =
      typeof assignmentData.assignedDate === "string"
        ? new Date(assignmentData.assignedDate)
        : assignmentData.assignedDate;

    // Validate: không cho phép assign ca trong quá khứ
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const assignedDateOnly = new Date(assignedDate);
    assignedDateOnly.setHours(0, 0, 0, 0);

    if (assignedDateOnly < today) {
      throw new Error("Cannot assign shifts for past dates");
    }

    // Kiểm tra user đã có ca trong ngày này chưa
    const existingAssignment = await db
      .select()
      .from(shiftAssignments)
      .where(
        and(
          eq(shiftAssignments.userId, assignmentData.userId),
          eq(shiftAssignments.assignedDate, assignedDate)
        )
      )
      .limit(1);

    if (existingAssignment.length > 0) {
      throw new Error("User already has a shift assignment on this date");
    }

    const result = await db
      .insert(shiftAssignments)
      .values({
        ...assignmentData,
        assignedDate, // Use converted Date object
      })
      .returning();
    return result[0];
  } catch (error) {
    throw new Error(`Failed to create shift assignment: ${error.message}`);
  }
};

/**
 * Tạo nhiều shift assignments cùng lúc (batch assign)
 * @param {Array} assignments - [{ userId, shiftId, assignedDate, createdBy }]
 */
export const createBatchShiftAssignments = async (assignments) => {
  try {
    // Convert all assignedDate strings to Date objects
    const processedAssignments = assignments.map((item) => ({
      ...item,
      assignedDate:
        typeof item.assignedDate === "string"
          ? new Date(item.assignedDate)
          : item.assignedDate,
    }));

    // Validate: không cho phép assign ca trong quá khứ
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hasPastDate = processedAssignments.some((item) => {
      const assignedDateOnly = new Date(item.assignedDate);
      assignedDateOnly.setHours(0, 0, 0, 0);
      return assignedDateOnly < today;
    });

    if (hasPastDate) {
      throw new Error("Cannot assign shifts for past dates");
    }

    const result = await db
      .insert(shiftAssignments)
      .values(processedAssignments)
      .returning();
    return result;
  } catch (error) {
    if (error.code === "23505") {
      throw new Error(
        "One or more users already have shift assignments on the specified dates"
      );
    }
    throw new Error(`Failed to create shift assignments: ${error.message}`);
  }
};

/**
 * Cập nhật shift assignment
 */
export const updateShiftAssignment = async (id, assignmentData) => {
  try {
    const result = await db
      .update(shiftAssignments)
      .set({ ...assignmentData, updatedAt: sql`now()` })
      .where(eq(shiftAssignments.id, id))
      .returning();
    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to update shift assignment: ${error.message}`);
  }
};

/**
 * Check-in (nhân viên bắt đầu ca)
 */
export const checkInShift = async (id) => {
  try {
    const vnTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Ho_Chi_Minh"
    });

    const result = await db
      .update(shiftAssignments)
      .set({
        checkInTime: new Date(vnTime),
        status: "in_progress",
        updatedAt: new Date(vnTime),
      })
      .where(eq(shiftAssignments.id, id))
      .returning();
    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to check in: ${error.message}`);
  }
};

/**
 * Check-out (nhân viên kết thúc ca)
 */
export const checkOutShift = async (id) => {
  try {
    const vnTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Ho_Chi_Minh"
    });

    const result = await db
      .update(shiftAssignments)
      .set({
        checkOutTime: new Date(vnTime),
        status: "completed",
        updatedAt: new Date(vnTime),
      })
      .where(eq(shiftAssignments.id, id))
      .returning();
    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to check out: ${error.message}`);
  }
};

/**
 * Xóa shift assignment
 */
export const deleteShiftAssignment = async (id) => {
  try {
    const result = await db
      .delete(shiftAssignments)
      .where(eq(shiftAssignments.id, id))
      .returning();
    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to delete shift assignment: ${error.message}`);
  }
};

/**
 * Lấy lịch làm việc của một nhân viên trong khoảng thời gian
 */
export const getUserSchedule = async (userId, startDate, endDate) => {
  try {
    // Convert strings to Date objects for Drizzle ORM
    const startDateObj =
      typeof startDate === "string" ? new Date(startDate) : startDate;
    const endDateObj =
      typeof endDate === "string" ? new Date(endDate) : endDate;

    const result = await db
      .select({
        assignment: shiftAssignments,
        shift: shifts,
      })
      .from(shiftAssignments)
      .leftJoin(shifts, eq(shiftAssignments.shiftId, shifts.id))
      .where(
        and(
          eq(shiftAssignments.userId, userId),
          gte(shiftAssignments.assignedDate, startDateObj),
          lte(shiftAssignments.assignedDate, endDateObj)
        )
      )
      .orderBy(shiftAssignments.assignedDate);

    return result;
  } catch (error) {
    throw new Error(`Failed to fetch user schedule: ${error.message}`);
  }
};

/**
 * Lấy danh sách nhân viên làm việc trong một ca cụ thể vào một ngày
 */
export const getStaffByShiftAndDate = async (shiftId, date) => {
  try {
    // Convert string to Date object for Drizzle ORM
    const dateObj = typeof date === "string" ? new Date(date) : date;

    const result = await db
      .select({
        assignment: shiftAssignments,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          role: users.role,
        },
      })
      .from(shiftAssignments)
      .leftJoin(users, eq(shiftAssignments.userId, users.id))
      .where(
        and(
          eq(shiftAssignments.shiftId, shiftId),
          eq(shiftAssignments.assignedDate, dateObj)
        )
      );

    return result;
  } catch (error) {
    throw new Error(`Failed to fetch staff for shift: ${error.message}`);
  }
};
