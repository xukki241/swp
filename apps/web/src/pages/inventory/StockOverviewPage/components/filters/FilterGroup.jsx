import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import FilterDropdown from "./FilterDropdown";

export default function FilterGroup({ filters, onFilterChange, suppliers }) {
  const handleRangeFilter = (filterKey, value) => {
    onFilterChange(filterKey, value);
  };

  const handleMultiSelectFilter = (filterKey, value) => {
    onFilterChange(filterKey, value);
  };

  const handleToggleFilter = (filterKey, checked) => {
    onFilterChange(filterKey, checked);
  };

  const handleCancelFilter = (filterKey) => {
    // Reset to empty state
    if (filterKey === "stock" || filterKey === "price") {
      onFilterChange(filterKey, { min: "", max: "" });
    } else if (filterKey === "manufactureDate" || filterKey === "expiryDate") {
      onFilterChange(filterKey, { from: "", to: "" });
    } else if (filterKey === "supplier") {
      onFilterChange(filterKey, []);
    }
  };

  const isFilterActive = (filterKey) => {
    const value = filters[filterKey];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object" && value !== null) {
      return Object.values(value).some((v) => v);
    }
    return value;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {/* Stock Filter */}
        <FilterDropdown
          label="Stock"
          filterType="range"
          value={filters.stock}
          onSave={(value) => handleRangeFilter("stock", value)}
          onCancel={() => handleCancelFilter("stock")}
          isActive={isFilterActive("stock")}
        />

        {/* Price Filter */}
        <FilterDropdown
          label="Price"
          filterType="range"
          value={filters.price}
          onSave={(value) => handleRangeFilter("price", value)}
          onCancel={() => handleCancelFilter("price")}
          isActive={isFilterActive("price")}
        />

        {/* Manufacture Date Filter */}
        <FilterDropdown
          label="Manufacture Date"
          filterType="dateRange"
          value={filters.manufactureDate}
          onSave={(value) => handleRangeFilter("manufactureDate", value)}
          onCancel={() => handleCancelFilter("manufactureDate")}
          isActive={isFilterActive("manufactureDate")}
        />

        {/* Expiry Date Filter */}
        <FilterDropdown
          label="Expiry Date"
          filterType="dateRange"
          value={filters.expiryDate}
          onSave={(value) => handleRangeFilter("expiryDate", value)}
          onCancel={() => handleCancelFilter("expiryDate")}
          isActive={isFilterActive("expiryDate")}
        />

        {/* Supplier Filter */}
        <FilterDropdown
          label="Supplier"
          filterType="multiSelect"
          value={filters.supplier}
          options={suppliers}
          onSave={(value) => handleMultiSelectFilter("supplier", value)}
          onCancel={() => handleCancelFilter("supplier")}
          isActive={isFilterActive("supplier")}
        />

        {/* Prescription Toggle */}
        <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-background hover:bg-accent/50 transition-colors">
          <Checkbox
            id="prescription"
            checked={filters.prescription}
            onCheckedChange={(checked) =>
              handleToggleFilter("prescription", checked)
            }
          />
          <Label htmlFor="prescription" className="cursor-pointer text-sm">
            Prescription Only
          </Label>
        </div>
      </div>
    </div>
  );
}
