import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import logger from "../utils/logger.js";

// Initialize Gemini AI (use same key as aiAnalysisService)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

/**
 * Extract structured data from PDF using AI
 * @param {string} pdfText - Raw text extracted from PDF
 * @returns {Promise<Object>} Structured contract data
 */
async function extractContractDataWithAI(pdfText) {
  try {
    // Call Gemini API - Using same model as aiAnalysisService.js
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    });

    const prompt = `
Bạn là chuyên gia phân tích hợp đồng dược phẩm. Trích xuất thông tin từ hợp đồng tiếng Việt sau:

${pdfText}

Trả về JSON với format SAU ĐÂY (KHÔNG thêm markdown \`\`\`json):
{
  "supplier": {
    "name": "tên nhà cung cấp",
    "address": "địa chỉ",
    "phone": "số điện thoại",
    "email": "email"
  },
  "contractDetails": {
    "contractNumber": "số hợp đồng",
    "contractDate": "ngày ký (YYYY-MM-DD)",
    "effectiveDate": "ngày hiệu lực (YYYY-MM-DD)",
    "deliveryDays": số_ngày_giao_hàng,
    "totalAmount": tổng_giá_trị_số
  },
  "medications": [
    {
      "medicationName": "tên thuốc (VD: Paracetamol)",
      "variantName": "phiên bản đầy đủ (VD: Paracetamol 500mg Viên nén Hộp 100 viên)",
      "supplierSku": "mã SKU (VD: VP-PAR500, loại bỏ khoảng trắng)",
      "leadTimeDays": số_ngày_giao,
      "purchasePrice": giá_mua_số
    }
  ]
}

LƯU Ý:
- Loại bỏ khoảng trắng trong SKU (VP - PAR500 → VP-PAR500)
- Loại bỏ khoảng trắng trong số tiền (97 0 00 → 97000)
- Ngày tháng format: YYYY-MM-DD
- Chỉ trả về JSON, KHÔNG có text khác
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Remove markdown code blocks if present
    const jsonText = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsedData = JSON.parse(jsonText);

    logger.info(
      `✅ AI extracted ${parsedData.medications?.length || 0} medications from PDF`
    );
    return parsedData;
  } catch (error) {
    logger.error("AI extraction error:", error);
    throw new Error(`AI failed to parse contract: ${error.message}`);
  }
}

/**
 * Extract text from PDF blob
 * @param {Buffer} dataBuffer - PDF file buffer
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromPDF(dataBuffer) {
  try {
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(dataBuffer),
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    let fullText = "";

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText.trim();
  } catch (error) {
    logger.error("PDF Parse Error:", error);
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

  // SIMPLEST APPROACH: Search entire text for medication patterns
  // Pattern: digit + name + "mg" + "VP-XXX" or "VP - XXX" + digit + price with ₫
  const globalPattern =
    /(\d+)\s+([\wÀ-ỹ]+)\s+([\wÀ-ỹ\s()]+?mg[^V]*?)\s+(VP\s*-?\s*[\w\d]+)\s+(\d+)\s+([\d.,\s]+₫)/gi;

  let globalMatch;
  logger.info("Searching for medications in full contract text...");

  while ((globalMatch = globalPattern.exec(text)) !== null) {
    const [, stt, medName, variant, sku, leadTime, price] = globalMatch;
    logger.debug(`Found potential medication: STT=${stt}, Name=${medName}`);

    const cleanedSku = sku.replace(/\s+/g, "");
    const cleanedPrice = price.replace(/\s+/g, "");
    const parsedPrice = parseFloat(
      cleanedPrice.replace(/₫/g, "").replace(/\./g, "").replace(/,/g, ".")
    );

    variants.push({
      medicationName: medName.trim(),
      variantName: variant.trim(),
      supplierSku: cleanedSku,
      leadTimeDays: parseInt(leadTime, 10),
      purchasePrice: parsedPrice,
    });
  }

  if (variants.length > 0) {
    logger.info(`✅ Found ${variants.length} medications via global search`);
    return variants;
  }

  logger.warn(
    "Global search found 0 medications, trying table-based approach..."
  );

  // OLD TABLE-BASED APPROACH (fallback)
  // Try to find table with flexible patterns
  // Pattern 1: Standard format (DOCX) - has newline after "Giá mua"
  let tableMatch = text.match(
    /DANH\s+MỤC\s+HÀNG\s+HÓA[\s\S]*?Giá\s+mua\s*\n([\s\S]*?)Tổng\s+cộng/i
  );

  // Pattern 2: PDF format - may not have newline after "Giá mua"
  if (!tableMatch) {
    tableMatch = text.match(
      /DANH\s*M\s*Ụ\s*C\s*HÀNG\s*HÓA[\s\S]*?Giá\s+mua\s+([\s\S]*?)T\s*ổ\s*ng\s+c\s*ộ\s*ng/i
    );
  }

  // Pattern 3: Even more flexible - just find content between header and total
  if (!tableMatch) {
    tableMatch = text.match(
      /(?:STT|Giá\s*mua)\s+([\s\S]*?)(?:Tổng|T\s*ổ\s*ng)/i
    );
  }

  if (!tableMatch) {
    logger.warn("Could not find medication table in contract");
    logger.debug("Contract text preview:", text.substring(0, 500));
    return variants;
  }

  logger.debug("tableMatch full:", tableMatch[0].substring(0, 300));
  const tableText = tableMatch[1];
  logger.info("Found table text length:", tableText.length);
  logger.debug("Table text preview (raw):", tableText.substring(0, 500));

  // For PDF, try to split by medication number pattern (1, 2, 3, 4)
  // Match lines like "1 Paracetamol Paracetamol 500mg ... 40.000₫"
  const medicationRows = [];
  const rowPattern =
    /(\d+)\s+([\w\s]+?)\s+([\w\s()]+?)\s+(VP[-\s]*[\w\d]+)\s+(\d+)\s+([\d.,\s]+₫)/gi;

  let match;
  while ((match = rowPattern.exec(tableText)) !== null) {
    const [, stt, medName, variant, sku, leadTime, price] = match;
    medicationRows.push({
      stt,
      medicationName: medName.trim(),
      variantName: variant.trim(),
      supplierSku: sku.replace(/\s+/g, ""),
      leadTimeDays: parseInt(leadTime, 10),
      price: price.replace(/\s+/g, ""),
    });
  }

  if (medicationRows.length > 0) {
    logger.info(
      `✅ Found ${medicationRows.length} medications via direct pattern match`
    );
    return medicationRows.map((row) => ({
      medicationName: row.medicationName,
      variantName: row.variantName,
      supplierSku: row.supplierSku,
      leadTimeDays: row.leadTimeDays,
      purchasePrice: parseFloat(
        row.price.replace(/₫/g, "").replace(/\./g, "").replace(/,/g, ".")
      ),
    }));
  }

  // If direct pattern match failed, try line-by-line approach
  logger.debug("Direct pattern match failed, trying line-by-line...");

  // Normalize tableText for easier parsing (collapse multiple spaces in each line)
  const normalizedTableText = tableText
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .join("\n");

  logger.debug(
    "Table text preview (normalized):",
    normalizedTableText.substring(0, 500)
  );

  // Split into lines and filter empty lines
  const lines = normalizedTableText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  logger.info("Total lines in table:", lines.length);
  logger.debug("First 10 lines:", lines.slice(0, 10));

  // Try PDF format first (row-based: "1 Paracetamol Paracetamol 500mg VP - PAR500 5 40.000₫")
  // PDF rows are complex - parse from end backwards (price → leadTime → SKU → names)
  for (const line of lines) {
    // Must start with STT number
    if (!/^\d+\s/.test(line)) {
      continue;
    }

    // Extract price (always ends with ₫)
    const priceMatch = line.match(/([\d.,\s]+₫)\s*$/);
    if (!priceMatch) {
      continue;
    }

    // Remove price from line
    let remaining = line.substring(0, line.lastIndexOf(priceMatch[1])).trim();

    // Extract lead time (digit before price)
    const leadTimeMatch = remaining.match(/(\d+)\s*$/);
    if (!leadTimeMatch) {
      continue;
    }
    const leadTime = leadTimeMatch[1];
    remaining = remaining.substring(0, remaining.lastIndexOf(leadTime)).trim();

    // Extract SKU (VP-XXX or similar, may have spaces)
    const skuMatch = remaining.match(/(VP\s*-?\s*[\w\d]+|[\w]+-[\w\d]+)\s*$/i);
    if (!skuMatch) {
      continue;
    }
    const sku = skuMatch[1];
    remaining = remaining
      .substring(0, remaining.lastIndexOf(skuMatch[1]))
      .trim();

    // Extract STT (first number)
    const sttMatch = remaining.match(/^(\d+)\s+/);
    if (!sttMatch) {
      continue;
    }
    const stt = sttMatch[1];
    remaining = remaining.substring(sttMatch[0].length).trim();

    // What's left: "MedicationName VariantDescription"
    const parts = remaining.split(/\s+/);
    const medicationName = parts[0];
    const variantName = parts.slice(1).join(" ");

    // Clean up
    const cleanedSku = sku.replace(/\s+/g, "");
    const cleanedPrice = priceMatch[1].replace(/\s+/g, "");
    const parsedPrice = parseFloat(
      cleanedPrice.replace(/₫/g, "").replace(/\./g, "").replace(/,/g, ".")
    );

    variants.push({
      medicationName: medicationName.trim(),
      variantName: variantName.trim(),
      supplierSku: cleanedSku,
      leadTimeDays: parseInt(leadTime, 10),
      purchasePrice: parsedPrice,
    });

    logger.debug(`Parsed medication (PDF format) #${stt}:`, {
      medicationName,
      variantName,
      sku: cleanedSku,
      leadTime,
      price: parsedPrice,
    });
  }

  // If no PDF rows found, try DOCX format (cell-based: 6 lines per row)
  if (variants.length === 0) {
    logger.debug("No PDF format rows found, trying DOCX format...");

    // Filter out header lines (STT, Tên thuốc, Phiên bản, etc.)
    const dataLines = lines.filter(
      (line) =>
        !line.match(/^STT$/i) &&
        !line.match(/^Tên thu[ốố]c$/i) &&
        !line.match(/^Phiên b[ảả]n$/i) &&
        !line.match(/^Mã SKU/i) &&
        !line.match(/^Th[ờơ]i gian/i) &&
        !line.match(/^Giá mua$/i)
    );

    logger.debug("Data lines after filtering headers:", dataLines.length);
    logger.debug("First 12 data lines:", dataLines.slice(0, 12));

    logger.debug("Data lines after filtering headers:", dataLines.length);
    logger.debug("First 12 data lines:", dataLines.slice(0, 12));

    for (let i = 0; i < dataLines.length; i += 6) {
      if (i + 5 >= dataLines.length) {
        break;
      }

      const stt = dataLines[i];
      const medicationName = dataLines[i + 1];
      const variantName = dataLines[i + 2];
      const sku = dataLines[i + 3];
      const leadTime = dataLines[i + 4];
      const price = dataLines[i + 5];

      if (!/^\d+$/.test(stt)) {
        logger.debug(`Skipping non-numeric STT: ${stt}`);
        continue;
      }

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

      logger.debug(`Parsed medication (DOCX format) #${stt}:`, {
        medicationName,
        variantName,
        sku,
        leadTime,
        price: parsedPrice,
      });
    }
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
    let aiParsedData = null;

    // Extract text based on file type
    if (mimeType === "application/pdf") {
      text = await extractTextFromPDF(fileBuffer);

      // Use AI to parse PDF (more robust for messy formatting)
      logger.info("🤖 Using AI to parse PDF contract...");
      try {
        aiParsedData = await extractContractDataWithAI(text);
      } catch (aiError) {
        logger.warn(
          "AI parsing failed, falling back to regex:",
          aiError.message
        );
        // Will fall back to regex parsing below
      }
    } else if (
      mimeType === "application/msword" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      text = await extractTextFromDOC(fileBuffer);
      // DOCX works well with regex, no need for AI
    } else {
      throw new Error("Unsupported file type for parsing");
    }

    // Log full extracted text for debugging
    logger.info("=== FULL EXTRACTED TEXT ===");
    logger.info(text);
    logger.info("=== END EXTRACTED TEXT ===");

    // If AI parsed successfully, use AI data
    if (aiParsedData) {
      logger.info("✅ Using AI-parsed data");
      return {
        success: true,
        parsedBy: "ai",
        data: {
          supplier: aiParsedData.supplier || {},
          medications: aiParsedData.medications || [],
          contract: aiParsedData.contractDetails || {},
          rawText: text.substring(0, 500),
        },
      };
    }

    // Otherwise, fall back to regex parsing
    logger.info("📝 Using regex parsing");
    const supplierInfo = parseSupplierInfo(text);
    const medicationVariants = parseMedicationVariants(text);
    const contractDetails = parseContractDetails(text);

    return {
      success: true,
      parsedBy: "regex",
      data: {
        supplier: supplierInfo,
        medications: medicationVariants,
        contract: contractDetails,
        rawText: text.substring(0, 500),
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
