import { AppLayout } from "@/components/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
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
import * as userService from "@/services/userService";
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const STATUS_LABELS = {
  scheduled: { label: "Đã lên lịch", color: "bg-blue-500" },
  confirmed: { label: "Đã xác nhận", color: "bg-green-500" },
  in_progress: { label: "Đang diễn ra", color: "bg-yellow-500" },
  completed: { label: "Hoàn thành", color: "bg-gray-500" },
  cancelled: { label: "Đã hủy", color: "bg-red-500" },
  absent: { label: "Vắng mặt", color: "bg-orange-500" },
};

export default function ShiftAssignmentPage() {
  const [shifts, setShifts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [formData, setFormData] = useState({
    userId: "",
    shiftId: "",
    assignedDate: "",
    notes: "",
  });

  const [batchData, setBatchData] = useState({
    userIds: [],
    shiftId: "",
    startDate: "",
    endDate: "",
    notes: "",
  });

  // Get week range
  const getWeekRange = useCallback((date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  }, []);

  const weekRange = useMemo(
    () => getWeekRange(currentDate),
    [currentDate, getWeekRange]
  );

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const range = getWeekRange(currentDate);
      const startDate = range.start.toISOString().split("T")[0];
      const endDate = range.end.toISOString().split("T")[0];

      const [shiftsRes, staffRes, assignmentsRes] = await Promise.all([
        shiftService.getAllShifts(),
        userService.getAllUsers({ role: "staff" }),
        shiftService.getAllShiftAssignments({ startDate, endDate }),
      ]);

      setShifts(shiftsRes.data || []);
      setStaff(staffRes.data || []);
      setAssignments(assignmentsRes.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [currentDate, getWeekRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleOpenDialog = (batchMode = false) => {
    setIsBatchMode(batchMode);
    setIsDialogOpen(true);
    if (!batchMode) {
      setFormData({
        userId: "",
        shiftId: "",
        assignedDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
    } else {
      setBatchData({
        userIds: [],
        shiftId: "",
        startDate: weekRange.start.toISOString().split("T")[0],
        endDate: weekRange.end.toISOString().split("T")[0],
        notes: "",
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsBatchMode(false);
  };

  const handleSubmitSingle = async (e) => {
    e.preventDefault();

    if (!formData.userId || !formData.shiftId || !formData.assignedDate) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    // Validate: không cho phép assign ca trong quá khứ
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const assignedDate = new Date(formData.assignedDate);
    assignedDate.setHours(0, 0, 0, 0);

    if (assignedDate < today) {
      toast.error("Không thể phân công ca trong quá khứ");
      return;
    }

    setIsSubmitting(true);
    try {
      await shiftService.createShiftAssignment({
        userId: formData.userId,
        shiftId: formData.shiftId,
        assignedDate: formData.assignedDate,
        notes: formData.notes || null,
      });
      toast.success("Đã phân công ca làm việc thành công");
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error("Failed to create assignment:", error);
      toast.error(
        error.response?.data?.message || "Không thể phân công ca làm việc"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitBatch = async (e) => {
    e.preventDefault();

    if (
      !batchData.userIds.length ||
      !batchData.shiftId ||
      !batchData.startDate ||
      !batchData.endDate
    ) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    // Validate: không cho phép assign ca trong quá khứ
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(batchData.startDate);
    startDate.setHours(0, 0, 0, 0);

    if (startDate < today) {
      toast.error(
        "Không thể phân công ca trong quá khứ. Vui lòng chọn ngày từ hôm nay trở đi."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const start = new Date(batchData.startDate);
      const end = new Date(batchData.endDate);
      const assignments = [];

      batchData.userIds.forEach((userId) => {
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          assignments.push({
            userId,
            shiftId: batchData.shiftId,
            assignedDate: d.toISOString().split("T")[0],
            notes: batchData.notes || null,
          });
        }
      });

      await shiftService.createShiftAssignment({ assignments });
      toast.success(
        `Đã phân công thành công ${assignments.length} ca làm việc`
      );
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error("Failed to create batch assignments:", error);
      toast.error(
        error.response?.data?.message || "Không thể phân công ca làm việc"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phân công này?")) return;

    try {
      await shiftService.deleteShiftAssignment(assignmentId);
      toast.success("Đã xóa phân công");
      loadData();
    } catch (error) {
      console.error("Failed to delete assignment:", error);
      toast.error(error.response?.data?.message || "Không thể xóa phân công");
    }
  };

  const toggleUserSelection = (userId) => {
    setBatchData((prev) => ({
      ...prev,
      userIds: prev.userIds.includes(userId)
        ? prev.userIds.filter((id) => id !== userId)
        : [...prev.userIds, userId],
    }));
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Phân công ca làm việc</h1>
            <p className="text-muted-foreground mt-1">
              Phân công ca làm việc cho nhân viên
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleOpenDialog(false)}>
              <Plus className="mr-2 h-4 w-4" />
              Phân công đơn
            </Button>
            <Button onClick={() => handleOpenDialog(true)}>
              <CalendarDays className="mr-2 h-4 w-4" />
              Phân công hàng loạt
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Lịch tuần
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleToday}>
                  Hôm nay
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="ml-4 text-sm font-medium">
                  {weekRange.start.toLocaleDateString("vi-VN")} -{" "}
                  {weekRange.end.toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Không có phân công nào trong tuần này
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const grouped = {};
                  assignments.forEach((item) => {
                    const assignment = item.assignment;
                    const date = assignment.assignedDate.split("T")[0]; // Ensure proper date format
                    if (!grouped[date]) {
                      grouped[date] = [];
                    }
                    grouped[date].push(item);
                  });

                  return Object.entries(grouped)
                    .sort(([a], [b]) => new Date(a) - new Date(b))
                    .map(([date, dayAssignments]) => {
                      // Parse date properly - remove time component
                      const dateObj = new Date(date + "T12:00:00");

                      return (
                        <div key={date} className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-3">
                            {dateObj.toLocaleDateString("vi-VN", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Staff</TableHead>
                                <TableHead>Shift</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead className="text-right">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {dayAssignments.map((item) => {
                                const assignment = item.assignment;
                                const user = item.user;
                                const shift = item.shift;
                                const statusInfo =
                                  STATUS_LABELS[assignment.status] || {};

                                return (
                                  <TableRow key={assignment.id}>
                                    <TableCell>{user?.name || "N/A"}</TableCell>
                                    <TableCell>
                                      {shift?.name || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                      {shift
                                        ? `${shift.startTime} - ${shift.endTime}`
                                        : "-"}
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        className={`${statusInfo.color} text-white`}
                                      >
                                        {statusInfo.label || assignment.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">
                                      {assignment.notes || "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                          handleDelete(assignment.id)
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      );
                    });
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {isBatchMode ? (
            <form onSubmit={handleSubmitBatch}>
              <DialogHeader>
                <DialogTitle>Phân công hàng loạt</DialogTitle>
                <DialogDescription>
                  Chọn nhiều nhân viên và khoảng thời gian
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>
                    Chọn nhân viên <span className="text-red-500">*</span>
                  </Label>
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {staff.map((s) => (
                      <div key={s.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={batchData.userIds.includes(s.id)}
                          onChange={() => toggleUserSelection(s.id)}
                          className="h-4 w-4"
                        />
                        <label className="text-sm">{s.name}</label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Đã chọn: {batchData.userIds.length} nhân viên
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="batch-shift">
                    Ca làm việc <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={batchData.shiftId}
                    onValueChange={(value) =>
                      setBatchData({ ...batchData, shiftId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ca làm việc" />
                    </SelectTrigger>
                    <SelectContent>
                      {shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shift.name} ({shift.startTime} - {shift.endTime})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="batch-start">
                      Từ ngày <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="batch-start"
                      type="date"
                      value={batchData.startDate}
                      onChange={(e) =>
                        setBatchData({
                          ...batchData,
                          startDate: e.target.value,
                        })
                      }
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="batch-end">
                      Đến ngày <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="batch-end"
                      type="date"
                      value={batchData.endDate}
                      onChange={(e) =>
                        setBatchData({ ...batchData, endDate: e.target.value })
                      }
                      min={
                        batchData.startDate ||
                        new Date().toISOString().split("T")[0]
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="batch-notes">Ghi chú</Label>
                  <Textarea
                    id="batch-notes"
                    value={batchData.notes}
                    onChange={(e) =>
                      setBatchData({ ...batchData, notes: e.target.value })
                    }
                    rows={2}
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
                  Phân công
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleSubmitSingle}>
              <DialogHeader>
                <DialogTitle>Phân công đơn</DialogTitle>
                <DialogDescription>
                  Phân công một ca làm việc cho nhân viên
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="userId">
                    Nhân viên <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.userId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, userId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhân viên" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="shiftId">
                    Ca làm việc <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.shiftId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, shiftId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ca làm việc" />
                    </SelectTrigger>
                    <SelectContent>
                      {shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shift.name} ({shift.startTime} - {shift.endTime})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="assignedDate">
                    Ngày <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="assignedDate"
                    type="date"
                    value={formData.assignedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedDate: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={2}
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
                  Phân công
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
