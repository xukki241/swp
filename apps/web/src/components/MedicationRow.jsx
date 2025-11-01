import { useMedicationVariants } from "@/hooks/useMedications";
import {
  AlertCircle,
  Clock,
  DollarSign,
  Package,
  Pill,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { AutocompleteCombobox } from "./ui/AutocompleteCombobox";
import { Badge } from "./ui/badge";
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

  // Calculate if variant is from contract (not in available variants)
  const hasVariantFromContract =
    rowData.medicationVariantId &&
    !availableVariants.find((v) => v.id === rowData.medicationVariantId);

  // Debug logging
  useEffect(() => {
    console.log(`\n🔍 Medication Row ${index + 1} State:`);
    console.log(`  - Selected Med ID: ${selectedMedId}`);
    console.log(`  - Available variants:`, availableVariants);
    console.log(`  - Loading variants: ${isLoadingVariants}`);
    console.log(`  - Current rowData:`, rowData);
    console.log(`  - medicationVariantId: ${rowData.medicationVariantId}`);
    console.log(`  - variantName: ${rowData.variantName}`);
    console.log(`  - hasVariantFromContract: ${hasVariantFromContract}`);
  }, [
    selectedMedId,
    availableVariants,
    isLoadingVariants,
    rowData,
    index,
    hasVariantFromContract,
  ]);

  const medicationOptions = useMemo(() => {
    const options = allMedications.map((med) => ({
      value: med.id,
      label: med.name,
    }));

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
  }, [allMedications, rowData.medicationId, rowData.medicationName]);

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
    console.log(
      `✅ Variant selected for medication ${index + 1}:`,
      selectedVariant
    );

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
    <div className="group relative flex flex-col gap-4 p-5 border-2 border-border rounded-xl bg-card hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md">
      {/* Header with Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
            {index + 1}
          </div>
          <h3 className="font-semibold text-foreground">
            Medication {index + 1}
          </h3>
          {rowData.contractFilename && (
            <Badge variant="secondary" className="text-xs">
              From Contract
            </Badge>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="opacity-60 hover:opacity-100 hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Fields Grid */}
      <div className="space-y-4">
        {/* Medication & Variant */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Medication Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Pill className="h-4 w-4 text-primary" />
              Medication <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <AutocompleteCombobox
                options={medicationOptions}
                value={selectedMedId}
                onValueChange={handleMedicationChange}
                placeholder="Search medication..."
                searchPlaceholder="Type to search..."
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

          {/* Variant Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Package className="h-4 w-4 text-primary" />
              Variant <span className="text-destructive">*</span>
            </label>
            <Select
              key={`variant-${selectedMedId}-${rowData.medicationVariantId || "empty"}`}
              value={rowData.medicationVariantId || undefined}
              onValueChange={handleVariantChange}
              disabled={!selectedMedId || isLoadingVariants}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue
                  placeholder={
                    !selectedMedId
                      ? "Select medication first"
                      : isLoadingVariants
                        ? "Loading variants..."
                        : "Select variant"
                  }
                >
                  {rowData.medicationVariantId && rowData.variantName ? (
                    <span className="flex items-center gap-2">
                      {rowData.contractFilename && (
                        <Badge variant="secondary" className="text-xs">
                          Contract
                        </Badge>
                      )}
                      {rowData.variantName}
                    </span>
                  ) : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-w-[500px]">
                {isLoadingVariants && (
                  <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Loading variants...
                  </div>
                )}
                {!isLoadingVariants &&
                  availableVariants.length === 0 &&
                  !rowData.medicationVariantId &&
                  selectedMedId && (
                    <div className="p-4 text-center space-y-2">
                      <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        No variants available
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Please create a variant for this medication in
                        Medication Management first
                      </p>
                    </div>
                  )}
                {/* Always show matched variant from contract first */}
                {rowData.medicationVariantId && rowData.variantName && (
                  <SelectItem
                    key={`contract-${rowData.medicationVariantId}`}
                    value={rowData.medicationVariantId}
                    className="whitespace-normal py-3 bg-blue-50 dark:bg-blue-950/20"
                  >
                    <div className="flex items-start gap-2">
                      <Badge
                        variant="secondary"
                        className="text-xs mt-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        ✓ Matched
                      </Badge>
                      <span className="font-medium">{rowData.variantName}</span>
                    </div>
                  </SelectItem>
                )}
                {/* Show other available variants */}
                {availableVariants
                  .filter((v) => v.id !== rowData.medicationVariantId)
                  .map((variant) => (
                    <SelectItem
                      key={variant.id}
                      value={variant.id}
                      className="whitespace-normal py-3"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{variant.name}</div>
                        {variant.sku && (
                          <div className="text-xs text-muted-foreground">
                            SKU: {variant.sku}
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* SKU, Lead Time, Price */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Supplier SKU */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Package className="h-4 w-4 text-primary" />
              Supplier SKU <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g., VP-PAR500"
              value={rowData.supplierSku || ""}
              onChange={(e) => handleFieldChange("supplierSku", e.target.value)}
              className="h-10"
            />
          </div>

          {/* Lead Time */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Lead Time (days)
            </label>
            <Input
              placeholder="e.g., 7"
              type="number"
              min="0"
              value={rowData.leadTimeDays || ""}
              onChange={(e) =>
                handleFieldChange("leadTimeDays", e.target.value)
              }
              className="h-10"
            />
          </div>

          {/* Purchase Price */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <DollarSign className="h-4 w-4 text-primary" />
              Purchase Price (₫) <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g., 50,000"
              type="number"
              step="1000"
              min="0"
              value={rowData.purchasePrice || ""}
              onChange={(e) =>
                handleFieldChange("purchasePrice", e.target.value)
              }
              className="h-10"
            />
          </div>
        </div>

        {/* Contract Info Alert */}
        {rowData.contractFilename && (
          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
              Auto-filled from contract:{" "}
              <strong>{rowData.contractFilename}</strong>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
