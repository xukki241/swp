import express from "express";

import {
  sendPurchaseOrder,
  sendSalesInvoice,
} from "../controllers/emailController.js";
import { authenticate } from "../middleware/checkAuth.js";

const router = express.Router();

// Send purchase order email
router.post("/send-purchase-order-email", authenticate, sendPurchaseOrder);

// Send sales invoice email
router.post("/send-sales-invoice-email", authenticate, sendSalesInvoice);

export default router;
