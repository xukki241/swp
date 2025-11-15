import { beforeEach, describe, expect, it, vi } from "vitest";

import * as medicationVariantController from "@/controllers/medicationVariantController.js";
import { inventoryService } from "@/services/inventoryService.js";
import * as medicationVariantService from "@/services/medicationVariantService.js";
import logger from "@/utils/logger.js";

vi.mock("@/services/inventoryService.js");
vi.mock("@/services/medicationVariantService.js");

describe("MedicationVariantController", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  describe("getAllMedicationVariants", () => {
    it("should return all medication variants with filters", async () => {
      req.query = {
        search: "tablet",
        medicationId: undefined,
        isActive: "true",
      };

      const mockVariants = [
        { id: 1n, name: "Tablet 100mg", isActive: true },
        { id: 2n, name: "Tablet 200mg", isActive: true },
      ];

      medicationVariantService.getAllMedicationVariants.mockResolvedValue(
        mockVariants
      );

      await medicationVariantController.getAllMedicationVariants(
        req,
        res,
        next
      );

      expect(
        medicationVariantService.getAllMedicationVariants
      ).toHaveBeenCalledWith({
        search: "tablet",
        medicationId: undefined,
        isActive: true,
        limit: 10,
        offset: 0,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockVariants,
      }));
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      medicationVariantService.getAllMedicationVariants.mockRejectedValue(
        error
      );

      await medicationVariantController.getAllMedicationVariants(
        req,
        res,
        next
      );

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getMedicationVariantById", () => {
    it("should return medication variant by id", async () => {
      req.params = { id: "1" };

      const mockVariant = { id: 1n, name: "Tablet 100mg" };
      medicationVariantService.getMedicationVariantById.mockResolvedValue(
        mockVariant
      );

      await medicationVariantController.getMedicationVariantById(
        req,
        res,
        next
      );

      expect(
        medicationVariantService.getMedicationVariantById
      ).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockVariant,
      });
    });

    it("should return 404 if variant not found", async () => {
      req.params = { id: "999" };
      medicationVariantService.getMedicationVariantById.mockResolvedValue(null);

      await medicationVariantController.getMedicationVariantById(
        req,
        res,
        next
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Medication variant not found",
      });
    });

    it("should handle errors", async () => {
      req.params = { id: "1" };
      const error = new Error("Database error");
      medicationVariantService.getMedicationVariantById.mockRejectedValue(
        error
      );

      await medicationVariantController.getMedicationVariantById(
        req,
        res,
        next
      );

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("createMedicationVariant", () => {
    it("should create a new medication variant", async () => {
      req.params = { medicationId: "uuid-medication-1" };
      req.body = [
        {
          sku: "ASP-100-TAB",
          name: "Aspirin 100mg Tablet",
          unit: "tablet",

          barcode: "123456",
          sellPrice: 10.0,
          isActive: true,
          isForSale: true,
        },
      ];

      const mockVariant = {
        id: "uuid-1",
        medicationId: "uuid-medication-1",
        sku: "ASP-100-TAB",
        name: "Aspirin 100mg Tablet",
        unit: "tablet",

        barcode: "123456",
        sellPrice: "10.0",
        isActive: true,
        isForSale: true,
      };
      medicationVariantService.getMedicationVariantBySku.mockResolvedValue(
        null
      );
      medicationVariantService.createMedicationVariant.mockResolvedValue(
        mockVariant
      );

      await medicationVariantController.createMedicationVariant(req, res, next);

      expect(
        medicationVariantService.getMedicationVariantBySku
      ).toHaveBeenCalledWith("ASP-100-TAB");
      expect(
        medicationVariantService.createMedicationVariant
      ).toHaveBeenCalledWith({
        medicationId: "uuid-medication-1",
        sku: "ASP-100-TAB",
        name: "Aspirin 100mg Tablet",
        unit: "tablet",

        barcode: "123456",
        sellPrice: "10",
        isActive: true,
        isForSale: true,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "1 variant(s) created successfully",
        data: [mockVariant],
      });
    });

    it("should return 400 if required fields are missing", async () => {
      req.params = { medicationId: "uuid-medication-1" };
      req.body = [{ sku: "ASP-100-TAB" }]; // missing required fields

      await medicationVariantController.createMedicationVariant(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Each variant must have sku, name, unit, and sellPrice",
      });
    });

    it("should return 409 if SKU already exists", async () => {
      req.params = { medicationId: "uuid-medication-1" };
      req.body = [
        {
          sku: "ASP-100-TAB",
          name: "Aspirin 100mg Tablet",
          unit: "tablet",
          sellPrice: 10.0,
        },
      ];

      const existingVariant = { id: "uuid-2", sku: "ASP-100-TAB" };
      medicationVariantService.getMedicationVariantBySku.mockResolvedValue(
        existingVariant
      );

      await medicationVariantController.createMedicationVariant(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Variant with SKU "ASP-100-TAB" already exists',
      });
    });

    it("should use default values for optional fields", async () => {
      req.params = { medicationId: "uuid-medication-1" };
      req.body = [
        {
          sku: "ASP-100-TAB",
          name: "Aspirin 100mg Tablet",
          unit: "tablet",
          sellPrice: 10.0,
        },
      ];

      const mockVariant = {
        id: "uuid-1",
        medicationId: "uuid-medication-1",
        sku: "ASP-100-TAB",
        name: "Aspirin 100mg Tablet",
        unit: "tablet",

        barcode: null,
        sellPrice: "10.0",
        isActive: true,
        isForSale: true,
      };

      medicationVariantService.getMedicationVariantBySku.mockResolvedValue(
        null
      );
      medicationVariantService.createMedicationVariant.mockResolvedValue(
        mockVariant
      );

      await medicationVariantController.createMedicationVariant(req, res, next);

      expect(
        medicationVariantService.createMedicationVariant
      ).toHaveBeenCalledWith({
        medicationId: "uuid-medication-1",
        sku: "ASP-100-TAB",
        name: "Aspirin 100mg Tablet",
        unit: "tablet",

        barcode: null,
        sellPrice: "10",
        isActive: true,
        isForSale: false,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "1 variant(s) created successfully",
        data: [mockVariant],
      });
    });

    it("should handle errors", async () => {
      req.params = { medicationId: "uuid-medication-1" };
      req.body = [
        {
          sku: "ASP-100-TAB",
          name: "Aspirin 100mg Tablet",
          unit: "tablet",
          sellPrice: 10.0,
        },
      ];

      const error = new Error("Database error");
      medicationVariantService.getMedicationVariantBySku.mockRejectedValue(
        error
      );

      await medicationVariantController.createMedicationVariant(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("updateMedicationVariant", () => {
    it("should update medication variant successfully", async () => {
      req.params = { id: "1" };
      req.body = {
        name: "Aspirin 100mg Tablet Updated",
        sellPrice: "12.00",
      };

      const existingVariant = {
        id: 1n,
        sku: "ASP-100-TAB",
        name: "Aspirin 100mg Tablet",
      };
      const updatedVariant = { ...existingVariant, ...req.body };

      medicationVariantService.getMedicationVariantById.mockResolvedValue(
        existingVariant
      );
      medicationVariantService.updateMedicationVariant.mockResolvedValue(
        updatedVariant
      );

      await medicationVariantController.updateMedicationVariant(req, res, next);

      expect(
        medicationVariantService.getMedicationVariantById
      ).toHaveBeenCalledWith("1");
      expect(
        medicationVariantService.updateMedicationVariant
      ).toHaveBeenCalledWith("1", {
        name: "Aspirin 100mg Tablet Updated",
        sellPrice: "12.00",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Medication variant updated successfully",
        data: updatedVariant,
      });
    });

    it("should return 404 if variant not found", async () => {
      req.params = { id: "999" };
      req.body = { name: "Updated" };

      medicationVariantService.getMedicationVariantById.mockResolvedValue(null);

      await medicationVariantController.updateMedicationVariant(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Medication variant not found",
      });
    });

    it("should return 400 if SKU already exists for another variant", async () => {
      req.params = { id: "1" };
      req.body = { sku: "NEW-SKU" };

      const existingVariant = { id: 1n, sku: "OLD-SKU" };
      const anotherVariant = { id: 2n, sku: "NEW-SKU" };

      medicationVariantService.getMedicationVariantById.mockResolvedValue(
        existingVariant
      );
      medicationVariantService.getMedicationVariantBySku.mockResolvedValue(
        anotherVariant
      );

      await medicationVariantController.updateMedicationVariant(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Medication variant with this SKU already exists",
      });
    });

    it("should handle errors", async () => {
      req.params = { id: "1" };
      req.body = { name: "Updated" };

      const error = new Error("Database error");
      medicationVariantService.getMedicationVariantById.mockRejectedValue(
        error
      );

      await medicationVariantController.updateMedicationVariant(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });
    });
  });

  describe("deleteMedicationVariant", () => {
    it("should delete medication variant successfully", async () => {
      req.params = { id: "1" };

      const mockVariant = { id: 1n, name: "Aspirin 100mg Tablet" };
      medicationVariantService.deleteMedicationVariant.mockResolvedValue(
        mockVariant
      );

      await medicationVariantController.deleteMedicationVariant(req, res, next);

      expect(
        medicationVariantService.deleteMedicationVariant
      ).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Medication variant deleted successfully",
        data: mockVariant,
      });
    });

    it("should return 404 if variant not found", async () => {
      req.params = { id: "999" };
      medicationVariantService.deleteMedicationVariant.mockResolvedValue(null);

      await medicationVariantController.deleteMedicationVariant(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Medication variant not found",
      });
    });
  });

  describe("getMedicationVariantInventory", () => {
    it("should return inventory for a medication variant", async () => {
      req.params = { id: "1" };
      const mockInventory = [
        {
          id: 1,
          binId: 3,
          binCode: "B001",
          batchNumber: "BATCH001",
          quantity: 500,
          quantityReserved: 50,
          quantityAvailable: 450,
        },
      ];
      inventoryService.getByMedicationVariantId.mockResolvedValue(
        mockInventory
      );

      await medicationVariantController.getMedicationVariantInventory(
        req,
        res,
        next
      );

      // UUID string
      expect(inventoryService.getByMedicationVariantId).toHaveBeenCalledWith(
        "1"
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockInventory,
      });
    });

    it("should return empty array if no inventory found", async () => {
      req.params = { id: "999" };
      inventoryService.getByMedicationVariantId.mockResolvedValue([]);

      await medicationVariantController.getMedicationVariantInventory(
        req,
        res,
        next
      );

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: [],
      });
    });

    it("should handle errors", async () => {
      req.params = { id: "1" };
      inventoryService.getByMedicationVariantId.mockRejectedValue(
        new Error("Database error")
      );

      await medicationVariantController.getMedicationVariantInventory(
        req,
        res,
        next
      );

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
