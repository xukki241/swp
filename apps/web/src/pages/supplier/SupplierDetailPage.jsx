"use client";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDownloadFile } from "@/hooks/useFiles";
import { useSupplier } from "@/hooks/useSuppliers";
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  Download,
  Pencil,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

export default function SupplierDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: supplier, isLoading } = useSupplier(id);
  // Lấy medications từ supplier.medicationVariants thay vì gọi API riêng
  const medications = supplier?.medicationVariants || [];
  const downloadFile = useDownloadFile();

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

  function formatVND(value) {
    if (value === null || value === undefined || value === "") return "N/A";
    const num = Number(value);
    if (Number.isNaN(num)) return "N/A";
    return new Intl.NumberFormat("vi-VN").format(Math.round(num)) + "₫";
  }

  const handleDownloadContract = async (
    contractId,
    supplierSku,
    contractFilename,
    contractFileType
  ) => {
    if (!contractId) return;

    try {
      // Debug logging
      console.log("Download contract params:", {
        contractId,
        supplierSku,
        contractFilename,
        contractFileType,
      });

      // Sử dụng tên file gốc nếu có
      let filename = contractFilename;

      // Nếu không có filename, tạo tên mới
      if (!filename) {
        filename = `contract-${supplierSku || "document"}`;
        // Thêm extension từ fileType hoặc mặc định .pdf
        const extension = contractFileType || "pdf";
        filename += `.${extension}`;
      }

      console.log("Final filename for download:", filename);

      await downloadFile.mutateAsync({
        fileId: contractId,
        filename: filename,
      });
      toast.success("Đã tải hợp đồng thành công!");
    } catch (error) {
      console.error("Error downloading contract:", error);
      toast.error("Không thể tải file hợp đồng");
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Chi tiết nhà cung cấp
            </h1>
            <p className="text-muted-foreground mt-1">
              Đang tải thông tin nhà cung cấp...
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

  // Debug logging for supplier data
  console.log("Supplier data loaded:", {
    supplierId: supplier?.id,
    hasMedicationVariants: !!supplier?.medicationVariants,
    medicationVariantsCount: supplier?.medicationVariants?.length || 0,
    firstMedicationVariant: supplier?.medicationVariants?.[0],
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Chi tiết nhà cung cấp
            </h1>
            <p className="text-muted-foreground mt-1">
              Xem và quản lý thông tin nhà cung cấp
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </Button>
            <Button
              className="flex items-center gap-2"
              onClick={() => navigate(`/suppliers/${id}/edit`)}
            >
              <Pencil className="w-4 h-4" /> Sửa
            </Button>
          </div>
        </div>

        <Card className="shadow-md rounded-xl border-0">
          <CardHeader>
            <CardTitle>Thông tin nhà cung cấp</CardTitle>
            <CardDescription>
              Chi tiết cơ bản và thông tin liên hệ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tên</p>
                <p className="text-base font-semibold mt-1">
                  {supplier?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tên người liên hệ
                </p>
                <p className="text-base font-semibold mt-1">
                  {supplier?.contactName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-base font-semibold mt-1">
                  {supplier?.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Điện thoại
                </p>
                <p className="text-base font-semibold mt-1">
                  {supplier?.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Địa chỉ
                </p>
                <p className="text-base font-semibold mt-1">
                  {supplier?.address || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Trạng thái
                </p>
                <div className="mt-1">{getStatusBadge(supplier?.status)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-xl border-0">
          <CardHeader>
            <CardTitle>Thuốc cung cấp</CardTitle>
            <CardDescription>
              Danh sách thuốc do nhà cung cấp này cung cấp
            </CardDescription>
          </CardHeader>
          <CardContent>
            {medications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground font-medium">
                  Không tìm thấy thuốc
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Nhà cung cấp này chưa có thuốc nào được phân công
                </p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên thuốc</TableHead>
                      <TableHead>Phiên bản</TableHead>
                      <TableHead>Mã SKU NCC</TableHead>
                      <TableHead>Thời gian giao (ngày)</TableHead>
                      <TableHead>Giá mua</TableHead>
                      <TableHead className="text-center">Hợp đồng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medications.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">
                          {m.medicationName || "N/A"}
                        </TableCell>
                        <TableCell>{m.variantName || "N/A"}</TableCell>
                        <TableCell>{m.supplierSku || "N/A"}</TableCell>
                        <TableCell>{m.leadTimeDays || "N/A"}</TableCell>
                        <TableCell className="font-semibold text-primary">
                          {formatVND(m.purchasePrice)}
                        </TableCell>
                        <TableCell className="text-center">
                          {m.contractId ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDownloadContract(
                                  m.contractId,
                                  m.supplierSku,
                                  m.contractFilename,
                                  m.contractFileType
                                )
                              }
                              className="flex items-center gap-2 mx-auto"
                            >
                              <Download className="w-4 h-4" />
                              Tải xuống
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Không có hợp đồng
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
