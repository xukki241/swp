import { useMutation } from "@tanstack/react-query";

import axios from "@/lib/axios";

/**
 * Parse contract file and extract data
 * @param {string} fileId - Uploaded file ID
 * @returns {Promise} Parsed contract data
 */
const parseContractFile = async (fileId) => {
  const { data } = await axios.post("/contracts/parse", { fileId });
  return data;
};

/**
 * Hook to parse contract file
 */
export function useParseContract() {
  return useMutation({
    mutationFn: parseContractFile,
  });
}
