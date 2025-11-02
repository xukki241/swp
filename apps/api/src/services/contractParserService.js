import mammoth from "mammoth";

import logger from "../utils/logger.js";

/**
 * Extract text from PDF blob
 * @param {Buffer} dataBuffer - PDF file buffer
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromPDF(dataBuffer) {
  try {
    // Dynamic import for pdf-parse (CommonJS module)
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`Failed to extract PDF text: ${error.message}`);
  }
}

/**
 * Extract text from DOC/DOCX blob
 * @param {Buffer} dataBuffer - DOC/DOCX file buffer
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromDOC(dataBuffer) {
  try {
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    return result.value;
  } catch (error) {
    throw new Error(`Failed to extract DOC text: ${error.message}`);
  }
}

/**
 * Parse supplier information from contract text
 * @param {string} text - Contract text
 * @returns {Object} Parsed supplier info
 */
function parseSupplierInfo(text) {
  const supplierInfo = {
    name: null,
    contactName: null,
    address: null,
    phone: null,
    email: null,
  };

  // Parse supplier name (Bên bán)
  const supplierNameMatch = text.match(/Tên Bên bán[^\n]*?:\s*([^\n]+)/i);
  if (supplierNameMatch) {
    supplierInfo.name = supplierNameMatch[1].trim();
  }

  // Parse contact person
  const contactMatch = text.match(/Đại diện là Ông\/Bà:\s*([^\n]+)/i);
  if (contactMatch && contactMatch[1].trim() !== "(Không được cung cấp)") {
    supplierInfo.contactName = contactMatch[1].trim();
  }

  // Parse address - stop at next field
  const addressMatch = text.match(/Địa chỉ:\s*([^\n]+?)(?=Điện thoại|$)/i);
  if (addressMatch && addressMatch[1].trim() !== "(Không được cung cấp)") {
    supplierInfo.address = addressMatch[1].trim();
  }

  // Parse phone - stop at next field
  const phoneMatch = text.match(/Điện thoại:\s*([0-9]+)(?=Email|$)/i);
  if (phoneMatch && phoneMatch[1].trim() !== "(Không được cung cấp)") {
    supplierInfo.phone = phoneMatch[1].trim();
  }

  // Parse email - only email format
  const emailMatch = text.match(
    /Email:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?=\s|Tài|$)/i
  );
  if (emailMatch && emailMatch[1].trim() !== "(Không được cung cấp)") {
    supplierInfo.email = emailMatch[1].trim();
  }

  logger.debug("Parsed supplier info:", supplierInfo);
  return supplierInfo;
}

/**
 * Parse medication variants from contract table
 * @param {string} text - Contract text
 * @returns {Array} Array of medication variants
 */
function parseMedicationVariants(text) {
  const variants = [];

  // Find the table section - match from STT to Tổng cộng
  const tableMatch = text.match(
    /DANH MỤC HÀNG HÓA[\s\S]*?Giá mua\s*\n([\s\S]*?)(?=Tổng cộng|$)/i
  );

  if (!tableMatch) {
    logger.warn("Could not find medication table in contract");
    logger.debug("Contract text preview:", text.substring(0, 500));
    return variants;
  }

  const tableText = tableMatch[1];
  logger.info("Found table text length:", tableText.length);

  // Split into lines and filter empty lines
  const lines = tableText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  logger.debug("Total lines in table:", lines.length);

  // In DOCX, each cell is a separate line
  // Pattern: STT, Tên thuốc, Phiên bản, Mã SKU, Thời gian (ngày), Giá
  // So we need to read 6 lines at a time
  for (let i = 0; i < lines.length; i += 6) {
    // Check if we have at least 6 lines
    if (i + 5 >= lines.length) {
      break;
    }

    const stt = lines[i];
    const medicationName = lines[i + 1];
    const variantName = lines[i + 2];
    const sku = lines[i + 3];
    const leadTime = lines[i + 4];
    const price = lines[i + 5];

    // Validate STT is a number
    if (!/^\d+$/.test(stt)) {
      logger.debug(`Skipping non-numeric STT: ${stt}`);
      continue;
    }

    // Parse and clean data
    const parsedPrice = parseFloat(
      price.replace(/₫/g, "").replace(/\./g, "").replace(/,/g, ".")
    );

    variants.push({
      medicationName: medicationName.trim(),
      variantName: variantName.trim(),
      supplierSku: sku.trim(),
      leadTimeDays: parseInt(leadTime.trim(), 10),
      purchasePrice: parsedPrice,
    });

    logger.debug(`Parsed medication #${stt}:`, {
      medicationName,
      variantName,
      sku,
      leadTime,
      price: parsedPrice,
    });
  }

  logger.info(`✅ Parsed ${variants.length} medication variants`);
  return variants;
}

/**
 * Parse contract details
 * @param {string} text - Contract text
 * @returns {Object} Contract details
 */
function parseContractDetails(text) {
  const details = {
    contractNumber: null,
    contractDate: null,
    effectiveDate: null,
    deliveryDays: null,
    totalAmount: null,
  };

  // Parse contract number
  const numberMatch = text.match(/Số:\s*([^\n]+)/i);
  if (numberMatch) {
    details.contractNumber = numberMatch[1].trim();
  }

  // Parse contract date
  const dateMatch = text.match(/ngày\s+(\d+)\s+tháng\s+(\d+)\s+năm\s+(\d+)/i);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    details.contractDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Parse effective date
  const effectiveDateMatch = text.match(
    /có hiệu lực kể từ ngày\s+(\d+)\s+tháng\s+(\d+)\s+năm\s+(\d+)/i
  );
  if (effectiveDateMatch) {
    const [, day, month, year] = effectiveDateMatch;
    details.effectiveDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Parse delivery time
  const deliveryMatch = text.match(/(\d+)\s+ngày\s+kể\s+từ/i);
  if (deliveryMatch) {
    details.deliveryDays = parseInt(deliveryMatch[1], 10);
  }

  // Parse total amount
  const amountMatch = text.match(/Giá trị hợp đồng\s+([\d.,]+)₫/i);
  if (amountMatch) {
    details.totalAmount = parseFloat(
      amountMatch[1].replace(/[.,]/g, (m) => (m === "." ? "" : "."))
    );
  }

  return details;
}

/**
 * Parse complete contract file
 * @param {string} filePath - Path to contract file
 * @param {string} mimeType - File MIME type
 * @returns {Promise<Object>} Parsed contract data
 */
export async function parseContractFile(fileBuffer, mimeType) {
  try {
    let text = "";

    // Extract text based on file type
    if (mimeType === "application/pdf") {
      text = await extractTextFromPDF(fileBuffer);
    } else if (
      mimeType === "application/msword" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      text = await extractTextFromDOC(fileBuffer);
    } else {
      throw new Error("Unsupported file type for parsing");
    }

    // Log full extracted text for debugging
    logger.info("=== FULL EXTRACTED TEXT ===");
    logger.info(text);
    logger.info("=== END EXTRACTED TEXT ===");

    // Parse all information
    const supplierInfo = parseSupplierInfo(text);
    const medicationVariants = parseMedicationVariants(text);
    const contractDetails = parseContractDetails(text);

    return {
      success: true,
      data: {
        supplier: supplierInfo,
        medications: medicationVariants,
        contract: contractDetails,
        rawText: text.substring(0, 500), // First 500 chars for debugging
      },
    };
  } catch (error) {
    throw new Error(`Failed to parse contract: ${error.message}`);
  }
}

/**
 * Match medication names from contract with database medications
 * @param {Array} contractMedications - Medications from contract
 * @param {Array} dbMedications - Medications from database
 * @returns {Array} Matched medications with IDs
 */
export function matchMedicationsWithDatabase(
  contractMedications,
  dbMedications
) {
  return contractMedications.map((contractMed) => {
    // Try to find exact match
    let match = dbMedications.find(
      (dbMed) =>
        dbMed.name.toLowerCase() === contractMed.medicationName.toLowerCase()
    );

    // Try partial match if exact match fails
    if (!match) {
      match = dbMedications.find((dbMed) =>
        dbMed.name
          .toLowerCase()
          .includes(contractMed.medicationName.toLowerCase())
      );
    }

    return {
      ...contractMed,
      medicationId: match?.id || null,
      medicationName: match?.name || contractMed.medicationName,
      matchConfidence: match
        ? match.name === contractMed.medicationName
          ? "high"
          : "medium"
        : "low",
    };
  });
}
