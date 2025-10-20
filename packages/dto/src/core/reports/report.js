import { z } from "zod";
import {
  uuidSchema,
  timestampSchema,
  jsonSchema,
  paginationSchema,
} from "../common/index.js";
import { reportTypeEnum } from "../common/index.js";

// Report schema
export const reportSchema = z.object({
  id: uuidSchema,
  type: reportTypeEnum,
  reportDate: timestampSchema,
  data: jsonSchema,
  parameters: jsonSchema.nullable().optional(),
});

// POST /api/reports
export const createReportRequestSchema = z.object({
  type: reportTypeEnum,
  parameters: z
    .object({
      startDate: timestampSchema.optional(),
      endDate: timestampSchema.optional(),
    })
    .optional(),
});

export const createReportResponseSchema = reportSchema;

// GET /api/reports
export const listReportsQuerySchema = paginationSchema.extend({
  type: reportTypeEnum.optional(),
  reportDateFrom: timestampSchema.optional(),
  reportDateTo: timestampSchema.optional(),
});

export const listReportsResponseSchema = z.object({
  data: z.array(reportSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

// GET /api/reports/:id
export const getReportResponseSchema = reportSchema;

// DELETE /api/reports/:id
export const deleteReportResponseSchema = z.object({
  message: z.string(),
});
