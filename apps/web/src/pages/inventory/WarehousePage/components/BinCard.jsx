"use client";

import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
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
import MedicinePlaceholder from '../../../../assets/medicine-placeholder.jpg'

export function BinCard({ bin, rackId }) {
  const { updateBinData, deleteBinData } = useWarehouse();
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
    } catch (error) {
      console.error("Failed to delete bin:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="shadow-sm rounded-lg border hover:shadow-md transition-shadow overflow-hidden group pt-0">
        <CardContent className="p-0">
          {/* Bin Image */}
          <div className="relative h-50 bg-gray-100 overflow-hidden">
            <img
              src={bin?.medication?.img_url || MedicinePlaceholder}
              alt={bin.name}
              className="w-full h-full object-cover"
            />
            {/* Action Buttons - Show on Hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowEditDialog(true)}
                className="rounded-full p-2 h-auto"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="rounded-full p-2 h-auto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bin Info */}
          <div className="p-3">
            <h4 className="font-semibold text-sm text-gray-900 truncate">
              {bin.name}
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
              <Label htmlFor="binCode">Bin Code</Label>
              <Input
                id="binCode"
                name="binCode"
                value={formData.binCode}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="binName">Bin Name</Label>
              <Input
                id="binName"
                name="binName"
                value={formData.binName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="binLevel">Level</Label>
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
                <Label htmlFor="binNumber">Bin Number</Label>
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
              <Label htmlFor="description">Description</Label>
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
            <AlertDialogTitle>Delete Bin</AlertDialogTitle>
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
