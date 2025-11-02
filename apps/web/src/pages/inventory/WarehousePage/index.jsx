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
import { zoneTypeMap } from "../../../utils/zoneTypeMap";
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
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [showAddZoneDialog, setShowAddZoneDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    zoneCode: "",
    zoneName: "",
    zoneType: "",
    location: "",
    description: "",
  });

  // Debug: Log zones when they change
  useEffect(() => {
    console.info("Zones loaded:", zones);
    console.info("Zones length:", zones?.length);
    console.info("Zones is array:", Array.isArray(zones));
  }, [zones]);

  const handleZoneChange = (zoneId) => {
    console.info("Zone selected:", zoneId);
    setSelectedZoneId(zoneId);
    if (zoneId) {
      selectZone(zoneId);
    }
  };

  // Remove the useEffect since we're calling selectZone directly in handleZoneChange
  // useEffect(() => {
  //   if (selectedZoneId) {
  //     selectZone(selectedZoneId);
  //   }
  // }, [selectedZoneId, selectZone]);

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
          <h2 className="text-3xl font-bold text-gray-900">Quản lý kho</h2>
          <p className="text-muted-foreground mt-1">
            Xem và quản lý khu vực, giá và ô chứa trong kho
          </p>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Zone Selection */}
          <Card className="shadow-md rounded-xl border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Chọn khu vực
              </CardTitle>
              <Button size="sm" onClick={() => setShowAddZoneDialog(true)}>
                <Plus className="h-4 w-4" />
                Add Zone
              </Button>
            </CardHeader>
            <CardContent>
              <Select value={selectedZoneId} onValueChange={handleZoneChange}>
                <SelectTrigger className="w-full md:w-90">
                  <SelectValue placeholder="Chọn khu vực..." />
                </SelectTrigger>
                <SelectContent>
                  {zones && zones.length > 0 ? (
                    zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name} ({zone.code})
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1 text-sm text-muted-foreground">
                      Không có khu vực nào
                    </div>
                  )}
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
                  Chọn khu vực để xem chi tiết và giá
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showAddZoneDialog} onOpenChange={setShowAddZoneDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm khu vực mới</DialogTitle>
            <DialogDescription>Tạo khu vực kho mới</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddZoneSubmit} className="space-y-4">
            <div>
              <Label className="mb-2" htmlFor="zoneName">
                Tên khu vực *
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
                Mã khu vực *
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
                Loại khu vực *
              </Label>
              <Select
                value={formData.zoneType}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, zoneType: val }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn loại khu vực..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(zoneTypeMap).map((key) => (
                    <SelectItem key={key} value={key}>
                      {zoneTypeMap[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2" htmlFor="location">
                Vị trí *
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
                Mô tả
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
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang tạo..." : "Tạo khu vực"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
