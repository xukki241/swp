import MedicinePlaceholder from "@/assets/medicine-placeholder.jpg";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { useNavigate } from "react-router";
import {
  calculateRemainingDays,
  getExpiryBadge,
  getLowStockBadge,
} from "../../utils/stockHelpers";

export default function StockDetailsDialog({
  medicationItem,
  open,
  onOpenChange,
}) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết thuốc</DialogTitle>
          <DialogDescription>
            Thông tin đầy đủ về {medicationItem?.medicationVariant?.name}
          </DialogDescription>
        </DialogHeader>
        {medicationItem && (
          <div className="space-y-6 py-4">
            <div className="flex items-start gap-6">
              <img
                src={MedicinePlaceholder}
                alt={medicationItem?.medicationVariant?.name}
                className="w-32 h-32 rounded-lg object-cover border"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">
                  {medicationItem?.medicationVariant?.name}
                </h3>
                <p className="text-muted-foreground mt-1">
                  SKU: {medicationItem?.medicationVariant?.sku}
                </p>
                <div className="mt-3 flex gap-3">
                  {getExpiryBadge(
                    calculateRemainingDays(medicationItem.expiryDate)
                  )}
                  {getLowStockBadge(medicationItem.quantity)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Tồn kho</Label>
                <p className="text-lg font-semibold">
                  {medicationItem?.quantity - medicationItem?.quantityReserved}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Đã bán</Label>
                <p className="text-lg font-semibold">
                  {medicationItem?.quantityReserved}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Đơn vị</Label>
                <p className="text-lg font-semibold capitalize">
                  {medicationItem?.medicationVariant?.unit}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Giá bán</Label>
                <p className="text-lg font-semibold">
                  {Number(
                    medicationItem?.medicationVariant?.sellPrice
                  ).toLocaleString("vi-VN")}{" "}
                  VND
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Cần kê đơn</Label>
                <p className="text-lg font-semibold capitalize">
                  {medicationItem?.medicationVariant?.medication
                    ?.isPrescriptionRequired
                    ? "Có"
                    : "Không"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Khu vực</Label>
                <p className="text-lg font-semibold">
                  {medicationItem?.bin?.rack?.zone?.name}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Giá</Label>
                <p className="text-lg font-semibold">
                  {medicationItem?.bin?.rack?.name}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Hàng</Label>
                <p className="text-lg font-semibold">
                  {medicationItem?.bin?.level}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Cột</Label>
                <p className="text-lg font-semibold">
                  {medicationItem?.bin?.number}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Ngày sản xuất</Label>
                <p className="text-lg font-semibold">
                  {medicationItem?.manufactureDate}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Hạn sử dụng</Label>
                <p className="text-lg font-semibold">
                  {medicationItem?.expiryDate}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">
                  Số ngày trước khi hết hạn
                </Label>
                <p className="text-lg font-semibold">
                  {calculateRemainingDays(medicationItem?.expiryDate)} ngày
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Số lô</Label>
                <p className="text-lg font-semibold">
                  {medicationItem?.batchNumber}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Thương hiệu</Label>
                <p className="text-lg font-semibold">
                  {medicationItem?.medicationVariant?.medication?.brand}
                </p>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() =>
              navigate(
                `/medications/${medicationItem?.medicationVariant?.medication?.id}`
              )
            }
          >
            Xem chi tiết thuốc
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
