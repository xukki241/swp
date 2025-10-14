import { supplierService } from "../services/supplierService.js";

export const supplierController = {
  // Create a new supplier with medication variants
  async create(req, res) {
    try {
      // Chuẩn hoá dữ liệu đầu vào: cho phép gửi 1 hoặc nhiều supplier
      const suppliersData = Array.isArray(req.body) ? req.body : [req.body];

      // 🧩 Kiểm tra dữ liệu từng supplier
      for (const [index, supplierData] of suppliersData.entries()) {
        const { name, contactName, email, phone, address, medicationVariants } =
          supplierData;

        // Kiểm tra các trường bắt buộc
        if (!name || !contactName || !email || !phone || !address) {
          return res.status(400).json({
            error: `Supplier #${index + 1} missing required fields: name, contactName, email, phone, address`,
          });
        }

        // Kiểm tra danh sách thuốc (nếu có)
        if (medicationVariants && Array.isArray(medicationVariants)) {
          for (const [vIndex, variant] of medicationVariants.entries()) {
            if (!variant.medicationVariantId) {
              return res.status(400).json({
                error: `Supplier #${index + 1} → medicationVariants[${vIndex}] missing medicationVariantId`,
              });
            }
          }
        }
      }

      // 🏗️ Gọi service để tạo supplier(s)
      const createdSuppliers =
        suppliersData.length > 1
          ? await supplierService.createMany(suppliersData)
          : [await supplierService.create(suppliersData[0])];

      // ✅ Trả kết quả
      return res.status(201).json({
        success: true,
        message: `Created ${createdSuppliers.length} supplier(s) successfully`,
        data: createdSuppliers,
      });
    } catch (error) {
      console.error("❌ Error creating supplier(s):", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create supplier(s)",
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
