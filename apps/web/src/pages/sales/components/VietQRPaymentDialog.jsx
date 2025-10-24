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
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

const BANK_INFO = {
    bankId: "970422", // MB Bank (có thể thay đổi)
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

    // Don't render if no order data
    if (!orderData) {
        return null;
    }

    // Format số tiền (VND không có phần thập phân)
    const amount = Math.round(orderData.total);

    // Tạo mã đơn hàng ngắn gọn (8 ký tự cuối của ID)
    const orderId = orderData.id?.substring(0, 8).toUpperCase() || "NEW";

    // Nội dung chuyển khoản
    const transferContent = `PF ${orderId}`;

    // Tạo VietQR URL theo chuẩn
    // Format: https://img.vietqr.io/image/{BANK_ID}-{ACCOUNT_NO}-{TEMPLATE}.png?amount={AMOUNT}&addInfo={MESSAGE}
    const vietQRUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

    const handleCopyInfo = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    const handleConfirmPayment = async () => {
        setIsConfirming(true);
        try {
            // Gọi callback để xác nhận thanh toán
            await onPaymentConfirmed();
            toast.success("Payment confirmed successfully!");
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to confirm payment");
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
                        VietQR Payment
                    </DialogTitle>
                    <DialogDescription>
                        Scan QR code with any banking app to complete payment
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* QR Code */}
                    <div className="flex justify-center p-4 bg-white rounded-lg border">
                        <img
                            src={vietQRUrl}
                            alt="VietQR Code"
                            className="w-64 h-64 object-contain"
                            onError={(e) => {
                                // Fallback to QRCodeSVG if image fails
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        <div style={{ display: 'none' }}>
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
                            <span className="text-sm font-medium">Bank:</span>
                            <span className="text-sm">{BANK_INFO.accountName}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Account Number:</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-mono">{BANK_INFO.accountNo}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleCopyInfo(BANK_INFO.accountNo, "Account number")}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Amount:</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold">
                                    {amount.toLocaleString("vi-VN")} VND
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleCopyInfo(amount.toString(), "Amount")}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Transfer Content:</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-mono bg-yellow-100 px-2 py-1 rounded">
                                    {transferContent}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleCopyInfo(transferContent, "Transfer content")}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                        <p className="font-medium text-blue-900 mb-2">Instructions:</p>
                        <ol className="list-decimal list-inside space-y-1 text-blue-800">
                            <li>Open your banking app</li>
                            <li>Scan the QR code or enter details manually</li>
                            <li>Verify the amount and transfer content</li>
                            <li>Complete the payment</li>
                            <li>Click "Payment Received" below after confirmation</li>
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
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirmPayment}
                        disabled={isConfirming}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isConfirming ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Payment Received
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
