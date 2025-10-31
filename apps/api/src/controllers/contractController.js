import {
  matchMedicationsWithDatabase,
  parseContractFile,
} from "../services/contractParserService.js";
import { fileService } from "../services/fileService.js";
import { getAllMedications } from "../services/medicationService.js";
import { getAllMedicationVariants } from "../services/medicationVariantService.js";
import logger from "../utils/logger.js";

/**
 * Parse contract file and extract data
 * @route POST /api/contracts/parse
 */
export const parseContract = async (req, res, next) => {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "File ID is required",
      });
    }

    // Get file information from database
    const file = await fileService.getFileWithBlob(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Check if file type is supported
    const supportedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!supportedTypes.includes(file.mimeType)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type. Only PDF and DOC/DOCX are supported.",
      });
    }

    // Parse contract file from blob
    const parsedData = await parseContractFile(file.blob, file.mimeType);

    // Get all medications from database for matching
    const allMedications = await getAllMedications();

    // Match medications from contract with database
    const matchedMedications = matchMedicationsWithDatabase(
      parsedData.data.medications,
      allMedications
    );

    // Get all variants for matching
    const allVariants = await getAllMedicationVariants({});

    // Try to match variants based on medication ID and variant name/SKU
    const medicationsWithVariants = matchedMedications.map((med) => {
      if (!med.medicationId) {
        return med; // Skip if medication not matched
      }

      // Get variants for this medication
      const medVariants = allVariants.filter(
        (v) =>
          v.medicationId === med.medicationId ||
          v.medication_id === med.medicationId
      );

      if (medVariants.length === 0) {
        return med; // No variants found
      }

      // Try to match by SKU first (most reliable)
      let matchedVariant = medVariants.find(
        (v) =>
          v.sku &&
          med.supplierSku &&
          v.sku.toLowerCase() === med.supplierSku.toLowerCase()
      );

      // Try to match by variant name (fuzzy matching)
      if (!matchedVariant) {
        // Normalize names for comparison (remove special chars, extra spaces)
        const normalizeText = (text) =>
          text.toLowerCase().replace(/[()]/g, "").replace(/\s+/g, " ").trim();

        const parsedVariantNorm = normalizeText(med.variantName);

        matchedVariant = medVariants.find((v) => {
          const dbVariantNorm = normalizeText(v.name);

          // Check if they share common parts (dosage, form, etc.)
          const parsedParts = parsedVariantNorm.split(" ");
          const dbParts = dbVariantNorm.split(" ");

          // Count matching parts
          const matchingParts = parsedParts.filter((part) =>
            dbParts.includes(part)
          ).length;

          // Consider it a match if at least 60% of parts match
          return (
            matchingParts / Math.max(parsedParts.length, dbParts.length) >= 0.6
          );
        });
      }

      if (matchedVariant) {
        logger.info(
          `✅ Matched variant: ${med.variantName} → ${matchedVariant.name}`
        );
        return {
          ...med,
          medicationVariantId: matchedVariant.id,
          variantName: matchedVariant.name, // Use DB variant name
        };
      }

      logger.warn(`⚠️ No variant match found for: ${med.variantName}`);
      return med;
    });

    res.json({
      success: true,
      message: "Contract parsed successfully",
      data: {
        supplier: parsedData.data.supplier,
        medications: medicationsWithVariants,
        contract: parsedData.data.contract,
      },
    });
  } catch (error) {
    logger.error("Error parsing contract:", error);
    next(error);
  }
};
