import { instance } from "@/lib/axios";

/**
 * Purchase Orders API Services
 */

// Lấy tất cả đơn hàng (với filter tùy chọn)
export const getAllPurchaseOrders = async (params = {}) => {
  const response = await instance.get("/purchase-orders", { params });
  return response.data;
};

// Lấy 1 đơn hàng theo ID
export const getPurchaseOrderById = async (id) => {
  const response = await instance.get(`/purchase-orders/${id}`);
  return response.data;
};

// Xóa đơn hàng
export const deletePurchaseOrder = async (id) => {
  const response = await instance.delete(`/purchase-orders/${id}`);
  return response.data;
};

// (Nếu cần thêm) Cập nhật trạng thái đơn hàng
export const updatePurchaseOrderStatus = async (id, status) => {
  const response = await instance.patch(`/purchase-orders/${id}`, { status });
  return response.data;
};
