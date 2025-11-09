# User Management Module - Detailed Documentation

## 📋 Overview

The User Management Module handles all staff account management, authentication, roles, permissions, and scheduling in the pharmacy system. Only the Owner (Store Manager) can manage users.

---

## 🔄 User Management Workflow

### Phase 1: View All Staff Accounts

```
┌─────────────────────────────────────────┐
│  Owner Login to System                  │
│  (Role: Owner)                          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Navigate to User Management            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  1. View All Staff Accounts             │
│     - Search by name/email/phone        │
│     - Filter by role                    │
│     - Filter by status                  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Show Staff List with Details:          │
│  - Name                                 │
│  - Email                                │
│  - Phone                                │
│  - Role (Admin/Staff/Pharmacist)        │
│  - Status (Active/Inactive/Suspended)   │
│  - Action buttons (Edit/Activate/etc)   │
└─────────────────────────────────────────┘
```

#### API: Get All Staff Accounts

**Endpoint:** `GET /api/users/staff?search={term}&role={role}&status={status}`

```json
Request:
{
  "search": "Nguyễn",          // Optional: search by name/email/phone
  "role": "pharmacist",        // Optional: "admin" | "staff" | "pharmacist"
  "status": "active"           // Optional: "active" | "inactive" | "suspended"
}

Response (200 OK):
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "uuid-user-1",
      "name": "Nguyễn Văn A",
      "email": "nguyena@pharmacy.com",
      "phone": "0901234567",
      "address": "123 Đường Lê Lợi, TP.HCM",
      "role": "pharmacist",       // Staff member's role
      "status": "active",         // Account status
      "createdAt": "2025-01-15T08:00:00Z",
      "updatedAt": "2025-11-09T10:00:00Z"
    },
    {
      "id": "uuid-user-2",
      "name": "Trần Thị B",
      "email": "tranb@pharmacy.com",
      "phone": "0987654321",
      "address": null,
      "role": "staff",
      "status": "active",
      "createdAt": "2025-02-20T09:30:00Z",
      "updatedAt": "2025-11-08T14:45:00Z"
    }
  ]
}
```

#### API: Get All Users (Both Staff and Admin)

**Endpoint:** `GET /api/users?search={term}`

```json
Request:
{
  "search": "Nguyễn"  // Optional: search by name/email/phone
}

Response (200 OK):
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "uuid-user-1",
      "name": "Nguyễn Văn A",
      "email": "nguyena@pharmacy.com",
      "phone": "0901234567",
      "address": "123 Đường Lê Lợi",
      "role": "pharmacist",
      "status": "active"
    },
    {
      "id": "uuid-user-2",
      "name": "Trần Thị B",
      "email": "tranb@pharmacy.com",
      "phone": "0987654321",
      "address": null,
      "role": "staff",
      "status": "suspended"
    },
    {
      "id": "uuid-owner",
      "name": "Owner/Manager",
      "email": "owner@pharmacy.com",
      "phone": "0911111111",
      "address": null,
      "role": "owner",
      "status": "active"
    }
  ]
}
```

---

### Phase 2: Create New User Account

```
┌─────────────────────────────────────────┐
│  2. Create New User Account             │
│     Click "Add New User" button          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Display New User Form:                 │
│  - Name (required)                      │
│  - Email (required, unique)             │
│  - Phone (required, unique, 10 digits)  │
│  - Address (optional)                   │
│  - Role (required)                      │
│  - Status (optional, default: active)   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Owner fills form & submits             │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Backend Validation:                    │
│  ✓ All required fields present          │
│  ✓ Email format valid                   │
│  ✓ Phone format: exactly 10 digits      │
│  ✓ Email not already used               │
│  ✓ Phone not already used               │
└─────────────────────────────────────────┘
              ↓
         Pass/Fail?
              ↓
         ┌─────┴──────┐
         ↓            ↓
      PASS         FAIL
         ↓            ↓
    [CREATE]   [SHOW ERROR]
         │            │
         └─────┬──────┘
              ↓
       ┌──────────────┐
       │ User Created │
       └──────────────┘
```

#### API: Create New User

**Endpoint:** `POST /api/users`

```json
Request:
{
  "name": "Lê Văn C",                 // Required, 1-100 characters
  "email": "levanc@pharmacy.com",     // Required, unique, valid email
  "phone": "0912345678",              // Required, unique, exactly 10 digits
  "address": "456 Đường Pasteur",     // Optional
  "role": "pharmacist",               // Required: "admin" | "staff" | "pharmacist"
  "status": "active"                  // Optional: "active" | "inactive" | "suspended"
}

Response (201 Created):
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid-new-user",
    "name": "Lê Văn C",
    "email": "levanc@pharmacy.com",
    "phone": "0912345678",
    "address": "456 Đường Pasteur",
    "role": "pharmacist",
    "status": "active",
    "createdAt": "2025-11-09T15:00:00Z",
    "updatedAt": "2025-11-09T15:00:00Z"
  }
}

Error Cases (400 Bad Request):
{
  "success": false,
  "message": "Name, email, and phone are required"
}

Error Cases (409 Conflict):
{
  "success": false,
  "message": "User with this email already exists"
}

{
  "success": false,
  "message": "User with this phone already exists"
}
```

---

### Phase 3: Update/Edit User Account

```
┌─────────────────────────────────────────┐
│  3. Edit Existing User                  │
│     Click "Edit" button for user        │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Show Edit User Form:                   │
│  - Pre-filled with current data         │
│  - Can modify: name, email, phone,      │
│    address, role, status                │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Owner updates fields & saves           │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Backend Validation:                    │
│  ✓ User exists                          │
│  ✓ Email unique (if changed)            │
│  ✓ Phone unique (if changed)            │
│  ✓ Can't change own role                │
│  ✓ Can't change own status              │
│  ✓ No changing another's role/status    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  User Updated Successfully              │
└─────────────────────────────────────────┘
```

#### API: Update User

**Endpoint:** `PUT /api/users/{userId}`

```json
Request:
{
  "name": "Lê Văn C Updated",         // Optional
  "email": "levanc.new@pharmacy.com", // Optional, but must be unique if changed
  "phone": "0912345679",              // Optional, but must be unique if changed
  "address": "789 New Address",       // Optional
  "role": "staff",                    // Optional (Owner can change other's roles)
  "status": "inactive"                // Optional (Owner can change other's status)
}

Response (200 OK):
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid-user",
    "name": "Lê Văn C Updated",
    "email": "levanc.new@pharmacy.com",
    "phone": "0912345679",
    "address": "789 New Address",
    "role": "staff",
    "status": "inactive",
    "createdAt": "2025-11-09T15:00:00Z",
    "updatedAt": "2025-11-09T16:30:00Z"
  }
}

Error Cases (403 Forbidden):
{
  "success": false,
  "message": "You cannot change your own role"
}

{
  "success": false,
  "message": "You cannot change your own status"
}

Error Cases (404 Not Found):
{
  "success": false,
  "message": "User not found"
}

Error Cases (409 Conflict):
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

### Phase 4: Account Status Management

```
┌──────────────────────────────────────────┐
│  Account Status Control                  │
│  (Owner can activate/deactivate/suspend) │
└──────────────────────────────────────────┘
         ↓
    ┌────┼────┬────────┐
    ↓    ↓    ↓        ↓
 [ACTIVE] [INACTIVE] [SUSPEND] [DELETE]
    ↓    ↓    ↓        ↓
```

#### API: Activate User

**Endpoint:** `PATCH /api/users/{userId}/activate`

```json
Request: (No body required)

Response (200 OK):
{
  "success": true,
  "data": {
    "id": "uuid-user",
    "name": "Nguyễn Văn A",
    "email": "nguyena@pharmacy.com",
    "phone": "0901234567",
    "role": "pharmacist",
    "status": "active",          // ← Changed to active
    "updatedAt": "2025-11-09T16:45:00Z"
  }
}
```

#### API: Deactivate User

**Endpoint:** `PATCH /api/users/{userId}/deactivate`

```json
Request: (No body required)

Response (200 OK):
{
  "success": true,
  "data": {
    "id": "uuid-user",
    "name": "Trần Thị B",
    "email": "tranb@pharmacy.com",
    "phone": "0987654321",
    "role": "staff",
    "status": "inactive",        // ← Changed to inactive
    "updatedAt": "2025-11-09T16:50:00Z"
  }
}

Note: Deactivated users cannot log in to the system
```

#### API: Suspend User

**Endpoint:** `PATCH /api/users/{userId}/suspend`

```json
Request: (No body required)

Response (200 OK):
{
  "success": true,
  "data": {
    "id": "uuid-user",
    "name": "Phan Thị D",
    "email": "phanthid@pharmacy.com",
    "phone": "0911111112",
    "role": "staff",
    "status": "suspended",       // ← Changed to suspended
    "updatedAt": "2025-11-09T17:00:00Z"
  }
}

Note: Suspended users cannot log in; accounts can be reactivated
```

#### API: Delete User (Permanent)

**Endpoint:** `DELETE /api/users/{userId}`

```json
Request: (No body required)

Response (200 OK):
{
  "success": true,
  "message": "User deleted successfully"
}

⚠️ Warning: This is permanent deletion. Cannot be undone.
```

---

### Phase 5: View User Details & Schedule

```
┌─────────────────────────────────────────┐
│  4. View User Details                   │
│     Click on user name/row              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Display User Information:              │
│  - Basic info (name, email, phone)      │
│  - Role and status                      │
│  - Account created/updated dates        │
│  - View work schedule                   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  5. View Work Schedule                  │
│     - Calendar view                     │
│     - Shifts assigned                   │
│     - Days off                          │
└─────────────────────────────────────────┘
```

#### API: Get User by ID

**Endpoint:** `GET /api/users/{userId}`

```json
Response (200 OK):
{
  "success": true,
  "data": {
    "id": "uuid-user-1",
    "name": "Nguyễn Văn A",
    "email": "nguyena@pharmacy.com",
    "phone": "0901234567",
    "address": "123 Đường Lê Lợi, TP.HCM",
    "role": "pharmacist",
    "status": "active",
    "createdAt": "2025-01-15T08:00:00Z",
    "updatedAt": "2025-11-09T10:00:00Z"
  }
}

Error Cases (404 Not Found):
{
  "success": false,
  "message": "User not found"
}
```

#### API: Get User Schedule

**Endpoint:** `GET /api/users/{userId}/schedule?startDate={date}&endDate={date}`

```json
Request:
{
  "startDate": "2025-11-01",     // Required: YYYY-MM-DD
  "endDate": "2025-11-30"        // Required: YYYY-MM-DD
}

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "uuid-shift-1",
      "userId": "uuid-user-1",
      "date": "2025-11-09",
      "startTime": "08:00",
      "endTime": "17:00",
      "shiftType": "regular"      // "regular" | "morning" | "evening" | "night"
    },
    {
      "id": "uuid-shift-2",
      "userId": "uuid-user-1",
      "date": "2025-11-10",
      "startTime": "08:00",
      "endTime": "17:00",
      "shiftType": "regular"
    },
    {
      "id": "uuid-dayoff-1",
      "userId": "uuid-user-1",
      "date": "2025-11-11",
      "startTime": null,
      "endTime": null,
      "shiftType": "day_off"      // No shift = day off
    }
  ]
}
```

---

## 👥 User Roles & Permissions

### Role Hierarchy

```
┌────────────────────────────────────────┐
│          OWNER (Manager)               │
│  - Full system access                  │
│  - Can manage all users                │
│  - Can manage inventory                │
│  - Can view analytics/reports          │
│  - Cannot be deactivated by others     │
└────────────────────────────────────────┘
         ↑
         │ Can manage
         ↓
┌────────────────────────────────────────┐
│          ADMIN (Asst Manager)          │
│  - Manage staff (create/edit/delete)   │
│  - View sales reports                  │
│  - Manage inventory (limited)          │
│  - Cannot manage other admins          │
└────────────────────────────────────────┘
         ↑
         │ Can manage
         ↓
┌────────────────────────────────────────┐
│     PHARMACIST / STAFF (Regular)       │
│  - Create sales orders                 │
│  - View own schedule                   │
│  - Cannot manage users                 │
│  - Cannot view reports                 │
└────────────────────────────────────────┘
```

### Permission Matrix

| Action             | Owner | Admin | Pharmacist | Staff |
| ------------------ | ----- | ----- | ---------- | ----- |
| Create user        | ✅    | ✅    | ❌         | ❌    |
| Edit user          | ✅    | ✅\*  | ❌         | ❌    |
| Delete user        | ✅    | ✅\*  | ❌         | ❌    |
| Activate/Suspend   | ✅    | ✅\*  | ❌         | ❌    |
| View all users     | ✅    | ✅    | ❌         | ❌    |
| View own profile   | ✅    | ✅    | ✅         | ✅    |
| Create sales order | ✅    | ✅    | ✅         | ✅    |
| View reports       | ✅    | ✅    | ⚠️         | ❌    |
| Manage inventory   | ✅    | ✅    | ⚠️         | ❌    |

\*Admin cannot manage other Admins or Owners

---

## 📊 Account Status Lifecycle

```
┌────────────┐
│  ACTIVE    │  ← User can log in, use system
└────┬────────┘
     │
     ├─→ [DEACTIVATE] → ┌────────────┐
     │                  │ INACTIVE   │  ← User cannot log in
     │                  │ (Archived) │     Can be reactivated
     │                  └────────────┘
     │
     ├─→ [SUSPEND] ────→ ┌────────────┐
     │                   │ SUSPENDED  │  ← User cannot log in
     │                   │ (Temp)     │     Can be reactivated
     │                   └────────────┘
     │
     └─→ [DELETE] ─────→ ┌────────────┐
                         │ DELETED    │  ← Permanent removal
                         │ (Archive)  │     Cannot be undone
                         └────────────┘
```

---

## 📱 API Reference - User Management Module

### User Data Structure

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "string (1-100 chars)",
  "email": "string (valid email, unique)",
  "phone": "string (exactly 10 digits, unique)",
  "address": "string or null (optional)",
  "role": "owner" | "admin" | "pharmacist" | "staff",
  "status": "active" | "inactive" | "suspended",
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp"
}
```

### Request/Response Summary

| Method | Endpoint                   | Purpose          | Auth Required | Owner Only |
| ------ | -------------------------- | ---------------- | ------------- | ---------- |
| GET    | /api/users                 | Get all users    | ✅            | ✅         |
| GET    | /api/users/staff           | Get all staff    | ✅            | ✅         |
| GET    | /api/users/{id}            | Get user details | ✅            | ⚠️\*       |
| GET    | /api/users/{id}/schedule   | Get schedule     | ✅            | ⚠️\*       |
| POST   | /api/users                 | Create user      | ✅            | ✅         |
| PUT    | /api/users/{id}            | Update user      | ✅            | ✅         |
| DELETE | /api/users/{id}            | Delete user      | ✅            | ✅         |
| PATCH  | /api/users/{id}/activate   | Activate         | ✅            | ✅         |
| PATCH  | /api/users/{id}/deactivate | Deactivate       | ✅            | ✅         |
| PATCH  | /api/users/{id}/suspend    | Suspend          | ✅            | ✅         |

\*Can view own profile/schedule

---

## 🔐 Error Handling & HTTP Status Codes

| Status | Meaning      | Example Scenario                 |
| ------ | ------------ | -------------------------------- |
| 200    | OK           | User updated, retrieved          |
| 201    | Created      | New user created                 |
| 400    | Bad Request  | Missing required fields          |
| 401    | Unauthorized | No auth token provided           |
| 403    | Forbidden    | Not owner, can't change own role |
| 404    | Not Found    | User ID doesn't exist            |
| 409    | Conflict     | Email/phone already used         |
| 500    | Server Error | Database error                   |

---

## ⚠️ Business Rules & Validations

1. **Email Requirements**
   - Must be valid email format
   - Must be unique in system
   - Cannot be changed to existing email

2. **Phone Requirements**
   - Must be exactly 10 digits
   - Must be unique in system
   - Cannot be changed to existing phone

3. **Role Management**
   - Users cannot change their own role
   - Only Owner can create Owner accounts
   - Admin cannot manage other Admins

4. **Status Management**
   - Users cannot change their own status
   - Inactive users cannot log in
   - Suspended users cannot log in
   - Deleted users are permanently removed

5. **Account Creation**
   - Name is required (1-100 characters)
   - Email is required and unique
   - Phone is required (10 digits) and unique
   - Default status is "active"
   - Default role is "staff"

---

## 🎯 Common Workflows

### Workflow 1: Add New Pharmacy Staff

1. Owner logs in
2. Navigate to User Management
3. Click "Add New User"
4. Fill form: Name, Email, Phone, Address, Role, Status
5. Submit (POST /api/users)
6. Verify creation success
7. New staff can log in with provided email/password

### Workflow 2: Deactivate Employee (Temporary)

1. Owner views all staff
2. Find employee to deactivate
3. Click "Deactivate" action
4. Confirm deactivation (PATCH activate endpoint)
5. Employee cannot log in
6. Can reactivate later

### Workflow 3: Manage User Information

1. Owner searches for specific user
2. Click user to view details
3. Click "Edit" to modify
4. Update fields (email, phone must remain unique)
5. Save changes (PUT /api/users/{id})
6. Changes applied immediately

### Workflow 4: View Employee Schedule

1. Owner/Pharmacist views user details
2. Click "View Schedule"
3. System shows shifts for date range
4. Can see work hours and days off

---

## 📧 Audit Logging

All user management actions are logged:

- User created: Record timestamp, creator, new user details
- User updated: Record timestamp, modifier, changed fields
- User activated/deactivated/suspended: Record action, reason
- User deleted: Record timestamp, deleter, user details

Audit logs help track:

- Who made changes
- When changes were made
- What was changed
- Compliance requirements
