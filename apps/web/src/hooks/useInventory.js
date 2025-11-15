import { useCallback, useEffect, useState } from "react";

import {
  adjustMedication,
  getExpiring,
  getInventory,
  getLowStock,
  getMedicationImage,
} from "@/services/inventoryService";

export const useInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [imageCache, setImageCache] = useState({});
  const [loading, setLoading] = useState({
    inventory: false,
    lowStock: false,
    expiring: false,
    adjustStock: false,
  });
  const [error, setError] = useState({
    inventory: false,
    lowStock: null,
    expiring: null,
    adjustStock: null,
  });

  const fetchInventory = useCallback(async () => {
    setLoading((prev) => ({ ...prev, inventory: true }));
    setError((prev) => ({ ...prev, inventory: null }));
    try {
      const responseData = await getInventory();
      setInventory(responseData.data || responseData);
    } catch (err) {
      setError((prev) => ({ ...prev, inventory: err.message || err }));
    } finally {
      setLoading((prev) => ({ ...prev, inventory: false }));
    }
  }, []);

  const fetchLowStock = useCallback(async () => {
    setLoading((prev) => ({ ...prev, lowStock: true }));
    setError((prev) => ({ ...prev, lowStock: null }));
    try {
      const responseData = await getLowStock();
      setLowStock(responseData.data || responseData);
    } catch (err) {
      setError((prev) => ({ ...prev, lowStock: err.message || err }));
    } finally {
      setLoading((prev) => ({ ...prev, lowStock: false }));
    }
  }, []);

  const fetchExpiring = useCallback(async () => {
    setLoading((prev) => ({ ...prev, expiring: true }));
    setError((prev) => ({ ...prev, expiring: null }));
    try {
      const responseData = await getExpiring();
      setExpiring(responseData.data || responseData);
    } catch (err) {
      setError((prev) => ({ ...prev, expiring: err.message || err }));
    } finally {
      setLoading((prev) => ({ ...prev, expiring: false }));
    }
  }, []);

  const fetchAdjustStock = useCallback(async (id, newQuantity, reason = "") => {
    setLoading((prev) => ({ ...prev, adjustStock: true }));
    setError((prev) => ({ ...prev, adjustStock: null }));
    try {
      const responseData = await adjustMedication(id, { newQuantity, reason });
      return responseData;
    } catch (err) {
      setError((prev) => ({
        ...prev,
        adjustStock: err.message || "Failed to adjust stock",
      }));
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, adjustStock: false }));
    }
  }, []);

  // Fetch image by ID
  const fetchMedicationImage = useCallback(
    async (imageId) => {
      if (!imageId) {
        return null;
      }

      // Return cached image if exists
      if (imageCache[imageId]) {
        return imageCache[imageId];
      }

      setLoading((prev) => ({ ...prev, image: true }));
      try {
        const imageUrl = await getMedicationImage(imageId);

        // Cache the image URL
        setImageCache((prev) => ({ ...prev, [imageId]: imageUrl }));

        setError((prev) => ({ ...prev, image: null }));
        return imageUrl;
      } catch (err) {
        console.error(`Failed to fetch image ${imageId}:`, err);
        setError((prev) => ({ ...prev, image: err.message }));
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, image: false }));
      }
    },
    [imageCache]
  );

  // Cleanup image URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(imageCache).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [imageCache]);

  useEffect(() => {
    fetchInventory();
    fetchLowStock();
    fetchExpiring();
  }, [fetchExpiring, fetchInventory, fetchLowStock]);

  return {
    inventory,
    lowStock,
    expiring,
    loading,
    error,
    imageCache,
    refetchInventory: fetchInventory,
    fetchAdjustStock,
    fetchMedicationImage,
  };
};
