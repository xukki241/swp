import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInventory } from "@/hooks/useInventory";
import { useState } from "react";
import { toast } from "sonner";

export default function AddjustStockDialog({
  medication,
  open,
  onOpenChange,
  refetchInventory,
}) {
  const [adjustQuantity, setAdjustQuantity] = useState(0);
  const [canAdjust, setCanAdjust] = useState(true);
  const [reason, setReason] = useState("");
  const { error, loading, fetchAdjustStock } = useInventory();

  function getTextNotation() {
    if (adjustQuantity > 0) {
      return "text-green-600";
    } else if (adjustQuantity < 0) {
      return "text-red-600";
    }
    return "text-gray-600";
  }

  // Handle adjust quantity
  function handleAdjust(adjustingNumber) {
    const changing = Number(adjustQuantity) + Number(adjustingNumber);
    const afterChange = medication.quantity + changing;

    if (afterChange > 0) {
      setAdjustQuantity(changing);
      setCanAdjust(true);
    } else if (afterChange <= 0) {
      if (changing > -medication.quantity) {
        setAdjustQuantity(-medication.quantity);
        setCanAdjust(true);
      } else {
        setAdjustQuantity(-medication.quantity);
        setCanAdjust(false);
      }
    }
  }

  // Handle submit new quantity
  async function handleSubmitAdjustment() {
    if (adjustQuantity === 0) {
      toast.success("Inventory quantity remains the same");
      onOpenChange(false);
      return;
    } else if (reason.length === 0) {
      toast.warning("Reason cannot be empty.");
      return;
    }

    try {
      await fetchAdjustStock(
        medication.id,
        medication.quantity + adjustQuantity,
        reason
      );
      toast.success("Stock adjusted successfully");
      onOpenChange(false);
      refetchInventory();
    } catch {
      toast.error(error.adjustStock || "Failed to adjust stock");
    } finally {
      handleClose();
    }
  }

  // Handle close dialog
  function handleClose() {
    onOpenChange(false);
    setTimeout(() => {
      setAdjustQuantity(0);
      setReason("");
    }, 200);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        {loading.adjustQuantity && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <span className="text-primary font-semibold animate-pulse">
              Submitting...
            </span>
          </div>
        )}
        <DialogHeader>
          <DialogTitle>Adjust Stock Quantity</DialogTitle>
        </DialogHeader>
        {medication && (
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label>Medicine Name</Label>
              <p className="text-lg">{medication?.medicationVariant?.name}</p>
            </div>

            <div className="space-y-2">
              <Label>Current Stock</Label>
              <p className="text-lg">
                {medication.quantity} {medication.unit}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newQuantity">Adjust Quantity</Label>
              <div className="flex items-center gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleAdjust(-10)}
                  disabled={!canAdjust}
                >
                  -
                </Button>
                <Input
                  id="newQuantity"
                  type="number"
                  value={adjustQuantity}
                  onChange={(e) =>
                    handleAdjust(e.target.value - adjustQuantity)
                  }
                  className={`text-center ${getTextNotation()}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleAdjust(10)}
                >
                  +
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setAdjustQuantity(0)}
                >
                  <i className="bi bi-arrow-counterclockwise"></i>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quantity After Change</Label>
              <p className="text-lg">
                {medication.quantity + Number(adjustQuantity)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason to change..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose()}
            disabled={loading.adjustStock}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitAdjustment}
            className="bg-primary hover:bg-primary/90"
            disabled={loading.adjustQuantity}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
