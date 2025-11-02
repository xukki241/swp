import { AppLayout } from "@/components/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { salesService } from "@/services/salesService";
import {
  CheckCircle,
  Eye,
  Loader2,
  Search,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function SalesOrderListPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await salesService.getSalesOrders();
      const ordersData = Array.isArray(response)
        ? response
        : response.data || [];

      const transformedOrders = ordersData.map((order) => ({
        ...order,
        customerName: order.customer?.name || order.customerName || "Không có",
        salespersonName:
          order.salesperson?.name || order.salespersonName || "Không có",
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsCompleted = async (orderId) => {
    setUpdatingOrderId(orderId);
    try {
      await salesService.updateSalesOrder(orderId, { status: "paid" });
      toast.success("Đã đánh dấu đơn hàng là ĐÃ THANH TOÁN");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể cập nhật đơn hàng";
      toast.error(message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này không?")) return;

    setUpdatingOrderId(orderId);
    try {
      await salesService.updateSalesOrder(orderId, { status: "cancelled" });
      toast.success("Đơn hàng đã được hủy");
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể hủy đơn hàng";
      toast.error(message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.id?.toLowerCase().includes(searchLower) ||
      order.customerName?.toLowerCase().includes(searchLower) ||
      order.status?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-gray-700" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Đơn hàng bán</h1>
              <p className="text-gray-600">
                Xem và quản lý tất cả các đơn hàng bán
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/sales")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Tạo đơn hàng mới
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm theo mã đơn, tên khách hàng hoặc trạng thái..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={fetchOrders}>
                Làm mới
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-lg">
              Tất cả đơn hàng ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Không có đơn hàng nào</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-gray-900">
                            Đơn hàng #{order.id?.slice(0, 8)}
                          </p>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status === "paid"
                              ? "Đã thanh toán"
                              : order.status === "pending"
                                ? "Chờ thanh toán"
                                : order.status === "cancelled"
                                  ? "Đã hủy"
                                  : order.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Khách hàng:</span>{" "}
                            {order.customerName || "Không có"}
                          </div>
                          <div>
                            <span className="font-medium">Ngày tạo:</span>{" "}
                            {new Date(order.orderDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </div>
                          <div>
                            <span className="font-medium">Thanh toán:</span>{" "}
                            {order.paymentMethod === "cash"
                              ? "Tiền mặt"
                              : order.paymentMethod === "mobile_payment"
                                ? "VietQR"
                                : "Khác"}
                          </div>
                          <div>
                            <span className="font-medium">Tổng tiền:</span>{" "}
                            {Number(order.totalAmount || 0).toLocaleString(
                              "vi-VN"
                            )}{" "}
                            VNĐ
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {order.status === "pending" && (
                          <>
                            <Button
                              onClick={() => handleMarkAsCompleted(order.id)}
                              disabled={updatingOrderId === order.id}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {updatingOrderId === order.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Đánh dấu đã thanh toán
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={updatingOrderId === order.id}
                              size="sm"
                              variant="destructive"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Hủy
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/sales/orders/${order.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
