import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getSuppliersByMedication,
  getPurchasesByMedication,
  getSalesByMedication,
  getInventorySummary,
  getMedicationVariants,
} from "@/services/medicationsService";
import { getMedicationImageUrl } from "@/lib/mockImages";

/* Ảnh thuốc có fallback; re-mount theo src */
function MedImage({ id, alt, className = "h-20 w-20" }) {
  const [src, setSrc] = useState(() => getMedicationImageUrl(id));
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    const url = getMedicationImageUrl(id);
    setSrc(url);
    setErrored(false);
  }, [id]);

  if (errored) {
    return (
      <div className={`rounded-xl border bg-muted/30 flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 24 24" className="h-10 w-10 opacity-60" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 14a5 5 0 0 0 7.07 7.07l6.86-6.86a5 5 0 0 0-7.07-7.07L4 14Z" />
          <path d="M8.5 8.5l7 7" />
        </svg>
      </div>
    );
  }

  return (
    <img
      key={src}
      src={src}
      alt={alt}
      className={`rounded-xl object-cover border ${className}`}
      onError={() => setErrored(true)}
    />
  );
}

export default function MedicationViewModal({ open, onClose, medication, withVariants = false }) {
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [variants, setVariants] = useState([]);

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
        if (withVariants) {
          const v = await getMedicationVariants(medication.id);
          setVariants(Array.isArray(v) ? v : v?.data || []);
        }
      } catch {
        // ignore
      }
    })();
  }, [open, medication, withVariants]);

  if (!medication) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Medication • {medication.name}</DialogTitle>
          <DialogDescription className="sr-only">
            View full information of a medication.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Header info + image */}
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <MedImage id={medication.id} alt={medication.name} className="h-20 w-20" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm flex-1">
              <div><b>Brand:</b> {medication.brand || "-"}</div>
              <div><b>Status:</b> {medication.status || "-"}</div>
              <div><b>Prescription:</b> {medication.isPrescriptionRequired ? "Yes" : "No"}</div>
              <div><b>Controlled:</b> {medication.isControlledSubstance ? "Yes" : "No"}</div>
              <div className="col-span-2 md:col-span-4"><b>Description:</b> {medication.description || "-"}</div>
            </div>
          </div>

          {withVariants && (
            <div>
              <h3 className="font-semibold mb-2">Variants</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Factor</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>For Sale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>{v.sku}</TableCell>
                      <TableCell>{v.name}</TableCell>
                      <TableCell>{v.unit}</TableCell>
                      <TableCell>{v.unitFactor}</TableCell>
                      <TableCell>{v.barcode || "-"}</TableCell>
                      <TableCell>{typeof v.sellPrice === "number" ? v.sellPrice.toLocaleString() : v.sellPrice}</TableCell>
                      <TableCell>{v.isActive ? "Active" : "Inactive"}</TableCell>
                      <TableCell>{v.isForSale ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))}
                  {variants.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">No variants found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Suppliers */}
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
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No suppliers found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Purchases */}
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
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No purchases found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Sales */}
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
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No sales found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Inventory summary */}
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
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No inventory found</TableCell>
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
