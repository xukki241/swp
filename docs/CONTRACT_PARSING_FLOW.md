# Contract Parsing Flow Documentation

## 📋 Tổng quan

Tài liệu này mô tả chi tiết luồng xử lý file hợp đồng (Contract File) trong hệ thống PharmaFlow, từ khi user upload file ở Frontend cho đến khi nhận được dữ liệu đã parse.

---

## 🔄 Flow tổng quan

```
User Upload PDF/DOC → Frontend → Upload API → Parse API → AI/Regex Parser → Match Database → Return to Frontend
```

---

## 📤 BƯỚC 1: Frontend - User Upload Contract

### File: `apps/web/src/pages/supplier/SupplierCreatePage.jsx`

### 1.1. User click "Upload Contract"

```jsx
<Button onClick={() => fileInputRef.current?.click()}>
  <Upload className="w-4 h-4 mr-2" />
  Upload Contract & Auto-fill
</Button>
```

### 1.2. User chọn file (PDF/DOC/DOCX)

```jsx
<input
  ref={fileInputRef}
  type="file"
  accept=".pdf,.doc,.docx"
  onChange={handleContractUpload}
  className="hidden"
/>
```

### 1.3. Frontend validate file

```javascript
const handleContractUpload = async (e) => {
  const file = e.target.files?.[0];
  
  // ✅ Check file type
  const allowedTypes = [
    "application/pdf",
    "application/msword", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];
  
  if (!allowedTypes.includes(file.type)) {
    toast.error("Invalid file type");
    return;
  }
  
  // ✅ Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    toast.error("File too large");
    return;
  }
  
  // → Tiếp tục upload...
}
```

---

## ☁️ BƯỚC 2: Upload File lên Server

### 2.1. Frontend gọi hook `useUploadFile`

```javascript
const uploadResult = await uploadFile.mutateAsync(file);
const fileId = uploadResult.data.id;
const filename = uploadResult.data.filename;
```

### 2.2. Hook gọi service

**File:** `apps/web/src/hooks/useFiles.js`

```javascript
export const useUploadFile = () => {
  return useMutation({
    mutationFn: (file) => uploadFile(file),
  });
};
```

### 2.3. Service upload file

**File:** `apps/web/src/services/fileService.js`

```javascript
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await instance.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  
  return response.data;
};
```

### 2.4. Backend xử lý upload

**File:** `apps/api/src/controllers/fileController.js`

```javascript
export const uploadFile = async (req, res) => {
  const file = req.file; // Multer middleware
  
  // Lưu file vào database với blob
  const result = await fileService.create({
    filename: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    blob: file.buffer, // Binary data
  });
  
  res.json({ 
    success: true, 
    data: { id: result.id, filename: result.filename } 
  });
};
```

**Kết quả:**

- File được lưu vào database table `files`
- Trả về `fileId` cho frontend
- Frontend lưu: `setContractFile({ id: fileId, filename })`

---

## 🔍 BƯỚC 3: Parse Contract File

### 3.1. Frontend gọi parse API

```javascript
toast.success("Contract uploaded!", {
  description: "Parsing contract...",
});

const parseResult = await parseContract.mutateAsync(fileId);
```

### 3.2. Hook gọi service

**File:** `apps/web/src/hooks/useContracts.js`

```javascript
export const useParseContract = () => {
  return useMutation({
    mutationFn: (fileId) => parseContract(fileId),
  });
};
```

**File:** `apps/web/src/services/contractService.js`

```javascript
export const parseContract = async (fileId) => {
  const response = await instance.post("/contracts/parse", { fileId });
  return response.data;
};
```

### 3.3. Backend nhận request parse

**Route:** `POST /api/contracts/parse`

**File:** `apps/api/src/controllers/contractController.js`

```javascript
export const parseContract = async (req, res, next) => {
  const { fileId } = req.body;
  
  // ✅ Step 1: Lấy file từ database
  const file = await fileService.getFileWithBlob(fileId);
  
  // ✅ Step 2: Parse file với AI/Regex
  const parsedData = await parseContractFile(file.blob, file.mimeType);
  
  // ✅ Step 3: Match medications với database
  const allMedications = await getAllMedications();
  const matchedMedications = matchMedicationsWithDatabase(
    parsedData.data.medications,
    allMedications
  );
  
  // ✅ Step 4: Match variants với database
  const allVariants = await getAllMedicationVariants({ limit: 10000 });
  const medicationsWithVariants = matchVariantsForMedications(
    matchedMedications,
    allVariants
  );
  
  // ✅ Step 5: Trả về kết quả
  res.json({
    success: true,
    message: "Contract parsed successfully",
    data: {
      supplier: parsedData.data.supplier,
      medications: medicationsWithVariants,
      contract: parsedData.data.contract,
    },
  });
};
```

---

## 🤖 BƯỚC 4: Parse File với AI hoặc Regex

### File: `apps/api/src/services/contractParserService.js`

### 4.1. Main parse function

```javascript
export async function parseContractFile(fileBuffer, mimeType) {
  let text = "";
  let aiParsedData = null;
  
  // ✅ Step 1: Extract text từ file
  if (mimeType === "application/pdf") {
    text = await extractTextFromPDF(fileBuffer);
    
    // Try AI parsing first
    try {
      aiParsedData = await extractContractDataWithAI(text);
    } catch (error) {
      logger.warn("AI parsing failed, fallback to regex");
    }
  } else {
    text = await extractTextFromDOC(fileBuffer);
  }
  
  // ✅ Step 2: Nếu AI thành công, dùng AI data
  if (aiParsedData) {
    return {
      success: true,
      parsedBy: "ai",
      data: aiParsedData
    };
  }
  
  // ✅ Step 3: Fallback to regex parsing
  const supplierInfo = parseSupplierInfo(text);
  const medicationVariants = parseMedicationVariants(text);
  const contractDetails = parseContractDetails(text);
  
  return {
    success: true,
    parsedBy: "regex",
    data: {
      supplier: supplierInfo,
      medications: medicationVariants,
      contract: contractDetails,
    },
  };
}
```

### 4.2. Extract text từ PDF

```javascript
async function extractTextFromPDF(dataBuffer) {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(dataBuffer),
  });
  
  const pdf = await loadingTask.promise;
  let fullText = "";
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(" ");
    fullText += pageText + "\n";
  }
  
  return fullText.trim();
}
```

### 4.3. AI Parsing với Gemini

```javascript
async function extractContractDataWithAI(pdfText) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash" 
  });
  
  const prompt = `
Bạn là chuyên gia phân tích hợp đồng dược phẩm. Trích xuất thông tin từ hợp đồng:

${pdfText}

Trả về JSON với format:
{
  "supplier": {
    "name": "tên nhà cung cấp",
    "address": "địa chỉ",
    "phone": "số điện thoại",
    "email": "email"
  },
  "contractDetails": {
    "contractNumber": "số hợp đồng",
    "contractDate": "YYYY-MM-DD",
    "deliveryDays": số_ngày
  },
  "medications": [
    {
      "medicationName": "Paracetamol",
      "variantName": "Paracetamol 500mg Viên nén",
      "supplierSku": "VP-PAR500",
      "leadTimeDays": 5,
      "purchasePrice": 40000
    }
  ]
}
`;
  
  const result = await model.generateContent(prompt);
  const jsonText = result.response.text().trim()
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "");
  
  return JSON.parse(jsonText);
}
```

### 4.4. Regex Parsing (Fallback)

```javascript
function parseMedicationVariants(text) {
  const variants = [];
  
  // Pattern: STT + Name + Variant + SKU + LeadTime + Price
  const pattern = 
    /(\d+)\s+([\wÀ-ỹ]+)\s+([\wÀ-ỹ\s()]+?mg[^V]*?)\s+(VP\s*-?\s*[\w\d]+)\s+(\d+)\s+([\d.,\s]+₫)/gi;
  
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const [, stt, medName, variant, sku, leadTime, price] = match;
    
    variants.push({
      medicationName: medName.trim(),
      variantName: variant.trim(),
      supplierSku: sku.replace(/\s+/g, ""), // "VP - PAR500" → "VP-PAR500"
      leadTimeDays: parseInt(leadTime, 10),
      purchasePrice: parseFloat(
        price.replace(/₫/g, "").replace(/\./g, "").replace(/,/g, ".")
      ),
    });
  }
  
  return variants;
}
```

**Ví dụ parse:**

```
Input text: 
"1 Paracetamol Paracetamol 500mg Viên nén VP - PAR500 5 40.000₫"

Output:
{
  medicationName: "Paracetamol",
  variantName: "Paracetamol 500mg Viên nén",
  supplierSku: "VP-PAR500",
  leadTimeDays: 5,
  purchasePrice: 40000
}
```

---

## 🔗 BƯỚC 5: Match với Database

### 5.1. Match Medications

**File:** `apps/api/src/services/contractParserService.js`

```javascript
export function matchMedicationsWithDatabase(contractMedications, dbMedications) {
  return contractMedications.map((contractMed) => {
    // Try exact match
    let matched = dbMedications.find(
      (dbMed) => dbMed.name.toLowerCase() === contractMed.medicationName.toLowerCase()
    );
    
    // Try fuzzy match
    if (!matched) {
      matched = dbMedications.find((dbMed) =>
        dbMed.name.toLowerCase().includes(contractMed.medicationName.toLowerCase())
      );
    }
    
    if (matched) {
      return {
        ...contractMed,
        medicationId: matched.id, // ✅ Gán ID từ database
      };
    }
    
    return contractMed; // ⚠️ Không tìm thấy
  });
}
```

### 5.2. Match Variants

**File:** `apps/api/src/controllers/contractController.js`

```javascript
const medicationsWithVariants = matchedMedications.map((med) => {
  if (!med.medicationId) return med;
  
  // Lấy tất cả variants của medication này
  const medVariants = allVariants.filter(
    (v) => v.medicationId === med.medicationId
  );
  
  // ✅ Match by SKU (ưu tiên cao nhất)
  let matchedVariant = medVariants.find(
    (v) => v.sku && v.sku.toLowerCase() === med.supplierSku.toLowerCase()
  );
  
  // ✅ Match by variant name (fuzzy matching)
  if (!matchedVariant) {
    const normalizeText = (text) => 
      text.toLowerCase().replace(/[()]/g, "").replace(/\s+/g, " ").trim();
    
    const contractVariantNorm = normalizeText(med.variantName);
    
    matchedVariant = medVariants.find((v) => {
      const dbVariantNorm = normalizeText(v.name);
      
      // Extract dosage (e.g., "500mg")
      const contractDosage = med.variantName.match(/(\d+(?:\.\d+)?)\s*mg/i)?.[1];
      const dbDosage = v.name.match(/(\d+(?:\.\d+)?)\s*mg/i)?.[1];
      
      // Dosage MUST match exactly
      if (contractDosage && dbDosage && contractDosage !== dbDosage) {
        return false;
      }
      
      // Calculate match ratio (60% threshold)
      const contractParts = contractVariantNorm.split(" ");
      const dbParts = dbVariantNorm.split(" ");
      const matchingParts = contractParts.filter(p => dbParts.includes(p)).length;
      const matchRatio = matchingParts / Math.max(contractParts.length, dbParts.length);
      
      return matchRatio >= 0.6;
    });
  }
  
  if (matchedVariant) {
    return {
      ...med,
      medicationVariantId: matchedVariant.id, // ✅ Gán variant ID
      variantName: matchedVariant.name,       // ✅ Dùng tên từ DB
    };
  }
  
  return med; // ⚠️ Không tìm thấy variant
});
```

**Ví dụ matching:**

```javascript
// Contract data:
{
  medicationName: "Paracetamol",
  variantName: "Paracetamol 500mg Viên nén",
  supplierSku: "VP-PAR500"
}

// Database variants:
[
  { id: 1, medicationId: 100, name: "Paracetamol 500mg Tablet", sku: "VP-PAR500" },
  { id: 2, medicationId: 100, name: "Paracetamol 250mg Tablet", sku: "VP-PAR250" }
]

// Matching logic:
1. Match by SKU: ✅ "VP-PAR500" === "VP-PAR500" → variant.id = 1
2. Dosage check: ✅ "500mg" === "500mg"
3. Final result:
{
  medicationId: 100,
  medicationVariantId: 1,
  medicationName: "Paracetamol",
  variantName: "Paracetamol 500mg Tablet", // ← Từ DB
  supplierSku: "VP-PAR500",
  leadTimeDays: 5,
  purchasePrice: 40000
}
```

---

## 📥 BƯỚC 6: Frontend nhận kết quả

### 6.1. Parse thành công

```javascript
const parseResult = await parseContract.mutateAsync(fileId);

if (parseResult.success && parseResult.data.medications.length > 0) {
  const newMeds = parseResult.data.medications.map((med) => {
    const matchedMed = allMedications.find(
      (m) => m.name.toLowerCase().trim() === med.medicationName.toLowerCase().trim()
    );
    
    return {
      medicationId: matchedMed?.id || "",
      medicationName: med.medicationName,
      medicationVariantId: med.medicationVariantId || "", // ✅ Từ backend
      variantName: med.variantName,
      supplierSku: med.supplierSku,
      leadTimeDays: med.leadTimeDays?.toString() || "",
      purchasePrice: med.purchasePrice?.toString() || "",
      contractId: fileId,
      contractFilename: filename,
    };
  });
  
  // ✅ Set medications vào form
  setMeds(newMeds);
  
  // ✅ Show toast notification
  const medsWithoutId = newMeds.filter((m) => !m.medicationId);
  
  if (medsWithoutId.length > 0) {
    toast.warning("Contract parsed with warnings", {
      description: `${medsWithoutId.length} medication(s) not found in database`,
    });
  } else {
    toast.success("Contract parsed successfully!", {
      description: `✅ ${newMeds.length} medication(s) matched!`,
    });
  }
}
```

### 6.2. Hiển thị medications trong UI

**Component:** `MedicationRow`

```jsx
{meds.map((m, i) => (
  <MedicationRow
    key={i}
    index={i}
    rowData={m} // ← Dữ liệu từ contract
    allMedications={allMedications}
    onChange={handleMedRowChange}
    onRemove={handleRemoveMed}
  />
))}
```

**Dữ liệu trong MedicationRow:**

- `medicationId`: Pre-selected medication
- `medicationVariantId`: Pre-selected variant
- `supplierSku`: Pre-filled SKU
- `leadTimeDays`: Pre-filled lead time
- `purchasePrice`: Pre-filled price
- `contractId`: Link to contract file

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User selects file (PDF/DOC)                                    │
│          ↓                                                       │
│  handleContractUpload()                                         │
│          ↓                                                       │
│  uploadFile.mutateAsync(file)                                   │
│          ↓                                                       │
│  POST /files/upload (FormData)                                  │
│          ↓                                                       │
├─────────────────────────────────────────────────────────────────┤
│                         BACKEND                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  fileController.uploadFile()                                    │
│          ↓                                                       │
│  Save file.buffer to database.files.blob                        │
│          ↓                                                       │
│  Return { id: fileId, filename }                                │
│          ↓                                                       │
├─────────────────────────────────────────────────────────────────┤
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  setContractFile({ id, filename })                              │
│          ↓                                                       │
│  parseContract.mutateAsync(fileId)                              │
│          ↓                                                       │
│  POST /contracts/parse { fileId }                               │
│          ↓                                                       │
├─────────────────────────────────────────────────────────────────┤
│                         BACKEND                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  contractController.parseContract()                             │
│          ↓                                                       │
│  fileService.getFileWithBlob(fileId)                            │
│          ↓                                                       │
│  parseContractFile(blob, mimeType)                              │
│      ├─→ extractTextFromPDF(blob)                               │
│      │       ↓                                                   │
│      │   pdfjsLib.getDocument() → fullText                      │
│      │       ↓                                                   │
│      ├─→ extractContractDataWithAI(fullText)                    │
│      │       ↓                                                   │
│      │   Gemini AI → JSON { supplier, meds, contract }          │
│      │       ↓                                                   │
│      └─→ [Fallback] parseMedicationVariants(fullText)           │
│              ↓                                                   │
│          Regex patterns → medications[]                          │
│          ↓                                                       │
│  matchMedicationsWithDatabase(meds, dbMedications)              │
│      ├─→ Exact name match                                       │
│      └─→ Fuzzy name match                                       │
│          ↓                                                       │
│  matchVariantsForMedications(meds, dbVariants)                  │
│      ├─→ Match by SKU (priority)                                │
│      ├─→ Match by variant name (fuzzy)                          │
│      └─→ Check dosage (must match exactly)                      │
│          ↓                                                       │
│  Return { success, data: { medications, supplier, contract } }  │
│          ↓                                                       │
├─────────────────────────────────────────────────────────────────┤
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Receive parseResult                                            │
│          ↓                                                       │
│  Map to form data with IDs                                      │
│          ↓                                                       │
│  setMeds(newMeds)                                               │
│          ↓                                                       │
│  Render MedicationRow components                                │
│          ↓                                                       │
│  User sees pre-filled medications!                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Kết quả cuối cùng

User thấy form với medications đã được auto-fill:

```jsx
<MedicationRow>
  Medication: [Paracetamol] ← Pre-selected
  Variant: [Paracetamol 500mg Tablet] ← Pre-selected
  SKU: VP-PAR500 ← Pre-filled
  Lead Time: 5 ← Pre-filled
  Price: 40000 ← Pre-filled
  Contract: [contract.pdf] ← Attached
</MedicationRow>
```

---

## ⚠️ Error Handling

### AI Parsing Failed

```javascript
try {
  aiParsedData = await extractContractDataWithAI(text);
} catch (error) {
  logger.warn("AI parsing failed, fallback to regex");
  // → Use regex parsing instead
}
```

### Medication Not Found in DB

```javascript
const medsWithoutId = newMeds.filter((m) => !m.medicationId);

if (medsWithoutId.length > 0) {
  toast.warning("Contract parsed with warnings", {
    description: `${medsWithoutId.length} medication(s) not found in database - please create them first.`,
  });
}
```

### Variant Not Matched

```javascript
if (!matchedVariant) {
  logger.warn(`⚠️ No variant match found for: ${med.variantName}`);
  // User will need to manually select variant
  return {
    ...med,
    medicationVariantId: "", // Empty = user must select
  };
}
```

---

## 🔧 Environment Variables

```env
# Required for AI parsing
GOOGLE_AI_API_KEY=your_gemini_api_key

# Database connection
DATABASE_URL=postgresql://...
```

---

## 📝 Testing

### Test AI Parsing

```javascript
// Upload file và check logs
const parseResult = await parseContract.mutateAsync(fileId);

// Check console logs:
// ✅ AI extracted 4 medications from PDF
// ✅ Found 4 medication variants in DB
// ✅ Matched by SKU: "VP-PAR500" → Variant ID 1
```

### Test Regex Fallback

```javascript
// Nếu AI fail, check regex logs:
// ⚠️ AI parsing failed, fallback to regex
// 📝 Using regex parsing
// ✅ Found 4 medications via global search
```

---

## 🎓 Key Concepts

1. **Two-stage parsing**: AI first → Regex fallback
2. **Two-stage matching**: Medications → Variants
3. **Fuzzy matching**: Name similarity + dosage check
4. **SKU priority**: SKU match > Name match
5. **Pre-fill UX**: Auto-populate form for better UX

---

## 📚 Related Files

- Frontend: `apps/web/src/pages/supplier/SupplierCreatePage.jsx`
- Upload Service: `apps/api/src/controllers/fileController.js`
- Parse Controller: `apps/api/src/controllers/contractController.js`
- Parser Service: `apps/api/src/services/contractParserService.js`
- Medication Service: `apps/api/src/services/medicationService.js`
- Variant Service: `apps/api/src/services/medicationVariantService.js`

---

**Tác giả:** PharmaFlow Team  
**Ngày cập nhật:** 2025-01-16
