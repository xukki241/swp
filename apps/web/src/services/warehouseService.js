import { instance } from "@/lib/axios";

// Get all zones
export const getAllZones = async (params = {}) => {
  const response = await instance.get("/warehouse/zones", { params });
  return response.data;
};

// Get zone by ID
export const getZoneById = async (id) => {
  const response = await instance.get(`/warehouse/zones/${id}`);
  return response.data;
};

// Update zone
export const updateZone = async ({ id, ...zoneData }) => {
  const response = await instance.patch(`/warehouse/zones/${id}`, zoneData);
  return response.data;
};

// Get racks by zone
export const getRacksByZone = async (zoneId, params = {}) => {
  const response = await instance.get(`/warehouse/zones/${zoneId}/racks`, {
    params,
  });
  return response.data;
};

// Update rack
export const updateRack = async ({ id, ...rackData }) => {
  const response = await instance.patch(`/warehouse/racks/${id}`, rackData);
  return response.data;
};

// Get bins by rack
export const getBinsByRack = async (rackId, params = {}) => {
  const response = await instance.get(`/warehouse/racks/${rackId}/bins`, {
    params,
  });
  return response.data;
};

// Update bin
export const updateBin = async ({ id, ...binData }) => {
  const response = await instance.patch(`/warehouse/bins/${id}`, binData);
  return response.data;
};

// Delete bin
export const deleteBin = async (id) => {
  const response = await instance.delete(`/warehouse/bins/${id}`);
  return response.data;
};

// Get inventory for a bin
export const getBinInventory = async (binId) => {
  const response = await instance.get(`/warehouse-bins/${binId}/inventory`);
  return response.data;
};
