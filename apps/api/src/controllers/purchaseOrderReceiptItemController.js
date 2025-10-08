import { purchaseOrderReceiptItemService } from "../services/purchaseOrderReceiptItemService.js";

// Helper function to convert BigInt to string for JSON serialization
const convertBigIntToString = (obj) => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

export const purchaseOrderReceiptItemController = {
  // Create a new purchase order receipt item
  async create(req, res) {
    try {
      const item = await purchaseOrderReceiptItemService.create(req.body);
      res.status(201).json(convertBigIntToString(item));
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
      res.json(convertBigIntToString(items));
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
      res.json(convertBigIntToString(item));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
