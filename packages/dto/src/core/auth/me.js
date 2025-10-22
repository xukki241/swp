import { z } from "zod";
import {
  addressSchema,
  emailSchema,
  nameSchema,
  phoneSchema,
  successResponseSchema,
  userRoleEnum,
  userStatusEnum,
  uuidSchema,
} from "../common/index.js";

// GET /api/auth/me
const meDataSchema = z.object({
  id: uuidSchema,
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema,
  status: userStatusEnum,
  role: userRoleEnum,
});

export const meResponseSchema = successResponseSchema(meDataSchema);
