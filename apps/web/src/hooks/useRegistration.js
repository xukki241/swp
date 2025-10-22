import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveRegistrationRequest,
  deleteRegistrationRequest,
  getRegistrationRequestById,
  getRegistrationRequests,
  rejectRegistrationRequest,
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
 * Requires: { id, password, role } where role is 'staff' or 'owner'
 */
export const useApproveRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveRegistrationRequest,
    onSuccess: (data, variables) => {
      // Invalidate registration requests
      queryClient.invalidateQueries({
        queryKey: ["registrationRequests"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["registrationRequests", variables.id],
        refetchType: "active",
      });

      // IMPORTANT: When approving, a new user is created
      // So we need to invalidate users/staff lists too
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["staff"],
        refetchType: "active",
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
      // Invalidate and refetch registration requests
      queryClient.invalidateQueries({
        queryKey: ["registrationRequests"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["registrationRequests", requestId],
        refetchType: "active",
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
      // Invalidate and refetch registration list
      queryClient.invalidateQueries({
        queryKey: ["registrationRequests"],
        refetchType: "active",
      });
      // Remove specific item from cache
      queryClient.removeQueries({
        queryKey: ["registrationRequests", requestId],
      });
    },
  });
};
