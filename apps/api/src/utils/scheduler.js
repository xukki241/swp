import cron from "node-cron";

import { reportService } from "../services/reportService.js";

import logger from "./logger.js";

/**
 * Initialize scheduled report jobs
 * This function sets up cron jobs for automatic report generation
 */
export function initializeScheduler() {
  // Daily sales report - Run at 00:01 AM every day
  cron.schedule(
    "1 0 * * *",
    async () => {
      try {
        logger.info("Starting daily sales report generation...");
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        await reportService.create({
          type: "daily_sales",
          parameters: { date: yesterday.toISOString() },
        });

        logger.info("Daily sales report generated successfully");
      } catch (error) {
        logger.error("Error generating daily sales report:", error);
      }
    },
    {
      timezone: "Asia/Ho_Chi_Minh", // Vietnam timezone
    }
  );

  // Weekly sales report - Run at 00:05 AM every Monday
  cron.schedule(
    "5 0 * * 1",
    async () => {
      try {
        logger.info("Starting weekly sales report generation...");
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        await reportService.create({
          type: "weekly_sales",
          parameters: { weekStart: lastWeek.toISOString() },
        });

        logger.info("Weekly sales report generated successfully");
      } catch (error) {
        logger.error("Error generating weekly sales report:", error);
      }
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    }
  );

  // Monthly sales report - Run at 00:10 AM on the 1st day of each month
  cron.schedule(
    "10 0 1 * *",
    async () => {
      try {
        logger.info("Starting monthly sales report generation...");
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        await reportService.create({
          type: "monthly_sales",
          parameters: {
            year: lastMonth.getFullYear(),
            month: lastMonth.getMonth(), // 0-based
          },
        });

        logger.info("Monthly sales report generated successfully");
      } catch (error) {
        logger.error("Error generating monthly sales report:", error);
      }
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    }
  );

  // Low stock report - Run at 02:00 AM every day
  cron.schedule(
    "0 2 * * *",
    async () => {
      try {
        logger.info("Starting low stock report generation...");

        await reportService.create({
          type: "low_stock",
          parameters: { threshold: 10 },
        });

        logger.info("Low stock report generated successfully");
      } catch (error) {
        logger.error("Error generating low stock report:", error);
      }
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    }
  );

  // Expiry dates report - Run at 03:00 AM every day
  cron.schedule(
    "0 3 * * *",
    async () => {
      try {
        logger.info("Starting expiry dates report generation...");

        await reportService.create({
          type: "expiry_dates",
          parameters: { daysAhead: 90 },
        });

        logger.info("Expiry dates report generated successfully");
      } catch (error) {
        logger.error("Error generating expiry dates report:", error);
      }
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    }
  );

  // Inventory on hand report - Run at 04:00 AM every day
  cron.schedule(
    "0 4 * * *",
    async () => {
      try {
        logger.info("Starting inventory on hand report generation...");

        await reportService.create({
          type: "inventory_on_hand",
          parameters: { lowStockThreshold: 10 },
        });

        logger.info("Inventory on hand report generated successfully");
      } catch (error) {
        logger.error("Error generating inventory on hand report:", error);
      }
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    }
  );

  logger.info("Report scheduler initialized successfully");
  logger.info("Scheduled jobs:");
  logger.info("  - Daily sales report: 00:01 AM every day");
  logger.info("  - Weekly sales report: 00:05 AM every Monday");
  logger.info("  - Monthly sales report: 00:10 AM on 1st of each month");
  logger.info("  - Low stock report: 02:00 AM every day");
  logger.info("  - Expiry dates report: 03:00 AM every day");
  logger.info("  - Inventory on hand report: 04:00 AM every day");
}

/**
 * Manual trigger functions for testing
 */
export const schedulerTasks = {
  async runDailyReport() {
    logger.info("Manually triggering daily sales report...");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return await reportService.create({
      type: "daily_sales",
      parameters: { date: yesterday.toISOString() },
    });
  },

  async runWeeklyReport() {
    logger.info("Manually triggering weekly sales report...");
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    return await reportService.create({
      type: "weekly_sales",
      parameters: { weekStart: lastWeek.toISOString() },
    });
  },

  async runMonthlyReport() {
    logger.info("Manually triggering monthly sales report...");
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    return await reportService.create({
      type: "monthly_sales",
      parameters: {
        year: lastMonth.getFullYear(),
        month: lastMonth.getMonth(),
      },
    });
  },

  async runLowStockReport() {
    logger.info("Manually triggering low stock report...");

    return await reportService.create({
      type: "low_stock",
      parameters: { threshold: 10 },
    });
  },

  async runExpiryDatesReport() {
    logger.info("Manually triggering expiry dates report...");

    return await reportService.create({
      type: "expiry_dates",
      parameters: { daysAhead: 90 },
    });
  },

  async runInventoryOnHandReport() {
    logger.info("Manually triggering inventory on hand report...");

    return await reportService.create({
      type: "inventory_on_hand",
      parameters: { lowStockThreshold: 10 },
    });
  },
};
