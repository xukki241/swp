import { z } from "zod";
import {
  addressSchema,
  emailSchema,
  nameSchema,
  paginationSchema,
  phoneSchema,
  userRegistrationStatusEnum,
  userRoleEnum,
  uuidSchema,
} from "../common/index.js";

// User registration schema
export const userRegistrationSchema = z.object({
  id: uuidSchema,
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema,
  password: z.string(),
  status: userRegistrationStatusEnum,
});

// GET /api/users/registrations - List registration requests
export const listRegistrationsQuerySchema = paginationSchema.extend({
  email: z.string().optional(),
  phone: z.string().optional(),
  status: userRegistrationStatusEnum.optional(),
});

export const listRegistrationsResponseSchema = z.object({
  data: z.array(userRegistrationSchema.omit({ password: true })),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

// POST /api/users/registrations/:id/approve - Approve registration
export const approveRegistrationRequestSchema = z.object({
  password: z.string().min(8).max(255),
  role: userRoleEnum.default("staff"),
});

export const approveRegistrationResponseSchema = z.object({
  message: z.string(),
});

// POST /api/users/registrations/:id/reject - Reject registration
export const rejectRegistrationResponseSchema = z.object({
  message: z.string(),
});
