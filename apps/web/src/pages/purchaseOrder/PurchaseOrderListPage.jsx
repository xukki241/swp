import { AppLayout } from "@/components/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import {
  useDeletePurchaseOrder,
  usePurchaseOrders,
  useUpdatePurchaseOrderStatus,
} from "@/hooks/usePurchaseOrders";
import {
  ArrowUpDown,
  Calendar,
  Edit,
  Eye,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function PurchaseOrderListPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // desc = newest first, asc = oldest first
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editStatusOpen, setEditStatusOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  // Build filters for API
  const filters = useMemo(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (statusFilter !== "all") params.status = statusFilter;
    params.sortOrder = sortOrder;
    return params;
  }, [searchQuery, statusFilter, sortOrder]);

  const { data: purchaseOrders = [], isLoading } = usePurchaseOrders(filters);
  const { mutate: deletePurchaseOrder } = useDeletePurchaseOrder();
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdatePurchaseOrderStatus();

  const handleDelete = (id) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const handleEditStatus = (order) => {
    setSelectedId(order.id);
    setSelectedStatus(order.status);
    setEditStatusOpen(true);
  };

  const confirmDelete = () => {
    deletePurchaseOrder(selectedId, {
      onSuccess: () => {
        toast.success("Đã xóa đơn đặt hàng thành công!");
      },
      onError: (error) => {
        toast.error("Không thể xóa đơn hàng!", {
          description: error?.response?.data?.error || error.message,
        });
      },
    });
    setConfirmOpen(false);
  };

  const confirmUpdateStatus = () => {
    updateStatus(
      { id: selectedId, status: selectedStatus },
      {
        onSuccess: () => {
          toast.success("Đã cập nhật trạng thái thành công!");
          setEditStatusOpen(false);
        },
        onError: (error) => {
          toast.error("Không thể cập nhật trạng thái!", {
            description: error?.response?.data?.error || error.message,
          });
        },
      }
    );
  };

  const getStatusBadge = (status) => {
    const colorMap = {
      pending: "bg-yellow-100 text-yellow-700",
      received: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return (
      <Badge
        variant="secondary"
        className={colorMap[status] || "bg-gray-100 text-gray-700"}
      >
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <Card className="shadow-md border-0">
          <CardContent className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Đơn đặt hàng</h1>
            <p className="text-muted-foreground">
              Quản lý tất cả đơn đặt hàng từ nhà cung cấp
            </p>
          </div>
          <Button
            onClick={() => navigate("/purchase-orders/create")}
            className="flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Tạo đơn mới
          </Button>
        </div>

        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Danh sách đơn đặt hàng</CardTitle>
            <CardDescription>
              Tìm kiếm, xem hoặc quản lý tất cả đơn đặt hàng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchQuery(searchInput);
              }}
              className="mb-6 space-y-4"
            >
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm theo nhà cung cấp hoặc trạng thái..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <Button type="submit" className="h-11">
                  <Search className="h-4 w-4 mr-2" /> Tìm kiếm
                </Button>
                {searchQuery && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => {
                      setSearchInput("");
                      setSearchQuery("");
                    }}
                  >
                    Xóa
                  </Button>
                )}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px] h-11">
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="ordered">Đã đặt hàng</SelectItem>
                    <SelectItem value="received">Đã nhận</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort by Date */}
              <div className="flex items-center gap-2">
                <Label htmlFor="sortOrder" className="text-sm font-medium">
                  Sắp xếp theo ngày đặt:
                </Label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger id="sortOrder" className="w-[200px] h-10">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Thứ tự sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Mới nhất trước</SelectItem>
                    <SelectItem value="asc">Cũ nhất trước</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nhà cung cấp</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày đặt</TableHead>
                    <TableHead>Ngày dự kiến</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-10 w-10 text-muted-foreground/50" />
                          <p className="font-medium">
                            Không tìm thấy đơn đặt hàng
                          </p>
                          <p className="text-sm">
                            {searchQuery || statusFilter !== "all"
                              ? "Thử điều chỉnh bộ lọc của bạn"
                              : "Bắt đầu bằng cách tạo đơn đầu tiên"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    purchaseOrders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell>{o.supplierName || o.supplierId}</TableCell>
                        <TableCell>{getStatusBadge(o.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(o.orderDate).toLocaleDateString("vi-VN")}
                          </div>
                        </TableCell>
                        <TableCell>
                          {o.expectedDate ? (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <Calendar className="w-4 h-4" />
                              {new Date(o.expectedDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Chưa đặt
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {o.totalAmount?.toLocaleString()} ₫
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(`/purchase-orders/${o.id}`)
                              }
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEditStatus(o)}
                              title="Sửa trạng thái"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(o.id)}
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Bạn có chắc chắn muốn xóa đơn đặt hàng này không? Hành động này
            không thể hoàn tác.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editStatusOpen} onOpenChange={setEditStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Chọn trạng thái mới cho đơn đặt hàng này:
            </p>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="ordered">Đã đặt hàng</SelectItem>
                <SelectItem value="received">Đã nhận</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditStatusOpen(false)}
              disabled={isUpdatingStatus}
            >
              Hủy
            </Button>
            <Button
              onClick={confirmUpdateStatus}
              disabled={isUpdatingStatus}
              className="min-w-[100px]"
            >
              {isUpdatingStatus ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
