import { purchaseOrderReceiptService } from "../services/purchaseOrderReceiptService.js";
import logger from "../utils/logger.js";

export const purchaseOrderReceiptController = {
  async getAllByPurchaseOrder(req, res) {
    try {
      const purchaseOrderId = req.params.purchaseOrderId;
      const receipts = await purchaseOrderReceiptService.getAll({
        purchaseOrderId,
      });
      res.json(receipts);
    } catch (error) {
      logger.error("Error in getAllByPurchaseOrder:", error);
      res.status(500).json({ error: error.message });
    }
  },
  // Create a new purchase order receipt
  async create(req, res) {
    try {
      const purchaseOrderId = req.params.purchaseOrderId;

      // Log incoming request data
      logger.info("Creating receipt with data:", {
        purchaseOrderId,
        body: req.body,
        bodyKeys: Object.keys(req.body),
        receivedDate: req.body.receivedDate,
        receivedDateType: typeof req.body.receivedDate,
        receivedBy: req.body.receivedBy,
        itemsCount: req.body.items?.length,
      });

      // Remove undefined fields to avoid database issues
      const cleanedBody = Object.fromEntries(
        Object.entries(req.body).filter(([_, value]) => value !== undefined)
      );

      logger.info("Cleaned body:", {
        cleanedBody,
        cleanedBodyKeys: Object.keys(cleanedBody),
      });

      const receipt = await purchaseOrderReceiptService.create({
        purchaseOrderId,
        ...cleanedBody,
      });
      res.status(201).json(receipt);
    } catch (error) {
      logger.error("Error creating receipt:", {
        message: error.message,
        stack: error.stack,
        purchaseOrderId: req.params.purchaseOrderId,
        body: req.body,
      });
      res.status(400).json({ error: error.message });
    }
  },

  // Get all purchase order receipts
  async getAll(req, res) {
    try {
      const filters = {
        purchaseOrderId: req.query.purchaseOrderId || undefined,
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
      const receipt = await purchaseOrderReceiptService.getById(req.params.id);
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
        req.params.id,
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
      const receipt = await purchaseOrderReceiptService.delete(req.params.id);
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
