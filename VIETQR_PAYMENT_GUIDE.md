# VietQR Payment Integration Guide

## Overview

VietQR payment has been integrated into the Sales page, allowing customers to pay via bank transfer by scanning a QR code.

## Features Implemented

### 1. **VietQR Payment Dialog Component**

- Location: `apps/web/src/pages/sales/components/VietQRPaymentDialog.jsx`
- Displays QR code for payment
- Shows bank account details
- Manual payment confirmation button
- Copy-to-clipboard functionality for account details

### 2. **Payment Flow**

1. Staff selects **VietQR** as payment method
2. Staff clicks "Complete Order"
3. QR payment dialog appears with:
   - QR code (generated via VietQR API)
   - Bank account number
   - Payment amount
   - Transfer content (order ID)
4. Customer scans QR code with banking app
5. Customer completes payment in their app
6. Staff clicks "Payment Received" to confirm
7. Order is created and saved to database

### 3. **Sales Page Updates**

- All text converted to **English**
- VietQR payment method added to payment selector
- Conditional flow: Cash → direct order creation, VietQR → QR dialog first
- State management for pending orders during QR payment

## Configuration

### Bank Information

Edit `apps/web/src/pages/sales/components/VietQRPaymentDialog.jsx`:

```javascript
const BANK_INFO = {
  bankId: "970422", // MB Bank - Change to your bank ID
  accountNo: "0123456789", // Change to your account number
  accountName: "CONG TY PHARMAFLOW", // Change to your account name
};
```

### Supported Bank IDs (VietQR Standard)

| Bank        | Bank ID |
| ----------- | ------- |
| Vietcombank | 970436  |
| BIDV        | 970418  |
| Vietinbank  | 970415  |
| Agribank    | 970405  |
| MB Bank     | 970422  |
| Techcombank | 970407  |
| ACB         | 970416  |
| VPBank      | 970432  |
| TPBank      | 970423  |
| Sacombank   | 970403  |

[Full list available at VietQR documentation]

## QR Code Generation

### VietQR API

The component uses **VietQR's free image API**:

```
https://img.vietqr.io/image/{BANK_ID}-{ACCOUNT_NO}-{TEMPLATE}.png?amount={AMOUNT}&addInfo={MESSAGE}&accountName={NAME}
```

**Parameters:**

- `BANK_ID`: Bank identifier (e.g., 970422 for MB Bank)
- `ACCOUNT_NO`: Bank account number
- `TEMPLATE`: QR code template (`compact` is used)
- `amount`: Payment amount in VND (no decimals)
- `addInfo`: Transfer content/reference (e.g., "PF A1B2C3D4")
- `accountName`: Account holder name

**Fallback:** If image fails to load, component uses `qrcode.react` library to generate QR locally.

## Transfer Content Format

Order reference is generated as: `PF {ORDER_ID_SHORT}`

Example: `PF A1B2C3D4` (first 8 characters of order ID)

This helps identify payments when reconciling bank statements.

## User Interface

### Payment Method Selector

- **VietQR** button added alongside Cash, Credit Card, Bank Transfer, Mobile Payment
- Icon: QR Code icon from lucide-react
- Description: "Scan QR to pay"

### QR Dialog Features

- Large QR code (256x256px)
- Copy buttons for:
  - Account number
  - Amount
  - Transfer content
- Step-by-step instructions
- "Payment Received" confirmation button
- Cancel option

## Important Notes

### Manual Confirmation

⚠️ **This is NOT automatic payment verification**

- Staff must manually confirm payment
- No webhook or API callback from bank
- Relies on staff checking banking app/statement
- Suitable for in-person transactions with trusted staff

### For Automatic Verification

If you need automatic payment verification, you would need:

1. Bank API integration (requires business account)
2. Payment gateway service (VNPay, ZaloPay, etc.)
3. Webhook endpoint to receive payment notifications
4. Database table to track payment status

## Testing

### Test Flow

1. Go to Sales page
2. Add products to cart
3. Select a customer
4. Choose **VietQR** payment method
5. Click "Complete Order"
6. Verify QR dialog appears with:
   - Valid QR code
   - Correct account details
   - Correct amount
   - Order reference
7. Click "Payment Received"
8. Verify order is created successfully

### QR Code Testing

- Scan with any Vietnamese banking app
- Verify auto-filled fields:
  - Account number
  - Amount
  - Transfer content
- **Do NOT complete payment** (unless testing with real account)

## Security Considerations

1. **Bank Details**: Store in environment variables for production
2. **Payment Confirmation**: Only authorized staff should confirm
3. **Order Reference**: Unique per order to prevent duplicates
4. **Amount Validation**: QR amount matches cart total

## Future Enhancements

### Recommended Improvements

1. **Admin Settings Panel**
   - Configure bank details via UI
   - Store in database instead of hardcoded

2. **Payment History**
   - Log payment confirmations
   - Track who confirmed payment
   - Timestamp of confirmation

3. **Automatic Reconciliation**
   - Parse bank statements
   - Match transfer content with orders
   - Flag unconfirmed payments

4. **Multi-Bank Support**
   - Support multiple accounts
   - Staff selects which account to use
   - Different accounts for different stores

5. **Payment Gateway Integration**
   - Integrate VNPay/ZaloPay/MoMo
   - Automatic verification
   - Better security and tracking

## Translation Updates

All Sales page text converted to English:

- ✅ Headers and titles
- ✅ Button labels
- ✅ Form placeholders
- ✅ Error messages
- ✅ Success notifications
- ✅ Dialog confirmations
- ✅ Cart item labels
- ✅ Payment method descriptions

## Dependencies

### New Package

```json
{
  "qrcode.react": "^4.2.0"
}
```

**Already installed** - no action needed.

## Troubleshooting

### QR Code Not Showing

- Check BANK_INFO configuration
- Verify internet connection (loads from VietQR API)
- Check browser console for errors

### Payment Not Creating Order

- Verify submitOrder function is called
- Check browser console for API errors
- Ensure backend /sales endpoint is working

### Wrong Amount in QR

- Check totalAmount calculation
- Verify Math.round() is removing decimals
- Test with different cart totals

## Support

For VietQR API documentation: https://www.vietqr.io/

For issues with this implementation, check:

1. Browser console errors
2. Network tab for API calls
3. Backend logs for order creation errors

---

**Last Updated:** January 2025
**Version:** 1.0.0
