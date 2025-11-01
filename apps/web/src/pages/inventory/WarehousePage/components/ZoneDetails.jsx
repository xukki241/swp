import { Edit2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
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

export default function ZoneDetails({ zone, refetch }) {
  const { updateZoneData, deleteZoneData } = useWarehouse();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    zoneCode: zone.code || "",
    zoneName: zone.name || "",
    zoneType: zone.type || "",
    location: zone.location || "",
    description: zone.description || "",
  });

  useEffect(() => {
    setFormData({
      zoneCode: zone.code || "",
      zoneName: zone.name || "",
      zoneType: zone.type || "",
      location: zone.location || "",
      description: zone.description || "",
    });
  }, [zone]);

  useEffect(() => {
    if (!showDeleteDialog) {
      setDeleteCountdown(3);
      return;
    }

    if (deleteCountdown > 0) {
      const timer = setTimeout(
        () => setDeleteCountdown(deleteCountdown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [showDeleteDialog, deleteCountdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateZoneData(zone.id, formData);
      setShowEditDialog(false);
      refetch();
    } catch (error) {
      console.error("Failed to update zone:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteZone = async () => {
    setIsSubmitting(true);
    try {
      await deleteZoneData(zone.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete zone:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="shadow-md rounded-xl border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Zone Details</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowEditDialog(true)}
            >
              <Edit2 className="h-4 w-4" />
              Edit this Zone
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete this Zone
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-muted-foreground text-sm">Zone Name</Label>
              <p className="text-lg font-semibold mt-1">{zone.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Zone Code</Label>
              <p className="text-lg font-semibold mt-1">{zone.code}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Zone Type</Label>
              <p className="text-lg font-semibold mt-1">{zone.type}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Location</Label>
              <p className="text-lg font-semibold mt-1">{zone.location}</p>
            </div>
            {zone.description && (
              <div className="md:col-span-2">
                <Label className="text-muted-foreground text-sm">
                  Description
                </Label>
                <p className="text-base mt-1">{zone.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Zone Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Zone</DialogTitle>
            <DialogDescription>
              Update the zone information below
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="mb-2" htmlFor="zoneName">
                Zone Name
              </Label>
              <Input
                id="zoneName"
                name="zoneName"
                value={formData.zoneName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label className="mb-2" htmlFor="zoneCode">
                Zone Code
              </Label>
              <Input
                id="zoneCode"
                name="zoneCode"
                value={formData.zoneCode}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label className="mb-2" htmlFor="zoneType">
                Zone Type
              </Label>
              <Input
                id="zoneType"
                name="zoneType"
                value={formData.zoneType}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label className="mb-2" htmlFor="location">
                Location
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Zone</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the zone {zone.name} and
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteZone}
              disabled={isSubmitting || deleteCountdown > 0}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting
                ? "Deleting..."
                : deleteCountdown > 0
                  ? `Delete (${deleteCountdown}s)`
                  : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
