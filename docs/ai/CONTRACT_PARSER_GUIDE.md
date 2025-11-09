# Contract Parser Service - Setup Guide

## 📦 Required Dependencies

Install the following packages for PDF and DOC parsing:

```bash
cd apps/api
pnpm add pdf-parse mammoth
```

## 🎯 Features

### Auto-fill contract data from PDF/DOC files

- **Parse supplier information**: name, contact, address, phone, email
- **Extract medication list**: name, variant, SKU, lead time, price
- **Match medications**: Auto-match with existing database medications
- **Smart autofill**: Fill form fields automatically

## 🔧 How It Works

1. **Upload Contract** → File saved to database
2. **Parse File** → Extract text using OCR
3. **Extract Data** → Parse supplier info, medications, prices
4. **Match Database** → Find matching medications in your database
5. **Autofill Form** → Populate all form fields automatically

## 📋 API Endpoints

### POST /api/contracts/parse

Parse a contract file and extract data

**Request:**

```json
{
  "fileId": "uuid-of-uploaded-file"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Contract parsed successfully",
  "data": {
    "supplier": {
      "name": "Viet Pharmaceutical Corporation",
      "contactName": "Nguyen Van Khai",
      "address": "123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM",
      "phone": "0281234567",
      "email": "contact@vietpharm.vn"
    },
    "medications": [
      {
        "medicationId": "uuid",
        "medicationName": "Paracetamol",
        "variantName": "Paracetamol 500mg Tablets",
        "supplierSku": "VP-PAR500",
        "leadTimeDays": 5,
        "purchasePrice": 40000,
        "matchConfidence": "high"
      }
    ],
    "contract": {
      "contractNumber": "...",
      "contractDate": "2025-10-27",
      "effectiveDate": "2025-10-27",
      "deliveryDays": 10,
      "totalAmount": 412500
    }
  }
}
```

## 🎨 Frontend Usage

### Update parent component to handle autofill

```jsx
const handleAutofill = (parsedData) => {
  // Update supplier info
  if (parsedData.supplier) {
    // Fill supplier fields
  }

  // Update medication rows
  if (parsedData.medications.length > 0) {
    const newRows = parsedData.medications.map((med) => ({
      medicationId: med.medicationId,
      medicationName: med.medicationName,
      medicationVariantId: null, // Need to match variant
      variantName: med.variantName,
      supplierSku: med.supplierSku,
      leadTimeDays: med.leadTimeDays,
      purchasePrice: med.purchasePrice,
      contractId: null,
      contractFilename: null,
    }));

    setMedicationRows(newRows);
  }
};

<MedicationRow
  index={index}
  rowData={row}
  allMedications={allMedications}
  onChange={handleMedicationChange}
  onRemove={handleRemoveMedication}
  onAutofill={handleAutofill} // Pass callback
/>;
```

## 🔍 Contract Format Support

The parser expects contracts in Vietnamese format with sections:

- Bên mua (Buyer info)
- Bên bán (Supplier info)
- Danh mục hàng hóa (Medication table)

## 🚀 Testing

1. Upload a contract PDF/DOC file
2. System automatically parses the file
3. Check toast notifications for progress
4. Form fields auto-populate with extracted data
5. Review and adjust as needed

## ⚙️ Configuration

### Supported File Types

- PDF (`.pdf`)
- Microsoft Word (`.doc`, `.docx`)

### Maximum File Size

- 10 MB

## 🐛 Troubleshooting

**Problem**: Parsing fails

- **Solution**: Check file format, ensure it's a text-based PDF (not scanned image)

**Problem**: Data not matching

- **Solution**: Medication names must exist in database first

**Problem**: Wrong data extracted

- **Solution**: Contract format may differ, adjust regex patterns in service
