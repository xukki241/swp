import { AppLayout } from "@/components/layouts/app-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  DialogDescription,
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
import { useCurrentUser } from "@/hooks/useAuth";
import {
  useCreatePurchaseOrderReceipt,
  useFindAvailableBins,
  usePurchaseOrder,
} from "@/hooks/usePurchaseOrders";
import { useWarehouse } from "@/hooks/useWarehouse";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  MapPin,
  Package,
  Save,
  Warehouse,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

export default function PurchaseOrderReceiptCreatePage() {
  const { purchaseOrderId } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = usePurchaseOrder(purchaseOrderId);
  const { mutate: createReceipt, isPending } = useCreatePurchaseOrderReceipt();
  const { mutate: findBins, isPending: isFindingBins } = useFindAvailableBins();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const { zones, loading: loadingZones } = useWarehouse();

  const [receivedDate, setReceivedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [items, setItems] = useState([]);
  const [showZoneDialog, setShowZoneDialog] = useState(false);
  const [selectedZones, setSelectedZones] = useState({});
  const [allocatedBins, setAllocatedBins] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (order?.items) {
      setItems(
        order.items.map((item) => ({
          purchaseOrderItemId: item.id,
          medicationVariantId: item.medicationVariantId,
          quantity: item.quantity,
          orderedQuantity: item.quantity,
          medicationName: item.medicationName,
          variantName: item.variantName,
          unitPrice: item.unitPrice,
          batchNumber: "",
          manufactureDate: "",
          expiryDate: "",
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

  const handleBatchFieldChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    toast.info("Item removed from receipt");
  };

  const handleZoneChange = (itemId, zoneId) => {
    setSelectedZones((prev) => ({
      ...prev,
      [itemId]: zoneId,
    }));
  };

  const handleCreateReceipt = (e) => {
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

    // Validate batch information for all items with quantity > 0
    const activeItems = items.filter((item) => item.quantity > 0);
    const missingBatchInfo = [];

    activeItems.forEach((item, index) => {
      const itemNumber = items.indexOf(item) + 1;
      if (!item.batchNumber || item.batchNumber.trim() === "") {
        missingBatchInfo.push(`Item #${itemNumber}: Batch Number is required`);
      }
      if (!item.manufactureDate) {
        missingBatchInfo.push(
          `Item #${itemNumber}: Manufacture Date is required`
        );
      }
      if (!item.expiryDate) {
        missingBatchInfo.push(`Item #${itemNumber}: Expiry Date is required`);
      }
    });

    if (missingBatchInfo.length > 0) {
      toast.error("Missing batch information", {
        description: (
          <div className="mt-2">
            {missingBatchInfo.map((msg, idx) => (
              <div key={idx} className="text-sm">
                • {msg}
              </div>
            ))}
          </div>
        ),
      });
      return;
    }

    // Validate expiry date is after manufacture date
    const invalidDates = [];
    activeItems.forEach((item, index) => {
      const itemNumber = items.indexOf(item) + 1;
      if (item.manufactureDate && item.expiryDate) {
        const mfgDate = new Date(item.manufactureDate);
        const expDate = new Date(item.expiryDate);
        if (expDate <= mfgDate) {
          invalidDates.push(
            `Item #${itemNumber}: Expiry Date must be after Manufacture Date`
          );
        }
      }
    });

    if (invalidDates.length > 0) {
      toast.error("Invalid dates", {
        description: (
          <div className="mt-2">
            {invalidDates.map((msg, idx) => (
              <div key={idx} className="text-sm">
                • {msg}
              </div>
            ))}
          </div>
        ),
      });
      return;
    }

    // Show zone selection dialog
    setShowZoneDialog(true);
  };

  const handleFindBins = () => {
    // Validate all items have zones selected
    const activeItems = items.filter((item) => item.quantity > 0);
    const missingZones = activeItems.some(
      (item) => !selectedZones[item.purchaseOrderItemId]
    );

    if (missingZones) {
      toast.error("Please select a zone for all items");
      return;
    }

    // Prepare data for finding bins
    const itemsWithZones = activeItems.map((item) => ({
      purchaseOrderItemId: item.purchaseOrderItemId,
      medicationVariantId: item.medicationVariantId,
      quantity: item.quantity,
      zoneId: selectedZones[item.purchaseOrderItemId],
      batchNumber: item.batchNumber,
      manufactureDate: item.manufactureDate,
      expiryDate: item.expiryDate,
      medicationName: item.medicationName,
      variantName: item.variantName,
    }));

    findBins(itemsWithZones, {
      onSuccess: (response) => {
        const results = response.data;
        setAllocatedBins(results);
        setShowZoneDialog(false);
        setShowConfirmDialog(true);
      },
      onError: (error) => {
        toast.error("Failed to find bins", {
          description: error?.response?.data?.error || error.message,
        });
      },
    });
  };

  const handleConfirmCreate = () => {
    if (!currentUser?.user?.userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    // Check if any items have errors
    const hasErrors = allocatedBins.some((item) => item.error);
    if (hasErrors) {
      toast.error("Cannot create receipt. Some items have no available bins.");
      return;
    }

    const payload = {
      receivedDate,
      receivedBy: currentUser.user.userId,
      items: allocatedBins.map((item) => ({
        purchaseOrderItemId: item.purchaseOrderItemId,
        quantity: Number(item.quantity),
        batchNumber: item.batchNumber || undefined,
        manufactureDate: item.manufactureDate || undefined,
        expiryDate: item.expiryDate || undefined,
        binId: item.bin?.binId, // Send the selected bin ID
      })),
    };

    createReceipt(
      { purchaseOrderId, payload },
      {
        onSuccess: (data) => {
          toast.success("Receipt created successfully!");
          setShowConfirmDialog(false);
          if (data?.id) {
            navigate(`/procurement/receipts/${data.id}`);
          } else {
            navigate("/procurement/receipts");
          }
        },
        onError: (error) => {
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
        <form onSubmit={handleCreateReceipt}>
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle>Receipt Details</CardTitle>
              <CardDescription>
                Enter received date and adjust quantities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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

              <div>
                <Label className="mb-3 block">Received Items</Label>
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    All fields marked with (*) are required. Please enter batch
                    information for all items before creating the receipt.
                  </AlertDescription>
                </Alert>

                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Medication</TableHead>
                        <TableHead>Variant</TableHead>
                        <TableHead>Batch Number *</TableHead>
                        <TableHead>Manufacture Date *</TableHead>
                        <TableHead>Expiry Date *</TableHead>
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
                          <TableCell>
                            <Input
                              type="text"
                              value={item.batchNumber}
                              onChange={(e) =>
                                handleBatchFieldChange(
                                  index,
                                  "batchNumber",
                                  e.target.value
                                )
                              }
                              placeholder="Batch # *"
                              className="w-32"
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="date"
                              value={item.manufactureDate}
                              onChange={(e) =>
                                handleBatchFieldChange(
                                  index,
                                  "manufactureDate",
                                  e.target.value
                                )
                              }
                              className="w-40"
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="date"
                              value={item.expiryDate}
                              onChange={(e) =>
                                handleBatchFieldChange(
                                  index,
                                  "expiryDate",
                                  e.target.value
                                )
                              }
                              className="w-40"
                              required
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {item.orderedQuantity}
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
                              className="w-24 text-right"
                              required
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(index)}
                              className="h-8 w-8"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  type="submit"
                  disabled={isPending || items.length === 0}
                  size="lg"
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Create Receipt
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Zone Selection Dialog */}
        <Dialog open={showZoneDialog} onOpenChange={setShowZoneDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Warehouse className="w-5 h-5" />
                Select Warehouse Zones
              </DialogTitle>
              <DialogDescription>
                Choose a zone for each item to allocate to the nearest available
                bin
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {loadingZones ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {items
                    .filter((item) => item.quantity > 0)
                    .map((item, index) => (
                      <div
                        key={item.purchaseOrderItemId}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">
                              {index + 1}. {item.medicationName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.variantName} • Qty: {item.quantity}
                            </p>
                            {item.batchNumber && (
                              <p className="text-xs text-muted-foreground">
                                Batch: {item.batchNumber}
                              </p>
                            )}
                          </div>
                          <div className="w-64">
                            <Label className="text-xs mb-1 block">
                              Select Zone *
                            </Label>
                            <Select
                              value={selectedZones[item.purchaseOrderItemId]}
                              onValueChange={(value) =>
                                handleZoneChange(
                                  item.purchaseOrderItemId,
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose zone..." />
                              </SelectTrigger>
                              <SelectContent>
                                {zones.map((zone) => (
                                  <SelectItem key={zone.id} value={zone.id}>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-3 h-3" />
                                      <span>
                                        {zone.code} - {zone.name}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowZoneDialog(false)}
                disabled={isFindingBins}
              >
                Cancel
              </Button>
              <Button onClick={handleFindBins} disabled={isFindingBins}>
                {isFindingBins ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Finding Bins...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    Find Available Bins
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent
            className="max-w-[90vw] w-[90vw] max-h-[90vh] sm:max-w-[98vw]"
            style={{ maxWidth: "90vw", width: "90vw" }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Confirm Receipt and Allocations
              </DialogTitle>
              <DialogDescription>
                Review the allocated bins and confirm to create the receipt
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 max-h-[calc(90vh-200px)] overflow-y-auto">
              {allocatedBins.some((item) => item.error) && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Some items could not be allocated. Please check the errors
                    below.
                  </AlertDescription>
                </Alert>
              )}

              <div className="rounded-lg border overflow-x-auto">
                <Table className="min-w-[1400px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">#</TableHead>
                      <TableHead className="min-w-[150px]">
                        Medication
                      </TableHead>
                      <TableHead className="min-w-[120px]">Variant</TableHead>
                      <TableHead className="w-[60px]">Qty</TableHead>
                      <TableHead className="w-[100px]">Batch</TableHead>
                      <TableHead className="w-[120px]">Zone</TableHead>
                      <TableHead className="w-[120px]">Rack</TableHead>
                      <TableHead className="w-[120px]">Bin</TableHead>
                      <TableHead className="w-[80px]">Level</TableHead>
                      <TableHead className="w-[80px]">Pos</TableHead>
                      <TableHead className="w-[60px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocatedBins.map((item, index) => (
                      <TableRow
                        key={index}
                        className={item.error ? "bg-red-50" : "bg-green-50"}
                      >
                        <TableCell className="font-medium text-xs">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-semibold text-sm">
                          {item.medicationName}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {item.variantName}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-xs">
                          {item.batchNumber || "-"}
                        </TableCell>
                        {item.error ? (
                          <TableCell
                            colSpan={6}
                            className="text-red-600 text-sm"
                          >
                            {item.error}
                          </TableCell>
                        ) : (
                          <>
                            <TableCell>
                              <div className="text-xs">
                                <div className="font-semibold">
                                  {item.bin.zoneCode}
                                </div>
                                <div className="text-muted-foreground text-[10px] truncate max-w-[100px]">
                                  {item.bin.zoneName}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                <div className="font-semibold">
                                  {item.bin.rackCode}
                                </div>
                                <div className="text-muted-foreground text-[10px] truncate max-w-[100px]">
                                  {item.bin.rackName}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                <div className="font-semibold">
                                  {item.bin.binCode}
                                </div>
                                <div className="text-muted-foreground text-[10px] truncate max-w-[100px]">
                                  {item.bin.binName}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800">
                                L{item.bin.binLevel}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-800">
                                #{item.bin.binNumber}
                              </span>
                            </TableCell>
                            <TableCell>
                              <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmCreate}
                disabled={isPending || allocatedBins.some((item) => item.error)}
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Confirm and Create Receipt
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
