# PharmaFlow - Pharmacy Management System
## Tóm Tắt Toàn Bộ Dự Án Cho AI

> **Mục đích:** Tài liệu này cung cấp context đầy đủ về dự án PharmaFlow để AI khác có thể hiểu được kiến trúc, logic flow và cách thức hoạt động của hệ thống.

---

## 🏗️ Kiến Trúc Tổng Quan

### Công Nghệ Stack
- **Monorepo:** Turborepo v2.5.8 với PNPM workspace
- **Backend API:** Node.js + Express.js + Drizzle ORM + PostgreSQL
- **Frontend Web:** React + Vite + TailwindCSS + Radix UI
- **Database:** PostgreSQL với UUID v7 primary keys
- **Deployment:** Docker + GitLab CI/CD + Azure Cloud

### Cấu Trúc Thư Mục
```
g4-se1961-nj-swp391-fal25/
├── apps/
│   ├── api/           # Backend Express.js API
│   └── web/           # Frontend React App
├── packages/
│   ├── dto/           # Shared data transfer objects
│   └── repoconfig/    # Shared configurations
├── docs/              # OpenAPI documentation
└── scripts/           # Deployment scripts
```

---

## 🎯 Mô Tả Dự Án

**PharmaFlow** là hệ thống quản lý nhà thuốc toàn diện, bao gồm:

### Chức Năng Chính
1. **Quản lý người dùng & phân quyền**
2. **Quản lý thuốc & biến thể sản phẩm**
3. **Quản lý nhà cung cấp**
4. **Quản lý đơn đặt hàng (Purchase Orders)**
5. **Quản lý kho hàng & tồn kho**
6. **Hệ thống bán hàng (POS)**
7. **Quản lý ca làm việc**
8. **Báo cáo & phân tích**
9. **Quản lý khách hàng**

### Đối Tượng Sử Dụng
- **Owner/Admin:** Toàn quyền quản lý hệ thống
- **Staff:** Nhân viên bán hàng, quản lý kho cơ bản
- **Manager:** Quản lý cấp trung, có thể quản lý nhân viên và kho

---

## 🗄️ Database Schema & Logic

### Core Entities

#### 1. Users & Authentication
```javascript
// Enum definitions
userRole: ["owner", "staff"]
userStatus: ["active", "inactive", "suspended"]
userRegistrationStatus: ["pending", "approved", "rejected"]

// Users table
users {
  id: UUID (primary key)
  name: string
  email: string (unique)
  phone: string (unique)
  address: string
  status: userStatus
  role: userRole
  searchVector: tsvector (full-text search)
}

// Registration flow
userRegistrations {
  id: UUID
  name, email, phone, address: string
  status: userRegistrationStatus
  // First user becomes "owner", others need approval
}
```

#### 2. Medications & Variants
```javascript
// Medications (base products)
medications {
  id: UUID
  name: string
  brand: string
  description: text
  isPrescriptionRequired: boolean
  isControlledSubstance: boolean
  status: medicationStatus ["active", "inactive", "discontinued"]
  imageId: UUID (foreign key to files)
  searchVector: tsvector
}

// Medication variants (SKUs, different sizes/forms)
medicationVariants {
  id: UUID
  medicationId: UUID (foreign key)
  name: string
  sku: string (unique)
  barcode: string (unique)
  unit: string
  unitFactor: decimal (default 1.00)
  sellPrice: decimal
  isActive: boolean
  isForSale: boolean
}
```

#### 3. Suppliers & Procurement
```javascript
suppliers {
  id: UUID
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  taxCode: string
  status: supplierStatus ["active", "inactive", "blacklisted"]
}

// Supplier-Medication relationship
supplierMedicationVariants {
  id: UUID
  supplierId: UUID
  medicationVariantId: UUID
  unitCost: decimal
  leadTimeDays: integer
}

// Purchase Orders
purchaseOrders {
  id: UUID
  supplierId: UUID
  orderDate: date
  expectedDeliveryDate: date
  status: purchaseOrderStatus ["pending", "ordered", "received", "cancelled"]
  totalAmount: decimal
  notes: text
}

purchaseOrderItems {
  id: UUID
  purchaseOrderId: UUID
  medicationVariantId: UUID
  quantity: integer
  unitCost: decimal
  subtotal: decimal
}
```

#### 4. Inventory & Warehouse
```javascript
// Warehouse structure
warehouseZones {
  id: UUID
  name: string
  type: warehouseZoneType ["normal", "cold", "hazard", "quarantine"]
}

warehouseRacks {
  id: UUID
  zoneId: UUID
  code: string
}

warehouseBins {
  id: UUID
  rackId: UUID
  level: string
  number: string
}

// Inventory tracking
inventory {
  id: UUID
  medicationVariantId: UUID
  binId: UUID
  batchNumber: string
  manufactureDate: date
  expiryDate: date
  quantity: integer
  quantityReserved: integer
  unitCost: decimal
}
```

#### 5. Sales & POS
```javascript
customers {
  id: UUID
  name: string
  phone: string
  email: string
  address: string
  dateOfBirth: date
  loyaltyPoints: integer
}

salesOrders {
  id: UUID
  customerId: UUID (optional)
  orderDate: timestamp
  totalAmount: decimal
  paymentMethod: salesOrderPaymentMethod ["cash", "bank_transfer", "credit_card", "mobile_payment"]
  status: salesOrderStatus ["pending", "paid", "cancelled"]
  cashReceived: decimal
  changeGiven: decimal
  notes: text
  createdBy: UUID (staff user)
}

salesOrderItems {
  id: UUID
  salesOrderId: UUID
  medicationVariantId: UUID
  quantity: integer
  unitPrice: decimal
  discount: decimal
  subtotal: decimal
}
```

#### 6. Shift Management
```javascript
shifts {
  id: UUID
  name: string
  type: shiftType ["morning", "afternoon", "night", "full_day"]
  startTime: time
  endTime: time
  description: text
}

shiftAssignments {
  id: UUID
  userId: UUID
  shiftId: UUID
  assignedDate: date
  status: shiftAssignmentStatus ["scheduled", "confirmed", "in_progress", "completed", "cancelled", "absent"]
}
```

---

## 🔄 Business Logic Flow

### 1. User Registration & Authentication Flow
```
1. User registers → Creates userRegistration (status: pending)
2. If first user → Auto-approve as "owner"
3. Else → Admin reviews and approves/rejects
4. Approved → Creates user account (status: active)
5. User can login with JWT token
```

### 2. Inventory Management Flow
```
1. Create Purchase Order → Items with expected quantities
2. Receive goods → Create Purchase Receipt
3. For each received item:
   - Specify batch number, expiry date
   - Assign to warehouse bin location
   - Create inventory record
4. System tracks FEFO (First Expired, First Out)
5. Sales automatically deduct from oldest batches
```

### 3. Sales Process (POS) Flow
```
1. Staff searches medications (by name/barcode)
2. System shows available stock (FEFO order)
3. Add items to cart with quantities
4. Select customer (optional) or create new
5. Choose payment method:
   - Cash: Enter received amount, calculate change
   - VietQR: Generate QR code for mobile payment
6. Complete order → Creates salesOrder
7. System automatically:
   - Deducts inventory (FEFO)
   - Updates stock levels
   - Generates invoice
```

### 4. Warehouse Allocation Logic
```
- Products stored in: Zone → Rack → Bin structure
- FEFO principle: First Expired, First Out
- When selling, system automatically selects:
  1. Oldest expiry date first
  2. From available (non-reserved) stock
  3. Across multiple bins if needed
```

### 5. Purchase Order Workflow
```
1. Create PO → Status: "pending"
2. Send to supplier → Status: "ordered"
3. Receive goods → Create receipt → Status: "received"
4. Partial receipts supported → Status: "partially_received"
5. Can cancel anytime → Status: "cancelled"
```

---

## 🎨 Frontend Architecture

### React App Structure
```
src/
├── components/
│   ├── ui/              # Reusable UI components (Radix UI)
│   ├── layouts/         # App layout, sidebar, topbar
│   ├── dashboard/       # Dashboard-specific components
│   └── user-management/ # User management components
├── pages/
│   ├── auth/           # Login, register, forgot password
│   ├── medications/    # Medication CRUD
│   ├── sales/          # POS interface
│   ├── inventory/      # Stock management
│   ├── purchaseOrder/  # Purchase order management
│   └── shifts/         # Shift management
├── hooks/              # Custom React hooks for API calls
├── services/           # API service functions
└── lib/                # Utilities (axios, utils)
```

### Key Frontend Features

#### 1. Multi-Order POS System
```javascript
// Staff can manage multiple orders simultaneously
- Order tabs (Order #1, #2, #3...)
- Each order has separate:
  - Customer selection
  - Cart items
  - Payment method
  - Cash received amount
- Can duplicate orders
- Can switch between orders
- Complete orders independently
```

#### 2. Real-time Search & Autocomplete
```javascript
// Medication search with live results
- Search by name, variant, barcode
- Shows available quantity
- Filters out-of-stock items
- FEFO location information
- Add to cart with click
```

#### 3. Customer Management
```javascript
// Inline customer creation during sales
- Search existing customers
- Create new customer on-the-fly
- Minimal required info (name only)
- Auto-select after creation
```

#### 4. Payment Processing
```javascript
// Cash Payment
- Input in thousands (100 = 100,000 VND)
- Real-time change calculation
- Validation: change cannot be negative

// VietQR Payment
- Generate QR code with order details
- Display for customer to scan
- Manual confirmation by staff
```

---

## 🔐 Security & Access Control

### Role-Based Permissions
```javascript
// Owner (Admin)
- Full system access
- User management
- All CRUD operations
- System configuration

// Staff
- POS operations
- View inventory
- View own schedule
- Basic customer management

// Manager (Future)
- Staff management (limited)
- Inventory management
- Purchase orders
- Shift assignments
```

### Authentication Flow
```javascript
1. JWT token stored in localStorage
2. Token included in all API requests
3. Backend validates token on each request
4. Expired tokens → redirect to login
5. Protected routes check authentication
```

---

## 📊 Reporting & Analytics

### Available Reports
```javascript
// Daily Sales Report
- Today's revenue
- Transaction count
- Top selling products
- Hourly breakdown
- Payment method distribution

// Weekly/Monthly Sales
- Period comparisons
- Trend analysis
- Product performance

// Inventory Reports
- Current stock levels
- Low stock alerts
- Expiring products
- Inventory value

// Purchase Reports
- PO status tracking
- Supplier performance
- Cost analysis
```

### Dashboard Metrics
```javascript
// Key Performance Indicators
- Total orders (with trend %)
- Total revenue (VND format)
- Average order value
- Top 5 selling medications
- Sales by status breakdown
- Quick action buttons
```

---

## 🔧 API Endpoints Summary

### Authentication
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/logout       # User logout
POST /api/auth/forgot-password
POST /api/auth/verify-reset-otp
GET  /api/auth/me          # Get current user
```

### User Management
```
GET    /api/users          # List users (with filters)
POST   /api/users          # Create user
PUT    /api/users/:id      # Update user
DELETE /api/users/:id      # Delete user
PATCH  /api/users/:id/activate
PATCH  /api/users/:id/deactivate
PATCH  /api/users/:id/suspend
```

### Medications
```
GET    /api/medications                    # List medications
POST   /api/medications                    # Create medication(s)
GET    /api/medications/:id               # Get medication details
PATCH  /api/medications/:id               # Update medication
DELETE /api/medications/:id               # Delete medication
GET    /api/medications/:id/variants      # List variants
POST   /api/medications/:id/variants      # Create variant
```

### Sales (POS)
```
GET  /api/sales            # List sales orders
POST /api/sales            # Create sales order
GET  /api/sales/:id        # Get sales order details
```

### Inventory
```
GET    /api/inventory                     # List inventory
GET    /api/inventory/low-stock          # Low stock items
GET    /api/inventory/expiring           # Expiring items
PATCH  /api/inventory/batches/:id/adjust # Adjust quantity
POST   /api/inventory/move               # Move between bins
```

### Purchase Orders
```
GET  /api/purchases                      # List purchase orders
POST /api/purchases                      # Create purchase order
GET  /api/purchases/:id                  # Get PO details
POST /api/purchases/:id/receipts         # Create receipt
```

### Warehouse
```
GET  /api/warehouse/zones               # List zones
GET  /api/warehouse/zones/:id/racks     # List racks in zone
GET  /api/warehouse/racks/:id/bins      # List bins in rack
```

---

## 🚀 Deployment & DevOps

### Docker Setup
```yaml
# docker-compose.yml structure
services:
  api:          # Express.js backend
  web:          # React frontend (Nginx)
  postgres:     # PostgreSQL database
  redis:        # Caching (future)
```

### CI/CD Pipeline
```yaml
# GitLab CI/CD stages
- lint:        # Code quality checks
- test:        # Unit/integration tests
- build:       # Docker image builds
- deploy:      # Azure deployment
```

### Environment Configuration
```javascript
// API Environment Variables
DATABASE_URL=postgresql://...
JWT_SECRET=...
EMAIL_HOST=...
EMAIL_USER=...
EMAIL_PASS=...
GOOGLE_AI_API_KEY=...

// Web Environment Variables
VITE_API_URL=http://localhost:3001/api
```

---

## 🔍 Key Business Rules

### Inventory Management
1. **FEFO (First Expired, First Out):** Always sell oldest stock first
2. **Batch Tracking:** Every inventory item has batch number and expiry
3. **Location Tracking:** Items stored in Zone → Rack → Bin hierarchy
4. **Reserved Quantity:** Stock can be reserved for pending orders

### Sales Rules
1. **Stock Validation:** Cannot sell more than available quantity
2. **Price Validation:** Sell price must be positive
3. **Customer Optional:** Sales can be made without customer info
4. **Payment Validation:** Cash received must cover total amount

### User Management
1. **First User Rule:** First registered user becomes "owner"
2. **Approval Required:** Subsequent registrations need admin approval
3. **Unique Constraints:** Email and phone must be unique
4. **Role Restrictions:** Users cannot change their own role/status

### Purchase Orders
1. **Status Workflow:** pending → ordered → received → completed
2. **Partial Receipts:** Can receive items in multiple batches
3. **Cost Tracking:** Unit costs tracked per supplier per item
4. **Lead Time:** Suppliers have configurable lead times

---

## 🎯 Current Implementation Status

### ✅ Fully Implemented (96% complete)
- User authentication & management
- Medication catalog management
- Supplier management
- Purchase order workflow
- Inventory tracking with FEFO
- POS sales system
- Warehouse management
- Basic reporting
- Shift management
- Customer management

### 🚧 Planned Features
- AI-powered sales forecasting
- Advanced analytics dashboard
- Mobile app
- Barcode scanning
- Email notifications
- Receipt printing
- Multi-currency support

---

## 💡 Unique Features & Innovations

### 1. Multi-Order POS
- Staff can handle multiple customers simultaneously
- Each order tab maintains separate state
- Duplicate orders for similar purchases
- Seamless switching between orders

### 2. FEFO Inventory Management
- Automatic selection of oldest stock first
- Real-time location tracking
- Bin-level inventory management
- Expiry date monitoring

### 3. Flexible Medication Variants
- Single medication can have multiple variants (sizes, forms)
- Each variant has unique SKU and barcode
- Independent pricing and availability
- Supplier-specific costs

### 4. Integrated Workflow
- Purchase → Receipt → Inventory → Sales flow
- Automatic stock deduction on sales
- Real-time inventory updates
- Comprehensive audit trail

---

## 🔧 Technical Considerations

### Performance Optimizations
- Database indexing on search vectors
- React Query for API caching
- Lazy loading for large lists
- Debounced search inputs

### Data Integrity
- Foreign key constraints
- Unique constraints on critical fields
- Transaction-based operations
- Audit logging for critical actions

### Scalability
- UUID primary keys for distributed systems
- Modular monorepo architecture
- Stateless API design
- Horizontal scaling ready

### Security
- JWT-based authentication
- Role-based access control
- Input validation with Zod
- SQL injection prevention with Drizzle ORM

---

## 📝 Development Guidelines

### Code Standards
- ESLint + Prettier for formatting
- Conventional commits
- TypeScript-style JSDoc comments
- Modular service architecture

### Testing Strategy
- Unit tests with Vitest
- Integration tests for API endpoints
- E2E tests for critical user flows
- Test coverage reporting

### Database Migrations
- Drizzle Kit for schema management
- Version-controlled migrations
- Rollback capabilities
- Seed data for development

---

## 🎓 Learning Resources

### Key Technologies
- **Drizzle ORM:** Type-safe database queries
- **React Hook Form:** Form validation and state
- **TanStack Query:** Server state management
- **Radix UI:** Accessible component primitives
- **Turborepo:** Monorepo build system

### Business Domain
- Pharmacy operations and regulations
- Inventory management principles (FEFO/FIFO)
- Point of Sale (POS) systems
- Supply chain management
- Vietnamese business practices (VietQR, VND currency)

---

## 🎯 Conclusion

PharmaFlow là một hệ thống quản lý nhà thuốc hiện đại và toàn diện, được thiết kế với kiến trúc modular, có thể mở rộng và bảo trì dễ dàng. Hệ thống tích hợp đầy đủ các chức năng từ quản lý kho, bán hàng, đến báo cáo, với giao diện người dùng thân thiện và logic nghiệp vụ rõ ràng.

**Điểm mạnh chính:**
- Kiến trúc monorepo hiện đại với Turborepo
- Database schema được thiết kế tốt với full-text search
- POS system linh hoạt với multi-order support
- FEFO inventory management tự động
- Role-based access control chi tiết
- CI/CD pipeline hoàn chỉnh

**Phù hợp cho:** Nhà thuốc vừa và nhỏ, chuỗi nhà thuốc, các doanh nghiệp dược phẩm cần quản lý kho và bán hàng hiệu quả.

---

*Tài liệu này cung cấp đầy đủ context để AI khác có thể hiểu và làm việc với dự án PharmaFlow một cách hiệu quả.*