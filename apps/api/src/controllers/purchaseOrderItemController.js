import { purchaseOrderItemService } from "../services/purchaseOrderItemService.js";

// Helper function to convert BigInt to string for JSON serialization
const convertBigIntToString = (obj) => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

export const purchaseOrderItemController = {
  // Create a new purchase order item
  async create(req, res) {
    try {
      const item = await purchaseOrderItemService.create(req.body);
      res.status(201).json(convertBigIntToString(item));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get all purchase order items
  async getAll(req, res) {
    try {
      const filters = {
        purchaseOrderId: req.query.purchaseOrderId
          ? Number.parseInt(req.query.purchaseOrderId)
          : undefined,
        limit: Number.parseInt(req.query.limit) || 100,
        offset: Number.parseInt(req.query.offset) || 0,
      };
      const items = await purchaseOrderItemService.getAll(filters);
      res.json(convertBigIntToString(items));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get purchase order item by ID
  async getById(req, res) {
    try {
      const item = await purchaseOrderItemService.getById(
        Number.parseInt(req.params.id)
      );
      if (!item) {
        return res.status(404).json({ error: "Purchase order item not found" });
      }
      res.json(convertBigIntToString(item));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Update purchase order item
  async update(req, res) {
    try {
      const item = await purchaseOrderItemService.update(
        Number.parseInt(req.params.id),
        req.body
      );
      if (!item) {
        return res.status(404).json({ error: "Purchase order item not found" });
      }
      res.json(convertBigIntToString(item));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete purchase order item
  async delete(req, res) {
    try {
      const item = await purchaseOrderItemService.delete(
        Number.parseInt(req.params.id)
      );
      if (!item) {
        return res.status(404).json({ error: "Purchase order item not found" });
      }
      res.json({
        message: "Purchase order item deleted successfully",
        purchaseOrderItem: convertBigIntToString(item),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
