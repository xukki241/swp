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
import { ArrowLeft, Edit, PlusCircle, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import MedicationImage from "../../components/MedicationImage";

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

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      search: appliedSearch || undefined,
      isActive: statusFilter !== "all" ? statusFilter === "active" : undefined,
      page,
      limit: 10,
    }),
    [appliedSearch, statusFilter, page]
  );

  const { data: response = {}, refetch } = useMedicationVariants(
    medId,
    filters
  );
  const variants = response?.data || [];
  const pagination = response?.pagination || { total: 0, totalPages: 1 };

  // Popup form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingVar, setEditingVar] = useState(null);
  const { handleSubmit, control, reset, setError } = useForm({
    defaultValues: {
      sku: "",
      name: "",
      unit: "",
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
        setError("barcode", {
          type: "validate",
          message: "Mã vạch đã tồn tại cho biến thể khác.",
        });
        toast.error("Mã vạch đã tồn tại cho biến thể khác.");
        return;
      }

      const payload = {
        sku: (form.sku || "").trim(),
        name: (form.name || "").trim(),
        unit: (form.unit || "").trim(),
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
          payload.sellPrice == null ||
          Number.isNaN(payload.sellPrice)
        ) {
          toast.error("Vui lòng điền đầy đủ SKU, Tên, Đơn vị và Giá bán hợp lệ.");
          return;
        }
        await svcCreateVariant(medId, [payload]); // batch API
        toast.success("Đã tạo biến thể");
      } else {
        await svcUpdateVariant(medId, editingVar.id, payload);
        toast.success("Đã cập nhật biến thể");
      }

      setFormOpen(false);
      setEditingVar(null);
      await refetch();
    } catch (err) {
      toast.error("Không thể lưu biến thể", {
        description: err?.response?.data?.message || err.message,
      });
    }
  };

  const onDeleteVariant = async (variantId) => {
    if (!medId) return;
    if (confirm("Xóa biến thể này?")) {
      await svcDeleteVariant(medId, variantId);
      toast.success("Đã xóa biến thể");
      await refetch();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setPage(1);
  };
  const handleClearFilters = () => {
    setSearchInput("");
    setAppliedSearch("");
    setStatusFilter("all");
    setPage(1);
  };

  const medTitle = passedMedication?.name
    ? `${passedMedication.name} • Biến thể`
    : `Thuốc #${medId} • Biến thể`;

  const [lightbox, setLightbox] = useState({ open: false, src: "", alt: "" });
  const openLightbox = (src, alt) => setLightbox({ open: true, src, alt });
  const closeLightbox = () => setLightbox({ open: false, src: "", alt: "" });

  return (
    <AppLayout>
      <div className="mb-4 flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() =>
            navigate(`/medications/${medId}`, {
              state: { medication: passedMedication },
            })
          }
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại Chi tiết
        </Button>
        <Button variant="outline" onClick={() => navigate("/medications")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại Danh sách
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {passedMedication?.imageId && (
              <MedicationImage
                fileId={passedMedication.imageId}
                alt={passedMedication.name}
                size={64}
                onClick={openLightbox}
              />
            )}
            <CardTitle>{medTitle}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ==== FILTER BAR (inline, giống UserListPage) ==== */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row gap-2 sm:items-center"
            >
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  className="w-64"
                  placeholder="Tìm theo SKU / Tên / Mã vạch…"
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
                <PlusCircle className="mr-2 h-4 w-4" /> Thêm biến thể
              </Button>
            </div>
          </div>
          {/* ==== /FILTER BAR ==== */}

          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead>Hệ số</TableHead>
                  <TableHead>Mã vạch</TableHead>
                  <TableHead>Giá bán</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Cho phép bán</TableHead>
                  <TableHead className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.sku}</TableCell>
                    <TableCell>{v.name}</TableCell>
                    <TableCell>{v.unit}</TableCell>
                    <TableCell>{v.barcode || "-"}</TableCell>
                    <TableCell>
                      {typeof v.sellPrice === "number"
                        ? v.sellPrice.toLocaleString()
                        : v.sellPrice}
                    </TableCell>
                    <TableCell>{v.isActive ? "Hoạt động" : "Ngừng"}</TableCell>
                    <TableCell>{v.isForSale ? "Có" : "Không"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        onClick={() => openEdit(v)}
                        title="Sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDeleteVariant(v.id)}
                        title="Xóa"
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
                      Chưa có biến thể
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {variants.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(page - 1) * 10 + 1}-
                {Math.min(page * 10, pagination.total)} / {pagination.total}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  ««
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  ‹
                </Button>
                <span className="text-sm px-2">
                  Trang {page}/{pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  ›
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.totalPages)}
                  disabled={page >= pagination.totalPages}
                >
                  »»
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Lightbox */}
      {lightbox.open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={closeLightbox}
              className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
              aria-label="Đóng ảnh"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={lightbox.src}
              alt={lightbox.alt || "Medication image"}
              className="max-h-[85vh] w-auto rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Popup Add/Edit Variant */}
      <Dialog open={formOpen && !lightbox.open} onOpenChange={setFormOpen}>
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          aria-describedby="variant-form-desc"
        >
          <p id="variant-form-desc" className="sr-only">
            Variant form dialog
          </p>
          <DialogHeader>
            <DialogTitle>
              {editingVar ? "Sửa biến thể" : "Thêm biến thể"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmitVariant)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">SKU *</label>
              <Controller
                name="sku"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Nhập SKU" />}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tên *</label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Nhập tên" />}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Đơn vị *</label>
              <Controller
                name="unit"
                control={control}
                render={({ field }) => <Input {...field} placeholder="VD: viên, hộp" />}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hệ số quy đổi *</label>
              <Controller
                name="unitFactor"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="VD: 1, 10, 100" type="number" step="0.01" min="0.01" />
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mã vạch</label>
              <Controller
                name="barcode"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Nhập mã vạch" />}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Giá bán *</label>
              <Controller
                name="sellPrice"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Nhập giá" type="number" step="0.01" />
                )}
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <Controller
                name="isActive"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <>
                    <Checkbox
                      checked={!!value}
                      onCheckedChange={(c) => onChange(!!c)}
                    />
                    <span className="text-sm">Đang hoạt động</span>
                  </>
                )}
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <Controller
                name="isForSale"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <>
                    <Checkbox
                      checked={!!value}
                      onCheckedChange={(c) => onChange(!!c)}
                    />
                    <span className="text-sm">Cho phép bán</span>
                  </>
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
                {editingVar ? "Lưu thay đổi" : "Thêm biến thể"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
