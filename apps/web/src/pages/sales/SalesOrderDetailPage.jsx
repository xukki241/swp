import { AppLayout } from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { salesService } from "@/services/salesService";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  CreditCard,
  FileText,
  Loader2,
  Package,
  Printer,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

export default function SalesOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    setIsLoading(true);
    try {
      const response = await salesService.getSalesOrder(id);
      const orderData = response.data || response;

      const transformedOrder = {
        ...orderData,
        customerName: orderData.customer?.name || "Không có",
        customerPhone: orderData.customer?.phone || "",
        customerEmail: orderData.customer?.email || "",
        salespersonName:
          orderData.salesperson?.name ||
          orderData.salesperson?.email ||
          "Không có",
        items:
          orderData.items?.map((item) => ({
            ...item,
            medicationName:
              item.medicationVariant?.medication?.name ||
              item.medicationVariant?.name ||
              "Không rõ",
            variantName: item.medicationVariant?.name || "",
            sellPrice: item.unitPrice,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            medicationVariant: item.medicationVariant,
          })) || [],
      };

      setOrder(transformedOrder);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Không thể tải thông tin đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const paymentMethodLabels = {
    cash: "Tiền mặt",
    mobile_payment: "VietQR",
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </AppLayout>
    );
  }

  if (!order) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Không tìm thấy đơn hàng</p>
          <Button onClick={() => navigate("/sales/orders")} className="mt-4">
            Quay lại danh sách
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/sales/orders")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Chi tiết đơn hàng
              </h1>
              <p className="text-gray-600 mt-1">Mã đơn: {order.id}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-green-100 text-green-800 border-green-300">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Đã thanh toán</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <Card>
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <CardTitle>Thông tin đơn hàng</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Ngày tạo đơn</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="font-semibold">
                        {new Date(order.orderDate).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Phương thức thanh toán
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <p className="font-semibold">
                        {paymentMethodLabels[order.paymentMethod] || "Không rõ"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nhân viên bán hàng</p>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <p className="font-semibold">{order.salespersonName}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tổng tiền</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {Number(order.totalAmount || 0).toLocaleString("vi-VN")}{" "}
                      VNĐ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <CardTitle>Thông tin khách hàng</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Họ và tên</p>
                    <p className="font-semibold text-lg">
                      {order.customerName}
                    </p>
                  </div>
                  {order.customerPhone && (
                    <div>
                      <p className="text-sm text-gray-600">Số điện thoại</p>
                      <p className="font-semibold">{order.customerPhone}</p>
                    </div>
                  )}
                  {order.customerEmail && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{order.customerEmail}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-600" />
                  <CardTitle>
                    Danh sách sản phẩm ({order.items?.length || 0})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                          Sản phẩm
                        </th>
                        <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">
                          Đơn giá
                        </th>
                        <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">
                          Số lượng
                        </th>
                        <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">
                          Thành tiền
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {order.items?.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-2">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">
                                  {item.medicationName || "Không rõ"}
                                </p>
                                {item.variantName && (
                                  <p className="text-sm text-gray-600">
                                    {item.variantName}
                                  </p>
                                )}
                              </div>
                              {item.medicationVariant?.medication
                                ?.isPrescriptionRequired && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 rounded">
                                  Kê đơn
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-700">
                            {Number(item.sellPrice || 0).toLocaleString(
                              "vi-VN"
                            )}{" "}
                            VNĐ
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900">
                            {Number(
                              (item.quantity || 0) * (item.sellPrice || 0)
                            ).toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2">
                      <tr>
                        <td
                          colSpan="3"
                          className="px-6 py-4 text-right font-bold text-gray-900"
                        >
                          Tổng cộng:
                        </td>
                        <td className="px-6 py-4 text-right text-xl font-bold text-green-600">
                          {Number(order.totalAmount || 0).toLocaleString(
                            "vi-VN"
                          )}{" "}
                          VNĐ
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>Thao tác</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="w-full"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  In hóa đơn
                </Button>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-green-800">
                    Đơn hàng đã thanh toán
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Đơn hàng này đã được hoàn tất
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
