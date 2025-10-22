"use client";

import MedicinePlaceholder from "@/assets/medicine-placeholder.jpg";
import { AppLayout } from "@/components/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Plus, Search, Settings2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

// Mock data - replace with actual API call
const medicines = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    image: "/paracetamol_tablet.png",
    quantity: 500,
    sku: "MED-001",
    price: 5.99,
    unit: "tablets",
    prescriptionType: "non-prescription",
    storageArea: "A",
    shelfRow: 3,
    shelfColumn: 2,
    expirationDate: "2025-12-31",
    daysRemaining: 442,
    batchNumber: "BATCH-2024-001",
  },
  {
    id: 2,
    name: "Amoxicillin 250mg",
    image: "/amoxicillin.jpg",
    quantity: 250,
    sku: "MED-002",
    price: 12.5,
    unit: "capsules",
    prescriptionType: "prescription",
    storageArea: "B",
    shelfRow: 1,
    shelfColumn: 4,
    expirationDate: "2025-06-15",
    daysRemaining: 243,
    batchNumber: "BATCH-2024-002",
  },
  {
    id: 3,
    name: "Ibuprofen 400mg",
    image: "/ibuprofen-tablets.png",
    quantity: 350,
    sku: "MED-003",
    price: 8.75,
    unit: "tablets",
    prescriptionType: "non-prescription",
    storageArea: "A",
    shelfRow: 2,
    shelfColumn: 1,
    expirationDate: "2026-03-20",
    daysRemaining: 685,
    batchNumber: "BATCH-2024-003",
  },
  {
    id: 4,
    name: "Cetirizine 10mg",
    image: "/cetirizine.jpg",
    quantity: 180,
    sku: "MED-004",
    price: 6.25,
    unit: "tablets",
    prescriptionType: "non-prescription",
    storageArea: "C",
    shelfRow: 4,
    shelfColumn: 3,
    expirationDate: "2025-09-10",
    daysRemaining: 330,
    batchNumber: "BATCH-2024-004",
  },
];

export default function StockOverviewPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [adjustQuantity, setAdjustQuantity] = useState(0);

  const [showAddStockDialog, setShowAddStockDialog] = useState(false);
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
  const [searchResults, setSearchResults] = useState(medicines);
  const addStockSearchMedicine = useRef(null);

  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  function handleViewDetails(medicine) {
    setSelectedMedicine(medicine);
    setShowDetailsDialog(true);
  }

  function handleAdjustQuantity(medicine) {
    setSelectedMedicine(medicine);
    setAdjustQuantity(medicine.quantity);
    setShowAdjustDialog(true);
  }

  function handleSubmitAdjustment() {
    console.log(
      `Adjusting ${selectedMedicine.name} quantity to ${adjustQuantity}`
    );
    // TODO: Add API call to update quantity
    setShowAdjustDialog(false);
    setSelectedMedicine(null);
  }

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
    <AppLayout>
      {/* Main Layout of Page */}
      <div className="space-y-6">
        <Card className="shadow-md rounded-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Stock Overview
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Browse and manage all medicines in stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex items-center justify-between">
              <div className="relative w-2/3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search medicines by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => setShowAddStockDialog(true)}
              >
                <Plus className="h-4 w-4" />
                Add Stock
              </Button>
            </div>

            <div>
              {filteredMedicines.map((medicine) => (
                <Card
                  key={medicine.id}
                  className="border shadow-sm hover:shadow-md transition-shadow mb-3 overflow-hidden"
                >
                  <CardContent className="flex justify-between items-center flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                      <img
                        src={MedicinePlaceholder}
                        alt={medicine.name}
                        className="w-20 h-20 rounded-lg object-cover border"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {medicine.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Stock: {medicine.quantity} {medicine.unit}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Price: {medicine.price} VND
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => handleViewDetails(medicine)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => handleAdjustQuantity(medicine)}
                      >
                        <Settings2 className="h-4 w-4 mr-1" />
                        Adjust
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredMedicines.length === 0 && (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No medicines found
                </h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search query
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Stock Dialog */}
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

      {/* View Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Medicine Details</DialogTitle>
            <DialogDescription>
              Complete information about {selectedMedicine?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedMedicine && (
            <div className="space-y-6 py-4">
              <div className="flex items-start gap-6">
                <img
                  src={MedicinePlaceholder}
                  alt={selectedMedicine.name}
                  className="w-32 h-32 rounded-lg object-cover border"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedMedicine.name}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    SKU: {selectedMedicine.sku}
                  </p>
                  <div className="mt-3">
                    {getExpiryBadge(selectedMedicine.daysRemaining)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Selling Price</Label>
                  <p className="text-lg font-semibold">
                    ${selectedMedicine.price}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Quantity</Label>
                  <p className="text-lg font-semibold">
                    {selectedMedicine.quantity} {selectedMedicine.unit}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Unit</Label>
                  <p className="text-lg font-semibold">
                    {selectedMedicine.unit}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">
                    Prescription Type
                  </Label>
                  <p className="text-lg font-semibold capitalize">
                    {selectedMedicine.prescriptionType}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Storage Area</Label>
                  <p className="text-lg font-semibold">
                    {selectedMedicine.storageArea}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">
                    Shelf Position
                  </Label>
                  <p className="text-lg font-semibold">
                    Row {selectedMedicine.shelfRow}, Column{" "}
                    {selectedMedicine.shelfColumn}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">
                    Expiration Date
                  </Label>
                  <p className="text-lg font-semibold">
                    {selectedMedicine.expirationDate}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">
                    Days Remaining
                  </Label>
                  <p className="text-lg font-semibold">
                    {selectedMedicine.daysRemaining} days
                  </p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-muted-foreground">Batch Number</Label>
                  <p className="text-lg font-semibold">
                    {selectedMedicine.batchNumber}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Quantity Dialog */}
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
            <Button
              variant="outline"
              onClick={() => setShowAdjustDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAdjustment}
              className="bg-primary hover:bg-primary/90"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
