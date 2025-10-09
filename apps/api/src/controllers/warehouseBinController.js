import { warehouseBinService } from "../services/warehouseBinService.js";

export const warehouseBinController = {
  // Create a new warehouse bin
  async create(req, res) {
    try {
      const bin = await warehouseBinService.create({
        rackId: Number.parseInt(req.body.rackId),
        code: req.body.code,
        name: req.body.name,
        level: Number.parseInt(req.body.level),
        number: Number.parseInt(req.body.number),
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
        rackId: req.query.rackId
          ? Number.parseInt(req.query.rackId)
          : undefined,
        zoneId: req.query.zoneId
          ? Number.parseInt(req.query.zoneId)
          : undefined,
        level:
          req.query.level !== undefined
            ? Number.parseInt(req.query.level)
            : undefined,
        limit: Number.parseInt(req.query.limit) || 100,
        offset: Number.parseInt(req.query.offset) || 0,
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
      const bins = await warehouseBinService.getByRackId(
        Number.parseInt(req.params.rackId)
      );
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
      if (updateData.rackId) {
        updateData.rackId = Number.parseInt(updateData.rackId);
      }
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
      const bin = await warehouseBinService.delete(
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
};
