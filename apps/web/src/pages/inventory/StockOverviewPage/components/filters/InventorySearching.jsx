import { useState } from "react";
import { toast } from "sonner";
import ActiveFilters from "./ActiveFilters";
import FilterGroup from "./FilterGroup";
import SearchBar from "./SearchBar";

export default function InventorySearching({ onSearch, suppliers }) {
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    stock: { min: "", max: "" },
    price: { min: "", max: "" },
    manufactureDate: { from: "", to: "" },
    expiryDate: { from: "", to: "" },
    supplier: [],
    prescription: false,
  });

  const handleFilterChange = (filterKey, value) => {
    setFilters((prev) => ({ ...prev, [filterKey]: value }));
  };

  const handleSearch = () => {
    // Validate ranges
    if (
      filters.stock.min &&
      filters.stock.max &&
      Number(filters.stock.min) > Number(filters.stock.max)
    ) {
      toast.error("Giá trị Tồn kho tối thiểu không được lớn hơn Tối đa.");
      return;
    }
    if (
      filters.price.min &&
      filters.price.max &&
      Number(filters.price.min) > Number(filters.price.max)
    ) {
      toast.error("Giá tối thiểu không được lớn hơn Giá tối đa.");
      return;
    }
    if (
      filters.manufactureDate.from &&
      filters.manufactureDate.to &&
      new Date(filters.manufactureDateMin) >
        new Date(filters.manufactureDateMax)
    ) {
      toast.error("Ngày sản xuất bắt đầu không được sau ngày kết thúc.");
      return;
    }
    if (
      filters.expiryDate.from &&
      filters.expiryDate.to &&
      new Date(filters.expiryDate.from) > new Date(filters.expiryDate.to)
    ) {
      toast.error("Ngày hết hạn bắt đầu không được sau ngày kết thúc.");
      return;
    }

    // Prepare search payload
    const searchPayload = {
      search: searchValue,
      stockMin: filters.stock.min,
      stockMax: filters.stock.max,
      priceMin: filters.price.min,
      priceMax: filters.price.max,
      manufactureDateMin: filters.manufactureDate.from,
      manufactureDateMax: filters.manufactureDate.to,
      expiryDateMin: filters.expiryDate.from,
      expiryDateMax: filters.expiryDate.to,
      supplier: filters.supplier,
      prescription: filters.prescription,
    };

    onSearch(searchPayload);
  };

  const handleRemoveFilter = (filterKey) => {
    if (filterKey === "stock" || filterKey === "price") {
      setFilters((prev) => ({
        ...prev,
        [filterKey]: { min: "", max: "" },
      }));
    } else if (filterKey === "manufactureDate" || filterKey === "expiryDate") {
      setFilters((prev) => ({
        ...prev,
        [filterKey]: { from: "", to: "" },
      }));
    } else if (filterKey === "supplier") {
      setFilters((prev) => ({
        ...prev,
        [filterKey]: [],
      }));
    } else if (filterKey === "prescription") {
      setFilters((prev) => ({
        ...prev,
        [filterKey]: false,
      }));
    }
  };

  return (
    <div className="space-y-4">
      <SearchBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearch={handleSearch}
      />

      <FilterGroup
        filters={filters}
        onFilterChange={handleFilterChange}
        suppliers={suppliers}
      />

      <ActiveFilters filters={filters} onRemoveFilter={handleRemoveFilter} />
    </div>
  );
}
