import { z } from "zod";

// Sorting schemas
export const sortBySchema = z.string().optional();
export const sortOrderSchema = z.enum(["asc", "desc"]).default("asc");

// Pagination query schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: sortBySchema,
  sortOrder: sortOrderSchema,
});

// Paginated response schema
export const paginatedResponseSchema = (itemSchema) =>
  z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      total: z.number().int().nonnegative(),
      totalPages: z.number().int().nonnegative(),
      hasMore: z.boolean(),
    }),
  });
