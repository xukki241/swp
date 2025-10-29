"use client";

import { ChevronDown, ChevronUp, Edit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
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
import { BinGrid } from "./BinGrid";

export function RackItem({ rack, isExpanded, onToggle }) {
  const { updateRackData } = useWarehouse();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rackCode: rack.code || "",
    rackName: rack.name || "",
    description: rack.description || "",
  });

  useEffect(() => {
    setFormData({
      rackCode: rack.code || "",
      rackName: rack.name || "",
      description: rack.description || "",
    });
  }, [rack]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateRackData(rack.id, formData);
      setShowEditDialog(false);
    } catch (error) {
      console.error("Failed to update rack:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="shadow-sm rounded-lg border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={onToggle}
                className="p-0 h-auto"
              >
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </Button>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{rack.name}</h3>
                <p className="text-sm text-muted-foreground">{rack.code}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowEditDialog(true)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
          {rack.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {rack.description}
            </p>
          )}
        </CardHeader>

        {isExpanded && (
          <CardContent>
            <BinGrid rackId={rack.id} bins={rack.bins} />
          </CardContent>
        )}
      </Card>

      {/* Edit Rack Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Rack</DialogTitle>
            <DialogDescription>
              Update the rack information below
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="rackCode">Rack Code</Label>
              <Input
                id="rackCode"
                name="rackCode"
                value={formData.rackCode}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="rackName">Rack Name</Label>
              <Input
                id="rackName"
                name="rackName"
                value={formData.rackName}
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
