"use client";

import MedicinePlaceholder from "@/assets/medicine-placeholder.jpg";
import { AppLayout } from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/hooks/useInventory";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Eye, Plus, Search, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import AddStockDialog from "./components/AddStockDialog";
import AddjustStockDialog from "./components/AdjustStockDialog";
import StockDetailsDialog from "./components/StockDetailsDialog";

export default function StockOverviewPage() {
  const { inventory, refetchInventory } = useInventory();
  const [medications, setMedications] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [currentMedication, setCurrentMedication] = useState({});
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [showAddStockDialog, setShowAddStockDialog] = useState(false);

  useEffect(() => {
    setMedications(inventory);
  }, [inventory]);

  // Handle search debounce (300ms)
  useEffect(() => {
    let timerId = null;
    if (searchValue.length === 0) {
      setMedications(inventory);
    } else {
      timerId = setTimeout(() => {
        const searchedMedications = inventory.filter((item) => {
          return item.medicationVariant.name
            .toLowerCase()
            .includes(searchValue.toLowerCase());
        });

        console.log(searchedMedications);
        setMedications(searchedMedications);
      }, 300);
    }
    return () => clearTimeout(timerId);
  }, [searchValue]);

  // Handle show dialogs
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
            <div className="mb-6 flex items-center justify-between">
              <div className="relative w-2/3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search medicines by name..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => handleShowDialog("add")}
              >
                <Plus className="h-4 w-4" />
                Add Stock
              </Button>
            </div>

            <div>
              {medications.map((medication) => (
                <Card
                  key={medication.id}
                  className="border shadow-sm hover:shadow-md transition-shadow mb-3 overflow-hidden"
                >
                  <CardContent className="flex justify-between items-center flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                      <img
                        src={MedicinePlaceholder}
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
                        onClick={() => handleShowDialog("adjust", medication)}
                      >
                        <Settings2 className="h-4 w-4 mr-1" />
                        Adjust
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {inventory.length === 0 && (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No medications found
                </h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search query
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
