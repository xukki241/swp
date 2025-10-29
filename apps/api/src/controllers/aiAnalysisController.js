import { aiAnalysisService } from "../services/aiAnalysisService.js";
import logger from "../utils/logger.js";

/**
 * Get AI-powered purchase recommendations
 * @route GET /api/ai-analysis/purchase-recommendations
 */
export const getPurchaseRecommendations = async (req, res, next) => {
    try {
        const { daysBack = 90 } = req.query;

        logger.info(
            `[AI Analysis] Generating purchase recommendations for ${daysBack} days`
        );

        const recommendations =
            await aiAnalysisService.generatePurchaseRecommendations(
                Number(daysBack)
            );

        logger.info(
            `[AI Analysis] Successfully generated recommendations: ${recommendations.data.priorityRecommendations?.length || 0} items`
        );

        res.status(200).json(recommendations);
    } catch (error) {
        logger.error("[AI Analysis] Error generating recommendations:", error);
        next(error);
    }
};

/**
 * Get quick insights without full AI analysis
 * @route GET /api/ai-analysis/quick-insights
 */
export const getQuickInsights = async (req, res, next) => {
    try {
        const { daysBack = 30 } = req.query;

        logger.info(`[AI Analysis] Fetching quick insights for ${daysBack} days`);

        const insights = await aiAnalysisService.getQuickInsights(
            Number(daysBack)
        );

        res.status(200).json({
            success: true,
            data: insights,
        });
    } catch (error) {
        logger.error("[AI Analysis] Error fetching insights:", error);
        next(error);
    }
};

/**
 * Get sales and inventory data for custom analysis
 * @route GET /api/ai-analysis/data
 */
export const getSalesInventoryData = async (req, res, next) => {
    try {
        const { daysBack = 90 } = req.query;

        logger.info(
            `[AI Analysis] Fetching sales and inventory data for ${daysBack} days`
        );

        const data = await aiAnalysisService.getSalesAndInventoryData(
            Number(daysBack)
        );

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        logger.error("[AI Analysis] Error fetching data:", error);
        next(error);
    }
};
