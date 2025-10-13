import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { AppLayout } from "@/components/layouts/app-layout";
import { useSupplier, useUpdateSupplier } from "@/hooks/useSuppliers";
import { useMedications } from "@/hooks/useMedications";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner"; // Add toast import

export default function SupplierEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: supplier } = useSupplier(id);
  const { data: allMedicationsData } = useMedications();
  const updateSupplier = useUpdateSupplier();

  const allMedications = allMedicationsData?.data || [];

  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const [meds, setMeds] = useState([]);

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name || "",
        email: supplier.email || "",
        address: supplier.address || "",
      });
      if (supplier.medicationVariants) {
        setMeds(
          supplier.medicationVariants.map((v) => ({
            medicationId: v.medicationVariantId || "",
            medicationName: v.medicationName || "",
            variantName: v.variantName || "",
            supplierSku: v.supplierSku || "",
            leadTimeDays: v.leadTimeDays || "",
          }))
        );
      }
    }
  }, [supplier]);

  const handleAddMed = () =>
    setMeds([
      ...meds,
      {
        medicationId: "",
        medicationName: "",
        variantName: "",
        supplierSku: "",
        leadTimeDays: "",
      },
    ]);

  const handleRemoveMed = (index) =>
    setMeds(meds.filter((_, i) => i !== index));

  const handleChangeMed = (index, field, value) => {
    const updated = [...meds];
    updated[index][field] = value;
    setMeds(updated);
  };

  const handleSelectMedication = (index, medId) => {
    const selectedMed = allMedications.find((m) => m.id === Number(medId));
    const updated = [...meds];
    updated[index].medicationId = Number(medId);
    updated[index].medicationName = selectedMed?.name || "";
    setMeds(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const variants = meds.map((m) => ({
        id: m.id || null,
        medicationVariantId: Number(m.medicationId),
        supplierSku: m.supplierSku || null,
        leadTimeDays: m.leadTimeDays ? Number(m.leadTimeDays) : null,
      }));

      const uniqueVariants = variants.filter(
        (v, i, arr) =>
          arr.findIndex(
            (x) => x.medicationVariantId === v.medicationVariantId
          ) === i
      );

      await updateSupplier.mutateAsync({
        id,
        ...form,
        medicationVariants: uniqueVariants,
      });

      toast.success("Supplier updated successfully!", {
        description: "The supplier information has been saved.",
      });
      navigate(`/suppliers/${id}`);
    } catch (error) {
      toast.error("Failed to update supplier!", {
        description:
          error?.response?.data?.error ||
          error?.message ||
          "Please check your information and try again.",
      });
      console.error("Error updating supplier:", error);
    }
  };
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
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <div className="space-y-2">
              <h3 className="font-semibold">Medications List</h3>
              {meds.map((m, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 items-center">
                  <Select
                    value={m.medicationId ? m.medicationId.toString() : ""}
                    onValueChange={(val) => handleSelectMedication(i, val)}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={m.medicationName || "Select medication"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {allMedications.map((med) => (
                        <SelectItem key={med.id} value={med.id.toString()}>
                          {med.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Variant"
                    value={m.variantName}
                    onChange={(e) =>
                      handleChangeMed(i, "variantName", e.target.value)
                    }
                  />
                  <Input
                    placeholder="SKU"
                    value={m.supplierSku}
                    onChange={(e) =>
                      handleChangeMed(i, "supplierSku", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Lead Time (days)"
                    type="number"
                    value={m.leadTimeDays}
                    onChange={(e) =>
                      handleChangeMed(i, "leadTimeDays", e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleRemoveMed(i)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={handleAddMed}>
                + Add medication
              </Button>
            </div>

            <Button type="submit" className="w-full">
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
