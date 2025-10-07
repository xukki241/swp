import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getRegistrationRequests,
  getRegistrationRequestById,
  approveRegistrationRequest,
  rejectRegistrationRequest,
  deleteRegistrationRequest,
} from "@/services/registrationService";

/**
 * Hook to fetch all registration requests
 * @param {Object} filters - { status: 'pending' | 'approved' | 'rejected' }
 */
export const useRegistrationRequests = (filters = {}) => {
  return useQuery({
    queryKey: ["registrationRequests", filters],
    queryFn: () => getRegistrationRequests(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch a single registration request
 */
export const useRegistrationRequest = (id) => {
  return useQuery({
    queryKey: ["registrationRequests", id],
    queryFn: () => getRegistrationRequestById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to approve a registration request
 * Requires: { id, password, role } where role is 'staff' or 'sales'
 */
export const useApproveRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveRegistrationRequest,
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["registrationRequests"] });
      queryClient.invalidateQueries({
        queryKey: ["registrationRequests", variables.id],
      });
    },
  });
};

/**
 * Hook to reject a registration request
 */
export const useRejectRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectRegistrationRequest,
    onSuccess: (data, requestId) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["registrationRequests"] });
      queryClient.invalidateQueries({
        queryKey: ["registrationRequests", requestId],
      });
    },
  });
};

/**
 * Hook to delete a registration request
 */
export const useDeleteRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRegistrationRequest,
    onSuccess: (data, requestId) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["registrationRequests"] });
      // Remove specific item from cache
      queryClient.removeQueries({
        queryKey: ["registrationRequests", requestId],
      });
    },
  });
};
