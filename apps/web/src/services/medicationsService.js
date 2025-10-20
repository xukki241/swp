import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// token
function getToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("accessToken")
  );
}
api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e?.response?.status === 401) {
      try {
        localStorage.removeItem("access_token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("accessToken");
      } catch {}
      if (typeof window !== "undefined") window.location.replace("/login");
    }
    return Promise.reject(e);
  }
);

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;
const clean = (o = {}) =>
  Object.fromEntries(
    Object.entries(o).filter(
      ([_, v]) => v !== undefined && v !== null && String(v).trim() !== ""
    )
  );

// ===== MEDICATIONS =====
export const getMedications = async (params = {}) => {
  const res = await api.get("/medications", { params: clean(params) });
  return unwrap(res);
};
export const getMedicationById = async (id) =>
  unwrap(await api.get(`/medications/${id}`));
export const createMedication = async (payload) =>
  unwrap(await api.post("/medications", payload));
export const updateMedication = async (id, payload) =>
  unwrap(await api.put(`/medications/${id}`, payload));
export const deleteMedication = async (id) =>
  unwrap(await api.delete(`/medications/${id}`));

// ===== VARIANTS (flat routes) =====
export const createVariant = async (payload) =>
  unwrap(await api.post("/medication-variants", payload));
export const updateVariant = async (variantId, payload) =>
  unwrap(await api.put(`/medication-variants/${variantId}`, payload));
export const deleteVariant = async (variantId) =>
  unwrap(await api.delete(`/medication-variants/${variantId}`));

// global barcode search (for uniqueness check)
export const findVariantsByBarcode = async (barcode) => {
  if (!barcode) return [];
  const res = await api.get("/medication-variants", {
    params: { search: barcode },
  });
  const data = unwrap(res);
  return Array.isArray(data) ? data : data?.data || [];
};

export default {
  getMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
  createVariant,
  updateVariant,
  deleteVariant,
  findVariantsByBarcode,
};
