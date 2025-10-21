"use client";

import { useState, useMemo, useCallback } from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShoppingCart, Trash2, Plus, Loader2, CheckCircle } from "lucide-react";
import { customerService } from "@/services/customerService";
import { searchMedications } from "@/services/medicationsService";
import { salesService } from "@/services/salesService";
import CustomerSelector from "./components/CustomerSelector";
import MedicationSearch from "./components/MedicationSearch";
import CartSummary from "./components/CartSummary";
import PaymentMethodSelector from "./components/PaymentMethodSelector";
import OrderSuccessModal from "./components/OrderSuccessModal";

export default function SalesPage() {
  // Step 1: Customer Selection
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  // Step 2: Add Products to Cart
  const [cart, setCart] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Step 4: Payment Method
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Step 5: Complete Order
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  // Calculate total
  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.sellPrice, 0),
    [cart]
  );

  const handleCreateCustomer = useCallback(async () => {
    if (!newCustomerData.name.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    // Validate phone if provided
    if (
      newCustomerData.phone.trim() &&
      !/^\d{10}$/.test(newCustomerData.phone.trim())
    ) {
      toast.error("Phone must be exactly 10 digits");
      return;
    }

    setIsCreatingCustomer(true);
    try {
      // Prepare data with null for empty optional fields
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

      setSelectedCustomer(createdCustomer);
      setNewCustomerData({ name: "", email: "", phone: "" });
      setShowNewCustomerForm(false);
      toast.success("Customer created successfully");
    } catch (error) {
      console.error("[v0] Customer creation error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to create customer";
      toast.error(message);
    } finally {
      setIsCreatingCustomer(false);
    }
  }, [newCustomerData]);

  const handleSearchMedications = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchMedications(searchTerm);
      console.log("[DEBUG] Search response:", response);

      const medications = Array.isArray(response)
        ? response
        : response.data || [];
      console.log("[DEBUG] Medications array:", medications);
      console.log("[DEBUG] First medication:", medications[0]);

      // Normalize data: handle both camelCase and snake_case
      const normalizedMedications = medications.map((m) => ({
        ...m,
        availableQuantity: m.availableQuantity || m.available_quantity || 0,
        medicationName: m.medicationName || m.medication_name || m.name,
        variantName: m.variantName || m.variant_name || m.name,
        sellPrice: m.sellPrice || m.sell_price || 0,
      }));

      // Filter medications that are available for sale and have stock
      const availableMedications = normalizedMedications.filter((m) => {
        const qty = Number(m.availableQuantity) || 0;
        console.log(`[DEBUG] ${m.medicationName} - availableQuantity: ${qty}`);
        return qty > 0;
      });

      console.log("[DEBUG] Available medications:", availableMedications);
      setSearchResults(availableMedications);

      if (availableMedications.length === 0 && medications.length > 0) {
        toast.info("Found products but none are in stock");
      }
    } catch (error) {
      console.error("[DEBUG] Medication search error:", error);
      toast.error(
        "Unable to search medications: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleAddToCart = useCallback(
    (medication) => {
      console.log("[DEBUG] Adding to cart:", medication);

      // Validate medication data
      if (!medication.id || !medication.sellPrice) {
        toast.error("Invalid product information");
        console.error("[DEBUG] Invalid medication:", medication);
        return;
      }

      // Check if available quantity exists and is a number
      const availableQty = Number(medication.availableQuantity) || 0;
      if (availableQty <= 0) {
        toast.error("Product is out of stock");
        console.error("[DEBUG] Out of stock:", medication);
        return;
      }

      const existingItem = cart.find(
        (item) => item.medication_variant_id === medication.id
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        if (newQuantity > availableQty) {
          toast.error(`Cannot exceed available quantity (${availableQty})`);
          return;
        }
        // Update existing item quantity directly
        setCart((prevCart) => {
          const updated = [...prevCart];
          const existingIndex = updated.findIndex(
            (item) => item.medication_variant_id === medication.id
          );
          if (existingIndex !== -1) {
            updated[existingIndex].quantity = newQuantity;
          }
          return updated;
        });
        toast.success(`Increased quantity to ${newQuantity}`);
      } else {
        setCart((prevCart) => [
          ...prevCart,
          {
            medication_variant_id: medication.id,
            medicationName: medication.medicationName || medication.name,
            variantName: medication.variantName || "",
            sellPrice: Number(medication.sellPrice),
            availableQuantity: availableQty,
            quantity: 1,
          },
        ]);
        toast.success(
          `${medication.medicationName || medication.name} added to cart`
        );
      }
      setSearchResults([]);
    },
    [cart]
  );

  const updateCartItem = useCallback(
    (index, quantity) => {
      if (quantity <= 0) {
        removeCartItem(index);
        return;
      }

      const item = cart[index];
      if (quantity > item.availableQuantity) {
        toast.error(
          `Cannot exceed available quantity (${item.availableQuantity})`
        );
        return;
      }

      setCart((prevCart) => {
        const updated = [...prevCart];
        updated[index].quantity = quantity;
        return updated;
      });
    },
    [cart]
  );

  const removeCartItem = useCallback((index) => {
    setCart((prevCart) => {
      const item = prevCart[index];
      const newCart = prevCart.filter((_, i) => i !== index);
      toast.success(`${item.medicationName} removed from cart`);
      return newCart;
    });
  }, []);

  const handleCompleteOrder = useCallback(async () => {
    console.log("[DEBUG] Starting order creation...");
    console.log("[DEBUG] Selected customer:", selectedCustomer);
    console.log("[DEBUG] Cart:", cart);
    console.log("[DEBUG] Payment method:", paymentMethod);

    // Validation
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }

    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    // Validate cart items have valid data
    const invalidItems = cart.filter(
      (item) => !item.medication_variant_id || item.quantity <= 0
    );
    if (invalidItems.length > 0) {
      console.error("[DEBUG] Invalid items:", invalidItems);
      toast.error("Cart contains invalid items");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data according to API spec
      const orderData = {
        customer_id: selectedCustomer.id,
        payment_method: paymentMethod,
        items: cart.map((item) => ({
          medication_variant_id: item.medication_variant_id,
          quantity: item.quantity,
        })),
      };

      console.log("[DEBUG] Creating order with data:", orderData);

      const response = await salesService.createSalesOrder(orderData);
      const createdOrder = response.data || response;

      console.log("[DEBUG] Order created successfully:", createdOrder);

      // Merge cart info with order items for display
      const enrichedOrder = {
        ...createdOrder,
        items:
          createdOrder.items?.map((orderItem) => {
            const cartItem = cart.find(
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

      // Show success modal with order details
      setSuccessOrder(enrichedOrder);
      toast.success("Order created successfully!");

      // Reset form after a delay
      setTimeout(() => {
        setCart([]);
        setSelectedCustomer(null);
        setPaymentMethod("cash");
        setSearchResults([]);
      }, 1500);
    } catch (error) {
      console.error("[DEBUG] Order creation error:", error);
      console.error("[DEBUG] Error response:", error?.response);
      console.error("[DEBUG] Error data:", error?.response?.data);

      // Handle specific error messages from API
      let message = "Unable to create order";

      if (error?.response?.data?.error) {
        const errorData = error.response.data.error;
        // Check if error is an object with message property
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

      console.error("[DEBUG] Final error message:", message);

      // Check for specific inventory errors
      if (
        typeof message === "string" &&
        (message.includes("Insufficient inventory") ||
          message.includes("insufficient"))
      ) {
        toast.error(`Out of stock: ${message}`);
      } else if (
        typeof message === "string" &&
        message.includes("not available for sale")
      ) {
        toast.error("Some products are not available for sale");
      } else {
        toast.error(
          typeof message === "string" ? message : "Unable to create order"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCustomer, cart, paymentMethod]);

  const handleCloseSuccessModal = useCallback(() => {
    setSuccessOrder(null);
  }, []);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
          </div>
          <p className="text-gray-600">
            Complete the 5 steps below to create a sales order
          </p>
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
                  <CardTitle className="text-lg">Select Customer</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {selectedCustomer ? (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedCustomer.name}
                      </p>
                      {selectedCustomer.phone && (
                        <p className="text-sm text-gray-600">
                          {selectedCustomer.phone}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCustomer(null)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <CustomerSelector onSelectCustomer={setSelectedCustomer} />
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">or</span>
                      </div>
                    </div>
                    {showNewCustomerForm ? (
                      <div className="space-y-3">
                        <Input
                          placeholder="Customer name"
                          value={newCustomerData.name}
                          onChange={(e) =>
                            setNewCustomerData({
                              ...newCustomerData,
                              name: e.target.value,
                            })
                          }
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
                        />
                        <Input
                          placeholder="Phone - 10 digits (optional)"
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
                                Creating...
                              </>
                            ) : (
                              "Create Customer"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowNewCustomerForm(false)}
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
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Customer
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
                  <CardTitle className="text-lg">Add Products</CardTitle>
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
            {cart.length > 0 && (
              <Card className="border border-gray-200 bg-gray-50">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                      3
                    </div>
                    <CardTitle className="text-lg">Manage Cart</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {cart.map((item, index) => (
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
                            ${item.sellPrice.toFixed(2)} × {item.quantity}
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
            {cart.length > 0 && (
              <Card className="border border-gray-200 bg-gray-50">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                      4
                    </div>
                    <CardTitle className="text-lg">Payment Method</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <PaymentMethodSelector
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 5: Complete Order */}
            {cart.length > 0 && (
              <Card className="border border-green-200 bg-green-50">
                <CardHeader className="bg-green-100 border-b border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white font-bold">
                      5
                    </div>
                    <CardTitle className="text-lg">Complete Order</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <Button
                    onClick={handleCompleteOrder}
                    disabled={!selectedCustomer || isSubmitting}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg"
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
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar: Order Summary */}
          <div className="lg:col-span-1">
            <CartSummary
              cart={cart}
              totalAmount={totalAmount}
              selectedCustomer={selectedCustomer}
              paymentMethod={paymentMethod}
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
    </AppLayout>
  );
}
