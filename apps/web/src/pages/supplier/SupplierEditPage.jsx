"use client";

import { AppLayout } from "@/components/layouts/app-layout";
import { MedicationRow } from "@/components/MedicationRow";
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
import { useParseContract } from "@/hooks/useContracts";
import { useUploadFile } from "@/hooks/useFiles";
import { useMedications } from "@/hooks/useMedications";
import { useSupplier, useUpdateSupplier } from "@/hooks/useSuppliers";
import { FileText, Sparkles, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

export default function SupplierEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const uploadFile = useUploadFile();
  const parseContract = useParseContract();
  const fileInputRef = useRef(null);

  const { data: supplierData, isLoading } = useSupplier(id);
  const updateSupplier = useUpdateSupplier();
  const {
    data: allMedicationsData,
    isLoading: isLoadingMedications,
    error: medicationsError,
  } = useMedications();

  // Handle both response formats: { data: [...] } or [...]
  const allMedications = Array.isArray(allMedicationsData)
    ? allMedicationsData
    : allMedicationsData?.data || [];

  const supplier = supplierData;

  const [form, setForm] = useState({
    name: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
  });

  const [meds, setMeds] = useState([]);
  const [medsLoaded, setMedsLoaded] = useState(false);
  const [contractFile, setContractFile] = useState({
    id: null,
    filename: null,
  });

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name || "",
        contactName: supplier.contactName || supplier.contact_name || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        status: supplier.status || "active",
      });
    }
  }, [supplier]);

  useEffect(() => {
    // Load medications từ supplier data
    // API đã trả về đầy đủ thông tin medicationId, medicationName và variantName
    if (supplier && Array.isArray(supplier.medicationVariants) && !medsLoaded) {
      if (supplier.medicationVariants.length === 0) {
        // Nếu supplier không có medications
        setMeds([]);
        setMedsLoaded(true);
      } else {
        // Có medications - map trực tiếp từ API response
        const mappedMeds = supplier.medicationVariants.map((v) => ({
          medicationId: v.medicationId || v.medication_id || "",
          medicationVariantId:
            v.medicationVariantId || v.medication_variant_id || "",
          medicationName: v.medicationName || "",
          variantName: v.variantName || "",
          supplierSku: v.supplierSku || v.supplier_sku || "",
          leadTimeDays:
            v.leadTimeDays?.toString() || v.lead_time_days?.toString() || "",
          purchasePrice:
            v.purchasePrice?.toString() || v.purchase_price?.toString() || "",
          contractId: v.contractId || v.contract_id || null,
          contractFilename: v.contractFilename || v.contract_filename || null,
        }));

        setMeds(mappedMeds);
        setMedsLoaded(true);
      }
    }
  }, [supplier, medsLoaded]);

  const handleAddMed = () =>
    setMeds([
      ...meds,
      {
        medicationId: "",
        medicationVariantId: "",
        medicationName: "",
        variantName: "",
        supplierSku: "",
        leadTimeDays: "",
        purchasePrice: "",
        contractId: contractFile.id,
        contractFilename: contractFile.filename,
      },
    ]);

  const handleRemoveMed = (index) =>
    setMeds(meds.filter((_, i) => i !== index));

  const handleMedRowChange = (index, updatedRowData) => {
    const updated = [...meds];
    updated[index] = updatedRowData;
    setMeds(updated);
  };

  const handleContractUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload PDF, DOC, or DOCX files only.",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Maximum file size is 10MB.",
      });
      return;
    }

    try {
      const uploadResult = await uploadFile.mutateAsync(file);
      const fileId = uploadResult.data.id;
      const filename = uploadResult.data.filename;

      setContractFile({ id: fileId, filename });

      toast.success("Contract uploaded!", {
        description: "Parsing contract...",
      });

      const parseResult = await parseContract.mutateAsync(fileId);

      console.log("📦 Parse result from backend:", parseResult);

      if (parseResult.success && parseResult.data.medications.length > 0) {
        const newMeds = parseResult.data.medications.map((med) => {
          const matchedMed = allMedications.find(
            (m) =>
              m.name.toLowerCase().trim() ===
              med.medicationName.toLowerCase().trim()
          );

          console.log("🔍 Matching medication:", {
            parsedName: med.medicationName,
            matchedMed: matchedMed,
            matchedId: matchedMed?.id,
            variantIdFromBackend: med.medicationVariantId, // ✅ Log variant ID from backend
          });

          return {
            medicationId: matchedMed?.id || "",
            medicationName: med.medicationName,
            medicationVariantId: med.medicationVariantId || "", // ✅ Use matched variant from backend
            variantName: med.variantName,
            supplierSku: med.supplierSku,
            leadTimeDays: med.leadTimeDays?.toString() || "",
            purchasePrice: med.purchasePrice?.toString() || "",
            contractId: fileId,
            contractFilename: filename,
          };
        });

        console.log("📋 New meds array:", newMeds);
        setMeds(newMeds);

        // Check if any medication was not found
        const medsWithoutId = newMeds.filter((m) => !m.medicationId);
        const medsMatched = newMeds.length - medsWithoutId.length;

        if (medsWithoutId.length > 0) {
          toast.warning("Contract parsed with warnings", {
            description: `Found ${newMeds.length} medication(s). ${medsWithoutId.length} medication(s) not found in database - please create them first.`,
            duration: 7000,
          });
        } else {
          toast.success("Contract parsed successfully!", {
            description: `✅ ${medsMatched} medication(s) matched! Please select variants for each medication or create new variants if needed.`,
            duration: 6000,
          });
        }
      } else {
        toast.warning("No medications found", {
          description: "Please add medications manually.",
        });
      }
    } catch (error) {
      console.error("Contract upload/parse error:", error);
      toast.error("Failed to process contract", {
        description: error.message || "Please try again.",
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveContract = () => {
    setContractFile({ id: null, filename: null });

    const updatedMeds = meds.map((med) => ({
      ...med,
      contractId: null,
      contractFilename: null,
    }));
    setMeds(updatedMeds);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    toast.info("Contract removed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = [];
    if (!form.name.trim()) {
      validationErrors.push("Tên nhà cung cấp là bắt buộc.");
    }
    if (!form.email.trim()) {
      validationErrors.push("Email là bắt buộc.");
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      validationErrors.push("Định dạng email không hợp lệ.");
    }
    if (!form.phone.trim()) {
      validationErrors.push("Số điện thoại là bắt buộc.");
    }
    if (!form.address.trim()) {
      validationErrors.push("Địa chỉ là bắt buộc.");
    }

    // Chỉ validate medications nếu đã load xong
    if (medsLoaded) {
      meds.forEach((med, index) => {
        if (med.medicationId || med.supplierSku.trim() || med.purchasePrice) {
          if (!med.medicationVariantId) {
            validationErrors.push(
              `Thuốc #${index + 1}: Phải chọn phiên bản thuốc.`
            );
          }
          if (!med.supplierSku.trim()) {
            validationErrors.push(
              `Thuốc #${index + 1}: Mã SKU nhà cung cấp là bắt buộc.`
            );
          }
          if (!med.purchasePrice || Number(med.purchasePrice) <= 0) {
            validationErrors.push(
              `Thuốc #${index + 1}: Giá mua phải lớn hơn 0.`
            );
          }
        }
      });
    }

    if (validationErrors.length > 0) {
      toast.error("Xác thực thất bại", {
        description: (
          <pre className="text-sm text-left whitespace-pre-wrap">
            {validationErrors.join("\n")}
          </pre>
        ),
      });
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        contactName: form.contactName?.trim() || null,
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        status: form.status,
      };

      // Chỉ gửi medicationVariants nếu đã load xong
      if (medsLoaded) {
        const variants = meds
          .filter(
            (m) =>
              m.medicationVariantId &&
              m.supplierSku.trim() &&
              m.purchasePrice &&
              Number(m.purchasePrice) > 0
          )
          .map((m) => ({
            medication_variant_id: m.medicationVariantId,
            supplier_sku: m.supplierSku.trim(),
            lead_time_days: m.leadTimeDays
              ? Number.parseInt(m.leadTimeDays, 10)
              : null,
            purchase_price: Number(m.purchasePrice),
            contract_id: m.contractId || null,
          }));

        payload.medicationVariants = variants;
      }

      await updateSupplier.mutateAsync({ id, ...payload });
      toast.success("Đã cập nhật nhà cung cấp thành công!");
      navigate(`/suppliers`);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Không thể lưu nhà cung cấp", {
        description:
          error?.response?.data?.error ||
          error.message ||
          "Đã xảy ra lỗi không mong muốn.",
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">
                Đang tải thông tin nhà cung cấp...
              </p>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Sửa nhà cung cấp</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplierName">Tên nhà cung cấp *</Label>
              <Input
                id="supplierName"
                placeholder="VD: Công ty Dược phẩm ABC"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Tên người liên hệ</Label>
              <Input
                id="contactName"
                placeholder="VD: Nguyễn Văn A"
                value={form.contactName}
                onChange={(e) =>
                  setForm({ ...form, contactName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="VD: lienhe@abc.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                id="phone"
                placeholder="VD: 0123456789"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ *</Label>
              <Input
                id="address"
                placeholder="VD: 123 Đường ABC, Quận XYZ, TP.HCM"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                  <SelectItem value="blacklisted">Danh sách đen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contract Upload Section */}
            <div className="space-y-2 border-t pt-4">
              <h3 className="font-semibold">Hợp đồng cung cấp (Optional)</h3>
              <p className="text-sm text-muted-foreground">
                Upload hợp đồng để tự động điền thông tin thuốc
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleContractUpload}
                className="hidden"
              />

              {!contractFile.id ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadFile.isPending || parseContract.isPending}
                  className="w-full md:w-auto"
                >
                  {uploadFile.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                      Uploading...
                    </>
                  ) : parseContract.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Contract & Auto-fill
                      <Sparkles className="w-3 h-3 ml-1 text-yellow-500" />
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 flex-1 truncate">
                    {contractFile.filename}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveContract}
                    className="h-6 w-6 p-0 hover:bg-red-100"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2 border-t pt-4">
              <h3 className="font-semibold">Danh sách thuốc</h3>
              {!medsLoaded ? (
                <div className="flex items-center justify-center py-8 border rounded-lg bg-muted/20">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">
                      Đang tải danh sách thuốc...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {meds.map((m, i) => (
                    <MedicationRow
                      key={`${m.medicationVariantId}-${i}`}
                      index={i}
                      rowData={m}
                      allMedications={allMedications}
                      isLoadingMedications={isLoadingMedications}
                      onChange={handleMedRowChange}
                      onRemove={handleRemoveMed}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddMed}
                  >
                    + Thêm thuốc
                  </Button>
                </>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={!medsLoaded}>
              {medsLoaded ? "Lưu thay đổi" : "Đang tải dữ liệu..."}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
