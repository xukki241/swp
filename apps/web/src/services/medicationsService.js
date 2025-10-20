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
  const response = await instance.put(`/medications/${id}`, payload);
  return response.data;
}

export async function deleteMedication(id) {
  const response = await instance.delete(`/medications/${id}`);
  return response.data;
}

// ===== VARIANTS =====
export async function getMedicationVariants(params = {}) {
  const response = await instance.get("/medication-variants", { params });
  return response.data;
}

export async function getMedicationVariant(id) {
  const response = await instance.get(`/medication-variants/${id}`);
  return response.data;
}

export async function createVariant(payload) {
  const response = await instance.post("/medication-variants", payload);
  return response.data;
}

export async function updateVariant(variantId, payload) {
  const response = await instance.put(
    `/medication-variants/${variantId}`,
    payload
  );
  return response.data;
}

export async function deleteVariant(variantId) {
  const response = await instance.delete(`/medication-variants/${variantId}`);
  return response.data;
}

// ===== BARCODE SEARCH =====
export async function findVariantsByBarcode(barcode) {
  if (!barcode) {
    return [];
  }
  const response = await instance.get("/medication-variants", {
    params: { search: barcode },
  });
  const data = response.data;
  return Array.isArray(data) ? data : data?.data || [];
}
