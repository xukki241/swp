import { AppLayout } from "@/components/layouts/app-layout";
import { CustomerSelector } from "@/components/pos/CustomerSelector";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { Cart } from "@/components/pos/Cart";
import { CheckoutPanel } from "@/components/pos/CheckoutPanel";
import { usePOS } from "@/hooks/usePOS";

export default function POSPage() {
  const {
    cart,
    selectedCustomer,
    paymentMethod,
    isProcessing,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    setSelectedCustomer,
    setPaymentMethod,
    processOrder,
  } = usePOS();

  const handleCheckout = async () => {
    const result = await processOrder();
    if (result) {
      console.log("[v0] Order created:", result);
    }
  };

  return (
    <AppLayout title="Point of Sale">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Customer & Product Search */}
        <div className="space-y-6 lg:col-span-2">
          <CustomerSelector
            selectedCustomer={selectedCustomer}
            onSelectCustomer={setSelectedCustomer}
          />
          <ProductSearch onAddToCart={addToCart} />
        </div>

        {/* Right Column - Cart & Checkout */}
        <div className="space-y-6">
          <Cart
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            calculateTotal={calculateTotal}
          />
          <CheckoutPanel
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            onCheckout={handleCheckout}
            isProcessing={isProcessing}
            disabled={!selectedCustomer || cart.length === 0}
          />
        </div>
      </div>
    </AppLayout>
  );
}
