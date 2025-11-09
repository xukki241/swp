import { searchMedications } from "./medicationsService";

/**
 * Barcode validation and processing service
 */

// Barcode type patterns
const BARCODE_PATTERNS = {
  EAN13: /^\d{13}$/,
  UPCA: /^\d{12}$/,
  // eslint-disable-next-line no-control-regex
  CODE128: /^[\x00-\x7F]{1,20}$/,
  CODE39: /^[0-9A-Z\-. $/+%]+$/,
};

/**
 * Detect barcode type from string
 * @param {string} barcode - Barcode string
 * @returns {string|null} Barcode type or null
 */
export function detectBarcodeType(barcode) {
  if (!barcode) {
    return null;
  }

  if (BARCODE_PATTERNS.EAN13.test(barcode)) {
    return "EAN13";
  }
  if (BARCODE_PATTERNS.UPCA.test(barcode)) {
    return "UPCA";
  }
  if (BARCODE_PATTERNS.CODE39.test(barcode)) {
    return "CODE39";
  }
  if (BARCODE_PATTERNS.CODE128.test(barcode)) {
    return "CODE128";
  }

  return "UNKNOWN";
}

/**
 * Validate barcode format
 * @param {string} barcode - Barcode string
 * @param {string} expectedType - Expected barcode type (optional)
 * @returns {Object} Validation result
 */
export function validateBarcode(barcode, expectedType = null) {
  if (!barcode || typeof barcode !== "string") {
    return { valid: false, error: "Invalid barcode: must be a string" };
  }

  const trimmed = barcode.trim();

  if (trimmed.length < 4) {
    return { valid: false, error: "Barcode too short (min 4 characters)" };
  }

  if (trimmed.length > 20) {
    return { valid: false, error: "Barcode too long (max 20 characters)" };
  }

  const detectedType = detectBarcodeType(trimmed);

  if (expectedType && detectedType !== expectedType) {
    return {
      valid: false,
      error: `Expected ${expectedType} but got ${detectedType}`,
    };
  }

  return {
    valid: true,
    barcode: trimmed,
    type: detectedType,
  };
}

/**
 * Calculate EAN-13 check digit
 * @param {string} barcode - First 12 digits of EAN-13
 * @returns {number} Check digit
 */
export function calculateEAN13CheckDigit(barcode) {
  const digits = barcode.slice(0, 12).split("").map(Number);
  const sum = digits.reduce((acc, digit, index) => {
    return acc + digit * (index % 2 === 0 ? 1 : 3);
  }, 0);
  return (10 - (sum % 10)) % 10;
}

/**
 * Validate EAN-13 checksum
 * @param {string} barcode - EAN-13 barcode
 * @returns {boolean} True if valid
 */
export function validateEAN13Checksum(barcode) {
  if (barcode.length !== 13 || !/^\d{13}$/.test(barcode)) {
    return false;
  }

  const checkDigit = parseInt(barcode[12]);
  const calculatedCheckDigit = calculateEAN13CheckDigit(barcode);

  return checkDigit === calculatedCheckDigit;
}

/**
 * Format barcode for display
 * @param {string} barcode - Raw barcode
 * @param {string} type - Barcode type
 * @returns {string} Formatted barcode
 */
export function formatBarcode(barcode, type = null) {
  const detectedType = type || detectBarcodeType(barcode);

  switch (detectedType) {
    case "EAN13":
      // Format: 123-4567890-1
      return `${barcode.slice(0, 3)}-${barcode.slice(3, 10)}-${barcode.slice(10)}`;

    case "UPCA":
      // Format: 123456-789012
      return `${barcode.slice(0, 6)}-${barcode.slice(6)}`;

    default:
      return barcode;
  }
}

/**
 * Search medications by barcode
 * @param {string} barcode - Barcode to search
 * @returns {Promise<Array>} Search results
 */
export async function searchByBarcode(barcode) {
  try {
    // Validate first
    const validation = validateBarcode(barcode);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Use searchMedications for sales data (includes sellPrice, availableQuantity, etc.)
    const results = await searchMedications(barcode);

    return results || [];
  } catch (error) {
    console.error("Barcode search error:", error);
    throw error;
  }
}

/**
 * Batch barcode lookup
 * @param {Array<string>} barcodes - Array of barcodes
 * @returns {Promise<Object>} Map of barcode -> results
 */
export async function lookupBarcodes(barcodes) {
  const results = {};

  await Promise.all(
    barcodes.map(async (barcode) => {
      try {
        results[barcode] = await searchByBarcode(barcode);
      } catch (error) {
        results[barcode] = { error: error.message };
      }
    })
  );

  return results;
}

/**
 * Log barcode scan for audit trail
 * @param {string} barcode - Scanned barcode
 * @param {Object} metadata - Additional data
 */
export function logBarcodeScan(barcode, metadata = {}) {
  const logEntry = {
    barcode,
    timestamp: new Date().toISOString(),
    type: detectBarcodeType(barcode),
    ...metadata,
  };

  // Log to console (can be extended to send to backend)
  console.info("[BARCODE_SCAN]", logEntry);

  // Store in localStorage for debugging (last 50 scans)
  try {
    const logs = JSON.parse(localStorage.getItem("barcode_scan_logs") || "[]");
    logs.unshift(logEntry);
    localStorage.setItem(
      "barcode_scan_logs",
      JSON.stringify(logs.slice(0, 50))
    );
  } catch (error) {
    console.warn("Failed to log barcode scan:", error);
  }
}
