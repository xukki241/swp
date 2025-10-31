"use client";

import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export default function ActiveFilters({ filters, onRemoveFilter }) {
  function renderSupplierNames(suppliers) {
    return (
      <div>
        Supplier:
        {suppliers.map((supplier, index) => (
          <div key={supplier.id}>
            {supplier.name}
            {index < suppliers.length - 1 ? ", " : ""}
          </div>
        ))}
      </div>
    );
  }

  const formatFilterDisplay = (key, value) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;

    switch (key) {
      case "stock":
        return value.min || value.max
          ? `Stock: ${value.min || "0"} - ${value.max || "∞"} `
          : null;
      case "price":
        return value.min || value.max
          ? `Price: ${value.min || "0"} - ${value.max || "∞"} `
          : null;
      case "manufactureDate":
        return value.from || value.to
          ? `Manufacture: ${value.from || "any"} - ${value.to || "any"} `
          : null;
      case "expiryDate":
        return value.from || value.to
          ? `Expiry: ${value.from || "any"} - ${value.to || "any"} `
          : null;
      case "supplier":
        return Array.isArray(value) && value.length > 0
          ? renderSupplierNames(value)
          : null;
      case "prescription":
        return value ? "Prescription: required" : null;
      default:
        return null;
    }
  };

  const activeFilterEntries = Object.entries(filters).filter(([key, value]) => {
    if (key === "search") return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object" && value !== null) {
      return Object.values(value).some((v) => v);
    }
    return value;
  });

  if (activeFilterEntries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-muted-foreground">
        Search with filters:
      </span>
      {activeFilterEntries.map(([key, value]) => {
        const display = formatFilterDisplay(key, value);
        if (!display) return null;

        return (
          <Badge key={key} variant="secondary" className="gap-1 max-w-full">
            {display}
            <button
              onClick={() => onRemoveFilter(key)}
              className="ml-1 hover:opacity-70"
            >
              <X className="h-3 w-3 cursor-pointer" />
            </button>
          </Badge>
        );
      })}
    </div>
  );
}
