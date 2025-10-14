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
