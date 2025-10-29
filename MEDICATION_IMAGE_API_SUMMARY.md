# Medication Image Upload API - Implementation Summary

## Tổng quan

Đã triển khai hoàn chỉnh API upload ảnh cho medication trong hệ thống PharmaFlow.

## Tính năng đã thêm

### 1. API Endpoints

#### Upload ảnh cho medication

- **Route:** `POST /api/medications/:id/upload-image`
- **Authorization:** Owner only
- **Chức năng:** Upload hoặc thay thế ảnh cho medication
- **Request:** Multipart form-data với field `image`
- **Response:** Thông tin medication và file đã upload

#### Xóa ảnh medication

- **Route:** `DELETE /api/medications/:id/image`
- **Authorization:** Owner only
- **Chức năng:** Xóa ảnh khỏi medication
- **Response:** Medication với imageId = null

### 2. Files đã sửa đổi

#### `apps/api/src/controllers/medicationController.js`

- Thêm import `fileService`
- Thêm function `uploadMedicationImage()` - Xử lý upload ảnh
- Thêm function `deleteMedicationImage()` - Xử lý xóa ảnh

#### `apps/api/src/routes/medicationRoutes.js`

- Import `uploadSingle` và `handleMulterError` từ middleware upload
- Thêm route POST `/upload-image` với middleware:
  - `authorize("owner")` - Chỉ owner được upload
  - `uploadSingle("image")` - Xử lý file upload
  - `handleMulterError` - Xử lý lỗi upload
  - `createAuditLog()` - Ghi log audit
- Thêm route DELETE `/image` để xóa ảnh

#### `apps/api/src/db/seed.js`

- Thêm function `createSampleImage()` tạo ảnh PNG mẫu
- Seed 6 ảnh mẫu cho medications:
  - Paracetamol
  - Amoxicillin
  - Ibuprofen
  - Omeprazole
  - Cetirizine
  - Metformin
- Cập nhật medications với `imageId`

### 3. Test Data

Database đã có:

- **12 medications** - 6 medication có ảnh sẵn
- **6 medication images** trong bảng files
- Ảnh là PNG placeholders 1x1 pixel (95 bytes mỗi ảnh)

Medications có ảnh:

1. Paracetamol (Tylenol)
2. Amoxicillin (Amoxil)
3. Ibuprofen (Brufen)
4. Omeprazole (Losec)
5. Cetirizine (Zyrtec)
6. Metformin (Glucophage)

### 4. Documentation

#### Đã tạo 2 file tài liệu

**`MEDICATION_IMAGE_UPLOAD_API.md`**

- API endpoint documentation chi tiết
- Request/Response examples
- cURL và PowerShell examples
- Error handling guide
- File upload constraints
- Testing guide với seed data
- Postman collection examples
- Security và performance notes

**`test-medication-image-upload.ps1`**

- PowerShell test script tự động
- Test workflow:
  1. Login và lấy token
  2. Lấy danh sách medications
  3. Tạo test image
  4. Upload image
  5. Verify upload thành công
  6. Cleanup

## Cách sử dụng

### 1. Chạy seed để tạo test data

```bash
cd apps/api
pnpm run db:seed
```

### 2. Start API server

```bash
cd apps/api
pnpm run dev
```

### 3. Test API

#### Cách 1: Dùng test script

```powershell
cd apps/api
powershell -ExecutionPolicy Bypass -File test-medication-image-upload.ps1
```

#### Cách 2: Dùng cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@pharmaflow.com","password":"admin123"}'

# Upload image
curl -X POST http://localhost:5000/api/medications/{id}/upload-image \
  -H "Authorization: Bearer {token}" \
  -F "image=@path/to/image.png"
```

#### Cách 3: Dùng PowerShell Invoke-RestMethod

```powershell
# Login
$loginBody = @{
    email = "owner@pharmaflow.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $response.data.token

# Upload image
$headers = @{ "Authorization" = "Bearer $token" }
$form = @{ image = Get-Item "C:\path\to\image.png" }
Invoke-RestMethod -Uri "http://localhost:5000/api/medications/{id}/upload-image" -Method Post -Headers $headers -Form $form
```

## File Upload Constraints

- **Max file size:** 5MB
- **Allowed types:** JPEG, PNG, GIF, WebP
- **Field name:** `image`
- **Storage:** Database BLOB

## Validation

### Multer middleware kiểm tra

✅ File type (MIME type)
✅ File size (< 5MB)
✅ Required field present

### Controller kiểm tra

✅ Medication tồn tại
✅ File được upload
✅ User có quyền (owner)
✅ Image tồn tại khi xóa

## Security

- **Authentication:** Required cho tất cả endpoints
- **Authorization:** Chỉ owner được upload/delete
- **File validation:** Type và size check
- **Audit logging:** Ghi log mọi thay đổi
- **Error handling:** Không expose sensitive info

## Database Schema

```sql
-- medications table
CREATE TABLE medications (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  brand VARCHAR,
  description TEXT,
  image_id UUID REFERENCES files(id),
  -- other fields...
);

-- files table
CREATE TABLE files (
  id UUID PRIMARY KEY,
  filename VARCHAR NOT NULL,
  file_type VARCHAR NOT NULL,
  mime_type VARCHAR NOT NULL,
  file_size INTEGER NOT NULL,
  blob BYTEA NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Flow

### Upload Image Flow

1. Client gửi POST request với multipart/form-data
2. Multer middleware validate và lưu file vào memory
3. Controller kiểm tra medication tồn tại
4. FileService tạo record trong bảng files
5. MedicationService update imageId của medication
6. Audit log ghi lại thay đổi
7. Response trả về medication và image info

### Delete Image Flow

1. Client gửi DELETE request
2. Controller kiểm tra medication và image tồn tại
3. FileService xóa file record
4. MedicationService set imageId = null
5. Audit log ghi lại xóa
6. Response trả về medication đã cập nhật

## Testing Checklist

✅ Upload ảnh mới cho medication
✅ Upload ảnh thay thế (replace existing)
✅ Xóa ảnh của medication
✅ Get medication với imageId
✅ Download file qua /api/files/:id
✅ Validate file type không hợp lệ
✅ Validate file quá lớn
✅ Validate medication không tồn tại
✅ Validate không có quyền (403)
✅ Audit log được tạo đúng

## Next Steps (Optional)

### Nâng cấp trong tương lai

- [ ] Image resizing/optimization trước khi lưu
- [ ] Thumbnail generation
- [ ] CDN integration cho production
- [ ] Bulk upload nhiều ảnh cùng lúc
- [ ] Image gallery cho medication
- [ ] Frontend UI cho upload/delete
- [ ] Image preview trong medication list
- [ ] External storage (S3, Azure Blob, etc.)

## Kết luận

✅ **API hoàn chỉnh** - Upload và delete ảnh cho medications
✅ **Documentation đầy đủ** - API docs và test scripts
✅ **Test data sẵn sàng** - 6 medications có ảnh mẫu
✅ **Security đảm bảo** - Authentication, authorization, validation
✅ **Audit trail** - Ghi log mọi thay đổi

Hệ thống đã sẵn sàng để test và sử dụng!
