// apps/web/src/lib/fileUrls.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export function getMedicationImageUrl(id, imageId) {
  return imageId ? `${API_BASE_URL}/files/${imageId}/view` : "/images/no-image.png";
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
