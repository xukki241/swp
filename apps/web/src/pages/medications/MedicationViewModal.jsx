import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  getSuppliersByMedication,
  getPurchasesByMedication,
  getSalesByMedication,
  getInventorySummary,
} from "@/services/medicationsService";

export default function MedicationViewModal({ open, onClose, medication }) {
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    if (!open || !medication) return;
    (async () => {
      try {
        const [s, p, sa, i] = await Promise.all([
          getSuppliersByMedication(medication.id),
          getPurchasesByMedication(medication.id),
          getSalesByMedication(medication.id),
          getInventorySummary(),
        ]);
        setSuppliers(s.data || []);
        setPurchases(p.data || []);
        setSales(sa.data || []);
        setInventory(i.data || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [open, medication]);

  if (!medication) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Medication Information • {medication.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><b>Brand:</b> {medication.brand || "-"}</div>
            <div><b>Status:</b> {medication.status || "-"}</div>
            <div><b>Prescription:</b> {medication.isPrescriptionRequired ? "Yes" : "No"}</div>
            <div><b>Controlled:</b> {medication.isControlledSubstance ? "Yes" : "No"}</div>
            <div className="col-span-4"><b>Description:</b> {medication.description || "-"}</div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Suppliers</h3>
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
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No suppliers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Purchase Orders</h3>
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
                    <TableCell>{p.supplierName}</TableCell>
                    <TableCell>{new Date(p.orderDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(p.expectedDate).toLocaleDateString()}</TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell>{p.totalAmount}</TableCell>
                  </TableRow>
                ))}
                {purchases.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No purchases found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Sales Orders</h3>
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
                    <TableCell>{s.customerId}</TableCell>
                    <TableCell>{new Date(s.orderDate).toLocaleDateString()}</TableCell>
                    <TableCell>{s.status}</TableCell>
                    <TableCell>{s.paymentMethod}</TableCell>
                    <TableCell>{s.totalAmount}</TableCell>
                  </TableRow>
                ))}
                {sales.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No sales found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Inventory Summary</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variant ID</TableHead>
                  <TableHead>Total Qty</TableHead>
                  <TableHead>Reserved</TableHead>
                  <TableHead>Available</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((inv) => (
                  <TableRow key={inv.medicationVariantId}>
                    <TableCell>{inv.medicationVariantId}</TableCell>
                    <TableCell>{inv.totalQuantity}</TableCell>
                    <TableCell>{inv.totalReserved}</TableCell>
                    <TableCell>{inv.availableQuantity}</TableCell>
                  </TableRow>
                ))}
                {inventory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No inventory found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
