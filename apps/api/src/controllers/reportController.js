import asyncHandler from "express-async-handler";

import { reportService } from "../services/reportService.js";

export const reportController = {
  // Create a new report
  create: asyncHandler(async (req, res) => {
    const { type, parameters } = req.body;

    // Validate report type
    const validTypes = [
      "sales_summary",
      "inventory_on_hand",
      "expiry_dates",
      "low_stock",
      "daily_sales",
      "weekly_sales",
      "monthly_sales",
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid report type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    const report = await reportService.create({ type, parameters });

    res.status(201).json({
      success: true,
      message: "Report generated successfully",
      data: report,
    });
  }),

  // Get all reports
  getAll: asyncHandler(async (req, res) => {
    const filters = {
      type: req.query.type,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined,
    };

    const reports = await reportService.getAll(filters);

    res.json({
      success: true,
      message: "Reports retrieved successfully",
      data: reports,
      count: reports.length,
    });
  }),

  // Get report by ID
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      const report = await reportService.getById(id); // UUID string

      res.json({
        success: true,
        message: "Report retrieved successfully",
        data: report,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }),

  // Delete a report
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      await reportService.delete(id); // UUID string

      res.json({
        success: true,
        message: "Report deleted successfully",
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }),

  // Generate specific report types on demand
  generateDaily: asyncHandler(async (req, res) => {
    const { date } = req.query;

    const report = await reportService.create({
      type: "daily_sales",
      parameters: { date },
    });

    res.status(201).json({
      success: true,
      message: "Daily sales report generated successfully",
      data: report,
    });
  }),

  generateWeekly: asyncHandler(async (req, res) => {
    const { weekStart } = req.query;

    const report = await reportService.create({
      type: "weekly_sales",
      parameters: { weekStart },
    });

    res.status(201).json({
      success: true,
      message: "Weekly sales report generated successfully",
      data: report,
    });
  }),

  generateMonthly: asyncHandler(async (req, res) => {
    const { year, month } = req.query;

    const report = await reportService.create({
      type: "monthly_sales",
      parameters: {
        year: year ? parseInt(year) : undefined,
        month: month ? parseInt(month) : undefined, // Keep 1-12, service will convert to 0-based
      },
    });

    res.status(201).json({
      success: true,
      message: "Monthly sales report generated successfully",
      data: report,
    });
  }),
};
