import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { AppLayout } from "@/components/layouts/app-layout";
import {
  useMedicationDetail,
  useCreateMedication,
  useUpdateMedication,
} from "@/hooks/useMedications";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MedicationFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: medDetail, isLoading } = useMedicationDetail(id);
  const addMutation = useCreateMedication();
  const updateMutation = useUpdateMedication();

  const { register, handleSubmit, reset, control, watch } = useForm({
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
        <div className="p-6">Loading...</div>
      </AppLayout>
    );

  return (
    <AppLayout title={isEdit ? "Edit Medication" : "Add Medication"}>
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register("name", { required: true })}
            placeholder="Medication Name"
          />
          <Input {...register("brand")} placeholder="Brand" />
          <Input {...register("description")} placeholder="Description" />

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
                    <span>Prescription required</span>
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
                    <span>Controlled substance</span>
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
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addMutation.isPending || updateMutation.isPending}
            >
              {isEdit ? "Save Changes" : "Add Medication"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
