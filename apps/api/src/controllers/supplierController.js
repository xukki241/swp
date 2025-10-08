import { supplierService } from "../services/supplierService.js";

// Helper function to convert BigInt to string for JSON serialization
const convertBigIntToString = (obj) => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};
export const supplierController = {
  // Create a new supplier
  async create(req, res) {
    try {
      const supplier = await supplierService.create(req.body);
      res.status(201).json(convertBigIntToString(supplier));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get all suppliers
  async getAll(req, res) {
    try {
      const filters = {
        search: req.query.search,
        status: req.query.status,
        limit: Number.parseInt(req.query.limit) || 100,
        offset: Number.parseInt(req.query.offset) || 0,
      };
      const suppliers = await supplierService.getAll(filters);
      res.json(convertBigIntToString(suppliers));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get supplier by ID
  async getById(req, res) {
    try {
      const supplier = await supplierService.getById(
        Number.parseInt(req.params.id)
      );
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      res.json(convertBigIntToString(supplier));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
