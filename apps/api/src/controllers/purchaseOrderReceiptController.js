import { purchaseOrderReceiptService } from "../services/purchaseOrderReceiptService.js";

export const purchaseOrderReceiptController = {
  async getAllByPurchaseOrder(req, res) {
    try {
      const purchaseOrderId = Number.parseInt(req.params.purchaseOrderId);
      const receipts = await purchaseOrderReceiptService.getAll({
        purchaseOrderId,
      });
      res.json(receipts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Create a new purchase order receipt
  async create(req, res) {
    try {
      const receipt = await purchaseOrderReceiptService.create(req.body);
      res.status(201).json(receipt);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get all purchase order receipts
  async getAll(req, res) {
    try {
      const filters = {
        purchaseOrderId: req.query.purchaseOrderId
          ? Number.parseInt(req.query.purchaseOrderId)
          : undefined,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: Number.parseInt(req.query.limit) || 100,
        offset: Number.parseInt(req.query.offset) || 0,
      };
      const receipts = await purchaseOrderReceiptService.getAll(filters);
      res.json(receipts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get purchase order receipt by ID
  async getById(req, res) {
    try {
      const receipt = await purchaseOrderReceiptService.getById(
        Number.parseInt(req.params.id)
      );
      if (!receipt) {
        return res
          .status(404)
          .json({ error: "Purchase order receipt not found" });
      }
      res.json(receipt);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Update purchase order receipt
  async update(req, res) {
    try {
      const receipt = await purchaseOrderReceiptService.update(
        Number.parseInt(req.params.id),
        req.body
      );
      if (!receipt) {
        return res
          .status(404)
          .json({ error: "Purchase order receipt not found" });
      }
      res.json(receipt);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete purchase order receipt
  async delete(req, res) {
    try {
      const receipt = await purchaseOrderReceiptService.delete(
        Number.parseInt(req.params.id)
      );
      if (!receipt) {
        return res
          .status(404)
          .json({ error: "Purchase order receipt not found" });
      }
      res.json({
        message: "Purchase order receipt deleted successfully",
        purchaseOrderReceipt: receipt,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
