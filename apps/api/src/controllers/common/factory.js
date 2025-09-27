/**
 * CRUD Controller Factory
 * Creates standardized CRUD controllers for any service
 *
 * @param {Object} service - Service object with CRUD operations
 * @param {Object} options - Configuration options
 * @param {string} options.entityName - Name of the entity (for responses)
 * @param {Array<string>} options.allowedSortFields - Fields that can be used for sorting
 * @param {Function} options.beforeCreate - Hook function called before create
 * @param {Function} options.afterCreate - Hook function called after create
 * @param {Function} options.beforeUpdate - Hook function called before update
 * @param {Function} options.afterUpdate - Hook function called after update
 * @param {Function} options.beforeDelete - Hook function called before delete
 * @param {Function} options.afterDelete - Hook function called after delete
 * @param {Function} options.transformResponse - Transform response data
 * @returns {Object} CRUD controller object
 */
function crudControllerFactory(service, options = {}) {
  const {
    entityName = service.config?.entityName || "Entity",
    allowedSortFields = service.config?.searchableFields || [],
    beforeCreate,
    afterCreate,
    beforeUpdate,
    afterUpdate,
    beforeDelete,
    afterDelete,
    transformResponse,
  } = options;

  /**
   * Create a new record
   * POST /resource
   */
  async function create(request, res) {
    try {
      // Before create hook
      let data = request.body;
      if (beforeCreate) {
        data = await beforeCreate(data, request);
      }

      // Create record
      const created = await service.create(data);

      // After create hook
      if (afterCreate) {
        await afterCreate(created, data, request);
      }

      // Transform response if needed
      const responseData = transformResponse
        ? transformResponse(created)
        : created;

      res.status(201).json({
        success: true,
        data: responseData,
        message: `${entityName} created successfully`,
      });
    } catch (error) {
      console.error(`Error creating ${entityName}:`, error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: `Failed to create ${entityName}`,
      });
    }
  }

  /**
   * Get a record by ID
   * GET /resource/:id
   */
  async function getById(request, res) {
    try {
      const parameters = request.params;
      const { id } = parameters;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "ID is required",
          message: `ID parameter is missing`,
        });
      }

      const record = await service.findById(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          error: "Not found",
          message: `${entityName} with ID ${id} not found`,
        });
      }

      // Transform response if needed
      const responseData = transformResponse
        ? transformResponse(record)
        : record;

      res.json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      console.error(`Error getting ${entityName} by ID:`, error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: `Failed to get ${entityName}`,
      });
    }
  }

  /**
   * Get multiple records with pagination and filtering
   * GET /resource
   */
  async function getMany(request, res) {
    try {
      const queryParameters = request.query;
      const {
        page = 1,
        limit = 10,
        search,
        orderBy = service.config?.defaultOrderBy || "id",
        orderDirection = service.config?.defaultOrderDirection || "desc",
        ...filters
      } = queryParameters;

      // Validate pagination parameters
      const parsedPage = Number.parseInt(page);
      const parsedLimit = Math.min(Number.parseInt(limit), 100); // Max 100 records per page

      if (parsedPage < 1) {
        return res.status(400).json({
          success: false,
          error: "Invalid page number",
          message: "Page number must be greater than 0",
        });
      }

      if (parsedLimit < 1) {
        return res.status(400).json({
          success: false,
          error: "Invalid limit",
          message: "Limit must be greater than 0",
        });
      }

      // Validate sort field
      if (
        allowedSortFields.length > 0 &&
        !allowedSortFields.includes(orderBy)
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid sort field",
          message: `Sort field must be one of: ${allowedSortFields.join(", ")}`,
        });
      }

      // Validate sort direction
      if (!["asc", "desc"].includes(orderDirection)) {
        return res.status(400).json({
          success: false,
          error: "Invalid sort direction",
          message: "Sort direction must be 'asc' or 'desc'",
        });
      }

      const result = await service.findMany({
        where: filters,
        search,
        page: parsedPage,
        limit: parsedLimit,
        orderBy,
        orderDirection,
      });

      // Transform response data if needed
      const responseData = transformResponse
        ? {
            ...result,
            data: result.data.map(transformResponse),
          }
        : result;

      res.json({
        success: true,
        ...responseData,
      });
    } catch (error) {
      console.error(`Error getting ${entityName} records:`, error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: `Failed to get ${entityName} records`,
      });
    }
  }

  /**
   * Update a record by ID
   * PUT /resource/:id
   */
  async function updateById(request, res) {
    try {
      const parameters = request.params;
      const { id } = parameters;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "ID is required",
          message: `ID parameter is missing`,
        });
      }

      // Before update hook
      let data = request.body;
      if (beforeUpdate) {
        data = await beforeUpdate(id, data, request);
      }

      // Update record
      const updated = await service.updateById(id, data);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: "Not found",
          message: `${entityName} with ID ${id} not found`,
        });
      }

      // After update hook
      if (afterUpdate) {
        await afterUpdate(updated, data, request);
      }

      // Transform response if needed
      const responseData = transformResponse
        ? transformResponse(updated)
        : updated;

      res.json({
        success: true,
        data: responseData,
        message: `${entityName} updated successfully`,
      });
    } catch (error) {
      console.error(`Error updating ${entityName}:`, error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: `Failed to update ${entityName}`,
      });
    }
  }

  /**
   * Partially update a record by ID
   * PATCH /resource/:id
   */
  async function patchById(request, res) {
    // For PATCH, we use the same logic as PUT but it's more semantic for partial updates
    return updateById(request, res);
  }

  /**
   * Delete a record by ID
   * DELETE /resource/:id
   */
  async function deleteById(request, res) {
    try {
      const parameters = request.params;
      const { id } = parameters;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "ID is required",
          message: `ID parameter is missing`,
        });
      }

      // Before delete hook
      if (beforeDelete) {
        await beforeDelete(id, request);
      }

      // Delete record
      const deleted = await service.deleteById(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: "Not found",
          message: `${entityName} with ID ${id} not found`,
        });
      }

      // After delete hook
      if (afterDelete) {
        await afterDelete(deleted, request);
      }

      res.json({
        success: true,
        data: deleted,
        message: `${entityName} deleted successfully`,
      });
    } catch (error) {
      console.error(`Error deleting ${entityName}:`, error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: `Failed to delete ${entityName}`,
      });
    }
  }

  /**
   * Count records
   * GET /resource/count
   */
  async function count(request, res) {
    try {
      const queryParameters = request.query;
      const { search: _search, ...filters } = queryParameters;

      const conditions = filters;

      // If search is provided, we need to handle it differently
      // For now, we'll just count with basic filters
      const totalCount = await service.countRecords(conditions);

      res.json({
        success: true,
        data: {
          count: totalCount,
        },
      });
    } catch (error) {
      console.error(`Error counting ${entityName} records:`, error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: `Failed to count ${entityName} records`,
      });
    }
  }

  /**
   * Check if record exists
   * HEAD /resource/:id
   */
  async function existsById(request, res) {
    try {
      const parameters = request.params;
      const { id } = parameters;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "ID is required",
          message: `ID parameter is missing`,
        });
      }

      const exists = await service.exists({ id });

      if (exists) {
        res.status(200).send();
      } else {
        res.status(404).send();
      }
    } catch (error) {
      console.error(`Error checking if ${entityName} exists:`, error);
      res.status(500).send();
    }
  }

  /**
   * Bulk create records
   * POST /resource/bulk
   */
  async function bulkCreate(request, res) {
    try {
      const { items } = request.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid items array",
          message: "Items must be a non-empty array",
        });
      }

      const results = [];
      const errors = [];

      // Process each item
      for (const [index, itemData] of items.entries()) {
        let data = itemData;
        try {
          // Before create hook
          if (beforeCreate) {
            data = await beforeCreate(data, request);
          }

          const created = await service.create(data);

          // After create hook
          if (afterCreate) {
            await afterCreate(created, data, request);
          }

          results.push(created);
        } catch (error) {
          errors.push({
            index,
            item: data,
            error: error.message,
          });
        }
      }

      res.status(201).json({
        success: true,
        data: {
          created: results,
          errors,
          summary: {
            total: items.length,
            successful: results.length,
            failed: errors.length,
          },
        },
        message: `Bulk create completed: ${results.length}/${items.length} ${entityName} records created`,
      });
    } catch (error) {
      console.error(`Error bulk creating ${entityName} records:`, error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: `Failed to bulk create ${entityName} records`,
      });
    }
  }

  // Return the controller object
  return {
    // Standard CRUD operations
    create,
    getById,
    getMany,
    updateById,
    patchById,
    deleteById,

    // Utility operations
    count,
    existsById,
    bulkCreate,

    // Service reference for advanced operations
    service,

    // Configuration
    config: {
      entityName,
      allowedSortFields,
    },
  };
}

// Export as default
export default crudControllerFactory;

// Named exports for convenience
export { crudControllerFactory };
