"use client";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  usePurchaseOrderReceipts,
  useDeletePurchaseOrderReceipt,
} from "@/hooks/usePurchaseOrders";
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
import { Label } from "@/components/ui/label";
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
  Search,
  Eye,
  Trash2,
  PlusCircle,
  Calendar,
  Package,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function PurchaseOrderReceiptListPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // desc = newest first, asc = oldest first
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { data: receipts = [], isLoading } = usePurchaseOrderReceipts();
  const { mutate: deleteReceipt } = useDeletePurchaseOrderReceipt();

  const filteredReceipts = useMemo(() => {
    let items = [...receipts];

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (r) =>
          (r.supplierName || "").toLowerCase().includes(q) ||
          (r.receivedByName || "").toLowerCase().includes(q) ||
          (r.poStatus || "").toLowerCase().includes(q)
      );
    }

    // Sort by received date
    items.sort((a, b) => {
      const dateA = new Date(a.receivedDate);
      const dateB = new Date(b.receivedDate);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return items;
  }, [receipts, searchQuery, sortOrder]);

  const handleDelete = (id) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteReceipt(selectedId, {
      onSuccess: () => {
        toast.success("Receipt deleted successfully!");
      },
      onError: (error) => {
        toast.error("Failed to delete receipt!", {
          description: error?.response?.data?.error || error.message,
        });
      },
    });
    setConfirmOpen(false);
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
        {status?.toUpperCase()}
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
              Purchase Order Receipts
            </h1>
            <p className="text-muted-foreground">
              View all received purchase orders
            </p>
          </div>
          <Button
            onClick={() => navigate("/purchase-orders")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Package className="w-4 h-4" /> View Orders
          </Button>
        </div>

        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Receipt List</CardTitle>
            <CardDescription>
              Search and manage all purchase order receipts
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
                    placeholder="Search by supplier, received by, or status..."
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
              </div>

              {/* Sort by Date */}
              <div className="flex items-center gap-2">
                <Label htmlFor="sortOrder" className="text-sm font-medium">
                  Sort by Received Date:
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
                    <TableHead>Received Date</TableHead>
                    <TableHead>Received By</TableHead>
                    <TableHead>Order Status</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceipts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-10 w-10 text-muted-foreground/50" />
                          <p className="font-medium">No receipts found</p>
                          <p className="text-sm">
                            {searchQuery
                              ? "Try adjusting your search"
                              : "No receipts have been recorded yet"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReceipts.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">
                          {r.supplierName || "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(r.receivedDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{r.receivedByName || "N/A"}</TableCell>
                        <TableCell>{getStatusBadge(r.poStatus)}</TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          {r.totalAmount
                            ? new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(r.totalAmount)
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(`/procurement/receipts/${r.id}`)
                              }
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(r.id)}
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
            Are you sure you want to delete this receipt? This action cannot be
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
