import express from "express";

import { sendPurchaseOrder } from "../controllers/emailController.js";
import { authenticate } from "../middleware/checkAuth.js";

const router = express.Router();

// Send purchase order email
router.post("/send-purchase-order-email", authenticate, sendPurchaseOrder);

export default router;
