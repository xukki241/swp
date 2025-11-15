import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  handleEntitySearch,
  handleGetEntityTypes,
  handleGlobalSearch,
  handleSearchSuggestions,
  handleUnifiedSearch,
} from "@/controllers/searchController.js";
import * as searchService from "@/services/searchService.js";

vi.mock("@/services/searchService.js");
vi.mock("@/utils/logger.js", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("SearchController", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe("handleGlobalSearch", () => {
    it("should return 400 if search query is missing", async () => {
      req.query = {};

      await handleGlobalSearch(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Search query is required",
        data: null,
      });
    });

    it("should perform global search successfully", async () => {
      req.query = { q: "test", limit: "10" };
      const mockResults = {
        users: [{ id: "1", name: "Test User" }],
        medications: [{ id: "1", name: "Test Med" }],
      };

      searchService.globalSearch.mockResolvedValue(mockResults);

      await handleGlobalSearch(req, res, next);

      expect(searchService.globalSearch).toHaveBeenCalledWith("test", {
        entities: null,
        limit: 10,
        minRank: 0.01,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Search completed successfully",
        data: {
          query: "test",
          totalResults: 2,
          results: mockResults,
        },
      });
    });

    it("should filter by entities", async () => {
      req.query = { q: "test", entities: "users,medications", limit: "5" };
      const mockResults = {
        users: [{ id: "1", name: "Test User" }],
      };

      searchService.globalSearch.mockResolvedValue(mockResults);

      await handleGlobalSearch(req, res, next);

      expect(searchService.globalSearch).toHaveBeenCalledWith("test", {
        entities: ["users", "medications"],
        limit: 5,
        minRank: 0.01,
      });
    });

    it("should handle errors", async () => {
      req.query = { q: "test" };
      const error = new Error("Search failed");

      searchService.globalSearch.mockRejectedValue(error);

      await handleGlobalSearch(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("handleUnifiedSearch", () => {
    it("should return 400 if search query is missing", async () => {
      req.query = {};

      await handleUnifiedSearch(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Search query is required",
        data: null,
      });
    });

    it("should perform unified search successfully", async () => {
      req.query = { q: "test", limit: "10", globalLimit: "50" };
      const mockResults = [
        { id: "1", name: "Test 1", entityType: "users", rank: 0.9 },
        { id: "2", name: "Test 2", entityType: "medications", rank: 0.8 },
      ];

      searchService.unifiedSearch.mockResolvedValue(mockResults);

      await handleUnifiedSearch(req, res, next);

      expect(searchService.unifiedSearch).toHaveBeenCalledWith("test", {
        entities: null,
        limit: 10,
        globalLimit: 50,
        minRank: 0.01,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Search completed successfully",
        data: {
          query: "test",
          totalResults: 2,
          results: mockResults,
        },
      });
    });

    it("should handle errors", async () => {
      req.query = { q: "test" };
      const error = new Error("Search failed");

      searchService.unifiedSearch.mockRejectedValue(error);

      await handleUnifiedSearch(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("handleEntitySearch", () => {
    it("should return 400 if search query is missing", async () => {
      req.params = { entityType: "users" };
      req.query = {};

      await handleEntitySearch(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Search query is required",
        data: null,
      });
    });

    it("should search within entity successfully", async () => {
      req.params = { entityType: "users" };
      req.query = { q: "test", limit: "20" };
      const mockResults = [
        { id: "1", name: "Test User 1" },
        { id: "2", name: "Test User 2" },
      ];

      searchService.searchByEntity.mockResolvedValue(mockResults);

      await handleEntitySearch(req, res, next);

      expect(searchService.searchByEntity).toHaveBeenCalledWith(
        "users",
        "test",
        { limit: 20, minRank: 0.01 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Search completed successfully",
        data: {
          query: "test",
          entityType: "users",
          totalResults: 2,
          results: mockResults,
        },
      });
    });

    it("should return 400 for unknown entity type", async () => {
      req.params = { entityType: "invalid" };
      req.query = { q: "test" };
      const error = new Error("Unknown entity type: invalid");

      searchService.searchByEntity.mockRejectedValue(error);

      await handleEntitySearch(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unknown entity type: invalid",
        data: null,
      });
    });

    it("should handle other errors", async () => {
      req.params = { entityType: "users" };
      req.query = { q: "test" };
      const error = new Error("Database error");

      searchService.searchByEntity.mockRejectedValue(error);

      await handleEntitySearch(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("handleSearchSuggestions", () => {
    it("should return empty suggestions if query is missing", async () => {
      req.params = { entityType: "users" };
      req.query = {};

      await handleSearchSuggestions(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "No search query provided",
        data: {
          suggestions: [],
        },
      });
    });

    it("should return suggestions successfully", async () => {
      req.params = { entityType: "users" };
      req.query = { q: "test", limit: "5" };
      const mockSuggestions = ["Test User 1", "Test User 2"];

      searchService.getSearchSuggestions.mockResolvedValue(mockSuggestions);

      await handleSearchSuggestions(req, res, next);

      expect(searchService.getSearchSuggestions).toHaveBeenCalledWith(
        "users",
        "test",
        5
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Suggestions retrieved successfully",
        data: {
          query: "test",
          entityType: "users",
          suggestions: mockSuggestions,
        },
      });
    });

    it("should return 400 for unknown entity type", async () => {
      req.params = { entityType: "invalid" };
      req.query = { q: "test" };
      const error = new Error("Unknown entity type: invalid");

      searchService.getSearchSuggestions.mockRejectedValue(error);

      await handleSearchSuggestions(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unknown entity type: invalid",
        data: null,
      });
    });

    it("should handle other errors", async () => {
      req.params = { entityType: "users" };
      req.query = { q: "test" };
      const error = new Error("Database error");

      searchService.getSearchSuggestions.mockRejectedValue(error);

      await handleSearchSuggestions(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("handleGetEntityTypes", () => {
    it("should return available entity types", async () => {
      const mockEntityTypes = [
        "users",
        "customers",
        "suppliers",
        "medications",
      ];

      searchService.getAvailableEntityTypes.mockReturnValue(mockEntityTypes);

      await handleGetEntityTypes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Entity types retrieved successfully",
        data: {
          entityTypes: mockEntityTypes,
          count: 4,
        },
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Failed to get entity types");

      searchService.getAvailableEntityTypes.mockImplementation(() => {
        throw error;
      });

      await handleGetEntityTypes(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
