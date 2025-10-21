# Frontend Implementation Guide - Sales Module

**Project**: PharmaFlow  
**Module**: Sales/POS (Point of Sale)  
**Date**: October 21, 2025  
**Version**: 1.0  
**Based on**: Backend API Analysis

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [API Endpoints Reference](#api-endpoints-reference)
3. [Data Structures](#data-structures)
4. [Component Architecture](#component-architecture)
5. [Implementation Steps](#implementation-steps)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [UI Components](#ui-components)
9. [Validation & Error Handling](#validation--error-handling)
10. [Testing Guide](#testing-guide)

---

## Overview

### What We're Building

A Point of Sale (POS) system for pharmacy staff to:

- Select customers (search or create new)
- Add medications to cart
- Manage cart (quantity, remove items)
- Select payment method
- Complete sales orders

### Technology Stack

- **Framework**: React 18+
- **Routing**: React Router v6
- **State Management**: React Hooks (useState, useCallback)
- **HTTP Client**: Axios
- **Data Fetching**: TanStack Query v5 (React Query)
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Form Validation**: Zod
- **Notifications**: Sonner (toast)

### User Permissions

**Staff Role** has access to:

- ✅ Create sales orders (`POST /api/sales`)
- ✅ View sales orders (`GET /api/sales`, `GET /api/sales/:id`)
- ✅ Update sales order status (`PATCH /api/sales/:id`)
- ✅ View medications (`GET /api/medications`)
- ✅ Create/update customers (`POST /api/customers`, `PATCH /api/customers/:id`)
- ❌ Delete sales orders (Owner only)

---

## API Endpoints Reference

### Sales Orders

#### 1. Create Sales Order

```http
POST /api/sales
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:

```json
{
  "customer_id": "uuid-string",
  "payment_method": "cash", // cash | credit_card | bank_transfer | mobile_payment
  "items": [
    {
      "medication_variant_id": "uuid-string",
      "quantity": 2
    }
  ]
}
```

**Response (201 Created)**:

```json
{
  "success": true,
  "message": "Sales order created successfully",
  "data": {
    "id": "uuid-string",
    "customerId": "uuid-string",
    "orderDate": "2025-10-21T10:30:00Z",
    "totalAmount": 25000,
    "status": "pending",
    "paymentMethod": "cash",
    "salespersonId": "uuid-string",
    "items": [
      {
        "id": "uuid-string",
        "salesOrderId": "uuid-string",
        "medicationVariantId": "uuid-string",
        "quantity": 2,
        "unitPrice": 5000,
        "totalPrice": 10000
      }
    ]
  }
}
```

**Error Responses**:

```json
// 400 Bad Request - Insufficient inventory
{
  "success": false,
  "error": "Insufficient inventory for Paracetamol 500mg (PAR-500-001). Requested: 10, Available: 5"
}

// 400 Bad Request - Product not for sale
{
  "success": false,
  "error": "Medication variant Paracetamol 500mg (PAR-500-001) is not available for sale"
}

// 401 Unauthorized
{
  "success": false,
  "message": "No token provided. Authentication required."
}
```

#### 2. List Sales Orders

```http
GET /api/sales?page=1&limit=20&status=pending&customerId=uuid&paymentMethod=cash
Authorization: Bearer {token}
```

**Query Parameters**:

- `page` (optional, default: 1)
- `limit` (optional, default: 100)
- `sortBy` (optional, default: "orderDate")
- `sortOrder` (optional, default: "desc")
- `customerId` (optional)
- `status` (optional: pending, completed, cancelled)
- `paymentMethod` (optional)
- `salespersonId` (optional)
- `orderDateFrom` (optional)
- `orderDateTo` (optional)

**Response (200 OK)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "customerId": "uuid-string",
      "orderDate": "2025-10-21T10:30:00Z",
      "totalAmount": 25000,
      "status": "pending",
      "paymentMethod": "cash",
      "salespersonId": "uuid-string",
      "customer": {
        "id": "uuid-string",
        "name": "Nguyen Van A",
        "email": "nguyenvana@example.com",
        "phone": "0901234567"
      },
      "salesperson": {
        "id": "uuid-string",
        "name": "Staff Name",
        "email": "staff@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasMore": true
  }
}
```

#### 3. Get Sales Order by ID

```http
GET /api/sales/:id
Authorization: Bearer {token}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "customerId": "uuid-string",
    "orderDate": "2025-10-21T10:30:00Z",
    "totalAmount": 25000,
    "status": "pending",
    "paymentMethod": "cash",
    "salespersonId": "uuid-string",
    "customer": {
      "id": "uuid-string",
      "name": "Nguyen Van A",
      "email": "nguyenvana@example.com",
      "phone": "0901234567",
      "address": "123 Street, City"
    },
    "salesperson": {
      "id": "uuid-string",
      "name": "Staff Name"
    },
    "items": [
      {
        "id": "uuid-string",
        "salesOrderId": "uuid-string",
        "medicationVariantId": "uuid-string",
        "quantity": 2,
        "unitPrice": 5000,
        "totalPrice": 10000,
        "medicationVariant": {
          "id": "uuid-string",
          "name": "Paracetamol 500mg Tablet",
          "sku": "PAR-500-TAB-001",
          "sellPrice": 5000,
          "medication": {
            "id": "uuid-string",
            "name": "Paracetamol",
            "category": "Analgesic"
          }
        }
      }
    ]
  }
}
```

#### 4. Update Sales Order Status

```http
PATCH /api/sales/:id
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:

```json
{
  "status": "completed" // pending | completed | cancelled
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "message": "Sales order updated successfully",
  "data": {
    "id": "uuid-string",
    "status": "completed",
    ...
  }
}
```

**Important Notes**:

- When status changes to `completed`: Inventory is deducted (FEFO - First Expired First Out)
- When status changes to `cancelled`: Reserved inventory is unreserved
- Cannot change status from `completed` or `cancelled`

### Medications

#### 5. Search Medications

```http
GET /api/medications?search=paracetamol&page=1&limit=10
Authorization: Bearer {token}
```

**Query Parameters**:

- `search` (optional) - Search by name or active ingredient
- `category` (optional)
- `form` (optional)
- `manufacturer` (optional)
- `requiresPrescription` (optional: true/false)
- `page`, `limit` (pagination)

**Response (200 OK)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "name": "Paracetamol 500mg Tablet",
      "sku": "PAR-500-TAB-001",
      "sellPrice": 5000,
      "availableQuantity": 100,
      "isActive": true,
      "isForSale": true,
      "category": "Analgesic",
      "form": "Tablet"
    }
  ],
  "pagination": {...}
}
```

### Customers

#### 6. Search Customers

```http
GET /api/customers?search=nguyen&limit=10
Authorization: Bearer {token}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "name": "Nguyen Van A",
      "email": "nguyenvana@example.com",
      "phone": "0901234567",
      "address": "123 Street, City",
      "loyaltyPoints": 100
    }
  ]
}
```

#### 7. Create Customer

```http
POST /api/customers
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "Nguyen Van B",
  "email": "nguyenvanb@example.com",
  "phone": "0912345678",
  "address": "456 Street, City"
}
```

**Response (201 Created)**:

```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": "uuid-string",
    "name": "Nguyen Van B",
    "email": "nguyenvanb@example.com",
    "phone": "0912345678",
    "address": "456 Street, City",
    "loyaltyPoints": 0,
    "createdAt": "2025-10-21T10:30:00Z"
  }
}
```

---

## Data Structures

### TypeScript Interfaces

```typescript
// Customer
interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyaltyPoints: number;
  createdAt: string;
}

// Medication Variant
interface MedicationVariant {
  id: string;
  name: string;
  sku: string;
  sellPrice: number;
  availableQuantity: number;
  isActive: boolean;
  isForSale: boolean;
  category?: string;
  form?: string;
}

// Cart Item (Frontend only)
interface CartItem {
  medication_variant_id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  availableStock: number;
}

// Sales Order Item (Backend)
interface SalesOrderItem {
  id: string;
  salesOrderId: string;
  medicationVariantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  medicationVariant?: MedicationVariant;
}

// Sales Order
interface SalesOrder {
  id: string;
  customerId: string;
  orderDate: string;
  totalAmount: number;
  status: "pending" | "completed" | "cancelled";
  paymentMethod: "cash" | "credit_card" | "bank_transfer" | "mobile_payment";
  salespersonId?: string;
  customer?: Customer;
  salesperson?: {
    id: string;
    name: string;
  };
  items?: SalesOrderItem[];
}

// Create Sales Order Request
interface CreateSalesOrderRequest {
  customer_id: string;
  payment_method: "cash" | "credit_card" | "bank_transfer" | "mobile_payment";
  items: {
    medication_variant_id: string;
    quantity: number;
  }[];
}
```

---

## Component Architecture

```
src/
├── pages/
│   ├── SalesPage.jsx              # Main POS page
│   └── SalesOrderListPage.jsx     # Sales order list
│
├── components/
│   └── sales/
│       ├── CustomerSelector.jsx   # Search/select customer
│       ├── ProductSearch.jsx      # Search medications
│       ├── Cart.jsx               # Shopping cart
│       ├── CheckoutPanel.jsx      # Payment & checkout
│       └── SalesOrderDetail.jsx   # Order detail modal
│
├── hooks/
│   ├── useSales.js                # Sales order logic
│   └── useCart.js                 # Cart state management
│
├── services/
│   ├── salesService.js            # Sales API calls
│   ├── medicationService.js       # Medication API calls
│   └── customerService.js         # Customer API calls
│
└── lib/
    └── axios.js                   # Axios instance with auth
```

---

## Implementation Steps

### Step 1: Setup API Services

#### `src/services/salesService.js`

```javascript
import instance from "@/lib/axios";

export const salesService = {
  /**
   * Create a new sales order
   * @param {CreateSalesOrderRequest} data
   */
  async createSalesOrder(data) {
    const response = await instance.post("/sales", data);
    return response.data;
  },

  /**
   * Get all sales orders with filters
   * @param {Object} params - Query parameters
   */
  async getSalesOrders(params = {}) {
    const response = await instance.get("/sales", { params });
    return response.data;
  },

  /**
   * Get sales order by ID
   * @param {string} id - Order ID
   */
  async getSalesOrder(id) {
    const response = await instance.get(`/sales/${id}`);
    return response.data;
  },

  /**
   * Update sales order status
   * @param {string} id - Order ID
   * @param {Object} data - { status: 'completed' | 'cancelled' }
   */
  async updateSalesOrder(id, data) {
    const response = await instance.patch(`/sales/${id}`, data);
    return response.data;
  },

  /**
   * Delete/cancel sales order (Owner only)
   * @param {string} id - Order ID
   */
  async deleteSalesOrder(id) {
    const response = await instance.delete(`/sales/${id}`);
    return response.data;
  },
};
```

#### `src/services/medicationService.js`

```javascript
import instance from "@/lib/axios";

export const medicationService = {
  /**
   * Search medications
   * @param {string} search - Search query
   */
  async searchMedications(search, params = {}) {
    const response = await instance.get("/medications", {
      params: { search, ...params },
    });
    return response.data;
  },

  /**
   * Get medication by ID
   * @param {string} id - Medication ID
   */
  async getMedication(id) {
    const response = await instance.get(`/medications/${id}`);
    return response.data;
  },
};
```

#### `src/services/customerService.js`

```javascript
import instance from "@/lib/axios";

export const customerService = {
  /**
   * Search customers
   * @param {Object} params - Query parameters
   */
  async getCustomers(params = {}) {
    const response = await instance.get("/customers", { params });
    return response.data;
  },

  /**
   * Create a new customer
   * @param {Object} data - Customer data
   */
  async createCustomer(data) {
    const response = await instance.post("/customers", data);
    return response.data;
  },

  /**
   * Update customer
   * @param {string} id - Customer ID
   * @param {Object} data - Customer data
   */
  async updateCustomer(id, data) {
    const response = await instance.patch(`/customers/${id}`, data);
    return response.data;
  },
};
```

---

### Step 2: Create Custom Hooks

#### `src/hooks/useCart.js`

```javascript
import { useState, useCallback } from "react";

export function useCart() {
  const [cart, setCart] = useState([]);

  // Add item to cart
  const addToCart = useCallback((medication) => {
    setCart((prev) => {
      const existingItem = prev.find(
        (item) => item.medication_variant_id === medication.id
      );

      if (existingItem) {
        // Increase quantity if already in cart
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
          name: medication.name,
          sku: medication.sku,
          quantity: 1,
          unitPrice: medication.sellPrice,
          availableStock: medication.availableQuantity || 0,
        },
      ];
    });
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((medicationVariantId) => {
    setCart((prev) =>
      prev.filter((item) => item.medication_variant_id !== medicationVariantId)
    );
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((medicationVariantId, quantity) => {
    if (quantity < 1) return;

    setCart((prev) =>
      prev.map((item) =>
        item.medication_variant_id === medicationVariantId
          ? { ...item, quantity }
          : item
      )
    );
  }, []);

  // Calculate total
  const calculateTotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [cart]);

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    clearCart,
  };
}
```

#### `src/hooks/useSales.js`

```javascript
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { salesService } from "@/services/salesService";

export function useSales() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);

  // Process order
  const processOrder = useCallback(
    async (cart) => {
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
        const orderData = {
          customer_id: selectedCustomer.id,
          payment_method: paymentMethod,
          items: cart.map((item) => ({
            medication_variant_id: item.medication_variant_id,
            quantity: item.quantity,
          })),
        };

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
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedCustomer, paymentMethod]
  );

  return {
    selectedCustomer,
    setSelectedCustomer,
    paymentMethod,
    setPaymentMethod,
    isProcessing,
    processOrder,
  };
}
```

---

### Step 3: Build UI Components

#### `src/components/sales/CustomerSelector.jsx`

```jsx
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { customerService } from "@/services/customerService";
import { toast } from "sonner";

export function CustomerSelector({ selectedCustomer, onSelectCustomer }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Search customers
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setCustomers([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await customerService.getCustomers({
        search: searchQuery,
        limit: 10,
      });
      setCustomers(response.data || []);
    } catch (error) {
      toast.error("Failed to search customers");
    } finally {
      setIsSearching(false);
    }
  };

  // Create new customer
  const handleCreateCustomer = async (e) => {
    e.preventDefault();

    if (!newCustomer.name.trim()) {
      toast.error("Customer name is required");
      return;
    }

    try {
      const response = await customerService.createCustomer(newCustomer);
      const createdCustomer = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      toast.success("Customer created successfully");
      onSelectCustomer(createdCustomer);
      setShowNewCustomerDialog(false);
      setNewCustomer({ name: "", email: "", phone: "", address: "" });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create customer";
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Customer</h3>
          <Dialog
            open={showNewCustomerDialog}
            onOpenChange={setShowNewCustomerDialog}
          >
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                New Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Customer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newCustomer.name}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, name: e.target.value })
                    }
                    placeholder="Customer name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, email: e.target.value })
                    }
                    placeholder="customer@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, phone: e.target.value })
                    }
                    placeholder="0901234567"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newCustomer.address}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        address: e.target.value,
                      })
                    }
                    placeholder="Customer address"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Customer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Selected Customer Display */}
        {selectedCustomer ? (
          <div className="rounded-lg border bg-primary/5 p-3">
            <p className="font-medium">{selectedCustomer.name}</p>
            {selectedCustomer.phone && (
              <p className="text-sm text-muted-foreground">
                {selectedCustomer.phone}
              </p>
            )}
            {selectedCustomer.email && (
              <p className="text-sm text-muted-foreground">
                {selectedCustomer.email}
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Search Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Search customer by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Results */}
            {customers.length > 0 && (
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {customers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => {
                      onSelectCustomer(customer);
                      setSearchQuery("");
                      setCustomers([]);
                    }}
                    className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                  >
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.phone} • {customer.email}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
```

#### `src/components/sales/ProductSearch.jsx`

```jsx
import { useState } from "react";
import { Search, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { medicationService } from "@/services/medicationService";
import { toast } from "sonner";

export function ProductSearch({ onAddToCart }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [medications, setMedications] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setMedications([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await medicationService.searchMedications(searchQuery);
      setMedications(response.data || []);
    } catch (error) {
      toast.error("Failed to search medications");
    } finally {
      setIsSearching(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Search Products</h3>

        <div className="flex gap-2">
          <Input
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {medications.length > 0 && (
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {medications.map((medication) => (
              <div
                key={medication.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{medication.name}</p>
                    <p className="text-sm text-muted-foreground">
                      SKU: {medication.sku}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-sm font-semibold text-primary">
                        {formatPrice(medication.sellPrice)}
                      </p>
                      <Badge
                        variant={
                          medication.availableQuantity > 0
                            ? "default"
                            : "destructive"
                        }
                      >
                        Stock: {medication.availableQuantity || 0}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    onAddToCart(medication);
                    setSearchQuery("");
                    setMedications([]);
                  }}
                  disabled={!medication.availableQuantity}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        )}

        {searchQuery && medications.length === 0 && !isSearching && (
          <p className="text-center text-sm text-muted-foreground">
            No medications found
          </p>
        )}
      </div>
    </Card>
  );
}
```

#### `src/components/sales/Cart.jsx`

```jsx
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function Cart({ cart, onUpdateQuantity, onRemoveItem, calculateTotal }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Cart</h3>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {cart.length}
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
              Search and add products to get started
            </p>
          </div>
        ) : (
          <>
            <div className="max-h-96 space-y-3 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.medication_variant_id}
                  className="rounded-lg border p-3"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveItem(item.medication_variant_id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onUpdateQuantity(
                            item.medication_variant_id,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          onUpdateQuantity(
                            item.medication_variant_id,
                            Number.parseInt(e.target.value) || 1
                          )
                        }
                        className="w-16 text-center"
                        min="1"
                        max={item.availableStock}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onUpdateQuantity(
                            item.medication_variant_id,
                            item.quantity + 1
                          )
                        }
                        disabled={item.quantity >= item.availableStock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-semibold">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  {formatPrice(calculateTotal())}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
```

#### `src/components/sales/CheckoutPanel.jsx`

```jsx
import { CreditCard, Banknote, Smartphone, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const paymentMethods = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "credit_card", label: "Credit Card", icon: CreditCard },
  { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
  { value: "mobile_payment", label: "Mobile Payment", icon: Smartphone },
];

export function CheckoutPanel({
  paymentMethod,
  onPaymentMethodChange,
  onCheckout,
  isProcessing,
  disabled,
}) {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Method</h3>

        <div className="grid grid-cols-2 gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.value}
                onClick={() => onPaymentMethodChange(method.value)}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  paymentMethod === method.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Icon
                  className={`h-6 w-6 ${paymentMethod === method.value ? "text-primary" : "text-muted-foreground"}`}
                />
                <span
                  className={`text-sm font-medium ${
                    paymentMethod === method.value
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  {method.label}
                </span>
              </button>
            );
          })}
        </div>

        <Button
          onClick={onCheckout}
          disabled={disabled || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? "Processing..." : "Complete Order"}
        </Button>
      </div>
    </Card>
  );
}
```

---

### Step 4: Create Main Sales Page

#### `src/pages/SalesPage.jsx`

```jsx
import { AppLayout } from "@/components/layouts/app-layout";
import { CustomerSelector } from "@/components/sales/CustomerSelector";
import { ProductSearch } from "@/components/sales/ProductSearch";
import { Cart } from "@/components/sales/Cart";
import { CheckoutPanel } from "@/components/sales/CheckoutPanel";
import { useCart } from "@/hooks/useCart";
import { useSales } from "@/hooks/useSales";
import { toast } from "sonner";

export default function SalesPage() {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    clearCart,
  } = useCart();

  const {
    selectedCustomer,
    setSelectedCustomer,
    paymentMethod,
    setPaymentMethod,
    isProcessing,
    processOrder,
  } = useSales();

  const handleCheckout = async () => {
    const result = await processOrder(cart);
    if (result) {
      clearCart();
      setSelectedCustomer(null);
      setPaymentMethod("cash");
      console.log("Order created:", result);
    }
  };

  const handleAddToCart = (medication) => {
    addToCart(medication);
    toast.success(`Added ${medication.name} to cart`);
  };

  return (
    <AppLayout title="Point of Sale">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Customer & Product Search */}
        <div className="space-y-6 lg:col-span-2">
          <CustomerSelector
            selectedCustomer={selectedCustomer}
            onSelectCustomer={setSelectedCustomer}
          />
          <ProductSearch onAddToCart={handleAddToCart} />
        </div>

        {/* Right Column - Cart & Checkout */}
        <div className="space-y-6">
          <Cart
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            calculateTotal={calculateTotal}
          />
          <CheckoutPanel
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            onCheckout={handleCheckout}
            isProcessing={isProcessing}
            disabled={!selectedCustomer || cart.length === 0}
          />
        </div>
      </div>
    </AppLayout>
  );
}
```

---

### Step 5: Add Route Configuration

#### `src/App.jsx`

```jsx
import { Routes, Route } from "react-router-dom";
import SalesPage from "@/pages/SalesPage";
import SalesOrderListPage from "@/pages/SalesOrderListPage";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Sales Routes */}
      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <SalesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/orders"
        element={
          <ProtectedRoute>
            <SalesOrderListPage />
          </ProtectedRoute>
        }
      />
      {/* Other routes... */}
    </Routes>
  );
}
```

---

## State Management

### Local State (useState)

Used for:

- Cart items
- Selected customer
- Payment method
- Search queries
- Form inputs
- Dialog visibility

### Server State (TanStack Query)

Optional enhancement for better caching:

```javascript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Fetch sales orders
export function useSalesOrders(params) {
  return useQuery({
    queryKey: ["salesOrders", params],
    queryFn: () => salesService.getSalesOrders(params),
  });
}

// Create sales order
export function useCreateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => salesService.createSalesOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["salesOrders"]);
    },
  });
}
```

---

## Validation & Error Handling

### Frontend Validation

```javascript
// Validate before creating order
function validateOrder(customer, cart) {
  const errors = [];

  if (!customer) {
    errors.push("Please select a customer");
  }

  if (cart.length === 0) {
    errors.push("Cart is empty");
  }

  cart.forEach((item) => {
    if (item.quantity > item.availableStock) {
      errors.push(
        `Insufficient stock for ${item.name}. Available: ${item.availableStock}`
      );
    }
  });

  return errors;
}
```

### Error Handling Pattern

```javascript
try {
  const response = await salesService.createSalesOrder(orderData);
  toast.success("Order created successfully!");
  return response.data;
} catch (error) {
  // Extract error message from different response formats
  const errorMessage =
    error.response?.data?.error || // Custom error
    error.response?.data?.message || // Standard message
    error.message || // Network error
    "Failed to create order"; // Fallback

  toast.error(errorMessage);

  // Log for debugging
  console.error("Order creation failed:", error);

  return false;
}
```

### Common Error Messages

```javascript
const ERROR_MESSAGES = {
  NO_CUSTOMER: "Please select a customer",
  EMPTY_CART: "Cart is empty",
  INSUFFICIENT_INVENTORY: "Insufficient inventory",
  PRODUCT_NOT_FOR_SALE: "Product is not available for sale",
  UNAUTHORIZED: "Please login to continue",
  FORBIDDEN: "You don't have permission for this action",
  NETWORK_ERROR: "Network error. Please check your connection",
};
```

---

## Testing Guide

### Manual Testing Checklist

#### Customer Selection

- [ ] Search customer by name
- [ ] Search customer by phone
- [ ] Search customer by email
- [ ] Create new customer
- [ ] Select customer from search results
- [ ] Selected customer displays correctly

#### Product Search

- [ ] Search medication by name
- [ ] Search medication by SKU
- [ ] Add product to cart
- [ ] Cannot add product with 0 stock
- [ ] Product displays price correctly
- [ ] Product displays stock correctly

#### Cart Management

- [ ] Add product increases quantity if already in cart
- [ ] Increase quantity with + button
- [ ] Decrease quantity with - button (minimum 1)
- [ ] Update quantity by typing in input
- [ ] Cannot exceed available stock
- [ ] Remove item from cart
- [ ] Total calculates correctly

#### Payment & Checkout

- [ ] Select different payment methods
- [ ] Selected payment method highlights
- [ ] Complete order button disabled without customer
- [ ] Complete order button disabled with empty cart
- [ ] Order processes successfully
- [ ] Cart clears after successful order
- [ ] Customer resets after successful order
- [ ] Payment method resets to cash

#### Error Handling

- [ ] "Please select customer" shows when no customer
- [ ] "Cart is empty" shows when cart empty
- [ ] "Insufficient inventory" shows when stock < quantity
- [ ] Network error handling works
- [ ] Token expiration redirects to login

### Unit Testing Example (Jest + React Testing Library)

```javascript
import { render, screen, fireEvent } from "@testing-library/react";
import { Cart } from "@/components/sales/Cart";

describe("Cart Component", () => {
  const mockCart = [
    {
      medication_variant_id: "1",
      name: "Paracetamol 500mg",
      sku: "PAR-500",
      quantity: 2,
      unitPrice: 5000,
      availableStock: 100,
    },
  ];

  it("displays empty cart message when cart is empty", () => {
    render(
      <Cart
        cart={[]}
        onUpdateQuantity={() => {}}
        onRemoveItem={() => {}}
        calculateTotal={() => 0}
      />
    );

    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
  });

  it("displays cart items correctly", () => {
    render(
      <Cart
        cart={mockCart}
        onUpdateQuantity={() => {}}
        onRemoveItem={() => {}}
        calculateTotal={() => 10000}
      />
    );

    expect(screen.getByText("Paracetamol 500mg")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2")).toBeInTheDocument();
  });

  it("calls onUpdateQuantity when quantity changes", () => {
    const mockUpdate = jest.fn();
    render(
      <Cart
        cart={mockCart}
        onUpdateQuantity={mockUpdate}
        onRemoveItem={() => {}}
        calculateTotal={() => 10000}
      />
    );

    const plusButton = screen.getByRole("button", { name: /plus/i });
    fireEvent.click(plusButton);

    expect(mockUpdate).toHaveBeenCalledWith("1", 3);
  });
});
```

---

## Performance Optimization

### 1. Memoization

```javascript
import { useMemo, useCallback } from "react";

// Memoize expensive calculations
const totalAmount = useMemo(() => {
  return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}, [cart]);

// Memoize callbacks
const handleAddToCart = useCallback(
  (medication) => {
    addToCart(medication);
    toast.success(`Added ${medication.name}`);
  },
  [addToCart]
);
```

### 2. Debouncing Search

```javascript
import { useDebouncedCallback } from "use-debounce";

const debouncedSearch = useDebouncedCallback(
  async (query) => {
    const response = await medicationService.searchMedications(query);
    setMedications(response.data);
  },
  500 // Wait 500ms after user stops typing
);
```

### 3. Virtual Scrolling for Large Lists

```javascript
import { useVirtualizer } from "@tanstack/react-virtual";

// For large medication or customer lists
const rowVirtualizer = useVirtualizer({
  count: medications.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80,
});
```

---

## Security Considerations

### 1. Authentication

```javascript
// Axios interceptor for auth token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. Handle Token Expiration

```javascript
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - redirect to login
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### 3. Input Sanitization

```javascript
// Sanitize user input before sending
function sanitizeInput(input) {
  return input.trim().replace(/[<>]/g, "");
}
```

---

## Deployment Checklist

- [ ] Environment variables configured (API_BASE_URL)
- [ ] Build passes without errors
- [ ] All dependencies installed
- [ ] Authentication working
- [ ] API endpoints accessible
- [ ] Error handling tested
- [ ] Cross-browser testing done
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] Security headers configured

---

## Troubleshooting

### Issue: "Cannot add to cart"

**Check**:

- Is medication `isActive` and `isForSale`?
- Is `availableQuantity` > 0?
- Check console for errors

### Issue: "Order creation fails"

**Check**:

- Is customer selected?
- Is cart not empty?
- Check network tab for API response
- Verify token is valid
- Check inventory availability

### Issue: "Token expired"

**Solution**:

```javascript
// Implement token refresh
async function refreshToken() {
  const response = await instance.post("/auth/refresh");
  localStorage.setItem("authToken", response.data.token);
}
```

---

## Next Steps

1. **Implement Sales Order List Page**
2. **Add Order Detail Modal**
3. **Implement Barcode Scanning**
4. **Add Receipt Printing**
5. **Implement Discounts**
6. **Add Customer Display Screen**
7. **Implement Offline Mode**
8. **Add Keyboard Shortcuts**

---

## Resources

- **Backend API Docs**: `apps/api/ai-docs/`
- **OpenAPI Spec**: `docs/openapi/openapi.yaml`
- **DTO Schemas**: `packages/dto/`
- **shadcn/ui Docs**: https://ui.shadcn.com
- **TanStack Query**: https://tanstack.com/query

---

**End of Frontend Implementation Guide**

📌 **Version**: 1.0  
📅 **Last Updated**: October 21, 2025  
👤 **For**: Frontend Developers  
🔄 **Keep this updated as backend API changes**
