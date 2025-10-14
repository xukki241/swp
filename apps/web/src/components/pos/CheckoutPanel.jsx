import { CreditCard, Banknote, Smartphone, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const paymentMethods = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "credit_card", label: "Credit Card", icon: CreditCard },
  { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
  { value: "mobile_payment", label: "Mobile Payment", icon: Smartphone },
];

export function CheckoutPanel({
  paymentMethod,
  onPaymentMethodChange,
  onCheckout,
  isProcessing,
  disabled,
}) {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Method</h3>

        <div className="grid grid-cols-2 gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.value}
                onClick={() => onPaymentMethodChange(method.value)}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  paymentMethod === method.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Icon
                  className={`h-6 w-6 ${paymentMethod === method.value ? "text-primary" : "text-muted-foreground"}`}
                />
                <span
                  className={`text-sm font-medium ${
                    paymentMethod === method.value
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  {method.label}
                </span>
              </button>
            );
          })}
        </div>

        <Button
          onClick={onCheckout}
          disabled={disabled || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? "Processing..." : "Complete Order"}
        </Button>
      </div>
    </Card>
  );
}
