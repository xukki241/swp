import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  Eye,
  ShoppingCart,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { salesService } from "@/services/salesService";
import { useNavigate } from "react-router";

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

      // Transform data to include customerName
      const transformedOrders = ordersData.map((order) => ({
        ...order,
        customerName: order.customer?.name || order.customerName || "N/A",
        salespersonName:
          order.salesperson?.name || order.salespersonName || "N/A",
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsCompleted = async (orderId) => {
    setUpdatingOrderId(orderId);
    try {
      await salesService.updateSalesOrder(orderId, { status: "paid" });
      toast.success("Order marked as paid");
      fetchOrders(); // Refresh list
    } catch (error) {
      console.error("Error updating order:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update order";
      toast.error(message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    setUpdatingOrderId(orderId);
    try {
      await salesService.updateSalesOrder(orderId, { status: "cancelled" });
      toast.success("Order cancelled");
      fetchOrders(); // Refresh list
    } catch (error) {
      console.error("Error cancelling order:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to cancel order";
      toast.error(message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
      case "delivered":
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
              <h1 className="text-3xl font-bold text-gray-900">Sales Orders</h1>
              <p className="text-gray-600">View and manage all sales orders</p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/sales")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create New Order
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by order ID, customer name, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={fetchOrders}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-lg">
              All Orders ({filteredOrders.length})
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
                <p>No orders found</p>
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
                            Order #{order.id?.slice(0, 8)}
                          </p>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Customer:</span>{" "}
                            {order.customerName || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span>{" "}
                            {new Date(order.orderDate).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Payment:</span>{" "}
                            {order.paymentMethod}
                          </div>
                          <div>
                            <span className="font-medium">Total:</span>{" "}
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
                                  Mark as Paid
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
                              Cancel
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/sales/orders/${order.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
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
