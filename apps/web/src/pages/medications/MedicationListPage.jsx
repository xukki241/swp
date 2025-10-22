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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useCreateVariant,
  useDeleteMedication,
  useDeleteVariant,
  useMedications,
  useMedicationVariants,
  useUpdateMedication,
  useUpdateVariant,
} from "@/hooks/useMedications";
import { findVariantsByBarcode } from "@/services/medicationsService";
import { Edit, Package, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

// debounce
function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function MedicationListPage() {
  const [search, setSearch] = useState("");
  const debounced = useDebounced(search);
  const [statusFilter, setStatusFilter] = useState("all");

  const [medFormOpen, setMedFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [manageMed, setManageMed] = useState(null);
  const medId = manageMed?.id;

  const {
    data: meds,
    isLoading,
    refetch,
  } = useMedications({
    search: debounced || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const medications = Array.isArray(meds) ? meds : meds?.data || [];

  const createMed = useCreateMedication();
  const updateMed = useUpdateMedication();
  const deleteMed = useDeleteMedication();

  // Medication form (status is controlled)
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
    setMedFormOpen(true);
  };

  const onSubmitMed = async (data) => {
    try {
      if (editing) {
        await updateMed.mutateAsync({ id: editing.id, payload: data });
        toast.success("Medication updated");
      } else {
        await createMed.mutateAsync(data);
        toast.success("Medication created");
      }
      setMedFormOpen(false);
      setEditing(null);
      await refetch(); // đảm bảo status/flags hiển thị tức thì
    } catch (e) {
      toast.error("Failed to save medication", {
        description: e?.response?.data?.message || e.message,
      });
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this medication?")) {
      await deleteMed.mutateAsync(id);
      toast.success("Deleted");
      await refetch();
    }
  };

  // ===== Variants =====
  const { data: variants = [] } = useMedicationVariants(medId);
  const createVar = useCreateVariant(medId);
  const updateVar = useUpdateVariant(medId);
  const deleteVar = useDeleteVariant(medId);

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

      if (editingVar) {
        await updateVar.mutateAsync({
          variantId: editingVar.id,
          payload: { ...form },
        });
        toast.success("Variant updated");
      } else {
        await createVar.mutateAsync({ ...form }); // hook auto-adds medicationId
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
    } catch (err) {
      toast.error("Failed to save variant", {
        description: err?.response?.data?.message || err.message,
      });
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!medId) return;
    if (confirm("Delete this variant?")) {
      await deleteVar.mutateAsync(variantId);
      toast.success("Deleted variant");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Medications</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Search by name or brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={openAdd}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    {/* ⬇️ Hai cột hiển thị yêu cầu */}
                    <TableHead>Prescription req.</TableHead>
                    <TableHead>Controlled substance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medications.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.name}</TableCell>
                      <TableCell>{m.brand}</TableCell>
                      <TableCell className="max-w-[320px] truncate">
                        {m.description}
                      </TableCell>
                      <TableCell className="capitalize">
                        {m.status || "active"}
                      </TableCell>
                      {/* ⬇️ Yes/No rõ ràng */}
                      <TableCell>
                        {m.isPrescriptionRequired ? "Yes" : "No"}
                      </TableCell>
                      <TableCell>
                        {m.isControlledSubstance ? "Yes" : "No"}
                      </TableCell>
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(m)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setManageMed(m)}
                        >
                          <Package className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(m.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {medications.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-sm text-muted-foreground"
                      >
                        No data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Medication Form (single close X) */}
        <Dialog open={medFormOpen} onOpenChange={setMedFormOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Medication" : "Add Medication"}
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={handleSubmit(onSubmitMed)}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
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

        {/* Manage Variants (single close X) */}
        <Dialog
          open={!!manageMed}
          onOpenChange={(open) => !open && setManageMed(null)}
        >
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Manage Variants • {manageMed?.name}</DialogTitle>
            </DialogHeader>

            {/* ⬇️ Hiển thị đầy đủ thông tin thuốc trong popup */}
            {manageMed && (
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Brand:</span>{" "}
                  <span>{manageMed.brand || "-"}</span>
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
                  <span>{manageMed.isPrescriptionRequired ? "Yes" : "No"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Controlled substance:
                  </span>{" "}
                  <span>{manageMed.isControlledSubstance ? "Yes" : "No"}</span>
                </div>
                <div className="md:col-span-2 lg:col-span-4">
                  <span className="text-muted-foreground">Description:</span>{" "}
                  <span>{manageMed.description || "-"}</span>
                </div>
              </div>
            )}

            <div className="overflow-auto">
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
    </AppLayout>
  );
}
