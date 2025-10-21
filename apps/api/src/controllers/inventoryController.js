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
      data: result.data || [],
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasMore: offset + (result.data ? result.data.length : 0) < result.total,
      },
    });
  }),

  /**
   * GET /api/inventory/batches/:inventoryBatchId - Get inventory by ID
   */
  getById: asyncHandler(async (req, res) => {
    const id = req.params.inventoryBatchId || req.params.id;
    const item = await inventoryService.getById(id);

    if (!item) {
      return res.status(404).json({
        error: "Inventory item not found",
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
    const limit = req.query.limit ? Number.parseInt(req.query.limit) : 50;
    const offset = req.query.offset
      ? Number.parseInt(req.query.offset)
      : (page - 1) * limit;
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

  /**
   * GET /api/inventory/by-location - Get inventory grouped by location
   */
  getByLocation: asyncHandler(async (req, res) => {
    const filters = {
      zoneId: req.query.zoneId,
      rackId: req.query.rackId,
    };

    const data = await inventoryService.getByLocation(filters);

    res.json({
      success: true,
      data,
    });
  }),

  /**
   * POST /api/inventory/adjust - Adjust inventory quantity
   */
  adjustQuantity: asyncHandler(async (req, res) => {
    const { inventoryId, adjustmentType, quantity, reason, notes } = req.body;

    // Validate required fields
    if (!inventoryId || !adjustmentType || !quantity) {
      return res.status(400).json({
        success: false,
        message: "inventoryId, adjustmentType, and quantity are required",
      });
    }

    // Validate adjustment type
    if (!["increase", "decrease"].includes(adjustmentType)) {
      return res.status(400).json({
        success: false,
        message: "adjustmentType must be 'increase' or 'decrease'",
      });
    }

    const result = await inventoryService.adjustQuantity({
      inventoryId,
      adjustmentType,
      quantity: Number.parseInt(quantity),
      reason,
      notes,
    });

    res.json({
      success: true,
      data: result,
      message: "Inventory adjusted successfully",
    });
  }),

  /**
   * POST /api/inventory/transfer - Transfer inventory between bins
   */
  transferInventory: asyncHandler(async (req, res) => {
    const { inventoryId, fromBinId, toBinId, quantity, reason } = req.body;

    // Validate required fields
    if (!inventoryId || !fromBinId || !toBinId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "inventoryId, fromBinId, toBinId, and quantity are required",
      });
    }

    // Validate same bin transfer
    if (fromBinId === toBinId) {
      return res.status(400).json({
        success: false,
        message: "Cannot transfer to the same bin",
      });
    }

    const result = await inventoryService.transferInventory({
      inventoryId,
      fromBinId,
      toBinId,
      quantity: Number.parseInt(quantity),
      reason,
    });

    res.json({
      success: true,
      data: result,
      message: "Inventory transferred successfully",
    });
  }),

  /**
   * POST /api/inventory/reserve - Reserve inventory
   */
  reserveInventory: asyncHandler(async (req, res) => {
    const { inventoryId, quantity, reservationReason } = req.body;

    // Validate required fields
    if (!inventoryId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "inventoryId and quantity are required",
      });
    }

    const result = await inventoryService.reserveInventory({
      inventoryId,
      quantity: Number.parseInt(quantity),
      reservationReason,
    });

    res.json({
      success: true,
      data: result,
      message: "Inventory reserved successfully",
    });
  }),

  /**
   * POST /api/inventory/unreserve - Unreserve inventory
   */
  unreserveInventory: asyncHandler(async (req, res) => {
    const { inventoryId, quantity } = req.body;

    // Validate required fields
    if (!inventoryId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "inventoryId and quantity are required",
      });
    }

    const result = await inventoryService.unreserveInventory({
      inventoryId,
      quantity: Number.parseInt(quantity),
    });

    res.json({
      success: true,
      data: result,
      message: "Inventory unreserved successfully",
    });
  }),
};

export default inventoryController;
