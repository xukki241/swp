"use client";

import { useState, useMemo } from "react"; // <-- THAY ĐỔI: Thêm useMemo
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
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Ban,
  Search,
} from "lucide-react";
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

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { data: allSuppliers = [], isLoading } = useSuppliers();
  const { mutate: deleteSupplier } = useDeleteSupplier();

  const filteredSuppliers = useMemo(() => {
    let suppliers = [...allSuppliers];

    if (statusFilter !== "all") {
      suppliers = suppliers.filter((s) => s.status === statusFilter);
    }

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      suppliers = suppliers.filter((s) => {
        const nameMatch = (s.name || "")
          .toLowerCase()
          .includes(lowercasedQuery);
        const emailMatch = (s.email || "")
          .toLowerCase()
          .includes(lowercasedQuery);
        const phoneMatch = (s.phone || "")
          .toLowerCase()
          .includes(lowercasedQuery);
        return nameMatch || emailMatch || phoneMatch;
      });
    }

    return suppliers;
  }, [allSuppliers, searchQuery, statusFilter]);

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

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Supplier Management
            </h1>
            <p className="text-muted-foreground mt-1">Loading suppliers...</p>
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
              Supplier Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage supplier accounts and relationships
            </p>
          </div>
        </div>

        <Card className="shadow-md rounded-xl border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Supplier List</CardTitle>
              <CardDescription>
                View, search, and manage all supplier information
              </CardDescription>
            </div>
            <Button
              onClick={() => navigate("/suppliers/create")}
              className="flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Add New Supplier
            </Button>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchQuery(searchInput);
              }}
              className="mb-6 flex flex-col gap-4 md:flex-row"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 h-11 rounded-lg"
                />
              </div>
              <Button
                type="submit"
                className="h-11 bg-primary/90 hover:bg-primary"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              {searchQuery && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 bg-transparent"
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                  }}
                >
                  Clear
                </Button>
              )}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] h-11">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="blacklisted">Blacklisted</SelectItem>
                </SelectContent>
              </Select>
            </form>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-10 w-10 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">
                            No suppliers found
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {searchQuery || statusFilter !== "all"
                              ? "Try adjusting your filters"
                              : "Get started by adding your first supplier"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSuppliers.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{s.email || "N/A"}</TableCell>
                        <TableCell>{s.phone || "N/A"}</TableCell>
                        <TableCell>{getStatusBadge(s.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(`/suppliers/${s.id}/edit/`)
                              }
                              title="Edit Details"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(s.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
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
