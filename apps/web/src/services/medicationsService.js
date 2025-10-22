import instance from "@/lib/axios";

// ===== MEDICATIONS =====
export async function getMedications(params = {}) {
  const response = await instance.get("/medications", { params });
  return response.data;
}

export async function getMedicationById(id) {
  const response = await instance.get(`/medications/${id}`);
  return response.data;
}

export async function createMedication(payload) {
  const response = await instance.post("/medications", payload);
  return response.data;
}

export async function updateMedication(id, payload) {
  const response = await instance.patch(`/medications/${id}`, payload);
  return response.data;
}

export async function deleteMedication(id) {
  const response = await instance.delete(`/medications/${id}`);
  return response.data;
}

// ===== VARIANTS =====
export async function getMedicationVariants(params = {}) {
  const response = await instance.get("/medications/variants/all", { params });
  return response.data;
}

// Note: To get a single variant, you need medicationId
// Use: GET /medications/{medicationId}/variants/{variantId}
export async function getMedicationVariant(medicationId, variantId) {
  const response = await instance.get(
    `/medications/${medicationId}/variants/${variantId}`
  );
  return response.data;
}

export async function createVariant(medicationId, payload) {
  const response = await instance.post(
    `/medications/${medicationId}/variants`,
    payload
  );
  return response.data;
}

export async function updateVariant(medicationId, variantId, payload) {
  const response = await instance.patch(
    `/medications/${medicationId}/variants/${variantId}`,
    payload
  );
  return response.data;
}

export async function deleteVariant(medicationId, variantId) {
  const response = await instance.delete(
    `/medications/${medicationId}/variants/${variantId}`
  );
  return response.data;
}

// ===== SEARCH =====
// For POS: search medications with inventory data
export async function searchMedications(search) {
  const response = await instance.get("/medications/variants/search-for-sale", {
    params: { search },
  });
  return response.data;
}

// ===== BARCODE SEARCH =====
export async function findVariantsByBarcode(barcode) {
  if (!barcode) {
    return [];
  }
  const response = await instance.get("/medications/variants/all", {
    params: { search: barcode },
  });
  const data = response.data;
  return Array.isArray(data) ? data : data?.data || [];
}
