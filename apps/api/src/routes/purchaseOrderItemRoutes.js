import { purchaseOrderItemService } from "../services/purchaseOrderItemService.js";

export const purchaseOrderItemController = {
  async getAllByPurchaseOrder(req, res) {
    try {
      const purchaseOrderId = Number.parseInt(req.params.purchaseOrderId);
      const items = await purchaseOrderItemService.getAll({ purchaseOrderId });
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const id = Number.parseInt(req.params.itemId);
      const item = await purchaseOrderItemService.getById(id);
      if (!item) {
        return res.status(404).json({ error: "Purchase order item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const purchaseOrderId = Number.parseInt(req.params.purchaseOrderId);
      const newItem = await purchaseOrderItemService.create({
        ...req.body,
        purchaseOrderId,
      });
      res.status(201).json(newItem);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const id = Number.parseInt(req.params.itemId);
      const updated = await purchaseOrderItemService.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Purchase order item not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const id = Number.parseInt(req.params.itemId);
      const deleted = await purchaseOrderItemService.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: "Purchase order item not found" });
      }
      res.json({ message: "Item deleted successfully", item: deleted });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
