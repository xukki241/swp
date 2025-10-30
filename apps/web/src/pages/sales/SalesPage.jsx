"use client";

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
  CheckCircle,
  Copy,
  FileText,
  Loader2,
  Plus,
  ShoppingCart,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import CartSummary from "./components/CartSummary";
import CustomerSelector from "./components/CustomerSelector";
import MedicationSearch from "./components/MedicationSearch";
import OrderSuccessModal from "./components/OrderSuccessModal";
import PaymentMethodSelector from "./components/PaymentMethodSelector";
import { VietQRPaymentDialog } from "./components/VietQRPaymentDialog";

// Generate unique order ID
const generateOrderId = () =>
  `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function SalesPage() {
  // Multi-order state
  const [orders, setOrders] = useState([
    {
      id: generateOrderId(),
      customer: null,
      cart: [],
      paymentMethod: "cash",
      cashReceived: "", // Amount received from customer
      createdAt: new Date(),
    },
  ]);
  const [activeOrderId, setActiveOrderId] = useState(orders[0].id);

  // UI state
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showCustomerPanel, setShowCustomerPanel] = useState(false);
  const [showVietQRDialog, setShowVietQRDialog] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);

  // Get active order
  const activeOrder = useMemo(
    () => orders.find((o) => o.id === activeOrderId),
    [orders, activeOrderId]
  );

  // Calculate total for active order
  const totalAmount = useMemo(
    () =>
      activeOrder?.cart.reduce(
        (sum, item) => sum + item.quantity * item.sellPrice,
        0
      ) || 0,
    [activeOrder]
  );

  // Calculate change amount for cash payment
  const changeAmount = useMemo(() => {
    if (activeOrder?.paymentMethod !== "cash" || !activeOrder?.cashReceived) {
      return 0;
    }
    // cashReceived is in thousands (nghìn đồng), multiply by 1000
    const received = Number(activeOrder.cashReceived) * 1000 || 0;
    return Math.max(0, received - totalAmount);
  }, [activeOrder, totalAmount]);

  // ========== ORDER MANAGEMENT ==========

  const createNewOrder = () => {
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
    toast.success("New order created");
  };

  const deleteOrder = (orderId) => {
    if (orders.length === 1) {
      toast.error("Must have at least 1 order");
      return;
    }

    setOrders((prev) => prev.filter((o) => o.id !== orderId));

    // Switch to another order if deleting active one
    if (activeOrderId === orderId) {
      const remainingOrders = orders.filter((o) => o.id !== orderId);
      setActiveOrderId(remainingOrders[0].id);
    }

    toast.success("Order deleted");
    setDeleteConfirmId(null);
  };

  const duplicateOrder = (orderId) => {
    const orderToDuplicate = orders.find((o) => o.id === orderId);
    if (!orderToDuplicate) return;

    const newOrder = {
      ...orderToDuplicate,
      id: generateOrderId(),
      createdAt: new Date(),
      // Deep copy cart to avoid reference issues
      cart: orderToDuplicate.cart.map((item) => ({ ...item })),
    };

    setOrders((prev) => [...prev, newOrder]);
    setActiveOrderId(newOrder.id);
    toast.success("Order duplicated");
  };

  // ========== UPDATE ACTIVE ORDER ==========

  const updateActiveOrder = (updates) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === activeOrderId ? { ...order, ...updates } : order
      )
    );
  };

  const setCustomer = (customer) => {
    updateActiveOrder({ customer });
  };

  const setPaymentMethod = (method) => {
    // Reset cashReceived when switching to non-cash payment
    const updates = { paymentMethod: method };
    if (method !== "cash") {
      updates.cashReceived = "";
    }
    updateActiveOrder(updates);
  };

  const setCart = (cart) => {
    updateActiveOrder({ cart });
  };

  // ========== CUSTOMER MANAGEMENT ==========

  const handleCreateCustomer = useCallback(async () => {
    if (!newCustomerData.name.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    if (
      newCustomerData.phone.trim() &&
      !/^\d{10}$/.test(newCustomerData.phone.trim())
    ) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    setIsCreatingCustomer(true);
    try {
      const customerData = {
        name: newCustomerData.name.trim(),
        email: newCustomerData.email.trim() || null,
        phone: newCustomerData.phone.trim() || null,
        address: null,
      };

      const response = await customerService.createCustomer(customerData);
      const createdCustomer = response.data || response;

      if (!createdCustomer.id) {
        throw new Error("Invalid customer response");
      }

      setCustomer(createdCustomer);
      setNewCustomerData({ name: "", email: "", phone: "" });
      setShowNewCustomerForm(false);
      toast.success("New customer created");
    } catch (error) {
      console.error("Customer creation error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Cannot create customer";
      toast.error(message);
    } finally {
      setIsCreatingCustomer(false);
    }
  }, [newCustomerData]);

  // ========== MEDICATION SEARCH ==========

  const handleSearchMedications = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchMedications(searchTerm);
      const medications = Array.isArray(response)
        ? response
        : response.data || [];

      const normalizedMedications = medications.map((m) => ({
        ...m,
        availableQuantity: m.availableQuantity || m.available_quantity || 0,
        medicationName: m.medicationName || m.medication_name || m.name,
        variantName: m.variantName || m.variant_name || m.name,
        sellPrice: m.sellPrice || m.sell_price || 0,
      }));

      const availableMedications = normalizedMedications.filter((m) => {
        const qty = Number(m.availableQuantity) || 0;
        return qty > 0;
      });

      setSearchResults(availableMedications);

      if (availableMedications.length === 0 && medications.length > 0) {
        toast.info("Products found but out of stock");
      }
    } catch (error) {
      console.error("Medication search error:", error);
      toast.error("Cannot search products");
    } finally {
      setIsSearching(false);
    }
  }, []);

  // ========== CART MANAGEMENT ==========

  const handleAddToCart = useCallback(
    (medication) => {
      if (!medication.id || !medication.sellPrice) {
        toast.error("Invalid product information");
        return;
      }

      const availableQty = Number(medication.availableQuantity) || 0;
      if (availableQty <= 0) {
        toast.error("Product out of stock");
        return;
      }

      const existingItem = activeOrder.cart.find(
        (item) => item.medication_variant_id === medication.id
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        if (newQuantity > availableQty) {
          toast.error(`Cannot exceed stock quantity (${availableQty})`);
          return;
        }

        const updatedCart = activeOrder.cart.map((item) =>
          item.medication_variant_id === medication.id
            ? { ...item, quantity: newQuantity }
            : item
        );
        setCart(updatedCart);
        toast.success(`Increased quantity to ${newQuantity}`);
      } else {
        const newItem = {
          medication_variant_id: medication.id,
          medicationName: medication.medicationName || medication.name,
          variantName: medication.variantName || "",
          sellPrice: Number(medication.sellPrice),
          availableQuantity: availableQty,
          quantity: 1,
        };
        setCart([...activeOrder.cart, newItem]);
        toast.success(`Added ${medication.medicationName || medication.name}`);
      }
      setSearchResults([]);
    },
    [activeOrder]
  );

  const updateCartItem = useCallback(
    (index, quantity) => {
      // Allow empty string for editing (will be fixed on blur)
      if (quantity === "" || quantity === 0) {
        const updatedCart = [...activeOrder.cart];
        updatedCart[index] = {
          ...updatedCart[index],
          quantity: quantity === "" ? "" : 0,
        };
        setCart(updatedCart);
        return;
      }

      if (quantity < 0) {
        return;
      }

      const item = activeOrder.cart[index];
      if (quantity > item.availableQuantity) {
        toast.error(`Cannot exceed stock quantity (${item.availableQuantity})`);
        return;
      }

      const updatedCart = [...activeOrder.cart];
      updatedCart[index] = { ...updatedCart[index], quantity };
      setCart(updatedCart);
    },
    [activeOrder]
  );

  const removeCartItem = useCallback(
    (index) => {
      const item = activeOrder.cart[index];
      const newCart = activeOrder.cart.filter((_, i) => i !== index);
      setCart(newCart);
      toast.success(`Removed ${item.medicationName}`);
    },
    [activeOrder]
  );

  // ========== COMPLETE ORDER ==========

  const handleCompleteOrder = useCallback(async () => {
    if (!activeOrder.customer) {
      toast.error("Please select a customer");
      return;
    }

    if (activeOrder.cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const invalidItems = activeOrder.cart.filter(
      (item) => !item.medication_variant_id || item.quantity <= 0
    );
    if (invalidItems.length > 0) {
      toast.error("Cart has invalid items");
      return;
    }

    // If payment method is VietQR, show QR dialog first
    if (activeOrder.paymentMethod === "mobile_payment") {
      setPendingOrderData({
        id: generateOrderId(),
        customer_id: activeOrder.customer.id,
        payment_method: activeOrder.paymentMethod,
        total: totalAmount,
        items: activeOrder.cart.map((item) => ({
          medication_variant_id: item.medication_variant_id,
          quantity: item.quantity,
        })),
      });
      setShowVietQRDialog(true);
      return;
    }

    // For cash payment, proceed directly
    await submitOrder();
  }, [activeOrder, totalAmount]);

  const submitOrder = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const orderData = pendingOrderData || {
        customer_id: activeOrder.customer.id,
        payment_method: activeOrder.paymentMethod,
        items: activeOrder.cart.map((item) => ({
          medication_variant_id: item.medication_variant_id,
          quantity: item.quantity,
        })),
      };

      const response = await salesService.createSalesOrder(orderData);
      const createdOrder = response.data || response;

      const enrichedOrder = {
        ...createdOrder,
        items:
          createdOrder.items?.map((orderItem) => {
            const cartItem = activeOrder.cart.find(
              (c) => c.medication_variant_id === orderItem.medicationVariantId
            );
            return {
              ...orderItem,
              medicationName: cartItem?.medicationName || "Unknown",
              variantName: cartItem?.variantName || "",
              sellPrice: orderItem.sellPrice || cartItem?.sellPrice || 0,
            };
          }) || [],
      };

      setSuccessOrder(enrichedOrder);
      toast.success("Order created successfully!");

      // Note: Invoice email will be sent automatically when order is marked as "paid"

      setPendingOrderData(null);
      setShowVietQRDialog(false);

      // Remove completed order from list
      setTimeout(() => {
        setOrders((prev) => {
          const filtered = prev.filter((o) => o.id !== activeOrderId);
          // Create new order if this was the last one
          if (filtered.length === 0) {
            const newOrder = {
              id: generateOrderId(),
              customer: null,
              cart: [],
              paymentMethod: "cash",
              cashReceived: "",
              createdAt: new Date(),
            };
            setActiveOrderId(newOrder.id);
            return [newOrder];
          }
          setActiveOrderId(filtered[0].id);
          return filtered;
        });
      }, 1500);
    } catch (error) {
      console.error("Order creation error:", error);
      let message = "Cannot create order";

      if (error?.response?.data?.error) {
        const errorData = error.response.data.error;
        if (typeof errorData === "object" && errorData.message) {
          message = errorData.message;
        } else if (typeof errorData === "string") {
          message = errorData;
        }
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.message) {
        message = error.message;
      }

      toast.error(
        typeof message === "string" ? message : "Cannot create order"
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [activeOrder, activeOrderId, pendingOrderData, changeAmount]);

  const handleCloseSuccessModal = useCallback(() => {
    setSuccessOrder(null);
  }, []);

  // ========== ORDER COUNT BADGE ==========
  const getOrderBadgeText = (order) => {
    const itemCount = order.cart.length;
    if (itemCount === 0) return "Empty";
    return `${itemCount} item${itemCount > 1 ? "s" : ""}`;
  };

  if (!activeOrder) return null;

  return (
    <AppLayout>
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Sales</h1>
                <p className="text-sm text-muted-foreground">
                  Manage multiple orders simultaneously
                </p>
              </div>
            </div>
            <Button
              onClick={createNewOrder}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </div>

          {/* Order Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto mt-4 pb-2">
            {orders.map((order, index) => {
              const isActive = order.id === activeOrderId;
              return (
                <div
                  key={order.id}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
                    isActive
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card hover:border-primary/50 text-muted-foreground"
                  }`}
                  onClick={() => setActiveOrderId(order.id)}
                >
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Order #{index + 1}</span>
                  <Badge
                    variant={isActive ? "default" : "outline"}
                    className="ml-1"
                  >
                    {getOrderBadgeText(order)}
                  </Badge>

                  {/* Order Actions */}
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateOrder(order.id);
                      }}
                      title="Duplicate order"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    {orders.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(order.id);
                        }}
                        title="Delete order"
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
          {/* Left: Product Search & Cart */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
            {/* Product Search */}
            <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  Search Products
                </h2>
                <MedicationSearch
                  onSearch={handleSearchMedications}
                  isSearching={isSearching}
                  results={searchResults}
                  onSelectMedication={handleAddToCart}
                />
              </div>

              {/* Cart Items */}
              {activeOrder.cart.length > 0 && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <h2 className="text-lg font-semibold text-foreground mb-3">
                    Cart ({activeOrder.cart.length})
                  </h2>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {activeOrder.cart.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {item.medicationName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.variantName}
                          </p>
                          <p className="text-sm text-foreground mt-1">
                            {item.sellPrice.toLocaleString("vi-VN")} đ ×{" "}
                            {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <div className="flex items-center border border-border rounded-md overflow-hidden">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                updateCartItem(
                                  index,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 p-0 hover:bg-muted rounded-none"
                            >
                              <span className="text-lg font-bold">−</span>
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              max={item.availableQuantity}
                              value={item.quantity}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow empty string for editing
                                if (value === "" || value === "0") {
                                  updateCartItem(index, "");
                                  return;
                                }
                                const val = Number.parseInt(value);
                                if (!isNaN(val)) {
                                  if (val > item.availableQuantity) {
                                    toast.warning(
                                      `Maximum available: ${item.availableQuantity}`
                                    );
                                    updateCartItem(
                                      index,
                                      item.availableQuantity
                                    );
                                  } else {
                                    updateCartItem(index, val);
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                const val = Number.parseInt(e.target.value);
                                if (
                                  isNaN(val) ||
                                  val < 1 ||
                                  e.target.value === ""
                                ) {
                                  updateCartItem(index, 1);
                                } else if (val > item.availableQuantity) {
                                  toast.warning(
                                    `Maximum available: ${item.availableQuantity}`
                                  );
                                  updateCartItem(index, item.availableQuantity);
                                }
                              }}
                              className="w-14 h-8 text-center text-sm border-0 border-x border-border focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                updateCartItem(
                                  index,
                                  Math.min(
                                    item.availableQuantity,
                                    item.quantity + 1
                                  )
                                )
                              }
                              disabled={item.quantity >= item.availableQuantity}
                              className="h-8 w-8 p-0 hover:bg-muted rounded-none"
                            >
                              <span className="text-lg font-bold">+</span>
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCartItem(index)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Payment & Complete */}
            {activeOrder.cart.length > 0 && (
              <div className="border-t border-border p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Payment Method
                  </h3>
                  <PaymentMethodSelector
                    value={activeOrder.paymentMethod}
                    onChange={setPaymentMethod}
                  />
                </div>

                {/* Cash Payment Details */}
                {activeOrder.paymentMethod === "cash" && (
                  <div className="space-y-3 p-4 bg-muted rounded-lg border">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Cash Received (in thousands VNĐ)
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="Enter amount (e.g., 100 = 100,000 VNĐ)"
                          value={activeOrder.cashReceived}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateActiveOrder({ cashReceived: value });
                          }}
                          className="text-lg pr-16"
                          min="0"
                          step="1"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                          × 1,000
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Example: Enter "100" for 100,000 VNĐ
                      </p>
                    </div>

                    {activeOrder.cashReceived && (
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-semibold">
                            {totalAmount.toLocaleString("vi-VN")} VNĐ
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Received:
                          </span>
                          <span className="font-semibold">
                            {(
                              Number(activeOrder.cashReceived || 0) * 1000
                            ).toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </span>
                        </div>
                        <div className="flex justify-between text-base pt-2 border-t">
                          <span className="font-semibold">Change:</span>
                          <span
                            className={`font-bold text-lg ${changeAmount < 0 ? "text-red-600" : "text-green-600"}`}
                          >
                            {changeAmount.toLocaleString("vi-VN")} VNĐ
                          </span>
                        </div>
                        {changeAmount < 0 && (
                          <p className="text-xs text-red-600 mt-1">
                            Insufficient payment! Need{" "}
                            {Math.abs(changeAmount).toLocaleString("vi-VN")} VNĐ
                            more
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleCompleteOrder}
                  disabled={
                    !activeOrder.customer ||
                    isSubmitting ||
                    (activeOrder.paymentMethod === "cash" &&
                      (!activeOrder.cashReceived || changeAmount < 0))
                  }
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Complete Order
                    </div>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Right Sidebar: Customer & Summary */}
          <div className="w-80 flex flex-col overflow-hidden border-l border-border bg-card">
            {/* Customer Section */}
            <div className="flex-1 flex flex-col overflow-hidden border-b border-border">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Customer</h3>
                  </div>
                  {activeOrder.customer && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCustomer(null)}
                      className="text-xs"
                    >
                      Change
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {activeOrder.customer ? (
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="font-semibold text-foreground">
                      {activeOrder.customer.name}
                    </p>
                    {activeOrder.customer.phone && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {activeOrder.customer.phone}
                      </p>
                    )}
                    {activeOrder.customer.email && (
                      <p className="text-sm text-muted-foreground">
                        {activeOrder.customer.email}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <CustomerSelector onSelectCustomer={setCustomer} />
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-card text-muted-foreground">
                          or
                        </span>
                      </div>
                    </div>
                    {showNewCustomerForm ? (
                      <div className="space-y-2">
                        <Input
                          placeholder="Customer name"
                          value={newCustomerData.name}
                          onChange={(e) =>
                            setNewCustomerData({
                              ...newCustomerData,
                              name: e.target.value,
                            })
                          }
                          className="text-sm"
                        />
                        <Input
                          placeholder="Email (optional)"
                          type="email"
                          value={newCustomerData.email}
                          onChange={(e) =>
                            setNewCustomerData({
                              ...newCustomerData,
                              email: e.target.value,
                            })
                          }
                          className="text-sm"
                        />
                        <Input
                          placeholder="Phone (optional)"
                          value={newCustomerData.phone}
                          onChange={(e) =>
                            setNewCustomerData({
                              ...newCustomerData,
                              phone: e.target.value,
                            })
                          }
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleCreateCustomer}
                            disabled={isCreatingCustomer}
                            size="sm"
                            className="flex-1 bg-primary hover:bg-primary/90"
                          >
                            {isCreatingCustomer ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              "Create"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowNewCustomerForm(false)}
                            size="sm"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setShowNewCustomerForm(true)}
                        className="w-full text-sm"
                      >
                        <Plus className="w-3 h-3 mr-2" />
                        New Customer
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="flex-1 flex flex-col overflow-hidden border-t border-border">
              <CartSummary
                cart={activeOrder.cart}
                totalAmount={totalAmount}
                selectedCustomer={activeOrder.customer}
                paymentMethod={activeOrder.paymentMethod}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successOrder && (
        <OrderSuccessModal
          order={successOrder}
          onClose={handleCloseSuccessModal}
        />
      )}

      {/* VietQR Payment Dialog */}
      {showVietQRDialog && pendingOrderData && (
        <VietQRPaymentDialog
          open={showVietQRDialog}
          onOpenChange={setShowVietQRDialog}
          orderData={pendingOrderData}
          onPaymentConfirmed={submitOrder}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteOrder(deleteConfirmId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
