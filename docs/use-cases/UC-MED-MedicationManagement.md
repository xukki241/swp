# Medication Management Use Cases

## Overview

Module quản lý thuốc bao gồm thông tin thuốc, các variant (liều lượng, dạng bào chế), giá bán, và các thao tác CRUD.

---

## UC-MED-001: View Medication List

**Mô tả:** Hiển thị danh sách tất cả các loại thuốc trong hệ thống với các tính năng search, filter và pagination.

### Actors

- Staff, Manager, Admin

### Preconditions

- Người dùng đã đăng nhập

### Main Flow

1. Người dùng truy cập `/medications`
2. Hệ thống hiển thị table medications với columns:
   - Image
   - Name
   - Category
   - Active Ingredients
   - Requires Prescription
   - Status (Active/Inactive)
   - Actions (View, Edit, Delete)
3. Features available:
   - Search bar (search by name, active ingredients)
   - Filter: Category, Prescription Required, Status
   - Sort: Name, Category, Created Date
   - Pagination: 20 items/page

### API Endpoint

```http
GET /api/medications?search=&category=&requiresPrescription=&status=&page=1&limit=20
```

---

## UC-MED-002: View Medication Detail

**Mô tả:** Xem chi tiết đầy đủ thông tin một loại thuốc cụ thể, bao gồm tất cả variants và stock levels.

### Actors

- Staff, Manager, Admin

### Preconditions

- Medication tồn tại trong hệ thống

### Main Flow

1. Người dùng click "View" trên một medication
2. Hệ thống redirect đến `/medications/:id`
3. Hiển thị detail page với:
   - **Basic Info**:
     - Name
     - Category
     - Active Ingredients
     - Description
     - Usage Instructions
     - Side Effects
     - Contraindications
     - Requires Prescription (Yes/No)
   - **Variants Table**:
     - Dosage
     - Form (Tablet, Capsule, Syrup, etc.)
     - Unit (Box, Bottle, Tube)
     - Sell Price
     - Current Stock
     - Status
     - Actions
   - **Image Gallery**
   - **Additional Info**:
     - Manufacturer
     - Country of Origin
     - Created Date
     - Last Updated

### API Endpoint

```http
GET /api/medications/:id
GET /api/medications/:id/variants
```

---

## UC-MED-003: Create Medication

**Mô tả:** (Manager/Admin) Tạo một loại thuốc mới trong hệ thống với đầy đủ thông tin.

### Actors

- Manager, Admin

### Preconditions

- Có role: `manager` hoặc `admin`

### Main Flow

1. Manager click button "Add Medication"
2. Modal/page hiển thị form:
   - **Required Fields**:
     - Medication Name \*
     - Category \* (dropdown)
     - Active Ingredients \*
     - Requires Prescription (checkbox)
   - **Optional Fields**:
     - Description (textarea)
     - Usage Instructions
     - Side Effects
     - Contraindications
     - Manufacturer
     - Country of Origin
     - Image Upload (multiple)
3. Manager điền form
4. Click "Create"
5. Hệ thống validate:
   - Name không trống
   - Name chưa tồn tại
   - Category hợp lệ
6. Hệ thống tạo medication mới với status: `active`
7. Show success toast: "Medication created successfully"
8. Redirect về medication detail page

### Alternative Flows

**A1: Name đã tồn tại**

- Error: "Medication với tên này đã tồn tại"

**A2: Category không hợp lệ**

- Error: "Vui lòng chọn category"

### API Endpoint

```http
POST /api/medications
Body: {
  name, category, activeIngredients, description, usageInstructions,
  sideEffects, contraindications, requiresPrescription, manufacturer,
  countryOfOrigin
}
```

---

## UC-MED-004: Update Medication

**Mô tả:** (Manager/Admin) Chỉnh sửa thông tin của một medication đã tồn tại.

### Actors

- Manager, Admin

### Preconditions

- Medication tồn tại
- Có quyền edit

### Main Flow

1. Manager click "Edit" trên medication detail page
2. Form hiển thị với data pre-filled
3. Manager chỉnh sửa thông tin
4. Click "Save"
5. Hệ thống validate
6. Update medication
7. Show success toast
8. Refresh page với data mới

### Alternative Flows

**A1: Name conflict**

- Error nếu đổi name trùng với medication khác

### API Endpoint

```http
PATCH /api/medications/:id
```

---

## UC-MED-005: Delete Medication

**Mô tả:** (Admin) Xóa một medication khỏi hệ thống (soft delete).

### Actors

- Admin only

### Preconditions

- Medication không có variant đang được sử dụng trong orders/inventory

### Main Flow

1. Admin click "Delete"
2. Confirm dialog: "Bạn có chắc muốn xóa medication này?"
3. Click "Confirm"
4. Hệ thống check:
   - Không có pending orders
   - Không có stock trong inventory
5. Soft delete (set status = 'deleted')
6. Show success toast
7. Remove từ list

### Alternative Flows

**A1: Has active variants**

- Error: "Không thể xóa. Medication này có variants đang active."

**A2: In use**

- Error: "Không thể xóa. Medication này đang được sử dụng."

### API Endpoint

```http
DELETE /api/medications/:id
```

---

## UC-MED-006: Upload Medication Image

**Mô tả:** Upload hình ảnh cho medication (product image, packaging, etc.).

### Actors

- Manager, Admin

### Preconditions

- Medication đã tồn tại

### Main Flow

1. Manager vào medication detail page
2. Click "Upload Image" button
3. File picker mở
4. Chọn image file (jpg, png, max 5MB)
5. Preview hiển thị
6. Click "Upload"
7. Hệ thống:
   - Validate file type & size
   - Upload to cloud storage
   - Generate thumbnail
   - Save URL to database
8. Image hiển thị trong gallery

### Alternative Flows

**A1: File quá lớn**

- Error: "File size vượt quá 5MB"

**A2: File type không hợp lệ**

- Error: "Chỉ chấp nhận jpg, png"

### API Endpoint

```http
POST /api/medications/:id/images
Content-Type: multipart/form-data
```

---

## UC-MEDVAR-001: Create Medication Variant

**Mô tả:** Tạo một variant mới cho medication (VD: Paracetamol 500mg - Tablet - Box).

### Actors

- Manager, Admin

### Preconditions

- Medication đã tồn tại

### Main Flow

1. Manager vào medication detail page
2. Click "Add Variant" trong variants section
3. Modal hiển thị form:
   - **Required**:
     - Dosage \* (VD: 500mg)
     - Form \* (Tablet, Capsule, Syrup, etc.)
     - Unit \* (Box, Bottle, Tube, etc.)
     - Sell Price \* (VNĐ)
   - **Optional**:
     - SKU (auto-generate nếu trống)
     - Quantity per Unit (VD: 10 tablets/box)
     - Reorder Point
     - Manufacturer Lot Number
4. Manager điền form
5. Click "Create Variant"
6. Hệ thống:
   - Validate uniqueness (dosage + form + unit)
   - Generate SKU nếu trống
   - Create variant với initial stock = 0
7. Success toast
8. Variant xuất hiện trong table

### Alternative Flows

**A1: Duplicate variant**

- Error: "Variant này đã tồn tại"

**A2: Invalid price**

- Error: "Giá phải > 0"

### API Endpoint

```http
POST /api/medication-variants
Body: {
  medication_id, dosage, form, unit, sellPrice, sku,
  quantityPerUnit, reorderPoint
}
```

---

## UC-MEDVAR-002: Update Medication Variant

**Mô tả:** Chỉnh sửa thông tin variant (VD: thay đổi giá bán, reorder point).

### Actors

- Manager, Admin

### Preconditions

- Variant tồn tại

### Main Flow

1. Manager click "Edit" trên variant row
2. Inline editing hoặc modal hiển thị
3. Có thể chỉnh sửa:
   - Sell Price
   - Reorder Point
   - Status (Active/Inactive)
4. Click "Save"
5. Hệ thống update
6. Success toast

### Alternative Flows

**A1: Price history**

- Option: "Track price change" → lưu vào price_history table

### API Endpoint

```http
PATCH /api/medication-variants/:id
```

---

## UC-MEDVAR-003: Delete Medication Variant

**Mô tả:** Xóa một variant khỏi hệ thống (soft delete).

### Actors

- Admin

### Preconditions

- Variant không có stock
- Variant không có trong pending orders

### Main Flow

1. Admin click "Delete" trên variant
2. Confirm dialog
3. Hệ thống check constraints
4. Soft delete (status = 'deleted')
5. Success toast

### Alternative Flows

**A1: Has stock**

- Error: "Không thể xóa variant có stock"

**A2: In pending orders**

- Error: "Variant đang trong đơn hàng chờ xử lý"

### API Endpoint

```http
DELETE /api/medication-variants/:id
```

---

## Database Schema

```sql
-- Medications table
CREATE TABLE medications (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100),
  active_ingredients TEXT,
  description TEXT,
  usage_instructions TEXT,
  side_effects TEXT,
  contraindications TEXT,
  requires_prescription BOOLEAN DEFAULT FALSE,
  manufacturer VARCHAR(255),
  country_of_origin VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_name (name),
  INDEX idx_category (category),
  INDEX idx_status (status)
);

-- Medication variants table
CREATE TABLE medication_variants (
  id UUID PRIMARY KEY,
  medication_id UUID REFERENCES medications(id),
  dosage VARCHAR(100) NOT NULL,
  form VARCHAR(50) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  sell_price DECIMAL(12,2) NOT NULL,
  quantity_per_unit INT,
  reorder_point INT DEFAULT 20,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (medication_id, dosage, form, unit),
  INDEX idx_medication (medication_id),
  INDEX idx_sku (sku)
);

-- Medication images table
CREATE TABLE medication_images (
  id UUID PRIMARY KEY,
  medication_id UUID REFERENCES medications(id),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_medication (medication_id)
);
```

---

## UI Components

- `MedicationList` - Table view
- `MedicationDetail` - Detail page
- `MedicationForm` - Create/Edit form
- `VariantTable` - Variants list
- `VariantForm` - Create/Edit variant
- `ImageGallery` - Image viewer
- `ImageUploader` - Upload component

---

## Business Rules

1. **Medication Name**: Phải unique trong hệ thống
2. **Variant Uniqueness**: (medication_id + dosage + form + unit) phải unique
3. **SKU Generation**: Format: MED-{CATEGORY}-{RANDOM6}
4. **Price**: Phải > 0
5. **Prescription**: Nếu requires_prescription = true → cần check khi bán
6. **Status**:
   - `active`: Hiển thị và có thể bán
   - `inactive`: Ẩn khỏi sales, nhưng vẫn trong list
   - `deleted`: Soft deleted
7. **Reorder Point**: Mặc định = 20, có thể custom per variant

---

## Testing Checklist

- [ ] View medication list with pagination
- [ ] Search medications by name
- [ ] Filter by category, prescription
- [ ] View medication detail
- [ ] Create medication successfully
- [ ] Create với duplicate name → error
- [ ] Update medication info
- [ ] Delete medication (soft delete)
- [ ] Upload medication image
- [ ] Create variant successfully
- [ ] Create duplicate variant → error
- [ ] Update variant price
- [ ] Delete variant with stock → error
- [ ] Delete variant without stock → success
- [ ] SKU auto-generation
- [ ] Prescription flag working
- [ ] Status transitions
