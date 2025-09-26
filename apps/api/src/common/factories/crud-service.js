import { eq, and, or, desc, asc, count, sql } from "drizzle-orm";
import { db } from "../../db/connection.js";

/**
 * CRUD Service Factory
 * Creates standardized CRUD operations for any Drizzle table
 *
 * @param {Object} table - Drizzle table schema
 * @param {Object} options - Configuration options
 * @param {string} options.entityName - Name of the entity (for error messages)
 * @param {Array<string>} options.searchableFields - Fields that can be searched
 * @param {string} options.defaultOrderBy - Default field to order by
 * @param {string} options.defaultOrderDirection - Default order direction ('asc' or 'desc')
 * @param {Function} options.beforeCreate - Hook function called before create
 * @param {Function} options.afterCreate - Hook function called after create
 * @param {Function} options.beforeUpdate - Hook function called before update
 * @param {Function} options.afterUpdate - Hook function called after update
 * @param {Function} options.beforeDelete - Hook function called before delete
 * @param {Function} options.afterDelete - Hook function called after delete
 * @returns {Object} CRUD service object
 */
function crudServiceFactory(table, options = {}) {
  const {
    entityName = "Entity",
    searchableFields = [],
    defaultOrderBy = "id",
    defaultOrderDirection = "desc",
    beforeCreate,
    afterCreate,
    beforeUpdate,
    afterUpdate,
    beforeDelete,
    afterDelete,
  } = options;

  /**
   * Create a new record
   * @param {Object} data - Data to insert
   * @returns {Object} Created record
   */
  async function create(data) {
    try {
      // Execute before create hook if provided
      if (beforeCreate) {
        data = await beforeCreate(data);
      }

      const [created] = await db.insert(table).values(data).returning();

      // Execute after create hook if provided
      if (afterCreate) {
        await afterCreate(created, data);
      }

      return created;
    } catch (error) {
      throw new Error(`Failed to create ${entityName}: ${error.message}`);
    }
  }

  /**
   * Find a record by ID
   * @param {number|string} id - Record ID
   * @returns {Object|null} Found record or null
   */
  async function findById(id) {
    try {
      const [record] = await db.select().from(table).where(eq(table.id, id));
      return record || null;
    } catch (error) {
      throw new Error(`Failed to find ${entityName} by ID: ${error.message}`);
    }
  }

  /**
   * Find a single record by conditions
   * @param {Object} conditions - Where conditions
   * @returns {Object|null} Found record or null
   */
  async function findOne(conditions) {
    try {
      const whereConditions = buildWhereConditions(conditions);
      const [record] = await db.select().from(table).where(whereConditions);
      return record || null;
    } catch (error) {
      throw new Error(`Failed to find ${entityName}: ${error.message}`);
    }
  }

  /**
   * Find multiple records with pagination and filtering
   * @param {Object} options - Query options
   * @param {Object} options.where - Where conditions
   * @param {string} options.search - Search term (searches in searchableFields)
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Records per page
   * @param {string} options.orderBy - Field to order by
   * @param {string} options.orderDirection - Order direction ('asc' or 'desc')
   * @returns {Object} { data, pagination }
   */
  async function findMany(options = {}) {
    try {
      const {
        where = {},
        search,
        page = 1,
        limit = 10,
        orderBy = defaultOrderBy,
        orderDirection = defaultOrderDirection,
      } = options;

      let query = db.select().from(table);
      let countQuery = db.select({ count: count() }).from(table);

      // Build where conditions
      const whereConditions = [];

      // Add explicit where conditions
      if (Object.keys(where).length > 0) {
        whereConditions.push(buildWhereConditions(where));
      }

      // Add search conditions
      if (search && searchableFields.length > 0) {
        const searchConditions = searchableFields.map(
          (field) => sql`${table[field]}::text ILIKE ${`%${search}%`}`
        );
        whereConditions.push(or(...searchConditions));
      }

      // Apply where conditions
      if (whereConditions.length > 0) {
        const finalWhere =
          whereConditions.length === 1
            ? whereConditions[0]
            : and(...whereConditions);
        query = query.where(finalWhere);
        countQuery = countQuery.where(finalWhere);
      }

      // Apply ordering
      const orderFn = orderDirection === "asc" ? asc : desc;
      query = query.orderBy(orderFn(table[orderBy]));

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.limit(limit).offset(offset);

      // Execute queries
      const [data, totalResult] = await Promise.all([query, countQuery]);

      const total = totalResult[0].count;
      const totalPages = Math.ceil(total / limit);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Failed to find ${entityName} records: ${error.message}`);
    }
  }

  /**
   * Update a record by ID
   * @param {number|string} id - Record ID
   * @param {Object} data - Data to update
   * @returns {Object|null} Updated record or null if not found
   */
  async function updateById(id, data) {
    try {
      // Execute before update hook if provided
      if (beforeUpdate) {
        data = await beforeUpdate(id, data);
      }

      const [updated] = await db
        .update(table)
        .set(data)
        .where(eq(table.id, id))
        .returning();

      if (!updated) {
        return null;
      }

      // Execute after update hook if provided
      if (afterUpdate) {
        await afterUpdate(updated, data);
      }

      return updated;
    } catch (error) {
      throw new Error(`Failed to update ${entityName}: ${error.message}`);
    }
  }

  /**
   * Update multiple records
   * @param {Object} conditions - Where conditions
   * @param {Object} data - Data to update
   * @returns {Array} Updated records
   */
  async function updateMany(conditions, data) {
    try {
      const whereConditions = buildWhereConditions(conditions);

      // Execute before update hook if provided (for each record)
      if (beforeUpdate) {
        data = await beforeUpdate(null, data);
      }

      const updated = await db
        .update(table)
        .set(data)
        .where(whereConditions)
        .returning();

      // Execute after update hook if provided
      if (afterUpdate) {
        for (const record of updated) {
          await afterUpdate(record, data);
        }
      }

      return updated;
    } catch (error) {
      throw new Error(
        `Failed to update ${entityName} records: ${error.message}`
      );
    }
  }

  /**
   * Delete a record by ID
   * @param {number|string} id - Record ID
   * @returns {Object|null} Deleted record or null if not found
   */
  async function deleteById(id) {
    try {
      // Execute before delete hook if provided
      if (beforeDelete) {
        await beforeDelete(id);
      }

      const [deleted] = await db
        .delete(table)
        .where(eq(table.id, id))
        .returning();

      if (!deleted) {
        return null;
      }

      // Execute after delete hook if provided
      if (afterDelete) {
        await afterDelete(deleted);
      }

      return deleted;
    } catch (error) {
      throw new Error(`Failed to delete ${entityName}: ${error.message}`);
    }
  }

  /**
   * Delete multiple records
   * @param {Object} conditions - Where conditions
   * @returns {Array} Deleted records
   */
  async function deleteMany(conditions) {
    try {
      const whereConditions = buildWhereConditions(conditions);

      // Get records before deletion for hooks
      const recordsToDelete = await db
        .select()
        .from(table)
        .where(whereConditions);

      // Execute before delete hook if provided
      if (beforeDelete) {
        for (const record of recordsToDelete) {
          await beforeDelete(record.id);
        }
      }

      const deleted = await db.delete(table).where(whereConditions).returning();

      // Execute after delete hook if provided
      if (afterDelete) {
        for (const record of deleted) {
          await afterDelete(record);
        }
      }

      return deleted;
    } catch (error) {
      throw new Error(
        `Failed to delete ${entityName} records: ${error.message}`
      );
    }
  }

  /**
   * Count records matching conditions
   * @param {Object} conditions - Where conditions
   * @returns {number} Count of matching records
   */
  async function countRecords(conditions = {}) {
    try {
      let query = db.select({ count: count() }).from(table);

      if (Object.keys(conditions).length > 0) {
        const whereConditions = buildWhereConditions(conditions);
        query = query.where(whereConditions);
      }

      const [result] = await query;
      return result.count;
    } catch (error) {
      throw new Error(
        `Failed to count ${entityName} records: ${error.message}`
      );
    }
  }

  /**
   * Check if a record exists
   * @param {Object} conditions - Where conditions
   * @returns {boolean} True if record exists
   */
  async function exists(conditions) {
    try {
      const count = await countRecords(conditions);
      return count > 0;
    } catch (error) {
      throw new Error(
        `Failed to check if ${entityName} exists: ${error.message}`
      );
    }
  }

  /**
   * Build where conditions from object
   * @param {Object} conditions - Conditions object
   * @returns {SQL} Drizzle where condition
   */
  function buildWhereConditions(conditions) {
    const whereConditions = [];

    for (const [key, value] of Object.entries(conditions)) {
      if (value !== null && value !== undefined) {
        if (table[key]) {
          whereConditions.push(eq(table[key], value));
        }
      }
    }

    return whereConditions.length === 1
      ? whereConditions[0]
      : and(...whereConditions);
  }

  // Return the service object
  return {
    // CRUD operations
    create,
    findById,
    findOne,
    findMany,
    updateById,
    updateMany,
    deleteById,
    deleteMany,

    // Utility operations
    countRecords,
    exists,

    // Table reference for advanced operations
    table,

    // Configuration
    config: {
      entityName,
      searchableFields,
      defaultOrderBy,
      defaultOrderDirection,
    },
  };
}

// Export as default
export default crudServiceFactory;

// Named exports for convenience
export { crudServiceFactory };
