import { warehouseZoneService } from "../services/warehouseZoneService.js";

export const warehouseZoneController = {
  // Create a new warehouse zone
  async create(req, res) {
    try {
      // Check if code already exists
      const existingZone = await warehouseZoneService.getByCode(req.body.code);
      if (existingZone) {
        return res.status(400).json({
          success: false,
          message: `Zone with code '${req.body.code}' already exists`,
        });
      }

      const zone = await warehouseZoneService.create(req.body);
      res.status(201).json({
        success: true,
        message: "Warehouse zone created successfully",
        data: zone,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get all warehouse zones
  async getAll(req, res) {
    try {
      const filters = {
        search: req.query.search,
        type: req.query.type,
        limit: Number.parseInt(req.query.limit) || 100,
        offset: Number.parseInt(req.query.offset) || 0,
      };
      const zones = await warehouseZoneService.getAll(filters);
      res.json({
        success: true,
        data: zones,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get warehouse zone by ID
  async getById(req, res) {
    try {
      const zone = await warehouseZoneService.getById(
        Number.parseInt(req.params.id)
      );
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Update warehouse zone
  async update(req, res) {
    try {
      const id = Number.parseInt(req.params.id);

      // If code is being updated, check if new code already exists
      if (req.body.code) {
        const existingZone = await warehouseZoneService.getByCode(
          req.body.code
        );
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
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Delete warehouse zone
  async delete(req, res) {
    try {
      const zone = await warehouseZoneService.delete(
        Number.parseInt(req.params.id)
      );
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
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};
