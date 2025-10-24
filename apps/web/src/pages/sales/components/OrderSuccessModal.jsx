"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Printer, X } from "lucide-react";

export default function OrderSuccessModal({ order, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-2 border-green-500">
        <CardHeader className="bg-green-50 border-b border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <CardTitle className="text-xl">Order Successful!</CardTitle>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Order ID */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="text-lg font-bold text-gray-900">{order.id}</p>
          </div>

          {/* Order Details */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-gray-900">
                {order.status || "pending"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-semibold text-gray-900">
                {order.paymentMethod}
              </span>
            </div>
            {order.salesperson && (
              <div className="flex justify-between">
                <span className="text-gray-600">Salesperson:</span>
                <span className="font-semibold text-gray-900">
                  {order.salesperson.name || order.salesperson.email}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-lg text-green-600">
                {Number(order.totalAmount || 0).toLocaleString("vi-VN")} VNĐ
              </span>
            </div>
          </div>

          {/* Items */}
          {order.items && order.items.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Products:
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm p-2 bg-gray-50 rounded"
                  >
                    <span className="text-gray-700">
                      {item.medicationName || item.name || "Product"} ×{" "}
                      {item.quantity}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {Number(
                        (item.quantity || 0) * (item.sellPrice || 0)
                      ).toLocaleString("vi-VN")}{" "}
                      VNĐ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex-1 bg-transparent"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Order
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Continue Selling
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
