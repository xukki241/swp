import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createPurchaseOrder,
  createPurchaseOrderReceipt,
  deletePurchaseOrder,
  deletePurchaseOrderReceipt,
  getAllPurchaseOrderReceipts,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  getPurchaseOrderReceiptById,
  getPurchaseOrderReceipts,
  updatePurchaseOrderStatus,
} from "@/services/purchaseOrderService";

/**
 * Hook lấy tất cả Purchase Orders
 */
export const usePurchaseOrders = (filters = {}) => {
  return useQuery({
    queryKey: ["purchaseOrders", filters],
    queryFn: () => getAllPurchaseOrders(filters),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook lấy chi tiết 1 Purchase Order
 */
export const usePurchaseOrder = (id) => {
  return useQuery({
    queryKey: ["purchaseOrders", id],
    queryFn: () => getPurchaseOrderById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook xóa Purchase Order
 */
export const useDeletePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
    },
  });
};

/**
 * Hook cập nhật trạng thái đơn hàng
 */
export const useUpdatePurchaseOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updatePurchaseOrderStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      queryClient.invalidateQueries({
        queryKey: ["purchaseOrders", variables.id],
      });
    },
  });
};
export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createPurchaseOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["purchaseOrders"]);
    },
  });
}

/**
 * ============================================
 * Purchase Order Receipts Hooks
 * ============================================
 */

/**
 * Hook lấy tất cả receipts (across all purchase orders)
 */
export const usePurchaseOrderReceipts = (filters = {}) => {
  return useQuery({
    queryKey: ["purchaseOrderReceipts", filters],
    queryFn: () => getAllPurchaseOrderReceipts(filters),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook lấy receipts của 1 purchase order cụ thể
 */
export const usePurchaseOrderReceiptsByOrder = (
  purchaseOrderId,
  filters = {}
) => {
  return useQuery({
    queryKey: ["purchaseOrderReceipts", purchaseOrderId, filters],
    queryFn: () => getPurchaseOrderReceipts(purchaseOrderId, filters),
    enabled: !!purchaseOrderId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook lấy chi tiết 1 receipt
 */
export const usePurchaseOrderReceipt = (id) => {
  return useQuery({
    queryKey: ["purchaseOrderReceipts", id],
    queryFn: () => getPurchaseOrderReceiptById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook tạo receipt mới
 */
export const useCreatePurchaseOrderReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ purchaseOrderId, payload }) =>
      createPurchaseOrderReceipt(purchaseOrderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrderReceipts"] });
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
    },
  });
};

/**
 * Hook xóa receipt
 */
export const useDeletePurchaseOrderReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePurchaseOrderReceipt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrderReceipts"] });
    },
  });
};
