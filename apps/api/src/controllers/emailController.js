import logger from "../utils/logger.js";
import { sendPurchaseOrderEmail } from "../utils/purchaseOrderEmail.js";
import { sendSalesInvoiceEmail } from "../utils/salesInvoiceEmail.js";

/**
 * Send Purchase Order email to supplier
 * @route POST /api/send-purchase-order-email
 */
export const sendPurchaseOrder = async (req, res) => {
  try {
    const emailData = req.body;

    // Validation
    if (
      !emailData.supplierEmail ||
      !emailData.items ||
      emailData.items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Supplier email and order items are required",
      });
    }

    await sendPurchaseOrderEmail(emailData);

    res.status(200).json({
      success: true,
      message: "Purchase order email sent successfully",
    });
  } catch (error) {
    logger.error("Error sending purchase order email:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send purchase order email",
    });
  }
};

/**
 * Send Sales Invoice email to customer
 * @route POST /api/send-sales-invoice-email
 */
export const sendSalesInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;

    // Validation
    if (
      !invoiceData.customerEmail ||
      !invoiceData.items ||
      invoiceData.items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer email and order items are required",
      });
    }

    await sendSalesInvoiceEmail(invoiceData);

    res.status(200).json({
      success: true,
      message: "Sales invoice email sent successfully",
    });
  } catch (error) {
    logger.error("Error sending sales invoice email:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send sales invoice email",
    });
  }
};
