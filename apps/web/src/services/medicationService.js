import instance from "@/lib/axios";

export const medicationService = {
  // Get all medication variants (for sale)
  async getMedicationVariants(params = {}) {
    const response = await instance.get("/medication-variants", { params });
    return response.data;
  },

  // Get single medication variant
  async getMedicationVariant(id) {
    const response = await instance.get(`/medication-variants/${id}`);
    return response.data;
  },

  // Search medications
  async searchMedications(search) {
    const response = await instance.get("/medication-variants", {
      params: { search, isForSale: true },
    });
    return response.data;
  },
};
