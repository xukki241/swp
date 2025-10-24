import { beforeEach, describe, expect, it, vi } from "vitest";

import { supplierMedicationVariantController } from "@/controllers/supplierMedicationVariantController.js";
import { supplierMedicationVariantService } from "@/services/supplierMedicationVariantService.js";

vi.mock("@/services/supplierMedicationVariantService.js");

describe("SupplierMedicationVariantController", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe("create", () => {
    it("should create supplier medication variant", async () => {
      req.body = { supplierId: "1", medicationVariantId: 1, price: 100 };
      supplierMedicationVariantService.create.mockResolvedValue({
        id: 1,
        ...req.body,
      });

      await supplierMedicationVariantController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should handle errors", async () => {
      supplierMedicationVariantService.create.mockRejectedValue(
        new Error("Error")
      );

      await supplierMedicationVariantController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("getAll", () => {
    it("should return all with filters", async () => {
      req.query = { supplierId: "1", medicationVariantId: "2" };
      supplierMedicationVariantService.getAll.mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);

      await supplierMedicationVariantController.getAll(req, res);

      expect(supplierMedicationVariantService.getAll).toHaveBeenCalledWith({
        supplierId: "1",
        medicationVariantId: "2",
        limit: 100,
        offset: 0,
      });
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
    });

    it("should handle errors", async () => {
      supplierMedicationVariantService.getAll.mockRejectedValue(
        new Error("Error")
      );

      await supplierMedicationVariantController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getById", () => {
    it("should return item by id", async () => {
      req.params = { id: "1" };
      supplierMedicationVariantService.getById.mockResolvedValue({ id: 1 });

      await supplierMedicationVariantController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      supplierMedicationVariantService.getById.mockResolvedValue(null);

      await supplierMedicationVariantController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("update", () => {
    it("should update item", async () => {
      req.params = { id: "1" };
      req.body = { price: 150 };
      supplierMedicationVariantService.update.mockResolvedValue({
        id: 1,
        price: 150,
      });

      await supplierMedicationVariantController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({ id: 1, price: 150 });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      supplierMedicationVariantService.update.mockResolvedValue(null);

      await supplierMedicationVariantController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("delete", () => {
    it("should delete item", async () => {
      req.params = { id: "1" };
      supplierMedicationVariantService.delete.mockResolvedValue({ id: 1 });

      await supplierMedicationVariantController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Supplier medication variant deleted successfully",
        supplierMedicationVariant: { id: 1 },
      });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      supplierMedicationVariantService.delete.mockResolvedValue(null);

      await supplierMedicationVariantController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
