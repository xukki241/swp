import { instance } from "@/lib/axios";

/**
 * Auth API Services
 */

// Login user
export const loginUser = async (credentials) => {
  const response = await instance.post("/auth/login", credentials);
  return response.data;
};

// Register new user
export const registerUser = async (userData) => {
  const response = await instance.post("/auth/register", userData);
  return response.data;
};

// Get current user profile
export const getCurrentUser = async () => {
  const response = await instance.get("/auth/me");
  return response.data;
};

// Logout user
export const logoutUser = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  const response = await instance.post("/auth/logout", { refreshToken });
  return response.data;
};

// Refresh token
export const refreshToken = async (token) => {
  const response = await instance.post("/auth/refresh", {
    refreshToken: token,
  });
  return response.data;
};

// Reset password
export const resetPassword = async (data) => {
  const response = await instance.post("/auth/reset-password", data);
  return response.data;
};

// Change password
export const changePassword = async (data) => {
  const response = await instance.post("/auth/change-password", data);
  return response.data;
};

// Request password reset OTP
export const requestPasswordReset = async (data) => {
  const response = await instance.post("/auth/forgot-password", data);
  return response.data;
};

// Verify OTP and reset password
export const verifyResetOTP = async (data) => {
  const response = await instance.post("/auth/verify-reset-otp", data);
  return response.data;
};
