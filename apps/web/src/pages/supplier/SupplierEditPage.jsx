import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { AppLayout } from "@/components/layouts/app-layout";
import { useSupplier, useUpdateSupplier } from "@/hooks/useSuppliers";
import { useMedications, useMedicationsVariants } from "@/hooks/useMedications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  });

  const [meds, setMeds] = useState([]);

  useEffect(() => {
    if (
      supplier &&
      Array.isArray(supplier.medicationVariants) &&
      supplier.medicationVariants.length > 0 &&
      allMedications.length > 0 &&
      allMedVariants.length > 0
    ) {
      setForm({
        name: supplier.name || "",
        contactName: supplier.contactName || supplier.contact_name || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
      });

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
    try {
      if (!form.name || !form.email || !form.phone || !form.address) {
        toast.error("Please fill in all required fields");
        return;
      }

      const variants = meds
        .filter((m) => m.medicationId && m.medicationVariantId)
        .map((m) => ({
          medication_variant_id: m.medicationVariantId,
          supplier_sku: m.supplierSku || null,
          lead_time_days: m.leadTimeDays ? parseInt(m.leadTimeDays, 10) : null,
        }));

      const updateData = {
        name: form.name.trim(),
        contactName: form.contactName?.trim() || null,
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        medicationVariants: variants,
      };

      console.log("Update payload:", updateData);

      await updateSupplier.mutateAsync({
        id,
        ...updateData,
      });

      toast.success("Supplier updated successfully!");
      navigate(`/suppliers/${id}`);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update supplier", {
        description:
          error?.response?.data?.error ||
          "Validation failed. Please check your input.",
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
