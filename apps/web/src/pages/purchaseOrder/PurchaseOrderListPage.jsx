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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeletePurchaseOrder,
  usePurchaseOrders,
  useUpdatePurchaseOrderStatus,
} from "@/hooks/usePurchaseOrders";
import {
  ArrowUpDown,
  Calendar,
  Edit,
  Eye,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function PurchaseOrderListPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // desc = newest first, asc = oldest first
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editStatusOpen, setEditStatusOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const { data: purchaseOrders = [], isLoading } = usePurchaseOrders();
  const { mutate: deletePurchaseOrder } = useDeletePurchaseOrder();
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdatePurchaseOrderStatus();

  const filteredOrders = useMemo(() => {
    let orders = [...purchaseOrders];

    // Filter by status
    if (statusFilter !== "all") {
      orders = orders.filter((o) => o.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      orders = orders.filter(
        (o) =>
          (o.supplierName || "").toLowerCase().includes(q) ||
          (o.status || "").toLowerCase().includes(q)
      );
    }

    // Sort by order date
    orders.sort((a, b) => {
      const dateA = new Date(a.orderDate);
      const dateB = new Date(b.orderDate);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return orders;
  }, [purchaseOrders, searchQuery, statusFilter, sortOrder]);

  const handleDelete = (id) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const handleEditStatus = (order) => {
    setSelectedId(order.id);
    setSelectedStatus(order.status);
    setEditStatusOpen(true);
  };

  const confirmDelete = () => {
    deletePurchaseOrder(selectedId, {
      onSuccess: () => {
        toast.success("Purchase order deleted successfully!");
      },
      onError: (error) => {
        toast.error("Failed to delete order!", {
          description: error?.response?.data?.error || error.message,
        });
      },
    });
    setConfirmOpen(false);
  };

  const confirmUpdateStatus = () => {
    updateStatus(
      { id: selectedId, status: selectedStatus },
      {
        onSuccess: () => {
          toast.success("Status updated successfully!");
          setEditStatusOpen(false);
        },
        onError: (error) => {
          toast.error("Failed to update status!", {
            description: error?.response?.data?.error || error.message,
          });
        },
      }
    );
  };

  const getStatusBadge = (status) => {
    const colorMap = {
      pending: "bg-yellow-100 text-yellow-700",
      received: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return (
      <Badge
        variant="secondary"
        className={colorMap[status] || "bg-gray-100 text-gray-700"}
      >
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <Card className="shadow-md border-0">
          <CardContent className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Purchase Orders
            </h1>
            <p className="text-muted-foreground">
              Manage all supplier purchase orders
            </p>
          </div>
          <Button
            onClick={() => navigate("/purchase-orders/create")}
            className="flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> New Order
          </Button>
        </div>

        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Purchase Orders List</CardTitle>
            <CardDescription>
              Search, view, or manage all purchase orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchQuery(searchInput);
              }}
              className="mb-6 space-y-4"
            >
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by supplier or status..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <Button type="submit" className="h-11">
                  <Search className="h-4 w-4 mr-2" /> Search
                </Button>
                {searchQuery && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="ordered">Ordered</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort by Date */}
              <div className="flex items-center gap-2">
                <Label htmlFor="sortOrder" className="text-sm font-medium">
                  Sort by Order Date:
                </Label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger id="sortOrder" className="w-[200px] h-10">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-10 w-10 text-muted-foreground/50" />
                          <p className="font-medium">
                            No purchase orders found
                          </p>
                          <p className="text-sm">
                            {searchQuery || statusFilter !== "all"
                              ? "Try adjusting your filters"
                              : "Get started by creating your first order"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell>{o.supplierName || o.supplierId}</TableCell>
                        <TableCell>{getStatusBadge(o.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(o.orderDate).toLocaleDateString("vi-VN")}
                          </div>
                        </TableCell>
                        <TableCell>
                          {o.expectedDate ? (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <Calendar className="w-4 h-4" />
                              {new Date(o.expectedDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Not set
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {o.totalAmount?.toLocaleString()} ₫
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(`/purchase-orders/${o.id}`)
                              }
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEditStatus(o)}
                              title="Edit Status"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(o.id)}
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
            Are you sure you want to delete this purchase order? This action
            cannot be undone.
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

      <Dialog open={editStatusOpen} onOpenChange={setEditStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select a new status for this purchase order:
            </p>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditStatusOpen(false)}
              disabled={isUpdatingStatus}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmUpdateStatus}
              disabled={isUpdatingStatus}
              className="min-w-[100px]"
            >
              {isUpdatingStatus ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
