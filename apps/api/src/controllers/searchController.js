import {
  getAvailableEntityTypes,
  getSearchSuggestions,
  globalSearch,
  searchByEntity,
  unifiedSearch,
} from "../services/searchService.js";
import logger from "../utils/logger.js";

/**
 * Global search across all entity types
 * GET /api/search?q=query&entities=users,medications&limit=10
 */
export const handleGlobalSearch = async (req, res, next) => {
  try {
    const { q: searchQuery, entities, limit = 10, minRank = 0.01 } = req.query;

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
        data: null,
      });
    }

    // Parse entities if provided as comma-separated string
    const entityList = entities
      ? entities.split(",").map((e) => e.trim())
      : null;

    const options = {
      entities: entityList,
      limit: parseInt(limit, 10),
      minRank: parseFloat(minRank),
    };

    const results = await globalSearch(searchQuery, options);

    // Calculate total results
    const totalResults = Object.values(results).reduce(
      (sum, entityResults) => sum + entityResults.length,
      0
    );

    logger.info(
      `Global search for "${searchQuery}" returned ${totalResults} results`
    );

    return res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: {
        query: searchQuery,
        totalResults,
        results,
      },
    });
  } catch (error) {
    logger.error("Error in global search:", error);
    next(error);
  }
};

/**
 * Unified search with all results sorted by rank
 * GET /api/search/unified?q=query&globalLimit=20
 */
export const handleUnifiedSearch = async (req, res, next) => {
  try {
    const {
      q: searchQuery,
      entities,
      limit = 10,
      globalLimit = 50,
      minRank = 0.01,
    } = req.query;

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
        data: null,
      });
    }

    // Parse entities if provided
    const entityList = entities
      ? entities.split(",").map((e) => e.trim())
      : null;

    const options = {
      entities: entityList,
      limit: parseInt(limit, 10),
      globalLimit: parseInt(globalLimit, 10),
      minRank: parseFloat(minRank),
    };

    const results = await unifiedSearch(searchQuery, options);

    logger.info(
      `Unified search for "${searchQuery}" returned ${results.length} results`
    );

    return res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: {
        query: searchQuery,
        totalResults: results.length,
        results,
      },
    });
  } catch (error) {
    logger.error("Error in unified search:", error);
    next(error);
  }
};

/**
 * Search within a specific entity type
 * GET /api/search/users?q=query&limit=20
 * GET /api/search/medications?q=query
 */
export const handleEntitySearch = async (req, res, next) => {
  try {
    const { entityType } = req.params;
    const { q: searchQuery, limit = 50, minRank = 0.01 } = req.query;

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
        data: null,
      });
    }

    const options = {
      limit: parseInt(limit, 10),
      minRank: parseFloat(minRank),
    };

    const results = await searchByEntity(entityType, searchQuery, options);

    logger.info(
      `Entity search in ${entityType} for "${searchQuery}" returned ${results.length} results`
    );

    return res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: {
        query: searchQuery,
        entityType,
        totalResults: results.length,
        results,
      },
    });
  } catch (error) {
    if (error.message.startsWith("Unknown entity type")) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
      });
    }
    logger.error(`Error in entity search (${req.params.entityType}):`, error);
    next(error);
  }
};

/**
 * Get search suggestions/autocomplete
 * GET /api/search/suggestions/:entityType?q=query&limit=5
 */
export const handleSearchSuggestions = async (req, res, next) => {
  try {
    const { entityType } = req.params;
    const { q: searchQuery, limit = 5 } = req.query;

    if (!searchQuery) {
      return res.status(200).json({
        success: true,
        message: "No search query provided",
        data: {
          suggestions: [],
        },
      });
    }

    const suggestions = await getSearchSuggestions(
      entityType,
      searchQuery,
      parseInt(limit, 10)
    );

    return res.status(200).json({
      success: true,
      message: "Suggestions retrieved successfully",
      data: {
        query: searchQuery,
        entityType,
        suggestions,
      },
    });
  } catch (error) {
    if (error.message.startsWith("Unknown entity type")) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
      });
    }
    logger.error(
      `Error getting suggestions (${req.params.entityType}):`,
      error
    );
    next(error);
  }
};

/**
 * Get available entity types for search
 * GET /api/search/entities
 */
export const handleGetEntityTypes = async (req, res, next) => {
  try {
    const entityTypes = getAvailableEntityTypes();

    return res.status(200).json({
      success: true,
      message: "Entity types retrieved successfully",
      data: {
        entityTypes,
        count: entityTypes.length,
      },
    });
  } catch (error) {
    logger.error("Error getting entity types:", error);
    next(error);
  }
};

export default {
  handleGlobalSearch,
  handleUnifiedSearch,
  handleEntitySearch,
  handleSearchSuggestions,
  handleGetEntityTypes,
};
