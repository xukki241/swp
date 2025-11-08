// apps/web/src/pages/medications/MedicationViewModal.jsx
"use client";

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
import { getMedicationImageLocal, getMedicationImageUrl } from "@/lib/fileUrls";
import {
  getInventorySummary,
  getMedicationVariants,
  getPurchasesByMedication,
  getSalesByMedication,
  getSuppliersByMedication,
} from "@/services/medicationsService";
import { useEffect, useMemo, useState } from "react";

/* Helpers */
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
function MedImage({ medicationId, alt = "", version = 0, onClick }) {
  const [errored, setErrored] = useState(false);
  const src = useMemo(() => {
    if (medication?.imageId)
      return `http://localhost:3000/api/files/${medication.imageId}/view`;
    const local = getMedicationImageLocal(medicationId);
    return local || getMedicationImageUrl(medicationId);
  }, [medicationId, medication?.imageId, version]);
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

/**
 * mode: "modal" | "page" (default: "modal")
 * open/onClose chỉ dùng khi mode="modal"
 */
export default function MedicationViewModal({
  mode = "modal",
  open,
  onClose,
  medication,
  withVariants = true,
  imageVersion = 0,
}) {
  const isModal = mode === "modal";

  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [variants, setVariants] = useState([]);

  // Lightbox ảnh
  const [lightbox, setLightbox] = useState({ open: false, src: "", alt: "" });
  const openLightbox = (src, alt) => setLightbox({ open: true, src, alt });
  const closeLightbox = () => setLightbox({ open: false, src: "", alt: "" });

  // map variantId -> variantName (để hiển thị tên thay vì ID)
  const variantNameById = useMemo(() => {
    const m = new Map();
    variants.forEach((v) => m.set(String(v.id), v.name));
    return m;
  }, [variants]);

  useEffect(() => {
    if ((isModal && (!open || !medication)) || (!isModal && !medication))
      return;

    (async () => {
      try {
        const [s, p, so, inv] = await Promise.all([
          getSuppliersByMedication(medication.id),
          getPurchasesByMedication(medication.id),
          getSalesByMedication(medication.id),
          getInventorySummary(),
        ]);
        setSuppliers(s?.data || []);
        setPurchases(p?.data || []);

        // Sales: hiển thị customerName hoặc short-id
        const salesRaw = so?.data || [];
        setSales(
          salesRaw.map((row) => ({
            ...row,
            customerName:
              row.customerName ||
              (row.customerId ? String(row.customerId).slice(0, 8) : "-"),
          }))
        );

        setInventory(inv?.data || []);

        if (withVariants) {
          const v = await getMedicationVariants(medication.id);
          setVariants(Array.isArray(v) ? v : v?.data || []);
        }
      } catch {}
    })();
  }, [isModal, open, medication, withVariants]);

  if (!medication) return null;

  const body = (
    <div
      className={
        isModal ? "space-y-6 max-h-[75vh] overflow-y-auto" : "space-y-6"
      }
    >
      {/* Header + image */}
      <div className="flex items-start gap-4">
        <MedImage
          medicationId={medication.id}
          alt={medication.name}
          version={imageVersion}
          onClick={openLightbox}
        />
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
            <b>Controlled:</b> {medication.isControlledSubstance ? "Yes" : "No"}
          </div>
          <div className="col-span-2 md:col-span-4">
            <b>Description:</b> {medication.description || "-"}
          </div>
        </div>
      </div>

      {/* Variants */}
      {withVariants && (
        <div>
          <h3 className="font-semibold mb-2">Variants</h3>
          <div className="rounded-md border overflow-auto">
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
                    <TableCell>{v.sellPrice}</TableCell>
                    <TableCell>{v.isActive ? "Active" : "Inactive"}</TableCell>
                    <TableCell>{v.isForSale ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))}
                {variants.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground"
                    >
                      No variants
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Suppliers */}
      <div>
        <h3 className="font-semibold mb-2">Suppliers</h3>
        <div className="rounded-md border overflow-auto">
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
                    No suppliers
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Purchases */}
      <div>
        <h3 className="font-semibold mb-2">Purchase Orders</h3>
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.supplierName || "-"}</TableCell>
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
                    No purchases
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Sales (customerName / short id) */}
      <div>
        <h3 className="font-semibold mb-2">Sales Orders</h3>
        <div className="rounded-md border overflow-auto">
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
                  <TableCell>{s.customerName}</TableCell>
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
                    No sales
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Inventory — hiển thị Variant Name thay vì ID */}
      <div>
        <h3 className="font-semibold mb-2">Inventory Summary</h3>
        <div className="rounded-md border overflow-auto">
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
                .filter(
                  (inv) => String(inv.medicationId) === String(medication.id)
                )
                .map((inv) => (
                  <TableRow
                    key={`${inv.medicationVariantId}-${inv.medicationId}`}
                  >
                    <TableCell>
                      {variantNameById.get(String(inv.medicationVariantId)) ||
                        "Unnamed Variant"}
                    </TableCell>
                    <TableCell>{inv.totalQuantity}</TableCell>
                    <TableCell>{inv.totalReserved}</TableCell>
                    <TableCell>{inv.availableQuantity}</TableCell>
                  </TableRow>
                ))}
              {inventory.filter(
                (inv) => String(inv.medicationId) === String(medication.id)
              ).length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    No inventory
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );

  if (!isModal) return body;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl" aria-describedby="med-view-desc">
        <DialogHeader>
          <DialogTitle>Medication • {medication.name}</DialogTitle>
          <DialogDescription id="med-view-desc" className="sr-only">
            Medication details view
          </DialogDescription>
        </DialogHeader>

        {body}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>

      {/* Image Lightbox Popup */}
      {lightbox.open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            {/* Close button at top right */}
            <button
              onClick={closeLightbox}
              className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
              aria-label="Close image"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Image */}
            <img
              src={lightbox.src}
              alt={lightbox.alt || "Medication image"}
              className="max-h-[85vh] w-auto rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </Dialog>
  );
}
