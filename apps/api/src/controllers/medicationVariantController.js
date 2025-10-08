import * as medicationVariantService from "../services/medicationVariantService.js";
import { convertBigIntIds } from "../utils/bigint.js";
import logger from "../utils/logger.js";
/**
 * Get all medication variants
 * @route GET /api/medication-variants
 */
export const getAllMedicationVariants = async (req, res, next) => {
  try {
    const { search, medicationId, isActive } = req.query;
    const variants = await medicationVariantService.getAllMedicationVariants({
      search,
      medicationId: medicationId ? BigInt(medicationId) : undefined,
      isActive: isActive !== undefined ? isActive === "true" : undefined,
    });

    res.status(200).json({
      success: true,
      count: variants.length,
      data: convertBigIntIds(variants),
    });
  } catch (error) {
    logger.error("Error in getAllMedicationVariants controller:", error);
    next(error);
  }
};

/**
 * Get medication variant by ID
 * @route GET /api/medication-variants/:id
 */
export const getMedicationVariantById = async (req, res, next) => {
  try {
    const id = BigInt(req.params.id);
    const variant = await medicationVariantService.getMedicationVariantById(id);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Medication variant not found",
      });
    }

    res.status(200).json({
      success: true,
      data: convertBigIntIds(variant),
    });
  } catch (error) {
    logger.error("Error in getMedicationVariantById controller:", error);
    next(error);
  }
};
