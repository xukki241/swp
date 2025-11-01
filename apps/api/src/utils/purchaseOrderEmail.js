import nodemailer from "nodemailer";

import config from "../config/environment.js";

import logger from "./logger.js";

/**
 * Create email transporter
 */
const createTransporter = () => {
  // Try to send real emails if credentials are configured
  const hasValidCredentials =
    config.smtpUser &&
    config.smtpPass &&
    config.smtpUser.trim() !== "" &&
    config.smtpPass.trim() !== "";

  if (hasValidCredentials) {
    return nodemailer.createTransport({
      host: config.smtpHost || "smtp.gmail.com",
      port: config.smtpPort || 587,
      secure: false,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }

  // Fallback if no credentials - log instead of sending
  logger.warn(
    "📧 [Email Config] No SMTP credentials found - emails will be logged only"
  );
  return {
    sendMail: async (mailOptions) => {
      logger.info("📧 [DEV MODE] Email would be sent:", {
        to: mailOptions.to,
        subject: mailOptions.subject,
      });
      return { messageId: "dev-mode-email-" + Date.now() };
    },
  };
};

/**
 * Generate confirmation token for supplier
 * @param {string} purchaseOrderId - Purchase order ID
 * @returns {string} Confirmation token
 */
export const generateConfirmationToken = (purchaseOrderId) => {
  const crypto = require("node:crypto");
  const secret = config.jwtSecret || "default-secret-key";
  const timestamp = Date.now();
  const data = `${purchaseOrderId}:${timestamp}`;
  const token = crypto.createHmac("sha256", secret).update(data).digest("hex");
  return `${token}.${timestamp}`;
};

/**
 * Verify confirmation token
 * @param {string} token - Confirmation token
 * @param {string} purchaseOrderId - Purchase order ID
 * @returns {boolean} Valid or not
 */
export const verifyConfirmationToken = (token, purchaseOrderId) => {
  try {
    const crypto = require("node:crypto");
    const [receivedToken, timestamp] = token.split(".");

    // Check if token expired (valid for 7 days)
    const tokenAge = Date.now() - Number.parseInt(timestamp);
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (tokenAge > sevenDays) {
      return false;
    }

    const secret = config.jwtSecret || "default-secret-key";
    const data = `${purchaseOrderId}:${timestamp}`;
    const expectedToken = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("hex");

    return receivedToken === expectedToken;
  } catch {
    return false;
  }
};

/**
 * Send Purchase Order notification email to supplier
 * @param {Object} purchaseOrderData - Purchase order details
 * @returns {Promise<boolean>} Success status
 */
export const sendPurchaseOrderEmail = async (purchaseOrderData) => {
  try {
    const {
      purchaseOrderId,
      supplierEmail,
      supplierName,
      supplierContact,
      buyerInfo,
      items,
      totalAmount,
      expectedDeliveryDate,
      orderNumber,
      orderDate,
    } = purchaseOrderData;

    // Generate confirmation token and link
    const confirmationToken = generateConfirmationToken(purchaseOrderId);
    const confirmationLink = `${config.apiUrl || "http://localhost:3000"}/api/purchases/confirm/${purchaseOrderId}?token=${confirmationToken}`;

    const transporter = createTransporter();

    // Generate items table HTML
    const itemsTableRows = items
      .map(
        (item, index) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; text-align: center;">${index + 1}</td>
          <td style="padding: 12px;">${item.medicationName}</td>
          <td style="padding: 12px;">${item.variantName || "-"}</td>
          <td style="padding: 12px; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; text-align: right;">${Number(item.unitPrice).toLocaleString()} ₫</td>
          <td style="padding: 12px; text-align: right; font-weight: 600;">${(item.quantity * item.unitPrice).toLocaleString()} ₫</td>
        </tr>
      `
      )
      .join("");

    const mailOptions = {
      from: config.smtpFrom || "noreply@pharmaflow.com",
      to: supplierEmail,
      subject: `New Purchase Order #${orderNumber} - PharmaFlow`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Purchase Order</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width: 800px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Purchase Order</h1>
                      <p style="color: #d1d5db; margin: 10px 0 0 0; font-size: 14px;">Order #${orderNumber}</p>
                    </td>
                  </tr>

                  <!-- Order Info -->
                  <tr>
                    <td style="padding: 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="50%" style="vertical-align: top;">
                            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Dear ${supplierContact},</h3>
                            <p style="color: #6b7280; margin: 0; line-height: 1.6;">We are pleased to place the following purchase order with <strong>${supplierName}</strong>.</p>
                          </td>
                          <td width="50%" style="vertical-align: top; text-align: right;">
                            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                              <strong style="color: #1f2937;">Order Date:</strong><br/>
                              ${orderDate}
                            </p>
                            <p style="margin: 0; color: #6b7280; font-size: 14px;">
                              <strong style="color: #1f2937;">Expected Delivery:</strong><br/>
                              ${expectedDeliveryDate}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Buyer & Supplier Info -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; overflow: hidden;">
                        <tr>
                          <td width="50%" style="padding: 20px; border-right: 1px solid #e5e7eb;">
                            <h4 style="color: #1f2937; margin: 0 0 12px 0; font-size: 14px; font-weight: 600; text-transform: uppercase;">Buyer Information</h4>
                            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.8;">
                              <strong>Contact:</strong> ${buyerInfo.contact || "N/A"}<br/>
                              <strong>Email:</strong> ${buyerInfo.email || "N/A"}<br/>
                              <strong>Phone:</strong> ${buyerInfo.phone || "N/A"}<br/>
                              <strong>Address:</strong> ${buyerInfo.address || "N/A"}
                            </p>
                          </td>
                          <td width="50%" style="padding: 20px;">
                            <h4 style="color: #1f2937; margin: 0 0 12px 0; font-size: 14px; font-weight: 600; text-transform: uppercase;">Supplier Information</h4>
                            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.8;">
                              <strong>Company:</strong> ${supplierName}<br/>
                              <strong>Contact:</strong> ${supplierContact}<br/>
                              <strong>Email:</strong> ${supplierEmail}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Order Items -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Order Details</h3>
                      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                        <thead>
                          <tr style="background-color: #f9fafb;">
                            <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">#</th>
                            <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Medication</th>
                            <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Variant</th>
                            <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                            <th style="padding: 12px; text-align: right; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Unit Price</th>
                            <th style="padding: 12px; text-align: right; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsTableRows}
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  <!-- Total Amount -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="60%"></td>
                          <td width="40%" style="background-color: #1f2937; border-radius: 8px; padding: 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="color: #d1d5db; font-size: 14px; padding-bottom: 8px;">Total Amount:</td>
                                <td style="color: #ffffff; font-size: 24px; font-weight: 700; text-align: right;">${totalAmount.toLocaleString()} ₫</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Confirmation Button -->
                  <tr>
                    <td style="padding: 0 30px 20px 30px; text-align: center;">
                      <a href="${confirmationLink}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                        ✓ Confirm Receipt of Purchase Order
                      </a>
                      <p style="margin: 12px 0 0 0; color: #6b7280; font-size: 13px;">Click the button above to confirm you have received this order</p>
                    </td>
                  </tr>

                  <!-- Footer Notes -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px;">
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                          <strong>📌 Important Notes:</strong><br/>
                          • Please confirm receipt of this purchase order within 24 hours.<br/>
                          • Ensure delivery by the expected date mentioned above.<br/>
                          • Contact us immediately if you have any questions or concerns.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center; line-height: 1.6;">
                        This is an automated email. Please do not reply directly to this message.<br/>
                        For inquiries, contact us at <a href="mailto:${buyerInfo.email || config.smtpFrom}" style="color: #2563eb; text-decoration: none;">${buyerInfo.email || config.smtpFrom}</a>
                      </p>
                      <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                        © 2025 PharmaFlow - Pharmacy Management System
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Purchase Order email sent to ${supplierEmail}`, {
      messageId: info.messageId,
    });
    return true;
  } catch (error) {
    logger.error("Error sending Purchase Order email:", error);
    throw new Error("Failed to send Purchase Order email");
  }
};

/**
 * Send confirmation notification email to owner/buyer
 * @param {Object} confirmationData - Confirmation details
 * @returns {Promise<boolean>} Success status
 */
export const sendConfirmationNotificationEmail = async (confirmationData) => {
  try {
    const {
      ownerEmail,
      ownerName,
      supplierName,
      supplierEmail,
      orderNumber,
      orderDate,
      expectedDeliveryDate,
      totalAmount,
      confirmedAt,
    } = confirmationData;

    const transporter = createTransporter();

    const mailOptions = {
      from: config.smtpFrom || "noreply@pharmaflow.com",
      to: ownerEmail,
      subject: `✓ Purchase Order #${orderNumber} Confirmed by Supplier`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PO Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
                      <div style="background-color: rgba(255,255,255,0.2); width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 36px;">✓</span>
                      </div>
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Order Confirmed!</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Purchase Order #${orderNumber}</p>
                    </td>
                  </tr>

                  <!-- Message -->
                  <tr>
                    <td style="padding: 30px;">
                      <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Dear ${ownerName},</h3>
                      <p style="color: #6b7280; margin: 0 0 20px 0; line-height: 1.6;">
                        Great news! <strong>${supplierName}</strong> has confirmed receipt of your purchase order and will process it accordingly.
                      </p>
                    </td>
                  </tr>

                  <!-- Order Details -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; overflow: hidden;">
                        <tr>
                          <td style="padding: 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Order Number:</td>
                                <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">#${orderNumber}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Supplier:</td>
                                <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${supplierName}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Order Date:</td>
                                <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${orderDate}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Expected Delivery:</td>
                                <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${expectedDeliveryDate}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Total Amount:</td>
                                <td style="padding: 8px 0; color: #10b981; font-size: 16px; font-weight: 700; text-align: right;">${totalAmount.toLocaleString()} ₫</td>
                              </tr>
                              <tr>
                                <td colspan="2" style="padding: 12px 0 0 0; border-top: 1px solid #e5e7eb;">
                                  <div style="background-color: #d1fae5; padding: 12px; border-radius: 6px; text-align: center;">
                                    <p style="margin: 0; color: #065f46; font-size: 13px; font-weight: 600;">
                                      ✓ Confirmed at: ${confirmedAt}
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Next Steps -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px;">
                        <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                          <strong>📦 Next Steps:</strong><br/>
                          • Your order status has been updated to "Ordered"<br/>
                          • The supplier will process and ship your order<br/>
                          • You will be notified once the items are delivered<br/>
                          • You can track the order status in your PharmaFlow dashboard
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center; line-height: 1.6;">
                        This is an automated notification from PharmaFlow.<br/>
                        If you have any questions, contact the supplier at <a href="mailto:${supplierEmail}" style="color: #2563eb; text-decoration: none;">${supplierEmail}</a>
                      </p>
                      <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                        © 2025 PharmaFlow - Pharmacy Management System
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`PO confirmation email sent to ${ownerEmail}`, {
      messageId: info.messageId,
    });
    return true;
  } catch (error) {
    logger.error("Error sending PO confirmation email:", error);
    throw new Error("Failed to send confirmation email");
  }
};
