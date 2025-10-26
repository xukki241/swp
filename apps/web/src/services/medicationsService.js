// src/services/medicationsService.js
import instance from "@/lib/axios";

/* =========================================================
 *                       MEDICATIONS
 * ======================================================= */

// GET /api/medications?search=&status=
export async function getMedications(params = {}) {
  const res = await instance.get("/medications", { params });
  // Chuẩn hóa: ưu tiên data.data nếu có, fallback data
  return res.data?.data ?? res.data;
}

// GET /api/medications/:id
export async function getMedicationById(id) {
  const res = await instance.get(`/medications/${id}`);
  return res.data?.data ?? res.data;
}

// POST /api/medications  (API yêu cầu dạng batch)
// -> map 2 boolean sang snake_case theo tài liệu Postman
export async function createMedication(payload) {
  const arr = Array.isArray(payload) ? payload : [payload];
  const body = arr.map((m) => ({
    name: m.name,
    brand: m.brand ?? null,
    description: m.description ?? null,
    is_prescription_required: !!m.isPrescriptionRequired,
    is_controlled_substance: !!m.isControlledSubstance,
    status: m.status ?? "active",
  }));
  const res = await instance.post("/medications", body);
  // Có thể trả về mảng (batch) hoặc object tuỳ backend
  const data = res.data?.data ?? res.data;
  return data;
}

// PATCH /api/medications/:id
// Backend hiện không cho update 2 boolean ⇒ LOẠI chúng khỏi payload để tránh “bật về”
export async function updateMedication(id, payload) {
  const {
    isPrescriptionRequired,
    isControlledSubstance,
    is_prescription_required,
    is_controlled_substance,
    ...rest
  } = payload || {};

  const res = await instance.patch(`/medications/${id}`, rest);
  return res.data?.data ?? res.data;
}

// DELETE /api/medications/:id
export async function deleteMedication(id) {
  const res = await instance.delete(`/medications/${id}`);
  return res.data?.data ?? res.data;
}

/* =========================================================
 *                        VARIANTS (LIST)
 * ======================================================= */

// GET /api/medications/variants/all (tất cả biến thể)
export async function getAllMedicationsVariants(params = {}) {
  const res = await instance.get("/medications/variants/all", { params });
  return res.data?.data ?? res.data;
}

// Alias để tương thích tên hàm có thể bị gọi ở nơi khác
export async function getAllMedicationVariants(params = {}) {
  return getAllMedicationsVariants(params);
}

// GET /api/medications/:medicationId/variants (biến thể theo thuốc)
export async function getMedicationVariants(medicationId) {
  const res = await instance.get(`/medications/${medicationId}/variants`);
  return res.data?.data ?? res.data;
}

// GET /api/medications/:medicationId/variants/:variantId
export async function getMedicationVariant(medicationId, variantId) {
  const res = await instance.get(
    `/medications/${medicationId}/variants/${variantId}`
  );
  return res.data?.data ?? res.data;
}

/* =========================================================
 *                        VARIANTS (CRUD)
 *  Giữ nguyên chữ ký của phiên bản 1:
 *    - createVariant(medicationId, payload)
 *    - updateVariant(medicationId, variantId, payload)
 *    - deleteVariant(medicationId, variantId)
 *  Lưu ý: backend yêu cầu body dạng ARRAY cho POST (batch)
 * ======================================================= */

// POST /api/medications/:medicationId/variants (batch)
export async function createVariant(medicationId, payload) {
  const arr = Array.isArray(payload) ? payload : [payload];
  const res = await instance.post(`/medications/${medicationId}/variants`, arr);
  const data = res.data?.data ?? res.data;
  return data;
}

// PATCH /api/medications/:medicationId/variants/:variantId
export async function updateVariant(medicationId, variantId, payload) {
  const res = await instance.patch(
    `/medications/${medicationId}/variants/${variantId}`,
    payload
  );
  return res.data?.data ?? res.data;
}

// DELETE /api/medications/:medicationId/variants/:variantId
export async function deleteVariant(medicationId, variantId) {
  const res = await instance.delete(
    `/medications/${medicationId}/variants/${variantId}`
  );
  return res.data?.data ?? res.data;
}

/* =========================================================
 *                      VIEW / RELATED
 * ======================================================= */

// /api/medications/:id/suppliers
export async function getSuppliersByMedication(id) {
  const res = await instance.get(`/medications/${id}/suppliers`);
  return res.data;
}

// /api/medications/:id/purchases
export async function getPurchasesByMedication(id) {
  const res = await instance.get(`/medications/${id}/purchases`);
  return res.data;
}

// /api/medications/:id/sales
export async function getSalesByMedication(id) {
  const res = await instance.get(`/medications/${id}/sales`);
  return res.data;
}

// /api/inventory/summary/by-variant
export async function getInventorySummary() {
  const res = await instance.get(`/inventory/summary/by-variant`, {
    params: { page: 1, limit: 10, sortOrder: "asc" },
  });
  return res.data;
}

/* =========================================================
 *                SEARCH (POS) & VALIDATION
 * ======================================================= */

// POS search: /api/medications/variants/search-for-sale
export async function searchMedications(search) {
  const res = await instance.get("/medications/variants/search-for-sale", {
    params: { search },
  });
  return res.data;
}

// Kiểm tra barcode trùng
export async function findVariantsByBarcode(barcode) {
  if (!barcode) return [];
  const res = await instance.get("/medications/variants/all", {
    params: { search: barcode },
  });
  const data = res.data?.data ?? res.data;
  return Array.isArray(data) ? data : [];
}
