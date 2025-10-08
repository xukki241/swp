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
/**
 * Create a new medication variant
 * @route POST /api/medication-variants
 */
export const createMedicationVariant = async (req, res, next) => {
  try {
    const {
      medicationId,
      sku,
      name,
      unit,
      unitFactor,
      barcode,
      sellPrice,
      isActive,
      isForSale,
    } = req.body;

    // Validation
    if (!medicationId || !sku || !name || !unit || !sellPrice) {
      return res.status(400).json({
        success: false,
        message: "medicationId, sku, name, unit, and sellPrice are required",
      });
    }

    // Check if SKU already exists
    const existingVariant =
      await medicationVariantService.getMedicationVariantBySku(sku);
    if (existingVariant) {
      return res.status(409).json({
        success: false,
        message: "Medication variant with this SKU already exists",
      });
    }

    const variantData = {
      medicationId: BigInt(medicationId),
      sku,
      name,
      unit,
      unitFactor: unitFactor || "1.00",
      barcode: barcode || null,
      sellPrice,
      isActive: isActive !== undefined ? isActive : true,
      isForSale: isForSale !== undefined ? isForSale : false,
    };

    const variant =
      await medicationVariantService.createMedicationVariant(variantData);

    res.status(201).json({
      success: true,
      message: "Medication variant created successfully",
      data: convertBigIntIds(variant),
    });
  } catch (error) {
    logger.error("Error in createMedicationVariant controller:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
