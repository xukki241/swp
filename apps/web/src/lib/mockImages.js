// apps/web/src/lib/mockImages.js

// Chuyển File -> dataURL để preview/lưu mock
export function fileToDataURL(file) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

const LS_KEY = (id) => `med-img:${id}`;

export function setMedicationImage(id, dataUrl) {
  if (!id || !dataUrl) return;
  try {
    localStorage.setItem(LS_KEY(id), dataUrl);
  } catch {
    // ignore quota errors
  }
}

export function getMedicationImageLocal(id) {
  try {
    return localStorage.getItem(LS_KEY(id));
  } catch {
    return null;
  }
}

export function clearMedicationImage(id) {
  try {
    localStorage.removeItem(LS_KEY(id));
  } catch {
    // ignore
  }
}

/**
 * Url ảnh ưu tiên:
 * 1) localStorage (nếu có)
 * 2) ảnh tĩnh trong public: /images/medications/<id>.jpg
 *    (nếu bạn có .png hãy tự đổi trong component nếu muốn)
 * 3) null -> UI hiển thị placeholder
 */
export function getMedicationImageUrl(id) {
  const local = getMedicationImageLocal(id);
  if (local) return local;
  return `/images/medications/${id}.jpg`;
}
