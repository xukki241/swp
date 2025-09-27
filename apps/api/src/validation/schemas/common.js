import * as v from "valibot";

/**
 * Schema for ID parameter validation
 */
export const idParameterSchema = v.object({
  id: v.pipe(
    v.string("ID must be a string"),
    v.transform(input => Number.parseInt(input, 10)),
    v.number("ID must be a number"),
    v.integer("ID must be an integer"),
    v.minValue(1, "ID must be a positive integer")
  ),
});

/**
 * Schema for email parameter validation
 */
export const emailParameterSchema = v.object({
  email: v.pipe(
    v.string("Email must be a string"),
    v.trim(),
    v.toLowerCase(),
    v.email("Invalid email format"),
    v.maxLength(255, "Email must be 255 characters or less")
  ),
});

/**
 * Schema for role ID parameter validation
 */
export const roleIdParameterSchema = v.object({
  roleId: v.pipe(
    v.string("Role ID must be a string"),
    v.transform(input => Number.parseInt(input, 10)),
    v.number("Role ID must be a number"),
    v.integer("Role ID must be an integer"),
    v.minValue(1, "Role ID must be a positive integer")
  ),
});

/**
 * Common pagination schema
 */
export const paginationSchema = v.object({
  page: v.optional(
    v.pipe(
      v.string("Page must be a string"),
      v.transform(input => Number.parseInt(input, 10)),
      v.number("Page must be a number"),
      v.integer("Page must be an integer"),
      v.minValue(1, "Page must be at least 1")
    )
  ),
  limit: v.optional(
    v.pipe(
      v.string("Limit must be a string"),
      v.transform(input => Number.parseInt(input, 10)),
      v.number("Limit must be a number"),
      v.integer("Limit must be an integer"),
      v.minValue(1, "Limit must be at least 1"),
      v.maxValue(100, "Limit must be at most 100")
    )
  ),
});

/**
 * Common sorting schema
 */
export const sortingSchema = v.object({
  orderBy: v.optional(v.string("Order by must be a string")),
  orderDirection: v.optional(
    v.picklist(["asc", "desc"], "Order direction must be 'asc' or 'desc'")
  ),
});

/**
 * Common search schema
 */
export const searchSchema = v.object({
  search: v.optional(
    v.pipe(
      v.string("Search must be a string"),
      v.trim(),
      v.maxLength(255, "Search term must be 255 characters or less")
    )
  ),
});
