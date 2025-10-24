import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, ShoppingCart, User } from "lucide-react"

export default function CartSummary({ cart, totalAmount, selectedCustomer, paymentMethod }) {
  const paymentMethodLabels = {
    cash: "Tiền mặt",
    credit_card: "Thẻ tín dụng",
    bank_transfer: "Chuyển khoản",
    mobile_payment: "Ví điện tử",
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <CardHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <CardTitle className="text-base">Tóm tắt đơn hàng</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Customer Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs font-semibold text-muted-foreground uppercase">Khách hàng</p>
          </div>
          {selectedCustomer ? (
            <p className="text-sm font-semibold text-foreground">{selectedCustomer.name}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Chưa chọn</p>
          )}
        </div>

        {/* Cart Items */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Sản phẩm ({cart.length})</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-xs text-muted-foreground">Giỏ trống</p>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="flex justify-between text-xs p-2 bg-muted rounded">
                  <span className="text-foreground truncate">
                    {item.medicationName} × {item.quantity}
                  </span>
                  <span className="font-semibold text-foreground whitespace-nowrap ml-2">
                    {Number(item.quantity * item.sellPrice).toLocaleString("vi-VN")}đ
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
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase">Thanh toán</p>
            </div>
            <p className="text-sm text-foreground">{paymentMethodLabels[paymentMethod]}</p>
          </div>
        )}

        {/* Total */}
        {cart.length > 0 && (
          <div className="border-t border-border pt-3 mt-auto">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-muted-foreground">Tổng cộng:</span>
              <span className="text-xl font-bold text-primary">{Number(totalAmount).toLocaleString("vi-VN")}đ</span>
            </div>
          </div>
        )}
      </CardContent>
    </div>
  )
}
