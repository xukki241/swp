import instance from "@/lib/axios";

export const aiAnalysisService = {
  /**
   * Get AI-powered purchase recommendations
   * @param {number} daysBack - Number of days to analyze (default: 90)
   * @returns {Promise} AI recommendations
   */
  async getPurchaseRecommendations(daysBack = 90) {
    const response = await instance.get(
      "/ai-analysis/purchase-recommendations",
      {
        params: { daysBack },
        timeout: 60000, // 60 seconds for AI processing
      }
    );
    return response.data;
  },

  /**
   * Get quick insights without full AI analysis
   * @param {number} daysBack - Number of days to analyze (default: 30)
   * @returns {Promise} Quick insights
   */
  async getQuickInsights(daysBack = 30) {
    const response = await instance.get("/ai-analysis/quick-insights", {
      params: { daysBack },
    });
    return response.data;
  },

  /**
   * Get sales and inventory data
   * @param {number} daysBack - Number of days to analyze (default: 90)
   * @returns {Promise} Sales and inventory data
   */
  async getSalesInventoryData(daysBack = 90) {
    const response = await instance.get("/ai-analysis/data", {
      params: { daysBack },
    });
    return response.data;
  },
};
