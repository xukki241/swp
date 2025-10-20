import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  suspendUser,
} from "@/services/userService";

/**
 * Hook to fetch all users
 */
export const useUsers = (filters = {}) => {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => getAllUsers(filters),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to fetch a single user
 */
export const useUser = (id) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => getUserById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to create a new user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate and refetch user lists
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
 * Hook to update a user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data, variables) => {
      // Invalidate and refetch all user-related queries
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "active", // Only refetch active queries
      });
      queryClient.invalidateQueries({
        queryKey: ["staff"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["users", variables.id],
        refetchType: "active",
      });
    },
  });
};

/**
 * Hook to delete a user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (data, userId) => {
      // Invalidate and refetch lists
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["staff"],
        refetchType: "active",
      });
      // Remove specific user from cache
      queryClient.removeQueries({ queryKey: ["users", userId] });
    },
  });
};

/**
 * Hook to activate a user
 */
export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateUser,
    onSuccess: (data, userId) => {
      // Invalidate and refetch all user-related queries
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["staff"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["users", userId],
        refetchType: "active",
      });
    },
  });
};

/**
 * Hook to deactivate a user
 */
export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: (data, userId) => {
      // Invalidate and refetch all user-related queries
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["staff"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["users", userId],
        refetchType: "active",
      });
    },
  });
};

/**
 * Hook to suspend a user
 */
export const useSuspendUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: suspendUser,
    onSuccess: (data, userId) => {
      // Invalidate and refetch all user-related queries
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["staff"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["users", userId],
        refetchType: "active",
      });
    },
  });
};
