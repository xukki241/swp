import instance from "@/lib/axios";

export const medicationService = {
  // Get all medication variants (for sale)
  async getMedicationVariants(params = {}) {
    const response = await instance.get("/medications/variants/all", {
      params,
    });
    return response.data;
  },

  // Get single medication variant
  async getMedicationVariant(id) {
    const response = await instance.get(`/medications/variants/${id}`);
    return response.data;
  },

  // Search medications for POS
  async searchMedications(search) {
    const response = await instance.get("/medications/variants/search-for-sale", {
      params: { search },
    });
    return response.data;
  },
};
