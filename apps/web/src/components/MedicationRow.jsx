"use client";

import { useMedicationVariants } from "@/hooks/useMedications";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (rowData.medicationId && rowData.medicationId !== selectedMedId) {
      setSelectedMedId(rowData.medicationId);
    }
  }, [rowData.medicationId]);

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

  // Medication and Variant get more space, other fields are smaller
  return (
    <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Medication
          </label>
          <Select
            value={selectedMedId || undefined}
            onValueChange={handleMedicationChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select medication" />
            </SelectTrigger>
            <SelectContent>
              {allMedications.map((med) => (
                <SelectItem key={med.id} value={med.id}>
                  {med.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Variant
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Supplier SKU
          </label>
          <Input
            placeholder="Enter SKU"
            value={rowData.supplierSku || ""}
            onChange={(e) => handleFieldChange("supplierSku", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Lead Time (days)
          </label>
          <Input
            placeholder="Days"
            type="number"
            value={rowData.leadTimeDays || ""}
            onChange={(e) => handleFieldChange("leadTimeDays", e.target.value)}
          />
        </div>

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
