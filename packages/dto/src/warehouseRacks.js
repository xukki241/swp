import { z } from "zod";
import {
  codeSchema,
  nameSchema,
  descriptionSchema,
  idSchema,
} from "./common.js";

// Warehouse rack base schema
export const warehouseRackBaseSchema = z.object({
  zoneId: idSchema,
  code: codeSchema,
  name: nameSchema,
  description: descriptionSchema,
});

// Warehouse rack schema with ID
export const warehouseRackSchema = warehouseRackBaseSchema.extend({
  id: idSchema,
});

// Create schema
export const createWarehouseRackSchema = warehouseRackBaseSchema;

// Update schema
export const updateWarehouseRackSchema = warehouseRackBaseSchema
  .partial()
  .extend({
    zoneId: idSchema.optional(),
  });

// Query schema
export const warehouseRackQuerySchema = z.object({
  id: idSchema.optional(),
  zoneId: idSchema.optional(),
  code: z.string().optional(),
});
