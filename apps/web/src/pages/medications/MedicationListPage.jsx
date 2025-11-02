"use client";
import { useUploadFile } from "@/hooks/useFiles";
import { instance } from "@/lib/axios";
import { AppLayout } from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import MedicationImage from "../../components/MedicationImage";
import {
  useCreateMedication,
  useDeleteMedication,
  useMedications,
  useMedicationVariants,
  useUpdateMedication,
} from "@/hooks/useMedications";

import {
  findVariantsByBarcode,
  createVariant as svcCreateVariant,
  deleteVariant as svcDeleteVariant,
  updateVariant as svcUpdateVariant,
} from "@/services/medicationsService";

import {
  Edit,
  Eye,
  Image as ImageIcon,
  Package,
  PlusCircle,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";

// 🔄 CHỈ ĐỔI DÒNG IMPORT NÀY: dùng từ fileUrls thay vì mockImages
import {
  clearMedicationImage,
  fileToDataURL,
  getMedicationImageLocal,
  getMedicationImageUrl,
  setMedicationImage,
} from "@/lib/fileUrls";

/* helpers */
function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
function PillPlaceholder({ className = "h-14 w-14" }) {
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
function StatusBadge({ status }) {
  const s = (status || "active").toLowerCase();
  const style =
    s === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-zinc-50 text-zinc-600 border-zinc-200";
  return (
    <span
      className={`px-2 py-0.5 text-xs rounded-full border ${style} capitalize`}
    >
      {s}
    </span>
  );
}

/** Inline MedImage (không tạo file mới) */
function MedImage({ medicationId, imageId, alt = "", version = 0, onClick }) {
  const [errored, setErrored] = useState(false);

  const src = useMemo(() => {
    if (imageId)
      return getMedicationImageUrl(medicationId, imageId);
    const local = getMedicationImageLocal(medicationId);
    return local || getMedicationImageUrl(medicationId);
}, [medicationId, imageId, version]);

  useEffect(() => setErrored(false), [src]);

  if (!src || errored) return <PillPlaceholder />;
  return (
    <img
      src={src}
      alt={alt}
      className="h-20 w-20 rounded-xl object-cover border cursor-zoom-in"
      onError={() => setErrored(true)}
      onClick={() => onClick?.(src, alt)}
    />
  );
}

export default function MedicationListPage() {
  const navigate = useNavigate();
  const uploadFile = useUploadFile();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = user.role?.toUpperCase() === "OWNER";
  /* filters — giống UserListPage: searchInput / appliedSearch + statusFilter */
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const debounced = useDebounced(appliedSearch);

  /* modals */
  const [medFormOpen, setMedFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [manageMed, setManageMed] = useState(null);
  const medId = manageMed?.id;

  /* data */
  const filters = useMemo(
    () => ({
      search: debounced || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
    }),
    [debounced, statusFilter]
  );
  const { data: meds, isLoading, refetch } = useMedications(filters);
  const medications = Array.isArray(meds) ? meds : meds?.data || [];

  const createMed = useCreateMedication();
  const updateMed = useUpdateMedication();
  const deleteMed = useDeleteMedication();

  /* image refresh version map { [medId]: number } */
  const [imageVersion, setImageVersion] = useState({});
  const bumpImageVersion = (id) =>
    setImageVersion((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

  /* medication form */
  const { handleSubmit, reset, control } = useForm({
    defaultValues: {
      name: "",
      brand: "",
      description: "",
      isPrescriptionRequired: false,
      isControlledSubstance: false,
      status: "active",
    },
  });

  // state cho ảnh (mock)
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  // Lightbox state
  const [lightbox, setLightbox] = useState({ open: false, src: "", alt: "" });
  const openLightbox = (src, alt) => setLightbox({ open: true, src, alt });
  const closeLightbox = () => setLightbox({ open: false, src: "", alt: "" });

  const openAdd = () => {
    setEditing(null);
    reset({
      name: "",
      brand: "",
      description: "",
      isPrescriptionRequired: false,
      isControlledSubstance: false,
      status: "active",
    });
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    setMedFormOpen(true);
  };

  const handleEdit = (med) => {
    setEditing(med);
    reset({
      name: med.name ?? "",
      brand: med.brand ?? "",
description: med.description ?? "",
      isPrescriptionRequired: !!med.isPrescriptionRequired,
      isControlledSubstance: !!med.isControlledSubstance,
      status: med.status ?? "active",
    });
    const local = getMedicationImageLocal(med.id);
    setImagePreview(local || null);
    setImageFile(null);
    setRemoveImage(false);
    setMedFormOpen(true);
  };

  async function onChangeImage(e) {
    const f = e.target.files?.[0];
    setImageFile(f || null);
    const dataURL = await fileToDataURL(f);
    setImagePreview(dataURL);
    setRemoveImage(false);
  }

  const onSubmitMed = async (data) => {
  try {
    let savedId = editing?.id;

    if (editing) {
      await updateMed.mutateAsync({ id: editing.id, payload: data });
    } else {
      const created = await createMed.mutateAsync(data);
      savedId = Array.isArray(created) ? created[0]?.id : created?.id;
    }

    if (savedId) {
      if (removeImage) {
        clearMedicationImage(savedId);
        await instance.delete(`/medications/${savedId}/image`);
      } else if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        await instance.post(`/medications/${savedId}/upload-image`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else if (imagePreview) {
        setMedicationImage(savedId, imagePreview);
      }
      bumpImageVersion(savedId);
    }

    toast.success(editing ? "Medication updated" : "Medication created");
    setMedFormOpen(false);
    
    // Đợi một chút để backend xử lý xong
    await new Promise(resolve => setTimeout(resolve, 500));
    await refetch();
  } catch (e) {
    toast.error("Failed to save medication", {
      description: e?.response?.data?.message || e.message,
    });
  }
};


  const handleDelete = async (id) => {
    if (confirm("Xóa thuốc này?")) {
      await deleteMed.mutateAsync(id);
      clearMedicationImage(id);
      bumpImageVersion(id);
      toast.success("Đã xóa");
      await refetch();
    }
  };

  /* VARIANTS (giữ nguyên) */
  const { data: variants = [], refetch: refetchVariants } =
    useMedicationVariants(medId);
  const {
    handleSubmit: handleVarSubmit,
    control: controlVar,
    reset: resetVar,
    setError: setVarError,
  } = useForm({
    defaultValues: {
      sku: "",
      name: "",
      unit: "",
      unitFactor: "1.00",
      barcode: "",
      sellPrice: "",
      isActive: true,
      isForSale: true,
    },
  });
  const [editingVar, setEditingVar] = useState(null);
  const onEditVariant = (v) => {
    setEditingVar(v);
    resetVar({
      sku: v.sku ?? "",
      name: v.name ?? "",
      unit: v.unit ?? "",
      unitFactor: String(v.unitFactor ?? "1.00"),
      barcode: v.barcode ?? "",
      sellPrice: String(v.sellPrice ?? ""),
      isActive: !!v.isActive,
      isForSale: !!v.isForSale,
    });
  };
  const validateBarcodeUnique = async (barcode, currentId) => {
if (!barcode) return true;
    const list = await findVariantsByBarcode(barcode);
    const exact = list.filter((v) => String(v.barcode) === String(barcode));
    return exact.every((v) => String(v.id) === String(currentId || ""));
  };
  const saveVariant = async (form) => {
    try {
      if (!medId) return;

      const ok = await validateBarcodeUnique(form.barcode, editingVar?.id);
      if (!ok) {
        setVarError("barcode", {
          type: "validate",
          message: "Barcode already exists for another variant.",
        });
        toast.error("Barcode already exists for another variant.");
        return;
      }
      const payload = {
        sku: (form.sku || "").trim(),
        name: (form.name || "").trim(),
        unit: (form.unit || "").trim(),
        unitFactor:
          form.unitFactor === "" || form.unitFactor == null
            ? 1
            : Number(form.unitFactor),
        barcode: (form.barcode || "").trim() || null,
        sellPrice:
          form.sellPrice === "" || form.sellPrice == null
            ? undefined
            : Number(form.sellPrice),
        isActive: !!form.isActive,
        isForSale: !!form.isForSale,
      };
      if (!editingVar) {
        if (
          !payload.sku ||
          !payload.name ||
          !payload.unit ||
          !payload.sellPrice
        ) {
          toast.error("Please fill in SKU, Name, Unit and Sell Price.");
          return;
        }
        if (Number.isNaN(payload.sellPrice)) {
          toast.error("Sell Price must be a number.");
          return;
        }
      }
      if (editingVar) {
        await svcUpdateVariant(medId, editingVar.id, payload);
        toast.success("Variant updated");
      } else {
        await svcCreateVariant(medId, [payload]);
        toast.success("Variant created");
      }
      setEditingVar(null);
      resetVar({
        sku: "",
        name: "",
        unit: "",
        unitFactor: "1.00",
        barcode: "",
        sellPrice: "",
        isActive: true,
        isForSale: true,
      });
      await refetchVariants();
    } catch (err) {
      toast.error("Failed to save variant", {
        description: err?.response?.data?.message || err.message,
      });
    }
  };
  const handleDeleteVariant = async (variantId) => {
    if (!medId) return;
    if (confirm("Delete this variant?")) {
      await svcDeleteVariant(medId, variantId);
      toast.success("Deleted variant");
      await refetchVariants();
    }
  };

  // Handlers filter inline (giống UserListPage)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedSearch(searchInput.trim());
  };
  const handleClearFilters = () => {
    setSearchInput("");
    setAppliedSearch("");
    setStatusFilter("all");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Thuốc</h1>
        </div>

        <Card>
          <CardHeader>
<CardTitle>Danh mục Thuốc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* FILTER BAR */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-col sm:flex-row gap-2 sm:items-center"
              >
                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    title="Filter by status"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                  </select>

                  <Input
                    className="w-64"
                    placeholder="Tìm theo tên hoặc thương hiệu…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    <Search className="w-4 h-4 mr-1" />
                    Tìm kiếm
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearFilters}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Xóa bộ lọc
                  </Button>
                </div>
              </form>

              <div className="flex gap-2">
                <Button onClick={openAdd}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Thêm mới
                </Button>
              </div>
            </div>

            {isLoading ? (
              <p>Đang tải...</p>
            ) : (
              <div className="space-y-3">
                {medications.map((m) => {
                  const local = getMedicationImageLocal(m.id);
                  const src =
                    local ||
                    `/images/medications/${m.id}.jpg?v=${imageVersion[m.id] || 0}`;
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <MedicationImage
                          fileId={m.imageId}
                          alt={m.name}
                          size={56}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{m.name}</div>
<StatusBadge status={m.status} />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Thương hiệu: {m.brand || "-"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(`/medications/${m.id}`, {
                              state: { medication: m },
                            })
                          }
                          title="View"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Xem
                        </Button>

                        {isOwner && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(m)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Sửa
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(`/medications/${m.id}/variants`, {
                                  state: { medication: m },
                                })
                              }
                              title="Quản lý biến thể"
                            >
                              <Package className="w-4 h-4 mr-1" />
                              Biến thể
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(m.id)}
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Xóa
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {medications.length === 0 && (
                  <div className="rounded-xl border p-10 text-center text-sm text-muted-foreground">
                    Không tìm thấy thuốc nào
                  </div>
                )}
              </div>

            )}
          </CardContent>
        </Card>

        {/* Medication Form (popup) */}
        <Dialog open={medFormOpen} onOpenChange={setMedFormOpen}>
          <DialogContent className="max-w-2xl" aria-describedby="med-form-desc">
<p id="med-form-desc" className="sr-only">
              Medication form dialog
            </p>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Chỉnh sửa Thuốc" : "Thêm Thuốc mới"}
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={handleSubmit(onSubmitMed)}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {/* Ảnh preview + input file */}
              <div className="md:col-span-2 flex items-center gap-3 rounded-lg border p-3">
                <div className="shrink-0">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-16 w-16 rounded-lg object-cover border cursor-zoom-in"
                      onClick={() => openLightbox(imagePreview, "Preview")}
                    />
                  ) : editing ? (
                    (() => {
                      const url = getMedicationImageUrl(editing.id);
                      const src = url.includes("?v=")
                        ? url
                        : `${url}?v=${imageVersion[editing.id] || 0}`;
                      return (
                        <img
                          key={
                            (editing && editing.id) +
                            ":v" +
                            (imageVersion[editing.id] || 0)
                          }
                          src={src}
                          alt="Current"
                          className="h-16 w-16 rounded-lg object-cover border cursor-zoom-in"
                          onError={(e) =>
                            (e.currentTarget.style.visibility = "hidden")
                          }
                          onClick={() => openLightbox(src, "Current")}
                        />
                      );
                    })()
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

              {/* fields */}
              <Controller
                name="name"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <Input {...field} placeholder="Tên thuốc" />}
              />
              <Controller
                name="brand"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Thương hiệu" />}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className="md:col-span-2"
                    placeholder="Mô tả"
                  />
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
      </div>

      {/* Lightbox – chỉ hiện ảnh */}
      <Dialog open={lightbox.open} onOpenChange={(o) => !o && closeLightbox()}>
        <DialogContent className="max-w-3xl" aria-describedby="lightbox-desc">
          <p id="lightbox-desc" className="sr-only">
            Medication image preview
          </p>
          <div className="flex items-center justify-center">
            <img
              src={lightbox.src}
              alt={lightbox.alt || "Medication image"}
              className="max-h-[80vh] w-auto rounded-md object-contain"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Đóng</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}