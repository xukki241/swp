"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { useWarehouse } from "../../../hooks/useInventory";
import { Edit2 } from "lucide-react";

export default function ZoneDetailsCard({ zone }) {
  const { updateZoneData } = useWarehouse();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    zoneCode: zone.code || "",
    zoneName: zone.name || "",
    zoneType: zone.type || "",
    location: zone.location || "",
    description: zone.description || "",
  });

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
    } catch (error) {
      console.error("Failed to update zone:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="shadow-md rounded-xl border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Zone Details</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowEditDialog(true)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit this Zone
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-muted-foreground text-sm">Zone Code</Label>
              <p className="text-lg font-semibold mt-1">{zone.code}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Zone Name</Label>
              <p className="text-lg font-semibold mt-1">{zone.name}</p>
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
              <Label htmlFor="zoneCode">Zone Code</Label>
              <Input
                id="zoneCode"
                name="zoneCode"
                value={formData.zoneCode}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="zoneName">Zone Name</Label>
              <Input
                id="zoneName"
                name="zoneName"
                value={formData.zoneName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="zoneType">Zone Type</Label>
              <Input
                id="zoneType"
                name="zoneType"
                value={formData.zoneType}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
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
    </>
  );
}
