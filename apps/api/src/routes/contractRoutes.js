import express from "express";

import * as contractController from "../controllers/contractController.js";
import { authenticate } from "../middleware/checkAuth.js";

const router = express.Router();

/**
 * @route POST /api/contracts/parse
 * @desc Parse contract file and extract supplier & medication data
 * @access Private (All authenticated users)
 */
router.post("/parse", authenticate, contractController.parseContract);

export default router;
