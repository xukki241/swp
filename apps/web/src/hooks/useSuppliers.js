import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  getSupplierMedications,
  updateSupplierMedications,
  deleteSupplier,
} from "@/services/supplierService";

/**
 * Hook to fetch all suppliers with filters
 * @param {Object} filters - { search, status, limit, offset }
 */
export const useSuppliers = (filters = {}) => {
  return useQuery({
    queryKey: ["suppliers", filters],
    queryFn: () => getAllSuppliers(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch a single supplier
 */
export const useSupplier = (id) => {
  return useQuery({
    queryKey: ["suppliers", id],
    queryFn: () => getSupplierById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to create a new supplier
 * Supports creating supplier with medication variants in one call
 */
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};

/**
 * Hook to update a supplier
 */
export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSupplier,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers", variables.id] });
    },
  });
};

/**
 * Hook to delete a supplier
 */
export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: (data, supplierId) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.removeQueries({ queryKey: ["suppliers", supplierId] });
    },
  });
};

export const useSupplierMedications = (supplierId) => {
  return useQuery({
    queryKey: ["supplierMedications", supplierId],
    queryFn: () => getSupplierMedications(supplierId),
    enabled: !!supplierId,
  });
};

export const useUpdateSupplierMedications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ supplierId, medications }) =>
      updateSupplierMedications(supplierId, medications),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["supplierMedications", variables.supplierId],
      });
    },
  });
};
