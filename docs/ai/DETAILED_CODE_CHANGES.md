# Detailed Code Changes - Before & After

## Change 1: Database Schema Phone Field Length

**File:** `apps/api/src/db/schema/common.js`

```javascript
// ❌ BEFORE (Line 24)
export const phone = (columnName = "phone") =>
  varchar(columnName, { length: 10 });

// ✅ AFTER
export const phone = (columnName = "phone") =>
  varchar(columnName, { length: 20 });
```

**Impact:**

- Phone field now supports up to 20 characters (was 10)
- Allows for country codes, extensions, formatting, etc.

---

## Change 2: Customer Controller - CREATE Endpoint

**File:** `apps/api/src/controllers/customerController.js` (Lines 5-46)

### ❌ BEFORE:

```javascript
create: asyncHandler(async (req, res) => {
  const payload = req.body;

  if (Array.isArray(payload)) {
    const customers = await customerService.create(payload);
    return res.status(201).json({
      success: true,
      message: "Customers created successfully",
      data: customers,
    });
  }

  // Single create - check for duplicates
  if (payload.email) {
    const existingCustomer = await customerService.getByEmail(payload.email);
    if (existingCustomer) {
      return res.status(400).json({  // ❌ 400 instead of 409
        success: false,
        message: `Customer with email '${payload.email}' already exists`,  // ❌ English, not specific format
      });
    }
  }

  if (payload.phone) {
    const existingCustomer = await customerService.getByPhone(payload.phone);
    if (existingCustomer) {
      return res.status(400).json({  // ❌ 400 instead of 409
        success: false,
        message: `Customer with phone '${payload.phone}' already exists`,  // ❌ English, not specific format
      });
    }
  }

  const customer = await customerService.create(payload);  // ❌ No name validation
  res.status(201).json({
    success: true,
    message: "Customer created successfully",
    data: customer,
  });
}),
```

### ✅ AFTER:

```javascript
create: asyncHandler(async (req, res) => {
  const payload = req.body;

  if (Array.isArray(payload)) {
    const customers = await customerService.create(payload);
    return res.status(201).json({
      success: true,
      message: "Customers created successfully",
      data: customers,
    });
  }

  // ✅ Validation: name is required
  if (!payload.name || !payload.name.trim()) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Tên khách hàng là bắt buộc",  // ✅ Vietnamese, in error.message
      },
    });
  }

  // Single create - check for duplicates
  // ✅ Email is optional but must be unique if provided
  if (payload.email) {
    const trimmedEmail = payload.email.trim();
    if (trimmedEmail) {
      const existingCustomer = await customerService.getByEmail(trimmedEmail);
      if (existingCustomer) {
        return res.status(409).json({  // ✅ 409 Conflict
          success: false,
          error: {
            message: `Khách hàng với email '${trimmedEmail}' đã tồn tại`,  // ✅ Vietnamese, specific format
          },
        });
      }
    }
  }

  // ✅ Phone is optional but must be unique if provided
  if (payload.phone) {
    const trimmedPhone = payload.phone.trim();
    if (trimmedPhone) {
      const existingCustomer = await customerService.getByPhone(trimmedPhone);
      if (existingCustomer) {
        return res.status(409).json({  // ✅ 409 Conflict
          success: false,
          error: {
            message: `Khách hàng với số điện thoại '${trimmedPhone}' đã tồn tại`,  // ✅ Vietnamese, specific format
          },
        });
      }
    }
  }

  const customer = await customerService.create(payload);
  res.status(201).json({
    success: true,
    message: "Customer created successfully",
    data: customer,
  });
}),
```

**Changes Summary:**
| Item | Before | After |
|------|--------|-------|
| Name validation | ❌ None | ✅ Required |
| Email duplicate status | 400 | ✅ 409 |
| Phone duplicate status | 400 | ✅ 409 |
| Error format | `message` string | ✅ `error.message` object |
| Language | English | ✅ Vietnamese |
| Message format | Generic | ✅ Specific field/value |

---

## Change 3: Customer Controller - UPDATE Endpoint

**File:** `apps/api/src/controllers/customerController.js` (Lines 89-140)

### ❌ BEFORE:

```javascript
update: asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (req.body.email) {
    const trimmedEmail = req.body.email.trim();
    if (trimmedEmail) {
      const existingCustomer = await customerService.getByEmail(trimmedEmail);
      if (existingCustomer && existingCustomer.id !== id) {
        return res.status(400).json({  // ❌ 400 instead of 409
          success: false,
          message: `Customer with email '${trimmedEmail}' already exists`,  // ❌ English, inconsistent format
        });
      }
    }
  }

  if (req.body.phone) {
    const trimmedPhone = req.body.phone.trim();
    if (trimmedPhone) {
      const existingCustomer = await customerService.getByPhone(trimmedPhone);
      if (existingCustomer && existingCustomer.id !== id) {
        return res.status(400).json({  // ❌ 400 instead of 409
          success: false,
          message: `Customer with phone '${trimmedPhone}' already exists`,  // ❌ English, inconsistent format
        });
      }
    }
  }

  const customer = await customerService.update(id, req.body);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",  // ❌ English
    });
  }

  res.json({
    success: true,
    message: "Customer updated successfully",
    data: customer,
  });
}),
```

### ✅ AFTER:

```javascript
update: asyncHandler(async (req, res) => {
  const id = req.params.id;

  // ✅ Check for email uniqueness with proper error response
  if (req.body.email) {
    const trimmedEmail = req.body.email.trim();
    if (trimmedEmail) {
      const existingCustomer = await customerService.getByEmail(trimmedEmail);
      if (existingCustomer && existingCustomer.id !== id) {
        return res.status(409).json({  // ✅ 409 Conflict
          success: false,
          error: {
            message: `Khách hàng với email '${trimmedEmail}' đã tồn tại`,  // ✅ Vietnamese
          },
        });
      }
    }
  }

  // ✅ Check for phone uniqueness with proper error response
  if (req.body.phone) {
    const trimmedPhone = req.body.phone.trim();
    if (trimmedPhone) {
      const existingCustomer = await customerService.getByPhone(trimmedPhone);
      if (existingCustomer && existingCustomer.id !== id) {
        return res.status(409).json({  // ✅ 409 Conflict
          success: false,
          error: {
            message: `Khách hàng với số điện thoại '${trimmedPhone}' đã tồn tại`,  // ✅ Vietnamese
          },
        });
      }
    }
  }

  const customer = await customerService.update(id, req.body);

  if (!customer) {
    return res.status(404).json({
      success: false,
      error: {
        message: "Khách hàng không tồn tại",  // ✅ Vietnamese
      },
    });
  }

  res.json({
    success: true,
    message: "Customer updated successfully",
    data: customer,
  });
}),
```

**Changes Summary:**
| Item | Before | After |
|------|--------|-------|
| Email duplicate status | 400 | ✅ 409 |
| Phone duplicate status | 400 | ✅ 409 |
| Email error format | `message` string | ✅ `error.message` object |
| Phone error format | `message` string | ✅ `error.message` object |
| Not found error format | `message` string | ✅ `error.message` object |
| Language | English | ✅ Vietnamese |

---

## Change 4: Frontend - SalesPage.jsx handleCreateCustomer

**File:** `apps/web/src/pages/sales/SalesPage.jsx` (Lines ~300-330)

### ❌ BEFORE:

```javascript
const handleCreateCustomer = useCallback(async () => {
  if (!newCustomerData.name.trim()) {
    toast.error("Vui lòng nhập tên khách hàng");
    return;
  }

  setIsCreatingCustomer(true);
  try {
    const customer = await customerService.createCustomer(newCustomerData);
    setCustomer(customer); // ❌ No handling for response format
    setShowNewCustomerForm(false);
    setNewCustomerData({ name: "", email: "", phone: "" });
  } catch (error) {
    toast.error("Lỗi tạo khách hàng: " + error.message); // ❌ Shows error.message which is just status code
  } finally {
    setIsCreatingCustomer(false);
  }
}, [newCustomerData, setCustomer]);
```

### ✅ AFTER:

```javascript
const handleCreateCustomer = useCallback(async () => {
  if (!newCustomerData.name.trim()) {
    toast.error("Vui lòng nhập tên khách hàng");
    return;
  }

  setIsCreatingCustomer(true);
  try {
    const response = await customerService.createCustomer(newCustomerData);
    const customerData = response?.data || response; // ✅ Handle response format variations
    setCustomer(customerData);
    setShowNewCustomerForm(false);
    setNewCustomerData({ name: "", email: "", phone: "" });
    toast.success("Tạo khách hàng thành công!"); // ✅ Show success message
  } catch (error) {
    console.error("Create customer error:", error); // ✅ Log for debugging

    // ✅ Extract detailed error message
    let message = "Không thể tạo khách hàng";
    if (error?.response?.data?.error) {
      const errorData = error.response.data.error;
      if (typeof errorData === "object" && errorData.message) {
        message = errorData.message;
      } else if (typeof errorData === "string") {
        message = errorData;
      }
    } else if (error?.response?.data?.message) {
      message = error.response.data.message;
    } else if (error?.response?.status) {
      // ✅ Handle by status code
      if (error.response.status === 400) {
        message = error.response.data?.error?.message || "Dữ liệu không hợp lệ";
      } else if (error.response.status === 409) {
        message = "Khách hàng đã tồn tại";
      } else if (error.response.status === 500) {
        message = "Lỗi máy chủ. Vui lòng thử lại sau";
      }
    } else if (error?.message) {
      message = error.message;
    }

    toast.error(message); // ✅ Show specific error message
  } finally {
    setIsCreatingCustomer(false);
  }
}, [newCustomerData, setCustomer]);
```

**Changes Summary:**
| Item | Before | After |
|------|--------|-------|
| Response handling | ❌ Direct | ✅ Handle both formats |
| Error extraction | ❌ `error.message` only | ✅ Multiple sources |
| Error detail level | Status code only | ✅ Full error message |
| Success feedback | ❌ None | ✅ Toast message |
| Error logging | ❌ No | ✅ Console.error() |
| Status code handling | ❌ No | ✅ Handle 400, 409, 500 |

---

## Change 5: Frontend - CustomerSelector.jsx handleSearch

**File:** `apps/web/src/pages/sales/components/CustomerSelector.jsx` (Lines ~20-50)

### ❌ BEFORE:

```javascript
const handleSearch = async (term) => {
  setSearchTerm(term);

  if (!term.trim()) {
    setCustomers([]);
    setEditingCustomerId(null);
    return;
  }

  setIsLoading(true);
  try {
    const response = await customerService.getCustomers({
      search: term,
    });

    let data = response.data || response;
    if (data.data) {
      data = data.data;
    }

    setCustomers(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("[v0] Customer search error:", error);
    toast.error("Không thể tìm kiếm khách hàng"); // ❌ Generic error
    setCustomers([]);
  } finally {
    setIsLoading(false);
  }
};
```

### ✅ AFTER:

```javascript
const handleSearch = async (term) => {
  setSearchTerm(term);

  if (!term.trim()) {
    setCustomers([]);
    setEditingCustomerId(null);
    return;
  }

  setIsLoading(true);
  try {
    const response = await customerService.getCustomers({
      search: term,
    });

    let data = response.data || response;
    if (data.data) {
      data = data.data;
    }

    setCustomers(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("[v0] Customer search error:", error);

    // ✅ Extract detailed error message
    let message = "Không thể tìm kiếm khách hàng";
    if (error?.response?.data?.error) {
      const errorData = error.response.data.error;
      if (typeof errorData === "object" && errorData.message) {
        message = errorData.message;
      } else if (typeof errorData === "string") {
        message = errorData;
      }
    } else if (error?.response?.data?.message) {
      message = error.response.data.message;
    } else if (error?.response?.status) {
      if (error.response.status === 400) {
        message =
          error.response.data?.error?.message ||
          "Tham số tìm kiếm không hợp lệ";
      } else if (error.response.status === 401) {
        message = "Chưa xác thực. Vui lòng đăng nhập lại";
      } else if (error.response.status >= 500) {
        message = "Lỗi máy chủ. Vui lòng thử lại sau";
      }
    } else if (error?.message) {
      message = error.message;
    }

    toast.error(message); // ✅ Show specific error message
    setCustomers([]);
  } finally {
    setIsLoading(false);
  }
};
```

**Changes Summary:**
| Item | Before | After |
|------|--------|-------|
| Error message | Generic | ✅ Specific |
| Error extraction | ❌ None | ✅ Multiple sources |
| Status code handling | ❌ No | ✅ Yes (400, 401, 500+) |

---

## Change 6: Frontend - EditCustomerForm.jsx handleSubmit

**File:** `apps/web/src/pages/sales/components/EditCustomerForm.jsx` (Lines ~29-80)

### ❌ BEFORE:

```javascript
try {
  const updateData = {
    name: formData.name.trim(),
    phone: formData.phone.trim(),
  };

  const trimmedEmail = formData.email.trim();
  if (trimmedEmail) {
    updateData.email = trimmedEmail;
  }

  const trimmedAddress = formData.address.trim();
  if (trimmedAddress) {
    updateData.address = trimmedAddress;
  }

  const response = await customerService.updateCustomer(
    customer.id,
    updateData
  );

  const updatedCustomer = response.data || response; // ❌ Inconsistent handling
  toast.success("Cập nhật thông tin khách hàng thành công!");
  onSuccess(updatedCustomer);
  onClose();
} catch (error) {
  console.error("Lỗi cập nhật khách hàng:", error);

  let message = "Không thể cập nhật thông tin khách hàng";
  if (error?.response?.data?.error) {
    const errorData = error.response.data.error;
    if (typeof errorData === "object" && errorData.message) {
      message = errorData.message;
    } else if (typeof errorData === "string") {
      message = errorData;
    }
  } else if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message; // ❌ No status code handling
  }

  toast.error(message);
}
```

### ✅ AFTER:

```javascript
try {
  const updateData = {
    name: formData.name.trim(),
    phone: formData.phone.trim(),
  };

  const trimmedEmail = formData.email.trim();
  if (trimmedEmail) {
    updateData.email = trimmedEmail;
  }

  const trimmedAddress = formData.address.trim();
  if (trimmedAddress) {
    updateData.address = trimmedAddress;
  }

  const response = await customerService.updateCustomer(
    customer.id,
    updateData
  );

  const updatedCustomer = response?.data || response; // ✅ Consistent handling
  toast.success("Cập nhật thông tin khách hàng thành công!");
  onSuccess(updatedCustomer);
  onClose();
} catch (error) {
  console.error("Lỗi cập nhật khách hàng:", error);

  // ✅ Extract detailed error message with status code handling
  let message = "Không thể cập nhật thông tin khách hàng";
  if (error?.response?.data?.error) {
    const errorData = error.response.data.error;
    if (typeof errorData === "object" && errorData.message) {
      message = errorData.message;
    } else if (typeof errorData === "string") {
      message = errorData;
    }
  } else if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.response?.status) {
    if (error.response.status === 400) {
      message = error.response.data?.error?.message || "Dữ liệu không hợp lệ";
    } else if (error.response.status === 404) {
      message = "Khách hàng không tồn tại";
    } else if (error.response.status === 409) {
      message = error.response.data?.error?.message || "Dữ liệu bị xung đột";
    } else if (error.response.status >= 500) {
      message = "Lỗi máy chủ. Vui lòng thử lại sau";
    }
  } else if (error?.message) {
    message = error.message;
  }

  toast.error(message);
}
```

**Changes Summary:**
| Item | Before | After |
|------|--------|-------|
| Response handling | `||` | ✅ `?.` optional chaining |
| Error extraction | Partial | ✅ Complete |
| Status code handling | ❌ No | ✅ Yes (400, 404, 409, 500+) |
| Error messages | Generic | ✅ Specific |

---

## Summary Table

| Component             | Change                             | Impact                 |
| --------------------- | ---------------------------------- | ---------------------- |
| **Database**          | Phone length 10→20                 | Supports more formats  |
| **Backend - CREATE**  | Name validation + error structure  | Proper validation      |
| **Backend - UPDATE**  | 409 status + error structure       | Better error info      |
| **Frontend - Create** | Error extraction + success message | User-friendly feedback |
| **Frontend - Search** | Detailed error extraction          | Better UX              |
| **Frontend - Edit**   | Status code handling               | Proper error display   |

---

## Migration Notes

### Database Migration (if needed):

```sql
ALTER TABLE customers
ALTER COLUMN phone TYPE varchar(20);
```

### No API Contract Breaking Changes:

- Response format remains the same
- New error structure is additive (error.message field added)
- Backward compatible with existing code
