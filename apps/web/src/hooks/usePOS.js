"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

import { salesService } from "@/services/salesService";

export function usePOS() {
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);

  // Add item to cart
  const addToCart = useCallback((medication) => {
    setCart((prev) => {
      const existingItem = prev.find(
        (item) => item.medication_variant_id === medication.id
      );

      if (existingItem) {
        return prev.map((item) =>
          item.medication_variant_id === medication.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          medication_variant_id: medication.id,
          quantity: 1,
          name: medication.name,
          sku: medication.sku,
          unitPrice: medication.sellPrice,
          availableStock: medication.availableQuantity || 0,
        },
      ];
    });
    toast.success(`Added ${medication.name} to cart`);
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((medicationVariantId) => {
    setCart((prev) =>
      prev.filter((item) => item.medication_variant_id !== medicationVariantId)
    );
    toast.info("Item removed from cart");
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((medicationVariantId, quantity) => {
    if (quantity < 1) {
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.medication_variant_id === medicationVariantId
          ? { ...item, quantity }
          : item
      )
    );
  }, []);

  // Calculate totals
  const calculateTotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [cart]);

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCustomer(null);
    setPaymentMethod("cash");
  }, []);

  // Process order
  const processOrder = useCallback(async () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return false;
    }

    if (cart.length === 0) {
      toast.error("Cart is empty");
      return false;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        customer_id: selectedCustomer.id,
        payment_method: paymentMethod,
        items: cart.map((item) => ({
          medication_variant_id: item.medication_variant_id,
          quantity: item.quantity,
        })),
      };

      const response = await salesService.createSalesOrder(orderData);

      toast.success("Order created successfully!");
      clearCart();
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to create order";
      toast.error(errorMessage);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedCustomer, cart, paymentMethod, clearCart]);

  return {
    cart,
    selectedCustomer,
    paymentMethod,
    isProcessing,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    clearCart,
    setSelectedCustomer,
    setPaymentMethod,
    processOrder,
  };
}
