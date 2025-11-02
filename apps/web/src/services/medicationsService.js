import instance from "@/lib/axios";

/* ===================== MEDICATIONS ===================== */

// GET /api/medications?search=&status=
export async function getMedications(params = {}) {
  const res = await instance.get("/medications", { params });
  return res.data?.data ?? res.data;
}

// GET /api/medications/:id
export async function getMedicationById(id) {
  const res = await instance.get(`/medications/${id}`);
  return res.data?.data ?? res.data;
}

// POST /api/medications (API nhận dạng batch)
export async function createMedication(payload) {
  const arr = Array.isArray(payload) ? payload : [payload];
  const body = arr.map((m) => ({
    name: m.name,
    brand: m.brand ?? null,
    description: m.description ?? null,
    // CREATE: 2 boolean dùng snake_case
    is_prescription_required: !!m.isPrescriptionRequired,
    is_controlled_substance: !!m.isControlledSubstance,
    status: m.status ?? "active",
  }));
  const res = await instance.post("/medications", body);
  return res.data?.data ?? res.data;
}

// PATCH /api/medications/:id
// BACKEND MỚI: cho update 2 boolean nếu gửi snake_case
export async function updateMedication(id, payload = {}) {
  const {
    // camelCase (từ form FE)
    isPrescriptionRequired,
    isControlledSubstance,
    // snake_case (nếu có gửi thẳng vào service)
    is_prescription_required,
    is_controlled_substance,
    ...rest
  } = payload;

  const body = { ...rest };

  // Ưu tiên camelCase nếu có; nếu không, nhận snake_case; nếu không truyền thì bỏ qua
  if (
    typeof isPrescriptionRequired !== "undefined" ||
    typeof is_prescription_required !== "undefined"
  ) {
    body.is_prescription_required =
      typeof isPrescriptionRequired !== "undefined"
        ? !!isPrescriptionRequired
        : !!is_prescription_required;
  }

  if (
    typeof isControlledSubstance !== "undefined" ||
    typeof is_controlled_substance !== "undefined"
  ) {
    body.is_controlled_substance =
      typeof isControlledSubstance !== "undefined"
        ? !!isControlledSubstance
        : !!is_controlled_substance;
  }

  const res = await instance.patch(`/medications/${id}`, body);
  return res.data?.data ?? res.data;
}

// DELETE /api/medications/:id
export async function deleteMedication(id) {
  const res = await instance.delete(`/medications/${id}`);
  return res.data?.data ?? res.data;
}

/* ===================== VARIANTS (LIST) ===================== */

// GET /api/medications/variants/all
export async function getAllMedicationsVariants(params = {}) {
  const res = await instance.get("/medications/variants/all", { params });
  return res.data?.data ?? res.data;
}

// Alias tương thích
export async function getAllMedicationVariants(params = {}) {
  return getAllMedicationsVariants(params);
}

// GET /api/medications/:medicationId/variants
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

/* ===================== VARIANTS (CRUD) ===================== */

// POST /api/medications/:medicationId/variants (batch)
export async function createVariant(medicationId, payload) {
  const body = Array.isArray(payload) ? payload : [payload];
  const res = await instance.post(
    `/medications/${medicationId}/variants`,
    body
  );
  return res.data?.data ?? res.data;
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

/* ===================== VIEW / RELATED ===================== */

export async function getSuppliersByMedication(id) {
  const res = await instance.get(`/medications/${id}/suppliers`);
  return res.data;
}

export async function getPurchasesByMedication(id) {
  const res = await instance.get(`/medications/${id}/purchases`);
  return res.data;
}

export async function getSalesByMedication(id) {
  const res = await instance.get(`/medications/${id}/sales`);
  return res.data;
}

export async function getInventorySummary() {
  const res = await instance.get(`/inventory/summary/by-variant`, {
    params: { page: 1, limit: 10, sortOrder: "asc" },
  });
  return res.data;
}

/* ===================== SEARCH / VALIDATION ===================== */

export async function searchMedications(search) {
  const res = await instance.get("/medications/variants/search-for-sale", {
    params: { search },
  });
  return res.data?.data ?? res.data;
}

export async function findVariantsByBarcode(barcode) {
  if (!barcode) {
    return [];
  }
  const res = await instance.get("/medications/variants/all", {
    params: { search: barcode },
  });
  const data = res.data?.data ?? res.data;
  return Array.isArray(data) ? data : [];
}

/** Upload/replace medication image (multipart/form-data, field: "image") */
export async function uploadMedicationImage(medicationId, file) {
  const form = new FormData();
  form.append("image", file);
  const { data } = await api.post(
    `/api/medications/${medicationId}/upload-image`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data?.data; // { medication, image }
}

/** Delete medication image (set imageId = null) */
export async function deleteMedicationImage(medicationId) {
  const { data } = await api.delete(`/api/medications/${medicationId}/image`);
  return data?.data; // medication
}
