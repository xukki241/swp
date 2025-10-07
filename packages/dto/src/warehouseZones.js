import { z } from "zod";
import {
  codeSchema,
  nameSchema,
  descriptionSchema,
  idSchema,
} from "./common.js";
import { warehouseZoneTypeSchema } from "./enums.js";

// Warehouse zone base schema
export const warehouseZoneBaseSchema = z.object({
  code: codeSchema,
  name: nameSchema,
  type: warehouseZoneTypeSchema.default("normal"),
  location: z.string().optional(),
  description: descriptionSchema,
});

// Warehouse zone schema with ID
export const warehouseZoneSchema = warehouseZoneBaseSchema.extend({
  id: idSchema,
});

// Create schema
export const createWarehouseZoneSchema = warehouseZoneBaseSchema;

// Update schema
export const updateWarehouseZoneSchema = warehouseZoneBaseSchema.partial();

// Query schema
export const warehouseZoneQuerySchema = z.object({
  id: idSchema.optional(),
  code: z.string().optional(),
  type: warehouseZoneTypeSchema.optional(),
});
