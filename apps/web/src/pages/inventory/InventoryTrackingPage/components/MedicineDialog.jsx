import MedicinePlaceholder from "@/assets/medicine-placeholder.jpg";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Box,
  Calendar,
  Factory,
  Package,
  Pill,
  Tag,
} from "lucide-react";

const MedicineDialog = ({ medicine, open, onOpenChange, variant }) => {
  if (!medicine) return null;

  const isLowStock = variant === "low-stock";
  const isExpiring = variant === "expiring";

  // Map API data
  const medication = medicine.medicationVariant?.medication || {};
  const variantData = medicine.medicationVariant || {};

  const medicationName = medication.name || "Unknown";
  const variantName = variantData.name || "";
  const variantUnit = variantData.unit || "unit";
  const variantSku = variantData.sku || "N/A";
  const sellPrice = variantData.sellPrice || 0;
  const imageUrl = medication.image_url;

  const quantity = medicine.quantity || 0;
  const quantityReserved = medicine.quantityReserved || 0;
  const availableQuantity = quantity - quantityReserved;

  const batchNumber = medicine.batchNumber || "N/A";
  const manufactureDate = medicine.manufactureDate;

  // Calculate expiry date
  let expiryDate = medicine.expiryDate;
  let isCalculatedExpiry = false;
  if (!expiryDate && manufactureDate) {
    const mfgDate = new Date(manufactureDate);
    mfgDate.setFullYear(mfgDate.getFullYear() + 1);
    expiryDate = mfgDate.toISOString().split("T")[0];
    isCalculatedExpiry = true;
  }

  const daysRemaining = expiryDate
    ? Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  // Location info
  const bin = medicine.bin || {};
  const rack = bin.rack || {};
  const zone = rack.zone || {};

  const zoneCode = zone.code || "?";
  const zoneName = zone.name || "Unknown";
  const rackCode = rack.code || "?";
  const rackName = rack.name || "Unknown";
  const binLevel = bin.level || "?";
  const binNumber = bin.number || "?";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{medicationName}</DialogTitle>
          {variantName && (
            <DialogDescription className="text-base">
              {variantName}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          <div className="flex justify-center">
            <img
              src={imageUrl || MedicinePlaceholder}
              alt={medicationName}
              className="w-40 h-40 object-cover rounded-lg border shadow-sm"
            />
          </div>

          {/* Priority Alert Section */}
          {isLowStock && (
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-500 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-700 dark:text-yellow-400 text-lg">
                    Cảnh Báo Tồn Kho Thấp
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-xs text-yellow-600 dark:text-yellow-500">
                    Tổng Tồn Kho
                  </p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                    {quantity}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-yellow-600 dark:text-yellow-500">
                    Đã Sử Dụng
                  </p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                    {quantityReserved}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-yellow-600 dark:text-yellow-500">
                    Có Sẵn
                  </p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                    {availableQuantity}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isExpiring && daysRemaining !== null && (
            <div
              className={`border-2 rounded-lg p-4 ${
                daysRemaining < 0
                  ? "bg-red-50 dark:bg-red-950/30 border-red-500"
                  : "bg-orange-50 dark:bg-orange-950/30 border-orange-500"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle
                  className={`w-6 h-6 ${
                    daysRemaining < 0 ? "text-red-600" : "text-orange-600"
                  }`}
                />
                <div>
                  <h3
                    className={`font-semibold text-lg ${
                      daysRemaining < 0
                        ? "text-red-700 dark:text-red-400"
                        : "text-orange-700 dark:text-orange-400"
                    }`}
                  >
                    {daysRemaining < 0 ? "Đã Quá Hạn" : "Sắp Hết Hạn"}
                  </h3>
                  <p
                    className={`text-sm ${
                      daysRemaining < 0
                        ? "text-red-600 dark:text-red-500"
                        : "text-orange-600 dark:text-orange-500"
                    }`}
                  >
                    {daysRemaining < 0
                      ? `Đã quá hạn ${Math.abs(daysRemaining)} ngày`
                      : `Cần hành động trong ${daysRemaining} ngày`}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p
                    className={`text-xs ${
                      daysRemaining < 0
                        ? "text-red-600 dark:text-red-500"
                        : "text-orange-600 dark:text-orange-500"
                    }`}
                  >
                    {daysRemaining < 0 ? "Số Ngày Quá Hạn" : "Ngày Còn Lại"}
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      daysRemaining < 0
                        ? "text-red-700 dark:text-red-400"
                        : "text-orange-700 dark:text-orange-400"
                    }`}
                  >
                    {Math.abs(daysRemaining)}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-xs ${
                      daysRemaining < 0
                        ? "text-red-600 dark:text-red-500"
                        : "text-orange-600 dark:text-orange-500"
                    }`}
                  >
                    Ngày Hết Hạn
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      daysRemaining < 0
                        ? "text-red-700 dark:text-red-400"
                        : "text-orange-700 dark:text-orange-400"
                    }`}
                  >
                    {new Date(expiryDate).toLocaleDateString()}
                  </p>
                  {isCalculatedExpiry && (
                    <p
                      className={`text-xs italic ${
                        daysRemaining < 0
                          ? "text-red-600 dark:text-red-500"
                          : "text-orange-600 dark:text-orange-500"
                      }`}
                    >
                      (Tính toán: SX + 1 năm)
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Batch Information */}
          <div>
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Thông Tin Lô
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Số Lô</p>
                <Badge variant="outline" className="text-sm">
                  {batchNumber}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">SKU</p>
                <p className="text-sm font-medium">{variantSku}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Stock Information */}
          <div>
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Thông Tin Tồn Kho
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tổng Số Lượng</p>
                <p className="text-lg font-semibold">
                  {quantity} {variantUnit}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Đã Sử Dụng</p>
                <p className="text-lg font-semibold">
                  {quantityReserved} {variantUnit}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Có Sẵn</p>
                <p className="text-lg font-semibold text-green-600">
                  {availableQuantity} {variantUnit}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Đơn Vị</p>
                <p className="text-sm font-medium">{variantUnit}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Giá Bán</p>
                <p className="text-sm font-medium">{sellPrice} VND</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Date Information */}
          <div>
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Thông Tin Ngày
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {manufactureDate && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Factory className="w-3 h-3" />
                    Ngày Sản Xuất
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(manufactureDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {expiryDate && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Ngày Hết Hạn
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(expiryDate).toLocaleDateString()}
                    {isCalculatedExpiry && (
                      <span className="text-xs text-muted-foreground italic ml-1">
                        (tính toán)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Location Information */}
          <div>
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              <Box className="w-4 h-4" />
              Thông Tin Vị Trí
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Khu Vực</p>
                <p className="text-sm font-medium">
                  {zoneCode} - {zoneName}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Giá</p>
                <p className="text-sm font-medium">
                  {rackCode} - {rackName}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Hàng</p>
                <p className="text-sm font-medium">{binLevel}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Cột</p>
                <p className="text-sm font-medium">{binNumber}</p>
              </div>
            </div>
          </div>

          {/* Additional Medication Info */}
          {medication.activeIngredient && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Chi Tiết Thuốc
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Thành Phần Hoạt Tính
                    </p>
                    <p className="text-sm">{medication.activeIngredient}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MedicineDialog;
