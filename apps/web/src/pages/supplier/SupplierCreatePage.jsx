"use client";

import { useState } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "@/components/layouts/app-layout";
import { useCreateSupplier } from "@/hooks/useSuppliers";
import { useMedications } from "@/hooks/useMedications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";

export default function SupplierCreatePage() {
  const navigate = useNavigate();
  const createSupplier = useCreateSupplier();
  const { data: allMedicationsData } = useMedications();
  const allMedications = allMedicationsData?.data || [];

  const [form, setForm] = useState({
    name: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
  });

  const [meds, setMeds] = useState([]);

  const handleAddMed = () =>
    setMeds([
      ...meds,
      {
        medicationId: "",
        medicationVariantId: "",
        supplierSku: "",
        leadTimeDays: "",
      },
    ]);

  const handleRemoveMed = (index) =>
    setMeds(meds.filter((_, i) => i !== index));

  const handleMedRowChange = (index, updatedRowData) => {
    const updatedMeds = [...meds];
    updatedMeds[index] = updatedRowData;
    setMeds(updatedMeds);
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

      await createSupplier.mutateAsync([payload]);
      toast.success("Supplier created successfully!");
      navigate("/suppliers");
    } catch (error) {
      console.error("Full error object from API:", error.response || error);

      let errorMessage = "An unexpected error occurred. Please try again.";

      if (
        error?.response?.data?.issues &&
        Array.isArray(error.response.data.issues)
      ) {
        const formattedIssues = error.response.data.issues
          .map((issue) => {
            const field = issue.path.join(".");
            return `- ${field}: ${issue.message}`;
          })
          .join("\n");

        errorMessage = formattedIssues;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else {
        errorMessage = error.message;
      }

      toast.error("Validation Failed", {
        description: (
          <pre className="text-sm text-left whitespace-pre-wrap">
            {errorMessage}
          </pre>
        ),
      });
    }
  };
  return (
    <AppLayout>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Supplier</CardTitle>
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
                  key={i}
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
              Create
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
