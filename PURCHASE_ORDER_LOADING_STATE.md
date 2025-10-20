# Loading State Implementation for Purchase Order Creation

## ✅ Changes Made

### Frontend - Purchase Order Create Page

**File:** `apps/web/src/pages/purchaseOrder/PurchaseOrderCreatePage.jsx`

### 1. Added Loading State

```javascript
const [isSubmitting, setIsSubmitting] = useState(false);
```

### 2. Updated Submit Handler

- Set `isSubmitting = true` before processing
- Set `isSubmitting = false` in `finally` block to ensure it's reset even on error

### 3. Enhanced Submit Button

**Before:**

```jsx
<Button disabled={!supplierId || selectedItems.length === 0}>
  Create Purchase Order
</Button>
```

**After:**

```jsx
<Button disabled={!supplierId || selectedItems.length === 0 || isSubmitting}>
  {isSubmitting ? (
    <div className="flex items-center justify-center gap-2">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span>Creating Purchase Order & Sending Email...</span>
    </div>
  ) : (
    "Create Purchase Order"
  )}
</Button>
```

### 4. Disabled Form Controls During Submission

All interactive elements are disabled while `isSubmitting === true`:

- ✅ **Supplier Select** - Cannot change supplier
- ✅ **Add Item Button** - Cannot add new items
- ✅ **Medication Select** (in table) - Cannot change medication
- ✅ **Quantity Input** - Cannot modify quantity
- ✅ **Unit Price Input** - Cannot modify price
- ✅ **Remove Item Button** - Cannot remove items
- ✅ **Submit Button** - Shows loading state

## 🎯 User Experience Flow

1. User fills out form and clicks "Create Purchase Order"
2. Button immediately shows:
   - ✅ Spinning loader icon (Loader2 component)
   - ✅ Text: "Creating Purchase Order & Sending Email..."
   - ✅ All form controls become disabled
3. Backend processes:
   - Creates Purchase Order in database
   - Sends email to supplier
4. When complete:
   - ✅ Success toast: "Purchase order created and email sent successfully!"
   - ⚠️ Warning toast: "Purchase order created, but email notification failed."
   - ❌ Error toast: Shows specific error message
5. Loading state is removed and user is redirected to PO list

## 🔒 Benefits

1. **Prevents Double Submission** - Button disabled during processing
2. **Clear Visual Feedback** - User knows something is happening
3. **Prevents Data Corruption** - Form locked during submission
4. **Better UX** - User understands the process takes time (especially email sending)
5. **Error Safety** - `finally` block ensures state is always reset

## 📱 Visual Design

- **Loader Icon:** Animated spinning icon from `lucide-react`
- **Text:** Clear message explaining what's happening
- **Button State:** Dimmed/disabled appearance
- **Cursor:** Changes to `not-allowed` when disabled

## 🧪 Testing Checklist

- [ ] Button shows loading state when clicked
- [ ] All form inputs are disabled during submission
- [ ] Loading text is clear and informative
- [ ] Success toast appears after completion
- [ ] Error handling works correctly
- [ ] Loading state is removed after error
- [ ] Cannot double-click submit button

---

**Implementation Date:** October 18, 2025
**Status:** ✅ Complete and Ready for Testing
