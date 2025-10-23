"use client";

import { AppLayout } from "@/components/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import CartSummary from "./components/CartSummary";
import CustomerSelector from "./components/CustomerSelector";
import MedicationSearch from "./components/MedicationSearch";
import OrderSuccessModal from "./components/OrderSuccessModal";
import PaymentMethodSelector from "./components/PaymentMethodSelector";

// Generate unique order ID
const generateOrderId = () => `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function SalesPageV2() {
    // Multi-order state
    const [orders, setOrders] = useState([
        {
            id: generateOrderId(),
            customer: null,
            cart: [],
            paymentMethod: "cash",
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

    // ========== ORDER MANAGEMENT ==========

    const createNewOrder = () => {
        const newOrder = {
            id: generateOrderId(),
            customer: null,
            cart: [],
            paymentMethod: "cash",
            createdAt: new Date(),
        };
        setOrders((prev) => [...prev, newOrder]);
        setActiveOrderId(newOrder.id);
        toast.success("Đã tạo đơn hàng mới");
    };

    const deleteOrder = (orderId) => {
        if (orders.length === 1) {
            toast.error("Phải có ít nhất 1 đơn hàng");
            return;
        }

        setOrders((prev) => prev.filter((o) => o.id !== orderId));

        // Switch to another order if deleting active one
        if (activeOrderId === orderId) {
            const remainingOrders = orders.filter((o) => o.id !== orderId);
            setActiveOrderId(remainingOrders[0].id);
        }

        toast.success("Đã xóa đơn hàng");
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
        toast.success("Đã nhân bản đơn hàng");
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
        updateActiveOrder({ paymentMethod: method });
    };

    const setCart = (cart) => {
        updateActiveOrder({ cart });
    };

    // ========== CUSTOMER MANAGEMENT ==========

    const handleCreateCustomer = useCallback(async () => {
        if (!newCustomerData.name.trim()) {
            toast.error("Vui lòng nhập tên khách hàng");
            return;
        }

        if (
            newCustomerData.phone.trim() &&
            !/^\d{10}$/.test(newCustomerData.phone.trim())
        ) {
            toast.error("Số điện thoại phải có 10 chữ số");
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
            toast.success("Đã tạo khách hàng mới");
        } catch (error) {
            console.error("Customer creation error:", error);
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Không thể tạo khách hàng";
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
                toast.info("Tìm thấy sản phẩm nhưng đã hết hàng");
            }
        } catch (error) {
            console.error("Medication search error:", error);
            toast.error("Không thể tìm kiếm sản phẩm");
        } finally {
            setIsSearching(false);
        }
    }, []);

    // ========== CART MANAGEMENT ==========

    const handleAddToCart = useCallback(
        (medication) => {
            if (!medication.id || !medication.sellPrice) {
                toast.error("Thông tin sản phẩm không hợp lệ");
                return;
            }

            const availableQty = Number(medication.availableQuantity) || 0;
            if (availableQty <= 0) {
                toast.error("Sản phẩm đã hết hàng");
                return;
            }

            const existingItem = activeOrder.cart.find(
                (item) => item.medication_variant_id === medication.id
            );

            if (existingItem) {
                const newQuantity = existingItem.quantity + 1;
                if (newQuantity > availableQty) {
                    toast.error(`Không thể vượt quá số lượng tồn kho (${availableQty})`);
                    return;
                }

                const updatedCart = activeOrder.cart.map((item) =>
                    item.medication_variant_id === medication.id
                        ? { ...item, quantity: newQuantity }
                        : item
                );
                setCart(updatedCart);
                toast.success(`Đã tăng số lượng lên ${newQuantity}`);
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
                toast.success(`Đã thêm ${medication.medicationName || medication.name}`);
            }
            setSearchResults([]);
        },
        [activeOrder]
    );

    const updateCartItem = useCallback(
        (index, quantity) => {
            if (quantity <= 0) {
                removeCartItem(index);
                return;
            }

            const item = activeOrder.cart[index];
            if (quantity > item.availableQuantity) {
                toast.error(
                    `Không thể vượt quá số lượng tồn kho (${item.availableQuantity})`
                );
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
            toast.success(`Đã xóa ${item.medicationName}`);
        },
        [activeOrder]
    );

    // ========== COMPLETE ORDER ==========

    const handleCompleteOrder = useCallback(async () => {
        if (!activeOrder.customer) {
            toast.error("Vui lòng chọn khách hàng");
            return;
        }

        if (activeOrder.cart.length === 0) {
            toast.error("Giỏ hàng trống");
            return;
        }

        const invalidItems = activeOrder.cart.filter(
            (item) => !item.medication_variant_id || item.quantity <= 0
        );
        if (invalidItems.length > 0) {
            toast.error("Giỏ hàng có sản phẩm không hợp lệ");
            return;
        }

        setIsSubmitting(true);

        try {
            const orderData = {
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
            toast.success("Đơn hàng đã được tạo thành công!");

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
            } else if (error?.message) {
                message = error.message;
            }

            toast.error(typeof message === "string" ? message : "Không thể tạo đơn hàng");
        } finally {
            setIsSubmitting(false);
        }
    }, [activeOrder, activeOrderId]);

    const handleCloseSuccessModal = useCallback(() => {
        setSuccessOrder(null);
    }, []);

    // ========== ORDER COUNT BADGE ==========
    const getOrderBadgeText = (order) => {
        const itemCount = order.cart.length;
        if (itemCount === 0) return "Trống";
        return `${itemCount} SP`;
    };

    if (!activeOrder) return null;

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="w-8 h-8 text-gray-700" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Point of Sale - Multi Order
                                </h1>
                                <p className="text-gray-600">
                                    Quản lý nhiều đơn hàng cùng lúc
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={createNewOrder}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Đơn mới
                        </Button>
                    </div>

                    {/* Order Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {orders.map((order, index) => {
                            const isActive = order.id === activeOrderId;
                            return (
                                <div
                                    key={order.id}
                                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${isActive
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                        }`}
                                    onClick={() => setActiveOrderId(order.id)}
                                >
                                    <FileText className="h-4 w-4" />
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Đơn #{index + 1}</span>
                                        <Badge variant={isActive ? "default" : "outline"}>
                                            {getOrderBadgeText(order)}
                                        </Badge>
                                    </div>

                                    {/* Order Actions */}
                                    <div className="flex items-center gap-1 ml-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                duplicateOrder(order.id);
                                            }}
                                            title="Nhân bản đơn"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                        {orders.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-red-500 hover:text-red-600"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteConfirmId(order.id);
                                                }}
                                                title="Xóa đơn"
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

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Step 1: Customer Selection */}
                        <Card className="border border-gray-200 bg-gray-50">
                            <CardHeader className="bg-gray-50 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                                        1
                                    </div>
                                    <CardTitle className="text-lg">Chọn khách hàng</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {activeOrder.customer ? (
                                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {activeOrder.customer.name}
                                            </p>
                                            {activeOrder.customer.phone && (
                                                <p className="text-sm text-gray-600">
                                                    {activeOrder.customer.phone}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCustomer(null)}
                                        >
                                            Đổi
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <CustomerSelector onSelectCustomer={setCustomer} />
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-300"></div>
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="px-2 bg-white text-gray-500">hoặc</span>
                                            </div>
                                        </div>
                                        {showNewCustomerForm ? (
                                            <div className="space-y-3">
                                                <Input
                                                    placeholder="Tên khách hàng"
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
                                                    type="email"
                                                    value={newCustomerData.email}
                                                    onChange={(e) =>
                                                        setNewCustomerData({
                                                            ...newCustomerData,
                                                            email: e.target.value,
                                                        })
                                                    }
                                                />
                                                <Input
                                                    placeholder="Số điện thoại - 10 chữ số (tùy chọn)"
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
                                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        {isCreatingCustomer ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                Đang tạo...
                                                            </>
                                                        ) : (
                                                            "Tạo khách hàng"
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
                                                Tạo khách hàng mới
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Step 2: Add Products */}
                        <Card className="border border-gray-200 bg-gray-50">
                            <CardHeader className="bg-gray-50 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                                        2
                                    </div>
                                    <CardTitle className="text-lg">Thêm sản phẩm</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <MedicationSearch
                                    onSearch={handleSearchMedications}
                                    isSearching={isSearching}
                                    results={searchResults}
                                    onSelectMedication={handleAddToCart}
                                />
                            </CardContent>
                        </Card>

                        {/* Step 3: Manage Cart */}
                        {activeOrder.cart.length > 0 && (
                            <Card className="border border-gray-200 bg-gray-50">
                                <CardHeader className="bg-gray-50 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                                            3
                                        </div>
                                        <CardTitle className="text-lg">Quản lý giỏ hàng</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        {activeOrder.cart.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">
                                                        {item.medicationName}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {item.variantName}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {item.sellPrice.toLocaleString("vi-VN")} đ × {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max={item.availableQuantity}
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            updateCartItem(
                                                                index,
                                                                Number.parseInt(e.target.value) || 1
                                                            )
                                                        }
                                                        className="w-16 text-center"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeCartItem(index)}
                                                        className="text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 4: Payment Method */}
                        {activeOrder.cart.length > 0 && (
                            <Card className="border border-gray-200 bg-gray-50">
                                <CardHeader className="bg-gray-50 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                                            4
                                        </div>
                                        <CardTitle className="text-lg">
                                            Phương thức thanh toán
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <PaymentMethodSelector
                                        value={activeOrder.paymentMethod}
                                        onChange={setPaymentMethod}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 5: Complete Order */}
                        {activeOrder.cart.length > 0 && (
                            <Card className="border border-green-200 bg-green-50">
                                <CardHeader className="bg-green-100 border-b border-green-200">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white font-bold">
                                            5
                                        </div>
                                        <CardTitle className="text-lg">Hoàn tất đơn hàng</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <Button
                                        onClick={handleCompleteOrder}
                                        disabled={!activeOrder.customer || isSubmitting}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Đang xử lý...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5" />
                                                Hoàn tất đơn hàng
                                            </div>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar: Order Summary */}
                    <div className="lg:col-span-1">
                        <CartSummary
                            cart={activeOrder.cart}
                            totalAmount={totalAmount}
                            selectedCustomer={activeOrder.customer}
                            paymentMethod={activeOrder.paymentMethod}
                        />
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

            {/* Delete Confirmation */}
            <AlertDialog
                open={deleteConfirmId !== null}
                onOpenChange={() => setDeleteConfirmId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa đơn hàng</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteOrder(deleteConfirmId)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
