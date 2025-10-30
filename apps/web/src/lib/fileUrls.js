// apps/web/src/lib/fileUrls.js

// Lưu/đọc ảnh mock theo medicationId bằng localStorage (tránh gọi API để không 401)
const IMG_KEY = (medicationId) => `medimg:${String(medicationId)}`;

/** Lấy dataURL ảnh đã lưu cục bộ (nếu có) */
export function getMedicationImageLocal(medicationId) {
  try {
    const val = localStorage.getItem(IMG_KEY(medicationId));
    return val || null;
  } catch {
    return null;
  }
}

/** Lưu dataURL ảnh cục bộ */
export function setMedicationImage(medicationId, dataUrl) {
  try {
    if (dataUrl) {
      localStorage.setItem(IMG_KEY(medicationId), dataUrl);
    }
  } catch {
    // ignore quota/private mode
  }
}

/** Xóa ảnh cục bộ */
export function clearMedicationImage(medicationId) {
  try {
    localStorage.removeItem(IMG_KEY(medicationId));
  } catch {
    // ignore
  }
}

/** File -> dataURL để preview/lưu local */
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return resolve(null);
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** URL fallback ảnh tĩnh trong public (nếu bạn có để sẵn) */
export function getMedicationImageUrl(medicationId, version = 0) {
  if (!medicationId) {
    return null;
  }
  return `/images/medications/${medicationId}.jpg?v=${version}`;
}

/** Giữ sẵn nếu cần dùng theo fileId (không dùng trong mock hiện tại) */
export function getFileViewUrl(fileId, version = 0) {
  if (!fileId) {
    return null;
  }
  return `/api/files/${fileId}/view?v=${version}`;
}

export function getFileDownloadUrl(fileId) {
  if (!fileId) {
    return null;
  }
  return `/api/files/${fileId}/download`;
}
