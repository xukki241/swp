import { z } from "zod";
import {
  codeSchema,
  nameSchema,
  descriptionSchema,
  idSchema,
} from "./common.js";

// Warehouse bin base schema
export const warehouseBinBaseSchema = z.object({
  rackId: idSchema,
  code: codeSchema,
  name: nameSchema,
  level: z.number().int().positive(),
  number: z.number().int().positive(),
  description: descriptionSchema,
});

// Warehouse bin schema with ID
export const warehouseBinSchema = warehouseBinBaseSchema.extend({
  id: idSchema,
});

// Create schema
export const createWarehouseBinSchema = warehouseBinBaseSchema;

// Update schema
export const updateWarehouseBinSchema = warehouseBinBaseSchema
  .partial()
  .extend({
    rackId: idSchema.optional(),
  });

// Query schema
export const warehouseBinQuerySchema = z.object({
  id: idSchema.optional(),
  rackId: idSchema.optional(),
  code: z.string().optional(),
  level: z.number().int().optional(),
  number: z.number().int().optional(),
});
