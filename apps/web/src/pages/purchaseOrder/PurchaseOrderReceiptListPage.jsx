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
  useDeletePurchaseOrderReceipt,
  usePurchaseOrderReceipts,
} from "@/hooks/usePurchaseOrders";
import {
  ArrowUpDown,
  Calendar,
  Eye,
  Package,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function PurchaseOrderReceiptListPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // desc = newest first, asc = oldest first
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Build filters for API
  const filters = useMemo(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    params.sortOrder = sortOrder;
    return params;
  }, [searchQuery, sortOrder]);

  const { data: receipts = [], isLoading } = usePurchaseOrderReceipts(filters);
  const { mutate: deleteReceipt } = useDeletePurchaseOrderReceipt();

  const handleDelete = (id) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteReceipt(selectedId, {
      onSuccess: () => {
        toast.success("Đã xóa phiếu nhập thành công!");
      },
      onError: (error) => {
        toast.error("Không thể xóa phiếu nhập!", {
          description: error?.response?.data?.error || error.message,
        });
      },
    });
    setConfirmOpen(false);
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
        {status?.toUpperCase()}
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
            <h1 className="text-3xl font-bold text-gray-900">
              Phiếu nhập hàng
            </h1>
            <p className="text-muted-foreground">
              Xem tất cả phiếu nhập hàng đã nhận
            </p>
          </div>
          <Button
            onClick={() => navigate("/procurement/purchase-orders")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Package className="w-4 h-4" /> Xem đơn đặt hàng
          </Button>
        </div>

        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Danh sách phiếu nhập</CardTitle>
            <CardDescription>
              Tìm kiếm và quản lý tất cả phiếu nhập hàng
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
                    placeholder="Tìm kiếm theo nhà cung cấp, người nhận hoặc trạng thái..."
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
              </div>

              {/* Sort by Date */}
              <div className="flex items-center gap-2">
                <Label htmlFor="sortOrder" className="text-sm font-medium">
                  Sắp xếp theo ngày nhập:
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
                    <TableHead>Ngày nhập</TableHead>
                    <TableHead>Người nhập</TableHead>
                    <TableHead>Trạng thái đơn</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-10 w-10 text-muted-foreground/50" />
                          <p className="font-medium">
                            Không tìm thấy phiếu nhập
                          </p>
                          <p className="text-sm">
                            {searchQuery
                              ? "Thử điều chỉnh tìm kiếm của bạn"
                              : "Chưa có phiếu nhập nào được ghi nhận"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    receipts.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">
                          {r.supplierName || "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(r.receivedDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{r.receivedByName || "N/A"}</TableCell>
                        <TableCell>{getStatusBadge(r.poStatus)}</TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          {r.totalAmount
                            ? new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(r.totalAmount)
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(`/procurement/receipts/${r.id}`)
                              }
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(r.id)}
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
            Bạn có chắc chắn muốn xóa phiếu nhập này không? Hành động này không
            thể hoàn tác.
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
    </AppLayout>
  );
}
