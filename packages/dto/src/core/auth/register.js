import { z } from "zod";
import {
  nameSchema,
  emailSchema,
  phoneSchema,
  addressSchema,
  successResponseSchema,
} from "../common/index.js";

// POST /api/auth/register - Public registration
export const registerRequestSchema = z.object({
  name: nameSchema,
  email: emailSchema.refine((val) => val != null, {
    message: "Email is required",
  }),
  phone: phoneSchema.refine((val) => val != null, {
    message: "Phone is required",
  }),
  address: addressSchema.refine((val) => val != null, {
    message: "Address is required",
  }),
});

export const registerResponseSchema = successResponseSchema(z.null());
