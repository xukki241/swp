import { instance } from "@/lib/axios";

/**
 * Supplier API Services
 */

// Get all suppliers with optional filters
export const getAllSuppliers = async (params = {}) => {
  const response = await instance.get("/suppliers", { params });
  return response.data;
};

// Get supplier by ID
export const getSupplierById = async (id) => {
  const response = await instance.get(`/suppliers/${id}`);
  return response.data;
};

// Create new supplier with optional medication variants
export const createSupplier = async (supplierData) => {
  const response = await instance.post("/suppliers", supplierData);
  return response.data;
};

// Update supplier
export const updateSupplier = async ({ id, ...supplierData }) => {
  const response = await instance.put(`/suppliers/${id}`, supplierData);
  return response.data;
};

// Delete supplier
export const deleteSupplier = async (id) => {
  const response = await instance.delete(`/suppliers/${id}`);
  return response.data;
};
