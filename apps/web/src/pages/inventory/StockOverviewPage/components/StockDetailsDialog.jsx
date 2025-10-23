import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import MedicinePlaceholder from "@/assets/medicine-placeholder.jpg";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function calculateRemainingDays(expiryDateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDate = new Date(expiryDateString);
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default function StockDetailsDialog({
  medicationItem,
  open,
  onOpenChange,
}) {
  console.log(medicationItem);

  function getExpiryBadge(daysRemaining) {
    if (daysRemaining < 30) {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          Expires Soon
        </Badge>
      );
    } else if (daysRemaining < 90) {
      return (
        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
          Expiring
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
        Good
      </Badge>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Medicine Details</DialogTitle>
          <DialogDescription>
            Complete information about {medicationItem?.medicationVariant?.name}
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
                <div className="mt-3">
                  {getExpiryBadge(medicationItem.daysRemaining)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Quantity</Label>
                <p className="text-lg font-semibold">
                  {medicationItem.quantity}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Unit</Label>
                <p className="text-lg font-semibold">
                  {medicationItem?.medicationVariant?.unit}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Selling Price</Label>
                <p className="text-lg font-semibold">
                  {medicationItem?.medicationVariant?.sellPrice} VND
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Prescription</Label>
                <p className="text-lg font-semibold capitalize">
                  {medicationItem?.medicationVariant?.medication
                    ?.isPrescriptionRequired
                    ? "true"
                    : "false"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Storage Area</Label>
                <p className="text-lg font-semibold">
                  {medicationItem?.bin?.rack?.zone?.name}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Rack</Label>
                <p className="text-lg font-semibold">
                  {medicationItem?.bin?.rack?.name}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Level</Label>
                <p className="text-lg font-semibold">
                  {medicationItem?.bin?.level}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Number</Label>
                <p className="text-lg font-semibold">
                  {medicationItem?.bin?.number}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Expiration Date</Label>
                <p className="text-lg font-semibold">
                  {medicationItem?.expiryDate}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Expiration Date</Label>
                <p className="text-lg font-semibold">
                  {medicationItem?.manufactureDate}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Days Remaining</Label>
                <p className="text-lg font-semibold">
                  {calculateRemainingDays(medicationItem?.expiryDate)} days
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Batch Number</Label>
                <p className="text-lg font-semibold">
                  {medicationItem?.batchNumber}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Brand</Label>
                <p className="text-lg font-semibold">
                  {medicationItem?.medicationVariant?.medication?.brand}
                </p>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
