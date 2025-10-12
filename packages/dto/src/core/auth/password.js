import { z } from "zod";

// POST /api/auth/forgot-password
export const forgotPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordResponseSchema = z.object({
  message: z.string(),
});

// POST /api/auth/reset-password
export const resetPasswordRequestSchema = z.object({
  token: z.string().length(6),
  newPassword: z.string().min(8).max(255),
});

export const resetPasswordResponseSchema = z.object({
  message: z.string(),
});

// POST /api/auth/change-password
export const changePasswordRequestSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8).max(255),
});

export const changePasswordResponseSchema = z.object({
  message: z.string(),
});
