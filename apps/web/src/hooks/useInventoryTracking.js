/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { getLowStock, getExpiring } from "@/services/inventoryService";

export const useInventoryTracking = () => {
  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [loading, setLoading] = useState({ lowStock: false, expiring: false });
  const [error, setError] = useState({ lowStock: null, expiring: null });

  const fetchLowStock = useCallback(async () => {
    setLoading((prev) => ({ ...prev, lowStock: true }));
    setError((prev) => ({ ...prev, lowStock: null }));
    try {
      const data = await getLowStock();
      setLowStock(data);
      toast.success("Successfully fetched low stock items.");
    } catch (err) {
      setError((prev) => ({ ...prev, lowStock: err }));
      toast.error("Failed to fetch low stock items.");
    } finally {
      setLoading((prev) => ({ ...prev, lowStock: false }));
    }
  }, []);

  const fetchExpiring = useCallback(async () => {
    setLoading((prev) => ({ ...prev, expiring: true }));
    setError((prev) => ({ ...prev, expiring: null }));
    try {
      const data = await getExpiring();
      setExpiring(data);
      toast.success("Successfully fetched expiring items.");
    } catch (err) {
      setError((prev) => ({ ...prev, expiring: err }));
      toast.error("Failed to fetch expiring items.");
    } finally {
      setLoading((prev) => ({ ...prev, expiring: false }));
    }
  }, []);

  useEffect(() => {
    // fetchLowStock();
    // fetchExpiring();
  }, [fetchLowStock, fetchExpiring]);

  return {
    lowStock,
    expiring,
    loading,
    error,
    refetchLowStock: fetchLowStock,
    refetchExpiring: fetchExpiring,
  };
};

export const lowStockItems = [
  {
    id: "med-001",
    name: "Paracetamol 500mg",
    image_url: "/src/assets/medicine-placeholder.jpg",
    brand: "PharmaCo",
    description: "A common pain reliever and fever reducer.",
    isPrescription: false,
    manufactureDate: "2024-01-15T00:00:00.000Z",
    expireDate: "2026-01-14T00:00:00.000Z",
    stock: 8,
    batchNumber: "PC202401A",
    zone: "A",
    rack: "3",
    level: "2",
    bin: "5",
    price: 5.99,
  },
  {
    id: "med-002",
    name: "Amoxicillin 250mg",
    image_url: "/src/assets/medicine-placeholder.jpg",
    brand: "MediHealth",
    description:
      "An antibiotic used to treat a number of bacterial infections.",
    isPrescription: true,
    manufactureDate: "2023-11-20T00:00:00.000Z",
    expireDate: "2025-11-19T00:00:00.000Z",
    stock: 5,
    batchNumber: "MH202311B",
    zone: "B",
    rack: "1",
    level: "4",
    bin: "1",
    price: 12.5,
  },
  {
    id: "med-003",
    name: "Ibuprofen 200mg",
    image_url: "/src/assets/medicine-placeholder.jpg",
    brand: "ReliefNow",
    description: "A nonsteroidal anti-inflammatory drug (NSAID).",
    isPrescription: false,
    manufactureDate: "2024-03-10T00:00:00.000Z",
    expireDate: "2027-03-09T00:00:00.000Z",
    stock: 12,
    batchNumber: "RN202403C",
    zone: "A",
    rack: "2",
    level: "1",
    bin: "3",
    price: 8.75,
  },
  {
    id: "med-004",
    name: "Lisinopril 10mg",
    image_url: "/src/assets/medicine-placeholder.jpg",
    brand: "CardioWell",
    description: "An ACE inhibitor used to treat high blood pressure.",
    isPrescription: true,
    manufactureDate: "2023-09-01T00:00:00.000Z",
    expireDate: "2026-08-31T00:00:00.000Z",
    stock: 15,
    batchNumber: "CW202309D",
    zone: "C",
    rack: "5",
    level: "3",
    bin: "2",
    price: 25.0,
  },
  {
    id: "med-005",
    name: "Metformin 500mg",
    image_url: "/src/assets/medicine-placeholder.jpg",
    brand: "GlucoCare",
    description: "A medication for the treatment of type 2 diabetes.",
    isPrescription: true,
    manufactureDate: "2024-02-25T00:00:00.000Z",
    expireDate: "2027-02-24T00:00:00.000Z",
    stock: 9,
    batchNumber: "GC202402E",
    zone: "B",
    rack: "4",
    level: "2",
    bin: "4",
    price: 18.2,
  },
];

export const expiringItems = [
  {
    id: "med-006",
    name: "Aspirin 81mg",
    image_url: "/src/assets/medicine-placeholder.jpg",
    brand: "HeartGuard",
    description: "Used to reduce the risk of heart attack and stroke.",
    isPrescription: false,
    manufactureDate: "2023-11-01T00:00:00.000Z",
    expireDate: "2025-10-31T00:00:00.000Z",
    stock: 50,
    batchNumber: "HG202311F",
    zone: "A",
    rack: "1",
    level: "1",
    bin: "1",
    price: 7.99,
  },
  {
    id: "med-007",
    name: "Cetirizine 10mg",
    image_url: "/src/assets/medicine-placeholder.jpg",
    brand: "AllergyRelief",
    description: "An antihistamine used to relieve allergy symptoms.",
    isPrescription: false,
    manufactureDate: "2023-12-15T00:00:00.000Z",
    expireDate: "2025-12-14T00:00:00.000Z",
    stock: 120,
    batchNumber: "AR202312G",
    zone: "C",
    rack: "2",
    level: "3",
    bin: "6",
    price: 15.49,
  },
  {
    id: "med-008",
    name: "Atorvastatin 20mg",
    image_url: "/src/assets/medicine-placeholder.jpg",
    brand: "LipiDown",
    description: "A statin medication used to prevent cardiovascular disease.",
    isPrescription: true,
    manufactureDate: "2024-01-05T00:00:00.000Z",
    expireDate: "2026-01-04T00:00:00.000Z",
    stock: 85,
    batchNumber: "LD202401H",
    zone: "B",
    rack: "3",
    level: "1",
    bin: "8",
    price: 35.0,
  },
  {
    id: "med-009",
    name: "Omeprazole 20mg",
    image_url: "/src/assets/medicine-placeholder.jpg",
    brand: "AcidBlock",
    description: "A proton-pump inhibitor used to treat heartburn and GERD.",
    isPrescription: false,
    manufactureDate: "2023-10-30T00:00:00.000Z",
    expireDate: "2025-10-29T00:00:00.000Z",
    stock: 200,
    batchNumber: "AB202310I",
    zone: "A",
    rack: "4",
    level: "4",
    bin: "2",
    price: 22.1,
  },
  {
    id: "med-010",
    name: "Salbutamol Inhaler",
    image_url: "/src/assets/medicine-placeholder.jpg",
    brand: "BreatheEasy",
    description: "A bronchodilator for the relief of asthma symptoms.",
    isPrescription: true,
    manufactureDate: "2024-02-01T00:00:00.000Z",
    expireDate: "2026-01-31T00:00:00.000Z",
    stock: 45,
    batchNumber: "BE202402J",
    zone: "C",
    rack: "1",
    level: "2",
    bin: "7",
    price: 45.99,
  },
];
