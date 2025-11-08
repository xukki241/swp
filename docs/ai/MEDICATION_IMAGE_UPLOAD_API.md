# Medication Image Upload API Documentation

## Overview

API endpoints for managing medication images in the PharmaFlow system.

## Endpoints

### 1. Upload Medication Image

Upload or replace an image for a specific medication.

**Endpoint:** `POST /api/medications/:id/upload-image`

**Authorization:** Owner only

**Request:**

- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`

- **URL Parameters:**
  - `id` (UUID, required) - Medication ID

- **Form Data:**
  - `image` (file, required) - Image file
    - Supported formats: JPEG, PNG, GIF, WebP
    - Max size: 5MB
    - Field name must be "image"

**Example cURL:**

```bash
curl -X POST http://localhost:5000/api/medications/{medication-id}/upload-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/medication-image.png"
```

**Example PowerShell:**

```powershell
$token = "YOUR_TOKEN_HERE"
$medicationId = "MEDICATION_UUID_HERE"
$imagePath = "C:\path\to\medication-image.png"

$headers = @{
    "Authorization" = "Bearer $token"
}

$form = @{
    image = Get-Item -Path $imagePath
}

Invoke-RestMethod -Uri "http://localhost:5000/api/medications/$medicationId/upload-image" `
    -Method Post `
    -Headers $headers `
    -Form $form
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Medication image uploaded successfully",
  "data": {
    "medication": {
      "id": "uuid",
      "name": "Paracetamol",
      "brand": "Tylenol",
      "description": "Analgesic and antipyretic...",
      "imageId": "file-uuid",
      "isPrescriptionRequired": false,
      "isControlledSubstance": false,
      "status": "active",
      "createdAt": "2024-10-30T10:00:00Z",
      "updatedAt": "2024-10-30T15:30:00Z"
    },
    "image": {
      "id": "file-uuid",
      "filename": "medication-image.png",
      "url": "/api/files/file-uuid"
    }
  }
}
```

**Error Responses:**

_400 Bad Request - No file uploaded:_

```json
{
  "success": false,
  "message": "No file uploaded"
}
```

_400 Bad Request - Invalid file type:_

```json
{
  "success": false,
  "message": "Invalid file type. Only images are allowed."
}
```

_400 Bad Request - File too large:_

```json
{
  "success": false,
  "message": "File too large. Maximum size is 5MB."
}
```

_404 Not Found - Medication not found:_

```json
{
  "success": false,
  "message": "Medication not found"
}
```

_403 Forbidden - Insufficient permissions:_

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

---

### 2. Delete Medication Image

Remove the image from a medication.

**Endpoint:** `DELETE /api/medications/:id/image`

**Authorization:** Owner only

**Request:**

- **Headers:**
  - `Authorization: Bearer <token>`

- **URL Parameters:**
  - `id` (UUID, required) - Medication ID

**Example cURL:**

```bash
curl -X DELETE http://localhost:5000/api/medications/{medication-id}/image \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Example PowerShell:**

```powershell
$token = "YOUR_TOKEN_HERE"
$medicationId = "MEDICATION_UUID_HERE"

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/medications/$medicationId/image" `
    -Method Delete `
    -Headers $headers
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Medication image deleted successfully",
  "data": {
    "id": "uuid",
    "name": "Paracetamol",
    "brand": "Tylenol",
    "description": "Analgesic and antipyretic...",
    "imageId": null,
    "isPrescriptionRequired": false,
    "isControlledSubstance": false,
    "status": "active",
    "createdAt": "2024-10-30T10:00:00Z",
    "updatedAt": "2024-10-30T15:35:00Z"
  }
}
```

**Error Responses:**

_404 Not Found - Medication not found:_

```json
{
  "success": false,
  "message": "Medication not found"
}
```

_404 Not Found - No image to delete:_

```json
{
  "success": false,
  "message": "Medication has no image"
}
```

_403 Forbidden - Insufficient permissions:_

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

---

### 3. Get Medication Image

Retrieve the medication with image information.

**Endpoint:** `GET /api/medications/:id`

**Authorization:** Authenticated users

**Request:**

- **Headers:**
  - `Authorization: Bearer <token>`

- **URL Parameters:**
  - `id` (UUID, required) - Medication ID

**Example cURL:**

```bash
curl http://localhost:5000/api/medications/{medication-id} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Paracetamol",
    "brand": "Tylenol",
    "description": "Analgesic and antipyretic...",
    "imageId": "file-uuid",
    "isPrescriptionRequired": false,
    "isControlledSubstance": false,
    "status": "active",
    "createdAt": "2024-10-30T10:00:00Z",
    "updatedAt": "2024-10-30T15:30:00Z"
  }
}
```

**To retrieve the actual image file:**

```bash
curl http://localhost:5000/api/files/{file-uuid} \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output medication-image.png
```

---

## File Upload Constraints

### Accepted File Types

- `image/jpeg` (.jpg, .jpeg)
- `image/png` (.png)
- `image/gif` (.gif)
- `image/webp` (.webp)

### File Size Limits

- Maximum: 5MB (5,242,880 bytes)
- Recommended: < 2MB for optimal performance

### Validation Rules

1. File must be provided in multipart/form-data format
2. Field name must be "image"
3. File type validated by MIME type
4. File size checked before processing
5. Only one image per medication

---

## Testing with Sample Data

### Step 1: Get Authentication Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@pharmaflow.com",
    "password": "admin123"
  }'
```

Save the token from response.

### Step 2: Get Medication List

```bash
curl http://localhost:5000/api/medications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Find medications with images in seed data:

- Paracetamol
- Amoxicillin
- Ibuprofen
- Omeprazole
- Cetirizine
- Metformin

### Step 3: Upload New Image

```bash
curl -X POST http://localhost:5000/api/medications/{medication-id}/upload-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/new-image.png"
```

### Step 4: Verify Image Upload

```bash
# Get medication details
curl http://localhost:5000/api/medications/{medication-id} \
  -H "Authorization: Bearer YOUR_TOKEN"

# Download the image
curl http://localhost:5000/api/files/{file-id} \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output downloaded-image.png
```

### Step 5: Delete Image (Optional)

```bash
curl -X DELETE http://localhost:5000/api/medications/{medication-id}/image \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Postman Collection

### Upload Image Request

```
POST http://localhost:5000/api/medications/{{medicationId}}/upload-image
Headers:
  Authorization: Bearer {{token}}
Body (form-data):
  image: [select file]
```

### Delete Image Request

```
DELETE http://localhost:5000/api/medications/{{medicationId}}/image
Headers:
  Authorization: Bearer {{token}}
```

---

## Implementation Details

### Database Schema

- **medications** table has `imageId` foreign key to **files** table
- **files** table stores image as BLOB with metadata
- Cascade delete: When file is deleted, medication.imageId is set to null

### File Storage

- Files stored in database as binary data (BLOB)
- No filesystem storage required
- Automatic cleanup when medication image is replaced

### Audit Logging

- Image upload logged as UPDATE action on medication
- Image deletion logged as DELETE action on medication
- Includes user ID, timestamp, and changes

### Security

- Owner-only access for upload/delete operations
- File type validation prevents malicious uploads
- Size limits prevent DoS attacks
- Authentication required for all operations

---

## Error Handling

### Common Issues

**"No file uploaded"**

- Ensure field name is "image"
- Check multipart/form-data content type
- Verify file is attached in request

**"Invalid file type"**

- Only image files accepted
- Check file extension and MIME type
- Supported: JPEG, PNG, GIF, WebP

**"File too large"**

- Maximum size: 5MB
- Compress image before upload
- Use appropriate image dimensions

**"Medication not found"**

- Verify medication ID is valid UUID
- Check medication exists in database
- Ensure medication is not deleted

---

## Performance Considerations

### Image Optimization

- Recommended dimensions: 800x800px or smaller
- Use WebP format for best compression
- Keep file size under 2MB

### Caching

- Images served with cache headers
- Client-side caching recommended
- Consider CDN for production

### Database Performance

- BLOB storage suitable for < 100,000 images
- Consider external storage for larger scale
- Index on imageId for fast lookups

---

## Migration Notes

If migrating existing images:

1. Upload images via API for each medication
2. Use batch script with cURL or PowerShell
3. Verify upload success before cleanup
4. Update frontend to use new image URLs

---

## Support

For issues or questions:

- Check API logs: `apps/api/logs/`
- Review error response messages
- Verify authentication token is valid
- Ensure proper file format and size
