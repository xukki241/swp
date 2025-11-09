import { AppLayout } from "@/components/layouts/app-layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customerService } from "@/services/customerService";
import { searchMedications } from "@/services/medicationsService";
import { salesService } from "@/services/salesService";
import {
  Banknote,
  CheckCircle,
  Copy,
  CreditCard,
  FileText,
  Loader2,
  Minus,
  Pill,
  Plus,
  ShoppingCart,
  Smartphone,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import CustomerSelector from "./components/CustomerSelector";
import MedicationSearch from "./components/MedicationSearch";
import OrderSuccessModal from "./components/OrderSuccessModal";
import { VietQRPaymentDialog } from "./components/VietQRPaymentDialog";

// Payment methods
const PAYMENT_METHODS = [
  { value: "cash", label: "Tiền mặt", icon: Banknote },
  { value: "mobile_payment", label: "VietQR", icon: Smartphone },
];

// Generate order ID
const generateOrderId = () =>
  `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function SalesPageV3() {
  // Orders state
  const [orders, setOrders] = useState([
    {
      id: generateOrderId(),
      customer: null,
      cart: [],
      paymentMethod: "cash",
      cashReceived: "",
      createdAt: new Date(),
    },
  ]);
  const [activeOrderId, setActiveOrderId] = useState(orders[0].id);

  // UI state
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showVietQRDialog, setShowVietQRDialog] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  // Get active order
  const activeOrder = useMemo(
    () => orders.find((o) => o.id === activeOrderId),
    [orders, activeOrderId]
  );

  // Calculate total
  const totalAmount = useMemo(() => {
    return activeOrder.cart.reduce((sum, item) => {
      const price = Number(item.sellPrice) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + (isNaN(price) ? 0 : price * qty);
    }, 0);
  }, [activeOrder.cart]);

  // Calculate change
  const changeAmount = useMemo(() => {
    if (activeOrder.paymentMethod !== "cash" || !activeOrder.cashReceived) {
      return 0;
    }
    return Number(activeOrder.cashReceived) * 1000 - totalAmount;
  }, [activeOrder.paymentMethod, activeOrder.cashReceived, totalAmount]);

  // Update active order
  const updateActiveOrder = useCallback(
    (updates) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === activeOrderId ? { ...order, ...updates } : order
        )
      );
    },
    [activeOrderId]
  );

  // Set cart
  const setCart = useCallback(
    (cart) => {
      updateActiveOrder({ cart });
    },
    [updateActiveOrder]
  );

  // Set customer
  const setCustomer = useCallback(
    (customer) => {
      updateActiveOrder({ customer });
    },
    [updateActiveOrder]
  );

  // Set payment method
  const setPaymentMethod = useCallback(
    (method) => {
      updateActiveOrder({ paymentMethod: method, cashReceived: "" });
    },
    [updateActiveOrder]
  );

  // Create new order
  const createNewOrder = useCallback(() => {
    const newOrder = {
      id: generateOrderId(),
      customer: null,
      cart: [],
      paymentMethod: "cash",
      cashReceived: "",
      createdAt: new Date(),
    };
    setOrders((prev) => [...prev, newOrder]);
    setActiveOrderId(newOrder.id);
    toast.success("Đã tạo đơn hàng mới");
  }, []);

  // Delete order
  const deleteOrder = useCallback(
    (orderId) => {
      if (orders.length === 1) {
        toast.error("Không thể xóa đơn hàng cuối cùng");
        return;
      }
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (activeOrderId === orderId) {
        setActiveOrderId(
          orders[0].id === orderId ? orders[1].id : orders[0].id
        );
      }
      setDeleteConfirmId(null);
    },
    [orders, activeOrderId]
  );

  // Duplicate order
  const duplicateOrder = useCallback(
    (orderId) => {
      const orderToDuplicate = orders.find((o) => o.id === orderId);
      const newOrder = {
        ...orderToDuplicate,
        id: generateOrderId(),
        createdAt: new Date(),
      };
      setOrders((prev) => [...prev, newOrder]);
      setActiveOrderId(newOrder.id);
    },
    [orders]
  );

  // Search medications
  const handleSearchMedications = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 1) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchMedications(searchTerm);
      setSearchResults(results);
    } catch (error) {
      toast.error("Lỗi tìm kiếm: " + error.message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Add to cart
  const handleAddToCart = useCallback(
    (medication) => {
      console.info("handleAddToCart called with:", medication);
      console.info(
        "Validation check - id:",
        medication.id,
        "sellPrice:",
        medication.sellPrice
      );
      console.info("Available quantity:", medication.availableQuantity);

      if (!medication.id) {
        console.error("Missing medication.id");
        return;
      }

      if (!medication.sellPrice) {
        console.error("Missing medication.sellPrice");
        return;
      }

      const availableQty = Number(medication.availableQuantity) || 0;
      console.info("Parsed available quantity:", availableQty);

      if (availableQty <= 0) {
        toast.error("Sản phẩm hết hàng");
        console.error("Out of stock, availableQty:", availableQty);
        return;
      }

      const isPrescriptionRequired =
        medication.isPrescriptionRequired ||
        medication.is_prescription_required ||
        false;

      console.info("Proceeding to update cart...");

      setOrders((prevOrders) => {
        const currentOrder = prevOrders.find((o) => o.id === activeOrderId);
        if (!currentOrder) {
          console.error("Current order not found!");
          return prevOrders;
        }

        console.info("Current cart:", currentOrder.cart);

        const existingItem = currentOrder.cart.find(
          (item) => item.medication_variant_id === medication.id
        );

        let updatedCart;

        if (existingItem) {
          const newQuantity = existingItem.quantity + 1;
          if (newQuantity > availableQty) {
            toast.error(
              `Không thể vượt quá số lượng tồn kho (${availableQty})`
            );
            return prevOrders;
          }
          updatedCart = currentOrder.cart.map((item) =>
            item.medication_variant_id === medication.id
              ? { ...item, quantity: newQuantity }
              : item
          );
        } else {
          const parsedPrice = Number(medication.sellPrice) || 0;
          const newItem = {
            medication_variant_id: medication.id,
            medicationName: medication.medicationName || medication.name,
            variantName: medication.variantName || "",
            sellPrice: isNaN(parsedPrice) ? 0 : parsedPrice,
            unit: medication.unit || "đơn vị",
            availableQuantity: availableQty,
            quantity: 1,
            isPrescriptionRequired: isPrescriptionRequired,
          };
          console.info("Creating new cart item:", newItem);
          updatedCart = [...currentOrder.cart, newItem];
        }

        console.info("Updated cart:", updatedCart);

        return prevOrders.map((order) =>
          order.id === activeOrderId ? { ...order, cart: updatedCart } : order
        );
      });

      setSearchResults([]);
    },
    [activeOrderId]
  ); // Update cart item
  const updateCartItem = useCallback(
    (index, quantity) => {
      const item = activeOrder.cart[index];

      if (quantity < 1) {
        toast.error("Số lượng tối thiểu là 1");
        return;
      }

      if (quantity > item.availableQuantity) {
        toast.error(`Tối đa ${item.availableQuantity}`);
        return;
      }

      const updatedCart = [...activeOrder.cart];
      updatedCart[index] = { ...updatedCart[index], quantity };
      setCart(updatedCart);
    },
    [activeOrder.cart, setCart]
  );

  // Remove cart item
  const removeCartItem = useCallback(
    (index) => {
      const newCart = activeOrder.cart.filter((_, i) => i !== index);
      setCart(newCart);
    },
    [activeOrder.cart, setCart]
  );

  // Create customer
  const handleCreateCustomer = useCallback(async () => {
    if (!newCustomerData.name.trim()) {
      toast.error("Vui lòng nhập tên khách hàng");
      return;
    }

    setIsCreatingCustomer(true);
    try {
      const response = await customerService.createCustomer(newCustomerData);
      const customerData = response?.data || response;
      setCustomer(customerData);
      setShowNewCustomerForm(false);
      setNewCustomerData({ name: "", email: "", phone: "" });
      toast.success("Tạo khách hàng thành công!");
    } catch (error) {
      console.error("Create customer error:", error);

      // Extract detailed error message
      let message = "Không thể tạo khách hàng";
      if (error?.response?.data?.error) {
        const errorData = error.response.data.error;
        if (typeof errorData === "object" && errorData.message) {
          message = errorData.message;
        } else if (typeof errorData === "string") {
          message = errorData;
        }
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.response?.status) {
        if (error.response.status === 400) {
          message =
            error.response.data?.error?.message || "Dữ liệu không hợp lệ";
        } else if (error.response.status === 409) {
          message = "Khách hàng đã tồn tại";
        } else if (error.response.status === 500) {
          message = "Lỗi máy chủ. Vui lòng thử lại sau";
        }
      } else if (error?.message) {
        message = error.message;
      }

      toast.error(message);
    } finally {
      setIsCreatingCustomer(false);
    }
  }, [newCustomerData, setCustomer]);

  // Complete order
  const handleCompleteOrder = useCallback(async () => {
    if (!activeOrder.customer) {
      toast.error("Vui lòng chọn khách hàng");
      return;
    }

    if (activeOrder.cart.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    if (
      activeOrder.paymentMethod === "cash" &&
      (!activeOrder.cashReceived || changeAmount < 0)
    ) {
      toast.error("Số tiền khách đưa không đủ");
      return;
    }

    const orderData = {
      customer_id: activeOrder.customer.id,
      payment_method: activeOrder.paymentMethod,
      items: activeOrder.cart.map((item) => ({
        medication_variant_id: item.medication_variant_id,
        quantity: item.quantity,
        unit_price: item.sellPrice,
      })),
      total: totalAmount,
    };

    if (activeOrder.paymentMethod === "mobile_payment") {
      setPendingOrderData(orderData);
      setShowVietQRDialog(true);
      return;
    }

    await submitOrder(orderData);
  }, [activeOrder, changeAmount]);

  // Submit order
  const submitOrder = useCallback(
    async (orderData) => {
      setIsSubmitting(true);
      try {
        const response = await salesService.createSalesOrder(orderData);

        // Extract data from response
        const orderResult = response?.data || response;

        // Update order status to "paid" immediately since payment is already confirmed
        await salesService.updateSalesOrder(orderResult.id, { status: "paid" });

        // Set success order with proper format
        setSuccessOrder({
          ...orderResult,
          status: "paid", // Set status to paid for display
          paymentMethod: orderData.payment_method || "cash",
          totalAmount: activeOrder.cart.reduce(
            (sum, item) => sum + item.sellPrice * item.quantity,
            0
          ),
          items: activeOrder.cart.map((item) => ({
            ...item,
            name: item.medicationName,
          })),
        });

        // Reset order
        updateActiveOrder({
          cart: [],
          customer: null,
          paymentMethod: "cash",
          cashReceived: "",
        });

        toast.success("Đơn hàng đã hoàn tất!");
      } catch (error) {
        console.error("Submit order error:", error);

        // Extract detailed error message
        let message = "Không thể tạo đơn hàng";
        if (error?.response?.data?.error) {
          const errorData = error.response.data.error;
          if (typeof errorData === "object" && errorData.message) {
            message = errorData.message;
          } else if (typeof errorData === "string") {
            message = errorData;
          }
        } else if (error?.response?.data?.message) {
          message = error.response.data.message;
        } else if (error?.response?.status) {
          if (error.response.status === 400) {
            message =
              error.response.data?.error?.message || "Dữ liệu không hợp lệ";
          } else if (error.response.status === 401) {
            message = "Chưa xác thực. Vui lòng đăng nhập lại";
          } else if (error.response.status === 403) {
            message = "Bạn không có quyền tạo đơn hàng";
          } else if (error.response.status === 404) {
            message = "Khách hàng hoặc sản phẩm không tồn tại";
          } else if (error.response.status === 409) {
            message =
              error.response.data?.error?.message || "Dữ liệu bị xung đột";
          } else if (error.response.status >= 500) {
            message = "Lỗi máy chủ. Vui lòng thử lại sau";
          }
        } else if (error?.message) {
          message = error.message;
        }

        toast.error(message);
      } finally {
        setIsSubmitting(false);
        setShowVietQRDialog(false);
        setPendingOrderData(null);
      }
    },
    [updateActiveOrder, activeOrder.cart]
  );

  // Close success modal
  const handleCloseSuccessModal = useCallback(() => {
    setSuccessOrder(null);
  }, []);

  // Get order badge text
  const getOrderBadgeText = (order) => {
    if (order.cart.length === 0) return "Trống";
    return `${order.cart.length} SP`;
  };

  return (
    <AppLayout>
      <div className="h-full flex flex-col overflow-hidden bg-background">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Bán hàng - POS
                </h1>
                <p className="text-sm text-muted-foreground">
                  Quản lý nhiều đơn hàng cùng lúc
                </p>
              </div>
            </div>
            <Button
              onClick={createNewOrder}
              className="bg-primary hover:bg-primary/90"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Đơn hàng mới
            </Button>
          </div>

          {/* Order Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {orders.map((order, index) => {
              const isActive = order.id === activeOrderId;
              return (
                <div
                  key={order.id}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                    isActive
                      ? "border-primary bg-primary/10 text-foreground shadow-sm"
                      : "border-border bg-card hover:border-primary/50 text-muted-foreground"
                  }`}
                  onClick={() => setActiveOrderId(order.id)}
                >
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Đơn #{index + 1}</span>
                  <Badge
                    variant={isActive ? "default" : "outline"}
                    className="ml-1"
                  >
                    {getOrderBadgeText(order)}
                  </Badge>

                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateOrder(order.id);
                      }}
                      title="Nhân bản"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    {orders.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(order.id);
                        }}
                        title="Xóa"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Search & Cart */}
          <div className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
            {/* Search */}
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Pill className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">
                  Tìm kiếm sản phẩm
                </h2>
              </div>
              <MedicationSearch
                onSearch={handleSearchMedications}
                isSearching={isSearching}
                results={searchResults}
                onSelectMedication={handleAddToCart}
              />
            </div>

            {/* Cart */}
            {activeOrder.cart.length > 0 ? (
              <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden flex flex-col min-h-0">
                <div className="p-4 bg-primary/5 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold text-foreground flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Giỏ hàng
                  </h2>
                  <Badge variant="secondary" className="font-semibold">
                    {activeOrder.cart.length} SP •{" "}
                    {totalAmount.toLocaleString("vi-VN")} ₫
                  </Badge>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium text-sm">
                          Sản phẩm
                        </th>
                        <th className="text-right p-3 font-medium text-sm w-24">
                          Đơn giá
                        </th>
                        <th className="text-center p-3 font-medium text-sm w-32">
                          Số lượng
                        </th>
                        <th className="text-right p-3 font-medium text-sm w-28">
                          Tổng
                        </th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {activeOrder.cart.map((item, index) => (
                        <tr key={index} className="hover:bg-muted/30">
                          <td className="p-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {item.medicationName}
                                </span>
                                {item.isPrescriptionRequired && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    Kê đơn
                                  </Badge>
                                )}
                              </div>
                              {item.variantName && (
                                <div className="text-sm text-muted-foreground">
                                  {item.variantName}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="font-semibold text-primary">
                              {(Number(item.sellPrice) || 0).toLocaleString(
                                "vi-VN"
                              )}
                              ₫
                            </div>
                            <div className="text-xs text-muted-foreground">
                              / {item.unit}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateCartItem(index, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val)) updateCartItem(index, val);
                                }}
                                className="w-14 h-8 text-center font-semibold"
                                min="1"
                                max={item.availableQuantity}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateCartItem(index, item.quantity + 1)
                                }
                                disabled={
                                  item.quantity >= item.availableQuantity
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-xs text-center text-muted-foreground mt-1">
                              Max: {item.availableQuantity}
                            </div>
                          </td>
                          <td className="p-3 text-right font-bold text-primary">
                            {(
                              (Number(item.sellPrice) || 0) * item.quantity
                            ).toLocaleString("vi-VN")}
                            ₫
                          </td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => removeCartItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-card rounded-xl border border-border flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="font-medium">Giỏ hàng trống</p>
                  <p className="text-sm mt-1">Tìm kiếm và thêm sản phẩm</p>
                </div>
              </div>
            )}

            {/* Payment Section */}
            {activeOrder.cart.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4 space-y-4">
                {/* Payment Method */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Phương thức thanh toán
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setPaymentMethod(value)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          activeOrder.paymentMethod === value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cash Payment */}
                {activeOrder.paymentMethod === "cash" && (
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Tiền khách đưa (nghìn đồng)
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="VD: 100 = 100,000₫"
                          value={activeOrder.cashReceived}
                          onChange={(e) =>
                            updateActiveOrder({ cashReceived: e.target.value })
                          }
                          className="pr-16"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          × 1,000
                        </span>
                      </div>
                    </div>

                    {activeOrder.cashReceived && (
                      <div className="space-y-1 pt-2 border-t text-sm">
                        <div className="flex justify-between">
                          <span>Tổng tiền:</span>
                          <span className="font-semibold">
                            {totalAmount.toLocaleString("vi-VN")}₫
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Khách đưa:</span>
                          <span className="font-semibold">
                            {(
                              Number(activeOrder.cashReceived) * 1000
                            ).toLocaleString("vi-VN")}
                            ₫
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="font-semibold">Tiền thừa:</span>
                          <span
                            className={`font-bold text-lg ${changeAmount < 0 ? "text-red-600" : "text-green-600"}`}
                          >
                            {changeAmount.toLocaleString("vi-VN")}₫
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Complete Button */}
                <Button
                  onClick={handleCompleteOrder}
                  disabled={
                    !activeOrder.customer ||
                    isSubmitting ||
                    (activeOrder.paymentMethod === "cash" &&
                      (!activeOrder.cashReceived || changeAmount < 0))
                  }
                  className="w-full py-6 text-lg font-bold"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Hoàn tất đơn hàng
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Right: Customer */}
          <div className="w-96 border-l border-border bg-card flex flex-col">
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Khách hàng</h3>
                </div>
                {activeOrder.customer && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCustomer(null)}
                  >
                    Đổi
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeOrder.customer ? (
                <div className="p-4 bg-primary/10 rounded-xl border-2 border-primary/20">
                  <p className="font-semibold text-lg">
                    {activeOrder.customer.name}
                  </p>
                  {activeOrder.customer.phone && (
                    <p className="text-sm text-muted-foreground mt-2">
                      📞 {activeOrder.customer.phone}
                    </p>
                  )}
                  {activeOrder.customer.email && (
                    <p className="text-sm text-muted-foreground">
                      ✉️ {activeOrder.customer.email}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <CustomerSelector onSelectCustomer={setCustomer} />

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-card text-muted-foreground">
                        hoặc
                      </span>
                    </div>
                  </div>

                  {showNewCustomerForm ? (
                    <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                      <Input
                        placeholder="Tên khách hàng *"
                        value={newCustomerData.name}
                        onChange={(e) =>
                          setNewCustomerData({
                            ...newCustomerData,
                            name: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Email (tùy chọn)"
                        value={newCustomerData.email}
                        onChange={(e) =>
                          setNewCustomerData({
                            ...newCustomerData,
                            email: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="SĐT (tùy chọn)"
                        value={newCustomerData.phone}
                        onChange={(e) =>
                          setNewCustomerData({
                            ...newCustomerData,
                            phone: e.target.value,
                          })
                        }
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCreateCustomer}
                          disabled={isCreatingCustomer}
                          className="flex-1"
                        >
                          {isCreatingCustomer ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Tạo"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowNewCustomerForm(false)}
                          className="flex-1"
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setShowNewCustomerForm(true)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm khách hàng mới
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="border-t border-border p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Số sản phẩm:</span>
                  <span className="font-semibold">
                    {activeOrder.cart.length}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Tổng cộng:</span>
                  <span className="text-xl font-bold text-primary">
                    {totalAmount.toLocaleString("vi-VN")}₫
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {successOrder && (
        <OrderSuccessModal
          order={successOrder}
          onClose={handleCloseSuccessModal}
        />
      )}

      {showVietQRDialog && pendingOrderData && (
        <VietQRPaymentDialog
          open={showVietQRDialog}
          onOpenChange={setShowVietQRDialog}
          orderData={pendingOrderData}
          onPaymentConfirmed={submitOrder}
        />
      )}

      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa đơn hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteOrder(deleteConfirmId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
