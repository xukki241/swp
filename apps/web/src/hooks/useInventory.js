/* eslint-disable prettier/prettier */
import { useCallback, useEffect, useState } from "react";

import {
  adjustMedication,
  getExpiring,
  getInventory,
  getLowStock,
} from "@/services/inventoryService";

export const useInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
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
      setInventory(responseData.data);
    } catch (err) {
      setError((prev) => ({ ...prev, inventory: err }));
    } finally {
      setLoading((prev) => ({ ...prev, inventory: false }));
    }
  }, []);

  const fetchLowStock = useCallback(async () => {
    setLoading((prev) => ({ ...prev, lowStock: true }));
    setError((prev) => ({ ...prev, lowStock: null }));
    try {
      const responseData = await getLowStock();
      setLowStock(responseData.data);
    } catch (err) {
      setError((prev) => ({ ...prev, lowStock: err }));
    } finally {
      setLoading((prev) => ({ ...prev, lowStock: false }));
    }
  }, []);

  const fetchExpiring = useCallback(async () => {
    setLoading((prev) => ({ ...prev, expiring: true }));
    setError((prev) => ({ ...prev, expiring: null }));
    try {
      const responseData = await getExpiring();
      setExpiring(responseData.data);
    } catch (err) {
      setError((prev) => ({ ...prev, expiring: err }));
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

  useEffect(() => {
    fetchInventory();
    fetchLowStock();
    fetchExpiring();
  }, []);

  return {
    inventory,
    lowStock,
    expiring,
    loading,
    error,
    refetchLowStock: fetchLowStock,
    refetchExpiring: fetchExpiring,
    refetchInventory: fetchInventory,
    fetchAdjustStock,
  };
};
