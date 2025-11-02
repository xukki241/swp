"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../components/ui/tooltip";
import { useWarehouse } from "../../../../hooks/useWarehouse";

// Convert number to column letter (1 = A, 2 = B, ..., 27 = AA, 28 = AB, ...)
function numberToColumn(num) {
  let result = "";
  while (num > 0) {
    const remainder = (num - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    num = Math.floor((num - 1) / 26);
  }
  return result;
}

export function BinCard({ bin, level, number, rackId, rack, refetch }) {
  const { updateBinData, deleteBinData } = useWarehouse();
  const [showBinDetails, setShowBinDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: bin?.code || "",
    name: bin?.name || "",
    level: bin?.level || level || "",
    number: bin?.number || number || "",
    description: bin?.description || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateBinData(bin.id, formData);
      setShowEditDialog(false);
      if (refetch) refetch();
    } catch (error) {
      console.error("Failed to update bin:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteBinData(bin.id, rackId);
      setShowDeleteDialog(false);
      setShowEditDialog(false);
      if (refetch) refetch();
    } catch (error) {
      console.error("Failed to delete bin:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const position = `${bin?.level || level}${numberToColumn(bin?.number || number)}`;
  const isEmpty = !bin;
  const hasInventory = bin?.inventoryEntries && bin.inventoryEntries.length > 0;
  const inventoryItem = hasInventory ? bin.inventoryEntries[0] : null;

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Empty cell (no bin)
  if (isEmpty) {
    return (
      <div className="w-16 h-16 flex items-center justify-center border-2 border-dashed border-gray-300 rounded bg-gray-50 text-xs text-gray-400">
        {position}
      </div>
    );
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setShowBinDetails(true)}
              className={`w-16 h-16 flex flex-col items-center justify-center border-2 rounded transition-all hover:shadow-md hover:scale-105 ${
                hasInventory
                  ? "bg-green-100 border-green-500 hover:bg-green-200"
                  : "bg-blue-100 border-blue-500 hover:bg-blue-200"
              }`}
            >
              <span className="text-xs font-bold">{position}</span>
              <span className="text-[10px] text-gray-600 truncate max-w-full px-1">
                {bin.code}
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <div>
                <p className="font-semibold">{bin.name}</p>
                <p className="text-xs">Mã: {bin.code}</p>
                <p className="text-xs">
                  Vị trí: Tầng {bin.level}, {numberToColumn(bin.number)}
                </p>
                {bin.description && (
                  <p className="text-xs text-gray-500">{bin.description}</p>
                )}
              </div>
              {hasInventory && inventoryItem && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-1">Thông tin tồn kho</p>
                  <div className="text-xs space-y-0.5">
                    <p>
                      <span className="font-medium">Thuốc:</span>{" "}
                      {inventoryItem.medicationVariant?.name || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Lô:</span>{" "}
                      {inventoryItem.batchNumber}
                    </p>
                    <p>
                      <span className="font-medium">Số lượng:</span>{" "}
                      {inventoryItem.quantity} (Reserved:{" "}
                      {inventoryItem.quantityReserved})
                    </p>
                    <p>
                      <span className="font-medium">Ngày SX:</span>{" "}
                      {formatDate(inventoryItem.manufactureDate)}
                    </p>
                    <p>
                      <span className="font-medium">Hạn dùng:</span>{" "}
                      {formatDate(inventoryItem.expiryDate)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Bin Details Dialog */}
      <Dialog open={showBinDetails} onOpenChange={setShowBinDetails}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Chi tiết ô {position}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Important Information - Top Section */}
            <div className="space-y-3">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {bin?.name || "N/A"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Mã:{" "}
                  <span className="font-medium text-gray-700">
                    {bin?.code || "N/A"}
                  </span>
                </p>
              </div>

              {hasInventory && inventoryItem ? (
                <>
                  {/* Medication Info - Most Important */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                    <div>
                      <Label className="text-xs text-green-700 uppercase font-semibold">
                        Thuốc
                      </Label>
                      <p className="text-xl font-bold text-green-900 capitalize">
                        {inventoryItem.medicationVariant?.name || "N/A"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-green-700">Số lô</Label>
                        <p className="text-lg font-semibold text-green-900">
                          {inventoryItem.batchNumber || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-green-700">
                          Số lượng
                        </Label>
                        <p className="text-lg font-semibold text-green-900">
                          {inventoryItem.quantity || 0}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-green-700">
                          Hạn dùng
                        </Label>
                        <p className="text-base font-semibold text-green-900">
                          {formatDate(inventoryItem.expiryDate)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-green-700">
                          Đã sử dụng
                        </Label>
                        <p className="text-base font-semibold text-green-900">
                          {inventoryItem.quantityReserved || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-lg font-semibold text-gray-500 text-center">
                    Ô trống - Chưa có thuốc
                  </p>
                </div>
              )}
            </div>

            {/* Secondary Information - Bottom Section with smaller text */}
            <div className="border-t pt-4">
              <Label className="text-xs text-muted-foreground uppercase font-semibold mb-3 block">
                Thông tin vị trí
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-0.5">
                  <Label className="text-xs text-muted-foreground">
                    Khu vực
                  </Label>
                  <p className="text-sm font-medium">
                    {rack?.zone?.name || "N/A"}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <Label className="text-xs text-muted-foreground">Giá</Label>
                  <p className="text-sm font-medium">{rack?.name || "N/A"}</p>
                </div>
                <div className="space-y-0.5">
                  <Label className="text-xs text-muted-foreground">
                    Vị trí
                  </Label>
                  <p className="text-sm font-medium">{position}</p>
                </div>
              </div>
            </div>

            {/* Additional Details - Smallest text */}
            {hasInventory && inventoryItem && (
              <div className="border-t pt-4">
                <Label className="text-xs text-muted-foreground uppercase font-semibold mb-3 block">
                  Thông tin bổ sung
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-0.5">
                    <Label className="text-xs text-muted-foreground">
                      Ngày sản xuất
                    </Label>
                    <p className="text-sm">
                      {formatDate(inventoryItem.manufactureDate)}
                    </p>
                  </div>
                  {bin?.description && (
                    <div className="space-y-0.5 col-span-2">
                      <Label className="text-xs text-muted-foreground">
                        Mô tả
                      </Label>
                      <p className="text-sm text-gray-600">{bin.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setShowBinDetails(false);
                setShowDeleteDialog(true);
              }}
              disabled={isSubmitting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa ô
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBinDetails(false)}
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  setShowBinDetails(false);
                  setShowEditDialog(true);
                }}
              >
                Chỉnh sửa
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bin Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sửa ô - {position}</DialogTitle>
            <DialogDescription>Cập nhật thông tin ô bên dưới</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Tên ô</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="code">Mã ô</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="level">Tầng (Hàng)</Label>
                <Input
                  id="level"
                  name="level"
                  type="number"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="number">Cột (Số)</Label>
                <Input
                  id="number"
                  name="number"
                  type="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  required
                  disabled
                />
              </div>
            </div>

            <div>
              <Label className="mb-2" htmlFor="description">
                Mô tả
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            {hasInventory && inventoryItem && (
              <div className="border-t pt-4 space-y-3">
                <Label className="text-sm font-semibold">
                  Thông tin tồn kho
                </Label>

                <div>
                  <Label htmlFor="batchNumber" className="text-xs">
                    Số lô
                  </Label>
                  <Input
                    id="batchNumber"
                    value={inventoryItem.batchNumber || ""}
                    disabled
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="quantity" className="text-xs">
                      Số lượng
                    </Label>
                    <Input
                      id="quantity"
                      value={inventoryItem.quantity || ""}
                      disabled
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantityReserved" className="text-xs">
                      Đã đặt trước
                    </Label>
                    <Input
                      id="quantityReserved"
                      value={inventoryItem.quantityReserved || ""}
                      disabled
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="manufactureDate" className="text-xs">
                      Ngày sản xuất
                    </Label>
                    <Input
                      id="manufactureDate"
                      value={formatDate(inventoryItem.manufactureDate)}
                      disabled
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate" className="text-xs">
                      Ngày hết hạn
                    </Label>
                    <Input
                      id="expiryDate"
                      value={formatDate(inventoryItem.expiryDate)}
                      disabled
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa ô {bin.name}</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa {bin.name} tại vị trí {position}? Hành
              động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
