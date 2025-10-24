"use client";

import { AppLayout } from "@/components/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSupplier, useSupplierMedications } from "@/hooks/useSuppliers";
import { ArrowLeft, Ban, CheckCircle, Pencil, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router";

export default function SupplierDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: supplier, isLoading } = useSupplier(id);
  const { data: medications = [], isLoading: isLoadingMedications } =
    useSupplierMedications(id);

  function getStatusBadge(status) {
    const variants = {
      active: {
        className: "bg-green-100 text-green-700 hover:bg-green-100",
        icon: CheckCircle,
      },
      inactive: {
        className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
        icon: XCircle,
      },
      blacklisted: {
        className: "bg-red-100 text-red-700 hover:bg-red-100",
        icon: Ban,
      },
    };

    const config = variants[status] || variants.inactive;
    const Icon = config.icon;

    return (
      <Badge variant="secondary" className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  }

  function formatVND(value) {
    if (value === null || value === undefined || value === "") return "N/A";
    const num = Number(value);
    if (Number.isNaN(num)) return "N/A";
    return new Intl.NumberFormat("vi-VN").format(Math.round(num)) + "₫";
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Supplier Details
            </h1>
            <p className="text-muted-foreground mt-1">
              Loading supplier information...
            </p>
          </div>
          <Card className="shadow-md rounded-xl border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Supplier Details
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage supplier information
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Button
              className="flex items-center gap-2"
              onClick={() => navigate(`/suppliers/${id}/edit`)}
            >
              <Pencil className="w-4 h-4" /> Edit
            </Button>
          </div>
        </div>

        <Card className="shadow-md rounded-xl border-0">
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
            <CardDescription>
              Basic details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Name
                </p>
                <p className="text-base font-semibold mt-1">
                  {supplier?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Contact Name
                </p>
                <p className="text-base font-semibold mt-1">
                  {supplier?.contactName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-base font-semibold mt-1">
                  {supplier?.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Phone
                </p>
                <p className="text-base font-semibold mt-1">
                  {supplier?.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Address
                </p>
                <p className="text-base font-semibold mt-1">
                  {supplier?.address || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <div className="mt-1">{getStatusBadge(supplier?.status)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-xl border-0">
          <CardHeader>
            <CardTitle>Supplied Medications</CardTitle>
            <CardDescription>
              List of medications provided by this supplier
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMedications ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : medications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground font-medium">
                  No medications found
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  This supplier has no medications assigned yet
                </p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication Name</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead>Supplier SKU</TableHead>
                      <TableHead>Lead Time (days)</TableHead>
                      <TableHead>Purchase Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medications.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">
                          {m.medicationName || "N/A"}
                        </TableCell>
                        <TableCell>{m.variantName || "N/A"}</TableCell>
                        <TableCell>{m.supplierSku || "N/A"}</TableCell>
                        <TableCell>{m.leadTimeDays || "N/A"}</TableCell>
                        <TableCell className="font-semibold text-primary">
                          {formatVND(m.purchasePrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
