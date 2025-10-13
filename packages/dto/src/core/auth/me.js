import { z } from "zod";
import {
  uuidSchema,
  nameSchema,
  emailSchema,
  phoneSchema,
  addressSchema,
} from "../common/index.js";
import { userRoleEnum, userStatusEnum } from "../common/index.js";

// GET /api/auth/me
export const meResponseSchema = z.object({
  id: uuidSchema,
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema,
  status: userStatusEnum,
  role: userRoleEnum,
});
