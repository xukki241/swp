import { supplierService } from "../services/supplierService.js";

export const supplierController = {
  // Create a new supplier with medication variants
  async create(req, res) {
    try {
      // Validate required fields
      const { name, contactName, email, phone, address, medicationVariants } =
        req.body;

      if (!name || !contactName || !email || !phone || !address) {
        return res.status(400).json({
          error: "Missing required fields: name, contactName, email, phone",
        });
      }

      // Validate medication variants if provided
      if (medicationVariants && Array.isArray(medicationVariants)) {
        for (const variant of medicationVariants) {
          if (!variant.medicationVariantId) {
            return res.status(400).json({
              error: "Each medication variant must have medicationVariantId",
            });
          }
        }
      }

      const supplier = await supplierService.create(req.body);
      res.status(201).json(supplier);
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
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const supplier = await supplierService.getById(
        Number.parseInt(req.params.id)
      );
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const supplier = await supplierService.update(
        Number.parseInt(req.params.id),
        req.body
      );
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete supplier
  async delete(req, res) {
    try {
      const supplier = await supplierService.delete(
        Number.parseInt(req.params.id)
      );
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      res.json({
        message: "Supplier deleted successfully",
        supplier: supplier,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
