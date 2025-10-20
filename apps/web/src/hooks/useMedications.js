import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/medicationsService";

// ===== MEDICATIONS =====
export const useMedications = (filters = {}) =>
  useQuery({
    queryKey: ["medications", filters],
    queryFn: () => api.getMedications(filters),
    keepPreviousData: true,
  });

export const useMedicationDetail = (id) =>
  useQuery({
    queryKey: ["medication", id],
    queryFn: () => api.getMedicationById(id),
    enabled: !!id,
  });

export const useCreateMedication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.createMedication(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medications"] }),
  });
};

export const useUpdateMedication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => api.updateMedication(id, payload),
    onSuccess: (_, vars) => {
      // ensure both list & detail refresh
      qc.invalidateQueries({ queryKey: ["medications"] });
      qc.invalidateQueries({ queryKey: ["medication", vars.id] });
    },
  });
};

export const useDeleteMedication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.deleteMedication(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medications"] }),
  });
};

// ===== VARIANTS (read via medication detail) =====
export const useMedicationVariants = (medId) =>
  useQuery({
    queryKey: ["variants-of-med", medId],
    queryFn: async () => {
      const med = await api.getMedicationById(medId);
      return med?.variants ?? [];
    },
    enabled: !!medId,
  });

export const useCreateVariant = (medId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      api.createVariant({ medicationId: medId, ...payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medication", medId] });
      qc.invalidateQueries({ queryKey: ["variants-of-med", medId] });
    },
  });
};

export const useUpdateVariant = (medId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, payload }) =>
      api.updateVariant(variantId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medication", medId] });
      qc.invalidateQueries({ queryKey: ["variants-of-med", medId] });
    },
  });
};

export const useDeleteVariant = (medId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variantId) => api.deleteVariant(variantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medication", medId] });
      qc.invalidateQueries({ queryKey: ["variants-of-med", medId] });
    },
  });
};
