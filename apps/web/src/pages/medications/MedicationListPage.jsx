"use client";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
import { toast } from "sonner";
import MedicationViewModal from "./MedicationViewModal";

import {
  clearMedicationImage,
  fileToDataURL,
  getMedicationImageLocal,
  getMedicationImageUrl,
  setMedicationImage,
} from "@/lib/mockImages";

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
function MedImage({
  medicationId,
  alt = "",
  version = 0,
  className = "h-14 w-14 rounded-xl object-cover border",
  placeholderClass = "h-14 w-14",
  onClick, // ⬅️ thêm click-to-zoom
}) {
  const [errored, setErrored] = useState(false);

  const src = useMemo(() => {
    if (!medicationId) return null;
    const local = getMedicationImageLocal(medicationId);
    if (local) return local;
    return `/images/medications/${medicationId}.jpg?v=${version}`;
  }, [medicationId, version]);

  useEffect(() => setErrored(false), [src]);

  if (!src || errored) {
    return <PillPlaceholder className={placeholderClass} />;
  }
  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${onClick ? "cursor-zoom-in" : ""}`}
      onError={() => setErrored(true)}
      onClick={onClick}
    />
  );
}

export default function MedicationListPage() {
  /* filters */
  const [search, setSearch] = useState("");
  const debounced = useDebounced(search);
  const [statusFilter] = useState("all");

  /* modals */
  const [medFormOpen, setMedFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [manageMed, setManageMed] = useState(null);
  const [viewMed, setViewMed] = useState(null);
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

  // ⬇️ Lightbox state
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
          bumpImageVersion(savedId);
        } else if (imagePreview) {
          setMedicationImage(savedId, imagePreview);
          bumpImageVersion(savedId);
        }
      }

      toast.success(editing ? "Medication updated" : "Medication created");
      setMedFormOpen(false);
      setEditing(null);
      setImageFile(null);
      setImagePreview(null);
      setRemoveImage(false);
      await refetch();
    } catch (e) {
      toast.error("Failed to save medication", {
        description: e?.response?.data?.message || e.message,
      });
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this medication?")) {
      await deleteMed.mutateAsync(id);
      clearMedicationImage(id);
      bumpImageVersion(id);
      toast.success("Deleted");
      await refetch();
    }
  };

  /* VARIANTS */
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

  const resetSearch = () => setSearch("");

  return (
    <AppLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Medications</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Search by name or brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
              {search && (
                <Button variant="outline" onClick={resetSearch}>
                  <X className="w-4 h-4 mr-1" /> Reset
                </Button>
              )}
              <Button onClick={() => refetch()}>
                <Search className="w-4 h-4 mr-1" /> Search
              </Button>
              <Button onClick={openAdd}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-3">
                {medications.map((m) => {
                  // Tạo src hiện tại để lightbox mở đúng ảnh đang hiển thị
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
                        <MedImage
                          medicationId={m.id}
                          alt={m.name}
                          version={imageVersion[m.id] || 0}
                          onClick={() => openLightbox(src, m.name)}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{m.name}</div>
                            <StatusBadge status={m.status} />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Brand: {m.brand || "-"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewMed(m)}
                          title="View"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(m)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setManageMed(m)}
                          title="Manage variants"
                        >
                          <Package className="w-4 h-4 mr-1" />
                          Variants
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(m.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {medications.length === 0 && (
                  <div className="rounded-xl border p-10 text-center text-sm text-muted-foreground">
                    No medications found
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* View modal (truyền imageVersion để cache-bust) */}
        <MedicationViewModal
          open={!!viewMed}
          onClose={() => setViewMed(null)}
          medication={viewMed}
          withVariants
          imageVersion={viewMed?.id ? imageVersion[viewMed.id] || 0 : 0}
        />

        {/* Medication Form */}
        <Dialog open={medFormOpen} onOpenChange={setMedFormOpen}>
          <DialogContent className="max-w-2xl" aria-describedby="med-form-desc">
            <p id="med-form-desc" className="sr-only">
              Medication form dialog
            </p>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Medication" : "Add Medication"}
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
                      Choose image…
                    </span>
                  </label>

                  <label className="inline-flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={removeImage}
                      onCheckedChange={(c) => setRemoveImage(!!c)}
                    />
                    <span>Remove image</span>
                  </label>
                </div>
              </div>

              {/* fields */}
              <Controller
                name="name"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <Input {...field} placeholder="Name" />}
              />
              <Controller
                name="brand"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Brand" />}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className="md:col-span-2"
                    placeholder="Description"
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
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  )}
                />
              </div>

              <DialogFooter className="md:col-span-2 flex gap-2 justify-end">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">
                  {editing ? "Save Changes" : "Add Medication"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Manage Variants */}
        <Dialog
          open={!!manageMed}
          onOpenChange={(open) => !open && setManageMed(null)}
        >
          <DialogContent className="max-w-5xl" aria-describedby="variants-desc">
            <p id="variants-desc" className="sr-only">
              Medication variants dialog
            </p>
            <DialogHeader>
              <DialogTitle>Manage Variants • {manageMed?.name}</DialogTitle>
            </DialogHeader>

            {manageMed && (
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Brand:</span>{" "}
                  {manageMed.brand || "-"}
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <span className="capitalize">
                    {manageMed.status || "active"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Prescription required:
                  </span>{" "}
                  {manageMed.isPrescriptionRequired ? "Yes" : "No"}
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Controlled substance:
                  </span>{" "}
                  {manageMed.isControlledSubstance ? "Yes" : "No"}
                </div>
                <div className="md:col-span-2 lg:col-span-4">
                  <span className="text-muted-foreground">Description:</span>{" "}
                  {manageMed.description || "-"}
                </div>
              </div>
            )}

            <div className="overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Factor</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>For Sale</TableHead>
                    <TableHead className="text-right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>{v.sku}</TableCell>
                      <TableCell>{v.name}</TableCell>
                      <TableCell>{v.unit}</TableCell>
                      <TableCell>{v.unitFactor}</TableCell>
                      <TableCell>{v.barcode}</TableCell>
                      <TableCell>{v.sellPrice}</TableCell>
                      <TableCell>
                        {v.isActive ? "Active" : "Inactive"}
                      </TableCell>
                      <TableCell>{v.isForSale ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" onClick={() => onEditVariant(v)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteVariant(v.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {variants.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center text-sm text-muted-foreground"
                      >
                        No variants
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="border-t pt-4 mt-4">
              <form
                onSubmit={handleVarSubmit(saveVariant)}
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3"
              >
                <Controller
                  name="sku"
                  control={controlVar}
                  render={({ field }) => <Input {...field} placeholder="SKU" />}
                />
                <Controller
                  name="name"
                  control={controlVar}
                  render={({ field }) => (
                    <Input {...field} placeholder="Name" />
                  )}
                />
                <Controller
                  name="unit"
                  control={controlVar}
                  render={({ field }) => (
                    <Input {...field} placeholder="Unit" />
                  )}
                />
                <Controller
                  name="unitFactor"
                  control={controlVar}
                  render={({ field }) => (
                    <Input {...field} placeholder="Factor" />
                  )}
                />
                <Controller
                  name="barcode"
                  control={controlVar}
                  render={({ field }) => (
                    <Input {...field} placeholder="Barcode" />
                  )}
                />
                <Controller
                  name="sellPrice"
                  control={controlVar}
                  render={({ field }) => (
                    <Input {...field} placeholder="Sell Price" type="number" />
                  )}
                />

                <div className="flex items-center gap-2">
                  <Controller
                    name="isActive"
                    control={controlVar}
                    render={({ field: { value, onChange } }) => (
                      <>
                        <Checkbox
                          checked={!!value}
                          onCheckedChange={(c) => onChange(!!c)}
                        />
                        <span>Active</span>
                      </>
                    )}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Controller
                    name="isForSale"
                    control={controlVar}
                    render={({ field: { value, onChange } }) => (
                      <>
                        <Checkbox
                          checked={!!value}
                          onCheckedChange={(c) => onChange(!!c)}
                        />
                        <span>For Sale</span>
                      </>
                    )}
                  />
                </div>

                <div className="md:col-span-3 lg:col-span-4 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      resetVar({
                        sku: "",
                        name: "",
                        unit: "",
                        unitFactor: "1.00",
                        barcode: "",
                        sellPrice: "",
                        isActive: true,
                        isForSale: true,
                      })
                    }
                  >
                    Reset
                  </Button>
                  <Button type="submit">
                    {editingVar ? "Save Variant" : "Add Variant"}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 🔎 Lightbox – chỉ hiện ảnh */}
      <Dialog open={lightbox.open} onOpenChange={(o) => !o && closeLightbox()}>
        <DialogContent className="max-w-3xl" aria-describedby="lightbox-desc">
          <p id="lightbox-desc" className="sr-only">
            Medication image preview
          </p>
          <div className="flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.src}
              alt={lightbox.alt || "Medication image"}
              className="max-h-[80vh] w-auto rounded-md object-contain"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
