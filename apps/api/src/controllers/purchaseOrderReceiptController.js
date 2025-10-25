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

  // Get inventory allocations for a receipt
  async getAllocations(req, res) {
    try {
      const { inventoryAllocationService } = await import(
        "../services/inventoryAllocationService.js"
      );
      const allocations =
        await inventoryAllocationService.getReceiptAllocations(req.params.id);
      res.json({
        success: true,
        data: allocations,
      });
    } catch (error) {
      logger.error("Error getting receipt allocations:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Find available bins for receipt items with selected zones
  async findAvailableBins(req, res) {
    try {
      const { items } = req.body;
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({
          error: "Items array is required",
        });
      }

      const { warehouseAllocationService } = await import(
        "../services/warehouseAllocationService.js"
      );

      const results = await warehouseAllocationService.findBinsForItems(items);

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      logger.error("Error finding available bins:", error);
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
