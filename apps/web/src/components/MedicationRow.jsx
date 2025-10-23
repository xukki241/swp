"use client";

import { useMedicationVariants } from "@/hooks/useMedications";
import { FileText, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload PDF, DOC, DOCX, JPG, or PNG files only.",
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Maximum file size is 10MB.",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      
      // Update rowData with contract ID and filename
      onChange(index, {
        ...rowData,
        contractId: result.data.id,
        contractFilename: result.data.filename,
      });

      toast.success("Contract uploaded successfully!", {
        description: file.name,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed", {
        description: error.message || "Could not upload contract file.",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveContract = () => {
    onChange(index, {
      ...rowData,
      contractId: null,
      contractFilename: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Contract removed");
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
            onChange={(e) =>
              handleFieldChange("purchasePrice", e.target.value)
            }
          />
        </div>
      </div>

      {/* Hàng 3: Contract Upload */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted-foreground">
          Contract Document (Optional)
        </label>
        <div className="flex gap-2 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {!rowData.contractId ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full md:w-auto"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Contract
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md flex-1">
              <FileText className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 flex-1 truncate">
                {rowData.contractFilename || "Contract uploaded"}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveContract}
                className="h-6 w-6 p-0 hover:bg-red-100"
              >
                <X className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
        </p>
      </div>

      {/* Hàng 4: Remove Button */}
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
