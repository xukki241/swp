import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Plus } from "lucide-react";

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
                <p className="font-semibold text-gray-900">
                  {medication.medicationName || medication.name}
                </p>
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
              </div>
              <Button
                onClick={() => onSelectMedication(medication)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
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
