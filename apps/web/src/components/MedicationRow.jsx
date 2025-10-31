"use client";

import { useMedicationVariants } from "@/hooks/useMedications";
import { useEffect, useMemo, useState } from "react";
import { AutocompleteCombobox } from "./ui/AutocompleteCombobox";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function MedicationRow({
  index,
  rowData,
  allMedications,
  isLoadingMedications,
  onChange,
  onRemove,
}) {
  const [selectedMedId, setSelectedMedId] = useState(
    rowData.medicationId || ""
  );

  const { data: variantsData, isLoading: isLoadingVariants } =
    useMedicationVariants(selectedMedId || undefined);
  const availableVariants = variantsData?.data || [];

  const medicationOptions = useMemo(() => {
    const options = allMedications.map((med) => ({
      value: med.id,
      label: med.name,
    }));

    // Nếu rowData có medicationId và medicationName nhưng chưa có trong options
    // (có thể do allMedications chưa load xong), thêm vào để hiển thị
    if (
      rowData.medicationId &&
      rowData.medicationName &&
      !options.find((opt) => opt.value === rowData.medicationId)
    ) {
      options.unshift({
        value: rowData.medicationId,
        label: rowData.medicationName,
      });
    }

    return options;
  }, [allMedications, rowData.medicationId, rowData.medicationName, index]);

  useEffect(() => {
    if (rowData.medicationId && rowData.medicationId !== selectedMedId) {
      setSelectedMedId(rowData.medicationId);
    }
  }, [rowData.medicationId, selectedMedId]);

  useEffect(() => {
    if (
      rowData.medicationVariantId &&
      availableVariants.length > 0 &&
      !rowData.variantName
    ) {
      const matchedVariant = availableVariants.find(
        (v) => v.id === rowData.medicationVariantId
      );
      if (matchedVariant) {
        onChange(index, {
          ...rowData,
          variantName: matchedVariant.name,
        });
      }
    }
  }, [
    rowData.medicationVariantId,
    rowData.variantName,
    availableVariants,
    rowData,
    onChange,
    index,
  ]);

  const handleMedicationChange = (medId) => {
    const selectedMed = allMedications.find((m) => m.id === medId);
    setSelectedMedId(medId);

    onChange(index, {
      ...rowData,
      medicationId: medId,
      medicationName: selectedMed?.name || "",
      medicationVariantId: "",
      variantName: "",
    });
  };

  const handleVariantChange = (variantId) => {
    const selectedVariant = availableVariants.find((v) => v.id === variantId);
    onChange(index, {
      ...rowData,
      medicationVariantId: variantId,
      variantName: selectedVariant?.name || "",
    });
  };

  const handleFieldChange = (field, value) => {
    onChange(index, { ...rowData, [field]: value });
  };

  return (
    <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card">
      {/* Hàng 1: Medication và Variant */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Medication Combobox */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Medication *
          </label>
          <div className="relative">
            <AutocompleteCombobox
              options={medicationOptions}
              value={selectedMedId}
              onValueChange={handleMedicationChange}
              placeholder="Select medication"
              searchPlaceholder="Search for a medication..."
              emptyMessage={
                isLoadingMedications
                  ? "Loading medications..."
                  : "No medication found."
              }
              className={isLoadingMedications ? "opacity-70" : ""}
            />
            {isLoadingMedications && allMedications.length === 0 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>

        {/* Variant Select */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Variant *
          </label>
          <Select
            key={selectedMedId || `med-row-${index}`}
            value={rowData.medicationVariantId || undefined}
            onValueChange={handleVariantChange}
            disabled={!selectedMedId || isLoadingVariants}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  isLoadingVariants ? "Loading..." : "Select variant"
                }
              />
            </SelectTrigger>
            <SelectContent className="max-w-[400px]">
              {isLoadingVariants && (
                <div className="p-2 text-sm text-center text-muted-foreground">
                  Loading variants...
                </div>
              )}
              {!isLoadingVariants &&
                availableVariants.length === 0 &&
                selectedMedId && (
                  <div className="p-3 text-sm text-center">
                    <p className="text-muted-foreground font-medium mb-1">
                      No variants found for this medication
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Please create variant for this medication first in
                      Medication Management
                    </p>
                  </div>
                )}
              {/* Nếu có variant hiện tại mà chưa có trong availableVariants, hiển thị nó */}
              {rowData.medicationVariantId &&
                rowData.variantName &&
                !availableVariants.find(
                  (v) => v.id === rowData.medicationVariantId
                ) && (
                  <SelectItem
                    key={rowData.medicationVariantId}
                    value={rowData.medicationVariantId}
                    className="whitespace-normal"
                  >
                    {rowData.variantName}
                  </SelectItem>
                )}
              {availableVariants.map((variant) => (
                <SelectItem
                  key={variant.id}
                  value={variant.id}
                  className="whitespace-normal"
                >
                  {variant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hàng 2: SKU, Lead Time, Purchase Price */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Supplier SKU Input */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Supplier SKU *
          </label>
          <Input
            placeholder="Enter SKU"
            value={rowData.supplierSku || ""}
            onChange={(e) => handleFieldChange("supplierSku", e.target.value)}
          />
        </div>

        {/* Lead Time Input */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Lead Time (days)
          </label>
          <Input
            placeholder="e.g., 7"
            type="number"
            value={rowData.leadTimeDays || ""}
            onChange={(e) => handleFieldChange("leadTimeDays", e.target.value)}
          />
        </div>

        {/* Purchase Price Input */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Purchase Price (VNĐ) *
          </label>
          <Input
            placeholder="e.g., 50000"
            type="number"
            step="0.01"
            min="0"
            value={rowData.purchasePrice || ""}
            onChange={(e) => handleFieldChange("purchasePrice", e.target.value)}
          />
        </div>
      </div>

      {/* Remove Button */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="destructive"
          onClick={() => onRemove(index)}
          className="w-full md:w-auto"
        >
          Remove Medication
        </Button>
      </div>
    </div>
  );
}
