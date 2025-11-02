import { AppLayout } from "@/components/layouts/app-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  usePurchaseOrderReceipt,
  usePurchaseOrderReceiptAllocations,
} from "@/hooks/usePurchaseOrders";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  MapPin,
  Package,
  User,
  Warehouse,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";

export default function PurchaseOrderReceiptDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: receipt, isLoading, error } = usePurchaseOrderReceipt(id);
  const {
    data: allocationsData,
    isLoading: isLoadingAllocations,
    error: allocationsError,
  } = usePurchaseOrderReceiptAllocations(id);

  const allocations = allocationsData?.data || [];

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
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

  if (error || !receipt) {
    return (
      <AppLayout>
        <Card className="shadow-md border-0">
          <CardContent className="flex flex-col justify-center items-center py-12">
            <p className="text-red-500 mb-4">
              Không thể tải chi tiết phiếu nhập
            </p>
            <Button onClick={() => navigate("/procurement/receipts")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/procurement/receipts")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Chi tiết phiếu nhập
              </h1>
              <p className="text-muted-foreground">Thông tin phiếu nhập hàng</p>
            </div>
          </div>
          {getStatusBadge(receipt.poStatus)}
        </div>

        {/* Receipt Information */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Thông tin phiếu nhập</CardTitle>
            <CardDescription>Chi tiết cơ bản của phiếu nhập</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Mã phiếu nhập
                    </p>
                    <p className="text-base font-mono font-semibold">
                      #{receipt.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Nhà cung cấp
                    </p>
                    <p className="text-base font-semibold">
                      {receipt.supplierName || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Người nhập
                    </p>
                    <p className="text-base font-semibold">
                      {receipt.receivedByName || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Ngày nhập
                    </p>
                    <p className="text-base font-semibold">
                      {formatDate(receipt.receivedDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Ngày đặt hàng
                    </p>
                    <p className="text-base font-semibold">
                      {receipt.poOrderDate
                        ? formatDate(receipt.poOrderDate)
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Trạng thái đơn
                    </p>
                    <div className="mt-1">
                      {getStatusBadge(receipt.poStatus)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="w-4 h-4" />
              <span>
                Mã đơn đặt hàng:{" "}
                <span className="font-mono font-medium">
                  {receipt.purchaseOrderId}
                </span>
              </span>
              <Button
                size="sm"
                variant="link"
                className="h-auto p-0 ml-2"
                onClick={() =>
                  navigate(`/purchase-orders/${receipt.purchaseOrderId}`)
                }
              >
                Xem đơn hàng
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Items */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Hàng hóa đã nhập</CardTitle>
            <CardDescription>
              Danh sách hàng hóa được nhập trong phiếu này
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Thuốc</TableHead>
                    <TableHead>Biến thể</TableHead>
                    <TableHead className="text-right">SL đặt</TableHead>
                    <TableHead className="text-right">SL nhận</TableHead>
                    <TableHead className="text-right">Đơn giá</TableHead>
                    <TableHead className="text-right">Tổng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipt.items && receipt.items.length > 0 ? (
                    receipt.items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {item.medicationName || "N/A"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.variantName || "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.orderedQuantity?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.quantity?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.unitPrice
                            ? formatCurrency(item.unitPrice)
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.unitPrice && item.quantity
                            ? formatCurrency(item.unitPrice * item.quantity)
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Không tìm thấy hàng hóa trong phiếu nhập này
                      </TableCell>
                    </TableRow>
                  )}
                  {receipt.items && receipt.items.length > 0 && (
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={6} className="text-right font-bold">
                        Tổng giá trị nhập:
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary text-lg">
                        {formatCurrency(
                          receipt.items.reduce(
                            (sum, item) =>
                              sum +
                              (item.unitPrice || 0) * (item.quantity || 0),
                            0
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Warehouse Allocations */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Warehouse className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>Phân bổ kho</CardTitle>
                <CardDescription>
                  Phân bổ tự động đến vị trí kho theo chiến lược FIFO
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingAllocations ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : allocations.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Không tìm thấy phân bổ tồn kho cho phiếu nhập này.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Đã phân bổ thành công {allocations.length} hàng hóa đến vị
                    trí kho
                  </AlertDescription>
                </Alert>

                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Số lô</TableHead>
                        <TableHead>Ngày SX</TableHead>
                        <TableHead>Ngày hết hạn</TableHead>
                        <TableHead className="text-right">Số lượng</TableHead>
                        <TableHead>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Khu vực
                          </div>
                        </TableHead>
                        <TableHead>Giá đỡ</TableHead>
                        <TableHead>Ngăn</TableHead>
                        <TableHead className="text-center">Tầng</TableHead>
                        <TableHead className="text-center">Vị trí</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allocations.map((allocation, index) => (
                        <TableRow key={allocation.inventoryId}>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {allocation.batchNumber}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {allocation.manufactureDate
                              ? formatDate(allocation.manufactureDate)
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {allocation.expiryDate
                              ? formatDate(allocation.expiryDate)
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {Number(allocation.quantity).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">
                                {allocation.zoneCode}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {allocation.zoneName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">
                                {allocation.rackCode}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {allocation.rackName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">
                                {allocation.binCode}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {allocation.binName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">
                              L{allocation.binLevel}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">
                              #{allocation.binNumber}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="shadow-md border-0">
          <CardContent className="py-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Mã phiếu nhập: <span className="font-mono">#{receipt.id}</span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/procurement/receipts")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
                </Button>
                <Button
                  onClick={() =>
                    navigate(`/purchase-orders/${receipt.purchaseOrderId}`)
                  }
                >
                  <Package className="w-4 h-4 mr-2" /> Xem đơn đặt hàng
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
