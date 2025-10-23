import { AppLayout } from "@/components/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as shiftService from "@/services/shiftService";
import {
    Calendar,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    LogIn,
    LogOut,
    Loader2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const STATUS_LABELS = {
    scheduled: { label: "Scheduled", color: "bg-blue-500" },
    confirmed: { label: "Confirmed", color: "bg-green-500" },
    in_progress: { label: "In Progress", color: "bg-yellow-500" },
    completed: { label: "Completed", color: "bg-gray-500" },
    cancelled: { label: "Cancelled", color: "bg-red-500" },
    absent: { label: "Absent", color: "bg-orange-500" },
};

export default function MySchedulePage() {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    const getWeekRange = useCallback((date) => {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay() + 1);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return { start, end };
    }, []);

    const weekRange = useMemo(() => getWeekRange(currentDate), [currentDate, getWeekRange]);

    const getUserId = () => {
        const userInfo = localStorage.getItem("user"); // Fixed: key is "user" not "userInfo"
        if (userInfo) {
            const parsed = JSON.parse(userInfo);
            return parsed.id;
        }
        return null;
    };

    const loadSchedule = useCallback(async () => {
        const userId = getUserId();
        if (!userId) {
            toast.error("User not found");
            return;
        }

        try {
            setLoading(true);
            const range = getWeekRange(currentDate);
            const startDate = range.start.toISOString().split("T")[0];
            const endDate = range.end.toISOString().split("T")[0];

            const response = await shiftService.getUserSchedule(userId, startDate, endDate);
            setSchedule(response.data || []);
        } catch (error) {
            console.error("Failed to load schedule:", error);
            toast.error("Failed to load schedule");
        } finally {
            setLoading(false);
        }
    }, [currentDate, getWeekRange]);

    useEffect(() => {
        loadSchedule();
    }, [loadSchedule]);

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

    const handleCheckIn = async (assignmentId) => {
        setProcessingId(assignmentId);
        try {
            await shiftService.checkInShift(assignmentId);
            toast.success("Checked in successfully");
            loadSchedule();
        } catch (error) {
            console.error("Failed to check in:", error);
            toast.error(error.response?.data?.message || "Failed to check in");
        } finally {
            setProcessingId(null);
        }
    };

    const handleCheckOut = async (assignmentId) => {
        setProcessingId(assignmentId);
        try {
            await shiftService.checkOutShift(assignmentId);
            toast.success("Checked out successfully");
            loadSchedule();
        } catch (error) {
            console.error("Failed to check out:", error);
            toast.error(error.response?.data?.message || "Failed to check out");
        } finally {
            setProcessingId(null);
        }
    };

    const canCheckIn = (item) => {
        const assignment = item.assignment;
        if (assignment.status !== "scheduled" && assignment.status !== "confirmed") return false;
        const today = new Date().toISOString().split("T")[0];
        const assignedDate = assignment.assignedDate.split('T')[0];
        return assignedDate === today;
    };

    const canCheckOut = (item) => {
        const assignment = item.assignment;
        return assignment.status === "in_progress";
    };

    const groupedSchedule = schedule.reduce((acc, item) => {
        const assignment = item.assignment;
        const dateStr = assignment.assignedDate.split('T')[0];
        if (!acc[dateStr]) {
            acc[dateStr] = [];
        }
        acc[dateStr].push(item);
        return acc;
    }, {});

    const weekDays = [];
    for (let d = new Date(weekRange.start); d <= weekRange.end; d.setDate(d.getDate() + 1)) {
        weekDays.push(new Date(d));
    }

    return (
        <AppLayout>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">My Schedule</h1>
                        <p className="text-muted-foreground mt-1">
                            View your work schedule and check-in/out
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Work Week
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={handlePrevWeek}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleToday}>
                                    Today
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleNextWeek}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <span className="ml-4 text-sm font-medium">
                                    {weekRange.start.toLocaleDateString("en-US")} -{" "}
                                    {weekRange.end.toLocaleDateString("en-US")}
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {weekDays.map((date) => {
                                    const dateStr = date.toISOString().split("T")[0];
                                    const dayAssignments = groupedSchedule[dateStr] || [];
                                    const isToday = dateStr === new Date().toISOString().split("T")[0];

                                    return (
                                        <Card key={dateStr} className={isToday ? "border-blue-500 border-2" : ""}>
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-semibold flex items-center gap-2">
                                                        {date.toLocaleDateString("en-US", {
                                                            weekday: "long",
                                                            day: "numeric",
                                                            month: "long",
                                                        })}
                                                        {isToday && <Badge className="bg-blue-500">Today</Badge>}
                                                    </h3>
                                                    {dayAssignments.length > 0 && (
                                                        <Badge variant="outline">{dayAssignments.length} shift(s)</Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {dayAssignments.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground">No shifts</p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {dayAssignments.map((item) => {
                                                            const assignment = item.assignment;
                                                            const shift = item.shift || {};
                                                            const statusInfo = STATUS_LABELS[assignment.status] || {};

                                                            return (
                                                                <div key={assignment.id} className="border rounded-lg p-4 space-y-3">
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="space-y-1">
                                                                            <h4 className="font-medium">{shift.name}</h4>
                                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                                <Clock className="h-4 w-4" />
                                                                                {shift.startTime} - {shift.endTime}
                                                                            </div>
                                                                            {assignment.notes && (
                                                                                <p className="text-sm text-muted-foreground">{assignment.notes}</p>
                                                                            )}
                                                                        </div>
                                                                        <Badge className={`${statusInfo.color} text-white`}>
                                                                            {statusInfo.label || assignment.status}
                                                                        </Badge>
                                                                    </div>

                                                                    {assignment.checkInTime && (
                                                                        <div className="flex items-center gap-2 text-sm">
                                                                            <LogIn className="h-4 w-4 text-green-500" />
                                                                            <span>Check-in: {new Date(assignment.checkInTime).toLocaleTimeString()}</span>
                                                                        </div>
                                                                    )}

                                                                    {assignment.checkOutTime && (
                                                                        <div className="flex items-center gap-2 text-sm">
                                                                            <LogOut className="h-4 w-4 text-red-500" />
                                                                            <span>Check-out: {new Date(assignment.checkOutTime).toLocaleTimeString()}</span>
                                                                        </div>
                                                                    )}

                                                                    <div className="flex gap-2 pt-2">
                                                                        {canCheckIn(item) && (
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={() => handleCheckIn(assignment.id)}
                                                                                disabled={processingId === assignment.id}
                                                                            >
                                                                                {processingId === assignment.id ? (
                                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                                ) : (
                                                                                    <LogIn className="mr-2 h-4 w-4" />
                                                                                )}
                                                                                Check-in
                                                                            </Button>
                                                                        )}
                                                                        {canCheckOut(item) && (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => handleCheckOut(assignment.id)}
                                                                                disabled={processingId === assignment.id}
                                                                            >
                                                                                {processingId === assignment.id ? (
                                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                                ) : (
                                                                                    <LogOut className="mr-2 h-4 w-4" />
                                                                                )}
                                                                                Check-out
                                                                            </Button>
                                                                        )}
                                                                        {assignment.status === "completed" && (
                                                                            <div className="flex items-center gap-2 text-sm text-green-600">
                                                                                <CheckCircle className="h-4 w-4" />
                                                                                Shift completed
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
