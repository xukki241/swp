import { GoogleGenerativeAI } from "@google/generative-ai";
import { and, desc, eq, gte, sql } from "drizzle-orm";

import { db } from "../db/index.js";
import {
  inventory,
  medications,
  medicationVariants,
  salesOrderItems,
  salesOrders,
} from "../db/schema/index.js";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_AI_API_KEY || "YOUR_API_KEY"
);

/**
 * Analyze sales data and inventory to provide purchasing recommendations
 */
export const aiAnalysisService = {
  /**
   * Get comprehensive sales and inventory data for AI analysis
   */
  async getSalesAndInventoryData(daysBack = 90) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    console.log("AI Analysis - Start Date:", startDate.toISOString());
    console.log("AI Analysis - Days Back:", daysBack);

    // Get sales data with medication details
    const salesData = await db
      .select({
        medicationId: medications.id,
        medicationName: medications.name,
        variantId: medicationVariants.id,
        variantName: medicationVariants.name,
        sku: medicationVariants.sku,
        sellPrice: medicationVariants.sellPrice,
        unit: medicationVariants.unit,
        totalQuantitySold: sql`SUM(${salesOrderItems.quantity})`.as(
          "total_quantity_sold"
        ),
        totalRevenue: sql`SUM(${salesOrderItems.totalPrice})`.as(
          "total_revenue"
        ),
        orderCount: sql`COUNT(DISTINCT ${salesOrders.id})`.as("order_count"),
      })
      .from(salesOrderItems)
      .innerJoin(salesOrders, eq(salesOrderItems.salesOrderId, salesOrders.id))
      .innerJoin(
        medicationVariants,
        eq(salesOrderItems.medicationVariantId, medicationVariants.id)
      )
      .innerJoin(
        medications,
        eq(medicationVariants.medicationId, medications.id)
      )
      .where(
        and(
          gte(salesOrders.orderDate, startDate),
          eq(salesOrders.status, "paid")
        )
      )
      .groupBy(
        medications.id,
        medications.name,
        medicationVariants.id,
        medicationVariants.name,
        medicationVariants.sku,
        medicationVariants.sellPrice,
        medicationVariants.unit
      )
      .orderBy(desc(sql`SUM(${salesOrderItems.quantity})`));

    console.log("AI Analysis - Sales Data Count:", salesData.length);
    console.log("AI Analysis - First 3 sales:", salesData.slice(0, 3));

    // Calculate total for verification
    const totalFromQuery = salesData.reduce(
      (sum, item) => sum + Number(item.totalRevenue),
      0
    );
    const totalQty = salesData.reduce(
      (sum, item) => sum + Number(item.totalQuantitySold),
      0
    );
    console.log("AI Analysis - Total Revenue from Query:", totalFromQuery);
    console.log("AI Analysis - Total Quantity Sold:", totalQty);

    // Get current inventory levels
    const inventoryData = await db
      .select({
        variantId: medicationVariants.id,
        variantName: medicationVariants.name,
        medicationName: medications.name,
        sku: medicationVariants.sku,
        totalStock: sql`SUM(${inventory.quantity})`.as("total_stock"),
        availableStock:
          sql`SUM(${inventory.quantity} - ${inventory.quantityReserved})`.as(
            "available_stock"
          ),
        nearestExpiry: sql`MIN(${inventory.expiryDate})`.as("nearest_expiry"),
      })
      .from(inventory)
      .innerJoin(
        medicationVariants,
        eq(inventory.medicationVariantId, medicationVariants.id)
      )
      .innerJoin(
        medications,
        eq(medicationVariants.medicationId, medications.id)
      )
      .groupBy(
        medicationVariants.id,
        medicationVariants.name,
        medications.name,
        medicationVariants.sku
      );

    // Get low stock items
    const lowStockItems = inventoryData.filter(
      (item) => Number(item.availableStock) < 20
    );

    // Get items expiring soon (within 90 days)
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + 90);
    const expiringSoonItems = inventoryData.filter(
      (item) =>
        item.nearestExpiry && new Date(item.nearestExpiry) < expiringDate
    );

    return {
      salesData,
      inventoryData,
      lowStockItems,
      expiringSoonItems,
      daysAnalyzed: daysBack,
    };
  },

  /**
   * Generate AI-powered purchasing recommendations using Google Gemini
   */
  async generatePurchaseRecommendations(daysBack = 90) {
    try {
      // Get data
      const {
        salesData,
        inventoryData,
        lowStockItems,
        expiringSoonItems,
        daysAnalyzed,
      } = await this.getSalesAndInventoryData(daysBack);

      // Prepare data summary for AI
      const topSellingItems = salesData.slice(0, 10);
      const dataContext = {
        analysisperiod: `${daysAnalyzed} days`,
        totalProductsSold: salesData.reduce(
          (sum, item) => sum + Number(item.totalQuantitySold),
          0
        ),
        totalRevenue: salesData.reduce(
          (sum, item) => sum + Number(item.totalRevenue),
          0
        ),
        topSellingProducts: topSellingItems.map((item) => ({
          name: `${item.medicationName} - ${item.variantName}`,
          quantitySold: Number(item.totalQuantitySold),
          revenue: Number(item.totalRevenue),
          orderCount: Number(item.orderCount),
        })),
        lowStockProducts: lowStockItems.map((item) => ({
          name: `${item.medicationName} - ${item.variantName}`,
          currentStock: Number(item.availableStock),
        })),
        expiringSoonProducts: expiringSoonItems.map((item) => ({
          name: `${item.medicationName} - ${item.variantName}`,
          expiryDate: item.nearestExpiry,
          stock: Number(item.availableStock),
        })),
      };

      // Create prompt for Gemini
      const prompt = `
Bạn là một chuyên gia phân tích dữ liệu và quản lý tồn kho cho nhà thuốc. 
Dựa trên dữ liệu bán hàng và tồn kho sau đây, hãy đưa ra các khuyến nghị chi tiết về việc nhập hàng:

**DỮ LIỆU PHÂN TÍCH:**
- Thời gian phân tích: ${dataContext.analysisperiod}
- Tổng số lượng sản phẩm đã bán: ${dataContext.totalProductsSold}
- Tổng doanh thu: ${dataContext.totalRevenue.toLocaleString("vi-VN")} VNĐ

**TOP SẢN PHẨM BÁN CHẠY:**
${dataContext.topSellingProducts
          .map(
            (p, i) =>
              `${i + 1}. ${p.name}
   - Số lượng bán: ${p.quantitySold}
   - Doanh thu: ${p.revenue.toLocaleString("vi-VN")} VNĐ
   - Số đơn hàng: ${p.orderCount}`
          )
          .join("\n")}

**SẢN PHẨM TỒN KHO THẤP:**
${dataContext.lowStockProducts.length > 0
          ? dataContext.lowStockProducts
            .map((p) => `- ${p.name}: ${p.currentStock} đơn vị còn lại`)
            .join("\n")
          : "Không có sản phẩm tồn kho thấp"
        }

**SẢN PHẨM SẮP HẾT HẠN (trong 90 ngày):**
${dataContext.expiringSoonProducts.length > 0
          ? dataContext.expiringSoonProducts
            .map(
              (p) =>
                `- ${p.name}: ${p.stock} đơn vị, hết hạn ${new Date(p.expiryDate).toLocaleDateString("vi-VN")}`
            )
            .join("\n")
          : "Không có sản phẩm sắp hết hạn"
        }

**YÊU CẦU PHÂN TÍCH:**

Hãy phân tích và đưa ra khuyến nghị chi tiết theo format JSON sau:

{
  "summary": {
    "overallAssessment": "Đánh giá tổng quan về tình hình kinh doanh",
    "keyInsights": ["Insight 1", "Insight 2", "Insight 3"]
  },
  "priorityRecommendations": [
    {
      "priority": "HIGH/MEDIUM/LOW",
      "productName": "Tên sản phẩm",
      "currentStock": số_lượng_hiện_tại,
      "recommendedQuantity": số_lượng_nên_nhập,
      "reasoning": "Lý do chi tiết tại sao nên nhập sản phẩm này",
      "expectedBenefit": "Lợi ích dự kiến",
      "estimatedCost": giá_trị_ước_tính
    }
  ],
  "categoryInsights": [
    {
      "category": "Tên nhóm thuốc",
      "trend": "INCREASING/STABLE/DECREASING",
      "recommendation": "Khuyến nghị cho nhóm thuốc này"
    }
  ],
  "warnings": [
    {
      "type": "EXPIRING/LOW_STOCK/SLOW_MOVING",
      "productName": "Tên sản phẩm",
      "message": "Cảnh báo chi tiết",
      "action": "Hành động khuyến nghị"
    }
  ],
  "financialProjection": {
    "estimatedTotalInvestment": tổng_vốn_đầu_tư_ước_tính,
    "expectedROI": "Phần trăm ROI dự kiến",
    "paybackPeriod": "Thời gian hoàn vốn dự kiến"
  }
}

Lưu ý:
- Ưu tiên các sản phẩm bán chạy nhưng tồn kho thấp
- Cảnh báo về sản phẩm sắp hết hạn (không nên nhập thêm)
- Đưa ra số lượng cụ thể dựa trên tốc độ bán hàng
- Đánh giá xu hướng và đưa ra chiến lược dài hạn
- Tính toán chi phí và lợi nhuận dự kiến

Chỉ trả về JSON, không có text ngoài lề.
`;

      // Call Gemini API - Using Gemini 2.0 Flash for faster performance
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        },
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("AI response is not valid JSON");
      }

      const recommendations = JSON.parse(jsonMatch[0]);

      return {
        success: true,
        data: recommendations,
        metadata: {
          analyzedPeriod: daysAnalyzed,
          analyzedAt: new Date().toISOString(),
          dataPoints: {
            salesRecords: salesData.length,
            inventoryItems: inventoryData.length,
            lowStockItems: lowStockItems.length,
            expiringSoonItems: expiringSoonItems.length,
          },
        },
      };
    } catch (error) {
      console.error("AI Analysis Error:", error);
      throw new Error(`Failed to generate recommendations: ${error.message}`);
    }
  },

  /**
   * Get quick insights without full AI analysis
   */
  async getQuickInsights(daysBack = 30) {
    const { salesData, inventoryData, lowStockItems, expiringSoonItems } =
      await this.getSalesAndInventoryData(daysBack);

    // Calculate total revenue from query (already grouped by variant)
    const totalRevenue = salesData.reduce(
      (sum, item) => sum + Number(item.totalRevenue),
      0
    );
    const totalQuantitySold = salesData.reduce(
      (sum, item) => sum + Number(item.totalQuantitySold),
      0
    );

    // Get distinct order count for accurate average
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const [orderStats] = await db
      .select({
        totalOrders: sql`COUNT(DISTINCT ${salesOrders.id})`.as("total_orders"),
      })
      .from(salesOrders)
      .where(
        and(
          gte(salesOrders.orderDate, startDate),
          eq(salesOrders.status, "paid")
        )
      );

    const totalOrders = Number(orderStats.totalOrders) || 0;

    return {
      summary: {
        totalRevenue,
        totalQuantitySold,
        totalOrders,
        totalProducts: salesData.length,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      },
      topSellingProducts: salesData.slice(0, 5),
      lowStockAlerts: lowStockItems.length,
      expiryAlerts: expiringSoonItems.length,
      criticalActions: [
        ...lowStockItems.slice(0, 3).map((item) => ({
          type: "LOW_STOCK",
          product: `${item.medicationName} - ${item.variantName}`,
          currentStock: Number(item.availableStock),
          action: "Consider restocking",
        })),
        ...expiringSoonItems.slice(0, 3).map((item) => ({
          type: "EXPIRING_SOON",
          product: `${item.medicationName} - ${item.variantName}`,
          expiryDate: item.nearestExpiry,
          action: "Avoid ordering more",
        })),
      ],
    };
  },
};
