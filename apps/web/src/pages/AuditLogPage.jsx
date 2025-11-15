import { AppLayout } from "@/components/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Filter,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

export default function AuditLogPage() {
  const [filters, setFilters] = useState({
    action: "all",
    entity: "all",
    page: 1,
    limit: 50,
    startDate: "",
    endDate: "",
  });

  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const { data, isLoading, refetch, isFetching } = useAuditLogs(filters);

  const auditLogs = data?.data || [];
  const pagination = data?.pagination || {};

  // Action types for filtering
  const actionTypes = [
    { value: "all", label: "Tất cả hành động" },
    { value: "CREATE", label: "Tạo mới" },
    { value: "UPDATE", label: "Cập nhật" },
    { value: "DELETE", label: "Xóa" },
    { value: "LOGIN", label: "Đăng nhập" },
    { value: "LOGOUT", label: "Đăng xuất" },
    { value: "PASSWORD_CHANGE", label: "Đổi mật khẩu" },
    { value: "PASSWORD_RESET", label: "Đặt lại mật khẩu" },
    { value: "VIEW", label: "Xem" },
    { value: "EXPORT", label: "Xuất dữ liệu" },
    { value: "IMPORT", label: "Nhập dữ liệu" },
  ];

  // Entity types for filtering
  const entityTypes = [
    { value: "all", label: "Tất cả đối tượng" },
    { value: "auth", label: "Xác thực" },
    { value: "user", label: "Người dùng" },
    { value: "customer", label: "Khách hàng" },
    { value: "medication", label: "Thuốc" },
    { value: "medication_variant", label: "Biến thể thuốc" },
    { value: "supplier", label: "Nhà cung cấp" },
    { value: "purchase_order", label: "Đơn đặt hàng" },
    { value: "purchase_receipt", label: "Phiếu nhập hàng" },
    { value: "inventory", label: "Kho hàng" },
    { value: "sale", label: "Đơn bán hàng" },
    { value: "warehouse_zone", label: "Khu vực kho" },
    { value: "warehouse_rack", label: "Giá kệ" },
    { value: "warehouse_bin", label: "Ngăn lưu trữ" },
    { value: "report", label: "Báo cáo" },
    { value: "file", label: "Tệp tin" },
  ];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filter changes
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleViewDetail = (log) => {
    setSelectedLog(log);
    setShowDetailDialog(true);
  };

  const getActionBadgeColor = (action) => {
    const colors = {
      CREATE:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      LOGIN:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      LOGOUT: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      PASSWORD_CHANGE:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      PASSWORD_RESET:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      VIEW: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
      EXPORT:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      IMPORT: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    };
    return colors[action] || "bg-gray-100 text-gray-800";
  };

  const getActionLabel = (action) => {
    const labels = {
      CREATE: "Tạo mới",
      UPDATE: "Cập nhật",
      DELETE: "Xóa",
      LOGIN: "Đăng nhập",
      LOGOUT: "Đăng xuất",
      PASSWORD_CHANGE: "Đổi mật khẩu",
      PASSWORD_RESET: "Đặt lại mật khẩu",
      VIEW: "Xem",
      EXPORT: "Xuất dữ liệu",
      IMPORT: "Nhập dữ liệu",
    };
    return labels[action] || action;
  };

  const getEntityLabel = (entity) => {
    const labels = {
      auth: "Xác thực",
      user: "Người dùng",
      customer: "Khách hàng",
      medication: "Thuốc",
      medication_variant: "Biến thể thuốc",
      supplier: "Nhà cung cấp",
      purchase_order: "Đơn đặt hàng",
      purchase_receipt: "Phiếu nhập hàng",
      inventory: "Kho hàng",
      sale: "Đơn bán hàng",
      warehouse_zone: "Khu vực kho",
      warehouse_rack: "Giá kệ",
      warehouse_bin: "Ngăn lưu trữ",
      report: "Báo cáo",
      file: "Tệp tin",
    };
    return labels[entity] || entity;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", {
        locale: vi,
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <AppLayout title="Nhật ký kiểm toán">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Nhật ký kiểm toán</h1>
              <p className="text-sm text-muted-foreground">
                Theo dõi và quản lý lịch sử hoạt động của hệ thống
              </p>
            </div>
          </div>
          <Button
            onClick={() => refetch()}
            disabled={isFetching}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Bộ lọc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="action">Hành động</Label>
                <Select
                  value={filters.action || "all"}
                  onValueChange={(value) => handleFilterChange("action", value)}
                >
                  <SelectTrigger id="action">
                    <SelectValue placeholder="Chọn hành động" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entity">Đối tượng</Label>
                <Select
                  value={filters.entity || "all"}
                  onValueChange={(value) => handleFilterChange("entity", value)}
                >
                  <SelectTrigger id="entity">
                    <SelectValue placeholder="Chọn đối tượng" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Từ ngày</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Đến ngày</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Danh sách nhật ký ({pagination.total || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">Không có nhật ký</h3>
                <p className="text-sm text-muted-foreground">
                  Không tìm thấy nhật ký nào với bộ lọc hiện tại
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Người dùng</TableHead>
                        <TableHead>Hành động</TableHead>
                        <TableHead>Đối tượng</TableHead>
                        <TableHead>Mã đối tượng</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(log.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {log.user ? (
                              <div>
                                <p className="font-medium">
                                  {log.user.firstName} {log.user.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {log.user.email}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                Hệ thống
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getActionBadgeColor(log.action)}>
                              {getActionLabel(log.action)}
                            </Badge>
                          </TableCell>
                          <TableCell>{getEntityLabel(log.entity)}</TableCell>
                          <TableCell>
                            <code className="rounded bg-muted px-2 py-1 text-xs">
                              {log.entityId || "N/A"}
                            </code>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDetail(log)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Chi tiết
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Trang {pagination.currentPage} / {pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                        disabled={!pagination.hasPrevPage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Trước
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                        disabled={!pagination.hasNextPage}
                      >
                        Sau
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết nhật ký kiểm toán</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về hoạt động được ghi lại
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Thời gian
                  </Label>
                  <p className="font-medium">
                    {formatDate(selectedLog.createdAt)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Người dùng
                  </Label>
                  {selectedLog.user ? (
                    <div>
                      <p className="font-medium">
                        {selectedLog.user.firstName} {selectedLog.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedLog.user.email}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Hệ thống</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Hành động
                  </Label>
                  <Badge className={getActionBadgeColor(selectedLog.action)}>
                    {getActionLabel(selectedLog.action)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Đối tượng
                  </Label>
                  <p className="font-medium">
                    {getEntityLabel(selectedLog.entity)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Mã đối tượng
                  </Label>
                  <code className="block rounded bg-muted px-3 py-2 text-sm">
                    {selectedLog.entityId || "N/A"}
                  </code>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Mã nhật ký
                  </Label>
                  <code className="block rounded bg-muted px-3 py-2 text-sm">
                    {selectedLog.id}
                  </code>
                </div>
              </div>

              {selectedLog.changes &&
                Object.keys(selectedLog.changes).length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Thay đổi
                    </Label>
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <div className="space-y-3">
                        {Object.entries(selectedLog.changes).map(
                          ([key, value]) => {
                            // Check if this is a from/to change structure
                            const isFromToChange =
                              typeof value === "object" &&
                              value !== null &&
                              "from" in value &&
                              "to" in value;

                            return (
                              <div key={key} className="space-y-1">
                                <p className="text-sm font-medium text-foreground capitalize">
                                  {key}:
                                </p>
                                <div className="rounded bg-background px-3 py-2 text-sm">
                                  {isFromToChange ? (
                                    <div className="flex items-center gap-2">
                                      <code className="rounded bg-red-100 dark:bg-red-950 px-2 py-1 text-red-700 dark:text-red-300">
                                        {String(value.from || "N/A")}
                                      </code>
                                      <span className="text-muted-foreground">
                                        →
                                      </span>
                                      <code className="rounded bg-green-100 dark:bg-green-950 px-2 py-1 text-green-700 dark:text-green-300">
                                        {String(value.to || "N/A")}
                                      </code>
                                    </div>
                                  ) : typeof value === "object" &&
                                    value !== null ? (
                                    <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words text-xs">
                                      {JSON.stringify(value, null, 2)}
                                    </pre>
                                  ) : (
                                    <p className="break-words">
                                      {String(value)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                )}

              {selectedLog.metadata &&
                Object.keys(selectedLog.metadata).length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Thông tin bổ sung
                    </Label>
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <div className="space-y-3">
                        {Object.entries(selectedLog.metadata).map(
                          ([key, value]) => {
                            // Skip entityData as it can be very large
                            if (key === "entityData") return null;

                            return (
                              <div key={key} className="space-y-1">
                                <p className="text-sm font-medium text-foreground">
                                  {key === "ip"
                                    ? "Địa chỉ IP"
                                    : key === "userAgent"
                                      ? "Trình duyệt"
                                      : key === "requestMethod"
                                        ? "Phương thức"
                                        : key === "requestPath"
                                          ? "Đường dẫn"
                                          : key === "statusCode"
                                            ? "Mã trạng thái"
                                            : key}
                                  :
                                </p>
                                <div className="rounded bg-background px-3 py-2 text-sm">
                                  {typeof value === "object" &&
                                  value !== null ? (
                                    <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words text-xs">
                                      {JSON.stringify(value, null, 2)}
                                    </pre>
                                  ) : (
                                    <p className="break-words">
                                      {String(value)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
