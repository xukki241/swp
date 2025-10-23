"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

import {
  getAllZones,
  getZoneById,
  updateZone,
  getRacksByZone,
  updateRack,
  getBinsByRack,
  updateBin,
  deleteBin,
} from "../services/inventoryService";

/**
 * Custom hook for warehouse management
 * Handles fetching and updating warehouse data (zones, racks, bins)
 */
export const useWarehouse = () => {
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [racks, setRacks] = useState([]);
  const [bins, setBins] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all zones on mount
  useEffect(() => {
    fetchZones();
  }, []);

  // Fetch zones
  const fetchZones = useCallback(async () => {
    try {
      setLoading(true);
      const responseData = await getAllZones();
      setZones(responseData.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch zones");
    } finally {
      setLoading(false);
    }
  }, []);

  // Select zone and fetch its racks
  const selectZone = useCallback(async (zoneId) => {
    try {
      setLoading(true);
      const zoneData = await getZoneById(zoneId);
      setSelectedZone(zoneData.data);

      const racksData = await getRacksByZone(zoneId);
      setRacks(racksData.data || []);

      // Fetch bins for each rack
      const binsMap = {};
      for (const rack of racksData.data || []) {
        const binsData = await getBinsByRack(rack.id);
        binsMap[rack.id] = binsData.data || [];
      }
      setBins(binsMap);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch zone details");
    } finally {
      setLoading(false);
    }
  }, []);

  // Update zone
  const updateZoneData = useCallback(async (zoneId, zoneData) => {
    try {
      const response = await updateZone({ id: zoneId, ...zoneData });
      setSelectedZone(response.data);
      toast.success("Zone updated successfully");
      return response.data;
    } catch (err) {
      toast.error("Failed to update zone");
      throw err;
    }
  }, []);

  // Update rack
  const updateRackData = useCallback(async (rackId, rackData) => {
    try {
      const response = await updateRack({ id: rackId, ...rackData });
      setRacks((prevRacks) =>
        prevRacks.map((r) => (r.id === rackId ? response.data : r))
      );
      toast.success("Rack updated successfully");
      return response.data;
    } catch (err) {
      toast.error("Failed to update rack");
      throw err;
    }
  }, []);

  // Update bin
  const updateBinData = useCallback(async (binId, binData) => {
    try {
      const response = await updateBin({ id: binId, ...binData });
      // Update bins in the map
      setBins((prevBins) => {
        const newBins = { ...prevBins };
        for (const rackId in newBins) {
          newBins[rackId] = newBins[rackId].map((b) =>
            b.id === binId ? response.data : b
          );
        }
        return newBins;
      });
      toast.success("Bin updated successfully");
      return response.data;
    } catch (err) {
      toast.error("Failed to update bin");
      throw err;
    }
  }, []);

  // Delete bin
  const deleteBinData = useCallback(async (binId, rackId) => {
    try {
      await deleteBin(binId);
      setBins((prevBins) => ({
        ...prevBins,
        [rackId]: prevBins[rackId].filter((b) => b.id !== binId),
      }));
      toast.success("Bin deleted successfully");
    } catch (err) {
      toast.error("Failed to delete bin");
      throw err;
    }
  }, []);

  return {
    zones,
    selectedZone,
    racks,
    bins,
    loading,
    error,
    selectZone,
    updateZoneData,
    updateRackData,
    updateBinData,
    deleteBinData,
    fetchZones,
  };
};
