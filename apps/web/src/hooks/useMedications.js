import { useQuery } from "@tanstack/react-query";

import { instance } from "@/lib/axios";
export const getAllMedications = async () => {
  const res = await instance.get("/medications");
  return res.data;
};
export const useMedications = () => {
  return useQuery({
    queryKey: ["medications"],
    queryFn: getAllMedications,
    staleTime: 5 * 60 * 1000,
  });
};
export const getAllMedicationsVariants = async () => {
  const res = await instance.get("/medications/variants/all");
  return res.data;
};

export const useMedicationsVariants = () => {
  return useQuery({
    queryKey: ["medicationVariantsAll"],
    queryFn: getAllMedicationsVariants,
    staleTime: 5 * 60 * 1000,
  });
};
export const useMedicationVariants = (medicationId) => {
  return useQuery({
    queryKey: ["medicationVariants", medicationId],

    queryFn: async () => {
      const res = await instance.get(`/medications/${medicationId}/variants`);
      return res.data;
    },

    enabled: !!medicationId,

    staleTime: 5 * 60 * 1000,
  });
};
