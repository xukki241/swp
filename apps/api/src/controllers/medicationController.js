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
