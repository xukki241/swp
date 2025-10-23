import { and, desc, eq, gt, sql } from "drizzle-orm";

import { db } from "../db/index.js";
import {
  customers,
  inventory,
  medications,
  medicationVariants,
  purchaseOrders,
  salesOrders,
  suppliers,
  users,
  warehouseBins,
  warehouseRacks,
  warehouseZones,
} from "../db/schema/index.js";

/**
 * Search configuration for each entity type
 * Defines which table to search, which fields to return, and join logic
 */
const SEARCH_ENTITIES = {
  users: {
    table: users,
    selectFields: {
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      address: users.address,
      role: users.role,
      status: users.status,
    },
    rankField: users.searchVector,
  },
  customers: {
    table: customers,
    selectFields: {
      id: customers.id,
      name: customers.name,
      email: customers.email,
      phone: customers.phone,
      address: customers.address,
    },
    rankField: customers.searchVector,
  },
  suppliers: {
    table: suppliers,
    selectFields: {
      id: suppliers.id,
      name: suppliers.name,
      contactName: suppliers.contactName,
      email: suppliers.email,
      phone: suppliers.phone,
      address: suppliers.address,
      status: suppliers.status,
    },
    rankField: suppliers.searchVector,
  },
  medications: {
    table: medications,
    selectFields: {
      id: medications.id,
      name: medications.name,
      brand: medications.brand,
      description: medications.description,
      status: medications.status,
      isPrescriptionRequired: medications.isPrescriptionRequired,
      isControlledSubstance: medications.isControlledSubstance,
    },
    rankField: medications.searchVector,
  },
  medicationVariants: {
    table: medicationVariants,
    selectFields: {
      id: medicationVariants.id,
      medicationId: medicationVariants.medicationId,
      sku: medicationVariants.sku,
      name: medicationVariants.name,
      unit: medicationVariants.unit,
      barcode: medicationVariants.barcode,
      sellPrice: medicationVariants.sellPrice,
      isActive: medicationVariants.isActive,
      isForSale: medicationVariants.isForSale,
    },
    rankField: medicationVariants.searchVector,
    joins: [
      {
        table: medications,
        on: eq(medicationVariants.medicationId, medications.id),
        fields: {
          medicationName: medications.name,
          medicationBrand: medications.brand,
        },
      },
    ],
  },
  inventory: {
    table: inventory,
    selectFields: {
      id: inventory.id,
      medicationVariantId: inventory.medicationVariantId,
      batchNumber: inventory.batchNumber,
      manufactureDate: inventory.manufactureDate,
      expiryDate: inventory.expiryDate,
      quantity: inventory.quantity,
      quantityReserved: inventory.quantityReserved,
    },
    rankField: inventory.searchVector,
    joins: [
      {
        table: medicationVariants,
        on: eq(inventory.medicationVariantId, medicationVariants.id),
        fields: {
          variantName: medicationVariants.name,
          sku: medicationVariants.sku,
        },
      },
    ],
  },
  purchaseOrders: {
    table: purchaseOrders,
    selectFields: {
      id: purchaseOrders.id,
      supplierId: purchaseOrders.supplierId,
      orderDate: purchaseOrders.orderDate,
      expectedDate: purchaseOrders.expectedDate,
      status: purchaseOrders.status,
      totalAmount: purchaseOrders.totalAmount,
    },
    rankField: purchaseOrders.searchVector,
    joins: [
      {
        table: suppliers,
        on: eq(purchaseOrders.supplierId, suppliers.id),
        fields: {
          supplierName: suppliers.name,
        },
      },
    ],
  },
  salesOrders: {
    table: salesOrders,
    selectFields: {
      id: salesOrders.id,
      customerId: salesOrders.customerId,
      orderDate: salesOrders.orderDate,
      totalAmount: salesOrders.totalAmount,
      status: salesOrders.status,
      paymentMethod: salesOrders.paymentMethod,
    },
    rankField: salesOrders.searchVector,
    joins: [
      {
        table: customers,
        on: eq(salesOrders.customerId, customers.id),
        fields: {
          customerName: customers.name,
        },
      },
    ],
  },
  warehouseZones: {
    table: warehouseZones,
    selectFields: {
      id: warehouseZones.id,
      code: warehouseZones.code,
      name: warehouseZones.name,
      type: warehouseZones.type,
      location: warehouseZones.location,
      description: warehouseZones.description,
    },
    rankField: warehouseZones.searchVector,
  },
  warehouseRacks: {
    table: warehouseRacks,
    selectFields: {
      id: warehouseRacks.id,
      zoneId: warehouseRacks.zoneId,
      code: warehouseRacks.code,
      name: warehouseRacks.name,
      description: warehouseRacks.description,
    },
    rankField: warehouseRacks.searchVector,
    joins: [
      {
        table: warehouseZones,
        on: eq(warehouseRacks.zoneId, warehouseZones.id),
        fields: {
          zoneName: warehouseZones.name,
          zoneCode: warehouseZones.code,
        },
      },
    ],
  },
  warehouseBins: {
    table: warehouseBins,
    selectFields: {
      id: warehouseBins.id,
      rackId: warehouseBins.rackId,
      code: warehouseBins.code,
      name: warehouseBins.name,
      level: warehouseBins.level,
      number: warehouseBins.number,
      description: warehouseBins.description,
    },
    rankField: warehouseBins.searchVector,
    joins: [
      {
        table: warehouseRacks,
        on: eq(warehouseBins.rackId, warehouseRacks.id),
        fields: {
          rackName: warehouseRacks.name,
          rackCode: warehouseRacks.code,
        },
      },
    ],
  },
};

/**
 * Build a full-text search query for a specific entity type
 * @param {string} entityType - The entity type to search (e.g., 'users', 'medications')
 * @param {string} searchQuery - The search query string
 * @param {number} limit - Maximum number of results to return
 * @param {number} minRank - Minimum rank score for results
 * @returns {Promise<Array>} Array of search results with rank scores
 */
async function searchEntity(entityType, searchQuery, limit = 10, minRank = 0.01) {
  const config = SEARCH_ENTITIES[entityType];
  if (!config) {
    throw new Error(`Unknown entity type: ${entityType}`);
  }

  // Convert search query to tsquery format
  const tsQuery = searchQuery
    .trim()
    .split(/\s+/)
    .map(term => `${term}:*`)
    .join(" & ");

  // Build the select fields including rank
  const selectFields = {
    ...config.selectFields,
    rank: sql`ts_rank(${config.rankField}, to_tsquery('english', ${tsQuery}))`.as("rank"),
  };

  // Add joined fields if any
  if (config.joins) {
    config.joins.forEach((join) => {
      Object.assign(selectFields, join.fields);
    });
  }

  // Build the query
  let query = db
    .select(selectFields)
    .from(config.table)
    .$dynamic();

  // Add joins
  if (config.joins) {
    config.joins.forEach((join) => {
      query = query.leftJoin(join.table, join.on);
    });
  }

  // Add FTS filter and order by rank
  query = query
    .where(
      and(
        sql`${config.rankField} @@ to_tsquery('english', ${tsQuery})`,
        gt(sql`ts_rank(${config.rankField}, to_tsquery('english', ${tsQuery}))`, minRank)
      )
    )
    .orderBy(desc(sql`ts_rank(${config.rankField}, to_tsquery('english', ${tsQuery}))`))
    .limit(limit);

  const results = await query;

  return results.map((result) => ({
    ...result,
    entityType,
  }));
}

/**
 * Search across all entity types
 * @param {string} searchQuery - The search query string
 * @param {Object} options - Search options
 * @param {Array<string>} options.entities - Array of entity types to search (null = all)
 * @param {number} options.limit - Maximum results per entity type
 * @param {number} options.minRank - Minimum rank score
 * @returns {Promise<Object>} Object with results grouped by entity type
 */
export async function globalSearch(searchQuery, options = {}) {
  const {
    entities = null,
    limit = 10,
    minRank = 0.01,
  } = options;

  if (!searchQuery || searchQuery.trim().length === 0) {
    return {};
  }

  const entityTypes = entities || Object.keys(SEARCH_ENTITIES);

  // Search all entity types in parallel
  const searchPromises = entityTypes.map(async (entityType) => {
    try {
      const results = await searchEntity(entityType, searchQuery, limit, minRank);
      return { entityType, results };
    } catch (error) {
      console.error(`Error searching ${entityType}:`, error);
      return { entityType, results: [] };
    }
  });

  const searchResults = await Promise.all(searchPromises);

  // Group results by entity type
  const groupedResults = {};
  searchResults.forEach(({ entityType, results }) => {
    groupedResults[entityType] = results;
  });

  return groupedResults;
}

/**
 * Search a specific entity type with filters
 * @param {string} entityType - The entity type to search
 * @param {string} searchQuery - The search query string
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Array of search results
 */
export async function searchByEntity(entityType, searchQuery, options = {}) {
  const { limit = 50, minRank = 0.01 } = options;

  if (!searchQuery || searchQuery.trim().length === 0) {
    return [];
  }

  return await searchEntity(entityType, searchQuery, limit, minRank);
}

/**
 * Get search suggestions/autocomplete for an entity type
 * @param {string} entityType - The entity type to search
 * @param {string} searchQuery - The search query string
 * @param {number} limit - Maximum number of suggestions
 * @returns {Promise<Array>} Array of suggestions
 */
export async function getSearchSuggestions(entityType, searchQuery, limit = 5) {
  const config = SEARCH_ENTITIES[entityType];
  if (!config) {
    throw new Error(`Unknown entity type: ${entityType}`);
  }

  if (!searchQuery || searchQuery.trim().length === 0) {
    return [];
  }

  // For suggestions, we use a more lenient search (prefix matching)
  const tsQuery = searchQuery
    .trim()
    .split(/\s+/)
    .map(term => `${term}:*`)
    .join(" | "); // OR instead of AND for more results

  const selectFields = {
    id: config.table.id,
    rank: sql`ts_rank(${config.rankField}, to_tsquery('english', ${tsQuery}))`.as("rank"),
  };

  // Add primary display field (usually 'name')
  if (config.selectFields.name) {
    selectFields.name = config.selectFields.name;
  }
  if (config.selectFields.email) {
    selectFields.email = config.selectFields.email;
  }
  if (config.selectFields.sku) {
    selectFields.sku = config.selectFields.sku;
  }

  const results = await db
    .select(selectFields)
    .from(config.table)
    .where(sql`${config.rankField} @@ to_tsquery('english', ${tsQuery})`)
    .orderBy(desc(sql`ts_rank(${config.rankField}, to_tsquery('english', ${tsQuery}))`))
    .limit(limit);

  return results;
}

/**
 * Get available entity types for search
 * @returns {Array<string>} Array of entity type names
 */
export function getAvailableEntityTypes() {
  return Object.keys(SEARCH_ENTITIES);
}

/**
 * Combined search with unified results sorted by rank
 * @param {string} searchQuery - The search query string
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Unified array of search results sorted by rank
 */
export async function unifiedSearch(searchQuery, options = {}) {
  const groupedResults = await globalSearch(searchQuery, options);

  // Flatten and sort all results by rank
  const allResults = [];
  Object.entries(groupedResults).forEach(([entityType, results]) => {
    allResults.push(...results);
  });

  // Sort by rank (highest first)
  allResults.sort((a, b) => parseFloat(b.rank) - parseFloat(a.rank));

  // Apply global limit if specified
  if (options.globalLimit) {
    return allResults.slice(0, options.globalLimit);
  }

  return allResults;
}

export default {
  globalSearch,
  searchByEntity,
  getSearchSuggestions,
  getAvailableEntityTypes,
  unifiedSearch,
};

