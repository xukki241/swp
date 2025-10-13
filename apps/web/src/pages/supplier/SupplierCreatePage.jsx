import { useState } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "@/components/layouts/app-layout";
import { useCreateSupplier } from "@/hooks/useSuppliers";
import { useMedications } from "@/hooks/useMedications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SupplierCreatePage() {
  const navigate = useNavigate();
  const createSupplier = useCreateSupplier();
  const { data: allMedicationsData } = useMedications();
  const allMedications = allMedicationsData?.data || [];

  const [form, setForm] = useState({
    name: "",
    contactName: "",
    email: "",
    address: "",
  });
  const [meds, setMeds] = useState([
    {
      medicationId: "",
      medicationName: "",
      variantName: "",
      supplierSku: "",
      leadTimeDays: "",
    },
  ]);

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
      const variants = meds
        .filter((m) => m.medicationId)
        .map((m) => ({
          medicationVariantId: Number(m.medicationId),
          supplierSku: m.supplierSku || null,
          leadTimeDays: m.leadTimeDays ? Number(m.leadTimeDays) : null,
        }));

      const payload = { ...form, medicationVariants: variants };
      console.log("Payload gửi lên:", payload); // Thêm dòng này

      await createSupplier.mutateAsync(payload);
      navigate("/suppliers");
    } catch (error) {
      console.error("Lỗi khi tạo nhà cung cấp:", error);
      alert("Tạo nhà cung cấp thất bại!");
    }
  };

  return (
    <AppLayout>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Thêm Nhà Cung Cấp Mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Tên nhà cung cấp"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Người liên hệ"
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
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              placeholder="Địa chỉ"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <div className="space-y-2">
              <h3 className="font-semibold">Danh sách thuốc</h3>
              {meds.map((m, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 items-center">
                  <Select
                    value={m.medicationId ? m.medicationId.toString() : ""}
                    onValueChange={(val) => handleSelectMedication(i, val)}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={m.medicationName || "Chọn thuốc"}
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
                    placeholder="Biến thể"
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
                    placeholder="Thời gian giao"
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
                    Xóa
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={handleAddMed}>
                + Thêm thuốc
              </Button>
            </div>

            <Button type="submit" className="w-full">
              Tạo mới
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
