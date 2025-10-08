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
