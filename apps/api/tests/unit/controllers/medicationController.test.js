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

      medicationService.getAllMedications.mockResolvedValue(mockMedications);

      await medicationController.getAllMedications(req, res, next);

      expect(medicationService.getAllMedications).toHaveBeenCalledWith({
        search: "aspirin",
        status: "active",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockMedications,
      });
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
        message: "Medication created successfully",
        data: mockMedication,
      });
    });

    it("should return 400 if name is missing", async () => {
      req.body = { brand: "Bayer" }; // missing name

      await medicationController.createMedication(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Medication name is required",
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
});
