import { beforeEach, describe, expect, it, vi } from "vitest";

import * as searchService from "@/services/searchService.js";

vi.mock("@/db/index.js");

describe("searchService", () => {
  let mockDb;

  beforeEach(async () => {
    vi.clearAllMocks();

    const { db } = await import("@/db/index.js");
    mockDb = db;
  });

  describe("globalSearch", () => {
    it("should perform global search across all entities", async () => {
      const mockUserResults = [
        {
          id: "user-1",
          name: "John Doe",
          rank: 0.5,
        },
      ];

      const mockMedicationResults = [
        {
          id: "med-1",
          name: "Aspirin",
          rank: 0.8,
        },
      ];

      // Mock the database calls for each entity type
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          $dynamic: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockReturnThis(),
          limit: vi.fn().mockImplementation(function () {
            // Return different results based on call count
            const callCount = mockDb.select.mock.calls.length;
            if (callCount === 1) {
              return Promise.resolve(mockUserResults);
            }
            if (callCount === 4) {
              return Promise.resolve(mockMedicationResults);
            }
            return Promise.resolve([]);
          }),
        }),
      });

      const result = await searchService.globalSearch("test");

      expect(result).toBeDefined();
      expect(result).toHaveProperty("users");
      expect(result).toHaveProperty("medications");
      expect(result.users).toEqual(
        mockUserResults.map((r) => ({ ...r, entityType: "users" }))
      );
    });

    it("should handle empty search query", async () => {
      const result = await searchService.globalSearch("");

      expect(result).toEqual({});
    });

    it("should handle errors gracefully", async () => {
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          $dynamic: vi.fn().mockImplementation(() => {
            throw new Error("Database error");
          }),
        }),
      });

      const result = await searchService.globalSearch("test");

      // globalSearch catches errors and returns empty results for failed entities
      expect(result).toBeDefined();
      expect(
        Object.values(result).every((r) => Array.isArray(r) && r.length === 0)
      ).toBe(true);
    });
  });

  describe("searchByEntity", () => {
    it("should search within a specific entity type", async () => {
      const mockResults = [
        {
          id: "user-1",
          name: "John Doe",
          rank: 0.5,
        },
      ];

      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          $dynamic: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockReturnThis(),
          limit: vi
            .fn()
            .mockResolvedValue(
              mockResults.map((r) => ({ ...r, entityType: "users" }))
            ),
        }),
      });

      const result = await searchService.searchByEntity("users", "john");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle empty search query", async () => {
      const result = await searchService.searchByEntity("users", "");

      expect(result).toEqual([]);
    });

    it("should handle errors", async () => {
      mockDb.select = vi.fn().mockImplementation(() => {
        throw new Error("Database error");
      });

      await expect(
        searchService.searchByEntity("users", "test")
      ).rejects.toThrow();
    });
  });

  describe("getSearchSuggestions", () => {
    it("should return search suggestions for an entity", async () => {
      const mockSuggestions = [
        { id: "1", name: "John Doe" },
        { id: "2", name: "Jane Doe" },
      ];

      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockSuggestions),
            }),
          }),
        }),
      });

      const result = await searchService.getSearchSuggestions("users", "jo");

      expect(result).toEqual(mockSuggestions);
      expect(result.length).toBeLessThanOrEqual(5);
    });

    it("should respect custom limit", async () => {
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      await searchService.getSearchSuggestions("users", "test", 10);

      expect(mockDb.select).toHaveBeenCalled();
    });

    it("should handle empty query", async () => {
      const result = await searchService.getSearchSuggestions("users", "");

      expect(result).toEqual([]);
    });

    it("should handle errors", async () => {
      mockDb.select = vi.fn().mockImplementation(() => {
        throw new Error("Database error");
      });

      await expect(
        searchService.getSearchSuggestions("users", "test")
      ).rejects.toThrow();
    });
  });

  describe("unifiedSearch", () => {
    it("should perform unified search with grouping", async () => {
      const mockUserResults = [{ id: "user-1", name: "John", rank: 0.5 }];
      const mockMedicationResults = [
        { id: "med-1", name: "Aspirin", rank: 0.8 },
      ];

      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          $dynamic: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockReturnThis(),
          limit: vi.fn().mockImplementation(function () {
            const callCount = mockDb.select.mock.calls.length;
            if (callCount === 1) {
              return Promise.resolve(
                mockUserResults.map((r) => ({ ...r, entityType: "users" }))
              );
            }
            if (callCount === 4) {
              return Promise.resolve(
                mockMedicationResults.map((r) => ({
                  ...r,
                  entityType: "medications",
                }))
              );
            }
            return Promise.resolve([]);
          }),
        }),
      });

      const result = await searchService.unifiedSearch("test");

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle empty search query", async () => {
      const result = await searchService.unifiedSearch("");

      expect(result).toEqual([]);
    });

    it("should filter by entity types", async () => {
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          $dynamic: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([]),
        }),
      });

      await searchService.unifiedSearch("test", {
        entities: ["users", "medications"],
      });

      expect(mockDb.select).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          $dynamic: vi.fn().mockImplementation(() => {
            throw new Error("Database error");
          }),
        }),
      });

      const result = await searchService.unifiedSearch("test");

      // unifiedSearch catches errors and returns empty results
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
