import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AddStockDialog({ medication }) {
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockFormData, setStockFormData] = useState({
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
  const addStockSearchMedicine = useRef(null);
  const [searchResults, setSearchResults] = useState([]);

  function handleFormChange(e) {
    const { name, value } = e.target;
    setStockFormData({ ...stockFormData, [name]: value });
    if (name === "medication") {
      const results = medicines.filter((m) =>
        m.name.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(results);
    }
  }

  function handleSelectMedicine(med) {
    // store medication name string instead of whole object to avoid rendering objects in JSX
    setStockFormData({ ...stockFormData, medication: med.name || med });
    setSearchResults([]);
  }

  function validateForm() {
    const required = [
      "medication",
      "batchNumber",
      "manufactureDate",
      "expiryDate",
      "quantity",
      "price",
      "zone",
    ];
    for (const field of required) {
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
      await new Promise((r) => setTimeout(r, 1500));

      console.log("Stock added:", stockFormData);
      toast.success("Stock added successfully!");
      setShowAddStockDialog(false);
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
        note: "",
      });
    } catch (err) {
      toast.error("Failed to add stock. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={showAddStockDialog} onOpenChange={setShowAddStockDialog}>
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
            <div className="relative">
              <Label className="mb-2" htmlFor="medication">
                Medication
              </Label>
              <Input
                required
                id="medication"
                name="medication"
                placeholder="Search medicine..."
                value={stockFormData.medication}
                onChange={handleFormChange}
                autoComplete="off"
              />

              {/* Medicine search result */}
              {searchResults.length > 0 && (
                <div
                  ref={addStockSearchMedicine}
                  className="absolute bg-white border rounded-md shadow-md mt-1 z-10 w-full max-h-80 overflow-y-auto"
                >
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectMedicine(result)}
                    >
                      {result.name}
                    </div>
                  ))}
                </div>
              )}
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
              <Label className="mb-2" htmlFor="quantityReserved">
                Quantity Reserved
              </Label>
              <Input
                required
                id="quantityReserved"
                name="quantityReserved"
                value={stockFormData.quantityReserved}
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

            <div>
              <Label className="mb-2" htmlFor="columnNumber">
                Column Number
              </Label>
              <Input
                required
                type="number"
                id="columnNumber"
                name="columnNumber"
                value={stockFormData.columnNumber}
                onChange={handleFormChange}
              />
            </div>

            <div>
              <Label className="mb-2" htmlFor="rowNumber">
                Row Number
              </Label>
              <Input
                required
                type="number"
                id="rowNumber"
                name="rowNumber"
                value={stockFormData.rowNumber}
                onChange={handleFormChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              disabled={isSubmitting}
              onClick={() => setShowAddStockDialog(false)}
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
