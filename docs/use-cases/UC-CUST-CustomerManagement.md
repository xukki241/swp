# Customer Management Use Cases

## Overview

Module quản lý thông tin khách hàng, lịch sử mua hàng và loyalty programs (tương lai).

---

## UC-CUST-001: Create Customer

**Mô tả:** (Staff) Tạo thông tin khách hàng mới trong hệ thống.

### Actors

- Staff, Manager

### Preconditions

- Người dùng đã đăng nhập

### Main Flow

1. Staff truy cập trang `/customers` hoặc trong POS page khi tạo order
2. Click button "Add Customer"
3. Modal/form hiển thị với các fields:
   - **Required**:
     - Full Name *
     - Phone Number *
   - **Optional**:
     - Email
     - Date of Birth
     - Gender (Male/Female/Other)
     - Address
     - Notes (VD: allergies, preferences)
4. Staff điền thông tin khách hàng
5. Click "Create Customer"
6. Hệ thống validate:
   - Name không trống
   - Phone number format hợp lệ (10-11 digits)
   - Phone number chưa tồn tại (unique)
   - Email format hợp lệ (nếu có)
7. Hệ thống tạo customer record với:
   - Generated customer_code: CUST-XXXXXX
   - Status: `active`
8. Success toast: "Khách hàng đã được tạo thành công"
9. Nếu tạo từ POS → auto-select customer cho order

### Alternative Flows

**A1: Duplicate phone number**

- Error: "Số điện thoại này đã được đăng ký"
- Suggest: "Tìm khách hàng hiện có?"
- Show existing customer info
- Option: Use existing customer

**A2: Invalid phone format**

- Error: "Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số."

**A3: Invalid email format**

- Error: "Email không hợp lệ"

**A4: Quick create during sale**

- Inline form trong POS page
- Chỉ nhập Name + Phone
- Tạo nhanh và auto-select

### Business Rules

1. **Phone Number**:
   - Required, unique
   - Format: 10-11 digits
   - Validation: Vietnamese phone number format
2. **Customer Code**:
   - Auto-generated: CUST-{6_random_digits}
   - Unique
3. **Email**: Optional, nhưng nếu có phải unique
4. **Date of Birth**: Used for birthday promotions (future)
5. **Status**: Default `active`, có thể set `inactive`

### API Endpoint

```http
POST /api/customers
Body: {
  name: string,
  phone: string,
  email?: string,
  date_of_birth?: date,
  gender?: string,
  address?: string,
  notes?: string
}

Response: {
  id: uuid,
  customer_code: string,
  name: string,
  phone: string,
  email: string,
  date_of_birth: date,
  gender: string,
  address: string,
  notes: string,
  status: string,
  created_at: timestamp
}
```

---

## UC-CUST-002: View Customer Profile & History

**Mô tả:** Xem chi tiết thông tin khách hàng và lịch sử mua hàng.

### Actors

- Staff, Manager, Admin

### Preconditions

- Customer tồn tại trong hệ thống

### Main Flow

1. Staff search customer bằng name/phone/customer_code
2. Click vào customer từ search results
3. Hệ thống redirect đến `/customers/:id`
4. Hiển thị customer profile page với:

#### **Customer Info Panel**

- **Profile Card**:
  - Customer Code
  - Full Name
  - Phone Number
  - Email
  - Date of Birth
  - Gender
  - Address
  - Status (Active/Inactive)
  - Member Since (created_at)
  - Last Purchase Date
- **Actions**:
  - Edit Info button
  - Deactivate/Activate button (Manager only)

#### **Purchase Statistics Panel**

- **Summary Cards**:
  - Total Orders: {count}
  - Total Spent: {amount} VNĐ
  - Average Order Value: {amount} VNĐ
  - Last Purchase: {date}
- **Charts**:
  - Purchase Frequency: Line chart (orders over time)
  - Top Purchased Categories: Pie chart

#### **Purchase History Table**

- **Columns**:
  - Order Number
  - Date
  - Items Count
  - Total Amount
  - Payment Method
  - Status
  - Actions (View Order Detail)
- **Features**:
  - Sort by date (newest first)
  - Filter by date range
  - Filter by payment method
  - Pagination (20 orders/page)
  - Export to Excel

#### **Favorite Products Panel**

- List of most purchased medications
- Shows: Product name, Times purchased, Last purchase date
- Click to view product detail

#### **Notes Section**

- Display customer notes (allergies, preferences)
- Edit notes button (staff can add/edit)

### Alternative Flows

**A1: Customer has no purchase history**

- Display empty state: "Khách hàng này chưa có lịch sử mua hàng"
- Show button: "Create First Order"

**A2: Customer inactive**

- Display banner: "Khách hàng này đã bị deactivate"
- Show reason (if available)
- Option to reactivate (Manager only)

### Features

#### **Search Customer**

- Search by:
  - Customer Code
  - Phone Number (exact or partial)
  - Name (full-text search)
- Autocomplete suggestions
- Show top 10 results

#### **Edit Customer Info**

1. Click "Edit" button
2. Form pre-filled với current data
3. Staff có thể sửa:
   - Name
   - Email
   - Date of Birth
   - Gender
   - Address
   - Notes
4. Cannot edit: Phone (unique identifier)
5. Click "Save"
6. Validate và update
7. Success toast

#### **Deactivate Customer** (Manager)

1. Click "Deactivate" button
2. Modal: "Lý do deactivate (optional)"
3. Click "Confirm"
4. Status → `inactive`
5. Customer không xuất hiện trong active search results

### API Endpoints

```http
# Get customer profile
GET /api/customers/:id
Response: {
  id, customer_code, name, phone, email, date_of_birth,
  gender, address, notes, status, created_at,
  total_orders, total_spent, avg_order_value, last_purchase_date
}

# Get customer purchase history
GET /api/customers/:id/orders?page=1&limit=20&from=&to=
Response: {
  orders: [...],
  pagination: { total, page, limit }
}

# Get customer purchase statistics
GET /api/customers/:id/statistics
Response: {
  total_orders, total_spent, avg_order_value,
  orders_by_month: [...],
  top_categories: [...],
  favorite_products: [...]
}

# Update customer
PATCH /api/customers/:id
Body: { name, email, date_of_birth, gender, address, notes }

# Deactivate customer
PATCH /api/customers/:id/deactivate
Body: { reason }

# Reactivate customer
PATCH /api/customers/:id/activate
```

---

## Database Schema

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  customer_code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  date_of_birth DATE,
  gender VARCHAR(20),
  address TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active',
  deactivate_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_purchase_at TIMESTAMP,
  INDEX idx_customer_code (customer_code),
  INDEX idx_phone (phone),
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_name (name) -- For full-text search
);

-- Full-text search index (PostgreSQL)
CREATE INDEX idx_customers_name_fts ON customers USING gin(to_tsvector('english', name));

-- Sales table already has customer_id foreign key
-- ALTER TABLE sales ADD COLUMN customer_id UUID REFERENCES customers(id);
```

---

## Business Rules

1. **Customer Code Format**: CUST-{6_random_digits}
   - Example: CUST-123456
   - Unique, auto-generated

2. **Phone Number**:
   - Required, unique
   - Vietnamese format: 10-11 digits
   - Examples: 0912345678, 0912 345 678

3. **Email**:
   - Optional
   - Must be unique if provided
   - Validation: RFC 5322 format

4. **Status**:
   - `active`: Can purchase, visible in search
   - `inactive`: Cannot purchase (soft delete), hidden by default

5. **Purchase Statistics**:
   - Auto-calculated from sales table
   - Updated after mỗi purchase
   - Cache for performance

6. **Data Retention**:
   - Customer data giữ vĩnh viễn (không hard delete)
   - Purchase history giữ vĩnh viễn
   - Deactivated customers vẫn có data

---

## UI Components

### Pages

- `/customers` - Customer list page
- `/customers/:id` - Customer profile & history page

### Components

- `CustomerListTable` - Danh sách customers
- `CustomerSearchBar` - Search với autocomplete
- `CustomerForm` - Create/Edit form
- `CustomerProfileCard` - Customer info display
- `PurchaseStatisticsPanel` - Statistics summary
- `PurchaseHistoryTable` - Orders table
- `FavoriteProductsList` - Top purchased products
- `CustomerNotesEditor` - Notes section

---

## Integration Points

1. **Sales Module**:
   - Link customer to sale orders
   - Update last_purchase_at after sale
   - Calculate purchase statistics

2. **Reporting Module**:
   - Customer segmentation reports
   - Top customers by spending
   - Customer lifetime value (CLV)

3. **Marketing** (Future):
   - Birthday promotions
   - Loyalty programs
   - Email marketing campaigns

4. **AI Analytics** (Future):
   - Customer behavior prediction
   - Personalized recommendations
   - Churn prediction

---

## Testing Checklist

- [ ] Create customer với full info
- [ ] Create customer với only required fields (name + phone)
- [ ] Create customer với duplicate phone → error
- [ ] Create customer với invalid phone format → error
- [ ] Create customer với invalid email → error
- [ ] Quick create customer during sale
- [ ] Search customer by phone (exact)
- [ ] Search customer by phone (partial)
- [ ] Search customer by name (full-text)
- [ ] Search customer by customer code
- [ ] View customer profile
- [ ] View customer purchase history
- [ ] View customer statistics
- [ ] Purchase frequency chart displayed
- [ ] Top categories chart displayed
- [ ] Favorite products list shown
- [ ] Edit customer info successfully
- [ ] Cannot edit phone number
- [ ] Deactivate customer (Manager)
- [ ] Deactivate as Staff → error (unauthorized)
- [ ] Reactivate customer
- [ ] Inactive customer hidden in default search
- [ ] Customer with no orders → empty state
- [ ] Export purchase history to Excel
- [ ] Filter purchase history by date range
- [ ] Sort purchase history by date
- [ ] Pagination working
- [ ] Customer code auto-generated
- [ ] Last purchase date updated after sale
- [ ] Statistics updated after sale

---

## Future Enhancements

1. **Loyalty Program**:
   - Points system
   - Tier levels (Bronze, Silver, Gold)
   - Rewards redemption

2. **Customer Segmentation**:
   - RFM analysis (Recency, Frequency, Monetary)
   - VIP customers
   - At-risk customers

3. **Marketing Automation**:
   - Birthday greetings & promotions
   - Win-back campaigns
   - Email/SMS notifications

4. **Customer Portal**:
   - Self-service account
   - Order history view
   - Prescription uploads

5. **Advanced Analytics**:
   - Customer lifetime value (CLV)
   - Churn prediction
   - Next-best-action recommendations

---

## Privacy & Compliance

1. **Data Protection**:
   - Encrypt sensitive data (email, phone, address)
   - Access control: Only authorized staff
   - Audit log for data access

2. **GDPR/PDPA Compliance** (if applicable):
   - Right to access: Customer can request their data
   - Right to erasure: Soft delete with anonymization option
   - Data portability: Export customer data

3. **Consent Management**:
   - Opt-in for marketing communications
   - Track consent history
   - Easy opt-out mechanism

---

## Error Codes

| Code | Message | HTTP Status |
|------|---------|-------------|
| CUST_001 | Customer not found | 404 |
| CUST_002 | Phone number already exists | 409 |
| CUST_003 | Invalid phone number format | 400 |
| CUST_004 | Invalid email format | 400 |
| CUST_005 | Email already exists | 409 |
| CUST_006 | Unauthorized action | 403 |
| CUST_007 | Customer inactive | 400 |

---

## Performance Considerations

1. **Database Indexes**:
   - Index on phone, email, customer_code
   - Full-text search index on name
   - Index on status for filtered queries

2. **Caching**:
   - Cache customer statistics (Redis)
   - TTL: 1 hour
   - Invalidate on new purchase

3. **Pagination**:
   - Purchase history: 20 items/page
   - Customer list: 50 items/page

4. **Lazy Loading**:
   - Load statistics only when viewing profile
   - Load purchase history on demand

---

## Related Use Cases

- UC-SALE-001: Create Sale Order (links customer to sale)
- UC-SALE-007: Quick Sale (no customer required)
- UC-DASH-001: Dashboard (customer analytics)
- UC-AI-001: AI Insights (customer segmentation)
