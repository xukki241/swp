import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useCreateSupplier,
  useUpdateSupplier,
  useSupplierMedications,
  useUpdateSupplierMedications,
} from "@/hooks/useSuppliers";
import { useQuery } from "@tanstack/react-query";
import { instance } from "@/lib/axios";

export function SupplierFormDialog({ isOpen, onClose, supplier }) {
  const isEditMode = !!supplier;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm();

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const updateMedicationsMutation = useUpdateSupplierMedications();

  // 🩺 Lấy danh sách tất cả thuốc và biến thể
  const { data: allMedications = [], isLoading: isLoadingMedications } =
    useQuery({
      queryKey: ["supplierMedications", supplier?.id],
      enabled: !!supplier?.id, // chỉ chạy khi có supplier
      queryFn: async () => {
        const res = await instance.get(`/suppliers/${supplier.id}/medications`);
        return res.data; // API trả về mảng thuốc như bạn mô tả
      },
    });

  // 🧾 Lấy danh sách thuốc mà nhà cung cấp hiện đang bán
  const { data: supplierMedications = [] } = useSupplierMedications(
    supplier?.id
  );

  // 🧩 Reset form khi mở dialog hoặc khi có supplierMedications mới
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && supplier) {
        reset({
          ...supplier,
          medications: supplierMedications.map((m) => m.medication_variant_id),
        });
      } else {
        reset({
          name: "",
          contactName: "",
          email: "",
          phone: "",
          address: "",
          status: "active",
          medications: [],
        });
      }
    }
  }, [isOpen, supplier, supplierMedications, isEditMode, reset]);

  // 💾 Xử lý submit
  const onSubmit = async (data) => {
    const action = isEditMode ? "Cập nhật" : "Tạo mới";

    try {
      let supplierResult;

      if (isEditMode) {
        supplierResult = await updateMutation.mutateAsync({
          id: supplier.id,
          ...data,
        });
      } else {
        supplierResult = await createMutation.mutateAsync(data);
      }

      // Cập nhật danh sách thuốc cung cấp
      await updateMedicationsMutation.mutateAsync({
        supplierId: supplierResult.id || supplier.id,
        medications: data.medications.map((id) => ({
          medication_variant_id: Number(id),
        })),
      });

      toast.success(`${action} nhà cung cấp thành công!`);
      onClose();
    } catch (error) {
      toast.error(`${action} thất bại: ${error.message}`);
    }
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    updateMedicationsMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Chỉnh sửa Nhà cung cấp" : "Tạo Nhà cung cấp mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật thông tin chi tiết và thuốc được cung cấp."
              : "Điền thông tin để tạo nhà cung cấp mới."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {/* Các field cơ bản */}
          {[
            { id: "name", label: "Tên", required: true },
            { id: "contactName", label: "Người liên hệ" },
            { id: "email", label: "Email" },
            { id: "phone", label: "Điện thoại" },
            { id: "address", label: "Địa chỉ" },
          ].map(({ id, label, required }) => (
            <div key={id} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={id} className="text-right">
                {label}
              </Label>
              <Input
                id={id}
                {...register(
                  id,
                  required ? { required: `${label} không được để trống` } : {}
                )}
                className="col-span-3"
              />
              {errors[id] && (
                <p className="col-span-4 text-red-500 text-sm text-right">
                  {errors[id].message}
                </p>
              )}
            </div>
          ))}

          {/* Trạng thái */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Trạng thái
            </Label>
            <Controller
              name="status"
              control={control}
              defaultValue="active"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Chọn thuốc */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="medications" className="text-right mt-2">
              Thuốc cung cấp
            </Label>
            <Controller
              name="medications"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <div className="col-span-3 max-h-[250px] overflow-y-auto border rounded-md">
                  {isLoadingMedications ? (
                    <p className="text-gray-500 text-sm text-center p-2">
                      Đang tải danh sách thuốc...
                    </p>
                  ) : (
                    <table className="min-w-full text-sm border-collapse">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-2 py-1 border">Chọn</th>
                          <th className="px-2 py-1 border text-left">
                            Tên thuốc
                          </th>
                          <th className="px-2 py-1 border text-left">
                            Biến thể
                          </th>
                          <th className="px-2 py-1 border text-left">SKU</th>
                          <th className="px-2 py-1 border text-left">
                            Thời gian giao hàng (ngày)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {allMedications.length > 0 ? (
                          allMedications.map((med) => (
                            <tr key={med.id} className="hover:bg-gray-50">
                              <td className="px-2 py-1 border text-center">
                                <input
                                  type="checkbox"
                                  value={med.id}
                                  checked={field.value.includes(med.id)}
                                  onChange={(e) => {
                                    const value = Number(e.target.value);
                                    const newValue = e.target.checked
                                      ? [...field.value, value]
                                      : field.value.filter((v) => v !== value);
                                    field.onChange(newValue);
                                  }}
                                />
                              </td>
                              <td className="px-2 py-1 border">
                                {med.medicationName}
                              </td>
                              <td className="px-2 py-1 border">
                                {med.variantName}
                              </td>
                              <td className="px-2 py-1 border">
                                {med.supplierSku}
                              </td>
                              <td className="px-2 py-1 border text-center">
                                {med.leadTimeDays}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="5"
                              className="text-center py-2 text-gray-500"
                            >
                              Không có thuốc nào để hiển thị.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
