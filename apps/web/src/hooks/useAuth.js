import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import {
  changePassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  verifyResetOTP,
} from "@/services/authService";

/**
 * Hook for user login
 */
export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Store token and user info
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Redirect based on user role
      if (data.user?.role === "owner") {
        window.location.href = "/dashboard";
      } else {
        // Staff and other roles go to sales
        window.location.href = "/sales";
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};

/**
 * Hook for user registration
 */
export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      if (data.token && data.user?.role === "owner") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      navigate("/dashboard");
      // For non-owner users, don't auto-login, they need approval
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
};

/**
 * Hook for user logout
 */
export const useLogout = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login
      navigate("/login");
    },
    onError: () => {
      // Clear storage even on error
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    },
  });
};

/**
 * Hook to get current user
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: !!localStorage.getItem("token"), // Only fetch if token exists
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for requesting password reset OTP
 */
export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: requestPasswordReset,
    onError: (error) => {
      console.error("Request password reset failed:", error);
    },
  });
};

/**
 * Hook for verifying OTP and resetting password
 */
export const useVerifyResetOTP = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: verifyResetOTP,
    onSuccess: () => {
      // Redirect to login after successful password reset
      navigate("/login");
    },
    onError: (error) => {
      console.error("Verify OTP failed:", error);
    },
  });
};

/**
 * Hook for changing password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
    onError: (error) => {
      console.error("Change password failed:", error);
    },
  });
};
