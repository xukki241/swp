"use client";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "@/components/layouts/app-layout";
import { useSuppliers, useSupplier } from "@/hooks/useSuppliers";
import { instance } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Loader2, Plus, Building2, Package } from "lucide-react";

export default function PurchaseOrderCreatePage() {
  const navigate = useNavigate();
  const { data: suppliersData, isLoading: loadingSuppliers } = useSuppliers();
  const [supplierId, setSupplierId] = useState("");
  const { data: supplierDetail, isLoading: loadingSupplierDetail } =
    useSupplier(supplierId);

  const suppliers = suppliersData?.data || suppliersData || [];
  const meds = supplierDetail?.medicationVariants || [];

  const [selectedItems, setSelectedItems] = useState([]);
  const [expectedDate, setExpectedDate] = useState("");

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
      return toast.warning(
        "Please select a supplier before adding medications!"
      );
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
    setSelectedItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = [];

    if (!supplierId) errors.push("Supplier is required.");
    if (selectedItems.length === 0)
      errors.push("At least one item must be added to the order.");

    selectedItems.forEach((item, index) => {
      if (!item.supplierMedicationVariantId)
        errors.push(`Line #${index + 1}: Medication not selected.`);
      if (!item.quantity || item.quantity <= 0)
        errors.push(`Line #${index + 1}: Quantity must be greater than 0.`);
      if (!item.unitPrice || item.unitPrice <= 0)
        errors.push(`Line #${index + 1}: Unit price must be greater than 0.`);
    });

    if (errors.length > 0) {
      toast.error("Validation Failed", {
        description: (
          <pre className="text-sm text-left whitespace-pre-wrap">
            {errors.join("\n")}
          </pre>
        ),
      });
      return;
    }

    try {
      const payload = [
        {
          supplier_id: supplierId,
          expected_date: expectedDate,
          items: selectedItems.map((i) => ({
            supplier_medication_variant_id: i.supplierMedicationVariantId,
            quantity: Number(i.quantity),
            unit_price: Number(i.unitPrice),
          })),
        },
      ];

      console.log("📦 Payload gửi đi:", payload);

      await instance.post("/purchases", payload);

      toast.success("✅ Purchase order created successfully!");
      navigate("/procurement/purchase-orders");
    } catch (error) {
      console.error("❌ Error creating PO:", error);
      const message =
        error?.response?.data?.error || "Failed to create purchase order.";
      toast.error("Error", { description: message });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="border-b  text-black">
            <div className="flex items-center gap-3 justify-center">
              <Package className="w-8 h-8" />
              <CardTitle className="text-3xl font-bold tracking-tight">
                Create Purchase Order
              </CardTitle>
            </div>
            <p className="text-center text-black mt-2 text-sm">
              ABC Pharmaceutical Company - Thach Hoa, Hoa Lac, Hanoi | Phone:
              0987 654 321
            </p>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* --- Supplier Info --- */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <h2 className="font-bold text-lg text-gray-800">
                      Buyer Information
                    </h2>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <span className="font-semibold text-gray-900">
                        Company:
                      </span>{" "}
                      ABC Pharmaceutical Company
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        Address:
                      </span>{" "}
                      Thach Hoa, Hoa Lac, Hanoi
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        Phone:
                      </span>{" "}
                      0987 654 321
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-5 h-5 text-green-600" />
                    <h2 className="font-bold text-lg text-gray-800">
                      Supplier Information
                    </h2>
                  </div>

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
                    >
                      <SelectTrigger className="bg-white border-2 border-green-200 focus:border-green-400">
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
                    <div className="mt-4 space-y-2 text-sm text-gray-700">
                      <p>
                        <span className="font-semibold text-gray-900">
                          Contact:
                        </span>{" "}
                        {supplierDetail.contactName}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-900">
                          Email:
                        </span>{" "}
                        {supplierDetail.email}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-900">
                          Address:
                        </span>{" "}
                        {supplierDetail.address}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-900">
                          Phone:
                        </span>{" "}
                        {supplierDetail.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Expected Date */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-amber-50 p-4 rounded-lg border border-amber-200">
                <Label className="font-semibold text-gray-800 min-w-[200px]">
                  Expected Delivery Date
                </Label>
                <Input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="max-w-sm bg-white border-amber-300 focus:border-amber-500"
                />
              </div>

              {/* --- Medication Table --- */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Order Items
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddItem}
                    className="border-2 border-green-200 text-green-600 hover:bg-blue-50 font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border-2 border-gray-200 shadow-md">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                      <tr>
                        <th className="p-3 text-left font-semibold w-[25%]">
                          Medication
                        </th>
                        <th className="p-3 text-left font-semibold w-[15%]">
                          SKU Code
                        </th>
                        <th className="p-3 text-left font-semibold w-[20%]">
                          Variant
                        </th>
                        <th className="p-3 text-center font-semibold w-[10%]">
                          Quantity
                        </th>
                        <th className="p-3 text-center font-semibold w-[15%]">
                          Unit Price
                        </th>
                        <th className="p-3 text-center font-semibold w-[15%]">
                          Subtotal
                        </th>
                        <th className="p-3 text-center font-semibold w-[5%]">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {selectedItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
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
                              className="border-t hover:bg-gray-50 transition-colors"
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
                                >
                                  <SelectTrigger className="border-gray-300">
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
                                  className="w-28 text-center mx-auto"
                                />
                              </td>
                              <td className="p-3 text-center font-bold text-blue-600">
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
                <div className="bg-green-400 text-white px-4 py-4 rounded-xl shadow-lg">
                  <div className="text-sm font-medium opacity-90 mb-1">
                    Total Amount
                  </div>
                  <div className="text-2xl font-bold">
                    {totalAmount.toLocaleString()} ₫
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                disabled={!supplierId || selectedItems.length === 0}
              >
                Create Purchase Order
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
