import { AppLayout } from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupplier, useSuppliers } from "@/hooks/useSuppliers";
import { instance } from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Loader2, Package, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function PurchaseOrderCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: suppliersData, isLoading: loadingSuppliers } = useSuppliers();
  const [supplierId, setSupplierId] = useState("");
  const { data: supplierDetail, isLoading: loadingSupplierDetail } =
    useSupplier(supplierId);

  const suppliers = suppliersData?.data || suppliersData || [];
  const meds = supplierDetail?.medicationVariants || [];

  const [buyerInfo, setBuyerInfo] = useState({
    contact: "PharmaFlow Procurement Team",
    email: "procurement@pharmaflow.com",
    address: "123 Medical Center, District 1, Ho Chi Minh City",
    phone: "+84 28 1234 5678",
  });

  const [selectedItems, setSelectedItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug: Log supplier medication variants when loaded

  const expectedDeliveryDate = useMemo(() => {
    // Chỉ tính khi đã có items được chọn với medication và lead time
    const itemsWithLeadTime = selectedItems
      .map((item) => {
        const med = meds.find((m) => m.id === item.supplierMedicationVariantId);
        console.log("🔍 Checking item:", {
          itemId: item.supplierMedicationVariantId,
          med: med,
          leadTimeDays: med?.leadTimeDays,
        });
        const leadDays = Number(med?.leadTimeDays);
        return !isNaN(leadDays) && leadDays > 0 ? leadDays : 0;
      })
      .filter((days) => days > 0);

    console.log("📅 Items with lead time:", itemsWithLeadTime);

    if (itemsWithLeadTime.length === 0) return null;

    const maxLeadTime = Math.max(...itemsWithLeadTime);

    const today = new Date();
    const deliveryDate = new Date(
      today.getTime() + maxLeadTime * 24 * 60 * 60 * 1000
    );

    const calculatedDate = deliveryDate.toISOString().split("T")[0];
    console.log("✅ Calculated expected delivery date:", calculatedDate);

    return calculatedDate;
  }, [selectedItems, meds]);

  const totalAmount = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      ),
    [selectedItems]
  );

  const handleAddItem = () => {
    if (!supplierId)
      return toast.warning("Vui lòng chọn nhà cung cấp trước khi thêm thuốc!");
    setSelectedItems([
      ...selectedItems,
      { supplierMedicationVariantId: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleChangeItem = (index, field, value) => {
    const updated = [...selectedItems];
    updated[index][field] = value;

    // Auto-fill unit price when medication is selected
    if (field === "supplierMedicationVariantId") {
      const selectedMed = meds.find((m) => m.id === value);

      if (selectedMed?.purchasePrice) {
        // Parse to number if it's a string
        const price =
          typeof selectedMed.purchasePrice === "string"
            ? parseFloat(selectedMed.purchasePrice)
            : selectedMed.purchasePrice;
        updated[index].unitPrice = price;
      }
    }

    setSelectedItems(updated);
  };

  const handleBuyerInfoChange = (field, value) => {
    setBuyerInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = [];

    if (!supplierId) errors.push("Nhà cung cấp là bắt buộc.");
    if (selectedItems.length === 0)
      errors.push("Phải thêm ít nhất một mặt hàng vào đơn đặt hàng.");

    selectedItems.forEach((item, index) => {
      if (!item.supplierMedicationVariantId)
        errors.push(`Dòng #${index + 1}: Chưa chọn thuốc.`);
      if (!item.quantity || item.quantity <= 0)
        errors.push(`Dòng #${index + 1}: Số lượng phải lớn hơn 0.`);
      if (!item.unitPrice || item.unitPrice <= 0)
        errors.push(`Dòng #${index + 1}: Đơn giá phải lớn hơn 0.`);
    });

    if (errors.length > 0) {
      toast.error("Xác thực thất bại", {
        description: (
          <pre className="text-sm text-left whitespace-pre-wrap">
            {errors.join("\n")}
          </pre>
        ),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log(
        "📅 Expected delivery date before sending:",
        expectedDeliveryDate
      );
      const payload = [
        {
          supplier_id: supplierId,
          expected_date: expectedDeliveryDate || null,
          items: selectedItems.map((i) => ({
            supplier_medication_variant_id: i.supplierMedicationVariantId,
            quantity: Number(i.quantity),
            unit_price: Number(i.unitPrice),
          })),
        },
      ];

      console.log("📦 Payload to send:", payload);
      const response = await instance.post("/purchases", payload);
      console.log("📦 Response from API:", response.data);
      const createdOrder =
        response.data?.data?.[0] || response.data?.[0] || response.data;
      console.log("📦 Created order:", createdOrder);

      // Prepare email data
      const emailData = {
        purchaseOrderId: createdOrder?.id,
        supplierEmail: supplierDetail.email,
        supplierName: supplierDetail.name,
        supplierContact:
          supplierDetail.contactName || supplierDetail.name || "Supplier",
        buyerInfo: {
          contact: buyerInfo.contact,
          email: buyerInfo.email,
          address: buyerInfo.address,
          phone: buyerInfo.phone,
        },
        items: selectedItems.map((item) => {
          const med = meds.find(
            (m) => m.id === item.supplierMedicationVariantId
          );
          return {
            medicationName: med?.medicationName || "Unknown",
            variantName: med?.variantName || "-",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          };
        }),
        totalAmount,
        expectedDeliveryDate: expectedDeliveryDate
          ? new Date(expectedDeliveryDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "Not specified",
        orderNumber: createdOrder?.id || `PO-${Date.now()}`,
        orderDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };

      // Send email notification
      try {
        console.log("📧 Sending email with data:", emailData);
        await instance.post("/send-purchase-order-email", emailData);
        toast.success("✅ Đã tạo đơn đặt hàng và gửi email thành công!");
      } catch (emailError) {
        console.error("⚠️ Email sending failed:", emailError);
        console.error("⚠️ Email error response:", emailError?.response?.data);
        const emailErrorMsg =
          emailError?.response?.data?.message ||
          emailError?.response?.data?.error ||
          emailError.message;
        toast.warning(
          "Đã tạo đơn đặt hàng, nhưng gửi email thông báo thất bại.",
          {
            description: `${emailErrorMsg}\n\nĐơn hàng đã được tạo thành công. Bạn có thể gửi email thủ công sau.`,
          }
        );
      }

      // Invalidate purchase orders query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });

      navigate("/procurement/purchase-orders");
    } catch (error) {
      console.error("❌ Error creating PO:", error);
      const message =
        error?.response?.data?.error || "Không thể tạo đơn đặt hàng.";
      toast.error("Lỗi", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="shadow-lg border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-gray-700" />
              <div>
                <CardTitle className="text-3xl font-bold">
                  Create Purchase Order
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Fill in the details below to create a new purchase order
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* --- Buyer Information --- */}
              <div>
                <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Buyer Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact" className="text-sm font-medium">
                      Contact Name
                    </Label>
                    <Input
                      id="contact"
                      value={buyerInfo.contact}
                      onChange={(e) =>
                        handleBuyerInfoChange("contact", e.target.value)
                      }
                      placeholder="Enter contact name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={buyerInfo.email}
                      onChange={(e) =>
                        handleBuyerInfoChange("email", e.target.value)
                      }
                      placeholder="Enter email address"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address" className="text-sm font-medium">
                      Address
                    </Label>
                    <Input
                      id="address"
                      value={buyerInfo.address}
                      onChange={(e) =>
                        handleBuyerInfoChange("address", e.target.value)
                      }
                      placeholder="Enter address"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={buyerInfo.phone}
                      onChange={(e) =>
                        handleBuyerInfoChange("phone", e.target.value)
                      }
                      placeholder="Enter phone number"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* --- Supplier Information --- */}
              <div>
                <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Supplier Information
                </h2>

                {loadingSuppliers ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="animate-spin w-4 h-4" /> Loading
                    suppliers...
                  </div>
                ) : (
                  <Select
                    value={supplierId}
                    onValueChange={(val) => {
                      setSupplierId(val);
                      setSelectedItems([]);
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full md:w-96">
                      <SelectValue placeholder="Select a supplier..." />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {supplierDetail && (
                  <div className="mt-4 grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Contact
                      </p>
                      <p className="text-gray-900">
                        {supplierDetail.contactName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="text-gray-900">{supplierDetail.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Address
                      </p>
                      <p className="text-gray-900">{supplierDetail.address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phone</p>
                      <p className="text-gray-900">{supplierDetail.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* --- Expected Delivery Date (Auto-calculated) --- */}
              <div>
                <h2 className="font-bold text-lg text-gray-800 mb-4">
                  Expected Delivery Date
                </h2>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">
                    {expectedDeliveryDate
                      ? "Automatically calculated based on maximum lead time of selected items"
                      : "Add medications to calculate expected delivery date"}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {expectedDeliveryDate
                      ? new Date(expectedDeliveryDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "Not calculated yet"}
                  </p>
                </div>
              </div>

              {/* --- Medication Table --- */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order Items
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddItem}
                    className="border border-gray-300 bg-transparent"
                    disabled={isSubmitting}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="p-3 text-left font-semibold text-gray-700 w-[20%]">
                          Medication
                        </th>
                        <th className="p-3 text-left font-semibold text-gray-700 w-[12%]">
                          SKU Code
                        </th>
                        <th className="p-3 text-left font-semibold text-gray-700 w-[15%]">
                          Variant
                        </th>
                        <th className="p-3 text-center font-semibold text-gray-700 w-[10%]">
                          Lead Days
                        </th>
                        <th className="p-3 text-center font-semibold text-gray-700 w-[10%]">
                          Quantity
                        </th>
                        <th className="p-3 text-center font-semibold text-gray-700 w-[15%]">
                          Unit Price
                        </th>
                        <th className="p-3 text-center font-semibold text-gray-700 w-[13%]">
                          Subtotal
                        </th>
                        <th className="p-3 text-center font-semibold text-gray-700 w-[5%]">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {selectedItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="text-center py-12 text-gray-400"
                          >
                            <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="font-medium">No items added yet</p>
                            <p className="text-xs mt-1">
                              Click "Add Item" to start building your order
                            </p>
                          </td>
                        </tr>
                      ) : (
                        selectedItems.map((item, index) => {
                          const med = meds.find(
                            (m) => m.id === item.supplierMedicationVariantId
                          );
                          return (
                            <tr
                              key={index}
                              className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              <td className="p-3">
                                <Select
                                  value={item.supplierMedicationVariantId}
                                  onValueChange={(val) =>
                                    handleChangeItem(
                                      index,
                                      "supplierMedicationVariantId",
                                      val
                                    )
                                  }
                                  disabled={isSubmitting}
                                >
                                  <SelectTrigger className="border border-gray-300">
                                    <SelectValue placeholder="Select medication..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {loadingSupplierDetail ? (
                                      <SelectItem disabled value="">
                                        Loading...
                                      </SelectItem>
                                    ) : (
                                      meds.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>
                                          {m.medicationName}
                                          {m.variantName &&
                                            ` - ${m.variantName}`}
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="p-3 text-gray-600 font-mono text-xs">
                                {med?.supplierSku || "-"}
                              </td>
                              <td className="p-3 text-gray-700">
                                {med?.variantName || "-"}
                              </td>
                              <td className="p-3 text-center text-gray-700 font-medium">
                                {med?.leadTimeDays || "-"}
                              </td>
                              <td className="p-3 text-center">
                                <Input
                                  type="number"
                                  min={1}
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleChangeItem(
                                      index,
                                      "quantity",
                                      e.target.value
                                    )
                                  }
                                  className="w-20 text-center mx-auto"
                                  disabled={isSubmitting}
                                />
                              </td>
                              <td className="p-3 text-center">
                                <Input
                                  type="number"
                                  min={0}
                                  value={item.unitPrice}
                                  onChange={(e) =>
                                    handleChangeItem(
                                      index,
                                      "unitPrice",
                                      e.target.value
                                    )
                                  }
                                  className="w-28 text-center mx-auto bg-gray-50"
                                  disabled={true}
                                />
                              </td>
                              <td className="p-3 text-center font-bold text-gray-900">
                                {(
                                  item.quantity * item.unitPrice
                                ).toLocaleString()}{" "}
                                ₫
                              </td>
                              <td className="p-3 text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(index)}
                                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                  disabled={isSubmitting}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* --- Total --- */}
              <div className="flex justify-end">
                <div className="border border-gray-300 rounded-lg overflow-hidden min-w-[280px]">
                  <div className="bg-gray-50 px-6 py-2 border-b border-gray-300">
                    <span className="text-sm font-medium text-gray-700">
                      Total Amount
                    </span>
                  </div>
                  <div className="bg-white px-6 py-3">
                    <span className="text-xl font-bold text-gray-900">
                      {totalAmount.toLocaleString()} ₫
                    </span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-6 text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  !supplierId || selectedItems.length === 0 || isSubmitting
                }
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Purchase Order & Sending Email...</span>
                  </div>
                ) : (
                  "Create Purchase Order"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
