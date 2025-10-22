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
  onChange,
  onRemove,
}) {
  const [selectedMedId, setSelectedMedId] = useState(
    rowData.medicationId || ""
  );

  const { data: variantsData, isLoading: isLoadingVariants } =
    useMedicationVariants(selectedMedId || undefined);
  const availableVariants = variantsData?.data || [];

  const medicationOptions = useMemo(
    () =>
      allMedications.map((med) => ({
        value: med.id,
        label: med.name,
      })),
    [allMedications]
  );

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
          <AutocompleteCombobox
            options={medicationOptions}
            value={selectedMedId}
            onValueChange={handleMedicationChange}
            placeholder="Select medication"
            searchPlaceholder="Search for a medication..."
            emptyMessage="No medication found."
          />
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
                  <div className="p-2 text-sm text-center text-muted-foreground">
                    No variants found
                  </div>
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

      {/* Hàng 2: SKU, Lead Time và nút Remove */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
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

        {/* Remove Button */}
        <Button
          type="button"
          variant="destructive"
          onClick={() => onRemove(index)}
          className="w-full md:w-auto"
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
