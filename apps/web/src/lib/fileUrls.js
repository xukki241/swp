// apps/web/src/lib/fileUrls.js
import instance from "./axios";

const API_BASE_URL = instance.defaults.baseURL || "/api";

export function getMedicationImageUrl(id, imageId) {
  if (!imageId) return "/images/no-image.png";
  // Nếu API_BASE_URL đã có http/https thì dùng trực tiếp, không thì dùng relative path
  return API_BASE_URL.startsWith("http")
    ? `${API_BASE_URL}/files/${imageId}/view`
    : `/api/files/${imageId}/view`;
}

export function getMedicationImageLocal(id) {
  try {
    const data = localStorage.getItem(`medication_img_${id}`);
    return data || null;
  } catch {
    return null;
  }
}

export function setMedicationImage(id, dataUrl) {
  localStorage.setItem(`medication_img_${id}`, dataUrl);
}

export function clearMedicationImage(id) {
  localStorage.removeItem(`medication_img_${id}`);
}

// chuyển File -> dataURL để preview
export const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
