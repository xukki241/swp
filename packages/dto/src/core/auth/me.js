import { z } from "zod";
import {
  uuidSchema,
  nameSchema,
  emailSchema,
  phoneSchema,
  addressSchema,
  successResponseSchema,
} from "../common/index.js";
import { userRoleEnum, userStatusEnum } from "../common/index.js";

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
