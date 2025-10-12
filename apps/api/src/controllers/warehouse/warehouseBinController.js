import asyncHandler from "express-async-handler";

import { inventoryService } from "../../services/inventoryService.js";
import { warehouseBinService } from "../../services/warehouse/warehouseBinService.js";

export const warehouseBinController = {
  // Create a new warehouse bin
  create: asyncHandler(async (req, res) => {
    const payload = req.body;

    if (Array.isArray(payload)) {
      const items = payload.map((p) => ({
        rackId: p.rackId,
        code: p.code,
        name: p.name,
        level: p.level,
        number: p.number,
        description: p.description,
      }));

      const bins = await warehouseBinService.create(items);
      return res.status(201).json({
        success: true,
        message: "Warehouse bins created successfully",
        data: bins,
      });
    }

    const bin = await warehouseBinService.create({
      rackId: payload.rackId,
      code: payload.code,
      name: payload.name,
      level: payload.level,
      number: payload.number,
      description: payload.description,
    });
    res.status(201).json({
      success: true,
      message: "Warehouse bin created successfully",
      data: bin,
    });
  }),

  // Get all warehouse bins
  getAll: asyncHandler(async (req, res) => {
    const filters = {
      search: req.query.search,
      rackId: req.query.rackId ? req.query.rackId : undefined,
      zoneId: req.query.zoneId ? req.query.zoneId : undefined,
      level: req.query.level !== undefined ? req.query.level : undefined,
      limit: req.query.limit || 100,
      offset: req.query.offset || 0,
    };
    const bins = await warehouseBinService.getAll(filters);
    res.json({
      success: true,
      data: bins,
    });
  }),

  // Get warehouse bin by ID
  getById: asyncHandler(async (req, res) => {
    const bin = await warehouseBinService.getById(
      Number.parseInt(req.params.id)
    );
    if (!bin) {
      return res.status(404).json({
        success: false,
        message: "Warehouse bin not found",
      });
    }
    res.json({
      success: true,
      data: bin,
    });
  }),

  // Get bins by rack ID
  getByRackId: asyncHandler(async (req, res) => {
    const bins = await warehouseBinService.getByRackId(req.params.rackId);
    res.json({
      success: true,
      data: bins,
    });
  }),

  // Update warehouse bin
  update: asyncHandler(async (req, res) => {
    const updateData = { ...req.body };

    const bin = await warehouseBinService.update(req.params.id, updateData);
    if (!bin) {
      return res.status(404).json({
        success: false,
        message: "Warehouse bin not found",
      });
    }
    res.json({
      success: true,
      message: "Warehouse bin updated successfully",
      data: bin,
    });
  }),

  // Delete warehouse bin
  delete: asyncHandler(async (req, res) => {
    const bin = await warehouseBinService.delete(req.params.id);
    if (!bin) {
      return res.status(404).json({
        success: false,
        message: "Warehouse bin not found",
      });
    }
    res.json({
      success: true,
      message: "Warehouse bin deleted successfully",
      data: bin,
    });
  }),

  // Get inventory in a bin
  getInventory: asyncHandler(async (req, res) => {
    const items = await inventoryService.getByBinId(req.params.id);
    res.json({
      success: true,
      data: items,
    });
  }),
};

export default warehouseBinController;
