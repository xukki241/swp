import { inventoryService } from "../../services/inventoryService.js";
import { warehouseBinService } from "../../services/warehouse/warehouseBinService.js";

export const warehouseBinController = {
  // Create a new warehouse bin
  async create(req, res) {
    try {
      const bin = await warehouseBinService.create({
        rackId: req.body.rackId,
        code: req.body.code,
        name: req.body.name,
        level: req.body.level,
        number: req.body.number,
        description: req.body.description,
      });
      res.status(201).json({
        success: true,
        message: "Warehouse bin created successfully",
        data: bin,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get all warehouse bins
  async getAll(req, res) {
    try {
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get warehouse bin by ID
  async getById(req, res) {
    try {
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get bins by rack ID
  async getByRackId(req, res) {
    try {
      const bins = await warehouseBinService.getByRackId(req.params.rackId);
      res.json({
        success: true,
        data: bins,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Update warehouse bin
  async update(req, res) {
    try {
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
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Delete warehouse bin
  async delete(req, res) {
    try {
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
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get inventory in a bin
  async getInventory(req, res) {
    try {
      const items = await inventoryService.getByBinId(req.params.id);
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
};

export default warehouseBinController;
