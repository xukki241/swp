import asyncHandler from "express-async-handler";

import { warehouseZoneService } from "../../services/warehouse/warehouseZoneService.js";

export const warehouseZoneController = {
  // Create a new warehouse zone
  create: asyncHandler(async (req, res) => {
    const payload = req.body;

    if (Array.isArray(payload)) {
      // For batch create, optionally check duplicates by code in request
      const codes = payload.map((z) => z.code).filter(Boolean);
      if (codes.length !== new Set(codes).size) {
        return res.status(400).json({
          success: false,
          message: "Duplicate zone codes in request payload",
        });
      }

      const zones = await warehouseZoneService.create(payload);
      return res.status(201).json({
        success: true,
        message: "Warehouse zones created successfully",
        data: zones,
      });
    }

    // Single create
    // Check if code already exists
    const existingZone = await warehouseZoneService.getByCode(payload.code);
    if (existingZone) {
      return res.status(400).json({
        success: false,
        message: `Zone with code '${payload.code}' already exists`,
      });
    }

    const zone = await warehouseZoneService.create(payload);
    res.status(201).json({
      success: true,
      message: "Warehouse zone created successfully",
      data: zone,
    });
  }),

  // Get all warehouse zones
  getAll: asyncHandler(async (req, res) => {
    const filters = {
      search: req.query.search,
      type: req.query.type,
      limit: req.query.limit || 100,
      offset: req.query.offset || 0,
    };
    const zones = await warehouseZoneService.getAll(filters);
    res.json({
      success: true,
      data: zones,
    });
  }),

  // Get warehouse zone by ID
  getById: asyncHandler(async (req, res) => {
    const zone = await warehouseZoneService.getById(req.params.id);
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: "Warehouse zone not found",
      });
    }
    res.json({
      success: true,
      data: zone,
    });
  }),

  // Update warehouse zone
  update: asyncHandler(async (req, res) => {
    const id = req.params.id;

    // If code is being updated, check if new code already exists
    if (req.body.code) {
      const existingZone = await warehouseZoneService.getByCode(req.body.code);
      if (existingZone && existingZone.id !== id) {
        return res.status(400).json({
          success: false,
          message: `Zone with code '${req.body.code}' already exists`,
        });
      }
    }

    const zone = await warehouseZoneService.update(id, req.body);
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: "Warehouse zone not found",
      });
    }
    res.json({
      success: true,
      message: "Warehouse zone updated successfully",
      data: zone,
    });
  }),

  // Delete warehouse zone
  delete: asyncHandler(async (req, res) => {
    const zone = await warehouseZoneService.delete(req.params.id);
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: "Warehouse zone not found",
      });
    }
    res.json({
      success: true,
      message: "Warehouse zone deleted successfully",
      data: zone,
    });
  }),
};

export default warehouseZoneController;
