import { ChevronDown, ChevronUp, Edit2, Plus, Trash2 } from "lucide-react";
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

export function RackItem({
  rack,
  isExpanded,
  onToggle,
  selectedZoneId,
  refetch,
}) {
  const { updateRackData, deleteRackData, createBinData } = useWarehouse();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddBinDialog, setShowAddBinDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: rack.code || "",
    name: rack.name || "",
    description: rack.description || "",
  });
  const [createBinForm, setCreateBinForm] = useState({
    binCode: "",
    binName: "",
    level: "",
    number: "",
    description: "",
  });

  useEffect(() => {
    setFormData({
      code: rack.code || "",
      name: rack.name || "",
      description: rack.description || "",
    });
    setCreateBinForm({
      binCode: "",
      binName: "",
      level: "",
      number: "",
      description: "",
    });
  }, [rack]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditRackForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBinInputChange = (e) => {
    const { name, value } = e.target;
    setCreateBinForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditRackSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateRackData(rack.id, formData);
      setShowEditDialog(false);
      if (refetch) refetch();
    } catch (error) {
      console.error("Failed to update rack:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRack = async () => {
    setIsSubmitting(true);
    try {
      await deleteRackData(selectedZoneId, rack.id);
      setShowDeleteDialog(false);
      if (refetch) refetch();
    } catch (error) {
      console.error("Failed to delete rack:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBinSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields
    if (
      !createBinForm.binCode ||
      !createBinForm.binName ||
      createBinForm.level === "" ||
      createBinForm.number === ""
    ) {
      console.error("All fields are required");
      return;
    }

    // Validate that level and number are numeric
    if (isNaN(createBinForm.level) || isNaN(createBinForm.number)) {
      console.error("Level and number must be numeric values");
      return;
    }

    setIsSubmitting(true);
    try {
      await createBinData(rack.id, {
        code: createBinForm.binCode,
        name: createBinForm.binName,
        level: Number.parseInt(createBinForm.level),
        number: Number.parseInt(createBinForm.number),
        description: createBinForm.description,
      });
      setShowAddBinDialog(false);
      setCreateBinForm({
        binCode: "",
        binName: "",
        level: "",
        number: "",
        description: "",
      });
      if (refetch) refetch();
    } catch (error) {
      console.error("Failed to create bin:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rackBins = rack.bins || [];

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
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddBinDialog(true)}
              >
                <Plus className="h-4 w-4" />
                Thêm ô
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit2 className="h-4 w-4" />
                Sửa giá
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Xóa giá
              </Button>
            </div>
          </div>
          {rack.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {rack.description}
            </p>
          )}
        </CardHeader>

        {isExpanded && (
          <CardContent>
            <BinGrid
              rackId={rack.id}
              bins={rack.bins}
              rack={rack}
              refetch={refetch}
            />
          </CardContent>
        )}
      </Card>

      {/* Add Bin Dialog */}
      <Dialog open={showAddBinDialog} onOpenChange={setShowAddBinDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm ô mới</DialogTitle>
            <DialogDescription>Tạo ô mới trong giá này</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddBinSubmit} className="space-y-4">
            <div>
              <Label className="mb-2" htmlFor="binName">
                Tên ô *
              </Label>
              <Input
                id="binName"
                name="binName"
                value={createBinForm.binName}
                onChange={handleBinInputChange}
                required
              />
            </div>

            <div>
              <Label className="mb-2" htmlFor="binCode">
                Mã ô *
              </Label>
              <Input
                id="binCode"
                name="binCode"
                value={createBinForm.binCode}
                onChange={handleBinInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2" htmlFor="level">
                  Tầng *
                </Label>
                <Input
                  id="level"
                  name="level"
                  type="number"
                  value={createBinForm.level}
                  onChange={handleBinInputChange}
                  required
                />
              </div>

              <div>
                <Label className="mb-2" htmlFor="number">
                  Cột *
                </Label>
                <Input
                  id="number"
                  name="number"
                  type="number"
                  value={createBinForm.number}
                  onChange={handleBinInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label className="mb-2" htmlFor="binDescription">
                Mô tả
              </Label>
              <Textarea
                id="binDescription"
                name="description"
                value={createBinForm.description}
                onChange={handleBinInputChange}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddBinDialog(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang tạo..." : "Tạo ô"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Rack Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sửa giá</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin giá bên dưới
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditRackSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Tên giá</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="code">Mã giá</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, code: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
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

      {/* Delete Rack Warning */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa giá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa giá này? Hành động này không thể khôi phục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRack}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
