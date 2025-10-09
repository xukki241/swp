import { useState } from "react";
import { Search, Edit, PlusCircle, CheckCircle, XCircle } from "lucide-react";
import { AppLayout } from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSuppliers } from "@/hooks/useSuppliers";
import { SupplierFormDialog } from "@/components/ui/supplier-form-dialog";

export default function SupplierListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Lấy dữ liệu nhà cung cấp với bộ lọc
  const filters = {};
  if (searchQuery) filters.search = searchQuery;
  if (statusFilter !== "all") filters.status = statusFilter;

  const { data: suppliers, isLoading, error } = useSuppliers(filters);

  // Hàm xử lý mở dialog để chỉnh sửa
  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setIsDialogOpen(true);
  };

  // Hàm xử lý mở dialog để tạo mới
  const handleCreate = () => {
    setSelectedSupplier(null); // Đảm bảo không có dữ liệu cũ
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSupplier(null); // Reset khi đóng
  };

  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle>Quản lý Nhà cung cấp</CardTitle>
          <CardDescription>
            Tìm kiếm, xem, tạo mới và chỉnh sửa thông tin nhà cung cấp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4 gap-2">
            <div className="relative w-1/3">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select onValueChange={setStatusFilter} defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreate}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tạo nhà cung cấp
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên nhà cung cấp</TableHead>
                  <TableHead>Người liên hệ</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Điện thoại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan="6" className="text-center">
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan="6" className="text-center text-red-500">
                      Có lỗi xảy ra: {error.message}
                    </TableCell>
                  </TableRow>
                ) : suppliers && suppliers.length > 0 ? (
                  suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">
                        {supplier.name}
                      </TableCell>
                      <TableCell>{supplier.contactName}</TableCell>
                      <TableCell>{supplier.email}</TableCell>
                      <TableCell>{supplier.phone}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            supplier.status === "active"
                              ? "outline"
                              : "destructive"
                          }
                          className="flex items-center w-fit"
                        >
                          {supplier.status === "active" ? (
                            <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="mr-1 h-3 w-3 text-red-500" />
                          )}
                          {supplier.status === "active"
                            ? "Hoạt động"
                            : "Không hoạt động"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(supplier)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="6" className="text-center">
                      Không tìm thấy nhà cung cấp nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog để tạo và chỉnh sửa */}
      <SupplierFormDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        supplier={selectedSupplier}
      />
    </AppLayout>
  );
}
