import { useCallback, useEffect, useRef, useState } from "react";

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
 * @param {boolean} options.global - Listen globally (document) instead of specific input (default: false)
 *
 * @returns {Object} Hook state and methods
 * @returns {React.MutableRefObject} inputRef - Ref to attach to input element (only used if global=false)
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
  global = false,
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
    if (!enabled) {
      return;
    }

    const handleKeyDown = (e) => {
      // Skip if modifier keys are pressed (Ctrl, Alt, etc.)
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      // In global mode, skip if user is typing in an input/textarea (except our own input)
      if (global) {
        const target = e.target;
        const isInput =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;

        // Skip if typing in another input (unless it's our ref)
        if (isInput && target !== inputRef.current) {
          return;
        }
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
          // Only prevent default in global mode or when focused on our input
          if (global || e.target === inputRef.current) {
            e.preventDefault();
            e.stopPropagation();
          }

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

    // Choose target: global (document) or specific input
    const target = global ? document : inputRef.current;

    if (target) {
      target.addEventListener("keydown", handleKeyDown);

      // Cleanup
      return () => {
        target.removeEventListener("keydown", handleKeyDown);
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
    global,
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
