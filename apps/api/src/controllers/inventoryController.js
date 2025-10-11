import { inventoryService } from "../services/inventoryService.js";

export const inventoryController = {
  /**
   * Get all inventory items
   * @route GET /api/inventory
   */
  async getAll(req, res) {
    try {
      const filters = {
        medicationVariantId: req.query.medicationVariantId
          ? Number.parseInt(req.query.medicationVariantId)
          : undefined,
        binId: req.query.binId ? Number.parseInt(req.query.binId) : undefined,
        batchNumber: req.query.batchNumber,
        expiryDateFrom: req.query.expiryDateFrom,
        expiryDateTo: req.query.expiryDateTo,
        zoneId: req.query.zoneId
          ? Number.parseInt(req.query.zoneId)
          : undefined,
        rackId: req.query.rackId
          ? Number.parseInt(req.query.rackId)
          : undefined,
        limit: Number.parseInt(req.query.limit) || 100,
        offset: Number.parseInt(req.query.offset) || 0,
      };

      const items = await inventoryService.getAll(filters);

      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get inventory by ID
   * @route GET /api/inventory/:id
   */
  async getById(req, res) {
    try {
      const item = await inventoryService.getById(
        Number.parseInt(req.params.id)
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Inventory item not found",
        });
      }

      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get inventory summary by medication variant
   * @route GET /api/inventory/summary/by-variant
   */
  async getSummaryByVariant(req, res) {
    try {
      const filters = {
        medicationId: req.query.medicationId
          ? Number.parseInt(req.query.medicationId)
          : undefined,
        zoneId: req.query.zoneId
          ? Number.parseInt(req.query.zoneId)
          : undefined,
        rackId: req.query.rackId
          ? Number.parseInt(req.query.rackId)
          : undefined,
      };

      const summary = await inventoryService.getSummaryByVariant(filters);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get expiring inventory items
   * @route GET /api/inventory/expiring
   */
  async getExpiring(req, res) {
    try {
      const daysUntilExpiry = req.query.days
        ? Number.parseInt(req.query.days)
        : 30;

      const items = await inventoryService.getExpiring(daysUntilExpiry);

      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get low stock items
   * @route GET /api/inventory/low-stock
   */
  async getLowStock(req, res) {
    try {
      const threshold = req.query.threshold
        ? Number.parseInt(req.query.threshold)
        : 10;

      const items = await inventoryService.getLowStock(threshold);

      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Update inventory item
   * @route PATCH /api/inventory/:id
   */
  async update(req, res) {
    try {
      const updateData = { ...req.body };

      // Parse numeric fields
      if (updateData.medicationVariantId) {
        updateData.medicationVariantId = Number.parseInt(
          updateData.medicationVariantId
        );
      }
      if (updateData.binId) {
        updateData.binId = Number.parseInt(updateData.binId);
      }

      const item = await inventoryService.update(
        Number.parseInt(req.params.id),
        updateData
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Inventory item not found",
        });
      }

      res.json({
        success: true,
        message: "Inventory item updated successfully",
        data: item,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};
