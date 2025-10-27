import nodemailer from "nodemailer";

import config from "../config/environment.js";

import logger from "./logger.js";

/**
 * Create email transporter
 */
const createTransporter = () => {
  // Try to send real emails if credentials are configured
  // This matches the behavior of email.js for OTP emails
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
        from: mailOptions.from,
      });
      return { messageId: "dev-mode-email-" + Date.now() };
    },
  };
};

/**
 * Send Sales Invoice email to customer
 * @param {Object} invoiceData - Invoice details
 * @returns {Promise<boolean>} Success status
 */
export const sendSalesInvoiceEmail = async (invoiceData) => {
  // Extract key fields outside try block for error logging
  const customerEmail = invoiceData.customerEmail;
  const orderNumber = invoiceData.orderNumber;

  try {
    // Log received data for debugging
    logger.info("📧 Preparing to send sales invoice email:", {
      customerEmail,
      orderNumber,
      hasItems: !!invoiceData.items,
      itemsCount: invoiceData.items?.length,
      totalAmount: invoiceData.totalAmount,
      paymentMethod: invoiceData.paymentMethod,
    });

    // Validate required fields
    if (
      !customerEmail ||
      !invoiceData.items ||
      !Array.isArray(invoiceData.items)
    ) {
      throw new Error("Missing required fields: customerEmail or items");
    }

    const {
      customerName,
      salespersonName,
      items,
      totalAmount,
      paymentMethod,
      orderDate,
      cashReceived,
      changeAmount,
    } = invoiceData;

    const transporter = createTransporter();

    // Generate items table HTML with safe access
    const itemsTableRows = items
      .map((item, index) => {
        const medicationName = item.medicationName || "Unknown Product";
        const variantName = item.variantName || "";
        const quantity = Number(item.quantity) || 0;
        const sellingPrice = Number(item.sellingPrice) || 0;
        const subtotal = quantity * sellingPrice;

        return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; text-align: center;">${index + 1}</td>
          <td style="padding: 12px;">
            <strong>${medicationName}</strong>
            ${variantName ? `<br/><span style="color: #6b7280; font-size: 13px;">${variantName}</span>` : ""}
          </td>
          <td style="padding: 12px; text-align: center;">${quantity}</td>
          <td style="padding: 12px; text-align: right;">${sellingPrice.toLocaleString()} ₫</td>
          <td style="padding: 12px; text-align: right; font-weight: 600;">${subtotal.toLocaleString()} ₫</td>
        </tr>
      `;
      })
      .join("");

    // Payment method display
    const paymentMethodDisplay =
      paymentMethod === "cash"
        ? "💵 Cash Payment"
        : "📱 Mobile Payment (VietQR)";

    // Safe number formatting
    const safeTotal = Number(totalAmount) || 0;
    const safeCashReceived = Number(cashReceived) || 0;
    const safeChangeAmount = Number(changeAmount) || 0;

    // Cash payment details (if applicable)
    const cashPaymentDetails =
      paymentMethod === "cash" && cashReceived
        ? `
      <tr>
        <td style="padding: 0 30px 20px 30px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; overflow: hidden;">
            <tr>
              <td style="padding: 20px;">
                <h4 style="color: #166534; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">💵 CASH PAYMENT DETAILS</h4>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color: #166534; font-size: 14px; padding: 5px 0;">Cash Received:</td>
                    <td style="color: #166534; font-size: 14px; padding: 5px 0; text-align: right; font-weight: 600;">${safeCashReceived.toLocaleString()} ₫</td>
                  </tr>
                  <tr>
                    <td style="color: #166534; font-size: 14px; padding: 5px 0;">Change Given:</td>
                    <td style="color: #166534; font-size: 14px; padding: 5px 0; text-align: right; font-weight: 600;">${safeChangeAmount.toLocaleString()} ₫</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
        : "";

    const mailOptions = {
      from: config.smtpFrom || "noreply@pharmaflow.com",
      to: customerEmail,
      subject: `Invoice #${orderNumber} - Thank you for your purchase!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sales Invoice</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width: 700px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">💊 PharmaFlow</h1>
                      <p style="color: #dbeafe; margin: 5px 0 0 0; font-size: 14px;">Pharmacy Management System</p>
                      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
                        <p style="color: #ffffff; margin: 0; font-size: 16px; font-weight: 600;">SALES INVOICE</p>
                        <p style="color: #dbeafe; margin: 5px 0 0 0; font-size: 14px;">Invoice #${orderNumber}</p>
                      </div>
                    </td>
                  </tr>

                  <!-- Thank You Message -->
                  <tr>
                    <td style="padding: 30px; text-align: center; background-color: #fef3c7;">
                      <h2 style="color: #92400e; margin: 0 0 10px 0; font-size: 24px;">Thank you for your purchase! 🎉</h2>
                      <p style="color: #78350f; margin: 0; font-size: 14px;">We appreciate your business and hope to serve you again soon.</p>
                    </td>
                  </tr>

                  <!-- Customer & Order Info -->
                  <tr>
                    <td style="padding: 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; overflow: hidden;">
                        <tr>
                          <td width="50%" style="padding: 20px; border-right: 1px solid #e5e7eb;">
                            <h4 style="color: #1f2937; margin: 0 0 12px 0; font-size: 14px; font-weight: 600; text-transform: uppercase;">Customer Information</h4>
                            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.8;">
                              <strong>Name:</strong> ${customerName}<br/>
                              <strong>Email:</strong> ${customerEmail}
                            </p>
                          </td>
                          <td width="50%" style="padding: 20px;">
                            <h4 style="color: #1f2937; margin: 0 0 12px 0; font-size: 14px; font-weight: 600; text-transform: uppercase;">Order Details</h4>
                            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.8;">
                              <strong>Invoice #:</strong> ${orderNumber}<br/>
                              <strong>Date:</strong> ${orderDate}<br/>
                              <strong>Salesperson:</strong> ${salespersonName}<br/>
                              <strong>Payment:</strong> ${paymentMethodDisplay}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Order Items -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Items Purchased</h3>
                      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                        <thead>
                          <tr style="background-color: #f9fafb;">
                            <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">#</th>
                            <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Product</th>
                            <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Qty</th>
                            <th style="padding: 12px; text-align: right; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Price</th>
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
                          <td width="55%"></td>
                          <td width="45%" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 8px; padding: 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="color: #dbeafe; font-size: 14px; padding-bottom: 8px;">Total Amount:</td>
                                <td style="color: #ffffff; font-size: 28px; font-weight: 700; text-align: right;">${safeTotal.toLocaleString()} ₫</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  ${cashPaymentDetails}

                  <!-- Footer Note -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; border-radius: 4px;">
                        <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                          <strong>📝 Important Information:</strong><br/>
                          • Please keep this invoice for your records.<br/>
                          • For returns or exchanges, present this invoice within 7 days.<br/>
                          • If you have any questions, please contact our customer service.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center; line-height: 1.6;">
                        Thank you for choosing PharmaFlow!<br/>
                        This is an automated email. For support, contact us at <a href="mailto:${config.smtpFrom}" style="color: #2563eb; text-decoration: none;">${config.smtpFrom}</a>
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
    logger.info(`Sales Invoice email sent to ${customerEmail}`, {
      messageId: info.messageId,
      orderNumber,
    });
    return true;
  } catch (error) {
    logger.error("Error sending Sales Invoice email:", {
      errorMessage: error.message,
      errorCode: error.code,
      errorCommand: error.command,
      errorResponse: error.response,
      customerEmail,
      orderNumber,
    });
    throw new Error(`Failed to send Sales Invoice email: ${error.message}`);
  }
};
