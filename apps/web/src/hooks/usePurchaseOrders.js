import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  deletePurchaseOrder,
  updatePurchaseOrderStatus,
  createPurchaseOrder,
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
