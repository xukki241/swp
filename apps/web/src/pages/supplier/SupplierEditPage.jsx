"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { AppLayout } from "@/components/layouts/app-layout";
import { useSupplier, useUpdateSupplier } from "@/hooks/useSuppliers";
import { useMedications, useMedicationsVariants } from "@/hooks/useMedications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MedicationRow } from "@/components/MedicationRow";

export default function SupplierEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: supplierData, isLoading } = useSupplier(id);
  const updateSupplier = useUpdateSupplier();
  const { data: allMedicationsData } = useMedications();
  const { data: allMedVariantsData } = useMedicationsVariants();

  const allMedications = allMedicationsData?.data || [];
  const allMedVariants = allMedVariantsData?.data || [];

  const supplier = supplierData;

  const [form, setForm] = useState({
    name: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
  });

  const [meds, setMeds] = useState([]);

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name || "",
        contactName: supplier.contactName || supplier.contact_name || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        status: supplier.status || "active",
      });
    }
  }, [supplier]);

  useEffect(() => {
    if (
      supplier &&
      Array.isArray(supplier.medicationVariants) &&
      supplier.medicationVariants.length > 0 &&
      allMedications.length > 0 &&
      allMedVariants.length > 0
    ) {
      const mappedMeds = supplier.medicationVariants.map((v, idx) => {
        const variantId =
          v.medicationVariantId ||
          v.medication_variant_id ||
          v.id ||
          v.variantId ||
          "";

        const matchedVariant = allMedVariants.find((mv) => mv.id === variantId);
        const medicationId =
          matchedVariant?.medicationId ||
          matchedVariant?.medication_id ||
          v.medicationId ||
          v.medication_id ||
          "";
        const medication = allMedications.find((m) => m.id === medicationId);

        const result = {
          medicationId,
          medicationVariantId: variantId,
          medicationName: medication?.name || "",
          variantName: matchedVariant?.name || "",
          supplierSku: v.supplierSku || v.supplier_sku || "",
          leadTimeDays:
            v.leadTimeDays?.toString() || v.lead_time_days?.toString() || "",
        };

        return result;
      });

      setMeds(mappedMeds);
    }
  }, [supplier, allMedications, allMedVariants]);

  const handleAddMed = () =>
    setMeds([
      ...meds,
      {
        medicationId: "",
        medicationVariantId: "",
        medicationName: "",
        variantName: "",
        supplierSku: "",
        leadTimeDays: "",
      },
    ]);

  const handleRemoveMed = (index) =>
    setMeds(meds.filter((_, i) => i !== index));

  const handleMedRowChange = (index, updatedRowData) => {
    const updated = [...meds];
    updated[index] = updatedRowData;
    setMeds(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = [];
    if (!form.name.trim()) {
      validationErrors.push("Supplier Name is required.");
    }
    if (!form.email.trim()) {
      validationErrors.push("Email is required.");
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      validationErrors.push("Email format is invalid.");
    }
    if (!form.phone.trim()) {
      validationErrors.push("Phone Number is required.");
    }
    if (!form.address.trim()) {
      validationErrors.push("Address is required.");
    }

    meds.forEach((med, index) => {
      if (med.medicationId || med.supplierSku.trim()) {
        if (!med.medicationVariantId) {
          validationErrors.push(
            `Medication #${index + 1}: Medication Variant must be selected.`
          );
        }
        if (!med.supplierSku.trim()) {
          validationErrors.push(
            `Medication #${index + 1}: Supplier SKU is required.`
          );
        }
      }
    });

    if (validationErrors.length > 0) {
      toast.error("Validation Failed", {
        description: (
          <pre className="text-sm text-left whitespace-pre-wrap">
            {validationErrors.join("\n")}
          </pre>
        ),
      });
      return;
    }

    try {
      const variants = meds
        .filter((m) => m.medicationVariantId && m.supplierSku.trim())
        .map((m) => ({
          medication_variant_id: m.medicationVariantId,
          supplier_sku: m.supplierSku.trim(),
          lead_time_days: m.leadTimeDays
            ? Number.parseInt(m.leadTimeDays, 10)
            : null,
        }));

      const payload = {
        name: form.name.trim(),
        contactName: form.contactName?.trim() || null,
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        status: form.status,
        medicationVariants: variants,
      };

      await updateSupplier.mutateAsync({ id, ...payload });
      toast.success("Supplier updated successfully!");
      navigate(`/suppliers`);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to save supplier", {
        description:
          error?.response?.data?.error ||
          error.message ||
          "An unexpected error occurred.",
      });
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <AppLayout>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplierName">Supplier Name *</Label>
              <Input
                id="supplierName"
                placeholder="e.g., Global Pharma Inc."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                placeholder="e.g., John Doe"
                value={form.contactName}
                onChange={(e) =>
                  setForm({ ...form, contactName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., contact@globalpharma.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="e.g., +1 234 567 890"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="e.g., 123 Health St, Medicine City"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="blacklisted">Blacklisted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Medications List</h3>
              {meds.map((m, i) => (
                <MedicationRow
                  key={`${m.medicationVariantId}-${i}`}
                  index={i}
                  rowData={m}
                  allMedications={allMedications}
                  onChange={handleMedRowChange}
                  onRemove={handleRemoveMed}
                />
              ))}
              <Button type="button" variant="outline" onClick={handleAddMed}>
                + Add medication
              </Button>
            </div>

            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
