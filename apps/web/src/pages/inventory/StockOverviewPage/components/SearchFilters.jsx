import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SearchFilters({ onSearch, brands, suppliers }) {
  const [filters, setFilters] = useState({
    search: "",
    stockMin: "",
    stockMax: "",
    priceMin: "",
    priceMax: "",
    manufactureDateMin: "",
    manufactureDateMax: "",
    expiryDateMin: "",
    expiryDateMax: "",
    brand: "",
    supplier: "",
    prescription: false,
    active: false,
  });

  // Handle input changes
  function handleChange(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  // Handle checkbox changes
  function handleCheckboxChange(e) {
    const { name, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: checked }));
  }

  // Handle search
  function handleSearch() {
    // Validate ranges
    if (filters.stockMin && filters.stockMax && Number(filters.stockMin) > Number(filters.stockMax)) {
      toast.error("Stock Min cannot be greater than Stock Max.");
      return;
    }
    if (filters.priceMin && filters.priceMax && Number(filters.priceMin) > Number(filters.priceMax)) {
      toast.error("Price Min cannot be greater than Price Max.");
      return;
    }
    if (filters.manufactureDateMin && filters.manufactureDateMax && new Date(filters.manufactureDateMin) > new Date(filters.manufactureDateMax)) {
      toast.error("Manufacture Date Min cannot be later than Manufacture Date Max.");
      return;
    }
    if (filters.expiryDateMin && filters.expiryDateMax && new Date(filters.expiryDateMin) > new Date(filters.expiryDateMax)) {
      toast.error("Expiry Date Min cannot be later than Expiry Date Max.");
      return;
    }

    // Trigger search with filters
    onSearch(filters);
  }

  return (
    <div className="space-y-4">
      <Label>Search</Label>
      <Input
        placeholder="Search medicines by name..."
        name="search"
        id="search"
        value={filters.search}
        onChange={handleChange}
        className="pl-10 w-full"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stock Range */}
        <div>
          <Label>Stock</Label>
          <div className="flex gap-2">
            <Input name="stockMin" placeholder="Min" value={filters.stockMin} onChange={handleChange} />
            <Input name="stockMax" placeholder="Max" value={filters.stockMax} onChange={handleChange} />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label>Price</Label>
          <div className="flex gap-2">
            <Input name="priceMin" placeholder="Min" value={filters.priceMin} onChange={handleChange} />
            <Input name="priceMax" placeholder="Max" value={filters.priceMax} onChange={handleChange} />
          </div>
        </div>

        {/* Manufacture Date */}
        <div>
          <Label>Manufacture Date</Label>
          <div className="flex gap-2">
            <Input type="date" name="manufactureDateMin" value={filters.manufactureDateMin} onChange={handleChange} />
            <Input type="date" name="manufactureDateMax" value={filters.manufactureDateMax} onChange={handleChange} />
          </div>
        </div>

        {/* Expiry Date */}
        <div>
          <Label>Expiry Date</Label>
          <div className="flex gap-2">
            <Input type="date" name="expiryDateMin" value={filters.expiryDateMin} onChange={handleChange} />
            <Input type="date" name="expiryDateMax" value={filters.expiryDateMax} onChange={handleChange} />
          </div>
        </div>

        {/* Brand */}
        <div>
          <Label>Brand</Label>
          <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, brand: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select Brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Supplier */}
        <div>
          <Label>Supplier</Label>
          <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, supplier: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select Supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier} value={supplier}>
                  {supplier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prescription */}
        <div className="flex items-center gap-2">
          <Checkbox name="prescription" checked={filters.prescription} onChange={handleCheckboxChange} />
          <Label>Prescription</Label>
        </div>

        {/* Active */}
        <div className="flex items-center gap-2">
          <Checkbox name="active" checked={filters.active} onChange={handleCheckboxChange} />
          <Label>Active</Label>
        </div>
      </div>

      {/* Search Button */}
      <Button onClick={handleSearch} className="w-full md:w-auto">
        Search
      </Button>
    </div>
  );
}