import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Copy, CreditCard } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { toast } from "sonner";

const BANK_INFO = {
  bankId: "970422", // MB Bank
  accountNo: "0383238586", // Số tài khoản
  accountName: "CONG TY PHARMAFLOW",
};

export function VietQRPaymentDialog({
  open,
  onOpenChange,
  orderData,
  onPaymentConfirmed,
}) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!orderData) return null;

  const amount = Math.round(orderData.total);
  const orderId = orderData.id?.substring(0, 8).toUpperCase() || "NEW";
  const transferContent = `PF ${orderId}`;

  const vietQRUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(
    transferContent
  )}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  const handleCopyInfo = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} đã được sao chép`);
  };

  const handleConfirmPayment = async () => {
    setIsConfirming(true);
    try {
      await onPaymentConfirmed();
      toast.success("Xác nhận thanh toán thành công!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Không thể xác nhận thanh toán");
      console.error(error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Thanh toán qua VietQR
          </DialogTitle>
          <DialogDescription>
            Quét mã QR bằng ứng dụng ngân hàng để hoàn tất thanh toán
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* QR Code */}
          <div className="flex justify-center p-4 bg-white rounded-lg border">
            <img
              src={vietQRUrl}
              alt="Mã VietQR"
              className="w-64 h-64 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <div style={{ display: "none" }}>
              <QRCodeSVG
                value={vietQRUrl}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-3 bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Ngân hàng:</span>
              <span className="text-sm">{BANK_INFO.accountName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Số tài khoản:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono">{BANK_INFO.accountNo}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() =>
                    handleCopyInfo(BANK_INFO.accountNo, "Số tài khoản")
                  }
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Số tiền:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">
                  {amount.toLocaleString("vi-VN")} VNĐ
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleCopyInfo(amount.toString(), "Số tiền")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Nội dung chuyển khoản:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono bg-yellow-100 px-2 py-1 rounded">
                  {transferContent}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() =>
                    handleCopyInfo(transferContent, "Nội dung chuyển khoản")
                  }
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="font-medium text-blue-900 mb-2">
              Hướng dẫn thanh toán:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>Mở ứng dụng ngân hàng của bạn</li>
              <li>Quét mã QR hoặc nhập thủ công thông tin tài khoản</li>
              <li>Kiểm tra lại số tiền và nội dung chuyển khoản</li>
              <li>Hoàn tất thanh toán</li>
              <li>
                Sau khi đã thanh toán, bấm nút{" "}
                <span className="font-semibold">"Đã nhận thanh toán"</span> bên
                dưới
              </li>
            </ol>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirmPayment}
            disabled={isConfirming}
            className="bg-green-600 hover:bg-green-700"
          >
            {isConfirming ? (
              <>Đang xử lý...</>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Đã nhận thanh toán
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
