"use client";

import { customerService } from "@/services/customerService";
import { AppLayout } from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getInventorySummary,
  getMedicationVariants,
  getPurchasesByMedication,
  getSalesByMedication,
  getSuppliersByMedication,
} from "@/services/medicationsService";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import MedicationImage from "@/components/MedicationImage";


function PillPlaceholder({ className = "h-20 w-20" }) {
  return (
    <div
      className={`rounded-xl border bg-muted/30 flex items-center justify-center ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-10 w-10 opacity-60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M4 14a5 5 0 0 0 7.07 7.07l6.86-6.86a5 5 0 0 0-7.07-7.07L4 14Z" />
        <path d="M8.5 8.5l7 7" />
      </svg>
    </div>
  );
}

export default function MedicationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedMedication = location.state?.medication;
  const [medication, setMedication] = useState(passedMedication || null);
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [variantsRaw, setVariantsRaw] = useState([]); 
  const [statusFilter, setStatusFilter] = useState("all"); 
  const [appliedSearch, setAppliedSearch] = useState(""); 

  useEffect(() => {
    if (!medication && id) {
      setMedication({
        id,
        name: "Medication",
        status: "-",
        brand: "-",
        description: "-",
      });
    }
  }, [id, medication]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [s, p, sa, i, v, customersRes] = await Promise.all([
          getSuppliersByMedication(id),
          getPurchasesByMedication(id),
          getSalesByMedication(id),
          getInventorySummary(),
          getMedicationVariants(id),
          customerService.getCustomers(),
        ]);

        setSuppliers(s.data || []);
        setPurchases(p.data || []);

        const customerMap = {};
        const customersData = customersRes.data || [];
        customersData.forEach(c => {
          customerMap[c.id] = c.name;
        });

        const salesWithNames = (sa.data || []).map(sale => ({
          ...sale,
          customerName: customerMap[sale.customerId] || sale.customerName || "Unknown"
        }));
        setSales(salesWithNames);
setInventory(i.data || []);
        setVariantsRaw(Array.isArray(v) ? v : v?.data || []); 
      } catch { }
    })();
  }, [id]);

  // Computed variants với filter
  const variants = useMemo(() => {
    let v = variantsRaw;
    if (statusFilter !== "all") {
      const wantActive = statusFilter === "active";
      v = v.filter((x) => !!x.isActive === wantActive);
    }
    if (appliedSearch.trim()) {
      const q = appliedSearch.trim().toLowerCase();
      v = v.filter(
        (x) =>
          String(x.sku || "").toLowerCase().includes(q) ||
          String(x.name || "").toLowerCase().includes(q) ||
          String(x.barcode || "").toLowerCase().includes(q)
      );
    }
    return v;
  }, [variantsRaw, appliedSearch, statusFilter]);



  return (
    <AppLayout>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={() => navigate("/medications")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Medications
        </Button>
        <Button
          onClick={() =>
            navigate(`/medications/${id}/variants`, {
              state: { medication: medication || passedMedication },
            })
          }
        >
          Manage Variants
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Medication • {medication?.name || "-"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <MedicationImage fileId={medication?.imageId} alt={medication?.name} size={80} />
              <div style={{ display: "none" }}>
                <PillPlaceholder />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm flex-1">
              <div>
                <b>Brand:</b> {medication?.brand || "-"}
              </div>
              <div>
                <b>Status:</b> {medication?.status || "-"}
              </div>
              <div>
                <b>Prescription:</b>{" "}
                {medication?.isPrescriptionRequired ? "Yes" : "No"}
              </div>
              <div>
                <b>Controlled:</b>{" "}
                {medication?.isControlledSubstance ? "Yes" : "No"}
              </div>
              <div className="col-span-2 md:col-span-4">
                <b>Description:</b> {medication?.description || "-"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
<TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.contactName}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.phone}</TableCell>
                  </TableRow>
                ))}
                {suppliers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No suppliers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      {s.customerName ||
                        (s.customerId ? String(s.customerId).slice(0, 8) : "-")}
                    </TableCell>
                    <TableCell>
                      {new Date(s.orderDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{s.status}</TableCell>
                    <TableCell>{s.paymentMethod}</TableCell>
                    <TableCell>{s.totalAmount}</TableCell>
                  </TableRow>
                ))}
                {sales.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No sales found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Expected Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
</TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {p.supplierName ||
                        (p.supplierId ? String(p.supplierId).slice(0, 8) : "-")}
                    </TableCell>
                    <TableCell>
                      {new Date(p.orderDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(p.expectedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell>{p.totalAmount}</TableCell>
                  </TableRow>
                ))}
                {purchases.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No purchases found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Inventory Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Inventory Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variant</TableHead>
                  <TableHead>Total Qty</TableHead>
                  <TableHead>Reserved</TableHead>
                  <TableHead>Available</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory
                  .filter((inv) => {
                    const variant = variants.find(v => String(v.id) === String(inv.medicationVariantId));
                    return variant && String(variant.medicationId) === String(id);
                  })
                  .map((inv) => {
                    const variant = variants.find(v => String(v.id) === String(inv.medicationVariantId));
                    return (
                      <TableRow key={inv.medicationVariantId}>
                        <TableCell>{variant?.name || String(inv.medicationVariantId).slice(0, 8)}</TableCell>
                        <TableCell>{inv.totalQuantity}</TableCell>
                        <TableCell>{inv.totalReserved}</TableCell>
                        <TableCell>{inv.availableQuantity}</TableCell>
                      </TableRow>
                    );
                  })}
                {inventory.filter((inv) => {
                  const variant = variants.find(v => String(v.id) === String(inv.medicationVariantId));
                  return variant && String(variant.medicationId) === String(id);
                }).length === 0 && (
                    <TableRow>
<TableCell colSpan={4} className="text-center text-muted-foreground">
                        No inventory
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}
