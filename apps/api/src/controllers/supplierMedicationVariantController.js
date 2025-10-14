import { supplierMedicationVariantService } from "../services/supplierMedicationVariantService.js";

export const supplierMedicationVariantController = {
  async bulkCreate(req, res) {
    try {
      const smvs = await supplierMedicationVariantService.bulkCreate(req.body);
      res.status(201).json(smvs);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  // Create a new supplier medication variant
  async create(req, res) {
    try {
      const smv = await supplierMedicationVariantService.create(req.body);
      res.status(201).json(smv);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get all supplier medication variants
  async getAll(req, res) {
    try {
      const supplierIdParam =
        req.params.supplierId || req.query.supplierId || undefined;

      const filters = {
        supplierId: supplierIdParam ? Number(supplierIdParam) : undefined,
        medicationVariantId: req.query.medicationVariantId
          ? Number(req.query.medicationVariantId)
          : undefined,
        limit: Number(req.query.limit) || 100,
        offset: Number(req.query.offset) || 0,
      };

      const smvs = await supplierMedicationVariantService.getAll(filters);
      res.json(smvs);
    } catch (error) {
      console.error("❌ Error in getAll:", error);
      res.status(500).json({ error: error.message });
    }
  },
  // Get supplier medication variant by ID
  async getById(req, res) {
    try {
      const smv = await supplierMedicationVariantService.getById(
        Number.parseInt(req.params.id)
      );
      if (!smv) {
        return res
          .status(404)
          .json({ error: "Supplier medication variant not found" });
      }
      res.json(smv);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Update supplier medication variant
  async update(req, res) {
    try {
      const smv = await supplierMedicationVariantService.update(
        Number.parseInt(req.params.id),
        req.body
      );
      if (!smv) {
        return res
          .status(404)
          .json({ error: "Supplier medication variant not found" });
      }
      res.json(smv);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete supplier medication variant
  async delete(req, res) {
    try {
      const smv = await supplierMedicationVariantService.delete(
        Number.parseInt(req.params.id)
      );
      if (!smv) {
        return res
          .status(404)
          .json({ error: "Supplier medication variant not found" });
      }
      res.json({
        message: "Supplier medication variant deleted successfully",
        supplierMedicationVariant: smv,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
