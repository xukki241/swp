import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ShoppingCart, User } from "lucide-react";

export default function CartSummary({
  cart,
  totalAmount,
  selectedCustomer,
  paymentMethod,
}) {
  const paymentMethodLabels = {
    cash: "Cash",
    credit_card: "Credit Card",
    bank_transfer: "Bank Transfer",
    mobile_payment: "Mobile Payment",
  };

  return (
    <Card className="border border-gray-200 sticky top-8 bg-gray-50">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          <CardTitle>Order Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Customer Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-gray-600" />
            <p className="text-sm font-semibold text-gray-700">Customer</p>
          </div>
          {selectedCustomer ? (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-semibold text-gray-900">
                {selectedCustomer.name}
              </p>
              {selectedCustomer.phone && (
                <p className="text-xs text-gray-600">
                  {selectedCustomer.phone}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Not selected</p>
          )}
        </div>

        {/* Cart Items */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Products ({cart.length})
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-sm text-gray-500">Cart is empty</p>
            ) : (
              cart.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between text-sm p-2 bg-gray-50 rounded"
                >
                  <span className="text-gray-700">
                    {item.medicationName} × {item.quantity}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {Number(item.quantity * item.sellPrice).toLocaleString(
                      "vi-VN"
                    )}{" "}
                    VNĐ
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Method */}
        {cart.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-gray-600" />
              <p className="text-sm font-semibold text-gray-700">
                Payment Method
              </p>
            </div>
            <p className="text-sm text-gray-900">
              {paymentMethodLabels[paymentMethod]}
            </p>
          </div>
        )}

        {/* Total */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-semibold">Total:</span>
              <span className="text-2xl font-bold text-gray-900">
                {Number(totalAmount).toLocaleString("vi-VN")} VNĐ
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
