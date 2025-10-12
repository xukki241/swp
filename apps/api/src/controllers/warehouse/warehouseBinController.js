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
      rackId: payload.rackId ? Number.parseInt(payload.rackId) : payload.rackId,
      code: payload.code,
      name: payload.name,
      level: payload.level ? Number.parseInt(payload.level) : payload.level,
      number: payload.number ? Number.parseInt(payload.number) : payload.number,
      description: payload.description,
    });
    res.status(201).json({
      success: true,
      message: "Warehouse bin created successfully",
      data: bin,
    });
  }),

  // Create warehouse bins in batch with auto-generated codes
  createBatch: asyncHandler(async (req, res) => {
    const { mode, codePrefix = "BIN", namePrefix = "Bin" } = req.body;
    const rackId = Number.parseInt(req.params.rackId);

    const bins = [];
    let binCounter = 1;

    if (mode === "grid") {
      const { levels, binsPerLevel } = req.body;
      for (let level = 1; level <= levels; level++) {
        for (let number = 1; number <= binsPerLevel; number++) {
          bins.push({
            rackId,
            code: `${codePrefix}-${String(binCounter).padStart(3, "0")}`,
            name: `${namePrefix} ${binCounter}`,
            level,
            number,
          });
          binCounter++;
        }
      }
    } else if (mode === "list") {
      const { binsPerLevelList } = req.body;
      for (let level = 0; level < binsPerLevelList.length; level++) {
        const binsInThisLevel = binsPerLevelList[level];
        for (let number = 1; number <= binsInThisLevel; number++) {
          bins.push({
            rackId,
            code: `${codePrefix}-${String(binCounter).padStart(3, "0")}`,
            name: `${namePrefix} ${binCounter}`,
            level: level + 1,
            number,
          });
          binCounter++;
        }
      }
    }

    const createdBins = await warehouseBinService.create(bins);
    res.status(201).json({
      success: true,
      message: `${bins.length} warehouse bins created successfully`,
      data: createdBins,
    });
  }),

  // Get all warehouse bins
  getAll: asyncHandler(async (req, res) => {
    const filters = {
      search: req.query.search,
      rackId: req.query.rackId ? Number.parseInt(req.query.rackId) : undefined,
      zoneId: req.query.zoneId ? Number.parseInt(req.query.zoneId) : undefined,
      level:
        req.query.level !== undefined
          ? Number.parseInt(req.query.level)
          : undefined,
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
    const bins = await warehouseBinService.getByRackId(
      Number.parseInt(req.params.rackId)
    );
    res.json({
      success: true,
      data: bins,
    });
  }),

  // Update warehouse bin
  update: asyncHandler(async (req, res) => {
    const updateData = { ...req.body };

    // Convert numeric fields from strings to numbers if present
    if (updateData.level !== undefined) {
      updateData.level = Number.parseInt(updateData.level);
    }
    if (updateData.number !== undefined) {
      updateData.number = Number.parseInt(updateData.number);
    }

    const bin = await warehouseBinService.update(
      Number.parseInt(req.params.id),
      updateData
    );
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
    const items = await inventoryService.getByBinId(
      Number.parseInt(req.params.id)
    );
    res.json({
      success: true,
      data: items,
    });
  }),
};

export default warehouseBinController;
