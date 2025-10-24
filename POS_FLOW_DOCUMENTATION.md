# POS (Point of Sale) Flow Documentation

**System**: PharmaFlow  
**Module**: Sales/POS  
**Last Updated**: October 21, 2025  
**Version**: 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [User Flow](#user-flow)
4. [Technical Flow](#technical-flow)
5. [Components](#components)
6. [API Integration](#api-integration)
7. [Inventory Management](#inventory-management)
8. [Error Handling](#error-handling)
9. [Business Rules](#business-rules)

---

## Overview

POS (Point of Sale) là module cho phép nhân viên bán hàng tạo đơn hàng cho khách hàng tại quầy. Module này xử lý toàn bộ quy trình từ tìm kiếm sản phẩm, thêm vào giỏ hàng, chọn khách hàng, chọn phương thức thanh toán, và hoàn tất đơn hàng.

### Key Features

- 🔍 **Product Search**: Tìm kiếm thuốc theo tên hoặc SKU
- 🛒 **Shopping Cart**: Quản lý giỏ hàng với tăng/giảm số lượng
- 👤 **Customer Management**: Chọn khách hàng hoặc tạo mới nhanh
- 💳 **Payment Methods**: Hỗ trợ nhiều phương thức thanh toán (tiền mặt, thẻ, chuyển khoản, ví điện tử)
- 📦 **Automatic Inventory**: Tự động reserve và deduct inventory khi tạo đơn
- 🧾 **Invoice Generation**: Tự động tạo hóa đơn khi hoàn tất đơn hàng

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        POSPage                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                     usePOS Hook                       │  │
│  │  • Cart State Management                             │  │
│  │  • Customer Selection                                │  │
│  │  • Payment Method                                    │  │
│  │  • Order Processing Logic                            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │  Customer    │  │   Product    │  │     Cart       │   │
│  │  Selector    │  │   Search     │  │   Component    │   │
│  └──────────────┘  └──────────────┘  └────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Checkout Panel                         │   │
│  │  • Payment Method Selection                        │   │
│  │  • Complete Order Button                           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Sales Service │
                    └───────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   API Layer   │
                    │ POST /api/sales│
                    └───────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  salesOrderService      │
              │  • Validate Items       │
              │  • Check Inventory      │
              │  • Reserve Stock (FEFO) │
              │  • Create Order         │
              │  • Create Order Items   │
              └─────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Database    │
                    │  Transaction  │
                    └───────────────┘
```

---

## User Flow

### 1. Khởi Động POS

```
User clicks "POS" in sidebar
    ↓
System loads POSPage
    ↓
Display empty cart and search interface
```

### 2. Chọn Khách Hàng

```
User searches for customer by name/phone/email
    ↓
System displays matching customers
    ↓
User selects existing customer
    OR
User clicks "New Customer"
    ↓
User fills customer form (name*, email, phone, address)
    ↓
System creates customer
    ↓
System auto-selects new customer
```

**Fields:**

- Name (Required)
- Email (Optional)
- Phone (Optional)
- Address (Optional)

### 3. Tìm Kiếm và Thêm Sản Phẩm

```
User enters product name or SKU in search box
    ↓
User presses Enter or clicks Search button
    ↓
System queries medications API
    ↓
Display results with:
    • Product name
    • SKU
    • Sell price
    • Available stock quantity
    ↓
User clicks "Add" button
    ↓
System adds product to cart
    • If product exists in cart: quantity++
    • If new product: add with quantity = 1
    ↓
Display success toast
    ↓
Clear search results
```

### 4. Quản Lý Giỏ Hàng

#### 4.1. Tăng Số Lượng

```
User clicks "+" button
    ↓
System checks if quantity < available stock
    ↓
If valid: increase quantity
    ↓
Update cart total
```

#### 4.2. Giảm Số Lượng

```
User clicks "-" button
    ↓
System checks if quantity > 1
    ↓
If valid: decrease quantity
    ↓
Update cart total
```

#### 4.3. Nhập Số Lượng Trực Tiếp

```
User enters quantity in input field
    ↓
System validates:
    • Must be >= 1
    • Must be <= available stock
    ↓
Update quantity
    ↓
Update cart total
```

#### 4.4. Xóa Sản Phẩm

```
User clicks trash icon
    ↓
System removes item from cart
    ↓
Display info toast
    ↓
Update cart total
```

### 5. Chọn Phương Thức Thanh Toán

```
User views 4 payment options:
    • Cash (Tiền mặt)
    • Credit Card (Thẻ tín dụng)
    • Bank Transfer (Chuyển khoản)
    • Mobile Payment (Ví điện tử)
    ↓
User clicks desired payment method
    ↓
System highlights selected method
```

### 6. Hoàn Tất Đơn Hàng

```
User clicks "Complete Order" button
    ↓
System validates:
    ✓ Customer selected?
    ✓ Cart not empty?
    ↓
If invalid: show error toast
    ↓
If valid:
    System shows "Processing..." on button
        ↓
    System calls processOrder()
        ↓
    Backend validates and processes
        ↓
    Show success toast
        ↓
    Clear cart
        ↓
    Clear selected customer
        ↓
    Reset payment method to cash
```

---

## Technical Flow

### Frontend Flow (POSPage → usePOS Hook)

#### 1. Initialize State

```javascript
const usePOS = () => {
  const [cart, setCart] = useState([]); // Array of cart items
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);

  // ... functions
};
```

#### 2. Add to Cart Function

```javascript
const addToCart = useCallback((medication) => {
  setCart((prev) => {
    // Check if item already exists
    const existingItem = prev.find(
      (item) => item.medication_variant_id === medication.id
    );

    if (existingItem) {
      // Increase quantity
      return prev.map((item) =>
        item.medication_variant_id === medication.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

    // Add new item
    return [
      ...prev,
      {
        medication_variant_id: medication.id,
        quantity: 1,
        name: medication.name,
        sku: medication.sku,
        unitPrice: medication.sellPrice,
        availableStock: medication.availableQuantity || 0,
      },
    ];
  });

  toast.success(`Added ${medication.name} to cart`);
}, []);
```

#### 3. Process Order Function

```javascript
const processOrder = useCallback(async () => {
  // Validation
  if (!selectedCustomer) {
    toast.error("Please select a customer");
    return false;
  }

  if (cart.length === 0) {
    toast.error("Cart is empty");
    return false;
  }

  setIsProcessing(true);

  try {
    // Prepare order data
    const orderData = {
      customer_id: selectedCustomer.id,
      payment_method: paymentMethod,
      items: cart.map((item) => ({
        medication_variant_id: item.medication_variant_id,
        quantity: item.quantity,
      })),
    };

    // Call API
    const response = await salesService.createSalesOrder(orderData);

    // Success
    toast.success("Order created successfully!");
    clearCart();
    return response.data;
  } catch (error) {
    // Error handling
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Failed to create order";
    toast.error(errorMessage);
    return false;
  } finally {
    setIsProcessing(false);
  }
}, [selectedCustomer, cart, paymentMethod, clearCart]);
```

### Backend Flow (API → Service → Database)

#### 1. API Endpoint

```javascript
// POST /api/sales
salesOrderRouter.post(
  "/",
  authenticate, // Check JWT token
  validateBody(createSalesOrderRequestSchema), // Validate request body
  salesOrderController.create // Handle request
);
```

#### 2. Controller Layer

```javascript
export const salesOrderController = {
  create: asyncHandler(async (req, res) => {
    const userId = req.user?.id; // Get from JWT
    const order = await salesOrderService.create(req.body, userId);

    res.status(201).json({
      success: true,
      message: "Sales order created successfully",
      data: order,
    });
  }),
};
```

#### 3. Service Layer - Transaction Logic

```javascript
async create(orderData, userId) {
  return await db.transaction(async (tx) => {
    const { items, ...soData } = orderData;

    // STEP 1: Validate Items and Check Inventory
    // ==========================================

    if (!items || items.length === 0) {
      throw new Error("Sales order must have at least one item");
    }

    const itemsToCreate = [];
    let totalAmount = 0;

    for (const item of items) {
      const { medication_variant_id, quantity } = item;

      // 1.1: Get medication variant details
      const variant = await tx.query.medicationVariants.findFirst({
        where: eq(medicationVariants.id, medication_variant_id),
        columns: {
          id: true,
          name: true,
          sku: true,
          sellPrice: true,
          isForSale: true,
          isActive: true,
        },
      });

      // 1.2: Validate variant exists
      if (!variant) {
        throw new Error(
          `Medication variant with ID ${medication_variant_id} not found`
        );
      }

      // 1.3: Check if variant is available for sale
      if (!variant.isActive || !variant.isForSale) {
        throw new Error(
          `Medication variant ${variant.name} (${variant.sku}) is not available for sale`
        );
      }

      // STEP 2: Check Inventory Availability (FEFO)
      // ============================================

      // Get available inventory ordered by expiry date (First Expired First Out)
      const availableInventory = await tx
        .select({
          id: inventory.id,
          quantity: inventory.quantity,
          quantityReserved: inventory.quantityReserved,
          quantityAvailable:
            sql`${inventory.quantity} - ${inventory.quantityReserved}`.as(
              "quantity_available"
            ),
          expiryDate: inventory.expiryDate,
          batchNumber: inventory.batchNumber,
        })
        .from(inventory)
        .where(
          and(
            eq(inventory.medicationVariantId, medication_variant_id),
            sql`${inventory.quantity} - ${inventory.quantityReserved} > 0`
          )
        )
        .orderBy(inventory.expiryDate, inventory.batchNumber);

      // Calculate total available quantity
      const totalAvailable = availableInventory.reduce(
        (sum, inv) => sum + Number(inv.quantityAvailable),
        0
      );

      // 2.1: Check if enough inventory
      if (totalAvailable < quantity) {
        throw new Error(
          `Insufficient inventory for ${variant.name} (${variant.sku}). ` +
          `Requested: ${quantity}, Available: ${totalAvailable}`
        );
      }

      // STEP 3: Reserve Inventory (FEFO Strategy)
      // ==========================================

      let remainingQuantity = quantity;

      // Reserve from batches with earliest expiry date first
      for (const inv of availableInventory) {
        if (remainingQuantity <= 0) break;

        const availableInBatch = Number(inv.quantityAvailable);
        const toReserve = Math.min(remainingQuantity, availableInBatch);

        // Update reserved quantity
        await tx
          .update(inventory)
          .set({
            quantityReserved: sql`${inventory.quantityReserved} + ${toReserve}`,
          })
          .where(eq(inventory.id, inv.id));

        remainingQuantity -= toReserve;
      }

      // STEP 4: Calculate Item Total
      // =============================

      const unitPrice = Number(variant.sellPrice);
      const totalPrice = unitPrice * quantity;
      totalAmount += totalPrice;

      itemsToCreate.push({
        medicationVariantId: medication_variant_id,
        quantity,
        unitPrice,
        totalPrice,
      });
    }

    // STEP 5: Create Sales Order
    // ===========================

    const [order] = await tx
      .insert(salesOrders)
      .values({
        customerId: soData.customer_id,
        paymentMethod: soData.payment_method || "cash",
        totalAmount: totalAmount,
        status: "pending",                         // Initial status
        salespersonId: userId || null,
        orderDate: new Date(),
      })
      .returning();

    // STEP 6: Create Sales Order Items
    // =================================

    const createdItems = await tx
      .insert(salesOrderItems)
      .values(
        itemsToCreate.map((item) => ({
          ...item,
          salesOrderId: order.id,
        }))
      )
      .returning();

    // STEP 7: Return Complete Order
    // ==============================

    return {
      ...order,
      items: createdItems,
    };
  });
}
```

---

## Components

### 1. POSPage (Main Container)

**Location**: `apps/web/src/pages/POSPage.jsx`  
**Purpose**: Main POS interface container  
**Layout**: 3-column grid (Customer & Search | Cart | Checkout)

```jsx
<AppLayout title="Point of Sale">
  <div className="grid gap-6 lg:grid-cols-3">
    {/* Left Column - Customer & Product Search */}
    <div className="space-y-6 lg:col-span-2">
      <CustomerSelector />
      <ProductSearch />
    </div>

    {/* Right Column - Cart & Checkout */}
    <div className="space-y-6">
      <Cart />
      <CheckoutPanel />
    </div>
  </div>
</AppLayout>
```

### 2. CustomerSelector

**Location**: `apps/web/src/components/pos/CustomerSelector.jsx`  
**Purpose**: Search and select customer, or create new customer

**Features**:

- Search customers by name/email/phone
- Display search results
- Create new customer dialog
- Auto-select after creation

**Props**:

```typescript
{
  selectedCustomer: Customer | null,
  onSelectCustomer: (customer: Customer) => void
}
```

**UI Elements**:

- Search input with debounce
- Customer list with selection
- "New Customer" button → Dialog
- Customer form (name\*, email, phone, address)

### 3. ProductSearch

**Location**: `apps/web/src/components/pos/ProductSearch.jsx`  
**Purpose**: Search medications and add to cart

**Features**:

- Search by name or SKU
- Display results with stock info
- Add to cart button
- Clear search after adding

**Props**:

```typescript
{
  onAddToCart: (medication: Medication) => void
}
```

**UI Elements**:

- Search input
- Search button
- Product list with:
  - Product name
  - SKU
  - Price (formatted VND)
  - Stock badge (green if available, red if out)
  - Add button (disabled if no stock)

### 4. Cart

**Location**: `apps/web/src/components/pos/Cart.jsx`  
**Purpose**: Display cart items and allow quantity management

**Features**:

- Display cart items
- Increase/decrease quantity
- Direct quantity input
- Remove item
- Calculate and display total

**Props**:

```typescript
{
  cart: CartItem[],
  onUpdateQuantity: (variantId: string, quantity: number) => void,
  onRemoveItem: (variantId: string) => void,
  calculateTotal: () => number
}
```

**Cart Item Structure**:

```typescript
{
  medication_variant_id: string,
  name: string,
  sku: string,
  quantity: number,
  unitPrice: number,
  availableStock: number
}
```

**UI Elements**:

- Empty state (shopping cart icon + message)
- Item cards with:
  - Product name
  - Unit price × quantity
  - Quantity controls (-, input, +)
  - Subtotal
  - Delete button
- Total section (bold, primary color)

### 5. CheckoutPanel

**Location**: `apps/web/src/components/pos/CheckoutPanel.jsx`  
**Purpose**: Select payment method and complete order

**Features**:

- Payment method selection (4 options)
- Complete order button
- Disable button if no customer or empty cart
- Show processing state

**Props**:

```typescript
{
  paymentMethod: string,
  onPaymentMethodChange: (method: string) => void,
  onCheckout: () => Promise<void>,
  isProcessing: boolean,
  disabled: boolean
}
```

**Payment Methods**:

```typescript
[
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "credit_card", label: "Credit Card", icon: CreditCard },
  { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
  { value: "mobile_payment", label: "Mobile Payment", icon: Smartphone },
];
```

---

## API Integration

### Endpoints Used

#### 1. Search Medications

```http
GET /api/medications?search={query}
```

**Request**:

```javascript
medicationService.searchMedications(searchQuery);
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Paracetamol 500mg",
      "sku": "PAR-500-001",
      "sellPrice": 5000,
      "availableQuantity": 100,
      "isActive": true,
      "isForSale": true
    }
  ]
}
```

#### 2. Search Customers

```http
GET /api/customers?search={query}&limit=10
```

**Request**:

```javascript
customerService.getCustomers({ search: searchQuery, limit: 10 });
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Nguyen Van A",
      "email": "nguyenvana@example.com",
      "phone": "0901234567",
      "address": "123 Street, City"
    }
  ]
}
```

#### 3. Create Customer

```http
POST /api/customers
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "Nguyen Van A",
  "email": "nguyenvana@example.com",
  "phone": "0901234567",
  "address": "123 Street, City"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": "uuid",
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "phone": "0901234567",
    "address": "123 Street, City",
    "loyaltyPoints": 0,
    "createdAt": "2025-10-21T..."
  }
}
```

#### 4. Create Sales Order

```http
POST /api/sales
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body**:

```json
{
  "customer_id": "uuid",
  "payment_method": "cash",
  "items": [
    {
      "medication_variant_id": "uuid",
      "quantity": 2
    },
    {
      "medication_variant_id": "uuid",
      "quantity": 1
    }
  ]
}
```

**Response**:

```json
{
  "success": true,
  "message": "Sales order created successfully",
  "data": {
    "id": "uuid",
    "customerId": "uuid",
    "paymentMethod": "cash",
    "totalAmount": 150000,
    "status": "pending",
    "salespersonId": "uuid",
    "orderDate": "2025-10-21T10:30:00Z",
    "items": [
      {
        "id": "uuid",
        "salesOrderId": "uuid",
        "medicationVariantId": "uuid",
        "quantity": 2,
        "unitPrice": 50000,
        "totalPrice": 100000
      }
    ]
  }
}
```

---

## Inventory Management

### FEFO Strategy (First Expired First Out)

POS system sử dụng chiến lược FEFO để reserve và deduct inventory:

#### 1. When Creating Sales Order (Status: pending)

```sql
-- Step 1: Find available inventory ordered by expiry date
SELECT
  id,
  quantity,
  quantity_reserved,
  (quantity - quantity_reserved) as quantity_available,
  expiry_date,
  batch_number
FROM inventory
WHERE medication_variant_id = $1
  AND (quantity - quantity_reserved) > 0
ORDER BY expiry_date ASC, batch_number ASC;

-- Step 2: Reserve quantity from earliest expiring batches
UPDATE inventory
SET quantity_reserved = quantity_reserved + $reserve_amount
WHERE id = $batch_id;
```

**Example**:

```
Order quantity: 10 units

Available inventory:
- Batch A: expiry 2025-12-01, available: 5 units  → Reserve 5
- Batch B: expiry 2026-03-15, available: 20 units → Reserve 5
- Batch C: expiry 2026-06-30, available: 10 units → Reserve 0

Result:
- Batch A: quantity_reserved += 5
- Batch B: quantity_reserved += 5
```

#### 2. When Completing Order (Status: completed)

```sql
-- Deduct reserved quantity from inventory
UPDATE inventory
SET
  quantity = quantity - $deduct_amount,
  quantity_reserved = quantity_reserved - $deduct_amount
WHERE id = $batch_id;
```

**Example**:

```
Before:
- Batch A: quantity: 100, quantity_reserved: 5
- Batch B: quantity: 200, quantity_reserved: 5

After completing order:
- Batch A: quantity: 95, quantity_reserved: 0
- Batch B: quantity: 195, quantity_reserved: 0
```

#### 3. When Cancelling Order (Status: cancelled)

```sql
-- Unreserve quantity
UPDATE inventory
SET quantity_reserved = quantity_reserved - $unreserve_amount
WHERE id = $batch_id;
```

**Example**:

```
Before:
- Batch A: quantity: 100, quantity_reserved: 5
- Batch B: quantity: 200, quantity_reserved: 5

After cancelling order:
- Batch A: quantity: 100, quantity_reserved: 0
- Batch B: quantity: 200, quantity_reserved: 0
```

### Inventory States

```
┌─────────────┐
│   Created   │  quantity_reserved = 0
└──────┬──────┘
       │ POS creates order
       ▼
┌─────────────┐
│  Reserved   │  quantity_reserved > 0
└──────┬──────┘
       │
       ├─ Order completed
       │      ▼
       │  ┌─────────────┐
       │  │  Deducted   │  quantity -= amount
       │  │             │  quantity_reserved -= amount
       │  └─────────────┘
       │
       └─ Order cancelled
              ▼
          ┌─────────────┐
          │ Unreserved  │  quantity_reserved -= amount
          └─────────────┘
```

### Database Transaction

Toàn bộ quá trình tạo đơn hàng được wrap trong 1 database transaction để đảm bảo:

✅ **Atomicity**: All or nothing - nếu 1 bước fail thì rollback tất cả  
✅ **Consistency**: Inventory luôn đúng  
✅ **Isolation**: Không có race condition khi nhiều POS tạo đơn cùng lúc  
✅ **Durability**: Dữ liệu được lưu permanent sau khi commit

```javascript
return await db.transaction(async (tx) => {
  // All database operations here
  // If any operation fails, entire transaction is rolled back
});
```

---

## Error Handling

### Frontend Errors

#### 1. Validation Errors

```javascript
// No customer selected
if (!selectedCustomer) {
  toast.error("Please select a customer");
  return false;
}

// Empty cart
if (cart.length === 0) {
  toast.error("Cart is empty");
  return false;
}

// Invalid quantity
if (quantity < 1 || quantity > availableStock) {
  // Prevent update
  return;
}
```

#### 2. API Errors

```javascript
try {
  const response = await salesService.createSalesOrder(orderData);
  toast.success("Order created successfully!");
  return response.data;
} catch (error) {
  const errorMessage =
    error.response?.data?.error ||
    error.response?.data?.message ||
    "Failed to create order";
  toast.error(errorMessage);
  return false;
}
```

### Backend Errors

#### 1. Validation Errors

```javascript
// Missing items
if (!items || items.length === 0) {
  throw new Error("Sales order must have at least one item");
}

// Variant not found
if (!variant) {
  throw new Error(
    `Medication variant with ID ${medication_variant_id} not found`
  );
}

// Variant not available for sale
if (!variant.isActive || !variant.isForSale) {
  throw new Error(
    `Medication variant ${variant.name} (${variant.sku}) is not available for sale`
  );
}
```

#### 2. Inventory Errors

```javascript
// Insufficient inventory
const totalAvailable = availableInventory.reduce(
  (sum, inv) => sum + Number(inv.quantityAvailable),
  0
);

if (totalAvailable < quantity) {
  throw new Error(
    `Insufficient inventory for ${variant.name} (${variant.sku}). ` +
      `Requested: ${quantity}, Available: ${totalAvailable}`
  );
}
```

#### 3. Transaction Errors

```javascript
// Automatic rollback on any error
return await db.transaction(async (tx) => {
  try {
    // ... operations
  } catch (error) {
    // Transaction automatically rolls back
    throw error; // Re-throw to controller
  }
});
```

### Error Response Format

```json
{
  "success": false,
  "error": "Insufficient inventory for Paracetamol 500mg (PAR-500-001). Requested: 10, Available: 5"
}
```

---

## Business Rules

### 1. Customer Management

✅ **MUST** select a customer before checkout  
✅ Can create new customer on-the-fly  
✅ Only name is required for new customer  
✅ Customer auto-selected after creation

### 2. Product Management

✅ Products **MUST** be active (`isActive = true`)  
✅ Products **MUST** be for sale (`isForSale = true`)  
✅ Products **MUST** have available inventory  
✅ Cannot add product with 0 stock  
✅ Search supports name and SKU

### 3. Cart Management

✅ Quantity **MUST** be >= 1  
✅ Quantity **MUST** be <= available stock  
✅ Can update quantity via +/- buttons or direct input  
✅ Duplicate products increase quantity instead of adding new line  
✅ Cart cleared after successful order

### 4. Payment

✅ **MUST** select payment method  
✅ Supported methods:

- `cash` - Tiền mặt
- `credit_card` - Thẻ tín dụng
- `bank_transfer` - Chuyển khoản
- `mobile_payment` - Ví điện tử
  ✅ Default payment method: `cash`

### 5. Inventory Management

✅ **FEFO Strategy**: First Expired First Out  
✅ Inventory reserved immediately when order created  
✅ Inventory deducted when order completed  
✅ Reserved quantity unreserved when order cancelled  
✅ Cannot oversell (total reserved + requested <= quantity)

### 6. Order Status Flow

```
pending → completed ✅
pending → cancelled ✅
completed → (no more changes) ❌
cancelled → (no more changes) ❌
```

### 7. User Permissions

✅ All authenticated users can access POS  
✅ Salesperson ID auto-recorded from JWT token  
✅ Order date auto-set to current timestamp

### 8. Pricing

✅ Price taken from `medication_variants.sell_price`  
✅ No manual price editing in POS  
✅ Total calculated as: `sum(quantity × unitPrice)` for all items  
✅ No discounts in current version (future enhancement)

### 9. Invoice

✅ Invoice auto-generated on order creation  
✅ Invoice ID = Sales Order ID  
✅ Invoice includes:

- Order date
- Customer info
- Salesperson info
- Item list with quantities and prices
- Payment method
- Total amount

---

## Future Enhancements

### Planned Features

1. **Barcode Scanning**
   - Scan product barcode to add to cart
   - Scan customer loyalty card

2. **Discounts**
   - Line item discount (per product)
   - Order-level discount
   - Promotional codes
   - Loyalty point redemption

3. **Split Payment**
   - Pay with multiple methods
   - Partial cash + partial card

4. **Return/Refund**
   - Process returns from POS
   - Refund to original payment method

5. **Prescription Management**
   - Attach prescription image
   - Validate prescription for required medications
   - Track prescription usage

6. **Customer Display**
   - Second screen showing items and total
   - Customer-facing interface

7. **Offline Mode**
   - Queue orders when offline
   - Sync when connection restored

8. **Quick Keys**
   - Keyboard shortcuts for common actions
   - F2: Add customer, F3: Search product, F4: Checkout

9. **Receipt Printing**
   - Thermal printer integration
   - Customizable receipt template

10. **Cash Drawer Integration**
    - Auto-open cash drawer on cash payment
    - Track cash in/out

---

## Troubleshooting

### Common Issues

#### 1. "Please select a customer" error

**Cause**: User clicked checkout without selecting customer  
**Solution**: Search and select a customer, or create new customer

#### 2. "Cart is empty" error

**Cause**: User clicked checkout with no items in cart  
**Solution**: Search and add products to cart

#### 3. "Insufficient inventory" error

**Cause**: Requested quantity > available stock  
**Solution**:

- Reduce quantity in cart
- Check inventory in warehouse module
- Create purchase order to restock

#### 4. "Medication variant is not available for sale" error

**Cause**: Product is inactive or marked as not for sale  
**Solution**:

- Check product settings
- Activate product in medication management
- Set `isForSale = true`

#### 5. Order processing stuck

**Cause**: Network error or server timeout  
**Solution**:

- Check network connection
- Retry order creation
- Check if order was created (may be duplicate)

#### 6. Cart shows wrong total

**Cause**: State not synced  
**Solution**:

- Clear cart and re-add items
- Refresh page

---

## Performance Considerations

### Frontend Optimization

1. **useCallback**: Prevent unnecessary re-renders
2. **Debounce Search**: Reduce API calls while typing
3. **Lazy Loading**: Load customer list on demand
4. **Optimistic Updates**: Update UI before API response

### Backend Optimization

1. **Database Transaction**: Ensure data consistency
2. **Query Optimization**: Use indexes on frequently queried columns
3. **FEFO Query**: Single query to get ordered inventory batches
4. **Batch Operations**: Update multiple inventory records efficiently

### Database Indexes

```sql
-- Recommended indexes for POS performance
CREATE INDEX idx_inventory_variant_expiry
ON inventory(medication_variant_id, expiry_date, batch_number);

CREATE INDEX idx_inventory_available
ON inventory(medication_variant_id)
WHERE (quantity - quantity_reserved) > 0;

CREATE INDEX idx_medication_variants_search
ON medication_variants(name, sku);

CREATE INDEX idx_customers_search
ON customers(name, phone, email);
```

---

## Testing Checklist

### Manual Testing

- [ ] Search customer → Select → Should populate selected customer
- [ ] Create new customer → Should auto-select and close dialog
- [ ] Search product → Add to cart → Should appear in cart
- [ ] Add duplicate product → Should increase quantity
- [ ] Increase quantity with + button → Should increment
- [ ] Decrease quantity with - button → Should decrement (min 1)
- [ ] Input quantity directly → Should validate against stock
- [ ] Remove item from cart → Should disappear
- [ ] Select different payment methods → Should highlight selected
- [ ] Complete order without customer → Should show error
- [ ] Complete order with empty cart → Should show error
- [ ] Complete valid order → Should succeed and clear cart
- [ ] Check inventory after order → Should be reserved
- [ ] Complete order → Should deduct from inventory
- [ ] Cancel order → Should unreserve inventory

### Edge Cases

- [ ] Order with 0 inventory product → Should prevent
- [ ] Order exceeding available stock → Should show error
- [ ] Multiple orders for same product → Should handle race condition
- [ ] Network error during order → Should rollback transaction
- [ ] Inactive product → Should not be addable
- [ ] Product marked not for sale → Should show error

---

## Glossary

- **POS**: Point of Sale - Hệ thống bán hàng tại quầy
- **FEFO**: First Expired First Out - Xuất hàng hết hạn sớm trước
- **Cart**: Giỏ hàng - Danh sách sản phẩm chờ thanh toán
- **SKU**: Stock Keeping Unit - Mã định danh sản phẩm
- **Medication Variant**: Biến thể thuốc (strength, form, packaging)
- **Reserved Quantity**: Số lượng đã đặt trước (chưa xuất kho)
- **Available Quantity**: Số lượng có thể bán = quantity - quantity_reserved
- **Salesperson**: Nhân viên bán hàng
- **Invoice**: Hóa đơn bán hàng
- **Checkout**: Thanh toán và hoàn tất đơn hàng

---

**End of POS Flow Documentation**
