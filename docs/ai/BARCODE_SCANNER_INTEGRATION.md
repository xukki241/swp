# Barcode Scanner Integration Guide

> **Method 2: Custom Hook Approach**  
> **Date**: November 8, 2025  
> **Author**: Development Team  
> **Status**: Ready for Implementation

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture](#architecture)
4. [Implementation Steps](#implementation-steps)
5. [API Reference](#api-reference)
6. [Integration Examples](#integration-examples)
7. [Testing Guide](#testing-guide)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## Overview

This guide describes how to integrate physical barcode scanners (HID devices) into PharmaFlow using the **Custom Hook approach**. This method provides maximum flexibility while maintaining minimal code changes.

### Why Custom Hook Approach?

✅ **Non-invasive**: No changes to existing UI components  
✅ **Flexible**: Works with any input element (Input, AutocompleteCombobox, etc.)  
✅ **Reusable**: Single hook works across all screens  
✅ **Testable**: Isolated logic easy to unit test  
✅ **Composable**: Can be combined with other hooks  
✅ **Gradual Migration**: Add to screens one at a time

### How HID Barcode Scanners Work

Physical barcode scanners act as **keyboard input devices**:

- Scan a barcode → Types characters rapidly (10-50ms per character)
- Automatically appends **Enter key** at the end
- No special drivers or software required
- Works with any focused input element

---

## Prerequisites

### Hardware Requirements

- **USB Barcode Scanner** (HID-compliant)
  - Recommended: Symbol/Zebra LS2208, Honeywell Voyager 1200g
  - Any HID scanner will work (no drivers needed)
- USB port on computer/tablet
- Optional: Bluetooth scanners (also work as HID)

### Software Requirements

- React 18+
- Existing PharmaFlow codebase
- No additional npm packages needed

### Supported Barcode Types

- EAN-13 (13 digits)
- UPC-A (12 digits)
- Code-128 (alphanumeric)
- Code-39 (alphanumeric)
- Any format 4-20 characters

---

## Architecture

### Component Structure

```
apps/web/src/
├── hooks/
│   ├── useBarcodeScanner.js        ← Core hook (NEW)
│   └── useMedications.js           ← Existing
├── services/
│   └── barcodeService.js           ← Validation & API (NEW)
└── pages/
    ├── sales/
    │   └── components/
    │       └── MedicationSearch.jsx ← Integrate here
    ├── medications/
    │   └── MedicationVariantsPage.jsx ← Integrate here
    └── inventory/
        └── StockOverviewPage/
            └── components/
                └── SearchBar.jsx    ← Integrate here
```

### Data Flow

```
Barcode Scanner (HID Device)
    ↓
Keyboard Events (fast typing + Enter)
    ↓
useBarcodeScanner Hook (detection + debouncing)
    ↓
onScan Callback (with barcode string)
    ↓
barcodeService.searchByBarcode() (API call)
    ↓
Component State Update (display results)
```

---

## Implementation Steps

### Step 1: Create the Core Hook

**File**: `apps/web/src/hooks/useBarcodeScanner.js`

```javascript
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Custom hook for barcode scanner integration
 * Detects rapid keyboard input (characteristic of barcode scanners) and triggers callback
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onScan - Callback when barcode is scanned (receives barcode string)
 * @param {Function} options.onError - Callback when error occurs (receives error message)
 * @param {number} options.minLength - Minimum barcode length (default: 4)
 * @param {number} options.maxLength - Maximum barcode length (default: 20)
 * @param {number} options.debounceMs - Debounce time in ms (default: 100)
 * @param {boolean} options.enabled - Enable/disable scanning (default: true)
 * @param {boolean} options.autoSubmit - Auto-submit on Enter (default: true)
 * @param {boolean} options.clearOnSubmit - Clear buffer after submit (default: true)
 * @param {string} options.scanPrefix - Expected prefix to filter (optional)
 * @param {string} options.scanSuffix - Expected suffix to filter (optional)
 *
 * @returns {Object} Hook state and methods
 * @returns {React.MutableRefObject} inputRef - Ref to attach to input element
 * @returns {boolean} isScanning - True when actively scanning
 * @returns {string} scannedValue - Last scanned barcode value
 * @returns {Array} scanHistory - Array of recent scans (last 10)
 * @returns {number|null} lastScanTime - Timestamp of last scan
 * @returns {Function} clearScanned - Clear scanned value
 * @returns {Function} clearHistory - Clear scan history
 */
export const useBarcodeScanner = ({
  onScan,
  onError,
  minLength = 4,
  maxLength = 20,
  debounceMs = 100,
  enabled = true,
  autoSubmit = true,
  clearOnSubmit = true,
  scanPrefix = "",
  scanSuffix = "",
} = {}) => {
  // State
  const [isScanning, setIsScanning] = useState(false);
  const [scannedValue, setScannedValue] = useState("");
  const [scanHistory, setScanHistory] = useState([]);
  const [lastScanTime, setLastScanTime] = useState(null);

  // Refs
  const inputRef = useRef(null);
  const bufferRef = useRef("");
  const timeoutRef = useRef(null);
  const lastKeyTimeRef = useRef(0);
  const scanCountRef = useRef(0);

  // Clear buffer helper
  const clearBuffer = useCallback(() => {
    bufferRef.current = "";
    setIsScanning(false);
  }, []);

  // Clear scanned value
  const clearScanned = useCallback(() => {
    setScannedValue("");
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setScanHistory([]);
  }, []);

  // Process scanned barcode
  const processBarcode = useCallback(
    (barcode) => {
      // Remove prefix/suffix if specified
      let processedBarcode = barcode;

      if (scanPrefix && processedBarcode.startsWith(scanPrefix)) {
        processedBarcode = processedBarcode.slice(scanPrefix.length);
      }

      if (scanSuffix && processedBarcode.endsWith(scanSuffix)) {
        processedBarcode = processedBarcode.slice(0, -scanSuffix.length);
      }

      // Validate length
      if (processedBarcode.length < minLength) {
        onError?.(
          `Barcode too short: ${processedBarcode.length} chars (min: ${minLength})`
        );
        return false;
      }

      if (processedBarcode.length > maxLength) {
        onError?.(
          `Barcode too long: ${processedBarcode.length} chars (max: ${maxLength})`
        );
        return false;
      }

      // Success - update state
      setScannedValue(processedBarcode);
      setLastScanTime(Date.now());
      setScanHistory((prev) => [
        {
          barcode: processedBarcode,
          timestamp: Date.now(),
          id: ++scanCountRef.current,
        },
        ...prev.slice(0, 9), // Keep last 10
      ]);

      // Trigger callback
      onScan?.(processedBarcode);

      return true;
    },
    [minLength, maxLength, scanPrefix, scanSuffix, onScan, onError]
  );

  // Main effect - keyboard event listener
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Skip if modifier keys are pressed (Ctrl, Alt, etc.)
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Detect fast typing (characteristic of barcode scanner)
      // Human typing: usually > 100ms between keys
      // Scanner typing: usually < 50ms between keys
      if (timeDiff < 50 && bufferRef.current.length > 0) {
        setIsScanning(true);
      }

      // Handle Enter key
      if (e.key === "Enter") {
        const barcode = bufferRef.current;

        if (autoSubmit && barcode.length >= minLength) {
          e.preventDefault();
          e.stopPropagation();

          const success = processBarcode(barcode);

          if (success && clearOnSubmit) {
            clearBuffer();
          }
        }
      }
      // Handle regular characters
      else if (e.key.length === 1) {
        bufferRef.current += e.key;

        // Auto-clear if exceeds max length
        if (bufferRef.current.length > maxLength) {
          onError?.(`Scan exceeded max length: ${maxLength} chars`);
          clearBuffer();
        }
      }
      // Handle Backspace (clear buffer)
      else if (e.key === "Backspace") {
        bufferRef.current = bufferRef.current.slice(0, -1);
        if (bufferRef.current.length === 0) {
          setIsScanning(false);
        }
      }
      // Handle Escape (clear everything)
      else if (e.key === "Escape") {
        clearBuffer();
      }

      // Auto-clear buffer after debounce period
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        clearBuffer();
      }, debounceMs);
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener("keydown", handleKeyDown);

      // Cleanup
      return () => {
        input.removeEventListener("keydown", handleKeyDown);
        clearTimeout(timeoutRef.current);
      };
    }
  }, [
    enabled,
    minLength,
    maxLength,
    debounceMs,
    autoSubmit,
    clearOnSubmit,
    processBarcode,
    clearBuffer,
    onError,
  ]);

  return {
    inputRef,
    isScanning,
    scannedValue,
    scanHistory,
    lastScanTime,
    clearScanned,
    clearHistory,
  };
};
```

---

### Step 2: Create Barcode Service (Optional but Recommended)

**File**: `apps/web/src/services/barcodeService.js`

```javascript
import { searchMedications, findVariantsByBarcode } from "./medicationsService";

/**
 * Barcode validation and processing service
 */

// Barcode type patterns
const BARCODE_PATTERNS = {
  EAN13: /^\d{13}$/,
  UPCA: /^\d{12}$/,
  CODE128: /^[\x00-\x7F]{1,20}$/,
  CODE39: /^[0-9A-Z\-. $\/+%]+$/,
};

/**
 * Detect barcode type from string
 * @param {string} barcode - Barcode string
 * @returns {string|null} Barcode type or null
 */
export function detectBarcodeType(barcode) {
  if (!barcode) return null;

  if (BARCODE_PATTERNS.EAN13.test(barcode)) return "EAN13";
  if (BARCODE_PATTERNS.UPCA.test(barcode)) return "UPCA";
  if (BARCODE_PATTERNS.CODE39.test(barcode)) return "CODE39";
  if (BARCODE_PATTERNS.CODE128.test(barcode)) return "CODE128";

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

    // Try exact barcode match first
    const exactResults = await findVariantsByBarcode(barcode);

    if (exactResults && exactResults.length > 0) {
      return exactResults;
    }

    // Fallback to general search (in case barcode is in name/SKU)
    const generalResults = await searchMedications(barcode);

    return generalResults || [];
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
  console.log("[BARCODE_SCAN]", logEntry);

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
```

---

## API Reference

### useBarcodeScanner Hook

#### Parameters

| Parameter       | Type       | Default | Description                                                 |
| --------------- | ---------- | ------- | ----------------------------------------------------------- |
| `onScan`        | `Function` | -       | Callback when barcode scanned. Receives `(barcode: string)` |
| `onError`       | `Function` | -       | Callback when error occurs. Receives `(error: string)`      |
| `minLength`     | `number`   | `4`     | Minimum barcode length                                      |
| `maxLength`     | `number`   | `20`    | Maximum barcode length                                      |
| `debounceMs`    | `number`   | `100`   | Debounce time in milliseconds                               |
| `enabled`       | `boolean`  | `true`  | Enable/disable scanning                                     |
| `autoSubmit`    | `boolean`  | `true`  | Auto-submit on Enter key                                    |
| `clearOnSubmit` | `boolean`  | `true`  | Clear buffer after submit                                   |
| `scanPrefix`    | `string`   | `''`    | Expected barcode prefix to filter                           |
| `scanSuffix`    | `string`   | `''`    | Expected barcode suffix to filter                           |
| `global`        | `boolean`  | `false` | Listen globally (no focus required) vs specific input       |

#### Return Values

| Property       | Type                     | Description                    |
| -------------- | ------------------------ | ------------------------------ |
| `inputRef`     | `React.MutableRefObject` | Ref to attach to input element |
| `isScanning`   | `boolean`                | True when actively scanning    |
| `scannedValue` | `string`                 | Last scanned barcode value     |
| `scanHistory`  | `Array<Object>`          | Recent scans (last 10)         |
| `lastScanTime` | `number \| null`         | Timestamp of last scan         |
| `clearScanned` | `Function`               | Clear scanned value            |
| `clearHistory` | `Function`               | Clear scan history             |

---

## Integration Examples

### Example 1: Sales POS - Medication Search

**File**: `apps/web/src/pages/sales/components/MedicationSearch.jsx`

**Before**:

```javascript
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function MedicationSearch({
  onSearch,
  results,
  onSelectMedication,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term) => {
    setSearchTerm(term);
    onSearch(term);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Tìm thuốc theo tên..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      {/* ... rest of component */}
    </div>
  );
}
```

**After** (with barcode scanner):

```javascript
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Scan } from "lucide-react";
import { useState } from "react";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { searchByBarcode } from "@/services/barcodeService";
import { toast } from "sonner";

export default function MedicationSearch({ onSearch, results, onSelectMedication }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Add barcode scanner hook
  const { inputRef, isScanning, scannedValue, scanHistory } = useBarcodeScanner({
    onScan: async (barcode) => {
      console.log("Barcode scanned:", barcode);

      try {
        // Search by barcode
        const results = await searchByBarcode(barcode);

        if (results.length === 0) {
          toast.error(`Không tìm thấy sản phẩm với mã: ${barcode}`);
        } else if (results.length === 1) {
          // Single result - auto add to cart
          onSelectMedication(results[0]);
          toast.success(`Đã thêm: ${results[0].medicationName}`);
        } else {
          // Multiple results - show in search
          setSearchTerm(barcode);
          onSearch(barcode);
          toast.info(`Tìm thấy ${results.length} sản phẩm`);
        }
      } catch (error) {
        toast.error("Lỗi khi quét mã: " + error.message);
      }
    },
    onError: (error) => {
      toast.error(error);
    },
    minLength: 4,
    maxLength: 20,
  });

  const handleSearch = (term) => {
    setSearchTerm(term);
    onSearch(term);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          ref={inputRef}  {/* Attach barcode scanner ref */}
          placeholder="Quét mã hoặc nhập tên thuốc..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className={`pl-10 ${isScanning ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
        />

        {/* Scanning indicator */}
        {isScanning && (
          <Badge
            variant="secondary"
            className="absolute right-2 top-1/2 -translate-y-1/2 animate-pulse bg-blue-500 text-white"
          >
            <Scan className="w-3 h-3 mr-1" />
            Đang quét...
          </Badge>
        )}

        {/* Last scanned value indicator */}
        {scannedValue && !isScanning && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-600 font-medium">
            ✓ Đã quét
          </div>
        )}
      </div>

      {/* Optional: Scan history dropdown */}
      {scanHistory.length > 0 && (
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer">Lịch sử quét ({scanHistory.length})</summary>
          <ul className="mt-2 space-y-1 pl-4">
            {scanHistory.slice(0, 5).map((scan) => (
              <li key={scan.id}>
                {scan.barcode} - {new Date(scan.timestamp).toLocaleTimeString()}
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* ... rest of component */}
    </div>
  );
}
```

**Key Changes**:

1. ✅ Import `useBarcodeScanner` hook
2. ✅ Import `searchByBarcode` service
3. ✅ Add hook with `onScan` callback
4. ✅ Attach `inputRef` to Input component
5. ✅ Add visual feedback (scanning badge)
6. ✅ Handle scan results (single vs multiple)
7. ✅ Show toast notifications

---

### Example 2: Medication Variants - Search & Barcode Assignment

**File**: `apps/web/src/pages/medications/MedicationVariantsPage.jsx`

```javascript
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Scan, X } from "lucide-react";
import { useState } from "react";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { toast } from "sonner";

export default function MedicationVariantsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Barcode scanner for search
  const { inputRef: searchInputRef, isScanning: isSearchScanning } =
    useBarcodeScanner({
      onScan: (barcode) => {
        setSearchInput(barcode);
        setAppliedSearch(barcode);
        toast.success(`Tìm kiếm mã: ${barcode}`);
      },
      minLength: 4,
    });

  // Barcode scanner for barcode field in form
  const {
    inputRef: barcodeInputRef,
    isScanning: isBarcodeScanning,
    scannedValue: scannedBarcode,
  } = useBarcodeScanner({
    onScan: (barcode) => {
      // Auto-fill barcode field
      setValue("barcode", barcode);
      toast.success(`Mã đã được gán: ${barcode}`);
    },
    minLength: 4,
  });

  return (
    <div className="space-y-6">
      {/* Search Bar with Barcode Scanner */}
      <form onSubmit={handleSearchSubmit}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              ref={searchInputRef}
              className={`w-64 ${isSearchScanning ? "ring-2 ring-blue-500" : ""}`}
              placeholder="Quét mã hoặc tìm kiếm..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {isSearchScanning && (
              <Scan className="absolute right-3 top-2.5 w-4 h-4 text-blue-500 animate-pulse" />
            )}
          </div>
          <Button type="submit">
            <Search className="w-4 h-4 mr-1" />
            Tìm kiếm
          </Button>
        </div>
      </form>

      {/* Variant Form with Barcode Field */}
      <form onSubmit={handleSubmit(onSubmitVariant)}>
        <div className="space-y-4">
          {/* Other fields... */}

          {/* Barcode Field with Scanner */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Mã vạch (Barcode)
              <Badge variant="outline" className="ml-2 text-xs">
                <Scan className="w-3 h-3 mr-1" />
                Có thể quét
              </Badge>
            </label>
            <div className="relative">
              <Input
                ref={barcodeInputRef}
                placeholder="Quét mã hoặc nhập thủ công..."
                {...register("barcode")}
                className={isBarcodeScanning ? "ring-2 ring-green-500" : ""}
              />
              {isBarcodeScanning && (
                <Badge
                  variant="secondary"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-500 text-white"
                >
                  Đang quét...
                </Badge>
              )}
            </div>
          </div>

          {/* Submit button */}
        </div>
      </form>
    </div>
  );
}
```

---

### Example 3: Stock Overview - Quick Lookup

**File**: `apps/web/src/pages/inventory/StockOverviewPage/components/filters/SearchBar.jsx`

```javascript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Scan } from "lucide-react";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { searchByBarcode } from "@/services/barcodeService";
import { toast } from "sonner";

export default function SearchBar({ searchValue, onSearchChange, onSearch }) {
  const { inputRef, isScanning } = useBarcodeScanner({
    onScan: async (barcode) => {
      try {
        const results = await searchByBarcode(barcode);

        if (results.length > 0) {
          onSearchChange(barcode);
          onSearch();
          toast.success(`Tìm thấy ${results.length} sản phẩm`);
        } else {
          toast.error(`Không tìm thấy sản phẩm với mã: ${barcode}`);
        }
      } catch (error) {
        toast.error("Lỗi khi quét mã: " + error.message);
      }
    },
  });

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <label className="text-sm font-medium text-foreground mb-2 block">
          Tìm kiếm
          <Badge variant="outline" className="ml-2 text-xs">
            <Scan className="w-3 h-3 mr-1" />
            Hỗ trợ quét mã
          </Badge>
        </label>
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder="Quét mã vạch hoặc nhập tên thuốc..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`w-full ${isScanning ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
          />
          {isScanning && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Scan className="w-4 h-4 text-blue-500 animate-pulse" />
            </div>
          )}
        </div>
      </div>
      <Button onClick={onSearch} className="gap-2">
        <Search className="h-4 w-4" />
        Tìm
      </Button>
    </div>
  );
}
```

---

### Example 4: Purchase Order Receipt - Item Verification

**File**: `apps/web/src/pages/purchaseOrder/PurchaseOrderReceiptCreatePage.jsx`

```javascript
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Scan, AlertCircle } from "lucide-react";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { toast } from "sonner";

export default function PurchaseOrderReceiptCreatePage() {
  const [items, setItems] = useState([]);
  const [verifiedItems, setVerifiedItems] = useState(new Set());

  // Barcode scanner for verification
  const { inputRef, isScanning, scanHistory } = useBarcodeScanner({
    onScan: (barcode) => {
      // Find matching item in PO
      const matchingItem = items.find(
        (item) => item.barcode === barcode || item.sku === barcode
      );

      if (matchingItem) {
        // Mark as verified
        setVerifiedItems((prev) => new Set([...prev, matchingItem.id]));
        toast.success(`✓ Đã xác nhận: ${matchingItem.medicationName}`);

        // Play success sound (optional)
        playBeep();
      } else {
        // Not found - possible mismatch
        toast.error(`⚠️ Không tìm thấy sản phẩm với mã: ${barcode}`);
        playErrorBeep();
      }
    },
    minLength: 4,
  });

  return (
    <div className="space-y-6">
      {/* Barcode Scanner Input for Verification */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Scan className="w-5 h-5 text-blue-600" />
          Quét mã để xác nhận sản phẩm
        </h3>
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder="Quét mã vạch từng sản phẩm nhận được..."
            className={`w-full ${isScanning ? "ring-2 ring-blue-500" : ""}`}
          />
          {isScanning && (
            <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500">
              <Scan className="w-3 h-3 mr-1" />
              Đang quét...
            </Badge>
          )}
        </div>

        {/* Verification Progress */}
        <div className="mt-3 flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>
            Đã xác nhận: <strong>{verifiedItems.size}</strong> / {items.length}{" "}
            sản phẩm
          </span>
        </div>
      </div>

      {/* Items List with Verification Status */}
      <div className="space-y-3">
        {items.map((item, index) => {
          const isVerified = verifiedItems.has(item.id);

          return (
            <div
              key={item.id}
              className={`p-4 border rounded-lg ${
                isVerified ? "bg-green-50 border-green-300" : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{item.medicationName}</h4>
                  <p className="text-sm text-gray-600">
                    SKU: {item.sku} | Mã vạch: {item.barcode}
                  </p>
                </div>

                {isVerified ? (
                  <Badge className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Đã xác nhận
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Chưa quét
                  </Badge>
                )}
              </div>

              {/* Quantity, batch number, etc. */}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Optional: Sound feedback
function playBeep() {
  const audio = new Audio("/sounds/beep-success.mp3");
  audio.volume = 0.3;
  audio.play().catch(() => {});
}

function playErrorBeep() {
  const audio = new Audio("/sounds/beep-error.mp3");
  audio.volume = 0.3;
  audio.play().catch(() => {});
}
```

---

## Testing Guide

### Manual Testing Checklist

#### 1. Scanner Detection Test

- [ ] Connect USB barcode scanner
- [ ] Open any integrated page
- [ ] Focus on input field
- [ ] Scan a test barcode
- [ ] Verify: Barcode appears in input
- [ ] Verify: `isScanning` state changes
- [ ] Verify: `onScan` callback fires

#### 2. Fast Typing Detection

- [ ] Focus on input field
- [ ] Type characters rapidly (<50ms between keys)
- [ ] Verify: `isScanning` becomes `true`
- [ ] Press Enter
- [ ] Verify: `onScan` callback fires

#### 3. Manual Typing (Should NOT Trigger Scan)

- [ ] Focus on input field
- [ ] Type characters slowly (normal typing speed)
- [ ] Verify: `isScanning` stays `false`
- [ ] Press Enter
- [ ] Verify: Normal form submission (not scan)

#### 4. Length Validation

- [ ] Scan barcode shorter than `minLength`
- [ ] Verify: `onError` callback fires
- [ ] Scan barcode longer than `maxLength`
- [ ] Verify: `onError` callback fires

#### 5. Debounce Test

- [ ] Type a few characters
- [ ] Wait 100ms (default debounce)
- [ ] Verify: Buffer clears
- [ ] Verify: `isScanning` becomes `false`

#### 6. Multiple Scans

- [ ] Scan first barcode
- [ ] Wait for processing
- [ ] Scan second barcode immediately
- [ ] Verify: Both scans processed correctly
- [ ] Check `scanHistory` has both entries

---

### Unit Testing

```javascript
// Example test file: useBarcodeScanner.test.js
import { renderHook, act } from "@testing-library/react";
import { useBarcodeScanner } from "../useBarcodeScanner";

describe("useBarcodeScanner", () => {
  test("should call onScan when Enter is pressed", () => {
    const onScan = jest.fn();
    const { result } = renderHook(() => useBarcodeScanner({ onScan }));

    // Simulate fast typing
    act(() => {
      const input = document.createElement("input");
      result.current.inputRef.current = input;

      // Type barcode
      const barcode = "1234567890";
      barcode.split("").forEach((char) => {
        const event = new KeyboardEvent("keydown", { key: char });
        input.dispatchEvent(event);
      });

      // Press Enter
      const enterEvent = new KeyboardEvent("keydown", { key: "Enter" });
      input.dispatchEvent(enterEvent);
    });

    expect(onScan).toHaveBeenCalledWith("1234567890");
  });

  test("should detect scanning state", () => {
    const { result } = renderHook(() => useBarcodeScanner({ minLength: 4 }));

    expect(result.current.isScanning).toBe(false);

    // TODO: Add fast typing simulation
  });

  test("should validate barcode length", () => {
    const onError = jest.fn();
    const { result } = renderHook(() =>
      useBarcodeScanner({ onError, minLength: 8 })
    );

    // Scan short barcode
    act(() => {
      const input = document.createElement("input");
      result.current.inputRef.current = input;

      "123".split("").forEach((char) => {
        const event = new KeyboardEvent("keydown", { key: char });
        input.dispatchEvent(event);
      });

      const enterEvent = new KeyboardEvent("keydown", { key: "Enter" });
      input.dispatchEvent(enterEvent);
    });

    expect(onError).toHaveBeenCalled();
  });
});
```

---

## Troubleshooting

### Issue 1: Scanner Not Detected

**Symptoms**: Barcode scanner doesn't trigger hook

**Solutions**:

1. ✅ Check USB connection
2. ✅ Verify input field is focused
3. ✅ Test scanner in notepad/text editor
4. ✅ Check `enabled` prop is `true`
5. ✅ Verify `inputRef` is attached to input

**Debug**:

```javascript
const { inputRef } = useBarcodeScanner({
  onScan: (barcode) => console.log("Scanned:", barcode),
});

// Check if ref is attached
useEffect(() => {
  console.log("Input ref:", inputRef.current);
}, [inputRef]);
```

---

### Issue 2: Manual Typing Triggers Scanner

**Symptoms**: Normal typing is detected as scanning

**Solutions**:

1. ✅ Increase `debounceMs` (default 100ms)
2. ✅ Adjust fast-typing threshold (currently 50ms)
3. ✅ Add prefix/suffix filtering

**Debug**:

```javascript
useBarcodeScanner({
  onScan: (barcode) => console.log("Scanned:", barcode),
  debounceMs: 200, // Increase debounce
});
```

---

### Issue 3: Scanner Types Extra Characters

**Symptoms**: Barcode has prefix/suffix characters

**Solutions**:

1. ✅ Configure scanner settings (remove prefix/suffix)
2. ✅ Use `scanPrefix`/`scanSuffix` options
3. ✅ Manual trimming in `onScan` callback

**Example**:

```javascript
useBarcodeScanner({
  scanPrefix: "]C1", // Common Code-128 prefix
  onScan: (barcode) => {
    const cleaned = barcode.trim();
    console.log("Cleaned:", cleaned);
  },
});
```

---

### Issue 4: Multiple Scans Not Working

**Symptoms**: Only first scan works

**Solutions**:

1. ✅ Set `clearOnSubmit: true`
2. ✅ Manually clear input after processing
3. ✅ Check for focus issues

**Example**:

```javascript
useBarcodeScanner({
  clearOnSubmit: true,
  onScan: (barcode) => {
    processBarcode(barcode);
    // Re-focus input for next scan
    inputRef.current?.focus();
  },
});
```

---

### Issue 5: Performance Issues

**Symptoms**: Lag or freezing during scan

**Solutions**:

1. ✅ Debounce API calls
2. ✅ Use `useMemo` for expensive computations
3. ✅ Implement loading states
4. ✅ Limit scan history size

**Example**:

```javascript
const handleBarcodeSearch = useMemo(
  () =>
    debounce(async (barcode) => {
      const results = await searchByBarcode(barcode);
      // Process results
    }, 300),
  []
);
```

---

## Best Practices

### 1. Always Provide Visual Feedback

```javascript
<Input ref={inputRef} className={isScanning ? "ring-2 ring-blue-500" : ""} />;

{
  isScanning && <Badge>Scanning...</Badge>;
}
```

### 2. Handle Errors Gracefully

```javascript
useBarcodeScanner({
  onScan: async (barcode) => {
    try {
      const results = await searchByBarcode(barcode);
      // Handle results
    } catch (error) {
      toast.error("Scan failed: " + error.message);
    }
  },
  onError: (error) => {
    toast.error(error);
  },
});
```

### 3. Clear State After Processing

```javascript
useBarcodeScanner({
  clearOnSubmit: true, // Auto-clear buffer
  onScan: (barcode) => {
    processBarcode(barcode);
    clearScanned(); // Clear scanned value
  },
});
```

### 4. Provide Manual Fallback

```javascript
<Input
  ref={inputRef}
  placeholder="Scan barcode or type manually..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
```

### 5. Log Scans for Audit

```javascript
import { logBarcodeScan } from "@/services/barcodeService";

useBarcodeScanner({
  onScan: (barcode) => {
    logBarcodeScan(barcode, {
      screen: "sales_pos",
      userId: currentUser.id,
    });
    processBarcode(barcode);
  },
});
```

### 6. Use Loading States

```javascript
const [isProcessing, setIsProcessing] = useState(false);

useBarcodeScanner({
  onScan: async (barcode) => {
    setIsProcessing(true);
    try {
      await processBarcode(barcode);
    } finally {
      setIsProcessing(false);
    }
  },
});
```

### 7. Test with Different Scanner Types

- Test with multiple scanner brands
- Test wired and wireless scanners
- Test 1D and 2D scanners
- Test different barcode formats (EAN-13, UPC-A, Code-128)

---

## Next Steps

1. ✅ Create `useBarcodeScanner` hook
2. ✅ Create `barcodeService` utilities
3. ✅ Integrate into Sales POS (highest priority)
4. ✅ Integrate into Purchase Order Receipt
5. ✅ Integrate into Medication Variants
6. ✅ Test with physical scanner
7. ✅ Collect user feedback
8. ✅ Iterate and improve

---

## Support & Resources

- **Hook Documentation**: See API Reference above
- **Service Documentation**: `barcodeService.js` JSDoc comments
- **Integration Examples**: See Examples section
- **Scanner Configuration**: Refer to scanner manual
- **Troubleshooting**: See Troubleshooting section

---

## Changelog

### 2025-11-08

- Initial documentation created
- Custom Hook approach (Method 2) selected
- Integration examples provided
- Testing guide added

---

**Questions?** Contact development team or refer to examples above.
