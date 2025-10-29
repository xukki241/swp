"use client";

import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { AppLayout } from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, Edit, PlusCircle, Search, Trash2, X } from "lucide-react";

import { useMedicationVariants } from "@/hooks/useMedications";
import {
  findVariantsByBarcode,
  createVariant as svcCreateVariant,
  deleteVariant as svcDeleteVariant,
  updateVariant as svcUpdateVariant,
} from "@/services/medicationsService";

export default function MedicationVariantsPage() {
  const { id: medId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedMedication = location.state?.medication;

  // Giống UserListPage: searchInput / appliedSearch + statusFilter
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive

  const { data: variantsRaw = [], refetch } = useMedicationVariants(medId);
  const variants = useMemo(() => {
    let v = Array.isArray(variantsRaw) ? variantsRaw : variantsRaw?.data || [];
    if (statusFilter !== "all") {
      const wantActive = statusFilter === "active";
      v = v.filter((x) => !!x.isActive === wantActive);
    }
    if (appliedSearch.trim()) {
      const q = appliedSearch.trim().toLowerCase();
      v = v.filter(
        (x) =>
          String(x.sku || "").toLowerCase().includes(q) ||
          String(x.name || "").toLowerCase().includes(q) ||
          String(x.barcode || "").toLowerCase().includes(q)
      );
    }
    return v;
  }, [variantsRaw, appliedSearch, statusFilter]);

  // Popup form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingVar, setEditingVar] = useState(null);
  const {
    handleSubmit,
    control,
    reset,
    setError,
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

  const openAdd = () => {
    setEditingVar(null);
    reset({
      sku: "",
      name: "",
      unit: "",
      unitFactor: "1.00",
      barcode: "",
      sellPrice: "",
      isActive: true,
      isForSale: true,
    });
    setFormOpen(true);
  };

  const openEdit = (v) => {
    setEditingVar(v);
    reset({
      sku: v.sku ?? "",
      name: v.name ?? "",
      unit: v.unit ?? "",
      unitFactor: String(v.unitFactor ?? "1.00"),
      barcode: v.barcode ?? "",
      sellPrice: String(v.sellPrice ?? ""),
      isActive: !!v.isActive,
      isForSale: !!v.isForSale,
    });
    setFormOpen(true);
  };

  const validateBarcodeUnique = async (barcode, currentId) => {
    if (!barcode) return true;
    const list = await findVariantsByBarcode(barcode);
    const exact = list.filter((v) => String(v.barcode) === String(barcode));
    return exact.every((v) => String(v.id) === String(currentId || ""));
  };

  const onSubmitVariant = async (form) => {
    try {
      if (!medId) return;

      const ok = await validateBarcodeUnique(form.barcode, editingVar?.id);
      if (!ok) {
        setError("barcode", { type: "validate", message: "Barcode already exists for another variant." });
        toast.error("Barcode already exists for another variant.");
        return;
      }

      const payload = {
        sku: (form.sku || "").trim(),
        name: (form.name || "").trim(),
        unit: (form.unit || "").trim(),
        unitFactor: form.unitFactor === "" || form.unitFactor == null ? 1 : Number(form.unitFactor),
        barcode: (form.barcode || "").trim() || null,
        sellPrice: form.sellPrice === "" || form.sellPrice == null ? undefined : Number(form.sellPrice),
        isActive: !!form.isActive,
        isForSale: !!form.isForSale,
      };

      if (!editingVar) {
        if (!payload.sku || !payload.name || !payload.unit || payload.sellPrice == null || Number.isNaN(payload.sellPrice)) {
          toast.error("Please fill in SKU, Name, Unit and valid Sell Price.");
          return;
        }
        await svcCreateVariant(medId, [payload]); // batch API
        toast.success("Variant created");
      } else {
        await svcUpdateVariant(medId, editingVar.id, payload);
        toast.success("Variant updated");
      }

      setFormOpen(false);
      setEditingVar(null);
      await refetch();
    } catch (err) {
      toast.error("Failed to save variant", {
        description: err?.response?.data?.message || err.message,
      });
    }
  };

  const onDeleteVariant = async (variantId) => {
    if (!medId) return;
    if (confirm("Delete this variant?")) {
      await svcDeleteVariant(medId, variantId);
      toast.success("Deleted variant");
      await refetch();
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

  const medTitle = passedMedication?.name ? `${passedMedication.name} • Variants` : `Medication #${medId} • Variants`;

  return (
    <AppLayout>
      <div className="mb-4 flex items-center gap-2">
        <Button variant="outline" onClick={() => navigate(`/medications/${medId}`, { state: { medication: passedMedication } })}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Details
        </Button>
        <Button variant="outline" onClick={() => navigate("/medications")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Medications
        </Button>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>{medTitle}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ==== FILTER BAR (inline, giống UserListPage) ==== */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  title="Filter by status"
                >
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <Input
                  className="w-64"
                  placeholder="Search by SKU / Name / Barcode…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Search className="w-4 h-4 mr-1" />
                  Search
                </Button>
                <Button type="button" variant="outline" onClick={handleClearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </form>

            <div className="flex gap-2">
              <Button onClick={openAdd}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Variant
              </Button>
            </div>
          </div>
          {/* ==== /FILTER BAR ==== */}

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
                    <TableCell>{v.barcode || "-"}</TableCell>
                    <TableCell>{typeof v.sellPrice === "number" ? v.sellPrice.toLocaleString() : v.sellPrice}</TableCell>
                    <TableCell>{v.isActive ? "Active" : "Inactive"}</TableCell>
                    <TableCell>{v.isForSale ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" onClick={() => openEdit(v)} title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onDeleteVariant(v.id)} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {variants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-sm text-muted-foreground">
                      No variants
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Popup Add/Edit Variant */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl" aria-describedby="variant-form-desc">
          <p id="variant-form-desc" className="sr-only">Variant form dialog</p>
          <DialogHeader>
            <DialogTitle>{editingVar ? "Edit Variant" : "Add Variant"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitVariant)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Controller name="sku" control={control} render={({ field }) => <Input {...field} placeholder="SKU" />} />
            <Controller name="name" control={control} render={({ field }) => <Input {...field} placeholder="Name" />} />
            <Controller name="unit" control={control} render={({ field }) => <Input {...field} placeholder="Unit" />} />
            <Controller name="unitFactor" control={control} render={({ field }) => <Input {...field} placeholder="Factor" />} />
            <Controller name="barcode" control={control} render={({ field }) => <Input {...field} placeholder="Barcode" />} />
            <Controller name="sellPrice" control={control} render={({ field }) => <Input {...field} placeholder="Sell Price" type="number" />} />
            <div className="flex items-center gap-2">
              <Controller
                name="isActive"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <>
                    <Checkbox checked={!!value} onCheckedChange={(c) => onChange(!!c)} />
                    <span>Active</span>
                  </>
                )}
              />
            </div>
            <div className="flex items-center gap-2">
              <Controller
                name="isForSale"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <>
                    <Checkbox checked={!!value} onCheckedChange={(c) => onChange(!!c)} />
                    <span>For Sale</span>
                  </>
                )}
              />
            </div>

            <DialogFooter className="md:col-span-2 lg:col-span-3 flex gap-2 justify-end">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">{editingVar ? "Save Changes" : "Add Variant"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
