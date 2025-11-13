import { inventoryService } from "../services/inventoryService.js";
import * as medicationVariantService from "../services/medicationVariantService.js";
import logger from "../utils/logger.js";
/**
 * Get all medication variants with pagination
 * @route GET /api/medication-variants
 */
export const getAllMedicationVariants = async (req, res, next) => {
  try {
    const page = req.query.page ? Number.parseInt(req.query.page) : 1;
    const limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
    const offset = (page - 1) * limit;

    const { search, isActive } = req.query;
    const { medicationId } = req.params;

    const result = await medicationVariantService.getAllMedicationVariants({
      search,
      medicationId: medicationId || undefined,
      isActive: isActive !== undefined ? isActive === "true" : undefined,
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasMore: offset + result.data.length < result.total,
      },
    });
  } catch (error) {
    logger.error("Error in getAllMedicationVariants controller:", error);
    next(error);
  }
};

/**
 * Search medication variants for POS/Sales
 * @route GET /api/medications/variants/search-for-sale
 */
export const searchVariantsForSale = async (req, res, next) => {
  try {
    const { search } = req.query;
    logger.info(`[POS Search] Searching for: "${search}"`);

    const variants = await medicationVariantService.searchVariantsForSale({
      search,
    });

    logger.info(`[POS Search] Found ${variants.length} variants`);
    if (variants.length > 0) {
      logger.info(`[POS Search] First result:`, variants[0]);
    }

    res.status(200).json({
      success: true,
      count: variants.length,
      data: variants,
    });
  } catch (error) {
    logger.error("Error in searchVariantsForSale controller:", error);
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
 * Create medication variants (batch)
 * @route POST /api/medications/:medicationId/variants
 */
export const createMedicationVariant = async (req, res, next) => {
  try {
    const { medicationId } = req.params; // Get from URL params
    const variantsData = req.body; // Array of variants

    // Validate that body is an array
    if (!Array.isArray(variantsData) || variantsData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty array of variants",
      });
    }

    // Validate each variant
    for (const variant of variantsData) {
      if (
        !variant.sku ||
        !variant.name ||
        !variant.unit ||
        !variant.sellPrice
      ) {
        return res.status(400).json({
          success: false,
          message: "Each variant must have sku, name, unit, and sellPrice",
        });
      }
    }

    // Create variants
    const createdVariants = [];
    for (const variantInput of variantsData) {
      // Check if SKU already exists
      const existingVariant =
        await medicationVariantService.getMedicationVariantBySku(
          variantInput.sku
        );
      if (existingVariant) {
        return res.status(409).json({
          success: false,
          message: `Variant with SKU "${variantInput.sku}" already exists`,
        });
      }

      const variantData = {
        medicationId,
        sku: variantInput.sku,
        name: variantInput.name,
        unit: variantInput.unit,
        unitFactor: variantInput.unitFactor
          ? String(variantInput.unitFactor)
          : "1.0",
        barcode: variantInput.barcode || null,
        sellPrice: String(variantInput.sellPrice),
        isActive:
          variantInput.isActive !== undefined ? variantInput.isActive : true,
        isForSale:
          variantInput.isForSale !== undefined ? variantInput.isForSale : false,
      };

      const variant =
        await medicationVariantService.createMedicationVariant(variantData);
      createdVariants.push(variant);
    }

    res.status(201).json({
      success: true,
      message: `${createdVariants.length} variant(s) created successfully`,
      data: createdVariants,
    });
  } catch (error) {
    logger.error("Error in createMedicationVariant controller:", error);
    next(error);
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
      variantData.medicationId = medicationId; // UUID string
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
    const id = req.params.id; // UUID string
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
