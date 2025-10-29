"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import {
  createRack,
  createZone,
  deleteBin,
  deleteRack,
  deleteZone,
  getAllZones,
  getRacksByZone,
  getZoneById,
  createBin,
  updateBin,
  updateRack,
  updateZone,
} from "../services/warehouseService"

/**
 * Custom hook for warehouse management
 * Handles fetching and updating warehouse data (zones, racks, bins)
 */
export const useWarehouse = () => {
  const [zones, setZones] = useState([])
  const [selectedZone, setSelectedZone] = useState(null)
  const [racks, setRacks] = useState([])
  const [bins, setBins] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch all zones on mount
  useEffect(() => {
    fetchZones()
  }, [])

  // Fetch zones
  const fetchZones = useCallback(async () => {
    try {
      setLoading(true)
      const responseData = await getAllZones()
      setZones(responseData.data || [])
      setError(null)
    } catch (err) {
      setError(err.message)
      toast.error("Failed to fetch zones")
    } finally {
      setLoading(false)
    }
  }, [])

  const refetchZone = useCallback(async (zoneId) => {
    try {
      setLoading(true)
      if (!zoneId) {
        setSelectedZone(null)
        setRacks([])
        setBins({})
        return
      }

      const zoneData = await getZoneById(zoneId)
      setSelectedZone(zoneData.data)

      const racksData = await getRacksByZone(zoneId)
      setRacks(racksData.data || [])

      setError(null)
    } catch (err) {
      setError(err.message)
      toast.error("Failed to refresh zone data")
    } finally {
      setLoading(false)
    }
  }, [])

  // Select zone and fetch its racks
  const selectZone = useCallback(async (zoneId) => {
    try {
      setLoading(true)
      const zoneData = await getZoneById(zoneId)
      setSelectedZone(zoneData.data)

      const racksData = await getRacksByZone(zoneId)
      setRacks(racksData.data || [])

      // Fetch bins for each rack
      // const binsMap = {};
      // for (const rack of racksData.data || []) {
      //   const binsData = await getBinsByRack(rack.id);
      //   binsMap[rack.id] = binsData.data || [];
      // }
      // setBins(binsMap);
      setError(null)
    } catch (err) {
      setError(err.message)
      toast.error(err.message || "Failed to fetch zone details")
    } finally {
      setLoading(false)
    }
  }, [])

  const createZoneData = useCallback(async (zoneData) => {
    try {
      const response = await createZone(zoneData)
      setZones((prevZones) => [...prevZones, response.data])
      toast.success("Zone created successfully")
      return response.data
    } catch (err) {
      toast.error("Failed to create zone")
      throw err
    }
  }, [])

  const deleteZoneData = useCallback(async (zoneId) => {
    try {
      await deleteZone(zoneId)
      setZones((prevZones) => prevZones.filter((z) => z.id !== zoneId))
      setSelectedZone(null)
      setRacks([])
      toast.success("Zone deleted successfully")
    } catch (err) {
      toast.error("Failed to delete zone")
      throw err
    }
  }, [])

  // Update zone
  const updateZoneData = useCallback(async (zoneId, zoneData) => {
    try {
      const response = await updateZone({ id: zoneId, ...zoneData })
      setSelectedZone(response.data)
      setZones((prevZones) => prevZones.map((z) => (z.id === zoneId ? response.data : z)))
      toast.success("Zone updated successfully")
      return response.data
    } catch (err) {
      toast.error("Failed to update zone")
      throw err
    }
  }, [])

  const createRackData = useCallback(async (zoneId, rackData) => {
    try {
      const response = await createRack(zoneId, rackData)
      setRacks((prevRacks) => [...prevRacks, response.data])
      toast.success("Rack created successfully")
      return response.data
    } catch (err) {
      toast.error("Failed to create rack")
      throw err
    }
  }, [])

  const deleteRackData = useCallback(async (zoneId, rackId) => {
    try {
      await deleteRack(zoneId, rackId)
      setRacks((prevRacks) => prevRacks.filter((r) => r.id !== rackId))
      toast.success("Rack deleted successfully")
    } catch (err) {
      toast.error("Failed to delete rack")
      throw err
    }
  }, [])

  // Update rack
  const updateRackData = useCallback(async (rackId, rackData) => {
    try {
      const response = await updateRack({ id: rackId, ...rackData })
      setRacks((prevRacks) => prevRacks.map((r) => (r.id === rackId ? response.data : r)))
      toast.success("Rack updated successfully")
      return response.data
    } catch (err) {
      toast.error("Failed to update rack")
      throw err
    }
  }, [])

  // Create bin
  const createBinData = useCallback(async (rackId, binData) => {
    try {
      const response = await createBin(rackId, binData)
      // Update racks to include the new bin
      setRacks((prevRacks) =>
        prevRacks.map((r) => (r.id === rackId ? { ...r, bins: [...(r.bins || []), response.data] } : r)),
      )
      toast.success("Bin created successfully")
      return response.data
    } catch (err) {
      toast.error("Failed to create bin")
      throw err
    }
  }, [])

  // Update bin
  const updateBinData = useCallback(async (binId, binData) => {
    try {
      const response = await updateBin({ id: binId, ...binData });
      
      setRacks((prevRacks) =>
        prevRacks.map((rack) => ({
          ...rack,
          bins: (rack.bins || []).map((bin) =>
            bin.id === binId ? response.data : bin,
          ),
        })),
      );

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

      setRacks((prevRacks) =>
        prevRacks.map((rack) =>
          rack.id === rackId
            ? {
                ...rack,
                bins: (rack.bins || []).filter((bin) => bin.id !== binId),
              }
            : rack,
        ),
      );

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
    createZoneData,
    updateZoneData,
    deleteZoneData,
    createRackData,
    updateRackData,
    deleteRackData,
    createBinData,
    updateBinData,
    deleteBinData,
    fetchZones,
    refetchZone,
  }
}
