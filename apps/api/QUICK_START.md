# Quick Start Guide - PharmaFlow API

## 🚀 Quick Setup

### 1. Install Dependencies (Already Done)

```bash
pnpm install
```

### 2. Setup Environment Variables

Create `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/pharmaflow
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=24h
PORT=80
NODE_ENV=development
```

### 3. Run Database Migrations

```bash
pnpm db:push
```

### 4. Start Server

```bash
pnpm dev
```

---

## ✅ Implemented User Stories

| #   | User Story                    | Status | Endpoint                        |
| --- | ----------------------------- | ------ | ------------------------------- |
| 1   | User Register (First = Owner) | ✅     | `POST /api/auth/register`       |
| 2   | Review Registration Requests  | ✅     | `GET/POST /api/registrations`   |
| 3   | User Login                    | ✅     | `POST /api/auth/login`          |
| 4   | User Logout                   | ✅     | `POST /api/auth/logout`         |
| 5   | Reset Password                | ✅     | `POST /api/auth/reset-password` |
| 6   | View & Search Staff Account   | ✅     | `GET /api/users/staff`          |
| 7   | Edit Staff Account            | ✅     | `PUT /api/users/:id`            |
| 8   | Active/Deactive Staff Account | ✅     | `PATCH /api/users/:id/activate` |

---

## 📁 New Files Created

### Services

- ✅ `src/services/authService.js` - Authentication logic
- ✅ `src/services/registrationService.js` - Registration management
- ✅ `src/services/userService.js` - Updated with staff management

### Controllers

- ✅ `src/controllers/authController.js` - Auth endpoints
- ✅ `src/controllers/registrationController.js` - Registration endpoints
- ✅ `src/controllers/userController.js` - Updated with staff endpoints

### Middleware

- ✅ `src/middleware/auth.middleware.js` - JWT & role-based auth

### Routes

- ✅ `src/routes/authRoutes.js` - Auth routes
- ✅ `src/routes/registrationRoutes.js` - Registration routes
- ✅ `src/routes/userRoutes.js` - Updated with protection

### Config

- ✅ `src/config/environment.js` - Updated with JWT config
- ✅ `src/app.js` - Updated with new routes

---

## 🧪 Test Flow

### Step 1: Register First User (becomes Owner)

```bash
curl -X POST http://localhost:80/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@pharmaflow.com",
    "phone": "0123456789",
    "address": "123 Main Street",
    "password": "admin123"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Owner account created successfully",
  "isOwner": true,
  "user": { ... }
}
```

### Step 2: Login as Owner

```bash
curl -X POST http://localhost:80/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pharmaflow.com",
    "password": "admin123"
  }'
```

**Save the token from response!**

### Step 3: Register Staff (creates request)

```bash
curl -X POST http://localhost:80/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Staff User",
    "email": "staff@pharmaflow.com",
    "phone": "0987654321",
    "address": "456 Oak Street",
    "password": "staff123"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Registration request submitted. Waiting for owner approval.",
  "isOwner": false
}
```

### Step 4: View Registration Requests (as Owner)

```bash
curl -X GET "http://localhost:80/api/registrations?status=pending" \
  -H "Authorization: Bearer YOUR_OWNER_TOKEN"
```

### Step 5: Approve Registration (as Owner)

```bash
curl -X POST http://localhost:80/api/registrations/2/approve \
  -H "Authorization: Bearer YOUR_OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "staff123",
    "role": "staff"
  }'
```

### Step 6: View All Staff (as Owner)

```bash
curl -X GET "http://localhost:80/api/users/staff?status=active" \
  -H "Authorization: Bearer YOUR_OWNER_TOKEN"
```

### Step 7: Deactivate Staff (as Owner)

```bash
curl -X PATCH http://localhost:80/api/users/2/deactivate \
  -H "Authorization: Bearer YOUR_OWNER_TOKEN"
```

---

## 🔑 Key Features

### Authentication

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (owner, staff, sales)
- ✅ Token expiration (24h default)

### Authorization Middleware

```javascript
// Require authentication
authenticate;

// Require specific role
authorize("owner");
authorize("owner", "staff");
```

### User Roles

- **owner**: Full system access
- **staff**: Limited access
- **sales**: Limited access

### User Status

- **active**: Can use system
- **inactive**: Blocked
- **suspended**: Temporarily blocked

---

## 📊 API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🔐 Protected Routes

Routes requiring authentication:

- `POST /api/auth/change-password`
- `GET /api/auth/me`
- All `/api/registrations/*` routes (owner only)
- Most `/api/users/*` routes (owner only)

---

## 🎯 Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate email/phone)
- `500` - Server Error

---

## 📝 Notes

1. **First User**: Automatically becomes owner
2. **Subsequent Users**: Must be approved by owner
3. **Password Reset**: Anyone can reset (should add email verification in production)
4. **JWT Secret**: Change in production!
5. **Token Storage**: Client must store JWT token securely

---

## 🐛 Troubleshooting

### "Invalid or expired token"

- Token expired (24h)
- Token invalid/tampered
- User deleted/deactivated

### "Email already registered"

- Email exists in users table
- Email has pending registration

### "Access denied"

- Wrong role (e.g., staff accessing owner route)
- User status not active

---

For full API documentation, see `API_DOCUMENTATION.md`
