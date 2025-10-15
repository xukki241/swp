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

  const [meds, setMeds] = useState([
    {
      medicationId: "",
      medicationVariantId: "",
      supplierSku: "",
      leadTimeDays: "",
    },
  ]);

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
    try {
      const variants = meds
        .filter((m) => m.medicationVariantId && m.supplierSku)
        .map((m) => ({
          medication_variant_id: m.medicationVariantId,
          supplier_sku: m.supplierSku,
          lead_time_days: m.leadTimeDays ? Number(m.leadTimeDays) : null,
        }));

      const payload = { ...form, medicationVariants: variants };
      await createSupplier.mutateAsync([payload]);

      toast.success("Supplier created successfully!");
      navigate("/suppliers");
    } catch (error) {
      toast.error("Failed to create supplier!", {
        description:
          JSON.stringify(error?.response?.data?.details) ||
          error?.response?.data?.error ||
          error?.message ||
          "Please check your information and try again.",
      });
      console.error("Error creating supplier:", error.response?.data || error);
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
            <Input
              placeholder="Supplier Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Contact Name"
              value={form.contactName}
              onChange={(e) =>
                setForm({ ...form, contactName: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
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
