# Quick Reference Card - API & Workflows

## 🚀 Quick Start - Sales Order

### Minimal Flow
```
1. POST /api/customers (create if needed)
   ↓
2. POST /api/sales (create order)
   ↓
3. PATCH /api/sales/{id} (mark as paid)
   ↓
✅ Done! Invoice sent to customer
```

### Request Examples

**Create Customer (Optional)**
```bash
POST /api/customers
{
  "name": "Vy",
  "email": "",           # Can be empty
  "phone": "0372328467"
}
→ Response: 201 Created
```

**Create Sales Order**
```bash
POST /api/sales
{
  "customer_id": "uuid-cust",
  "payment_method": "cash",
  "items": [
    {"medication_variant_id": "uuid-var", "quantity": 2}
  ]
}
→ Response: 201 Created with order details
```

**Mark as Paid**
```bash
PATCH /api/sales/{orderId}
{
  "status": "paid"
}
→ Response: 200 OK + Invoice email sent
```

---

## 👥 Quick Start - Create User

### Minimal Flow
```
1. POST /api/users (create user)
   ↓
2. PATCH /api/users/{id}/activate (if needed)
   ↓
✅ Done! User can log in
```

### Request Examples

**Create User**
```bash
POST /api/users
{
  "name": "Nguyễn Văn A",
  "email": "nguyena@pharmacy.com",
  "phone": "0901234567",
  "role": "pharmacist",
  "status": "active"
}
→ Response: 201 Created
```

**Activate User**
```bash
PATCH /api/users/{userId}/activate
→ Response: 200 OK with updated user
```

---

## 📊 Common Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success (GET, PATCH) | Proceed normally |
| 201 | Created (POST) | Resource created successfully |
| 400 | Bad Request | Check request format/required fields |
| 401 | Unauthorized | Add auth token to header |
| 403 | Forbidden | Check permissions (Owner only?) |
| 404 | Not Found | Check ID exists |
| 409 | Conflict | Email/Phone already used, insufficient stock |
| 500 | Server Error | Server problem, retry later |

---

## 🔑 Required Headers

```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

---

## 📋 Field Validations at a Glance

### Customer Fields
| Field | Required | Rules | Empty Allowed |
|-------|----------|-------|---------------|
| name | ✅ | 1-100 chars | ❌ |
| email | ❌ | Valid email format | ✅ (→ null) |
| phone | ❌ | Exactly 10 digits | ✅ (→ null) |
| address | ❌ | Any string | ✅ (→ null) |

### User Fields
| Field | Required | Rules | Notes |
|-------|----------|-------|-------|
| name | ✅ | 1-100 chars | - |
| email | ✅ | Unique, valid format | Must be unique |
| phone | ✅ | Unique, 10 digits | Must be unique |
| address | ❌ | Any string | Optional |
| role | ✅ | owner/admin/pharmacist/staff | - |
| status | ✅ | active/inactive/suspended | Default: active |

---

## 🔍 Quick Lookup - All Endpoints

### Sales Endpoints
```
POST   /api/sales               Create order
GET    /api/sales               List orders (paginated)
GET    /api/sales/{id}          Get order details
PATCH  /api/sales/{id}          Update order status
DELETE /api/sales/{id}          Cancel order
```

### Customer Endpoints
```
POST   /api/customers           Create customer
GET    /api/customers           List customers (paginated)
GET    /api/customers/{id}      Get customer details
PATCH  /api/customers/{id}      Update customer
DELETE /api/customers/{id}      Delete customer
```

### User Endpoints
```
POST   /api/users               Create user
GET    /api/users               List all users
GET    /api/users/staff         List staff
GET    /api/users/{id}          Get user details
PUT    /api/users/{id}          Update user
DELETE /api/users/{id}          Delete user
PATCH  /api/users/{id}/activate      Activate user
PATCH  /api/users/{id}/deactivate    Deactivate user
PATCH  /api/users/{id}/suspend       Suspend user
GET    /api/users/{id}/schedule      Get work schedule
```

---

## 💡 Common Scenarios & Solutions

### Scenario 1: Create customer without email
```json
{
  "name": "Customer Name",
  "email": "",              // ← Can be empty!
  "phone": "0901234567"
}
```
✅ Works! Email becomes null in database

### Scenario 2: Customer email already exists
```
Response: 409 Conflict
{
  "message": "Khách hàng với email '...' đã tồn tại"
}
```
✅ Expected! Create without email or use existing customer

### Scenario 3: Order has insufficient stock
```
Response: 409 Conflict
{
  "message": "Không đủ hàng trong kho"
}
```
✅ Expected! Reduce quantity or use different variant

### Scenario 4: Cannot change own role as user
```
Response: 403 Forbidden
{
  "message": "You cannot change your own role"
}
```
✅ Expected! Another Owner must change your role

---

## 📈 Pagination Usage

### List Request with Pagination
```bash
GET /api/sales?page=1&limit=50&status=paid&sortBy=orderDate&sortOrder=desc

Response:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3,
    "hasMore": true
  }
}
```

### Default Values
- Page: 1
- Limit: 100
- Max Limit: 100
- Sort By: Most recent first

---

## 🎯 Role Permissions Quick Chart

```
                  Owner  Admin  Pharmacist  Staff
Create Order      ✅     ✅        ✅        ✅
View Orders       ✅     ✅        ✅        ✅
Update Status     ✅     ✅        ✅        ❌
Create Customer   ✅     ✅        ✅        ❌
Manage Users      ✅     ✅        ❌        ❌
View Reports      ✅     ✅        ⚠️        ❌
View Inventory    ✅     ✅        ⚠️        ❌
```

---

## ⚙️ Order Status Flow

```
PENDING → PAID → CANCELLED
(default) (mark paid) (cancel)
```

### Status Meanings
- **PENDING**: Created, awaiting payment
- **PAID**: Payment confirmed, ready for delivery
- **CANCELLED**: Order cancelled, no payment

---

## 👤 User Account Status Flow

```
ACTIVE ⟷ INACTIVE ⟷ SUSPENDED
 (login)  (no login)  (no login)
   │                    │
   └────→ DELETED ←─────┘
         (permanent)
```

### Status Meanings
- **ACTIVE**: User can log in and use system
- **INACTIVE**: User cannot log in (temporary)
- **SUSPENDED**: User cannot log in (temporary)
- **DELETED**: Permanently removed (cannot undo)

---

## 🔄 Data Type Formats

### UUID Format
```
550e8400-e29b-41d4-a716-446655440000
```

### Email Format
```
user@domain.com
```

### Phone Format
```
0901234567  (exactly 10 digits)
```

### Date Format (ISO 8601)
```
2025-11-09T10:30:00Z
```

### Date Format (Query Parameter)
```
2025-11-09
```

### Amount Format (in Dong, no decimals)
```
75000  (75,000₫)
225000 (225,000₫)
```

---

## 🚨 Error Message Cheat Sheet

### Customer Creation Errors
| Message | Cause | Solution |
|---------|-------|----------|
| Tên khách hàng là bắt buộc | Empty name | Provide customer name |
| Email đã tồn tại | Email in use | Use different email |
| SĐT đã tồn tại | Phone in use | Use different phone |
| SĐT không hợp lệ | Wrong format | Use 10-digit format |

### Order Creation Errors
| Message | Cause | Solution |
|---------|-------|----------|
| Không đủ hàng | Low stock | Reduce quantity |
| Khách hàng không tồn tại | Invalid ID | Check customer ID |
| Không có sản phẩm | Empty items | Add medications |

### User Creation Errors
| Message | Cause | Solution |
|---------|-------|----------|
| Email bắt buộc | Missing email | Provide email |
| SĐT bắt buộc | Missing phone | Provide phone |
| Email đã tồn tại | Email in use | Use different email |
| You cannot change your own role | Self-edit | Ask another Owner |

---

## ✨ Pro Tips

1. **Always include auth token** - Every API call needs Bearer token
2. **Check pagination** - Large datasets need page navigation
3. **Validate locally first** - Check fields before sending to API
4. **Handle 409 errors** - Often mean data conflict (duplicate, insufficient stock)
5. **Use status filters** - For sales: `status=paid`, for users: `status=active`
6. **Remember sort order** - Default is newest first (desc)
7. **Empty email/phone allowed** - They become null, not error
8. **Check permissions** - Some actions Owner only

---

## 📚 Full Documentation

For complete details, see:
- `SALES_MODULE_DETAILED.md` - Sales workflows & endpoints
- `USER_MANAGEMENT_DETAILED.md` - User management workflows
- `MODULES_DOCUMENTATION_INDEX.md` - Overview & navigation

---

**Quick Reference Card Version:** 1.0  
**Last Updated:** November 9, 2025
