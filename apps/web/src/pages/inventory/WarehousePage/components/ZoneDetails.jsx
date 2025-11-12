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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Textarea } from "../../../../components/ui/textarea";
import { useWarehouse } from "../../../../hooks/useWarehouse";
import { zoneTypeLabel, zoneTypeMap } from "../../../../utils/zoneTypeMap";

export default function ZoneDetails({ zone, refetch, canEdit }) {
  const { updateZoneData, deleteZoneData } = useWarehouse();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: zone.code || "",
    name: zone.name || "",
    type: zone.type || "",
    location: zone.location || "",
    description: zone.description || "",
  });

  useEffect(() => {
    setFormData({
      code: zone.code || "",
      name: zone.name || "",
      type: zone.type || "",
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

  const handleUpdateZone = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateZoneData(zone.id, formData);
      setShowEditDialog(false);
      refetch();
    } catch (error) {
      console.error("Không thể cập nhật khu:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteZone = async () => {
    setIsSubmitting(true);
    try {
      await deleteZoneData(zone.id);
      setShowDeleteDialog(false);
      refetch();
    } catch (error) {
      console.error("Không thể xóa khu:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="shadow-md rounded-xl border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Chi tiết khu vực
          </CardTitle>
          {canEdit && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit2 className="h-4 w-4" />
                Sửa khu vực
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Xóa khu vực
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-muted-foreground text-sm">
                Tên khu vực
              </Label>
              <p className="text-lg font-semibold mt-1">{zone.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">
                Mã khu vực
              </Label>
              <p className="text-lg font-semibold mt-1">{zone.code}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">
                Loại khu vực
              </Label>
              <p className="text-lg font-semibold mt-1">
                {zoneTypeLabel(zone.type)}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Vị trí</Label>
              <p className="text-lg font-semibold mt-1">{zone.location}</p>
            </div>
            {zone.description && (
              <div className="md:col-span-2">
                <Label className="text-muted-foreground text-sm">Mô tả</Label>
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
            <DialogTitle>Sửa khu vực</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin khu vực bên dưới
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateZone} className="space-y-4">
            <div>
              <Label className="mb-2" htmlFor="name">
                Tên khu vực
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label className="mb-2" htmlFor="code">
                Mã khu vực
              </Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label className="mb-2" htmlFor="zoneType">
                Loại khu vực
              </Label>
              <Select
                value={formData.type}
                onValueChange={(val) => {
                  setFormData((prev) => ({ ...prev, type: val }));
                }}
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
                Vị trí
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
                onClick={() => setShowEditDialog(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert delete zone */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa khu vực</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn khu vực {zone.name} và không thể
              khôi phục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteZone}
              disabled={isSubmitting || deleteCountdown > 0}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting
                ? "Đang xóa..."
                : deleteCountdown > 0
                  ? `Xóa (${deleteCountdown}s)`
                  : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
