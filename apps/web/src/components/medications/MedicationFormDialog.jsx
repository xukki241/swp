import MedicationImage from "@/components/MedicationImage";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon } from "lucide-react";
import { Controller } from "react-hook-form";

function PillPlaceholder({ className = "h-16 w-16" }) {
  return (
    <div
      className={`rounded-xl border bg-muted/30 flex items-center justify-center ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-7 w-7 opacity-60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M4 14a5 5 0 0 0 7.07 7.07l6.86-6.86a5 5 0 0 0-7.07-7.07L4 14Z" />
        <path d="M8.5 8.5l7 7" />
      </svg>
    </div>
  );
}

export function MedicationFormDialog({
  open,
  onOpenChange,
  editing,
  control,
  handleSubmit,
  onSubmit,
  imagePreview,
  onChangeImage,
  removeImage,
  setRemoveImage,
  openLightbox,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Chỉnh sửa Thuốc" : "Thêm Thuốc mới"}
          </DialogTitle>
          <DialogDescription>
            {editing ? "Cập nhật thông tin thuốc" : "Nhập thông tin thuốc mới"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {/* Image preview */}
          <div className="md:col-span-2 flex items-center gap-3 rounded-lg border p-3">
            <div className="shrink-0">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-16 w-16 rounded-lg object-cover border cursor-zoom-in"
                  onClick={() => openLightbox(imagePreview, "Preview")}
                />
              ) : editing?.imageId ? (
                <MedicationImage
                  fileId={editing.imageId}
                  alt={editing.name}
                  size={64}
                  onClick={openLightbox}
                />
              ) : (
                <PillPlaceholder className="h-16 w-16" />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onChangeImage}
                  className="hidden"
                  id="med-image-input"
                />
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm">
                  <ImageIcon className="w-4 h-4" />
                  Chọn ảnh…
                </span>
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <Checkbox
                  checked={removeImage}
                  onCheckedChange={(c) => setRemoveImage(!!c)}
                />
                <span>Xóa ảnh</span>
              </label>
            </div>
          </div>

          {/* Form fields */}
          <Controller
            name="name"
            control={control}
            rules={{ required: true }}
            render={({ field }) => <Input {...field} placeholder="Tên thuốc" />}
          />
          <Controller
            name="brand"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Thương hiệu" />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input {...field} className="md:col-span-2" placeholder="Mô tả" />
            )}
          />

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

          <div>
            <Controller
              name="status"
              control={control}
              render={({ field: { value, onChange } }) => (
                <select
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-9 w-40 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                </select>
              )}
            />
          </div>

          <DialogFooter className="md:col-span-2 flex gap-2 justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <Button type="submit">
              {editing ? "Lưu thay đổi" : "Thêm thuốc"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
