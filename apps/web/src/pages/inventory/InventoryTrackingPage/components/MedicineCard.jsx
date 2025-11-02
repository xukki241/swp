import MedicinePlaceholder from "@/assets/medicine-placeholder.jpg";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, Box, Calendar, Package } from "lucide-react";
import { useState } from "react";
import MedicineDialog from "./MedicineDialog";

const MedicineCard = ({ medicine = {}, variant }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Map API data to component data
  const medicationName =
    medicine?.medicationVariant?.medication?.name || "Unknown";
  const variantName = medicine?.medicationVariant?.name || "";
  const variantUnit = medicine?.medicationVariant?.unit || "";
  const imageUrl = medicine?.medicationVariant?.medication?.image_url;
  const batchNumber = medicine?.batchNumber || "N/A";
  const quantity = medicine?.quantity || 0;
  const quantityReserved = medicine?.quantityReserved || 0;
  const availableQuantity = quantity - quantityReserved;

  // Calculate expiry date (use actual or 1 year after manufacture)
  let expiryDate = medicine?.expiryDate;
  if (!expiryDate && medicine?.manufactureDate) {
    const mfgDate = new Date(medicine.manufactureDate);
    mfgDate.setFullYear(mfgDate.getFullYear() + 1);
    expiryDate = mfgDate.toISOString().split("T")[0];
  }

  const daysRemaining = expiryDate
    ? Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  // Location info
  const zoneCode = medicine?.bin?.rack?.zone?.code || "?";
  const rackCode = medicine?.bin?.rack?.code || "?";
  const binLevel = medicine?.bin?.level || "?";
  const binNumber = medicine?.bin?.number || "?";

  const cardClass = cn(
    "relative group cursor-pointer hover:shadow-lg transition-all duration-200 h-full",
    {
      "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20":
        variant === "low-stock",
      "border-orange-500 bg-orange-50 dark:bg-orange-950/20":
        variant === "expiring" && daysRemaining >= 0,
      "border-red-500 bg-red-50 dark:bg-red-950/20":
        variant === "expiring" && daysRemaining < 0,
    }
  );

  return (
    <>
      <Card className={cardClass} onClick={() => setIsDialogOpen(true)}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <img
                src={imageUrl || MedicinePlaceholder}
                alt={medicationName}
                className="w-16 h-16 object-cover rounded-lg border"
              />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base line-clamp-2 mb-1">
                {medicationName}
              </CardTitle>
              {variantName && (
                <CardDescription className="text-xs line-clamp-1">
                  {variantName}
                </CardDescription>
              )}
              <Badge variant="outline" className="text-xs mt-1">
                {batchNumber}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          {/* Priority Info */}
          {variant === "low-stock" ? (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-3 border border-yellow-300">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                  Cảnh Báo Tồn Kho Thấp
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                  {availableQuantity}
                </span>
                <span className="text-sm text-yellow-600 dark:text-yellow-500">
                  {variantUnit} có sẵn
                </span>
              </div>
              {quantityReserved > 0 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                  ({quantityReserved} Đã Sử Dụng)
                </p>
              )}
            </div>
          ) : (
            <div
              className={cn(
                "rounded-lg p-3 border",
                daysRemaining < 0
                  ? "bg-red-100 dark:bg-red-900/30 border-red-300"
                  : "bg-orange-100 dark:bg-orange-900/30 border-orange-300"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle
                  className={cn(
                    "w-4 h-4",
                    daysRemaining < 0 ? "text-red-600" : "text-orange-600"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    daysRemaining < 0
                      ? "text-red-700 dark:text-red-400"
                      : "text-orange-700 dark:text-orange-400"
                  )}
                >
                  {daysRemaining < 0 ? "Đã Quá Hạn" : "Sắp Hết Hạn"}
                </span>
              </div>
              {daysRemaining !== null && (
                <>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={cn(
                        "text-2xl font-bold",
                        daysRemaining < 0
                          ? "text-red-700 dark:text-red-400"
                          : "text-orange-700 dark:text-orange-400"
                      )}
                    >
                      {Math.abs(daysRemaining)}
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        daysRemaining < 0
                          ? "text-red-600 dark:text-red-500"
                          : "text-orange-600 dark:text-orange-500"
                      )}
                    >
                      {daysRemaining < 0 ? "ngày quá hạn" : "ngày còn lại"}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      daysRemaining < 0
                        ? "text-red-600 dark:text-red-500"
                        : "text-orange-600 dark:text-orange-500"
                    )}
                  >
                    Hết hạn: {new Date(expiryDate).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Additional Info */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Package className="w-3.5 h-3.5" />
              <span>
                Tồn kho: {availableQuantity} {variantUnit}
              </span>
            </div>
            {variant === "expiring" && daysRemaining !== null && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {daysRemaining < 0
                    ? `Đã quá hạn ${Math.abs(daysRemaining)} ngày`
                    : `Hết hạn trong ${daysRemaining} ngày`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Box className="w-3.5 h-3.5" />
              <span>
                {zoneCode}-{rackCode}-L{binLevel}-{binNumber}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <MedicineDialog
        medicine={medicine}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant={variant}
      />
    </>
  );
};

export default MedicineCard;
