# Inventory Batch Unlinking Implementation

## Overview

Implemented automatic unlinking of batch from bin when inventory quantity becomes zero after sales transactions.

## Business Logic

When a batch's available quantity is fully consumed (quantity = quantity_reserved or quantity = 0), the inventory record should be deleted, effectively unlinking the batch from the bin. This keeps the warehouse organized and shows only bins with actual stock.

## Implementation Details

### Modified File: `apps/api/src/services/salesOrderService.js`

#### 1. Sales Order Creation (Direct Reduction)

When creating a sales order with `completed` status, inventory is immediately reduced:

```javascript
// Reserve inventory using FEFO - Reduce quantity directly
let remainingQuantity = quantity;
for (const inv of availableInventory) {
  if (remainingQuantity <= 0) {
    break;
  }

  const availableInBatch = Number(inv.quantityAvailable);
  const toSell = Math.min(remainingQuantity, availableInBatch);

  // Calculate the new quantity after reduction
  const currentQuantity = Number(inv.quantity);
  const currentReserved = Number(inv.quantityReserved);
  const newQuantity = currentQuantity - toSell;

  // If quantity becomes equal to quantityReserved (all available stock used),
  // delete the inventory record (unlink batch from bin)
  if (newQuantity <= currentReserved) {
    await tx.delete(inventory).where(eq(inventory.id, inv.id));
  } else {
    // Otherwise, reduce quantity normally
    await tx
      .update(inventory)
      .set({
        quantity: sql`${inventory.quantity} - ${toSell}`,
      })
      .where(eq(inventory.id, inv.id));
  }

  remainingQuantity -= toSell;
}
```

**Key Points:**
- Checks if `newQuantity <= currentReserved` (all available stock used)
- Deletes inventory record when condition is met
- Otherwise, updates quantity normally

#### 2. Sales Order Status Update (Pending → Completed)

When completing an order, both `quantity` and `quantityReserved` are reduced:

```javascript
// If completing order: deduct inventory
if (newStatus === "completed" && currentOrder.status === "pending") {
  for (const item of items) {
    // Deduct reserved quantity from inventory (FEFO)
    let remainingQuantity = Number(item.quantity);

    const inventoryRecords = await tx
      .select({
        id: inventory.id,
        quantity: inventory.quantity,
        quantityReserved: inventory.quantityReserved,
      })
      .from(inventory)
      .where(
        and(
          eq(inventory.medicationVariantId, item.medicationVariantId),
          sql`${inventory.quantityReserved} > 0`
        )
      )
      .orderBy(inventory.expiryDate);

    for (const inv of inventoryRecords) {
      if (remainingQuantity <= 0) {
        break;
      }

      const reserved = Number(inv.quantityReserved);
      const toDeduct = Math.min(remainingQuantity, reserved);

      // Calculate the new quantity after deduction
      const currentQuantity = Number(inv.quantity);
      const newQuantity = currentQuantity - toDeduct;

      // If quantity becomes 0, delete the inventory record (unlink batch from bin)
      if (newQuantity <= 0) {
        await tx.delete(inventory).where(eq(inventory.id, inv.id));
      } else {
        // Otherwise, update the quantities
        await tx
          .update(inventory)
          .set({
            quantity: sql`${inventory.quantity} - ${toDeduct}`,
            quantityReserved: sql`${inventory.quantityReserved} - ${toDeduct}`,
          })
          .where(eq(inventory.id, inv.id));
      }

      remainingQuantity -= toDeduct;
    }
  }
}
```

**Key Points:**
- Checks if `newQuantity <= 0` after deduction
- Deletes inventory record when quantity becomes zero
- Otherwise, updates both `quantity` and `quantityReserved`

## Benefits

1. **Clean Warehouse View**: Only bins with actual stock are shown
2. **Accurate Availability**: No confusion from empty batches in bins
3. **Automatic Cleanup**: No manual intervention required
4. **Transaction Safety**: All operations happen within database transactions
5. **FEFO Compliance**: Follows First Expired First Out strategy

## Database Impact

- **DELETE Operations**: Inventory records with quantity = 0 are automatically removed
- **No Schema Changes**: Uses existing inventory table structure
- **Foreign Key Safety**: Deletion is safe as inventory records don't have dependent records that would break

## Testing Scenarios

### Scenario 1: Complete Stock Depletion
```
Initial State:
- Batch A: quantity=10, quantityReserved=0
- Bin B01 contains Batch A

Action: Sell 10 units

Expected Result:
- Inventory record deleted
- Bin B01 becomes empty
```

### Scenario 2: Partial Stock Depletion
```
Initial State:
- Batch A: quantity=50, quantityReserved=0
- Bin B01 contains Batch A

Action: Sell 10 units

Expected Result:
- Batch A: quantity=40, quantityReserved=0
- Bin B01 still contains Batch A
```

### Scenario 3: Multiple Batches (FEFO)
```
Initial State:
- Batch A: quantity=5, expiry=2025-12-01 (in Bin B01)
- Batch B: quantity=20, expiry=2026-03-15 (in Bin B02)

Action: Sell 10 units

Expected Result:
- Batch A inventory record deleted (5 units used)
- Batch B: quantity=15 (5 units used)
- Bin B01 becomes empty
- Bin B02 still contains Batch B
```

## Related Files

- `apps/api/src/services/salesOrderService.js` - Main implementation
- `apps/api/src/services/inventoryService.js` - Contains `deleteEmptyInventoryTx` helper method
- `apps/api/src/db/schema/inventory.js` - Inventory table schema

## Future Enhancements

1. **Audit Trail**: Log batch-bin unlinking events in audit logs
2. **Notifications**: Alert warehouse staff when bins become empty
3. **Analytics**: Track batch turnover rates and bin utilization
4. **Batch Consolidation**: Auto-suggest moving remaining batches to optimize space

## Notes

- The implementation leverages existing `deleteEmptyInventoryTx` method for additional cleanup
- All operations are wrapped in database transactions for data consistency
- The logic applies to both direct sales (completed orders) and pending→completed status transitions
