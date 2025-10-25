import { inventoryService } from "../services/inventoryService.js";
import * as medicationService from "../services/medicationService.js";
import logger from "../utils/logger.js";

/**
 * Get all medications
 * @route GET /api/medications
 */
export const getAllMedications = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const medications = await medicationService.getAllMedications({
      search,
      status,
    });

    res.status(200).json({
      success: true,
      count: medications.length,
      data: medications,
    });
  } catch (error) {
    logger.error("Error in getAllMedications controller:", error);
    next(error);
  }
};

/**
 * Get medication by ID
 * @route GET /api/medications/:id
 */
export const getMedicationById = async (req, res, next) => {
  try {
    const id = req.params.id; // UUID is a string
    const medication = await medicationService.getMedicationById(id);

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: "Medication not found",
      });
    }

    res.status(200).json({
      success: true,
      data: medication,
    });
  } catch (error) {
    logger.error("Error in getMedicationById controller:", error);
    next(error);
  }
};

/**
 * Create a new medication
 * @route POST /api/medications
 */
export const createMedication = async (req, res, next) => {
  try {
    const requestData = req.body;

    // Check if it's an array or single object
    const isArray = Array.isArray(requestData);
    const medicationsToCreate = isArray ? requestData : [requestData];

    // Validate each medication
    const errors = [];
    medicationsToCreate.forEach((med, index) => {
      if (!med.name) {
        errors.push(`Medication at index ${index}: name is required`);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    // Prepare medication data
    const medicationsData = medicationsToCreate.map((med) => ({
      name: med.name,
      brand: med.brand || null,
      description: med.description || null,
      isPrescriptionRequired: med.isPrescriptionRequired || false,
      isControlledSubstance: med.isControlledSubstance || false,
      status: med.status || "active",
      variants: med.variants || [],
    }));

    // Create medications (single or bulk)
    const createdMedications = [];
    for (const medicationData of medicationsData) {
      const medication =
        await medicationService.createMedication(medicationData);
      createdMedications.push(medication);
    }

    res.status(201).json({
      success: true,
      message: `${createdMedications.length} medication(s) created successfully`,
      data: isArray ? createdMedications : createdMedications[0],
    });
  } catch (error) {
    logger.error("Error in createMedication controller:", error);
    next(error);
  }
};

/**
 * Update medication by ID
 * @route PUT /api/medications/:id
 */
export const updateMedication = async (req, res, next) => {
  try {
    const id = req.params.id; // UUID is a string
    const {
      name,
      brand,
      description,
      isPrescriptionRequired,
      isControlledSubstance,
      status,
      variants,
    } = req.body;

    // Check if medication exists
    const existingMedication = await medicationService.getMedicationById(id);
    if (!existingMedication) {
      return res.status(404).json({
        success: false,
        message: "Medication not found",
      });
    }

    const medicationData = {};
    if (name !== undefined) {
      medicationData.name = name;
    }
    if (brand !== undefined) {
      medicationData.brand = brand;
    }
    if (description !== undefined) {
      medicationData.description = description;
    }
    if (isPrescriptionRequired !== undefined) {
      medicationData.isPrescriptionRequired = isPrescriptionRequired;
    }
    if (isControlledSubstance !== undefined) {
      medicationData.isControlledSubstance = isControlledSubstance;
    }
    if (status !== undefined) {
      medicationData.status = status;
    }
    if (variants !== undefined) {
      medicationData.variants = variants;
    } // Array of variant objects

    const medication = await medicationService.updateMedication(
      id,
      medicationData
    );

    res.status(200).json({
      success: true,
      message: "Medication updated successfully",
      data: medication,
    });
  } catch (error) {
    logger.error("Error in updateMedication controller:", error);
    next(error);
  }
};

/**
 * Delete medication by ID
 * @route DELETE /api/medications/:id
 */
export const deleteMedication = async (req, res, next) => {
  try {
    const id = req.params.id; // UUID is a string

    const medication = await medicationService.deleteMedication(id);

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: "Medication not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Medication deleted successfully",
      data: medication,
    });
  } catch (error) {
    logger.error("Error in deleteMedication controller:", error);
    next(error);
  }
};

/**
 * Get inventory for a medication
 * @route GET /api/medications/:id/inventory
 */
export const getMedicationInventory = async (req, res, next) => {
  try {
    const id = req.params.id; // UUID is a string
    const items = await inventoryService.getByMedicationId(id);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    logger.error("Error in getMedicationInventory controller:", error);
    next(error);
  }
};

/**
 * Get suppliers for a medication
 * @route GET /api/medications/:id/suppliers
 */
export const getMedicationSuppliers = async (req, res, next) => {
  try {
    const id = req.params.id; // UUID is a string
    const suppliers = await medicationService.getMedicationSuppliers(id);

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    logger.error("Error in getMedicationSuppliers controller:", error);
    next(error);
  }
};

/**
 * Get purchase orders for a medication
 * @route GET /api/medications/:id/purchases
 */
export const getMedicationPurchases = async (req, res, next) => {
  try {
    const id = req.params.id; // UUID is a string
    const purchases = await medicationService.getMedicationPurchases(id);

    res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases,
    });
  } catch (error) {
    logger.error("Error in getMedicationPurchases controller:", error);
    next(error);
  }
};

/**
 * Get sales orders for a medication
 * @route GET /api/medications/:id/sales
 */
export const getMedicationSales = async (req, res, next) => {
  try {
    const id = req.params.id; // UUID is a string
    const sales = await medicationService.getMedicationSales(id);

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales,
    });
  } catch (error) {
    logger.error("Error in getMedicationSales controller:", error);
    next(error);
  }
};
