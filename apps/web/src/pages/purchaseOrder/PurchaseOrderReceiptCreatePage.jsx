"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  usePurchaseOrder,
  useCreatePurchaseOrderReceipt,
} from "@/hooks/usePurchaseOrders";
import { useCurrentUser } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layouts/app-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Package,
  Save,
  AlertCircle,
  Building2,
  Calendar,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PurchaseOrderReceiptCreatePage() {
  const { purchaseOrderId } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = usePurchaseOrder(purchaseOrderId);
  const { mutate: createReceipt, isPending } = useCreatePurchaseOrderReceipt();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();

  // Debug logging
  console.log("Current user data:", {
    currentUser,
    isLoadingUser,
    hasUser: !!currentUser?.user,
    userId: currentUser?.user?.userId,
    userStructure: currentUser,
  });

  const [receivedDate, setReceivedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (order?.items) {
      // Initialize items with ordered quantities
      setItems(
        order.items.map((item) => ({
          purchaseOrderItemId: item.id,
          quantity: item.quantity,
          orderedQuantity: item.quantity,
          medicationName: item.medicationName,
          variantName: item.variantName,
          unitPrice: item.unitPrice,
        }))
      );
    }
  }, [order]);

  const handleQuantityChange = (index, value) => {
    const newItems = [...items];
    const quantity = parseInt(value) || 0;
    newItems[index].quantity = quantity;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    toast.info("Item removed from receipt");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (items.length === 0) {
      toast.error("At least one item must be in the receipt");
      return;
    }

    if (items.some((item) => item.quantity < 0)) {
      toast.error("Quantity cannot be negative");
      return;
    }

    if (items.every((item) => item.quantity === 0)) {
      toast.error("At least one item must have quantity greater than 0");
      return;
    }

    if (!currentUser?.user?.userId) {
      console.error("User authentication check failed:", {
        currentUser,
        isLoadingUser,
        hasToken: !!localStorage.getItem("token"),
      });
      toast.error("User not authenticated. Please login again.");
      return;
    }

    const payload = {
      receivedDate,
      receivedBy: currentUser.user.userId,
      items: items
        .filter((item) => item.quantity > 0)
        .map((item) => ({
          purchaseOrderItemId: item.purchaseOrderItemId,
          quantity: Number(item.quantity),
        })),
    };

    console.log("Creating receipt with payload:", {
      payload,
      receivedDateType: typeof receivedDate,
      receivedDateValue: receivedDate,
      receivedByType: typeof currentUser?.user?.userId,
      receivedByValue: currentUser?.user?.userId,
      itemsCount: payload.items.length,
    });

    createReceipt(
      { purchaseOrderId, payload },
      {
        onSuccess: () => {
          toast.success("Receipt created successfully!");
          navigate("/procurement/receipts");
        },
        onError: (error) => {
          console.error("Failed to create receipt:", {
            error,
            response: error?.response,
            data: error?.response?.data,
          });
          toast.error("Failed to create receipt!", {
            description: error?.response?.data?.error || error.message,
          });
        },
      }
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
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

  if (!order) {
    return (
      <AppLayout>
        <Card className="shadow-md border-0">
          <CardContent className="flex flex-col justify-center items-center py-12">
            <p className="text-red-500 mb-4">Purchase order not found</p>
            <Button onClick={() => navigate("/purchase-orders")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/purchase-orders/${purchaseOrderId}`)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create Receipt
              </h1>
              <p className="text-muted-foreground">
                Record received items for purchase order
              </p>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Purchase Order Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  <p className="font-semibold">{order.supplierName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-semibold">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-semibold">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle>Receipt Details</CardTitle>
              <CardDescription>
                Enter received date and adjust quantities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Received Date */}
              <div className="max-w-sm">
                <Label htmlFor="receivedDate">Received Date *</Label>
                <Input
                  id="receivedDate"
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              {/* Items Table */}
              <div>
                <Label className="mb-3 block">Received Items</Label>
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Adjust the received quantity for each item. Default is the
                    full ordered quantity.
                  </AlertDescription>
                </Alert>

                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Medication</TableHead>
                        <TableHead>Variant</TableHead>
                        <TableHead className="text-right">
                          Ordered Qty
                        </TableHead>
                        <TableHead className="text-right">
                          Received Qty *
                        </TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[80px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={item.purchaseOrderItemId}>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {item.medicationName}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.variantName}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.orderedQuantity.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min="0"
                              max={item.orderedQuantity}
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(index, e.target.value)
                              }
                              className="w-24 ml-auto"
                              required
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(index)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={7} className="text-right font-bold">
                          Total Received Value:
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {formatCurrency(calculateTotal())}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="shadow-md border-0 mt-6">
            <CardContent className="py-6">
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    navigate(`/purchase-orders/${purchaseOrderId}`)
                  }
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="min-w-[120px]"
                >
                  {isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Receipt
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}
