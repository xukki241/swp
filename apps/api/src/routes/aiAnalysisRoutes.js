import express from "express";

import * as aiAnalysisController from "../controllers/aiAnalysisController.js";
import { authenticate } from "../middleware/checkAuth.js";

const router = express.Router();

/**
 * @route   GET /api/ai-analysis/purchase-recommendations
 * @desc    Get AI-powered purchase recommendations based on sales and inventory data
 * @access  Private (Owner/Staff)
 * @query   daysBack - Number of days to analyze (default: 90)
 */
router.get(
    "/purchase-recommendations",
    authenticate,
    aiAnalysisController.getPurchaseRecommendations
);

/**
 * @route   GET /api/ai-analysis/quick-insights
 * @desc    Get quick insights without full AI analysis
 * @access  Private (Owner/Staff)
 * @query   daysBack - Number of days to analyze (default: 30)
 */
router.get(
    "/quick-insights",
    authenticate,
    aiAnalysisController.getQuickInsights
);

/**
 * @route   GET /api/ai-analysis/data
 * @desc    Get sales and inventory data for custom analysis
 * @access  Private (Owner/Staff)
 * @query   daysBack - Number of days to analyze (default: 90)
 */
router.get("/data", authenticate, aiAnalysisController.getSalesInventoryData);

export default router;
