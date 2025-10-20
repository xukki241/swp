import { supplierService } from "../services/supplierService.js";

export const supplierController = {
  // Create a new supplier with medication variants
  async create(req, res) {
    try {
      const suppliers = await supplierService.create(req.body);
      res.status(201).json(suppliers);
    } catch (error) {
      console.error("Error creating supplier:", error.message);
      // <-- THAY ĐỔI QUAN TRỌNG
      // Gửi thẳng message lỗi từ service về cho frontend
      res.status(400).json({
        error: error.message,
      });
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
      const supplier = await supplierService.getById(req.params.id);
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
      // Hàm update trong service cũng sẽ throw lỗi validation
      const supplier = await supplierService.update(req.params.id, req.body);
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      console.error("Error updating supplier:", error.message);
      res.status(400).json({ error: error.message });
    }
  },

  // Delete supplier
  async delete(req, res) {
    try {
      const supplier = await supplierService.delete(req.params.id);
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      // Trả về 204 No Content là một thực hành tốt cho việc xóa thành công
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
