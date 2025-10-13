import { purchaseOrderReceiptItemService } from "../services/purchaseOrderReceiptItemService.js";

export const purchaseOrderReceiptItemController = {
  async getAllByReceipt(req, res) {
    try {
      const purchaseOrderReceiptId = Number.parseInt(req.params.receiptId);
      const items = await purchaseOrderReceiptItemService.getAll({
        purchaseOrderReceiptId,
      });
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Create a new purchase order receipt item
  async create(req, res) {
    try {
      const item = await purchaseOrderReceiptItemService.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get all purchase order receipt items
  async getAll(req, res) {
    try {
      const filters = {
        purchaseOrderReceiptId: req.query.purchaseOrderReceiptId
          ? Number.parseInt(req.query.purchaseOrderReceiptId)
          : undefined,
        limit: Number.parseInt(req.query.limit) || 100,
        offset: Number.parseInt(req.query.offset) || 0,
      };
      const items = await purchaseOrderReceiptItemService.getAll(filters);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get purchase order receipt item by ID
  async getById(req, res) {
    try {
      const item = await purchaseOrderReceiptItemService.getById(
        Number.parseInt(req.params.id)
      );
      if (!item) {
        return res
          .status(404)
          .json({ error: "Purchase order receipt item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Update purchase order receipt item
  async update(req, res) {
    try {
      const item = await purchaseOrderReceiptItemService.update(
        Number.parseInt(req.params.id),
        req.body
      );
      if (!item) {
        return res
          .status(404)
          .json({ error: "Purchase order receipt item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete purchase order receipt item
  async delete(req, res) {
    try {
      const item = await purchaseOrderReceiptItemService.delete(
        Number.parseInt(req.params.id)
      );
      if (!item) {
        return res
          .status(404)
          .json({ error: "Purchase order receipt item not found" });
      }
      res.json({
        message: "Purchase order receipt item deleted successfully",
        purchaseOrderReceiptItem: item,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
