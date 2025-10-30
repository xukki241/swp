"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { RackItem } from "./RackItem";

export function RackList({ racks, selectedZoneId, refetch }) {
  const { createRackData } = useWarehouse();
  const [expandedRacks, setExpandedRacks] = useState(new Set());
  const [showAddRackDialog, setShowAddRackDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rackCode: "",
    rackName: "",
    description: "",
  });

  const toggleRack = (rackId) => {
    const newExpanded = new Set(expandedRacks);
    if (newExpanded.has(rackId)) {
      newExpanded.delete(rackId);
    } else {
      newExpanded.add(rackId);
    }
    setExpandedRacks(newExpanded);
  };

  const collapseAll = () => {
    setExpandedRacks(new Set());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRackSubmit = async (e) => {
    e.preventDefault();

    if (!formData.rackCode || !formData.rackName) {
      toast.error("Rack code and name are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await createRackData(selectedZoneId, {
        code: formData.rackCode,
        name: formData.rackName,
        description: formData.description,
      });
      setShowAddRackDialog(false);
      setFormData({
        rackCode: "",
        rackName: "",
        description: "",
      });
      refetch();
    } catch (error) {
      console.error("Failed to create rack:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!racks || racks.length === 0) {
    return (
      <Card className="shadow-md rounded-xl border-0">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No racks found in this zone</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Racks</h2>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setShowAddRackDialog(true)}>
            <Plus className="h-4 w-4" />
            Add Rack
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={collapseAll}
            disabled={expandedRacks.size === 0}
          >
            Collapse All
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {racks.map((rack) => (
          <RackItem
            key={rack.id}
            rack={rack}
            isExpanded={expandedRacks.has(rack.id)}
            onToggle={() => toggleRack(rack.id)}
            selectedZoneId={selectedZoneId}
            refetch={refetch}
          />
        ))}
      </div>

      <Dialog open={showAddRackDialog} onOpenChange={setShowAddRackDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Rack</DialogTitle>
            <DialogDescription>
              Create a new rack in this zone
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddRackSubmit} className="space-y-4">
            <div>
              <Label className="mb-2" htmlFor="rackName">
                Rack Name *
              </Label>
              <Input
                id="rackName"
                name="rackName"
                value={formData.rackName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label className="mb-2" htmlFor="rackCode">
                Rack Code *
              </Label>
              <Input
                id="rackCode"
                name="rackCode"
                value={formData.rackCode}
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
                onClick={() => setShowAddRackDialog(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Rack"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
