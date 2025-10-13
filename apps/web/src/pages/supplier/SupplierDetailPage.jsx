import { useParams, useNavigate } from "react-router";
import { AppLayout } from "@/components/layouts/app-layout";
import { useSupplier, useSupplierMedications } from "@/hooks/useSuppliers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";

export default function SupplierDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: supplier, isLoading } = useSupplier(id);
  const { data: medications = [], isLoading: isLoadingMedications } =
    useSupplierMedications(id);

  if (isLoading) return <p>Đang tải thông tin...</p>;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={() => navigate(`/suppliers/${id}/edit`)}
          >
            <Pencil className="w-4 h-4" /> Chỉnh sửa
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin nhà cung cấp</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Tên:</strong> {supplier?.name}
            </p>
            <p>
              <strong>Email:</strong> {supplier?.email}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {supplier?.address}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách thuốc cung cấp</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingMedications ? (
              <p>Đang tải danh sách thuốc...</p>
            ) : medications.length === 0 ? (
              <p className="text-gray-500 text-sm">Chưa có thuốc nào.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên thuốc</TableHead>
                    <TableHead>Biến thể</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Thời gian giao (ngày)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medications.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.medicationName}</TableCell>
                      <TableCell>{m.variantName}</TableCell>
                      <TableCell>{m.supplierSku}</TableCell>
                      <TableCell>{m.leadTimeDays}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
