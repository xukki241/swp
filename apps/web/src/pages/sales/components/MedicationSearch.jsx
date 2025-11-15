import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { searchByBarcode } from "@/services/barcodeService";
import { Loader2, MapPin, Plus, Scan, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function MedicationSearch({
  onSearch,
  isSearching,
  results,
  onSelectMedication,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // Add barcode scanner hook with global mode
  const { inputRef, isScanning, scannedValue, scanHistory } = useBarcodeScanner(
    {
      onScan: async (barcode) => {
        console.info("Barcode scanned:", barcode);

        try {
          // Search by barcode
          const barcodeResults = await searchByBarcode(barcode);

          if (barcodeResults.length === 0) {
            toast.error(`Không tìm thấy sản phẩm với mã: ${barcode}`);
          } else if (barcodeResults.length === 1) {
            // Single result - auto add to cart
            onSelectMedication(barcodeResults[0]);
            // Clear search term after auto-adding
            setSearchTerm("");
          } else {
            // Multiple results - show in search
            setSearchTerm(barcode);
            onSearch(barcode);
            toast.info(`Tìm thấy ${barcodeResults.length} sản phẩm`);
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
      global: true, // Enable global scanning - no focus required!
    }
  );

  const handleSearch = (term) => {
    setSearchTerm(term);
    onSearch(term);
  };

  return (
    <div className="space-y-4">
      {/* Global scanning indicator - always visible at top */}

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        {/* Attach barcode scanner ref */}
        <Input
          ref={inputRef}
          placeholder="Quét mã bất kỳ lúc nào hoặc nhập tên thuốc..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />

        {/* Last scanned value indicator */}
        {scannedValue && !isScanning && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-600 font-medium flex items-center gap-1">
            <Scan className="w-3 h-3" />✓ Đã quét
          </div>
        )}
      </div>

      {/* Optional: Scan history dropdown */}
      {scanHistory.length > 0 && (
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700">
            Lịch sử quét ({scanHistory.length})
          </summary>
          <ul className="mt-2 space-y-1 pl-4">
            {scanHistory.slice(0, 5).map((scan) => (
              <li key={scan.id} className="flex justify-between">
                <span className="font-mono">{scan.barcode}</span>
                <span className="text-gray-400">
                  {new Date(scan.timestamp).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {isSearching && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Đang tìm kiếm...</span>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((medication) => (
            <div
              key={medication.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">
                    {medication.medicationName || medication.name}
                  </p>
                  {(medication.isPrescriptionRequired ||
                    medication.is_prescription_required) && (
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
                      Thuốc kê đơn
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {medication.variantName}
                </p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-gray-600">
                    Giá:{" "}
                    {Number(medication.sellPrice || 0).toLocaleString("vi-VN")}{" "}
                    VNĐ
                  </span>
                  <span className="text-gray-600">
                    Tồn kho: {medication.availableQuantity}
                  </span>
                </div>

                {/* Thông tin vị trí FEFO */}
                {medication.locations && medication.locations.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-start gap-1 text-xs">
                      <MapPin className="w-3 h-3 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-semibold text-purple-700">
                          Lấy từ (FEFO):
                        </span>
                        <div className="space-y-0.5 mt-1">
                          {medication.locations.slice(0, 3).map((loc, idx) => (
                            <div
                              key={idx}
                              className="text-gray-700 bg-purple-50 px-2 py-1 rounded border border-purple-200"
                            >
                              <span className="font-medium">
                                {loc.location?.fullLocation || "Không xác định"}
                              </span>
                              <span className="text-gray-600 ml-2">
                                • SL: {loc.quantity}
                              </span>
                              {loc.expiryDate && (
                                <span className="text-orange-600 ml-2">
                                  • HSD:{" "}
                                  {new Date(loc.expiryDate).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </span>
                              )}
                            </div>
                          ))}
                          {medication.locations.length > 3 && (
                            <p className="text-gray-500 italic pl-2">
                              +{medication.locations.length - 3} vị trí khác
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={() => onSelectMedication(medication)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white ml-3"
              >
                <Plus className="w-4 h-4 mr-1" />
                Thêm
              </Button>
            </div>
          ))}
        </div>
      )}

      {searchTerm && results.length === 0 && !isSearching && (
        <p className="text-sm text-gray-500 text-center py-8">
          Không tìm thấy thuốc hoặc đã hết hàng
        </p>
      )}

      {!searchTerm && (
        <p className="text-sm text-gray-500 text-center py-8">
          Nhập tên thuốc để bắt đầu tìm kiếm
        </p>
      )}
    </div>
  );
}
