import { purchaseOrderReceiptService } from "../services/purchaseOrderReceiptService.js";

// Helper function to convert BigInt to string for JSON serialization
const convertBigIntToString = (obj) => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

export const purchaseOrderReceiptController = {
  // Create a new purchase order receipt
  async create(req, res) {
    try {
      const receipt = await purchaseOrderReceiptService.create(req.body);
      res.status(201).json(convertBigIntToString(receipt));
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
      res.json(convertBigIntToString(receipts));
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
      res.json(convertBigIntToString(receipt));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
