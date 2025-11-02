import { AppLayout } from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import * as shiftService from "@/services/shiftService";
import { Clock, Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const SHIFT_TYPES = [
  { value: "morning", label: "Sáng" },
  { value: "afternoon", label: "Chiều" },
  { value: "night", label: "Tối" },
  { value: "full_day", label: "Cả ngày" },
];

export default function ShiftManagementPage() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    shiftType: "morning",
    startTime: "",
    endTime: "",
    description: "",
  });

  const loadShifts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await shiftService.getAllShifts();
      setShifts(response.data || []);
    } catch (error) {
      console.error("Failed to load shifts:", error);
      toast.error("Không thể tải danh sách ca làm việc");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const handleOpenDialog = (shift = null) => {
    if (shift) {
      setEditingShift(shift);
      setFormData({
        name: shift.name,
        shiftType: shift.shiftType,
        startTime: shift.startTime,
        endTime: shift.endTime,
        description: shift.description || "",
      });
    } else {
      setEditingShift(null);
      setFormData({
        name: "",
        shiftType: "morning",
        startTime: "",
        endTime: "",
        description: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingShift(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.startTime || !formData.endTime) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingShift) {
        await shiftService.updateShift(editingShift.id, formData);
        toast.success("Đã cập nhật ca làm việc thành công");
      } else {
        await shiftService.createShift(formData);
        toast.success("Đã tạo ca làm việc thành công");
      }
      handleCloseDialog();
      loadShifts();
    } catch (error) {
      console.error("Failed to save shift:", error);
      toast.error(error.response?.data?.message || "Không thể lưu ca làm việc");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (shiftId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ca làm việc này?")) return;

    try {
      await shiftService.deleteShift(shiftId);
      toast.success("Đã xóa ca làm việc");
      loadShifts();
    } catch (error) {
      console.error("Failed to delete shift:", error);
      toast.error(error.response?.data?.message || "Không thể xóa ca làm việc");
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quản lý ca làm việc</h1>
            <p className="text-muted-foreground mt-1">
              Tạo và quản lý ca làm việc cho nhân viên
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo ca làm việc
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Danh sách ca làm việc
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : shifts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có ca làm việc nào. Nhấn "Tạo ca làm việc" để bắt đầu.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Giờ bắt đầu</TableHead>
                    <TableHead>Giờ kết thúc</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts.map((shift) => {
                    const shiftTypeLabel =
                      SHIFT_TYPES.find((t) => t.value === shift.shiftType)
                        ?.label || shift.shiftType;
                    return (
                      <TableRow key={shift.id}>
                        <TableCell className="font-medium">
                          {shift.name}
                        </TableCell>
                        <TableCell>{shiftTypeLabel}</TableCell>
                        <TableCell>{shift.startTime}</TableCell>
                        <TableCell>{shift.endTime}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {shift.description || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(shift)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(shift.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingShift ? "Sửa ca làm việc" : "Tạo ca làm việc mới"}
              </DialogTitle>
              <DialogDescription>Nhập thông tin ca làm việc</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Tên ca làm việc <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="VD: Ca sáng Thứ 2 - Thứ 6"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="shiftType">
                  Loại ca <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.shiftType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, shiftType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">
                    Giờ bắt đầu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">
                    Giờ kết thúc <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Ghi chú thêm..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingShift ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
