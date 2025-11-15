import { AppLayout } from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateMedication,
  useMedicationDetail,
  useUpdateMedication,
} from "@/hooks/useMedications";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";

export default function MedicationFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: medDetail, isLoading } = useMedicationDetail(id);
  const addMutation = useCreateMedication();
  const updateMutation = useUpdateMedication();

  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      name: "",
      brand: "",
      description: "",
      isPrescriptionRequired: false,
      isControlledSubstance: false,
      status: "active",
    },
  });

  useEffect(() => {
    if (medDetail) {
      reset({
        name: medDetail.name ?? "",
        brand: medDetail.brand ?? "",
        description: medDetail.description ?? "",
        isPrescriptionRequired: !!medDetail.isPrescriptionRequired,
        isControlledSubstance: !!medDetail.isControlledSubstance,
        status: medDetail.status ?? "active",
      });
    }
  }, [medDetail, reset]);

  const onSubmit = async (formData) => {
    if (isEdit) await updateMutation.mutateAsync({ id, payload: formData });
    else await addMutation.mutateAsync(formData);
    navigate("/medications");
  };

  if (isLoading && isEdit)
    return (
      <AppLayout>
        <div className="p-6">Đang tải...</div>
      </AppLayout>
    );

  return (
    <AppLayout title={isEdit ? "Sửa thuốc" : "Thêm thuốc"}>
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register("name", { required: true })}
            placeholder="Tên thuốc"
          />
          <Input {...register("brand")} placeholder="Thương hiệu" />
          <Input {...register("description")} placeholder="Mô tả" />

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Controller
                name="isPrescriptionRequired"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <>
                    <Checkbox
                      checked={!!value}
                      onCheckedChange={(c) => onChange(!!c)}
                    />
                    <span>Cần đơn thuốc</span>
                  </>
                )}
              />
            </div>
            <div className="flex items-center gap-2">
              <Controller
                name="isControlledSubstance"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <>
                    <Checkbox
                      checked={!!value}
                      onCheckedChange={(c) => onChange(!!c)}
                    />
                    <span>Chất kiểm soát</span>
                  </>
                )}
              />
            </div>

            {/* controlled Select shows current status, not a hard default */}
            <Controller
              name="status"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Select value={value} onValueChange={onChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/medications")}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={addMutation.isPending || updateMutation.isPending}
            >
              {isEdit ? "Lưu thay đổi" : "Thêm thuốc"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
