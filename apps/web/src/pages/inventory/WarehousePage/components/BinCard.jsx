"use client";

import { truncateWords } from "@/lib/utils";
import { Edit2, Eye, Trash2 } from "lucide-react";
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
import { Card, CardContent } from "../../../../components/ui/card";
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
import { useWarehouse } from "../../../../hooks/useWarehouse";

export function BinCard({ bin, rackId, refetch }) {
  const { updateBinData, deleteBinData } = useWarehouse();
  const [showBinDetails, setShowBinDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    binCode: bin.code || "",
    binName: bin.name || "",
    binLevel: bin.level || "",
    binNumber: bin.number || "",
    description: bin.description || "",
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
      refetch();
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
      refetch();
    } catch (error) {
      console.error("Failed to delete bin:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="shadow-sm rounded-lg border hover:shadow-md transition-shadow overflow-hidden group pt-0 max-w-60">
        <CardContent className="p-0">
          {/* Bin Image */}
          <div className="relative h-50 bg-gray-100 overflow-hidden">
            <img
              src={bin?.medication?.img_url || MedicinePlaceholder}
              alt={bin.name}
              className="w-full h-full object-cover"
            />
            {/* Action Buttons - Show on Hover */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="xs"
                variant="outline"
                onClick={() => setShowBinDetails(true)}
                className="rounded-full p-2 h-auto"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() => setShowEditDialog(true)}
                className="rounded-full p-2 h-auto"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="rounded-full p-2 h-auto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bin Info */}
          <div className="p-3">
            <h4 className="font-semibold text-sm text-gray-900">
              {truncateWords(bin.name, 10)}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Code: {bin.code}
            </p>
            <p className="text-xs text-muted-foreground">
              Position: Level {bin.level}, Bin {bin.number}
            </p>
          </div>
        </CardContent>
      </Card>

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
            <DialogTitle>Edit Bin</DialogTitle>
            <DialogDescription>
              Update the bin information below
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label className="mb-2" htmlFor="binName">
                Bin Name
              </Label>
              <Input
                id="binName"
                name="binName"
                value={formData.binName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label className="mb-2" htmlFor="binCode">
                Bin Code
              </Label>
              <Input
                id="binCode"
                name="binCode"
                value={formData.binCode}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-2" htmlFor="binLevel">
                  Level
                </Label>
                <Input
                  id="binLevel"
                  name="binLevel"
                  type="number"
                  value={formData.binLevel}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="binNumber">
                  Bin Number
                </Label>
                <Input
                  id="binNumber"
                  name="binNumber"
                  type="number"
                  value={formData.binNumber}
                  onChange={handleInputChange}
                  required
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

            <DialogFooter>
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
              Are you sure you want to delete {bin.binName}? This action cannot
              be undone.
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
