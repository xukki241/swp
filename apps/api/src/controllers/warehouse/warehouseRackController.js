import { warehouseRackService } from "../../services/warehouse/warehouseRackService.js";

export const warehouseRackController = {
  // Create a new warehouse rack
  async create(req, res) {
    try {
      const rack = await warehouseRackService.create({
        zoneId: Number.parseInt(req.body.zoneId),
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
        zoneId: req.query.zoneId
          ? Number.parseInt(req.query.zoneId)
          : undefined,
        limit: Number.parseInt(req.query.limit) || 100,
        offset: Number.parseInt(req.query.offset) || 0,
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
      const rack = await warehouseRackService.getById(
        Number.parseInt(req.params.id)
      );
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
      const racks = await warehouseRackService.getByZoneId(
        Number.parseInt(req.params.zoneId)
      );
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
      if (updateData.zoneId) {
        updateData.zoneId = Number.parseInt(updateData.zoneId);
      }

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
      const rack = await warehouseRackService.delete(
        Number.parseInt(req.params.id)
      );
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
