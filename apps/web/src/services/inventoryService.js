import { instance } from "../lib/axios";

/**
 * Inventory Management API Services
 */

// Get all inventory
export const getInventory = async (params = {}) => {
  const response = await instance.get("/inventory", { params });
  return response.data;
};

// Adjust medication stock
export const adjustMedication = async (id, payload) => {
  const response = await instance.patch(
    `/inventory/batches/${id}/adjust`,
    payload
  );
  return response.data;
};

// Get low-stock medicine
export const getLowStock = async () => {
  try {
    const response = await instance.get("inventory/low-stock");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch low stock items:", error);
    throw error;
  }
};

// Get expiry medicine
export const getExpiring = async () => {
  try {
    const response = await instance.get("inventory/expiring");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch expiring items:", error);
    throw error;
  }
};
