import { useEffect } from "react";
// ✅ SỬA ĐỔI TẠI ĐÂY: Thêm 'Controller' vào import
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

import { useCreateSupplier, useUpdateSupplier } from "@/hooks/useSuppliers";

export function SupplierFormDialog({ isOpen, onClose, supplier }) {
  const isEditMode = !!supplier;
  // ✅ SỬA ĐỔI TẠI ĐÂY: Thêm 'control' để sử dụng với Controller
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm();

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();

  // Reset form khi supplier prop thay đổi (khi mở dialog để sửa) hoặc khi đóng
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        reset(supplier);
      } else {
        reset({
          name: "",
          contactName: "",
          email: "",
          phone: "",
          address: "",
          status: "active",
        });
      }
    }
  }, [isOpen, supplier, isEditMode, reset]);

  const onSubmit = (data) => {
    const mutation = isEditMode ? updateMutation : createMutation;
    const action = isEditMode ? "Cập nhật" : "Tạo mới";

    // Đối với update, cần truyền cả id
    const payload = isEditMode ? { id: supplier.id, ...data } : data;

    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(`${action} nhà cung cấp thành công!`);
        onClose();
      },
      onError: (error) => {
        toast.error(`${action} thất bại: ${error.message}`);
      },
    });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Chỉnh sửa Nhà cung cấp" : "Tạo Nhà cung cấp mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật thông tin chi tiết."
              : "Điền thông tin để tạo nhà cung cấp mới."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Tên
            </Label>
            <Input
              id="name"
              {...register("name", { required: "Tên không được để trống" })}
              className="col-span-3"
            />
            {errors.name && (
              <p className="col-span-4 text-red-500 text-sm text-right">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contactName" className="text-right">
              Người liên hệ
            </Label>
            <Input
              id="contactName"
              {...register("contactName")}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                pattern: { value: /^\S+@\S+$/i, message: "Email không hợp lệ" },
              })}
              className="col-span-3"
            />
            {errors.email && (
              <p className="col-span-4 text-red-500 text-sm text-right">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Điện thoại
            </Label>
            <Input id="phone" {...register("phone")} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Địa chỉ
            </Label>
            <Input
              id="address"
              {...register("address")}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Trạng thái
            </Label>
            {/* Component Controller được sử dụng ở đây */}
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
