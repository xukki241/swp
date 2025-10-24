"use client";

import { Button } from "@/components/ui/button";
import { Banknote, QrCode } from "lucide-react";

export default function PaymentMethodSelector({ value, onChange }) {
  const methods = [
    {
      id: "cash",
      label: "Cash",
      icon: Banknote,
      description: "Pay with cash",
    },
    {
      id: "mobile_payment",
      label: "VietQR",
      icon: QrCode,
      description: "Scan QR to pay",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {methods.map((method) => {
        const Icon = method.icon;
        return (
          <Button
            key={method.id}
            variant={value === method.id ? "default" : "outline"}
            onClick={() => onChange(method.id)}
            className={`h-auto py-4 flex flex-col items-center gap-2 ${value === method.id
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : ""
              }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm font-semibold">{method.label}</span>
            <span className="text-xs opacity-75">{method.description}</span>
          </Button>
        );
      })}
    </div>
  );
}
