import asyncHandler from "express-async-handler";

import { warehouseRackService } from "../../services/warehouse/warehouseRackService.js";

export const warehouseRackController = {
  // Create a new warehouse rack
  create: asyncHandler(async (req, res) => {
    const payload = req.body;

    if (Array.isArray(payload)) {
      // Normalize each item to expected shape
      const items = payload.map((p) => ({
        zoneId: p.zoneId,
        code: p.code,
        name: p.name,
        description: p.description,
      }));

      const racks = await warehouseRackService.create(items);
      return res.status(201).json({
        success: true,
        message: "Warehouse racks created successfully",
        data: racks,
      });
    }

    const rack = await warehouseRackService.create({
      zoneId: payload.zoneId, // UUID, no parsing needed
      code: payload.code,
      name: payload.name,
      description: payload.description,
    });
    res.status(201).json({
      success: true,
      message: "Warehouse rack created successfully",
      data: rack,
    });
  }),

  // Create warehouse racks in batch with auto-generated codes
  createBatch: asyncHandler(async (req, res) => {
    const { quantity, code_prefix = "RACK", name_prefix = "Rack" } = req.body;
    const zoneId = req.params.zoneId; // UUID, no parsing needed

    // Generate rack data
    const racks = [];
    for (let i = 1; i <= quantity; i++) {
      racks.push({
        zoneId,
        code: `${code_prefix}-${String(i).padStart(3, "0")}`,
        name: `${name_prefix} ${i}`,
      });
    }

    const createdRacks = await warehouseRackService.create(racks);
    res.status(201).json({
      success: true,
      message: `${quantity} warehouse racks created successfully`,
      data: createdRacks,
    });
  }),

  // Get all warehouse racks
  getAll: asyncHandler(async (req, res) => {
    const filters = {
      search: req.query.search,
      zoneId: req.query.zoneId || undefined,
      limit: req.query.limit || 100,
      offset: req.query.offset || 0,
    };
    const racks = await warehouseRackService.getAll(filters);
    res.json({
      success: true,
      data: racks,
    });
  }),

  // Get warehouse rack by ID
  getById: asyncHandler(async (req, res) => {
    const rack = await warehouseRackService.getById(req.params.id);
    if (!rack) {
      return res.status(404).json({
        success: false,
        message: "Warehouse rack not found",
      });
    }
    res.json({
      success: true,
      data: rack,
    });
  }),

  // Get racks by zone ID
  getByZoneId: asyncHandler(async (req, res) => {
    const racks = await warehouseRackService.getByZoneId(req.params.zoneId);
    res.json({
      success: true,
      data: racks,
    });
  }),

  // Update warehouse rack
  update: asyncHandler(async (req, res) => {
    const updateData = { ...req.body };
    // zoneId is UUID, no conversion needed

    const rack = await warehouseRackService.update(
      Number.parseInt(req.params.id),
      updateData
    );
    if (!rack) {
      return res.status(404).json({
        success: false,
        message: "Warehouse rack not found",
      });
    }
    res.json({
      success: true,
      message: "Warehouse rack updated successfully",
      data: rack,
    });
  }),

  // Delete warehouse rack
  delete: asyncHandler(async (req, res) => {
    const rack = await warehouseRackService.delete(req.params.id);
    if (!rack) {
      return res.status(404).json({
        success: false,
        message: "Warehouse rack not found",
      });
    }
    res.json({
      success: true,
      message: "Warehouse rack deleted successfully",
      data: rack,
    });
  }),
};

export default warehouseRackController;
