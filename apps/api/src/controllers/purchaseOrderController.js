import { purchaseOrderService } from "../services/purchaseOrderService.js";

export const purchaseOrderController = {
  // Create a new purchase order
  async create(req, res) {
    try {
      const po = await purchaseOrderService.create(req.body, req.user.id);
      res.status(201).json(po);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  },

  // Get all purchase orders
  async getAll(req, res) {
    try {
      const filters = {
        supplierId: req.query.supplierId || undefined, // UUID is a string
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: Number.parseInt(req.query.limit) || 100,
        offset: Number.parseInt(req.query.offset) || 0,
      };
      const pos = await purchaseOrderService.getAll(filters);
      res.json(pos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get purchase order by ID
  async getById(req, res) {
    try {
      const po = await purchaseOrderService.getById(req.params.id); // UUID is a string
      if (!po) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.json(po);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Update purchase order
  async update(req, res) {
    try {
      const po = await purchaseOrderService.update(
        req.params.id, // UUID is a string
        req.body
      );
      if (!po) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.json(po);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete purchase order
  async delete(req, res) {
    try {
      const po = await purchaseOrderService.delete(req.params.id); // UUID is a string
      if (!po) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.json({
        message: "Purchase order deleted successfully",
        purchaseOrder: po,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
