import instance from "@/lib/axios";

export const customerService = {
  // Get all customers
  async getCustomers(params = {}) {
    const response = await instance.get("/customers", { params });
    return response.data;
  },

  // Get single customer
  async getCustomer(id) {
    const response = await instance.get(`/customers/${id}`);
    return response.data;
  },

  // Create customer(s)
  async createCustomer(data) {
    const response = await instance.post("/customers", data);
    return response.data;
  },

  // Update customer
  async updateCustomer(id, data) {
    const response = await instance.patch(`/customers/${id}`, data);
    return response.data;
  },

  // Delete customer
  async deleteCustomer(id) {
    const response = await instance.delete(`/customers/${id}`);
    return response.data;
  },
};
