import { purchaseOrderService } from "../services/purchaseOrderService.js";

// Helper function to convert BigInt to string for JSON serialization
const convertBigIntToString = (obj) => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

export const purchaseOrderController = {
  // Create a new purchase order
  async create(req, res) {
    try {
      const po = await purchaseOrderService.create(req.body);
      res.status(201).json(convertBigIntToString(po));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get all purchase orders
  async getAll(req, res) {
    try {
      const filters = {
        supplierId: req.query.supplierId
          ? Number.parseInt(req.query.supplierId)
          : undefined,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: Number.parseInt(req.query.limit) || 100,
        offset: Number.parseInt(req.query.offset) || 0,
      };
      const pos = await purchaseOrderService.getAll(filters);
      res.json(convertBigIntToString(pos));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get purchase order by ID
  async getById(req, res) {
    try {
      const po = await purchaseOrderService.getById(
        Number.parseInt(req.params.id)
      );
      if (!po) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.json(convertBigIntToString(po));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
