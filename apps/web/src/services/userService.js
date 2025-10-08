import { instance } from "@/lib/axios";

/**
 * User Management API Services
 */

// Get all staff with optional filters
export const getAllStaff = async (params = {}) => {
  const response = await instance.get("/users/staff", { params });
  return response.data;
};

// Get all users with optional search
export const getAllUsers = async (params = {}) => {
  const response = await instance.get("/users", { params });
  return response.data;
};

// Get user by ID
export const getUserById = async (id) => {
  const response = await instance.get(`/users/${id}`);
  return response.data;
};

// Create new user (owner only)
export const createUser = async (userData) => {
  const response = await instance.post("/users", userData);
  return response.data;
};

// Update user (owner only)
export const updateUser = async ({ id, ...userData }) => {
  const response = await instance.put(`/users/${id}`, userData);
  return response.data;
};

// Delete user (owner only)
export const deleteUser = async (id) => {
  const response = await instance.delete(`/users/${id}`);
  return response.data;
};

// Activate user (owner only)
export const activateUser = async (id) => {
  const response = await instance.patch(`/users/${id}/activate`);
  return response.data;
};

// Deactivate user (owner only)
export const deactivateUser = async (id) => {
  const response = await instance.patch(`/users/${id}/deactivate`);
  return response.data;
};

// Suspend user (owner only)
export const suspendUser = async (id) => {
  const response = await instance.patch(`/users/${id}/suspend`);
  return response.data;
};
