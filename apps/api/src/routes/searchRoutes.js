import { Router } from "express";

import {
  handleEntitySearch,
  handleGetEntityTypes,
  handleGlobalSearch,
  handleSearchSuggestions,
  handleUnifiedSearch,
} from "../controllers/searchController.js";
import { authenticate } from "../middleware/authMiddleware.js";

export const searchRouter = Router();

/**
 * All search routes require authentication
 * This ensures only logged-in users can perform searches
 */
searchRouter.use(authenticate);

/**
 * GET /api/search/entities
 * Get list of all searchable entity types
 */
searchRouter.get("/entities", handleGetEntityTypes);

/**
 * GET /api/search/unified
 * Unified search across all entities with results sorted by relevance
 * Query params:
 *   - q: search query (required)
 *   - entities: comma-separated list of entity types to search (optional)
 *   - limit: results per entity type (default: 10)
 *   - globalLimit: total results to return (default: 50)
 *   - minRank: minimum relevance score (default: 0.01)
 */
searchRouter.get("/unified", handleUnifiedSearch);

/**
 * GET /api/search
 * Global search across all or specified entity types
 * Query params:
 *   - q: search query (required)
 *   - entities: comma-separated list of entity types to search (optional)
 *   - limit: results per entity type (default: 10)
 *   - minRank: minimum relevance score (default: 0.01)
 */
searchRouter.get("/", handleGlobalSearch);

/**
 * GET /api/search/suggestions/:entityType
 * Get search suggestions/autocomplete for a specific entity type
 * Params:
 *   - entityType: the entity type to get suggestions for
 * Query params:
 *   - q: search query (required)
 *   - limit: number of suggestions (default: 5)
 */
searchRouter.get("/suggestions/:entityType", handleSearchSuggestions);

/**
 * GET /api/search/:entityType
 * Search within a specific entity type
 * Params:
 *   - entityType: the entity type to search (e.g., 'users', 'medications')
 * Query params:
 *   - q: search query (required)
 *   - limit: maximum results (default: 50)
 *   - minRank: minimum relevance score (default: 0.01)
 */
searchRouter.get("/:entityType", handleEntitySearch);

export default searchRouter;

