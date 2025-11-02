"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import MedicinePlaceholder from "../../../../assets/medicine-placeholder.jpg";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../components/ui/tooltip";
import { useWarehouse } from "../../../../hooks/useWarehouse";

// Convert number to column letter (1 = A, 2 = B, ..., 27 = AA, 28 = AB, ...)
function numberToColumn(num) {
  let result = "";
  while (num > 0) {
    const remainder = (num - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    num = Math.floor((num - 1) / 26);
  }
  return result;
}

export function BinCard({ bin, level, number, rackId, refetch }) {
  const { updateBinData, deleteBinData } = useWarehouse();
  const [showBinDetails, setShowBinDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: bin?.code || "",
    name: bin?.name || "",
    level: bin?.level || level || "",
    number: bin?.number || number || "",
    description: bin?.description || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateBinData(bin.id, formData);
      setShowEditDialog(false);
      if (refetch) refetch();
    } catch (error) {
      console.error("Failed to update bin:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteBinData(bin.id, rackId);
      setShowDeleteDialog(false);
      setShowEditDialog(false);
      if (refetch) refetch();
    } catch (error) {
      console.error("Failed to delete bin:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const position = `${level}${numberToColumn(number)}`;
  const isEmpty = !bin;
  const hasInventory = bin?.inventoryEntries && bin.inventoryEntries.length > 0;
  const inventoryItem = hasInventory ? bin.inventoryEntries[0] : null;

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Empty cell (no bin)
  if (isEmpty) {
    return (
      <div className="w-16 h-16 flex items-center justify-center border-2 border-dashed border-gray-300 rounded bg-gray-50 text-xs text-gray-400">
        {position}
      </div>
    );
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setShowEditDialog(true)}
              className={`w-16 h-16 flex flex-col items-center justify-center border-2 rounded transition-all hover:shadow-md hover:scale-105 ${
                hasInventory
                  ? "bg-green-100 border-green-500 hover:bg-green-200"
                  : "bg-blue-100 border-blue-500 hover:bg-blue-200"
              }`}
            >
              <span className="text-xs font-bold">{position}</span>
              <span className="text-[10px] text-gray-600 truncate max-w-full px-1">
                {bin.code}
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <div>
                <p className="font-semibold">{bin.name}</p>
                <p className="text-xs">Code: {bin.code}</p>
                <p className="text-xs">
                  Position: Level {bin.level}, {numberToColumn(bin.number)}
                </p>
                {bin.description && (
                  <p className="text-xs text-gray-500">{bin.description}</p>
                )}
              </div>
              {hasInventory && inventoryItem && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-1">Inventory Details</p>
                  <div className="text-xs space-y-0.5">
                    <p>
                      <span className="font-medium">Batch:</span>{" "}
                      {inventoryItem.batchNumber}
                    </p>
                    <p>
                      <span className="font-medium">Qty:</span>{" "}
                      {inventoryItem.quantity} (Reserved:{" "}
                      {inventoryItem.quantityReserved})
                    </p>
                    <p>
                      <span className="font-medium">MFG Date:</span>{" "}
                      {formatDate(inventoryItem.manufactureDate)}
                    </p>
                    <p>
                      <span className="font-medium">EXP Date:</span>{" "}
                      {formatDate(inventoryItem.expiryDate)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Bin Details Dialog */}
      <Dialog open={showBinDetails} onOpenChange={setShowBinDetails}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Bin Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-start gap-6">
              <img
                src={
                  bin?.medication?.medicationVariant?.img_url ||
                  MedicinePlaceholder ||
                  "/placeholder.svg"
                }
                alt={bin?.name}
                className="w-32 h-32 rounded-lg object-cover border"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">
                  {bin?.name || "N/A"}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Code</Label>
                <p className="text-lg font-semibold capitalize">
                  {bin?.code || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Storage Area</Label>
                <p className="text-lg font-semibold">
                  {bin?.rack?.zone?.name || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Rack</Label>
                <p className="text-lg font-semibold">
                  {bin?.rack?.name || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Level</Label>
                <p className="text-lg font-semibold">{bin?.level || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Number</Label>
                <p className="text-lg font-semibold">{bin?.number || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Medication</Label>
                <p className="text-lg font-semibold capitalize">
                  {bin?.medicationVariant?.name || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Stock</Label>
                <p className="text-lg font-semibold capitalize">
                  {bin?.medicationVariant?.quantity
                    ? `${bin?.medicationVariant?.quantity} ${bin?.medicationVariant?.unit}`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBinDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bin Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Bin - {position}</DialogTitle>
            <DialogDescription>
              Update the bin information below
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Bin Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="code">Bin Code</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="level">Level (Row)</Label>
                <Input
                  id="level"
                  name="level"
                  type="number"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="number">Number (Column)</Label>
                <Input
                  id="number"
                  name="number"
                  type="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  required
                  disabled
                />
              </div>
            </div>

            <div>
              <Label className="mb-2" htmlFor="description">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            {hasInventory && inventoryItem && (
              <div className="border-t pt-4 space-y-3">
                <Label className="text-sm font-semibold">
                  Inventory Information
                </Label>

                <div>
                  <Label htmlFor="batchNumber" className="text-xs">
                    Batch Number
                  </Label>
                  <Input
                    id="batchNumber"
                    value={inventoryItem.batchNumber || ""}
                    disabled
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="quantity" className="text-xs">
                      Quantity
                    </Label>
                    <Input
                      id="quantity"
                      value={inventoryItem.quantity || ""}
                      disabled
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantityReserved" className="text-xs">
                      Reserved
                    </Label>
                    <Input
                      id="quantityReserved"
                      value={inventoryItem.quantityReserved || ""}
                      disabled
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="manufactureDate" className="text-xs">
                      Manufacture Date
                    </Label>
                    <Input
                      id="manufactureDate"
                      value={formatDate(inventoryItem.manufactureDate)}
                      disabled
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate" className="text-xs">
                      Expiry Date
                    </Label>
                    <Input
                      id="expiryDate"
                      value={formatDate(inventoryItem.expiryDate)}
                      disabled
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isSubmitting}
                className="sm:mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Bin
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bin {bin.name}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {bin.name} at position {position}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
