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
import { useDeleteSupplier, useSuppliers } from "@/hooks/useSuppliers";
import {
  Ban,
  CheckCircle,
  Eye,
  PlusCircle,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react"; // <-- THAY ĐỔI: Thêm useMemo
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function SupplierListPage() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Build filters for API
  const filters = useMemo(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (statusFilter !== "all") params.status = statusFilter;
    return params;
  }, [searchQuery, statusFilter]);

  const { data: allSuppliers = [], isLoading } = useSuppliers(filters);
  const { mutate: deleteSupplier } = useDeleteSupplier();

  const handleDelete = (id) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteSupplier(selectedId, {
      onSuccess: () => {
        toast.success("Đã xóa nhà cung cấp thành công!", {
          description: "Nhà cung cấp đã được xóa.",
        });
      },
      onError: (error) => {
        toast.error("Không thể xóa nhà cung cấp!", {
          description:
            error?.response?.data?.error ||
            error?.message ||
            "Vui lòng thử lại.",
        });
      },
    });
    setConfirmOpen(false);
    setSelectedId(null);
  };

  function getStatusBadge(status) {
    const variants = {
      active: {
        className: "bg-green-100 text-green-700 hover:bg-green-100",
        icon: CheckCircle,
      },
      inactive: {
        className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
        icon: XCircle,
      },
      blacklisted: {
        className: "bg-red-100 text-red-700 hover:bg-red-100",
        icon: Ban,
      },
    };
    const config = variants[status] || variants.inactive;
    const Icon = config.icon;
    return (
      <Badge variant="secondary" className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý nhà cung cấp
            </h1>
            <p className="text-muted-foreground mt-1">
              Đang tải nhà cung cấp...
            </p>
          </div>
          <Card className="shadow-md rounded-xl border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý nhà cung cấp
            </h1>
            <p className="text-muted-foreground mt-1">
              Quản lý tài khoản và quan hệ nhà cung cấp
            </p>
          </div>
        </div>

        <Card className="shadow-md rounded-xl border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Danh sách nhà cung cấp</CardTitle>
              <CardDescription>
                Xem, tìm kiếm và quản lý thông tin nhà cung cấp
              </CardDescription>
            </div>
            <Button
              onClick={() => navigate("/suppliers/create")}
              className="flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Thêm nhà cung cấp
            </Button>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchQuery(searchInput);
              }}
              className="mb-6 flex flex-col gap-4 md:flex-row"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên, email hoặc số điện thoại..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 h-11 rounded-lg"
                />
              </div>
              <Button
                type="submit"
                className="h-11 bg-primary/90 hover:bg-primary"
              >
                <Search className="h-4 w-4 mr-2" />
                Tìm kiếm
              </Button>
              {searchQuery && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 bg-transparent"
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
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                  <SelectItem value="blacklisted">Danh sách đen</SelectItem>
                </SelectContent>
              </Select>
            </form>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Điện thoại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-10 w-10 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">
                            Không tìm thấy nhà cung cấp
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {searchQuery || statusFilter !== "all"
                              ? "Thử điều chỉnh bộ lọc"
                              : "Bắt đầu bằng cách thêm nhà cung cấp đầu tiên"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    allSuppliers.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{s.email || "N/A"}</TableCell>
                        <TableCell>{s.phone || "N/A"}</TableCell>
                        <TableCell>{getStatusBadge(s.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/suppliers/${s.id}`)}
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(s.id)}
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
            Bạn có chắc chắn muốn xóa nhà cung cấp này? Hành động này không thể
            hoàn tác.
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
