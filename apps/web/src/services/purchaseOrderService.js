import { instance } from "@/lib/axios";

/**
 * Purchase Orders API Services
 */

// Lấy tất cả đơn hàng (với filter tùy chọn)
export const getAllPurchaseOrders = async (params = {}) => {
  const response = await instance.get("/purchases", { params });
  return response.data;
};

// Lấy 1 đơn hàng theo ID
export const getPurchaseOrderById = async (id) => {
  const response = await instance.get(`/purchases/${id}`);
  return response.data;
};

// Xóa đơn hàng
export const deletePurchaseOrder = async (id) => {
  const response = await instance.delete(`/purchases/${id}`);
  return response.data;
};

// (Nếu cần thêm) Cập nhật trạng thái đơn hàng
export const updatePurchaseOrderStatus = async (id, status) => {
  const response = await instance.patch(`/purchases/${id}`, { status });
  return response.data;
};
export const createPurchaseOrder = async (payload) => {
  const response = await instance.post("/purchases", payload);
  return response.data;
};

/**
 * Purchase Order Receipts API Services
 */

// Lấy tất cả receipts (across all purchase orders)
export const getAllPurchaseOrderReceipts = async (params = {}) => {
  const response = await instance.get("/purchases/receipts", { params });
  return response.data;
};

// Lấy receipts của 1 purchase order cụ thể
export const getPurchaseOrderReceipts = async (
  purchaseOrderId,
  params = {}
) => {
  const response = await instance.get(
    `/purchases/${purchaseOrderId}/receipts`,
    { params }
  );
  return response.data;
};

// Lấy 1 receipt theo ID
export const getPurchaseOrderReceiptById = async (id) => {
  const response = await instance.get(`/purchases/receipts/${id}`);
  return response.data;
};

// Tạo receipt mới cho purchase order
export const createPurchaseOrderReceipt = async (purchaseOrderId, payload) => {
  const response = await instance.post(
    `/purchases/${purchaseOrderId}/receipts`,
    payload
  );
  return response.data;
};

// Xóa receipt
export const deletePurchaseOrderReceipt = async (id) => {
  const response = await instance.delete(`/purchases/receipts/${id}`);
  return response.data;
};
