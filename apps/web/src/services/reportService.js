import instance from "@/lib/axios";

export const reportService = {
  // Get all reports
  async getAll(params = {}) {
    const response = await instance.get("/reports", { params });
    return response.data;
  },

  // Get report by ID
  async getById(id) {
    const response = await instance.get(`/reports/${id}`);
    return response.data;
  },

  // Create a new report
  async create(data) {
    const response = await instance.post("/reports", data);
    return response.data;
  },

  // Delete a report
  async delete(id) {
    const response = await instance.delete(`/reports/${id}`);
    return response.data;
  },

  // Generate daily sales report
  async generateDaily(date) {
    const response = await instance.get("/reports/daily", {
      params: { date },
    });
    return response.data;
  },

  // Generate weekly sales report
  async generateWeekly(weekStart) {
    const response = await instance.get("/reports/weekly", {
      params: { weekStart },
    });
    return response.data;
  },

  // Generate monthly sales report
  async generateMonthly(year, month) {
    const response = await instance.get("/reports/monthly", {
      params: { year, month },
    });
    return response.data;
  },
};
