import { beforeEach, describe, expect, it, vi } from "vitest";

import * as medicationController from "@/controllers/medicationController.js";
import { inventoryService } from "@/services/inventoryService.js";
import * as medicationService from "@/services/medicationService.js";
import logger from "@/utils/logger.js";

vi.mock("@/services/inventoryService.js");
vi.mock("@/services/medicationService.js");

describe("MedicationController", () => {
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

  describe("getAllMedications", () => {
    it("should return all medications", async () => {
      req.query = { search: "aspirin", status: "active" };

      const mockMedications = [
        { id: 1n, name: "Aspirin", status: "active" },
        { id: 2n, name: "Aspirin Plus", status: "active" },
      ];

      medicationService.getAllMedications.mockResolvedValue({
        data: mockMedications,
        total: 2,
      });

      await medicationController.getAllMedications(req, res, next);

      expect(medicationService.getAllMedications).toHaveBeenCalledWith({
        search: "aspirin",
        status: "active",
        limit: 10,
        offset: 0,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockMedications,
        })
      );
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      medicationService.getAllMedications.mockRejectedValue(error);

      await medicationController.getAllMedications(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getMedicationById", () => {
    it("should return medication by id", async () => {
      req.params = { id: "1" };

      const mockMedication = { id: 1n, name: "Aspirin", status: "active" };
      medicationService.getMedicationById.mockResolvedValue(mockMedication);

      await medicationController.getMedicationById(req, res, next);

      expect(medicationService.getMedicationById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMedication,
      });
    });

    it("should return 404 if medication not found", async () => {
      req.params = { id: "999" };
      medicationService.getMedicationById.mockResolvedValue(null);

      await medicationController.getMedicationById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Medication not found",
      });
    });

    it("should handle errors", async () => {
      req.params = { id: "1" };
      const error = new Error("Database error");
      medicationService.getMedicationById.mockRejectedValue(error);

      await medicationController.getMedicationById(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("createMedication", () => {
    it("should create a new medication", async () => {
      req.body = {
        name: "Aspirin",
        brand: "Bayer",
        description: "Pain reliever",
        isPrescriptionRequired: false,
        isControlledSubstance: false,
        status: "active",
        variants: [],
      };

      const mockMedication = { id: 1n, ...req.body };
      medicationService.createMedication.mockResolvedValue(mockMedication);

      await medicationController.createMedication(req, res, next);

      expect(medicationService.createMedication).toHaveBeenCalledWith({
        name: "Aspirin",
        brand: "Bayer",
        description: "Pain reliever",
        isPrescriptionRequired: false,
        isControlledSubstance: false,
        status: "active",
        variants: [],
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "1 medication(s) created successfully",
        data: mockMedication,
      });
    });

    it("should return 400 if name is missing", async () => {
      req.body = { brand: "Bayer" }; // missing name

      await medicationController.createMedication(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation failed",
        errors: ["Medication at index 0: name is required"],
      });
    });

    it("should use default values for optional fields", async () => {
      req.body = { name: "Aspirin" };

      const mockMedication = {
        id: 1n,
        name: "Aspirin",
        brand: null,
        description: null,
        isPrescriptionRequired: false,
        isControlledSubstance: false,
        status: "active",
        variants: [],
      };
      medicationService.createMedication.mockResolvedValue(mockMedication);

      await medicationController.createMedication(req, res, next);

      expect(medicationService.createMedication).toHaveBeenCalledWith({
        name: "Aspirin",
        brand: null,
        description: null,
        isPrescriptionRequired: false,
        isControlledSubstance: false,
        status: "active",
        variants: [],
      });
    });

    it("should handle errors", async () => {
      req.body = { name: "Aspirin" };
      const error = new Error("Database error");
      medicationService.createMedication.mockRejectedValue(error);

      await medicationController.createMedication(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("updateMedication", () => {
    it("should update medication successfully", async () => {
      req.params = { id: "1" };
      req.body = {
        name: "Aspirin Updated",
        brand: "Bayer",
        status: "active",
      };

      const existingMedication = { id: 1n, name: "Aspirin" };
      const updatedMedication = { id: 1n, ...req.body };

      medicationService.getMedicationById.mockResolvedValue(existingMedication);
      medicationService.updateMedication.mockResolvedValue(updatedMedication);

      await medicationController.updateMedication(req, res, next);

      expect(medicationService.getMedicationById).toHaveBeenCalledWith("1");
      expect(medicationService.updateMedication).toHaveBeenCalledWith("1", {
        name: "Aspirin Updated",
        brand: "Bayer",
        status: "active",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Medication updated successfully",
        data: updatedMedication,
      });
    });

    it("should return 404 if medication not found", async () => {
      req.params = { id: "999" };
      req.body = { name: "Updated" };

      medicationService.getMedicationById.mockResolvedValue(null);

      await medicationController.updateMedication(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Medication not found",
      });
    });

    it("should only update provided fields", async () => {
      req.params = { id: "1" };
      req.body = { name: "New Name" }; // only updating name

      const existingMedication = { id: 1n, name: "Old Name", brand: "Bayer" };
      const updatedMedication = { id: 1n, name: "New Name", brand: "Bayer" };

      medicationService.getMedicationById.mockResolvedValue(existingMedication);
      medicationService.updateMedication.mockResolvedValue(updatedMedication);

      await medicationController.updateMedication(req, res, next);

      expect(medicationService.updateMedication).toHaveBeenCalledWith("1", {
        name: "New Name",
      });
    });

    it("should handle errors", async () => {
      req.params = { id: "1" };
      req.body = { name: "Updated" };

      const error = new Error("Database error");
      medicationService.getMedicationById.mockRejectedValue(error);

      await medicationController.updateMedication(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteMedication", () => {
    it("should delete medication successfully", async () => {
      req.params = { id: "1" };

      const mockMedication = { id: 1n, name: "Aspirin" };
      medicationService.deleteMedication.mockResolvedValue(mockMedication);

      await medicationController.deleteMedication(req, res, next);

      expect(medicationService.deleteMedication).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Medication deleted successfully",
        data: mockMedication,
      });
    });

    it("should return 404 if medication not found", async () => {
      req.params = { id: "999" };
      medicationService.deleteMedication.mockResolvedValue(null);

      await medicationController.deleteMedication(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Medication not found",
      });
    });

    it("should handle errors", async () => {
      req.params = { id: "1" };
      const error = new Error("Database error");
      medicationService.deleteMedication.mockRejectedValue(error);

      await medicationController.deleteMedication(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getMedicationInventory", () => {
    it("should return inventory for a medication", async () => {
      req.params = { id: "1" };
      const mockInventory = [
        {
          id: 1,
          variantId: 10n,
          variantName: "Paracetamol 500mg",
          variantSku: "PAR500",
          batchNumber: "BATCH001",
          expiryDate: "2026-01-15",
          quantity: 500,
          quantityReserved: 50,
          quantityAvailable: 450,
        },
      ];
      inventoryService.getByMedicationId.mockResolvedValue(mockInventory);

      await medicationController.getMedicationInventory(req, res, next);

      expect(inventoryService.getByMedicationId).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockInventory,
      });
    });

    it("should return empty array if no inventory found", async () => {
      req.params = { id: "999" };
      inventoryService.getByMedicationId.mockResolvedValue([]);

      await medicationController.getMedicationInventory(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: [],
      });
    });

    it("should handle errors", async () => {
      req.params = { id: "1" };
      const error = new Error("Database error");
      inventoryService.getByMedicationId.mockRejectedValue(error);

      await medicationController.getMedicationInventory(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getMedicationSuppliers", () => {
    it("should return suppliers for a medication", async () => {
      req.params = { id: "1" };
      const mockSuppliers = [
        { id: 1, name: "Supplier A", contactPerson: "John Doe" },
        { id: 2, name: "Supplier B", contactPerson: "Jane Smith" },
      ];
      medicationService.getMedicationSuppliers.mockResolvedValue(mockSuppliers);

      await medicationController.getMedicationSuppliers(req, res, next);

      expect(medicationService.getMedicationSuppliers).toHaveBeenCalledWith(
        "1"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockSuppliers,
      });
    });

    it("should return empty array if no suppliers found", async () => {
      req.params = { id: "999" };
      medicationService.getMedicationSuppliers.mockResolvedValue([]);

      await medicationController.getMedicationSuppliers(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: [],
      });
    });

    it("should handle errors", async () => {
      req.params = { id: "1" };
      const error = new Error("Database error");
      medicationService.getMedicationSuppliers.mockRejectedValue(error);

      await medicationController.getMedicationSuppliers(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getMedicationPurchases", () => {
    it("should return purchase orders for a medication", async () => {
      req.params = { id: "1" };
      const mockPurchases = [
        { id: 1, orderNumber: "PO-001", totalAmount: 1000 },
        { id: 2, orderNumber: "PO-002", totalAmount: 2000 },
      ];
      medicationService.getMedicationPurchases.mockResolvedValue(mockPurchases);

      await medicationController.getMedicationPurchases(req, res, next);

      expect(medicationService.getMedicationPurchases).toHaveBeenCalledWith(
        "1"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockPurchases,
      });
    });

    it("should handle errors", async () => {
      req.params = { id: "1" };
      const error = new Error("Database error");
      medicationService.getMedicationPurchases.mockRejectedValue(error);

      await medicationController.getMedicationPurchases(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getMedicationSales", () => {
    it("should return sales orders for a medication", async () => {
      req.params = { id: "1" };
      const mockSales = [
        { id: 1, orderNumber: "SO-001", totalAmount: 500 },
        { id: 2, orderNumber: "SO-002", totalAmount: 750 },
      ];
      medicationService.getMedicationSales.mockResolvedValue(mockSales);

      await medicationController.getMedicationSales(req, res, next);

      expect(medicationService.getMedicationSales).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockSales,
      });
    });

    it("should handle errors", async () => {
      req.params = { id: "1" };
      const error = new Error("Database error");
      medicationService.getMedicationSales.mockRejectedValue(error);

      await medicationController.getMedicationSales(req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("createMedication - bulk operations", () => {
    it("should create multiple medications", async () => {
      req.body = [
        { name: "Aspirin", brand: "Bayer" },
        { name: "Ibuprofen", brand: "Advil" },
      ];

      const mockMedications = [
        { id: 1n, name: "Aspirin", brand: "Bayer" },
        { id: 2n, name: "Ibuprofen", brand: "Advil" },
      ];
      medicationService.createMedication
        .mockResolvedValueOnce(mockMedications[0])
        .mockResolvedValueOnce(mockMedications[1]);

      await medicationController.createMedication(req, res, next);

      expect(medicationService.createMedication).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "2 medication(s) created successfully",
        data: mockMedications,
      });
    });

    it("should validate all medications in bulk create", async () => {
      req.body = [{ name: "Aspirin" }, { brand: "Bayer" }]; // Second one missing name

      await medicationController.createMedication(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation failed",
        errors: ["Medication at index 1: name is required"],
      });
    });
  });

  describe("updateMedication - field updates", () => {
    it("should update isPrescriptionRequired", async () => {
      req.params = { id: "1" };
      req.body = { is_prescription_required: true };
      const existingMedication = {
        id: 1n,
        name: "Aspirin",
        isPrescriptionRequired: false,
      };
      const updatedMedication = {
        ...existingMedication,
        isPrescriptionRequired: true,
      };

      medicationService.getMedicationById.mockResolvedValue(existingMedication);
      medicationService.updateMedication.mockResolvedValue(updatedMedication);

      await medicationController.updateMedication(req, res, next);

      expect(medicationService.updateMedication).toHaveBeenCalledWith("1", {
        isPrescriptionRequired: true,
      });
    });

    it("should update isControlledSubstance", async () => {
      req.params = { id: "1" };
      req.body = { is_controlled_substance: true };
      const existingMedication = {
        id: 1n,
        name: "Morphine",
        isControlledSubstance: false,
      };
      const updatedMedication = {
        ...existingMedication,
        isControlledSubstance: true,
      };

      medicationService.getMedicationById.mockResolvedValue(existingMedication);
      medicationService.updateMedication.mockResolvedValue(updatedMedication);

      await medicationController.updateMedication(req, res, next);

      expect(medicationService.updateMedication).toHaveBeenCalledWith("1", {
        isControlledSubstance: true,
      });
    });

    it("should update variants", async () => {
      req.params = { id: "1" };
      req.body = {
        variants: [
          { strength: "500mg", form: "tablet" },
          { strength: "1000mg", form: "tablet" },
        ],
      };
      const existingMedication = { id: 1n, name: "Aspirin", variants: [] };
      const updatedMedication = {
        ...existingMedication,
        variants: req.body.variants,
      };

      medicationService.getMedicationById.mockResolvedValue(existingMedication);
      medicationService.updateMedication.mockResolvedValue(updatedMedication);

      await medicationController.updateMedication(req, res, next);

      expect(medicationService.updateMedication).toHaveBeenCalledWith("1", {
        variants: req.body.variants,
      });
    });
  });
});
