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
    { value: "morning", label: "Morning" },
    { value: "afternoon", label: "Afternoon" },
    { value: "night", label: "Night" },
    { value: "full_day", label: "Full Day" },
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
            toast.error("Failed to load shifts");
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
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingShift) {
                await shiftService.updateShift(editingShift.id, formData);
                toast.success("Shift updated successfully");
            } else {
                await shiftService.createShift(formData);
                toast.success("Shift created successfully");
            }
            handleCloseDialog();
            loadShifts();
        } catch (error) {
            console.error("Failed to save shift:", error);
            toast.error(error.response?.data?.message || "Failed to save shift");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (shiftId) => {
        if (!confirm("Are you sure you want to delete this shift?")) return;

        try {
            await shiftService.deleteShift(shiftId);
            toast.success("Shift deleted");
            loadShifts();
        } catch (error) {
            console.error("Failed to delete shift:", error);
            toast.error(error.response?.data?.message || "Failed to delete shift");
        }
    };

    return (
        <AppLayout>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Shift Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Create and manage work shifts for employees
                        </p>
                    </div>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Shift
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Shift List
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : shifts.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No shifts yet. Click "Create Shift" to get started.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Start Time</TableHead>
                                        <TableHead>End Time</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
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
                                {editingShift ? "Edit Shift" : "Create New Shift"}
                            </DialogTitle>
                            <DialogDescription>Enter shift information</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    Shift Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="e.g. Morning Shift Mon-Fri"
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="shiftType">
                                    Shift Type <span className="text-red-500">*</span>
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
                                        Start Time <span className="text-red-500">*</span>
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
                                        End Time <span className="text-red-500">*</span>
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
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    placeholder="Additional notes..."
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
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {editingShift ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
