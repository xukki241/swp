import { AppLayout } from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { salesService } from "@/services/salesService";
import { Eye, Loader2, Search, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function SalesOrderListPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.id?.toLowerCase().includes(searchLower) ||
      order.customerName?.toLowerCase().includes(searchLower)
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
                  placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
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
