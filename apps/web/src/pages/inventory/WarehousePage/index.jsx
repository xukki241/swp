import { AppLayout } from "@/components/layouts/app-layout";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Skeleton } from "../../../components/ui/skeleton";
import { Textarea } from "../../../components/ui/textarea";
import { useWarehouse } from "../../../hooks/useWarehouse";
import { RackList } from "./components/RackList";
import ZoneDetailsCard from "./components/ZoneDetails";

export default function WarehousePage() {
  const {
    zones,
    selectZone,
    selectedZone,
    racks,
    loading,
    refetchZone,
    createZoneData,
  } = useWarehouse();
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [showAddZoneDialog, setShowAddZoneDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    zoneCode: "",
    zoneName: "",
    zoneType: "",
    location: "",
    description: "",
  });

  function handleZoneChange(zoneId) {
    setSelectedZoneId(zoneId);
  }

  useEffect(() => {
    if (selectedZoneId) {
      selectZone(selectedZoneId);
    }
  }, [selectedZoneId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddZoneSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (
      !formData.zoneCode ||
      !formData.zoneName ||
      !formData.zoneType ||
      !formData.location
    ) {
      toast.error("All fields are required"); // Use toast here
      return;
    }

    setIsSubmitting(true);
    try {
      await createZoneData({
        code: formData.zoneCode,
        name: formData.zoneName,
        type: formData.zoneType,
        location: formData.location,
        description: formData.description,
      });
      setShowAddZoneDialog(false);
      setFormData({
        zoneCode: "",
        zoneName: "",
        zoneType: "",
        location: "",
        description: "",
      });
    } catch (error) {
      console.error("Failed to create zone:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Warehouse Management
          </h2>
          <p className="text-muted-foreground mt-1">
            View and manage warehouse zones, racks, and bins
          </p>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Zone Selection */}
          <Card className="shadow-md rounded-xl border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Select Zone
              </CardTitle>
              <Button size="sm" onClick={() => setShowAddZoneDialog(true)}>
                <Plus className="h-4 w-4" />
                Add Zone
              </Button>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedZoneId || ""}
                onValueChange={handleZoneChange}
              >
                <SelectTrigger className="w-full md:w-90">
                  <SelectValue placeholder="Choose a zone..." />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name} ({zone.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Zone Details and Racks */}
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          )}

          {selectedZone ? (
            <div className="space-y-6">
              <ZoneDetailsCard
                zone={selectedZone}
                refetch={() => refetchZone(selectedZoneId)}
              />
              <RackList
                racks={racks}
                selectedZoneId={selectedZoneId}
                refetch={() => refetchZone(selectedZoneId)}
              />
            </div>
          ) : (
            <Card className="shadow-md rounded-xl border-0">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Select a zone to view its details and racks
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showAddZoneDialog} onOpenChange={setShowAddZoneDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Zone</DialogTitle>
            <DialogDescription>Create a new warehouse zone</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddZoneSubmit} className="space-y-4">
            <div>
              <Label className="mb-2" htmlFor="zoneName">
                Zone Name *
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
                Zone Code *
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
                Zone Type *
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
                Location *
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
                onClick={() => setShowAddZoneDialog(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Zone"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
