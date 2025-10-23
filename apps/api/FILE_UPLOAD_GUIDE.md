# File Upload & Management Guide

## Overview

The file upload system allows authenticated users to upload, download, and manage files. Files are stored directly in the database as binary blobs (bytea in PostgreSQL).

## Features

- ✅ Upload single or multiple files
- ✅ Store files as binary blobs in database
- ✅ Download files with proper MIME types
- ✅ View files inline in browser
- ✅ File metadata management
- ✅ File size limit: 10 MB per file
- ✅ Multiple file upload: max 10 files
- ✅ Automatic file type validation

## Supported File Types

### Images
- JPEG/JPG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)

### Documents
- PDF (`.pdf`)
- Microsoft Word (`.doc`, `.docx`)
- Microsoft Excel (`.xls`, `.xlsx`)
- Plain Text (`.txt`)
- CSV (`.csv`)

## API Endpoints

### 1. Upload Single File
```http
POST /api/files
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
  file: <file_data>
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "uuid",
    "filename": "example.pdf",
    "fileType": "pdf",
    "mimeType": "application/pdf",
    "fileSize": 12345,
    "uploadedBy": "user-uuid",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Upload Multiple Files
```http
POST /api/files/batch
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
  files: <file_data_1>
  files: <file_data_2>
  ...
```

**Response:**
```json
{
  "success": true,
  "message": "3 file(s) uploaded successfully",
  "data": [
    { "id": "uuid1", "filename": "file1.jpg", ... },
    { "id": "uuid2", "filename": "file2.pdf", ... },
    { "id": "uuid3", "filename": "file3.png", ... }
  ]
}
```

### 3. Get File Metadata
```http
GET /api/files/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "filename": "example.pdf",
    "fileType": "pdf",
    "mimeType": "application/pdf",
    "fileSize": 12345,
    "uploadedBy": "user-uuid",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Download File
```http
GET /api/files/:id/download
Authorization: Bearer <token>
```

**Response:** Binary file data with headers:
- `Content-Type`: file MIME type
- `Content-Disposition`: attachment; filename="example.pdf"
- `Content-Length`: file size

### 5. View File (Inline)
```http
GET /api/files/:id/view
Authorization: Bearer <token>
```

**Response:** Binary file data with headers:
- `Content-Type`: file MIME type
- `Content-Disposition`: inline; filename="example.pdf"
- `Content-Length`: file size

### 6. List Files
```http
GET /api/files?page=1&limit=50&fileType=pdf&uploadedBy=uuid
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)
- `fileType` (optional): Filter by file type
- `uploadedBy` (optional): Filter by uploader UUID

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid1", "filename": "file1.pdf", ... },
    { "id": "uuid2", "filename": "file2.jpg", ... }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2,
    "hasMore": true
  }
}
```

### 7. Delete File
```http
DELETE /api/files/:id
Authorization: Bearer <token>
```

**Access:** Owner only

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": {
    "id": "uuid",
    "filename": "example.pdf",
    ...
  }
}
```

## Usage with Related Entities

### Medication with Image
```http
POST /api/medications
Content-Type: application/json

{
  "name": "Aspirin",
  "brand": "Bayer",
  "description": "Pain reliever",
  "image_id": "uuid-of-uploaded-image"
}
```

### Supplier Medication Variant with Contract
```http
POST /api/suppliers/:supplierId/medications
Content-Type: application/json

{
  "medication_variant_id": "uuid",
  "supplier_sku": "SKU123",
  "contract_id": "uuid-of-uploaded-contract"
}
```

### Sales Order with Prescription
```http
POST /api/sales
Content-Type: application/json

{
  "customer_id": "uuid",
  "payment_method": "cash",
  "prescription_id": "uuid-of-uploaded-prescription",
  "items": [
    {
      "medication_variant_id": "uuid",
      "quantity": 10
    }
  ]
}
```

## Client-Side Examples

### JavaScript/Fetch API
```javascript
// Upload single file
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await response.json();
  return result.data;
};

// Upload multiple files
const uploadMultipleFiles = async (files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await fetch('/api/files/batch', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await response.json();
  return result.data;
};

// Download file
const downloadFile = async (fileId) => {
  const response = await fetch(`/api/files/${fileId}/download`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'filename.ext';
  a.click();
};
```

### React Example
```jsx
import { useState } from 'react';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      console.log('Uploaded:', result.data);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
```

## Error Handling

### Common Error Responses

**File too large (> 10 MB):**
```json
{
  "success": false,
  "message": "File too large. Maximum size is 10 MB."
}
```

**Invalid file type:**
```json
{
  "success": false,
  "message": "Invalid file type. Allowed types: image/jpeg, image/png, ..."
}
```

**No file provided:**
```json
{
  "success": false,
  "message": "No file uploaded. Please provide a file."
}
```

**Too many files (> 10):**
```json
{
  "success": false,
  "message": "Too many files. Maximum is 10 files."
}
```

**File not found:**
```json
{
  "success": false,
  "message": "File not found"
}
```

## Security Considerations

1. **Authentication Required:** All file endpoints require a valid JWT token
2. **File Type Validation:** Only allowed MIME types can be uploaded
3. **File Size Limits:** Maximum 10 MB per file to prevent abuse
4. **Owner-Only Deletion:** Only owners can delete files
5. **No Direct File Access:** Files are served through authenticated endpoints

## Database Schema

The `files` table structure:
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  blob BYTEA NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

## Performance Considerations

1. **Database Storage:** Files are stored as binary blobs in PostgreSQL
2. **Memory Usage:** Multer uses memory storage before saving to database
3. **File Size Limits:** Keep files under 10 MB for optimal performance
4. **Large Files:** Consider external storage (S3, etc.) for files > 10 MB
5. **Caching:** Implement caching for frequently accessed files

## Future Enhancements

- [ ] Image resizing/thumbnails
- [ ] External storage integration (AWS S3, Azure Blob)
- [ ] File versioning
- [ ] File sharing/permissions
- [ ] Virus scanning
- [ ] CDN integration
- [ ] Direct upload to cloud storage

