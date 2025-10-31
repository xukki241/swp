import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Plus, Search } from "lucide-react";
import { useState } from "react";

export default function MedicationSearch({
  onSearch,
  isSearching,
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
          placeholder="Search medications by name..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isSearching && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
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
                      Kê đơn
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {medication.variantName}
                </p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-gray-600">
                    Price:{" "}
                    {Number(medication.sellPrice || 0).toLocaleString("vi-VN")}{" "}
                    VNĐ
                  </span>
                  <span className="text-gray-600">
                    Stock: {medication.availableQuantity}
                  </span>
                </div>

                {/* FEFO Location Information */}
                {medication.locations && medication.locations.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-start gap-1 text-xs">
                      <MapPin className="w-3 h-3 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-semibold text-purple-700">
                          Pick from (FEFO):
                        </span>
                        <div className="space-y-0.5 mt-1">
                          {medication.locations.slice(0, 3).map((loc, idx) => (
                            <div
                              key={idx}
                              className="text-gray-700 bg-purple-50 px-2 py-1 rounded border border-purple-200"
                            >
                              <span className="font-medium">
                                {loc.location?.fullLocation || "Location N/A"}
                              </span>
                              <span className="text-gray-600 ml-2">
                                • Qty: {loc.quantity}
                              </span>
                              {loc.expiryDate && (
                                <span className="text-orange-600 ml-2">
                                  • Exp:{" "}
                                  {new Date(loc.expiryDate).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </span>
                              )}
                            </div>
                          ))}
                          {medication.locations.length > 3 && (
                            <p className="text-gray-500 italic pl-2">
                              +{medication.locations.length - 3} more
                              location(s)
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
                Add
              </Button>
            </div>
          ))}
        </div>
      )}

      {searchTerm && results.length === 0 && !isSearching && (
        <p className="text-sm text-gray-500 text-center py-8">
          No medications found or out of stock
        </p>
      )}

      {!searchTerm && (
        <p className="text-sm text-gray-500 text-center py-8">
          Start typing to search medications
        </p>
      )}
    </div>
  );
}
