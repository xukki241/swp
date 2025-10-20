import asyncHandler from "express-async-handler";

import { inventoryService } from "../services/inventoryService.js";

export const inventoryController = {
  /**
   * GET /api/inventory - List all inventory items with pagination
   */
  getAll: asyncHandler(async (req, res) => {
    const page = req.query.page ? Number.parseInt(req.query.page) : 1;
    const limit = req.query.limit ? Number.parseInt(req.query.limit) : 100;
    const offset = (page - 1) * limit;

    const filters = {
      medicationVariantId: req.query.medication_variant_id,
      binId: req.query.bin_id,
      batchNumber: req.query.batchNumber,
      expiryDateFrom: req.query.expiryDateFrom,
      expiryDateTo: req.query.expiryDateTo,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      limit,
      offset,
    };

    const result = await inventoryService.getAll(filters);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasMore: offset + result.data.length < result.total,
      },
    });
  }),

  /**
   * GET /api/inventory/batches/:inventoryBatchId - Get inventory by ID
   */
  getById: asyncHandler(async (req, res) => {
    const item = await inventoryService.getById(req.params.inventoryBatchId);

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
  }),

  /**
   * GET /api/inventory/summary/by-variant - Get inventory summary by medication variant
   */
  getSummaryByVariant: asyncHandler(async (req, res) => {
    const page = req.query.page ? Number.parseInt(req.query.page) : 1;
    const limit = req.query.limit ? Number.parseInt(req.query.limit) : 100;
    const offset = (page - 1) * limit;

    const filters = {
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      limit,
      offset,
    };

    const result = await inventoryService.getSummaryByVariant(filters);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasMore: offset + result.data.length < result.total,
      },
    });
  }),

  /**
   * GET /api/inventory/expiring - Get expiring inventory items
   */
  getExpiringSoon: asyncHandler(async (req, res) => {
    const page = req.query.page ? Number.parseInt(req.query.page) : 1;
    const limit = req.query.limit ? Number.parseInt(req.query.limit) : 100;
    const offset = (page - 1) * limit;
    const daysUntilExpiry = req.query.daysUntilExpiry
      ? Number.parseInt(req.query.daysUntilExpiry)
      : 30;

    const filters = {
      daysUntilExpiry,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      limit,
      offset,
    };

    const result = await inventoryService.getExpiringSoon(filters);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasMore: offset + result.data.length < result.total,
      },
    });
  }),

  /**
   * GET /api/inventory/low-stock - Get low stock items
   */
  getLowStock: asyncHandler(async (req, res) => {
    const page = req.query.page ? Number.parseInt(req.query.page) : 1;
    const limit = req.query.limit ? Number.parseInt(req.query.limit) : 100;
    const offset = (page - 1) * limit;
    const threshold = req.query.threshold
      ? Number.parseFloat(req.query.threshold)
      : 10;

    const filters = {
      threshold,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      limit,
      offset,
    };

    const result = await inventoryService.getLowStock(filters);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasMore: offset + result.data.length < result.total,
      },
    });
  }),

  /**
   * PATCH /api/inventory/batches/:inventoryBatchId - Update inventory item
   */
  update: asyncHandler(async (req, res) => {
    const item = await inventoryService.update(
      req.params.inventoryBatchId,
      req.body
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
  }),

  /**
   * PATCH /api/inventory/batches/:inventoryBatchId/adjust - Adjust inventory quantity
   */
  adjust: asyncHandler(async (req, res) => {
    const { newQuantity, reason } = req.body;

    // Get current inventory
    const currentInventory = await inventoryService.getById(
      req.params.inventoryBatchId
    );
    if (!currentInventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    // Update quantity
    const item = await inventoryService.update(req.params.inventoryBatchId, {
      quantity: newQuantity,
    });

    res.json({
      success: true,
      message: `Inventory adjusted successfully. Reason: ${reason}`,
      data: item,
    });
  }),

  /**
   * POST /api/inventory/move - Move inventory between bins
   */
  move: asyncHandler(async (req, res) => {
    const { fromInventoryId, toBinId, quantity, reason } = req.body;

    // Get source inventory
    const fromInventory = await inventoryService.getById(fromInventoryId);
    if (!fromInventory) {
      return res.status(404).json({
        success: false,
        message: "Source inventory not found",
      });
    }

    // Validate quantity
    const availableQuantity =
      Number(fromInventory.quantity) - Number(fromInventory.quantityReserved);
    if (quantity > availableQuantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient available quantity in source inventory",
      });
    }

    // Perform the move operation
    await inventoryService.move({
      fromInventoryId,
      toBinId,
      quantity,
      reason,
      medicationVariantId: fromInventory.medicationVariantId,
      batchNumber: fromInventory.batchNumber,
      manufactureDate: fromInventory.manufactureDate,
      expiryDate: fromInventory.expiryDate,
      purchaseOrderReceiptItemsId: fromInventory.purchaseOrderReceiptItemsId,
    });

    res.json({
      success: true,
      message: `Inventory moved successfully. Reason: ${reason}`,
    });
  }),
};

export default inventoryController;
