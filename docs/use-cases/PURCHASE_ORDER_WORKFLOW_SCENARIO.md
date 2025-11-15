# Kịch Bản Quy Trình Nhập Hàng (Purchase Order Workflow)

## 📋 Tổng Quan

Tài liệu này mô tả chi tiết kịch bản quy trình nhập hàng từ khi Owner tạo Purchase Order (PO) đến khi nhập hàng vào kho. Quy trình bao gồm các bước:

1. **Owner tạo Purchase Order** và gửi email cho Supplier
2. **Supplier xác nhận đơn hàng** qua email
3. **Nhân viên kho nhận hàng** và tạo Purchase Order Receipt
4. **Hệ thống tự động phân bổ** hàng vào ô trống gần nhất

---

## 🎯 Các Vai Trò Tham Gia

| Vai Trò             | Mô Tả         | Quyền Hạn                        |
| ------------------- | ------------- | -------------------------------- |
| **Owner**           | Chủ nhà thuốc | Tạo, quản lý Purchase Order      |
| **Supplier**        | Nhà cung cấp  | Xác nhận đơn hàng qua email      |
| **Warehouse Staff** | Nhân viên kho | Nhận hàng, tạo Receipt, nhập kho |

---

## 📊 Sơ Đồ Quy Trình

```text
[Owner] → Create PO → [System] → Send Email → [Supplier]
                          ↓
                    Status: PENDING
                          ↓
[Supplier] → Click Confirm Link → [System] → Send Notification → [Owner]
                                       ↓
                                 Status: ORDERED
                                       ↓
[Warehouse] → Receive Goods → Create Receipt → Auto Allocate → Inventory Updated
```

---

## 🔄 Chi Tiết Từng Bước

### Bước 1️⃣: Owner Tạo Purchase Order

#### 1.1 Thông Tin Cần Nhập

```json
{
  "supplier_id": "uuid-of-supplier",
  "expected_date": "2025-11-20",
  "items": [
    {
      "supplier_medication_variant_id": "uuid-variant-1",
      "quantity": 100,
      "unit_price": 50000
    },
    {
      "supplier_medication_variant_id": "uuid-variant-2",
      "quantity": 50,
      "unit_price": 120000
    }
  ]
}
```

#### 1.2 Quy Trình Tạo PO

**Frontend (Web):**

```javascript
// 1. Owner chọn Supplier từ dropdown
// Component: CreatePurchaseOrderForm.jsx

const handleSupplierChange = (supplierId) => {
  setSelectedSupplier(supplierId);
  // Load danh sách thuốc của supplier này
  fetchSupplierMedications(supplierId);
};

// 2. Thêm thuốc vào đơn hàng
const handleAddMedication = (medicationVariant) => {
  setOrderItems([
    ...orderItems,
    {
      supplier_medication_variant_id: medicationVariant.id,
      medicationName: medicationVariant.medicationName,
      variantName: medicationVariant.variantName,
      quantity: 1,
      unit_price: medicationVariant.supplierPrice,
    },
  ]);
};

// 3. Điều chỉnh số lượng
const handleQuantityChange = (index, newQuantity) => {
  const updated = [...orderItems];
  updated[index].quantity = parseInt(newQuantity) || 0;
  setOrderItems(updated);
};

// 4. Tạo Purchase Order
const handleCreatePO = async () => {
  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  const payload = {
    supplier_id: selectedSupplier,
    expected_date: expectedDeliveryDate,
    items: orderItems.map((item) => ({
      supplier_medication_variant_id: item.supplier_medication_variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })),
  };

  await createPurchaseOrder(payload);
  showSuccessNotification("Purchase Order created successfully!");
};
```

**Backend API:**

```javascript
// POST /api/purchases
// File: apps/api/src/controllers/purchaseOrderController.js

export const createPurchaseOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = req.body; // Mảng hoặc object đơn lẻ

    // Tạo PO và items
    const createdOrders = await purchaseOrderService.create(data, userId);

    // Gửi email cho từng supplier
    for (const order of createdOrders) {
      const po = await purchaseOrderService.getById(order.id);

      if (po.supplierEmail) {
        await sendPurchaseOrderEmail({
          purchaseOrderId: po.id,
          supplierEmail: po.supplierEmail,
          supplierName: po.supplierName,
          supplierContact: po.supplierContactName,
          buyerInfo: {
            contact: req.user.name,
            email: req.user.email,
            phone: req.user.phone || "N/A",
            address: "PharmaFlow Pharmacy",
          },
          items: po.items,
          totalAmount: po.totalAmount,
          expectedDeliveryDate: po.expectedDate
            ? new Date(po.expectedDate).toLocaleDateString("vi-VN")
            : "N/A",
          orderNumber: po.id.substring(0, 8).toUpperCase(),
          orderDate: new Date(po.orderDate).toLocaleDateString("vi-VN"),
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Purchase order(s) created successfully",
      data: createdOrders,
    });
  } catch (error) {
    logger.error("Error creating purchase order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create purchase order",
      error: error.message,
    });
  }
};
```

#### 1.3 Email Gửi Cho Supplier

**Nội dung email:**

```text
Subject: New Purchase Order #A1B2C3D4 - PharmaFlow

Dear [Supplier Contact],

We are pleased to place the following purchase order with [Supplier Name].

Order Details:
- Order Number: #A1B2C3D4
- Order Date: 15/11/2025
- Expected Delivery: 20/11/2025

Items:
1. Paracetamol 500mg - Blister 10 viên x 100 boxes = 5,000,000₫
2. Amoxicillin 500mg - Hộp 20 viên x 50 boxes = 6,000,000₫

Total Amount: 11,000,000₫

[Confirm Receipt of Purchase Order Button]
→ Click để xác nhận đã nhận được đơn hàng

Important Notes:
• Please confirm receipt within 24 hours
• Ensure delivery by 20/11/2025
• Contact us if you have any questions
```

**Trạng thái sau khi tạo:** `status = "pending"`

---

### Bước 2️⃣: Supplier Xác Nhận Đơn Hàng

#### 2.1 Supplier Click Link Xác Nhận

**URL xác nhận:**

```http
GET /api/purchases/confirm/:purchaseOrderId?token=abc123...
```

**Flow xác nhận:**

```javascript
// Backend: apps/api/src/controllers/purchaseOrderController.js

export const confirmPurchaseOrder = async (req, res) => {
  try {
    const { purchaseOrderId } = req.params;
    const { token } = req.query;

    // Gọi service để xác nhận
    const result = await purchaseOrderService.confirmOrder(
      purchaseOrderId,
      token
    );

    // Redirect đến trang confirmation success
    return res.redirect(
      `${process.env.WEB_URL}/supplier/order-confirmed?orderNumber=${result.orderNumber}`
    );
  } catch (error) {
    logger.error("Error confirming purchase order:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
```

**Service xử lý:**

```javascript
// apps/api/src/services/purchaseOrderService.js

async confirmOrder(purchaseOrderId, token) {
  // 1. Verify token (valid trong 7 ngày)
  if (!verifyConfirmationToken(token, purchaseOrderId)) {
    throw new Error('Invalid or expired confirmation token');
  }

  return await db.transaction(async (tx) => {
    // 2. Lấy thông tin PO
    const po = await getPurchaseOrderWithDetails(purchaseOrderId, tx);

    // 3. Kiểm tra trạng thái
    if (po.status === 'ordered') {
      throw new Error('Already confirmed');
    }
    if (po.status === 'cancelled') {
      throw new Error('Order has been cancelled');
    }

    // 4. Cập nhật status → "ordered"
    const updatedPo = await tx.update(purchaseOrders)
      .set({
        status: 'ordered',
        updatedAt: new Date()
      })
      .where(eq(purchaseOrders.id, purchaseOrderId))
      .returning();

    // 5. Gửi email thông báo cho Owner
    if (po.buyerEmail) {
      await sendConfirmationNotificationEmail({
        ownerEmail: po.buyerEmail,
        ownerName: po.buyerName,
        supplierName: po.supplierName,
        orderNumber: purchaseOrderId.substring(0, 8).toUpperCase(),
        // ... các thông tin khác
      });
    }

    return {
      success: true,
      orderNumber: purchaseOrderId.substring(0, 8).toUpperCase(),
      purchaseOrder: updatedPo
    };
  });
}
```

#### 2.2 Email Thông Báo Cho Owner

```text
Subject: ✓ Purchase Order #A1B2C3D4 Confirmed by Supplier

Dear [Owner Name],

Great news! [Supplier Name] has confirmed your purchase order.

Order Details:
- Order Number: #A1B2C3D4
- Supplier: ABC Pharmaceutical
- Order Date: 15/11/2025
- Expected Delivery: 20/11/2025
- Total Amount: 11,000,000₫
- Confirmed at: 15/11/2025 14:30

Next Steps:
• Order status updated to "Ordered"
• Supplier will process and ship your order
• You'll be notified when items are delivered
• Track order status in your dashboard
```

**Trạng thái sau khi xác nhận:** `status = "ordered"`

---

### Bước 3️⃣: Nhân Viên Kho Nhận Hàng và Tạo Receipt

#### 3.1 Tạo Purchase Order Receipt

**Frontend (Web):**

```javascript
// Component: CreateReceiptForm.jsx

const CreateReceiptForm = ({ purchaseOrder }) => {
  const [receiptItems, setReceiptItems] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);

  // Load PO items khi mở form
  useEffect(() => {
    const items = purchaseOrder.items.map((item) => ({
      purchaseOrderItemId: item.id,
      medicationName: item.medicationName,
      variantName: item.variantName,
      orderedQuantity: item.quantity,
      receivedQuantity: item.quantity, // Default = ordered
      batchNumber: "",
      manufactureDate: null,
      expiryDate: null,
    }));
    setReceiptItems(items);
  }, [purchaseOrder]);

  // Nhập thông tin lô hàng cho từng item
  const handleBatchInfoChange = (index, field, value) => {
    const updated = [...receiptItems];
    updated[index][field] = value;
    setReceiptItems(updated);
  };

  // Tìm bin trống gần nhất trong zone đã chọn
  const handleFindAvailableBins = async () => {
    if (!selectedZone) {
      showError("Please select a zone first");
      return;
    }

    const items = receiptItems.map((item) => ({
      medicationVariantId: item.medicationVariantId,
      quantity: item.receivedQuantity,
    }));

    const bins = await findAvailableBinsForItems({
      zoneId: selectedZone,
      items,
    });

    // Gán bin ID cho từng item
    const updated = receiptItems.map((item, idx) => ({
      ...item,
      binId: bins[idx]?.binId,
    }));
    setReceiptItems(updated);
  };

  // Tạo Receipt
  const handleCreateReceipt = async () => {
    const payload = {
      purchaseOrderId: purchaseOrder.id,
      receivedDate: new Date().toISOString(),
      receivedBy: currentUser.id,
      items: receiptItems.map((item) => ({
        purchaseOrderItemId: item.purchaseOrderItemId,
        quantity: item.receivedQuantity,
        batchNumber: item.batchNumber,
        manufactureDate: item.manufactureDate,
        expiryDate: item.expiryDate,
        binId: item.binId,
      })),
    };

    await createPurchaseOrderReceipt(payload);
    showSuccess("Receipt created and inventory updated!");
  };

  return (
    <form>
      {/* 1. Thông tin Receipt */}
      <div>
        <label>Received Date</label>
        <DatePicker defaultValue={new Date()} disabled />
      </div>

      {/* 2. Chọn Zone để phân bổ hàng */}
      <div>
        <label>Storage Zone</label>
        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
        >
          <option value="">Select Zone</option>
          {zones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.code} - {zone.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleFindAvailableBins}
          disabled={!selectedZone}
        >
          Find Available Bins
        </button>
      </div>

      {/* 3. Danh sách items nhận về */}
      <table>
        <thead>
          <tr>
            <th>Medication</th>
            <th>Ordered</th>
            <th>Received</th>
            <th>Batch Number</th>
            <th>Mfg Date</th>
            <th>Exp Date</th>
            <th>Bin</th>
          </tr>
        </thead>
        <tbody>
          {receiptItems.map((item, idx) => (
            <tr key={idx}>
              <td>
                {item.medicationName} - {item.variantName}
              </td>
              <td>{item.orderedQuantity}</td>
              <td>
                <input
                  type="number"
                  value={item.receivedQuantity}
                  onChange={(e) =>
                    handleBatchInfoChange(
                      idx,
                      "receivedQuantity",
                      e.target.value
                    )
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="LOT-2025-001"
                  value={item.batchNumber}
                  onChange={(e) =>
                    handleBatchInfoChange(idx, "batchNumber", e.target.value)
                  }
                  required
                />
              </td>
              <td>
                <DatePicker
                  value={item.manufactureDate}
                  onChange={(date) =>
                    handleBatchInfoChange(idx, "manufactureDate", date)
                  }
                />
              </td>
              <td>
                <DatePicker
                  value={item.expiryDate}
                  onChange={(date) =>
                    handleBatchInfoChange(idx, "expiryDate", date)
                  }
                  required
                />
              </td>
              <td>
                {item.binId ? (
                  <span className="text-green-600">✓ {item.binCode}</span>
                ) : (
                  <span className="text-red-600">Not assigned</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button type="button" onClick={handleCreateReceipt}>
        Create Receipt & Update Inventory
      </button>
    </form>
  );
};
```

#### 3.2 API Tìm Bin Trống Gần Nhất

```javascript
// POST /api/inventory/find-available-bins
// File: apps/api/src/controllers/inventoryController.js

export const findAvailableBins = async (req, res) => {
  try {
    const { zoneId, items } = req.body;

    // Validation
    if (!zoneId) {
      return res.status(400).json({
        success: false,
        message: "Zone ID is required",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items array is required",
      });
    }

    // Tìm bins trống trong zone
    const availableBins =
      await inventoryAllocationService.findAvailableBinsInZone(
        zoneId,
        items.length
      );

    if (availableBins.length < items.length) {
      return res.status(400).json({
        success: false,
        message: `Not enough available bins in zone. Found ${availableBins.length}, needed ${items.length}`,
      });
    }

    // Map bins cho từng item
    const assignments = items.map((item, index) => ({
      medicationVariantId: item.medicationVariantId,
      quantity: item.quantity,
      binId: availableBins[index].binId,
      binCode: availableBins[index].binCode,
      binName: availableBins[index].binName,
      rackCode: availableBins[index].rackCode,
      zoneCode: availableBins[index].zoneCode,
    }));

    return res.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    logger.error("Error finding available bins:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to find available bins",
      error: error.message,
    });
  }
};
```

#### 3.3 Service Tìm Bin Trống

```javascript
// apps/api/src/services/inventoryAllocationService.js

async findAvailableBinsInZone(zoneId, count) {
  // Lấy tất cả bins trong zone, sắp xếp theo FIFO
  const bins = await db
    .select({
      binId: warehouseBins.id,
      binCode: warehouseBins.code,
      binName: warehouseBins.name,
      binLevel: warehouseBins.level,
      binNumber: warehouseBins.number,
      rackId: warehouseRacks.id,
      rackCode: warehouseRacks.code,
      rackName: warehouseRacks.name,
      zoneId: warehouseZones.id,
      zoneCode: warehouseZones.code,
      zoneName: warehouseZones.name,
      hasInventory: sql`COUNT(${inventory.id}) > 0`.as('has_inventory')
    })
    .from(warehouseBins)
    .innerJoin(warehouseRacks, eq(warehouseBins.rackId, warehouseRacks.id))
    .innerJoin(warehouseZones, eq(warehouseRacks.zoneId, warehouseZones.id))
    .leftJoin(inventory, eq(warehouseBins.id, inventory.binId))
    .where(eq(warehouseZones.id, zoneId))
    .groupBy(/* all bin, rack, zone fields */)
    .orderBy(
      asc(warehouseZones.code),
      asc(warehouseRacks.code),
      asc(warehouseBins.level),
      asc(warehouseBins.number)
    );

  // Lọc bins trống (chưa có inventory)
  const emptyBins = bins.filter(bin => !bin.hasInventory);

  // Trả về số lượng bins cần thiết
  return emptyBins.slice(0, count);
}
```

#### 3.4 API Tạo Receipt và Cập Nhật Inventory

```javascript
// POST /api/purchases/:purchaseOrderId/receipts
// File: apps/api/src/controllers/purchaseOrderReceiptController.js

export const createReceipt = async (req, res) => {
  try {
    const { purchaseOrderId } = req.params;
    const { receivedDate, receivedBy, items } = req.body;

    // Validation
    const validationResult = validateReceiptData({
      purchaseOrderId,
      receivedDate,
      receivedBy,
      items,
    });

    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        message: validationResult.errors.join(", "),
      });
    }

    // Tạo receipt và tự động phân bổ inventory
    const receipt = await purchaseOrderReceiptService.create({
      purchaseOrderId,
      receivedDate,
      receivedBy,
      items,
    });

    return res.status(201).json({
      success: true,
      message: "Receipt created and inventory allocated successfully",
      data: receipt,
    });
  } catch (error) {
    logger.error("Error creating receipt:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create receipt",
      error: error.message,
    });
  }
};
```

#### 3.5 Service Tạo Receipt và Auto-Allocate Inventory

```javascript
// apps/api/src/services/purchaseOrderReceiptService.js

async create(data) {
  return await db.transaction(async (tx) => {
    const { items, ...receiptData } = data;

    // 1. Tạo Receipt
    const [receipt] = await tx
      .insert(purchaseOrderReceipts)
      .values({
        purchaseOrderId: receiptData.purchaseOrderId,
        receivedDate: new Date(receiptData.receivedDate),
        receivedBy: receiptData.receivedBy
      })
      .returning();

    // 2. Tạo Receipt Items
    const batchDataMap = new Map();
    const binPreferenceMap = new Map();

    const itemsToCreate = items.map(item => {
      // Lưu batch info riêng
      batchDataMap.set(item.purchaseOrderItemId, {
        batchNumber: item.batchNumber || 'NO-BATCH',
        manufactureDate: item.manufactureDate || null,
        expiryDate: item.expiryDate || null
      });

      // Lưu preferred bin nếu có
      if (item.binId) {
        binPreferenceMap.set(item.purchaseOrderItemId, item.binId);
      }

      return {
        purchaseOrderReceiptId: receipt.id,
        purchaseOrderItemId: item.purchaseOrderItemId,
        quantity: item.quantity
      };
    });

    const createdItems = await tx
      .insert(purchaseOrderReceiptItems)
      .values(itemsToCreate)
      .returning();

    // 3. Auto-allocate inventory cho từng item
    const inventoryAllocations = [];

    for (const receiptItem of createdItems) {
      const batchData = batchDataMap.get(receiptItem.purchaseOrderItemId);
      const preferredBinId = binPreferenceMap.get(receiptItem.purchaseOrderItemId);

      // Lấy medication variant ID từ PO item
      const [poItem] = await tx
        .select({
          variantId: supplierMedicationVariants.medicationVariantId
        })
        .from(purchaseOrderItems)
        .leftJoin(
          supplierMedicationVariants,
          eq(purchaseOrderItems.supplierMedicationVariantId,
             supplierMedicationVariants.id)
        )
        .where(eq(purchaseOrderItems.id, receiptItem.purchaseOrderItemId));

      // Gọi service phân bổ inventory
      const allocated = await inventoryAllocationService.allocateInventory({
        medicationVariantId: poItem.variantId,
        purchaseOrderReceiptItemId: receiptItem.id,
        batchNumber: batchData.batchNumber,
        manufactureDate: batchData.manufactureDate,
        expiryDate: batchData.expiryDate,
        quantity: receiptItem.quantity,
        preferredBinId: preferredBinId
      }, tx);

      inventoryAllocations.push(...allocated);
    }

    logger.info(`Created ${inventoryAllocations.length} inventory records`);

    return {
      ...receipt,
      items: createdItems,
      inventoryAllocations
    };
  });
}
```

---

### Bước 4️⃣: Hệ Thống Tự Động Phân Bổ Inventory

#### 4.1 Inventory Allocation Strategy (FIFO)

```javascript
// apps/api/src/services/inventoryAllocationService.js

async allocateInventory(allocationData, tx = db) {
  const {
    medicationVariantId,
    purchaseOrderReceiptItemId,
    batchNumber,
    manufactureDate,
    expiryDate,
    quantity,
    preferredBinId
  } = allocationData;

  // A. Nếu có preferredBinId, lấy zone của bin đó
  let preferredZoneId = null;
  if (preferredBinId) {
    const binInfo = await tx
      .select({ zoneId: warehouseZones.id })
      .from(warehouseBins)
      .innerJoin(warehouseRacks, eq(warehouseBins.rackId, warehouseRacks.id))
      .innerJoin(warehouseZones, eq(warehouseRacks.zoneId, warehouseZones.id))
      .where(eq(warehouseBins.id, preferredBinId))
      .limit(1);

    if (binInfo.length > 0) {
      preferredZoneId = binInfo[0].zoneId;
    }
  }

  // B. Lấy danh sách bins trong zone (hoặc tất cả nếu không chỉ định)
  const queryConditions = preferredZoneId
    ? [eq(warehouseZones.id, preferredZoneId)]
    : [];

  const binsWithInventory = await tx
    .select({
      binId: warehouseBins.id,
      binCode: warehouseBins.code,
      binName: warehouseBins.name,
      rackCode: warehouseRacks.code,
      zoneCode: warehouseZones.code,
      hasInventory: sql`COUNT(${inventory.id}) > 0`.as('has_inventory')
    })
    .from(warehouseBins)
    .innerJoin(warehouseRacks, eq(warehouseBins.rackId, warehouseRacks.id))
    .innerJoin(warehouseZones, eq(warehouseRacks.zoneId, warehouseZones.id))
    .leftJoin(inventory, eq(warehouseBins.id, inventory.binId))
    .where(queryConditions.length > 0 ? and(...queryConditions) : undefined)
    .groupBy(/* all fields */)
    .orderBy(
      asc(warehouseZones.code),
      asc(warehouseRacks.code),
      asc(warehouseBins.level),
      asc(warehouseBins.number)
    );

  // C. Ưu tiên bin trống, nếu không có thì dùng bin có hàng
  let emptyBins = binsWithInventory.filter(b => !b.hasInventory);

  if (emptyBins.length === 0) {
    logger.warn('No empty bins available, using occupied bins');
    emptyBins = binsWithInventory;
  }

  if (emptyBins.length === 0) {
    throw new Error('No available bins for allocation');
  }

  // D. Chọn bin đầu tiên (FIFO)
  const targetBin = emptyBins[0];

  // E. Tạo inventory record
  const [inventoryRecord] = await tx
    .insert(inventory)
    .values({
      medicationVariantId,
      purchaseOrderReceiptItemsId: purchaseOrderReceiptItemId,
      binId: targetBin.binId,
      batchNumber,
      manufactureDate,
      expiryDate,
      quantity,
      quantityReserved: 0
    })
    .returning();

  logger.info(`Allocated ${quantity} units to bin ${targetBin.binCode}`);

  return [{
    ...inventoryRecord,
    binCode: targetBin.binCode,
    binName: targetBin.binName,
    rackCode: targetBin.rackCode,
    zoneCode: targetBin.zoneCode
  }];
}
```

#### 4.2 Kết Quả Sau Khi Phân Bổ

**Inventory Table:**

| ID    | Variant ID | Receipt Item ID | Bin ID  | Batch   | Mfg Date   | Exp Date   | Quantity |
| ----- | ---------- | --------------- | ------- | ------- | ---------- | ---------- | -------- |
| inv-1 | var-1      | rcpt-item-1     | bin-A01 | LOT-001 | 2025-10-01 | 2027-10-01 | 100      |
| inv-2 | var-2      | rcpt-item-2     | bin-A02 | LOT-002 | 2025-10-15 | 2027-10-15 | 50       |

**Warehouse Structure:**

```text
Zone A (Thuốc thường)
├── Rack R01
│   ├── Bin A01 (Level 1, Số 1) → [✓] Paracetamol 100 boxes
│   └── Bin A02 (Level 1, Số 2) → [✓] Amoxicillin 50 boxes
└── Rack R02
    ├── Bin A03 (Level 1, Số 3) → [ ] Empty
    └── Bin A04 (Level 1, Số 4) → [ ] Empty
```

---

## 🔍 Các Trường Hợp Đặc Biệt

### Trường Hợp 1: Số Lượng Nhận Khác Số Lượng Đặt

```javascript
// Owner đặt: 100 boxes
// Supplier chỉ giao: 80 boxes

const receiptItems = [
  {
    purchaseOrderItemId: "item-1",
    quantity: 80, // Chỉ nhận 80
    batchNumber: "LOT-001",
    // ...
  },
];

// Hệ thống sẽ:
// - Tạo receipt với quantity = 80
// - Inventory chỉ tăng 80
// - PO vẫn giữ nguyên ordered quantity = 100
// - Admin có thể tạo thêm receipt cho 20 còn lại sau
```

### Trường Hợp 2: Không Có Bin Trống Trong Zone

```javascript
// Nếu zone đã đầy, hệ thống sẽ:
// 1. Cố phân bổ vào bin có hàng cùng loại
// 2. Nếu không được, throw error yêu cầu chọn zone khác
// 3. Hoặc tạo bin mới trong rack

if (emptyBins.length === 0) {
  // Option 1: Dùng bin có hàng
  const existingBins = binsWithInventory.filter((b) => b.hasInventory);

  if (existingBins.length > 0) {
    logger.warn("Using occupied bins for allocation");
    targetBin = existingBins[0];
  } else {
    // Option 2: Throw error
    throw new Error(
      "No available bins in selected zone. Please select another zone."
    );
  }
}
```

### Trường Hợp 3: Nhập Nhiều Lô Cùng Lúc

```javascript
// Nếu nhận 1 loại thuốc nhưng có nhiều lô khác nhau:

const receiptItems = [
  {
    purchaseOrderItemId: "item-1",
    quantity: 50,
    batchNumber: "LOT-001",
    expiryDate: "2027-10-01",
    // Bin riêng cho lô 1
  },
  {
    purchaseOrderItemId: "item-1",
    quantity: 50,
    batchNumber: "LOT-002",
    expiryDate: "2027-12-01",
    // Bin riêng cho lô 2
  },
];

// Mỗi lô sẽ được phân bổ vào bin riêng
```

---

## 📊 Database Schema Liên Quan

### Purchase Orders

```sql
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY,
  supplier_id UUID REFERENCES suppliers(id),
  order_date TIMESTAMP DEFAULT NOW(),
  expected_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- pending → ordered → received
  total_amount DECIMAL(15,2),
  created_by UUID REFERENCES users(id)
);
```

### Purchase Order Items

```sql
CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY,
  purchase_order_id UUID REFERENCES purchase_orders(id),
  supplier_medication_variant_id UUID REFERENCES supplier_medication_variants(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(15,2),
  total_price DECIMAL(15,2)
);
```

### Purchase Order Receipts

```sql
CREATE TABLE purchase_order_receipts (
  id UUID PRIMARY KEY,
  purchase_order_id UUID REFERENCES purchase_orders(id),
  received_date TIMESTAMP DEFAULT NOW(),
  received_by UUID REFERENCES users(id)
);
```

### Purchase Order Receipt Items

```sql
CREATE TABLE purchase_order_receipt_items (
  id UUID PRIMARY KEY,
  purchase_order_receipt_id UUID REFERENCES purchase_order_receipts(id),
  purchase_order_item_id UUID REFERENCES purchase_order_items(id),
  quantity INTEGER NOT NULL
);
```

### Inventory

```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY,
  medication_variant_id UUID REFERENCES medication_variants(id),
  purchase_order_receipt_items_id UUID REFERENCES purchase_order_receipt_items(id),
  bin_id UUID REFERENCES warehouse_bins(id),
  batch_number VARCHAR(100),
  manufacture_date DATE,
  expiry_date DATE,
  quantity INTEGER NOT NULL,
  quantity_reserved INTEGER DEFAULT 0
);
```

---

## 🎨 UI/UX Flow

### 1. Create Purchase Order Page

```text
┌─────────────────────────────────────────┐
│ Create Purchase Order                    │
├─────────────────────────────────────────┤
│ Supplier: [Dropdown ▼]                  │
│ Expected Delivery: [Date Picker]        │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Medications                         │ │
│ │ [+ Add Medication]                  │ │
│ │                                     │ │
│ │ 1. Paracetamol 500mg - Blister     │ │
│ │    Qty: [100] × 50,000₫ = 5,000,000₫│ │
│ │    [Remove]                         │ │
│ │                                     │ │
│ │ 2. Amoxicillin 500mg - Box         │ │
│ │    Qty: [50] × 120,000₫ = 6,000,000₫│ │
│ │    [Remove]                         │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Total Amount: 11,000,000₫                │
│                                          │
│ [Cancel] [Create & Send Email]           │
└─────────────────────────────────────────┘
```

### 2. Create Receipt Page

```text
┌─────────────────────────────────────────┐
│ Create Receipt - PO #A1B2C3D4           │
├─────────────────────────────────────────┤
│ Purchase Order Info:                     │
│ - Supplier: ABC Pharmaceutical           │
│ - Order Date: 15/11/2025                │
│ - Status: ORDERED                        │
│                                          │
│ Received Date: [15/11/2025] (Today)     │
│ Storage Zone: [Zone A - Drugs ▼]        │
│ [🔍 Find Available Bins]                │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Items to Receive                    │ │
│ ├─────────────────────────────────────┤ │
│ │ Medication | Ordered | Received     │ │
│ │ Paracetamol   100      [100]        │ │
│ │ Batch: [LOT-001]                    │ │
│ │ Mfg: [01/10/2025] Exp: [01/10/2027] │ │
│ │ Bin: ✓ A01-R01-L1-N1                │ │
│ │                                     │ │
│ │ Amoxicillin    50      [50]         │ │
│ │ Batch: [LOT-002]                    │ │
│ │ Mfg: [15/10/2025] Exp: [15/10/2027] │ │
│ │ Bin: ✓ A02-R01-L1-N2                │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ [Cancel] [Create Receipt]                │
└─────────────────────────────────────────┘
```

---

## 🚀 API Endpoints Summary

| Method | Endpoint                               | Mô Tả                                 |
| ------ | -------------------------------------- | ------------------------------------- |
| POST   | `/api/purchases`                       | Tạo Purchase Order + gửi email        |
| GET    | `/api/purchases/:id`                   | Xem chi tiết PO                       |
| GET    | `/api/purchases/confirm/:id?token=xxx` | Supplier xác nhận PO                  |
| POST   | `/api/purchases/:id/receipts`          | Tạo Receipt + auto-allocate inventory |
| POST   | `/api/inventory/find-available-bins`   | Tìm bins trống trong zone             |
| GET    | `/api/inventory`                       | Xem inventory sau khi nhập            |

---

## ✅ Checklist Triển Khai

- [x] Purchase Order Service - Create, Update, Confirm
- [x] Email Service - PO notification, Confirmation
- [x] Receipt Service - Create with items
- [x] Inventory Allocation Service - FIFO strategy
- [x] Find Available Bins API
- [x] Frontend Form - Create PO
- [x] Frontend Form - Create Receipt
- [ ] **TODO:** UI Components cần tạo thêm
  - [ ] Zone Selector Component
  - [ ] Bin Finder Component
  - [ ] Batch Info Input Component
- [ ] **TODO:** Validation
  - [ ] Validate expiry date > manufacture date
  - [ ] Validate received quantity <= ordered quantity
  - [ ] Validate bin availability
- [ ] **TODO:** Error Handling
  - [ ] No bins available
  - [ ] Partial receipt scenario
  - [ ] Email delivery failure

---

## 📝 Ghi Chú

1. **Email Token Security**: Token có thời hạn 7 ngày, sau đó hết hiệu lực
2. **Inventory on Hand**: Là hàng ảo (virtual stock) chưa bán, chỉ tăng khi có Receipt
3. **FIFO Strategy**: Phân bổ theo thứ tự Zone → Rack → Level → Number
4. **Preferred Bin**: Nếu user chọn bin cụ thể, hệ thống sẽ ưu tiên dùng bin đó hoặc bin khác trong cùng zone
5. **Batch Tracking**: Mỗi lô hàng phải có batch number và expiry date riêng

---

## 🔗 Tài Liệu Liên Quan

- [API_DOCUMENTATION.md](../ai/API_DOCUMENTATION.md) - Chi tiết API endpoints
- [PURCHASES_MODULE.md](../ai/PURCHASES_MODULE.md) - OpenAPI specs
- [INVENTORY_MANAGEMENT.md](./INVENTORY_MANAGEMENT.md) - Quản lý tồn kho
- [WAREHOUSE_MANAGEMENT.md](./WAREHOUSE_MANAGEMENT.md) - Quản lý kho

---

**Ngày tạo:** 15/11/2025  
**Người tạo:** GitHub Copilot  
**Phiên bản:** 1.0
