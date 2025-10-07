import { instance } from "@/lib/axios";

/**
 * Registration Requests API Services
 */

// Get all registration requests with optional status filter
export const getRegistrationRequests = async (params = {}) => {
  const response = await instance.get("/registrations", { params });
  return response.data;
};

// Get single registration request by ID
export const getRegistrationRequestById = async (id) => {
  const response = await instance.get(`/registrations/${id}`);
  return response.data;
};

// Approve registration request
// payload: { password, role } where role is 'staff' or 'sales'
export const approveRegistrationRequest = async ({ id, password, role }) => {
  const response = await instance.post(`/registrations/${id}/approve`, {
    password,
    role,
  });
  return response.data;
};

// Reject registration request
export const rejectRegistrationRequest = async (id) => {
  const response = await instance.post(`/registrations/${id}/reject`);
  return response.data;
};

// Delete registration request
export const deleteRegistrationRequest = async (id) => {
  const response = await instance.delete(`/registrations/${id}`);
  return response.data;
};
