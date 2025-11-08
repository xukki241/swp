# 🚀 Quick Start - Contract Auto-fill

## ✅ Đã hoàn thành

### Backend API

- ✅ Contract parser service (PDF/DOC)
- ✅ API endpoint: `POST /api/contracts/parse`
- ✅ Dependencies installed: `pdf-parse`, `mammoth`

### Frontend

- ✅ React hook: `useParseContract()`
- ✅ Updated: `MedicationRow.jsx` với autofill
- ✅ Icon AI (✨ Sparkles) trên upload button

## 🎯 Cách sử dụng

### 1. Backend đã sẵn sàng

Server tự động parse file khi upload contract PDF/DOC.

### 2. Frontend cần update parent component

**Trong component cha (CreateSupplierPage hoặc tương tự):**

```jsx
// Add callback to handle autofill
const handleAutofill = (parsedData) => {
  // 1. Fill supplier info (if available)
  if (parsedData.supplier) {
    setFormData({
      ...formData,
      name: parsedData.supplier.name || formData.name,
      contactName: parsedData.supplier.contactName || formData.contactName,
      email: parsedData.supplier.email || formData.email,
      phone: parsedData.supplier.phone || formData.phone,
      address: parsedData.supplier.address || formData.address,
    });
  }

  // 2. Replace medication rows with parsed data
  if (parsedData.medications && parsedData.medications.length > 0) {
    const newRows = parsedData.medications.map((med) => ({
      medicationId: med.medicationId || "",
      medicationName: med.medicationName || "",
      medicationVariantId: "", // Will be auto-selected
      variantName: med.variantName || "",
      supplierSku: med.supplierSku || "",
      leadTimeDays: med.leadTimeDays || "",
      purchasePrice: med.purchasePrice || "",
      contractId: null,
      contractFilename: null,
    }));

    setMedicationRows(newRows);

    toast.success("Contract data loaded!", {
      description: `${newRows.length} medication(s) imported from contract`,
    });
  }
};

// Pass to MedicationRow
<MedicationRow
  index={index}
  rowData={row}
  allMedications={medications}
  onChange={handleRowChange}
  onRemove={handleRemoveRow}
  onAutofill={handleAutofill} // ← Add this
/>;
```

## 📝 Example Contract Format

Contract phải có các thông tin:

### Supplier Section (Bên bán)

```
Tên Bên bán: Viet Pharmaceutical Corporation
Địa chỉ: 123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM
Điện thoại: 0281234567
Email: contact@vietpharm.vn
Đại diện là Ông/Bà: Nguyen Van Khai
```

### Medication Table (Danh mục hàng hóa)

```
STT | Tên thuốc | Phiên bản | Mã SKU | Thời gian giao | Giá
1   | Paracetamol | 500mg Tablets | VP-PAR500 | 5 | 40.000₫
```

## 🧪 Testing

### Manual Test

1. Start dev server: `pnpm dev`
2. Go to Create Supplier page
3. Upload a contract PDF/DOC in any medication row
4. Watch the magic! ✨

### API Test

```bash
# See test-contract-parser.ps1 for full test script
```

## 🎨 UI Changes

Upload button now shows:

```
[📤 Upload Contract ✨]
```

The ✨ sparkles icon indicates AI parsing capability.

## ⚠️ Important Notes

1. **Medications must exist in database** - Parser matches by name
2. **PDF must be text-based** - Scanned images won't work
3. **Contract format** - Vietnamese format expected (see example)
4. **Max file size** - 10 MB

## 🐛 Troubleshooting

**Problem**: Server error on parse
**Solution**: Check logs, ensure file is text-based PDF

**Problem**: No data extracted
**Solution**: Contract format may differ, check regex patterns in `contractParserService.js`

**Problem**: Medications not matching
**Solution**: Add medications to database first, ensure name matches

## 📚 Next Steps

1. Test with real contract files
2. Adjust regex patterns if needed
3. Add more field mappings
4. Improve matching algorithm
