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
import { ArrowLeft } from "lucide-react";

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
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </Button>

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
              <p className="text-gray-500 text-sm">
                Nhà cung cấp này chưa có thuốc nào.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tên thuốc</TableHead>
                    <TableHead>Biến thể</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Thời gian giao (ngày)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medications.map((med) => (
                    <TableRow key={med.id}>
                      <TableCell>{med.id}</TableCell>
                      <TableCell>{med.medicationName}</TableCell>
                      <TableCell>{med.variantName}</TableCell>
                      <TableCell>{med.supplierSku}</TableCell>
                      <TableCell>{med.leadTimeDays}</TableCell>
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
