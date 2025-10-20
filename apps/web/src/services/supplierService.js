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

// Update supplier (including medication variants)
export const updateSupplier = async ({ id, ...supplierData }) => {
  const response = await instance.patch(`/suppliers/${id}`, supplierData);
  return response.data;
};

// Delete supplier
export const deleteSupplier = async (id) => {
  const response = await instance.delete(`/suppliers/${id}`);
  return response.data;
};
export const getSupplierMedications = async (supplierId) => {
  const response = await instance.get(`/suppliers/${supplierId}/medications`);
  return response.data;
};

export const updateSupplierMedications = async (supplierId, medications) => {
  const response = await instance.post(
    `/suppliers/${supplierId}/medications`,
    medications
  );
  return response.data;
};
