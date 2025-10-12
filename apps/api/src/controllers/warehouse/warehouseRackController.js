import { warehouseRackService } from "../../services/warehouse/warehouseRackService.js";

export const warehouseRackController = {
  // Create a new warehouse rack
  async create(req, res) {
    try {
      const rack = await warehouseRackService.create({
        zoneId: req.body.zoneId,
        code: req.body.code,
        name: req.body.name,
        description: req.body.description,
      });
      res.status(201).json({
        success: true,
        message: "Warehouse rack created successfully",
        data: rack,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get all warehouse racks
  async getAll(req, res) {
    try {
      const filters = {
        search: req.query.search,
        zoneId: req.query.zoneId ? req.query.zoneId : undefined,
        limit: req.query.limit || 100,
        offset: req.query.offset || 0,
      };
      const racks = await warehouseRackService.getAll(filters);
      res.json({
        success: true,
        data: racks,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get warehouse rack by ID
  async getById(req, res) {
    try {
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get racks by zone ID
  async getByZoneId(req, res) {
    try {
      const racks = await warehouseRackService.getByZoneId(req.params.zoneId);
      res.json({
        success: true,
        data: racks,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Update warehouse rack
  async update(req, res) {
    try {
      const updateData = { ...req.body };

      const rack = await warehouseRackService.update(req.params.id, updateData);
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
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Delete warehouse rack
  async delete(req, res) {
    try {
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
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};

export default warehouseRackController;
