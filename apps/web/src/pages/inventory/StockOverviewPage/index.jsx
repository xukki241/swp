"use client";

import MedicinePlaceholder from "@/assets/medicine-placeholder.jpg";
import { AppLayout } from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInventory } from "@/hooks/useInventory";
import { useSuppliers } from "@/hooks/useSuppliers";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Eye, Search, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import AddStockDialog from "./components/dialogs/AddStockDialog";
import AddjustStockDialog from "./components/dialogs/AdjustStockDialog";
import StockDetailsDialog from "./components/dialogs/StockDetailsDialog";
import InventorySearching from "./components/filters/InventorySearching";

export default function StockOverviewPage() {
  const { inventory, refetchInventory } = useInventory();
  const { data: suppliers = [] } = useSuppliers();
  const [medications, setMedications] = useState([]);
  const [currentMedication, setCurrentMedication] = useState({});
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [showAddStockDialog, setShowAddStockDialog] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setMedications(inventory);
  }, [inventory]);

  function handleShowDialog(type, medication = null) {
    setCurrentMedication(medication);
    if (type === "view") {
      setShowDetailsDialog(true);
    } else if (type === "adjust") {
      setShowAdjustDialog(true);
    } else if (type === "add") {
      setShowAddStockDialog(true);
    }
  }

  function handleSearch(searchPayload) {
    setIsSearching(true);
    try {
      const filteredMedications = inventory.filter((item) => {
        const matchesSearch =
          !searchPayload.search ||
          item.medicationVariant.name
            .toLowerCase()
            .includes(searchPayload.search.toLowerCase());

        const matchesStock =
          (!searchPayload.stockMin ||
            item.quantity >= Number(searchPayload.stockMin)) &&
          (!searchPayload.stockMax ||
            item.quantity <= Number(searchPayload.stockMax));

        const matchesPrice =
          (!searchPayload.priceMin ||
            item.medicationVariant.sellPrice >=
              Number(searchPayload.priceMin)) &&
          (!searchPayload.priceMax ||
            item.medicationVariant.sellPrice <= Number(searchPayload.priceMax));

        const matchesManufactureDate =
          (!searchPayload.manufactureDateMin ||
            new Date(item.manufactureDate) >=
              new Date(searchPayload.manufactureDateMin)) &&
          (!searchPayload.manufactureDateMax ||
            new Date(item.manufactureDate) <=
              new Date(searchPayload.manufactureDateMax));

        const matchesExpiryDate =
          (!searchPayload.expiryDateMin ||
            new Date(item.expiryDate) >=
              new Date(searchPayload.expiryDateMin)) &&
          (!searchPayload.expiryDateMax ||
            new Date(item.expiryDate) <= new Date(searchPayload.expiryDateMax));

        const matchesSupplier =
          searchPayload.supplier.length === 0 ||
          searchPayload.supplier.includes(item.supplier);

        const matchesPrescription =
          !searchPayload.prescription ||
          item.medicationVariant.isPrescriptionRequired;

        return (
          matchesSearch &&
          matchesStock &&
          matchesPrice &&
          matchesManufactureDate &&
          matchesExpiryDate &&
          matchesSupplier &&
          matchesPrescription
        );
      });

      setMedications(filteredMedications);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <AppLayout>
      {/* Main Layout of Page */}
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Stock Overview</h2>
          <p className="text-muted-foreground mt-1">
            Browse and manage all medicines in stock
          </p>
        </div>
        <Card className="shadow-md rounded-xl border-0">
          <CardContent>
            {/* Advanced Search and Filters */}
            <InventorySearching onSearch={handleSearch} suppliers={suppliers} />

            {/* Medication List */}
            <div className="mt-6">
              {isSearching && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground mt-2">Searching...</p>
                </div>
              )}

              {!isSearching && medications.length > 0 && (
                <div className="space-y-3">
                  {medications.map((medication) => (
                    <Card
                      key={medication.id}
                      className="border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      <CardContent className="flex justify-between items-center flex-wrap gap-3">
                        <div className="flex items-center gap-4">
                          <img
                            src={medication.img_url || MedicinePlaceholder}
                            alt={medication.medicationVariant.name}
                            className="w-20 h-20 rounded-lg object-cover border"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {medication.medicationVariant.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Stock: {medication.quantity}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Price:{" "}
                              {Number(
                                medication.medicationVariant.sellPrice
                              ).toLocaleString("vi-VN")}{" "}
                              VND
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => handleShowDialog("view", medication)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() =>
                              handleShowDialog("adjust", medication)
                            }
                          >
                            <Settings2 className="h-4 w-4 mr-1" />
                            Adjust
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!isSearching && medications.length === 0 && (
                <div className="text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No medications found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search query or filters
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <StockDetailsDialog
        medicationItem={currentMedication}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />

      <AddjustStockDialog
        medication={currentMedication}
        open={showAdjustDialog}
        onOpenChange={setShowAdjustDialog}
        refetchInventory={refetchInventory}
      />

      <AddStockDialog
        medication={currentMedication}
        open={showAddStockDialog}
        onOpenChange={setShowAddStockDialog}
      />
    </AppLayout>
  );
}
