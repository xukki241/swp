import { z } from "zod";

// POST /api/auth/refresh-token
export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

export const refreshTokenResponseSchema = z.object({
  accessToken: z.string(),
});
