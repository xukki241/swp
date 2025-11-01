import { and, asc, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";

import { db } from "../db/index.js";
import { inventory } from "../db/schema/inventory.js";
import { medications } from "../db/schema/medications.js";
import { medicationVariants } from "../db/schema/medicationVariants.js";
import { reports } from "../db/schema/reports.js";
import { salesOrderItems } from "../db/schema/salesOrderItems.js";
import { salesOrders } from "../db/schema/salesOrders.js";

export const reportService = {
  /**
   * Create a new report
   */
  async create(reportData) {
    const { type, parameters } = reportData;

    // Generate report data based on type
    let data;
    switch (type) {
      case "sales_summary":
        data = await this.generateSalesSummary(parameters);
        break;
      case "inventory_on_hand":
        data = await this.generateInventoryOnHand(parameters);
        break;
      case "expiry_dates":
        data = await this.generateExpiryDates(parameters);
        break;
      case "low_stock":
        data = await this.generateLowStock(parameters);
        break;
      case "daily_sales":
        data = await this.generateDailySales(parameters);
        break;
      case "weekly_sales":
        data = await this.generateWeeklySales(parameters);
        break;
      case "monthly_sales":
        data = await this.generateMonthlySales(parameters);
        break;
      default:
        throw new Error(`Unsupported report type: ${type}`);
    }

    // Save report to database
    const [report] = await db
      .insert(reports)
      .values({
        type,
        parameters,
        data,
        reportDate: new Date(),
      })
      .returning();

    return report;
  },

  /**
   * Get all reports with optional filtering
   */
  async getAll(filters = {}) {
    const { type, startDate, endDate, limit = 50, offset = 0 } = filters;

    let query = db.select().from(reports);

    const conditions = [];

    if (type) {
      conditions.push(eq(reports.type, type));
    }

    if (startDate) {
      conditions.push(gte(reports.reportDate, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(reports.reportDate, new Date(endDate)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(reports.reportDate)).limit(limit).offset(offset);

    return await query;
  },

  /**
   * Get report by ID
   */
  async getById(id) {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));

    if (!report) {
      throw new Error("Report not found");
    }

    return report;
  },

  /**
   * Delete a report
   */
  async delete(id) {
    const [deleted] = await db
      .delete(reports)
      .where(eq(reports.id, id))
      .returning();

    if (!deleted) {
      throw new Error("Report not found");
    }

    return deleted;
  },

  /**
   * Generate sales summary report
   */
  async generateSalesSummary(parameters = {}) {
    const { startDate, endDate } = parameters;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Total sales and order count (only paid orders for revenue)
    const [summary] = await db
      .select({
        totalOrders: count(salesOrders.id),
        totalRevenue: sum(salesOrders.totalAmount),
      })
      .from(salesOrders)
      .where(
        and(
          gte(salesOrders.orderDate, start),
          lte(salesOrders.orderDate, end),
          eq(salesOrders.status, "paid")
        )
      );

    // Sales by status
    const salesByStatus = await db
      .select({
        status: salesOrders.status,
        count: count(salesOrders.id),
        totalAmount: sum(salesOrders.totalAmount),
      })
      .from(salesOrders)
      .where(
        and(gte(salesOrders.orderDate, start), lte(salesOrders.orderDate, end))
      )
      .groupBy(salesOrders.status);

    // Top selling medications (only from paid orders)
    const topSellingMeds = await db
      .select({
        medicationId: medications.id,
        medicationName: medications.name,
        variantName: medicationVariants.name,
        totalQuantity: sum(salesOrderItems.quantity),
        totalRevenue: sum(
          sql`${salesOrderItems.quantity} * ${salesOrderItems.unitPrice}`
        ),
      })
      .from(salesOrderItems)
      .leftJoin(salesOrders, eq(salesOrderItems.salesOrderId, salesOrders.id))
      .leftJoin(
        medicationVariants,
        eq(salesOrderItems.medicationVariantId, medicationVariants.id)
      )
      .leftJoin(
        medications,
        eq(medicationVariants.medicationId, medications.id)
      )
      .where(
        and(
          gte(salesOrders.orderDate, start),
          lte(salesOrders.orderDate, end),
          eq(salesOrders.status, "paid")
        )
      )
      .groupBy(medications.id, medications.name, medicationVariants.name)
      .orderBy(desc(sum(salesOrderItems.quantity)))
      .limit(10);

    // Sales by payment method
    const salesByPaymentMethod = await db
      .select({
        paymentMethod: salesOrders.paymentMethod,
        count: count(salesOrders.id),
        totalAmount: sum(salesOrders.totalAmount),
      })
      .from(salesOrders)
      .where(
        and(gte(salesOrders.orderDate, start), lte(salesOrders.orderDate, end))
      )
      .groupBy(salesOrders.paymentMethod);

    return {
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
      summary: {
        totalOrders: Number(summary.totalOrders) || 0,
        totalRevenue: Number(summary.totalRevenue) || 0,
      },
      salesByStatus,
      topSellingMedications: topSellingMeds,
      salesByPaymentMethod,
    };
  },

  /**
   * Generate inventory on hand report
   */
  async generateInventoryOnHand(parameters = {}) {
    const { medicationId, lowStockThreshold = 10 } = parameters;

    let query = db
      .select({
        inventoryId: inventory.id,
        medicationId: medications.id,
        medicationName: medications.name,
        variantId: medicationVariants.id,
        variantName: medicationVariants.name,
        sku: medicationVariants.sku,
        quantity: inventory.quantity,
        reservedQuantity: inventory.reservedQuantity,
        availableQuantity: sql`${inventory.quantity} - ${inventory.reservedQuantity}`,
        batchNumber: inventory.batchNumber,
        expiryDate: inventory.expiryDate,
        binId: inventory.binId,
      })
      .from(inventory)
      .leftJoin(
        medicationVariants,
        eq(inventory.medicationVariantId, medicationVariants.id)
      )
      .leftJoin(
        medications,
        eq(medicationVariants.medicationId, medications.id)
      );

    if (medicationId) {
      query = query.where(eq(medications.id, medicationId));
    }

    const inventoryData = await query.orderBy(
      asc(medications.name),
      asc(inventory.expiryDate)
    );

    // Calculate total stock by medication variant
    const stockByVariant = await db
      .select({
        variantId: medicationVariants.id,
        variantName: medicationVariants.name,
        sku: medicationVariants.sku,
        totalQuantity: sum(inventory.quantity),
        totalReserved: sum(inventory.reservedQuantity),
        totalAvailable: sql`SUM(${inventory.quantity}) - SUM(${inventory.reservedQuantity})`,
      })
      .from(inventory)
      .leftJoin(
        medicationVariants,
        eq(inventory.medicationVariantId, medicationVariants.id)
      )
      .groupBy(
        medicationVariants.id,
        medicationVariants.name,
        medicationVariants.sku
      )
      .orderBy(desc(sum(inventory.quantity)));

    // Identify low stock items
    const lowStockItems = stockByVariant.filter(
      (item) => Number(item.totalAvailable) <= lowStockThreshold
    );

    return {
      totalItems: inventoryData.length,
      inventoryDetails: inventoryData,
      stockSummary: stockByVariant,
      lowStockItems: lowStockItems,
      lowStockThreshold,
    };
  },

  /**
   * Generate expiry dates report
   */
  async generateExpiryDates(parameters = {}) {
    const { daysAhead = 90 } = parameters;

    const today = new Date();
    const futureDate = new Date(
      today.getTime() + daysAhead * 24 * 60 * 60 * 1000
    );

    const expiringItems = await db
      .select({
        inventoryId: inventory.id,
        medicationName: medications.name,
        variantName: medicationVariants.name,
        sku: medicationVariants.sku,
        quantity: inventory.quantity,
        reservedQuantity: inventory.reservedQuantity,
        availableQuantity: sql`${inventory.quantity} - ${inventory.reservedQuantity}`,
        batchNumber: inventory.batchNumber,
        expiryDate: inventory.expiryDate,
        daysUntilExpiry: sql`DATE_PART('day', ${inventory.expiryDate}::timestamp - CURRENT_TIMESTAMP)`,
        binId: inventory.binId,
      })
      .from(inventory)
      .leftJoin(
        medicationVariants,
        eq(inventory.medicationVariantId, medicationVariants.id)
      )
      .leftJoin(
        medications,
        eq(medicationVariants.medicationId, medications.id)
      )
      .where(
        and(
          gte(inventory.expiryDate, today),
          lte(inventory.expiryDate, futureDate)
        )
      )
      .orderBy(asc(inventory.expiryDate));

    // Categorize by urgency
    const expired = expiringItems.filter(
      (item) => Number(item.daysUntilExpiry) < 0
    );
    const expiringWithin7Days = expiringItems.filter(
      (item) =>
        Number(item.daysUntilExpiry) >= 0 && Number(item.daysUntilExpiry) <= 7
    );
    const expiringWithin30Days = expiringItems.filter(
      (item) =>
        Number(item.daysUntilExpiry) > 7 && Number(item.daysUntilExpiry) <= 30
    );
    const expiringWithin90Days = expiringItems.filter(
      (item) =>
        Number(item.daysUntilExpiry) > 30 && Number(item.daysUntilExpiry) <= 90
    );

    return {
      reportDate: today.toISOString(),
      daysAhead,
      summary: {
        totalExpiringItems: expiringItems.length,
        expired: expired.length,
        expiringWithin7Days: expiringWithin7Days.length,
        expiringWithin30Days: expiringWithin30Days.length,
        expiringWithin90Days: expiringWithin90Days.length,
      },
      expired,
      expiringWithin7Days,
      expiringWithin30Days,
      expiringWithin90Days,
    };
  },

  /**
   * Generate low stock report
   */
  async generateLowStock(parameters = {}) {
    const { threshold = 10 } = parameters;

    const stockLevels = await db
      .select({
        variantId: medicationVariants.id,
        medicationName: medications.name,
        variantName: medicationVariants.name,
        sku: medicationVariants.sku,
        totalQuantity: sum(inventory.quantity),
        totalReserved: sum(inventory.reservedQuantity),
        availableQuantity: sql`SUM(${inventory.quantity}) - SUM(${inventory.reservedQuantity})`,
        minStockLevel: medicationVariants.minStockLevel,
      })
      .from(medicationVariants)
      .leftJoin(
        inventory,
        eq(medicationVariants.id, inventory.medicationVariantId)
      )
      .leftJoin(
        medications,
        eq(medicationVariants.medicationId, medications.id)
      )
      .groupBy(
        medicationVariants.id,
        medications.name,
        medicationVariants.name,
        medicationVariants.sku,
        medicationVariants.minStockLevel
      )
      .orderBy(
        asc(
          sql`SUM(${inventory.quantity}) - SUM(${inventory.reservedQuantity})`
        )
      );

    const lowStockItems = stockLevels.filter((item) => {
      const available = Number(item.availableQuantity) || 0;
      const minLevel = Number(item.minStockLevel) || threshold;
      return available <= minLevel;
    });

    const criticalStockItems = lowStockItems.filter(
      (item) => Number(item.availableQuantity) <= 0
    );

    return {
      reportDate: new Date().toISOString(),
      threshold,
      summary: {
        totalVariants: stockLevels.length,
        lowStockCount: lowStockItems.length,
        criticalStockCount: criticalStockItems.length,
      },
      lowStockItems,
      criticalStockItems,
    };
  },

  /**
   * Generate daily sales report
   */
  async generateDailySales(parameters = {}) {
    const { date } = parameters;
    const targetDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    return await this.generateSalesSummary({
      startDate: startOfDay,
      endDate: endOfDay,
    });
  },

  /**
   * Generate weekly sales report
   */
  async generateWeeklySales(parameters = {}) {
    const { weekStart } = parameters;
    const targetDate = weekStart ? new Date(weekStart) : new Date();

    // Get start of week (Monday)
    const dayOfWeek = targetDate.getDay();
    const diff = targetDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(targetDate.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    // Get end of week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const weeklyData = await this.generateSalesSummary({
      startDate: startOfWeek,
      endDate: endOfWeek,
    });

    // Add daily breakdown
    const dailyBreakdown = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      const dayStart = new Date(day.setHours(0, 0, 0, 0));
      const dayEnd = new Date(day.setHours(23, 59, 59, 999));

      const [daySummary] = await db
        .select({
          totalOrders: count(salesOrders.id),
          totalRevenue: sum(salesOrders.totalAmount),
        })
        .from(salesOrders)
        .where(
          and(
            gte(salesOrders.orderDate, dayStart),
            lte(salesOrders.orderDate, dayEnd)
          )
        );

      dailyBreakdown.push({
        date: dayStart.toISOString().split("T")[0],
        dayOfWeek: dayStart.toLocaleDateString("en-US", { weekday: "long" }),
        totalOrders: Number(daySummary.totalOrders) || 0,
        totalRevenue: Number(daySummary.totalRevenue) || 0,
      });
    }

    return {
      ...weeklyData,
      weekRange: {
        startDate: startOfWeek.toISOString(),
        endDate: endOfWeek.toISOString(),
      },
      dailyBreakdown,
    };
  },

  /**
   * Generate monthly sales report
   */
  async generateMonthlySales(parameters = {}) {
    const { year, month } = parameters;
    const targetYear = year || new Date().getFullYear();
    // If month is provided, use it directly (already 0-based from controller OR test)
    // Controller converts 1-12 to 0-11 before calling this
    const targetMonth = month !== undefined ? month : new Date().getMonth();

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(
      targetYear,
      targetMonth + 1,
      0,
      23,
      59,
      59,
      999
    );

    const monthlyData = await this.generateSalesSummary({
      startDate: startOfMonth,
      endDate: endOfMonth,
    });

    // Add weekly breakdown
    const weeks = [];
    let weekStart = new Date(startOfMonth);

    while (weekStart <= endOfMonth) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      if (weekEnd > endOfMonth) {
        weekEnd.setTime(endOfMonth.getTime());
      }

      const [weekSummary] = await db
        .select({
          totalOrders: count(salesOrders.id),
          totalRevenue: sum(salesOrders.totalAmount),
        })
        .from(salesOrders)
        .where(
          and(
            gte(salesOrders.orderDate, weekStart),
            lte(salesOrders.orderDate, weekEnd)
          )
        );

      weeks.push({
        weekStart: weekStart.toISOString().split("T")[0],
        weekEnd: weekEnd.toISOString().split("T")[0],
        totalOrders: Number(weekSummary.totalOrders) || 0,
        totalRevenue: Number(weekSummary.totalRevenue) || 0,
      });

      weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() + 1);
    }

    return {
      ...monthlyData,
      monthInfo: {
        year: targetYear,
        month: targetMonth + 1,
        monthName: startOfMonth.toLocaleDateString("en-US", { month: "long" }),
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
      },
      weeklyBreakdown: weeks,
    };
  },
};
