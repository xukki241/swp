import instance from "@/lib/axios";

export const salesService = {
  // Get all sales orders
  async getSalesOrders(params = {}) {
    const response = await instance.get("/sales", { params });
    return response.data;
  },

  // Get single sales order
  async getSalesOrder(id) {
    const response = await instance.get(`/sales/${id}`);
    return response.data;
  },

  // Create sales order
  async createSalesOrder(data) {
    const response = await instance.post("/sales", data);
    return response.data;
  },

  // Update sales order status
  async updateSalesOrder(id, data) {
    const response = await instance.patch(`/sales/${id}`, data);
    return response.data;
  },

  // Delete/cancel sales order
  async deleteSalesOrder(id) {
    const response = await instance.delete(`/sales/${id}`);
    return response.data;
  },

  // Send sales invoice email
  async sendInvoiceEmail(invoiceData) {
    const response = await instance.post(
      "/send-sales-invoice-email",
      invoiceData
    );
    return response.data;
  },
};
