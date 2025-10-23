import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AddjustStockDialog({ medication }) {
  const [adjustQuantity, setAdjustQuantity] = useState(0);
  function handleSubmitAdjustment() {
    console.log(
      `Adjusting ${selectedMedicine.name} quantity to ${adjustQuantity}`
    );
    // TODO: Add API call to update quantity
    setShowAdjustDialog(false);
    setSelectedMedicine(null);
  }

  return (
    <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock Quantity</DialogTitle>
          <DialogDescription>
            Update the stock quantity for {selectedMedicine?.name}
          </DialogDescription>
        </DialogHeader>
        {selectedMedicine && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Medicine Name</Label>
              <p className="text-lg font-semibold">{selectedMedicine.name}</p>
            </div>
            <div className="space-y-2">
              <Label>Current Stock</Label>
              <p className="text-lg font-semibold">
                {selectedMedicine.quantity} {selectedMedicine.unit}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newQuantity">New Quantity</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setAdjustQuantity(Math.max(0, adjustQuantity - 10))
                  }
                >
                  -
                </Button>
                <Input
                  id="newQuantity"
                  type="number"
                  value={adjustQuantity}
                  onChange={(e) =>
                    setAdjustQuantity(
                      Math.max(0, Number.parseInt(e.target.value) || 0)
                    )
                  }
                  className="text-center"
                  min="0"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setAdjustQuantity(adjustQuantity + 10)}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Change</Label>
              <p
                className={`text-lg font-semibold ${
                  adjustQuantity > selectedMedicine.quantity
                    ? "text-green-600"
                    : adjustQuantity < selectedMedicine.quantity
                      ? "text-red-600"
                      : "text-gray-600"
                }`}
              >
                {adjustQuantity > selectedMedicine.quantity && "+"}
                {adjustQuantity - selectedMedicine.quantity}{" "}
                {selectedMedicine.unit}
              </p>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAdjustDialog(false)}>
            Cancel
          </Button>
          <Button
            // onClick={handleSubmitAdjustment}
            className="bg-primary hover:bg-primary/90"
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
