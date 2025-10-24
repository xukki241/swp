import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddStockDialog({ medication, open, onOpenChange }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockFormData, setStockFormData] = useState({
    medication: medication?.name || "",
    batchNumber: "",
    manufactureDate: "",
    expiryDate: "",
    quantity: 0,
    quantityReserved: 0,
    price: 0,
    zone: "",
    columnNumber: "",
    rowNumber: "",
  });
  const [searchResults, setSearchResults] = useState([]);

  function handleFormChange(e) {
    const { name, value } = e.target;
    setStockFormData({ ...stockFormData, [name]: value });
  }

  function validateForm() {
    const requiredFields = [
      "medication",
      "batchNumber",
      "manufactureDate",
      "expiryDate",
      "quantity",
      "price",
      "zone",
    ];

    for (const field of requiredFields) {
      if (!stockFormData[field]) {
        toast.error(`Please fill in ${field}`);
        return false;
      }
    }

    if (Number(stockFormData.quantity) <= 0) {
      toast.error("Quantity must be greater than 0");
      return false;
    }

    if (
      new Date(stockFormData.expiryDate) <=
      new Date(stockFormData.manufactureDate)
    ) {
      toast.error("Expiry date must be after manufacture date");
      return false;
    }

    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Stock added:", stockFormData);
      toast.success("Stock added successfully!");
      onOpenChange(false);
      setStockFormData({
        medication: "",
        batchNumber: "",
        manufactureDate: "",
        expiryDate: "",
        quantity: 0,
        quantityReserved: 0,
        price: 0,
        zone: "",
        columnNumber: "",
        rowNumber: "",
      });
    } catch {
      toast.error("Failed to add stock. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Stock</DialogTitle>
          <DialogDescription>
            Fill out the information below to add stock
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-md">
              <span className="text-primary font-semibold animate-pulse">
                Processing...
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <Label className="mb-2" htmlFor="medication">
                Medication
              </Label>
              <Input
                required
                id="medication"
                name="medication"
                placeholder="Enter medication name"
                value={stockFormData.medication}
                onChange={handleFormChange}
              />
            </div>

            <div>
              <Label className="mb-2" htmlFor="batchNumber">
                Batch Number
              </Label>
              <Input
                required
                id="batchNumber"
                name="batchNumber"
                value={stockFormData.batchNumber}
                onChange={handleFormChange}
              />
            </div>

            <div>
              <Label className="mb-2" htmlFor="manufactureDate">
                Manufacture Date
              </Label>
              <Input
                required
                type="date"
                id="manufactureDate"
                name="manufactureDate"
                value={stockFormData.manufactureDate}
                onChange={handleFormChange}
              />
            </div>

            <div>
              <Label className="mb-2" htmlFor="expiryDate">
                Expiry Date
              </Label>
              <Input
                required
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={stockFormData.expiryDate}
                onChange={handleFormChange}
              />
            </div>

            <div>
              <Label className="mb-2" htmlFor="quantity">
                Quantity
              </Label>
              <Input
                required
                type="number"
                id="quantity"
                name="quantity"
                min="0"
                value={stockFormData.quantity}
                onChange={handleFormChange}
              />
            </div>

            <div>
              <Label className="mb-2" htmlFor="price">
                Price
              </Label>
              <Input
                required
                type="number"
                id="price"
                name="price"
                min="0"
                step="0.01"
                value={stockFormData.price}
                onChange={handleFormChange}
              />
            </div>

            <div>
              <Label className="mb-2" htmlFor="zone">
                Zone
              </Label>
              <Input
                required
                id="zone"
                name="zone"
                value={stockFormData.zone}
                onChange={handleFormChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Saving..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
