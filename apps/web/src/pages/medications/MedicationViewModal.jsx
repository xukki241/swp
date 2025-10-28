// apps/web/src/pages/medications/MedicationViewModal.jsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getMedicationImageLocal,
  getMedicationImageUrl,
} from "@/lib/mockImages";
import {
  getInventorySummary,
  getMedicationVariants,
  getPurchasesByMedication,
  getSalesByMedication,
  getSuppliersByMedication,
} from "@/services/medicationsService";
import { useEffect, useMemo, useState } from "react";

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

function MedImageInModal({ medicationId, alt = "", version = 0, onClick }) {
  const [errored, setErrored] = useState(false);

  const src = useMemo(() => {
    if (!medicationId) return null;
    const local = getMedicationImageLocal(medicationId);
    if (local) return local;
    const base = getMedicationImageUrl(medicationId);
    return base.includes("?v=") ? base : `${base}?v=${version}`;
  }, [medicationId, version]);

  useEffect(() => setErrored(false), [src]);

  if (!src || errored) return <PillPlaceholder />;
  return (
    <img
      src={src}
      alt={alt}
      className="h-20 w-20 rounded-xl object-cover border cursor-zoom-in"
      onError={() => setErrored(true)}
      onClick={() => onClick?.(src, alt)}
    />
  );
}

export default function MedicationViewModal({
  open,
  onClose,
  medication,
  withVariants = false,
  imageVersion = 0,
}) {
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [variants, setVariants] = useState([]);

  // Lightbox
  const [lightbox, setLightbox] = useState({ open: false, src: "", alt: "" });
  const openLightbox = (src, alt) => setLightbox({ open: true, src, alt });
  const closeLightbox = () => setLightbox({ open: false, src: "", alt: "" });

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
      } catch {}
    })();
  }, [open, medication, withVariants]);

  if (!medication) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl" aria-describedby="med-view-desc">
        <DialogHeader>
          <DialogTitle>Medication • {medication.name}</DialogTitle>
          <DialogDescription id="med-view-desc" className="sr-only">
            Medication details view
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Header info + image */}
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <MedImageInModal
                medicationId={medication.id}
                alt={medication.name}
                version={imageVersion}
                onClick={openLightbox}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm flex-1">
              <div>
                <b>Brand:</b> {medication.brand || "-"}
              </div>
              <div>
                <b>Status:</b> {medication.status || "-"}
              </div>
              <div>
                <b>Prescription:</b>{" "}
                {medication.isPrescriptionRequired ? "Yes" : "No"}
              </div>
              <div>
                <b>Controlled:</b>{" "}
                {medication.isControlledSubstance ? "Yes" : "No"}
              </div>
              <div className="col-span-2 md:col-span-4">
                <b>Description:</b> {medication.description || "-"}
              </div>
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
                      <TableCell>
                        {typeof v.sellPrice === "number"
                          ? v.sellPrice.toLocaleString()
                          : v.sellPrice}
                      </TableCell>
                      <TableCell>
                        {v.isActive ? "Active" : "Inactive"}
                      </TableCell>
                      <TableCell>{v.isForSale ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))}
                  {variants.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground"
                      >
                        No variants found
                      </TableCell>
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
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
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

      {/* 🔎 Lightbox chỉ có ảnh – đã thêm Title & Description ẩn để hết cảnh báo */}
      <Dialog open={lightbox.open} onOpenChange={(o) => !o && closeLightbox()}>
        <DialogContent className="max-w-3xl" aria-describedby="lightbox-desc">
          <DialogHeader>
            <DialogTitle className="sr-only">
              Medication image preview
            </DialogTitle>
            <DialogDescription id="lightbox-desc" className="sr-only">
              Enlarged medication image preview
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center">
            <img
              src={lightbox.src}
              alt={lightbox.alt || "Medication image"}
              className="max-h-[80vh] w-auto rounded-md object-contain"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
