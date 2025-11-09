# Core Modules Documentation Index

## 📚 Complete Module Documentation

This folder contains comprehensive documentation for the main pharmacy system modules with detailed workflows, API specifications, and data structures.

---

## 🏪 Sales Module

**File:** `SALES_MODULE_DETAILED.md`

### What's Included:

- ✅ Complete sales workflow (5 phases)
- ✅ Customer selection and creation
- ✅ Medication search and cart management
- ✅ Payment processing (Cash & VietQR)
- ✅ Order status lifecycle
- ✅ Invoice email system
- ✅ All API endpoints with request/response examples
- ✅ HTTP status codes and error handling
- ✅ Frontend state management
- ✅ Common workflows and edge cases

### Key Concepts:

1. **Order Creation**: Create sales orders with customer, medications, and payment details
2. **Payment Methods**: Cash with change calculation, VietQR for mobile payments
3. **Inventory Management**: Stock checking and quantity validation
4. **Email Notifications**: Automatic invoice emails to customers on payment
5. **Order History**: View, filter, and sort sales orders

### Main Endpoints:

- `POST /api/sales` - Create new order
- `GET /api/sales` - List orders with filters
- `GET /api/sales/{id}` - Get order details
- `PATCH /api/sales/{id}` - Update order status
- `DELETE /api/sales/{id}` - Cancel order

---

## 👥 User Management Module

**File:** `USER_MANAGEMENT_DETAILED.md`

### What's Included:

- ✅ Complete user management workflow (5 phases)
- ✅ View all staff accounts with filtering
- ✅ Create new user accounts
- ✅ Edit/update user information
- ✅ Account status management (Activate/Deactivate/Suspend)
- ✅ View user details and work schedule
- ✅ Role-based permissions matrix
- ✅ All API endpoints with examples
- ✅ User lifecycle and status transitions
- ✅ Error handling and validation rules

### Key Concepts:

1. **User Roles**: Owner, Admin, Pharmacist, Staff with hierarchical permissions
2. **Account Status**: Active, Inactive, Suspended states
3. **Access Control**: Owner can manage all users, self-modification restrictions
4. **Validation**: Email/Phone uniqueness, format validation
5. **Audit Logging**: Track all user management actions

### Main Endpoints:

- `GET /api/users` - List all users
- `GET /api/users/staff` - List staff with filters
- `GET /api/users/{id}` - Get user details
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `PATCH /api/users/{id}/activate` - Activate account
- `PATCH /api/users/{id}/deactivate` - Deactivate account
- `PATCH /api/users/{id}/suspend` - Suspend account
- `GET /api/users/{id}/schedule` - Get work schedule

---

## 🔄 Data Flow Summary

### Sales Module Flow:

```
Customer → Medications → Payment → Order Created
   ↓           ↓           ↓           ↓
[Search/   [Search &    [Payment    [Order
 Create]   Add to Cart] Processing] Updated]
                                       ↓
                              [Email Notification]
```

### User Management Flow:

```
View Users → Create/Edit/Delete → Status Changes → Audit Log
    ↓              ↓                    ↓              ↓
[List all]    [User CRUD]    [Active/Inactive]  [Track Changes]
```

---

## 📊 Common API Response Structures

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": {
    /* resource object */
  }
}
```

### Success Response (200 OK - List)

```json
{
  "success": true,
  "data": [
    /* array of resources */
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3,
    "hasMore": true
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": [
    /* optional detailed errors */
  ]
}
```

---

## 🔐 Authentication & Authorization

All endpoints require:

- **Authentication**: Bearer token in `Authorization` header
- **Role-based Access**: Different endpoints have different permission requirements

### Authentication Header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Authorization Levels:

- **Public**: No auth required (login endpoint only)
- **Authenticated**: Any logged-in user
- **Owner Only**: Only store manager/owner
- **Self/Owner**: Own profile or owner

---

## ⚠️ Important Validations

### Email Validation

- Must be valid email format (user@domain.com)
- Must be unique in system
- Cannot be empty when creating customer but CAN be empty → null for optional

### Phone Validation

- Must be exactly 10 digits (0901234567)
- Must be unique in system
- Can be empty (treated as null)

### Name Validation

- Required for both customers and users
- 1-100 characters
- Cannot be empty or whitespace only

### Quantity Validation

- Must be positive integer (> 0)
- Cannot exceed available stock
- Decimal quantities not allowed

---

## 🎯 Key Dates & Timestamps

All timestamps in responses use ISO 8601 format:

```
2025-11-09T10:30:00Z
```

---

## 📱 Frontend Integration

### Sales Page

- Located at: `/pages/sales/SalesPage.jsx`
- Handles: Order creation, payment processing, success modal
- Components: CustomerSelector, MedicationSearch, VietQRPaymentDialog

### User Management Page

- Location: `/pages/admin/UserManagement.jsx`
- Handles: User CRUD, status management, filtering
- Components: UserList, UserForm, StatusButtons

---

## 🚀 Getting Started

1. **For Sales Operations**: Read `SALES_MODULE_DETAILED.md`
   - Understand the complete order workflow
   - Review API requirements and responses
   - Check payment method implementations

2. **For Admin Operations**: Read `USER_MANAGEMENT_DETAILED.md`
   - Understand user roles and permissions
   - Review user lifecycle and status management
   - Check validation rules and error cases

3. **For API Integration**:
   - Check the appropriate module documentation
   - Review request/response formats
   - Note any required headers or parameters
   - Handle error responses according to HTTP status codes

---

## 🔗 Related Documentation

Other relevant documentation:

- **EMPTY_STRING_VALIDATION_FIX.md** - Schema validation fix for optional fields
- **API_DOCUMENTATION.md** - Complete API reference
- **CUSTOMER_CREATION_REQUIREMENTS.md** - Customer field specifications
- **ERROR_RESPONSE_FORMAT.md** - Standard error response format

---

## 💡 Tips & Best Practices

1. **Always validate** required fields before submitting
2. **Handle errors** gracefully with user-friendly messages
3. **Check uniqueness** for email/phone before creation
4. **Track order status** changes for audit logging
5. **Test edge cases** like insufficient stock, duplicate entries
6. **Use pagination** for large data sets (default limit: 100)
7. **Include timestamps** for audit trails

---

## ❓ FAQ

**Q: Can customers have empty email/phone?**
A: Yes! Empty strings are converted to null in database. Only name is required.

**Q: Can users be permanently deleted?**
A: Yes, DELETE endpoint permanently removes users. Cannot be undone.

**Q: What's the difference between Deactivate and Suspend?**
A: Both prevent login. Deactivate = account inactive (archived). Suspend = temporary block.

**Q: Can a user change their own role?**
A: No. The PUT endpoint prevents self-role-change for security.

**Q: How are invoices sent to customers?**
A: Automatically when order status changes to "paid" and customer has email.

---

## 📞 Support

For issues or questions about:

- **API Endpoints**: Check specific module docs
- **Error Codes**: See error handling sections
- **Workflows**: Review phase-by-phase diagrams
- **Data Structures**: Check API reference tables

---

**Last Updated:** November 9, 2025  
**Documentation Version:** 2.0
