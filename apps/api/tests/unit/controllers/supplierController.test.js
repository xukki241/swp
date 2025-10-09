import { describe, it, expect, vi, beforeEach } from "vitest";

import { supplierController } from "@/controllers/supplierController.js";
import { supplierService } from "@/services/supplierService.js";

vi.mock("@/services/supplierService.js");

describe("SupplierController", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe("create", () => {
    it("should create supplier with valid data", async () => {
      req.body = {
        name: "Supplier A",
        contactName: "John Doe",
        email: "john@supplier.com",
        phone: "1234567890",
        address: "123 Main St",
        medicationVariants: [],
      };
      supplierService.create.mockResolvedValue({ id: 1, ...req.body });

      await supplierController.create(req, res);

      expect(supplierService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should return 400 if required fields missing", async () => {
      req.body = { name: "Supplier A" };

      await supplierController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Missing required fields: name, contactName, email, phone",
      });
    });

    it("should validate medication variants", async () => {
      req.body = {
        name: "Supplier A",
        contactName: "John",
        email: "john@supplier.com",
        phone: "1234567890",
        address: "123 Main St",
        medicationVariants: [{ price: 10 }], // missing medicationVariantId
      };

      await supplierController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Each medication variant must have medicationVariantId",
      });
    });

    it("should handle errors", async () => {
      req.body = {
        name: "Supplier A",
        contactName: "John",
        email: "john@supplier.com",
        phone: "1234567890",
        address: "123 Main St",
      };
      supplierService.create.mockRejectedValue(new Error("Database error"));

      await supplierController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("getAll", () => {
    it("should return all suppliers with filters", async () => {
      req.query = { search: "supplier", status: "active" };
      supplierService.getAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      await supplierController.getAll(req, res);

      expect(supplierService.getAll).toHaveBeenCalledWith({
        search: "supplier",
        status: "active",
        limit: 100,
        offset: 0,
      });
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
    });

    it("should handle errors", async () => {
      supplierService.getAll.mockRejectedValue(new Error("Database error"));

      await supplierController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getById", () => {
    it("should return supplier by id", async () => {
      req.params = { id: "1" };
      supplierService.getById.mockResolvedValue({ id: 1 });

      await supplierController.getById(req, res);

      expect(supplierService.getById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      supplierService.getById.mockResolvedValue(null);

      await supplierController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("update", () => {
    it("should update supplier", async () => {
      req.params = { id: "1" };
      req.body = { name: "Updated Supplier" };
      supplierService.update.mockResolvedValue({ id: 1, ...req.body });

      await supplierController.update(req, res);

      expect(supplierService.update).toHaveBeenCalledWith(1, req.body);
      expect(res.json).toHaveBeenCalledWith({ id: 1, ...req.body });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      supplierService.update.mockResolvedValue(null);

      await supplierController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("delete", () => {
    it("should delete supplier", async () => {
      req.params = { id: "1" };
      supplierService.delete.mockResolvedValue({ id: 1 });

      await supplierController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Supplier deleted successfully",
        supplier: { id: 1 },
      });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      supplierService.delete.mockResolvedValue(null);

      await supplierController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
