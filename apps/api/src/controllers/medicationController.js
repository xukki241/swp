import * as medicationService from "../services/medicationService.js";
import { convertBigIntIds } from "../utils/bigint.js";
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
      data: convertBigIntIds(medications),
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
    const id = BigInt(req.params.id);
    const medication = await medicationService.getMedicationById(id);
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: "Medication not found",
      });
    }
    res.status(200).json({
      success: true,
      data: convertBigIntIds(medication),
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
    const {
      name,
      brand,
      description,
      isPrescriptionRequired,
      isControlledSubstance,
      status,
    } = req.body;
    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }
    const medicationData = {
      name,
      brand: brand || null,
      description: description || null,
      isPrescriptionRequired: isPrescriptionRequired || false,
      isControlledSubstance: isControlledSubstance || false,
      status: status || "active",
    };
    const medication = await medicationService.createMedication(medicationData);
    res.status(201).json({
      success: true,
      data: convertBigIntIds(medication),
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
    const id = BigInt(req.params.id);
    const {
      name,
      brand,
      description,
      isPrescriptionRequired,
      isControlledSubstance,
      status,
    } = req.body;
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
    const updatedMedication = await medicationService.updateMedication(
      id,
      medicationData
    );
    res.status(200).json({
      success: true,
      data: convertBigIntIds(updatedMedication),
    });
  } catch (error) {
    logger.error("Error in updateMedication controller:", error);
    next(error);
  }
};
