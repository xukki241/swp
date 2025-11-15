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
    const allMedicationsResult = await getAllMedications();
    const allMedications = Array.isArray(allMedicationsResult)
      ? allMedicationsResult
      : allMedicationsResult?.data || [];

    // Match medications from contract with database
    const matchedMedications = matchMedicationsWithDatabase(
      parsedData.data.medications,
      allMedications
    );

    // Get all variants for matching (without pagination limit)
    const allVariantsResult = await getAllMedicationVariants({
      limit: 10000, // Get all variants
      offset: 0,
    });
    const allVariants = Array.isArray(allVariantsResult)
      ? allVariantsResult
      : Array.isArray(allVariantsResult?.data)
        ? allVariantsResult.data
        : [];

    // Try to match variants based on medication ID and variant name/SKU
    const medicationsWithVariants = matchedMedications.map((med, index) => {
      logger.info(
        `\n🔍 Processing medication #${index + 1}: ${med.medicationName}`
      );
      logger.info(`   Medication ID: ${med.medicationId}`);
      logger.info(`   Variant name from contract: ${med.variantName}`);
      logger.info(`   Supplier SKU: ${med.supplierSku}`);

      if (!med.medicationId) {
        logger.warn(`   ⚠️ No medication ID - skipping variant matching`);
        return med; // Skip if medication not matched
      }

      // Get variants for this medication
      const medVariants = allVariants.filter(
        (v) =>
          v.medicationId === med.medicationId ||
          v.medication_id === med.medicationId
      );

      logger.info(
        `   Found ${medVariants.length} variants in DB for this medication`
      );
      medVariants.forEach((v, i) => {
        logger.info(
          `     Variant ${i + 1}: id=${v.id}, name="${v.name}", sku="${v.sku || "N/A"}"`
        );
      });

      if (medVariants.length === 0) {
        logger.warn(`   ⚠️ No variants found in DB`);
        return med; // No variants found
      }

      // Try to match by SKU first (most reliable)
      let matchedVariant = medVariants.find(
        (v) =>
          v.sku &&
          med.supplierSku &&
          v.sku.toLowerCase() === med.supplierSku.toLowerCase()
      );

      if (matchedVariant) {
        logger.info(
          `   ✅ Matched by SKU: "${med.supplierSku}" → Variant ID ${matchedVariant.id}`
        );
      }

      // Try to match by variant name (fuzzy matching)
      if (!matchedVariant) {
        logger.info(`   🔄 Trying fuzzy name matching...`);
        // Normalize names for comparison (remove special chars, extra spaces)
        const normalizeText = (text) =>
          text.toLowerCase().replace(/[()]/g, "").replace(/\s+/g, " ").trim();

        const parsedVariantNorm = normalizeText(med.variantName);
        logger.info(`   Normalized contract variant: "${parsedVariantNorm}"`);

        // Extract dosage from contract variant (e.g., "500mg", "10mg")
        const contractDosageMatch =
          med.variantName.match(/(\d+(?:\.\d+)?)\s*mg/i);
        const contractDosage = contractDosageMatch
          ? contractDosageMatch[1]
          : null;

        matchedVariant = medVariants.find((v) => {
          const dbVariantNorm = normalizeText(v.name);

          // Extract dosage from DB variant
          const dbDosageMatch = v.name.match(/(\d+(?:\.\d+)?)\s*mg/i);
          const dbDosage = dbDosageMatch ? dbDosageMatch[1] : null;

          // If both have dosages, they MUST match exactly
          if (contractDosage && dbDosage && contractDosage !== dbDosage) {
            logger.info(
              `     Comparing with DB variant "${v.name}" (normalized: "${dbVariantNorm}")`
            );
            logger.info(
              `       ❌ Dosage mismatch: ${contractDosage}mg ≠ ${dbDosage}mg - SKIP`
            );
            return false;
          }

          // Check if they share common parts (dosage, form, etc.)
          const parsedParts = parsedVariantNorm.split(" ");
          const dbParts = dbVariantNorm.split(" ");

          // Count matching parts
          const matchingParts = parsedParts.filter((part) =>
            dbParts.includes(part)
          ).length;

          const matchRatio =
            matchingParts / Math.max(parsedParts.length, dbParts.length);

          logger.info(
            `     Comparing with DB variant "${v.name}" (normalized: "${dbVariantNorm}")`
          );
          logger.info(
            `       Match ratio: ${matchRatio.toFixed(2)} (${matchingParts}/${Math.max(parsedParts.length, dbParts.length)} parts)`
          );

          // Consider it a match if at least 60% of parts match
          return matchRatio >= 0.6;
        });

        if (matchedVariant) {
          logger.info(
            `   ✅ Matched by fuzzy name: Variant ID ${matchedVariant.id}`
          );
        }
      }

      if (matchedVariant) {
        logger.info(
          `✅ Final match: "${med.variantName}" → "${matchedVariant.name}" (ID: ${matchedVariant.id})`
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
