import { pgTable, time } from "drizzle-orm/pg-core";

import {
    createdAt,
    description,
    identityPrimaryKey,
    name,
    updatedAt,
} from "./common.js";
import { shiftType } from "./enums.js";

/**
 * Shifts table - Định nghĩa các ca làm việc
 * Ví dụ: Ca sáng 6:00-14:00, Ca chiều 14:00-22:00, v.v.
 */
export const shifts = pgTable("shifts", {
    id: identityPrimaryKey(),
    name: name(), // Tên ca: "Ca sáng", "Ca chiều", v.v.
    shiftType: shiftType("shift_type").notNull(),
    startTime: time("start_time").notNull(), // Giờ bắt đầu (HH:MM:SS)
    endTime: time("end_time").notNull(), // Giờ kết thúc (HH:MM:SS)
    description: description(), // Mô tả ca làm việc
    createdAt: createdAt(),
    updatedAt: updatedAt(),
});
