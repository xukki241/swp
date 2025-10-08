# PharmaFlow API - Authentication & User Management

## 🚀 User Stories Implementation

### ✅ Implemented Features

1. **User Register** - First user becomes owner automatically
2. **Review Registration Requests** - Owner can approve/reject staff registrations
3. **User Login** - Secure login with JWT
4. **User Logout** - Client-side token removal
5. **Reset Password** - Password recovery
6. **View & Search Staff Account** - Owner can view and search staff
7. **Edit Staff Account** - Owner can edit staff details
8. **Active/Deactive Staff Account** - Owner can manage staff status

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)

#### 1. Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0123456789",
  "address": "123 Main St",
  "password": "password123"
}
```

**Response:**

- **First User:** Creates owner account immediately
- **Subsequent Users:** Creates registration request (pending approval)

#### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "owner",
    "status": "active"
  }
}
```

#### 3. Logout

```http
POST /api/auth/logout
```

#### 4. Reset Password

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "newPassword": "newpassword123"
}
```

#### 5. Change Password (Requires Authentication)

```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### 6. Get Current User (Requires Authentication)

```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

### Registration Management Routes (`/api/registrations`)

**All routes require Owner authentication**

#### 1. Get All Registration Requests

```http
GET /api/registrations?status=pending
Authorization: Bearer <owner-token>
```

**Query Parameters:**

- `status`: Filter by status (pending, approved, rejected)

#### 2. Get Registration by ID

```http
GET /api/registrations/:id
Authorization: Bearer <owner-token>
```

#### 3. Approve Registration

```http
POST /api/registrations/:id/approve
Authorization: Bearer <owner-token>
Content-Type: application/json

{
  "role": "staff"
}
```

**Roles:** `staff` | `sales`

**Note:** Password is retrieved from the registration request (stored during user registration). Owner only needs to specify the role.

#### 4. Reject Registration

```http
POST /api/registrations/:id/reject
Authorization: Bearer <owner-token>
```

#### 5. Delete Registration

```http
DELETE /api/registrations/:id
Authorization: Bearer <owner-token>
```

---

### User Management Routes (`/api/users`)

**Most routes require Owner authentication**

#### 1. Get All Staff (Owner Only)

```http
GET /api/users/staff?search=john&role=staff&status=active
Authorization: Bearer <owner-token>
```

**Query Parameters:**

- `search`: Search by name, email, or phone
- `role`: Filter by role (owner, staff, sales)
- `status`: Filter by status (active, inactive, suspended)

#### 2. Get All Users (Owner Only)

```http
GET /api/users?search=john
Authorization: Bearer <owner-token>
```

#### 3. Get User by ID (Authenticated)

```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### 4. Create User (Owner Only)

```http
POST /api/users
Authorization: Bearer <owner-token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "0987654321",
  "address": "456 Oak St",
  "role": "staff",
  "status": "active"
}
```

#### 5. Update User (Owner Only)

```http
PUT /api/users/:id
Authorization: Bearer <owner-token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "role": "sales"
}
```

#### 6. Delete User (Owner Only)

```http
DELETE /api/users/:id
Authorization: Bearer <owner-token>
```

#### 7. Activate User (Owner Only)

```http
PATCH /api/users/:id/activate
Authorization: Bearer <owner-token>
```

#### 8. Deactivate User (Owner Only)

```http
PATCH /api/users/:id/deactivate
Authorization: Bearer <owner-token>
```

#### 9. Suspend User (Owner Only)

```http
PATCH /api/users/:id/suspend
Authorization: Bearer <owner-token>
```

---

## 🔐 Authentication & Authorization

### JWT Token

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **owner**: Full access to all features
- **staff**: Limited access (to be defined)
- **sales**: Limited access (to be defined)

### User Status

- **active**: Can login and use system
- **inactive**: Cannot login
- **suspended**: Cannot login (temporary)

---

## 📝 Database Schema

### Users Table

```javascript
{
  id: bigint (primary key),
  name: varchar(100),
  email: varchar(255) unique,
  phone: varchar(10) unique,
  address: text,
  role: enum('owner', 'staff', 'sales'),
  status: enum('active', 'inactive', 'suspended')
}
```

### User Credentials Table

```javascript
{
  id: bigint (primary key),
  userId: bigint (foreign key -> users.id),
  provider: varchar(50), // 'local'
  identifier: varchar(255), // email
  secret: varchar(255) // hashed password
}
```

### User Registrations Table

```javascript
{
  id: bigint (primary key),
  name: varchar(100),
  email: varchar(255) unique,
  phone: varchar(10) unique,
  address: text,
  password: varchar(255), // hashed password
  status: enum('pending', 'approved', 'rejected')
}
```

---

## 🛠️ Environment Variables

Add to your `.env` file:

```env
# JWT
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=24h

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pharmaflow
```

---

## 🧪 Testing Workflow

### 1. Register First User (Owner)

```bash
curl -X POST http://localhost:80/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Owner User",
    "email": "owner@pharmaflow.com",
    "phone": "0123456789",
    "address": "123 Main St",
    "password": "owner123"
  }'
```

### 2. Login as Owner

```bash
curl -X POST http://localhost:80/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@pharmaflow.com",
    "password": "owner123"
  }'
```

### 3. Register Staff (Creates Registration Request)

```bash
curl -X POST http://localhost:80/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Staff User",
    "email": "staff@pharmaflow.com",
    "phone": "0987654321",
    "address": "456 Oak St",
    "password": "staff123"
  }'
```

### 4. Owner Approves Registration

```bash
curl -X POST http://localhost:80/api/registrations/2/approve \
  -H "Authorization: Bearer <owner-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "staff"
  }'
```

**Note:** The password from step 3 is stored securely and will be used automatically.

### 5. View All Staff

```bash
curl -X GET "http://localhost:80/api/users/staff?status=active" \
  -H "Authorization: Bearer <owner-token>"
```

### 6. Deactivate Staff

```bash
curl -X PATCH http://localhost:80/api/users/2/deactivate \
  -H "Authorization: Bearer <owner-token>"
```

---

## 📦 Dependencies

```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "drizzle-orm": "^0.44.6",
  "express": "^5.1.0"
}
```

---

## 🔄 User Registration Flow

```mermaid
graph TD
    A[User Registers] --> B{Is First User?}
    B -->|Yes| C[Create Owner Account]
    B -->|No| D[Create Registration Request]
    C --> E[Can Login Immediately]
    D --> F[Wait for Owner Approval]
    F --> G[Owner Reviews Request]
    G --> H{Approved?}
    H -->|Yes| I[Create Staff Account]
    H -->|No| J[Reject Request]
    I --> K[Staff Can Login]
```

---

## 🎯 Next Steps

1. Add email notifications for registration approval/rejection
2. Implement refresh token mechanism
3. Add password strength validation
4. Add rate limiting for login attempts
5. Implement session management
6. Add audit logs for user actions
