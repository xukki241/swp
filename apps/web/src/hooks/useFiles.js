import * as api from "@/services/filesService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Hook: Upload file
 */
export const useUploadFile = () => {
  return useMutation({
    mutationFn: (file) => api.uploadFile(file),
  });
};

/**
 * Hook: Download file
 */
export const useDownloadFile = () => {
  return useMutation({
    mutationFn: async ({ fileId, filename }) => {
      const blob = await api.downloadFile(fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "download";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
};

/**
 * Hook: Get file metadata
 */
export const useFile = (fileId) =>
  useQuery({
    queryKey: ["file", fileId],
    queryFn: () => api.getFileById(fileId),
    enabled: !!fileId,
  });

/**
 * Hook: Delete file
 */
export const useDeleteFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fileId) => api.deleteFile(fileId),
    onSuccess: (_, fileId) => {
      qc.invalidateQueries({ queryKey: ["file", fileId] });
    },
  });
};
