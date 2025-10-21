import { inventoryService } from "../services/inventoryService.js";
import * as medicationVariantService from "../services/medicationVariantService.js";
import logger from "../utils/logger.js";
/**
 * Get all medication variants
 * @route GET /api/medication-variants
 */
export const getAllMedicationVariants = async (req, res, next) => {
  try {
    const { search, isActive } = req.query;
    const { medicationId } = req.params;

    const variants = await medicationVariantService.getAllMedicationVariants({
      search,
      medicationId: medicationId || undefined,
      isActive: isActive !== undefined ? isActive === "true" : undefined,
    });

    res.status(200).json({
      success: true,
      count: variants.length,
      data: variants,
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
    const id = req.params.id; // UUID is a string
    const variant = await medicationVariantService.getMedicationVariantById(id);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Medication variant not found",
      });
    }

    res.status(200).json({
      success: true,
      data: variant,
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
export const createMedicationVariant = async (req, res, _next) => {
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
      data: variant,
    });
  } catch (error) {
    logger.error("Error in createMedicationVariant controller:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
/**
 * Update medication variant by ID
 * @route PUT /api/medication-variants/:id
 */
export const updateMedicationVariant = async (req, res, _next) => {
  try {
    const id = req.params.id; // UUID is a string
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

    // Check if variant exists
    const existingVariant =
      await medicationVariantService.getMedicationVariantById(id);
    if (!existingVariant) {
      return res.status(404).json({
        success: false,
        message: "Medication variant not found",
      });
    }

    // Check if SKU is being changed and already exists
    if (sku && sku !== existingVariant.sku) {
      const existingBySku =
        await medicationVariantService.getMedicationVariantBySku(sku);
      if (existingBySku) {
        return res.status(409).json({
          success: false,
          message: "Medication variant with this SKU already exists",
        });
      }
    }

    const variantData = {};
    if (medicationId !== undefined) {
      variantData.medicationId = BigInt(medicationId);
    }
    if (sku !== undefined) {
      variantData.sku = sku;
    }
    if (name !== undefined) {
      variantData.name = name;
    }
    if (unit !== undefined) {
      variantData.unit = unit;
    }
    if (unitFactor !== undefined) {
      variantData.unitFactor = unitFactor;
    }
    if (barcode !== undefined) {
      variantData.barcode = barcode;
    }
    if (sellPrice !== undefined) {
      variantData.sellPrice = sellPrice;
    }
    if (isActive !== undefined) {
      variantData.isActive = isActive;
    }
    if (isForSale !== undefined) {
      variantData.isForSale = isForSale;
    }

    const variant = await medicationVariantService.updateMedicationVariant(
      id,
      variantData
    );

    res.status(200).json({
      success: true,
      message: "Medication variant updated successfully",
      data: variant,
    });
  } catch (error) {
    logger.error("Error in updateMedicationVariant controller:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
/**
 * Delete medication variant by ID
 * @route DELETE /api/medication-variants/:id
 */
export const deleteMedicationVariant = async (req, res, next) => {
  try {
    const id = req.params.id; // UUID is a string

    const variant = await medicationVariantService.deleteMedicationVariant(id);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Medication variant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Medication variant deleted successfully",
      data: variant,
    });
  } catch (error) {
    logger.error("Error in deleteMedicationVariant controller:", error);
    next(error);
  }
};

/**
 * Get inventory for a medication variant
 * @route GET /api/medication-variants/:id/inventory
 */
export const getMedicationVariantInventory = async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id);
    const items = await inventoryService.getByMedicationVariantId(id);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    logger.error("Error in getMedicationVariantInventory controller:", error);
    next(error);
  }
};
