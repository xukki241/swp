import { z } from "zod";
import { successResponseSchema } from "../common/index.js";

// POST /api/auth/login
export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const loginDataSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const loginResponseSchema = successResponseSchema(loginDataSchema);
