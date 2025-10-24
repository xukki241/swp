import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import {
  createdAt,
  foreignKey,
  identityPrimaryKey,
  updatedAt,
} from "./common.js";
import { shiftAssignmentStatus } from "./enums.js";
import { shifts } from "./shifts.js";
import { users } from "./users.js";

/**
 * Shift Assignments table - Phân ca làm việc cho nhân viên
 * Lưu thông tin nhân viên làm việc ca nào, ngày nào
 */
export const shiftAssignments = pgTable(
  "shift_assignments",
  {
    id: identityPrimaryKey(),
    userId: foreignKey("user_id", users.id).notNull(), // Nhân viên được phân ca
    shiftId: foreignKey("shift_id", shifts.id).notNull(), // Ca làm việc
    assignedDate: timestamp("assigned_date").notNull(), // Ngày làm việc
    status: shiftAssignmentStatus("status").notNull().default("scheduled"),
    checkInTime: timestamp("check_in_time"), // Giờ check-in thực tế
    checkOutTime: timestamp("check_out_time"), // Giờ check-out thực tế
    notes: text("notes"), // Ghi chú (lý do vắng mặt, thay ca, v.v.)
    createdBy: foreignKey("created_by", users.id), // Người tạo lịch (owner/manager)
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    // Đảm bảo một nhân viên không bị phân nhiều ca trong cùng 1 ngày
    uniqueIndex("shift_assignments_user_date_unique").on(
      table.userId,
      table.assignedDate
    ),
  ]
);
