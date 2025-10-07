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
  const response = await instance.post("/auth/logout");
  return response.data;
};

// Refresh token
export const refreshToken = async () => {
  const response = await instance.post("/auth/refresh");
  return response.data;
};
