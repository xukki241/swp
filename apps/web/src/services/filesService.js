import { instance } from "@/lib/axios";

/**
 * File API Services
 */

// Upload file
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await instance.post("/files", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Download file
export const downloadFile = async (fileId) => {
  const response = await instance.get(`/files/${fileId}/download`, {
    responseType: "blob",
  });
  return response.data;
};

// Get file metadata
export const getFileById = async (fileId) => {
  const response = await instance.get(`/files/${fileId}`);
  return response.data;
};

// Delete file
export const deleteFile = async (fileId) => {
  const response = await instance.delete(`/files/${fileId}`);
  return response.data;
};
