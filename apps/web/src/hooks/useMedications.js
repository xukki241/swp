import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { instance } from "@/lib/axios";
import * as api from "@/services/medicationsService";

const FIVE_MIN = 5 * 60 * 1000;

/**
 * Helper: fetch all medications.
 * Prefer a service helper if available, otherwise use axios instance.
 */
export const getAllMedications = async (filters) => {
  if (filters && Object.keys(filters).length) {
    if (typeof api.getMedications === "function") {
      return api.getMedications(filters);
    }
    const res = await instance.get("/medications", { params: filters });
    return res.data;
  }

  if (typeof api.getAllMedications === "function") {
    return api.getAllMedications();
  }

  if (typeof api.getMedications === "function") {
    return api.getMedications({});
  }

  const res = await instance.get("/medications");
  return res.data;
};

/**
 * Hook: list medications (supports filters)
 */
export const useMedications = (filters = {}) =>
  useQuery({
    queryKey: ["medications", filters],
    queryFn: () => getAllMedications(filters),
    keepPreviousData: true,
    staleTime: FIVE_MIN,
  });

/**
 * Hook: medication detail
 */
export const useMedicationDetail = (id) =>
  useQuery({
    queryKey: ["medication", id],
    queryFn: async () => {
      if (typeof api.getMedicationById === "function") {
        return api.getMedicationById(id);
      }
      const res = await instance.get(`/medications/${id}`);
      return res.data;
    },
    enabled: !!id,
    staleTime: FIVE_MIN,
  });

/**
 * CRUD mutations for medications
 */
export const useCreateMedication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      typeof api.createMedication === "function"
        ? api.createMedication(data)
        : instance.post("/medications", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medications"] }),
  });
};

export const useUpdateMedication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) =>
      typeof api.updateMedication === "function"
        ? api.updateMedication(id, payload)
        : instance.patch(`/medications/${id}`, payload).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["medications"] });
      if (vars && vars.id) {
        qc.invalidateQueries({ queryKey: ["medication", vars.id] });
      }
    },
  });
};

export const useDeleteMedication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      typeof api.deleteMedication === "function"
        ? api.deleteMedication(id)
        : instance.delete(`/medications/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medications"] }),
  });
};

/**
 * VARIANTS
 */
export const useMedicationVariants = (medicationId) =>
  useQuery({
    queryKey: ["medicationVariants", medicationId],
    queryFn: async () => {
      if (!medicationId) {
        return { data: [] };
      }

      if (typeof api.getMedicationVariants === "function") {
        return api.getMedicationVariants(medicationId);
      }
      if (typeof api.getMedicationById === "function") {
        const med = await api.getMedicationById(medicationId);
        return { data: med?.variants ?? [] };
      }

      const res = await instance.get(`/medications/${medicationId}/variants`);
      return res.data;
    },
    enabled: !!medicationId,
    staleTime: FIVE_MIN,
  });

export const getAllMedicationsVariants = async () => {
  if (typeof api.getAllMedicationsVariants === "function") {
    return api.getAllMedicationsVariants();
  }
  if (typeof api.getAllMedicationVariants === "function") {
    return api.getAllMedicationVariants();
  }
  const res = await instance.get("/medications/variants/all");
  return res.data;
};

export const useMedicationsVariants = () =>
  useQuery({
    queryKey: ["medicationVariantsAll"],
    queryFn: getAllMedicationsVariants,
    staleTime: FIVE_MIN,
  });

/**
 * Variant mutations (create/update/delete)
 */
export const useCreateVariant = (medicationId) => {
  const qc = useQueryClient();
  return useMutation({
    // payload là object; service sẽ tự wrap thành mảng khi POST
    mutationFn: (payload) => api.createVariant(medicationId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medication", medicationId] });
      qc.invalidateQueries({ queryKey: ["medicationVariants", medicationId] });
      qc.invalidateQueries({ queryKey: ["medicationVariantsAll"] });
    },
  });
};

export const useUpdateVariant = (medicationId) => {
  const qc = useQueryClient();
  return useMutation({
    // BẮT BUỘC truyền { variantId, payload }
    mutationFn: ({ variantId, payload }) =>
      api.updateVariant(medicationId, variantId, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["medication", medicationId] });
      qc.invalidateQueries({ queryKey: ["medicationVariants", medicationId] });
      qc.invalidateQueries({ queryKey: ["medicationVariantsAll"] });
      if (vars?.variantId) {
        // nếu có trang detail variant thì có thể invalid thêm ở đây
      }
    },
  });
};

export const useDeleteVariant = (medicationId) => {
  const qc = useQueryClient();
  return useMutation({
    // BẮT BUỘC truyền variantId
    mutationFn: (variantId) => api.deleteVariant(medicationId, variantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medication", medicationId] });
      qc.invalidateQueries({ queryKey: ["medicationVariants", medicationId] });
      qc.invalidateQueries({ queryKey: ["medicationVariantsAll"] });
    },
  });
};
