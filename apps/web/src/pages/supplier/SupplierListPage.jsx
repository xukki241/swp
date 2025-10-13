import { useState } from "react";
import { useNavigate } from "react-router";
import { useSuppliers, useDeleteSupplier } from "@/hooks/useSuppliers";
import { AppLayout } from "@/components/layouts/app-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function SupplierListPage() {
  const navigate = useNavigate();
  const { data: suppliers = [], isLoading } = useSuppliers();
  const { mutate: deleteSupplier } = useDeleteSupplier();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleDelete = (id) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteSupplier(selectedId, {
      onSuccess: () => {
        toast.success("Supplier deleted successfully!", {
          description: "The supplier has been removed.",
        });
      },
      onError: (error) => {
        toast.error("Failed to delete supplier!", {
          description:
            error?.response?.data?.error ||
            error?.message ||
            "Please try again.",
        });
      },
    });
    setConfirmOpen(false);
    setSelectedId(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Supplier List</CardTitle>
            <Button
              onClick={() => navigate("/suppliers/create")}
              className="flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Add New
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading data...</p>
            ) : suppliers.length === 0 ? (
              <p className="text-gray-500 text-sm">No suppliers found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.id}</TableCell>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{s.address}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/suppliers/${s.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(s.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this supplier? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
