// src/pages/medications/MedicationDetailPage.jsx
import { useMemo } from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMedicationDetail } from "@/hooks/useMedications";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function useIdFromUrl() {
  return useMemo(() => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1];
  }, []);
}

export default function MedicationDetailPage() {
  const id = useIdFromUrl();
  const { data, isLoading } = useMedicationDetail(id);

  if (isLoading)
    return (
      <AppLayout>
        <div className="p-6">Loading...</div>
      </AppLayout>
    );
  if (!data)
    return (
      <AppLayout>
        <div className="p-6 text-gray-500">Medication not found.</div>
      </AppLayout>
    );

  return (
    <AppLayout title={data.name}>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Button onClick={() => history.back()} variant="outline">
          ← Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{data.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <p>
              <strong>Brand:</strong> {data.brand}
            </p>
            <p>
              <strong>Description:</strong> {data.description}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className="capitalize">{data.status}</span>
            </p>
            <p>
              <strong>Prescription required:</strong>{" "}
              {data.isPrescriptionRequired ? "Yes" : "No"}
            </p>
            <p>
              <strong>Controlled substance:</strong>{" "}
              {data.isControlledSubstance ? "Yes" : "No"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Variants</CardTitle>
          </CardHeader>
          <CardContent>
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
                {data.variants?.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.sku}</TableCell>
                    <TableCell>{v.name}</TableCell>
                    <TableCell>{v.unit}</TableCell>
                    <TableCell>{v.unitFactor}</TableCell>
                    <TableCell>{v.barcode}</TableCell>
                    <TableCell>{v.sellPrice}</TableCell>
                    <TableCell>{v.isActive ? "Active" : "Inactive"}</TableCell>
                    <TableCell>{v.isForSale ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))}
                {(!data.variants || data.variants.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-sm text-muted-foreground"
                    >
                      No variants
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
