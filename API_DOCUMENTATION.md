# API Documentation - PharmaFlow System

> Tài liệu tổng hợp tất cả API endpoints được nhóm theo chức năng

**Base URL**: `/api`

---

## 📋 Mục lục

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Registration Management](#2-registration-management)
3. [User Management](#3-user-management)
4. [Customer Management](#4-customer-management)
5. [Medication Management](#5-medication-management)
6. [Medication Variants](#6-medication-variants)
7. [Supplier Management](#7-supplier-management)
8. [Supplier-Medication Relationship](#8-supplier-medication-relationship)
9. [Purchase Order Management](#9-purchase-order-management)
10. [Purchase Order Receipts](#10-purchase-order-receipts)
11. [Inventory Management](#11-inventory-management)
12. [Sales Order Management](#12-sales-order-management)
13. [Warehouse Management](#13-warehouse-management)
14. [Report Management](#14-report-management)
15. [Shift Management](#15-shift-management)
16. [Shift Assignment Management](#16-shift-assignment-management)
17. [Email Services](#17-email-services)

---

## 1. Authentication & Authorization

**Base Path**: `/api/auth`

| Method | Endpoint           | Access  | Mô tả                                                                                         |
| ------ | ------------------ | ------- | --------------------------------------------------------------------------------------------- |
| POST   | `/register`        | Public  | Đăng ký người dùng mới (user đầu tiên trở thành owner, các user sau tạo registration request) |
| POST   | `/login`           | Public  | Đăng nhập và nhận JWT token                                                                   |
| POST   | `/logout`          | Public  | Đăng xuất (client-side token removal)                                                         |
| POST   | `/reset-password`  | Public  | Reset mật khẩu khi quên (yêu cầu email và newPassword)                                        |
| POST   | `/change-password` | Private | Đổi mật khẩu cho user đã đăng nhập (yêu cầu oldPassword và newPassword)                       |

---

## 2. Registration Management

**Base Path**: `/api/registrations`

**Note**: Tất cả endpoints yêu cầu quyền Owner

| Method | Endpoint       | Access | Mô tả                                                                  |
| ------ | -------------- | ------ | ---------------------------------------------------------------------- |
| GET    | `/`            | Owner  | Lấy danh sách tất cả registration requests (có thể filter theo status) |
| GET    | `/:id`         | Owner  | Lấy chi tiết registration request theo ID                              |
| POST   | `/:id/approve` | Owner  | Phê duyệt registration request và tạo user account                     |
| POST   | `/:id/reject`  | Owner  | Từ chối registration request                                           |
| DELETE | `/:id`         | Owner  | Xóa registration request                                               |

---

## 3. User Management

**Base Path**: `/api/users`

| Method | Endpoint          | Access                             | Mô tả                                                                    |
| ------ | ----------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| GET    | `/staff`          | Owner                              | Lấy danh sách tất cả staff accounts với filtering (search, role, status) |
| GET    | `/`               | Owner                              | Lấy danh sách tất cả users (có thể search theo name, email, phone)       |
| GET    | `/:id`            | Private (Owner hoặc chính user đó) | Lấy thông tin user theo ID                                               |
| POST   | `/`               | Owner                              | Tạo user mới                                                             |
| PUT    | `/:id`            | Owner                              | Cập nhật thông tin user                                                  |
| DELETE | `/:id`            | Owner                              | Xóa user                                                                 |
| PATCH  | `/:id/activate`   | Owner                              | Kích hoạt tài khoản user                                                 |
| PATCH  | `/:id/deactivate` | Owner                              | Vô hiệu hóa tài khoản user                                               |
| PATCH  | `/:id/suspend`    | Owner                              | Tạm ngưng tài khoản user                                                 |

---

## 4. Customer Management

**Base Path**: `/api/customers`

| Method | Endpoint | Access  | Mô tả                                             |
| ------ | -------- | ------- | ------------------------------------------------- |
| GET    | `/`      | Private | Lấy danh sách tất cả khách hàng                   |
| GET    | `/:id`   | Private | Lấy thông tin khách hàng theo ID                  |
| POST   | `/`      | Private | Tạo khách hàng mới (hỗ trợ tạo đơn lẻ hoặc batch) |
| PATCH  | `/:id`   | Private | Cập nhật thông tin khách hàng                     |
| DELETE | `/:id`   | Owner   | Xóa khách hàng                                    |

---

## 5. Medication Management

**Base Path**: `/api/medications`

| Method | Endpoint                    | Access  | Mô tả                                                   |
| ------ | --------------------------- | ------- | ------------------------------------------------------- |
| GET    | `/`                         | Private | Lấy danh sách tất cả medications với filtering          |
| GET    | `/variants/search-for-sale` | Private | Tìm kiếm variants cho POS/Sales kèm thông tin inventory |
| GET    | `/variants/all`             | Private | Lấy tất cả variants (không phân biệt medication)        |
| GET    | `/:id`                      | Private | Lấy thông tin medication theo ID                        |
| GET    | `/:id/inventory`            | Private | Lấy thông tin inventory của medication                  |
| GET    | `/:id/suppliers`            | Private | Lấy danh sách suppliers cung cấp medication             |
| GET    | `/:id/purchases`            | Private | Lấy danh sách purchase orders chứa medication           |
| GET    | `/:id/sales`                | Private | Lấy danh sách sales orders chứa medication              |
| GET    | `/variants/:id/inventory`   | Private | Lấy thông tin inventory của một variant cụ thể          |
| POST   | `/`                         | Owner   | Tạo medication mới (batch)                              |
| PATCH  | `/:id`                      | Owner   | Cập nhật thông tin medication                           |
| DELETE | `/:id`                      | Owner   | Xóa medication                                          |

---

## 6. Medication Variants

**Base Path**: `/api/medications/:medicationId/variants`

| Method | Endpoint | Access  | Mô tả                                   |
| ------ | -------- | ------- | --------------------------------------- |
| GET    | `/`      | Private | Lấy tất cả variants của một medication  |
| GET    | `/:id`   | Private | Lấy thông tin variant theo ID           |
| POST   | `/`      | Owner   | Tạo variants mới cho medication (batch) |
| PATCH  | `/:id`   | Owner   | Cập nhật thông tin variant              |
| DELETE | `/:id`   | Owner   | Xóa variant                             |

---

## 7. Supplier Management

**Base Path**: `/api/suppliers`

| Method | Endpoint | Access  | Mô tả                                        |
| ------ | -------- | ------- | -------------------------------------------- |
| GET    | `/`      | Private | Lấy danh sách tất cả suppliers với filtering |
| GET    | `/:id`   | Private | Lấy thông tin supplier theo ID               |
| POST   | `/`      | Owner   | Tạo suppliers mới (batch)                    |
| PATCH  | `/:id`   | Owner   | Cập nhật thông tin supplier                  |
| DELETE | `/:id`   | Owner   | Xóa supplier                                 |

---

## 8. Supplier-Medication Relationship

**Base Path**: `/api/suppliers/:supplierId/medications`

| Method | Endpoint | Access  | Mô tả                                                         |
| ------ | -------- | ------- | ------------------------------------------------------------- |
| GET    | `/`      | Private | Lấy tất cả medication variants mà supplier cung cấp           |
| GET    | `/:id`   | Private | Lấy thông tin supplier-medication variant theo ID             |
| POST   | `/`      | Owner   | Thêm medication variants vào supplier (batch)                 |
| PATCH  | `/:id`   | Owner   | Cập nhật thông tin supplier-medication (giá, lead time, v.v.) |
| DELETE | `/:id`   | Owner   | Xóa medication variant khỏi supplier                          |

---

## 9. Purchase Order Management

**Base Path**: `/api/purchases`

| Method | Endpoint | Access  | Mô tả                                                   |
| ------ | -------- | ------- | ------------------------------------------------------- |
| GET    | `/`      | Private | Lấy danh sách tất cả purchase orders với filtering      |
| GET    | `/:id`   | Private | Lấy thông tin purchase order theo ID kèm items          |
| POST   | `/`      | Owner   | Tạo purchase orders mới (batch)                         |
| PATCH  | `/:id`   | Owner   | Cập nhật thông tin purchase order (status, notes, v.v.) |
| DELETE | `/:id`   | Owner   | Xóa purchase order                                      |

---

## 10. Purchase Order Receipts

**Standalone Base Path**: `/api/purchases/receipts`  
**Nested Base Path**: `/api/purchases/:purchaseOrderId/receipts`

### Standalone Routes

| Method | Endpoint        | Access  | Mô tả                                        |
| ------ | --------------- | ------- | -------------------------------------------- |
| GET    | `/receipts`     | Private | Lấy tất cả receipts (tất cả purchase orders) |
| GET    | `/receipts/:id` | Private | Lấy thông tin receipt theo ID                |

### Nested Routes (theo Purchase Order)

| Method | Endpoint                         | Access  | Mô tả                                          |
| ------ | -------------------------------- | ------- | ---------------------------------------------- |
| GET    | `/:purchaseOrderId/receipts`     | Private | Lấy tất cả receipts của một purchase order     |
| GET    | `/:purchaseOrderId/receipts/:id` | Private | Lấy receipt theo ID trong một purchase order   |
| POST   | `/:purchaseOrderId/receipts`     | Owner   | Tạo receipt mới cho purchase order (nhập hàng) |

---

## 11. Inventory Management

**Base Path**: `/api/inventory`

| Method | Endpoint                            | Access  | Mô tả                                                      |
| ------ | ----------------------------------- | ------- | ---------------------------------------------------------- |
| GET    | `/`                                 | Private | Lấy danh sách tất cả inventory với filtering               |
| GET    | `/summary/by-variant`               | Private | Lấy tổng hợp inventory theo variant (tổng quantity, value) |
| GET    | `/expiring`                         | Private | Lấy danh sách inventory sắp hết hạn                        |
| GET    | `/low-stock`                        | Private | Lấy danh sách inventory có stock thấp                      |
| GET    | `/batches/:inventoryBatchId`        | Private | Lấy thông tin inventory batch theo ID                      |
| PATCH  | `/batches/:inventoryBatchId`        | Owner   | Cập nhật thông tin inventory batch                         |
| PATCH  | `/batches/:inventoryBatchId/adjust` | Owner   | Điều chỉnh số lượng inventory (tăng/giảm)                  |
| POST   | `/move`                             | Owner   | Di chuyển inventory giữa các bins                          |

---

## 12. Sales Order Management

**Base Path**: `/api/sales`

| Method | Endpoint | Access  | Mô tả                                                        |
| ------ | -------- | ------- | ------------------------------------------------------------ |
| GET    | `/`      | Private | Lấy danh sách tất cả sales orders với filtering              |
| GET    | `/:id`   | Private | Lấy thông tin sales order theo ID kèm items và customer      |
| POST   | `/`      | Private | Tạo sales order mới (POS/bán hàng)                           |
| PATCH  | `/:id`   | Private | Cập nhật status của sales order (paid, delivered, cancelled) |
| DELETE | `/:id`   | Owner   | Hủy sales order                                              |

---

## 13. Warehouse Management

**Base Path**: `/api/warehouse`

### 13.1. Warehouse Zones

| Method | Endpoint       | Access  | Mô tả                          |
| ------ | -------------- | ------- | ------------------------------ |
| GET    | `/zones`       | Private | Lấy danh sách tất cả zones     |
| GET    | `/zones/:id`   | Private | Lấy thông tin zone theo ID     |
| POST   | `/zones`       | Owner   | Tạo zone mới (đơn lẻ)          |
| POST   | `/zones/batch` | Owner   | Tạo nhiều zones với mã tự động |
| PATCH  | `/zones/:id`   | Owner   | Cập nhật thông tin zone        |
| DELETE | `/zones/:id`   | Owner   | Xóa zone                       |

### 13.2. Warehouse Racks

| Method | Endpoint                     | Access  | Mô tả                           |
| ------ | ---------------------------- | ------- | ------------------------------- |
| GET    | `/racks`                     | Private | Lấy tất cả racks (tất cả zones) |
| GET    | `/zones/:zoneId/racks`       | Private | Lấy tất cả racks trong một zone |
| GET    | `/racks/:id`                 | Private | Lấy thông tin rack theo ID      |
| POST   | `/zones/:zoneId/racks`       | Owner   | Tạo rack mới trong zone         |
| POST   | `/zones/:zoneId/racks/batch` | Owner   | Tạo nhiều racks với mã tự động  |
| PATCH  | `/racks/:id`                 | Owner   | Cập nhật thông tin rack         |
| DELETE | `/racks/:id`                 | Owner   | Xóa rack                        |

### 13.3. Warehouse Bins

| Method | Endpoint                    | Access  | Mô tả                          |
| ------ | --------------------------- | ------- | ------------------------------ |
| GET    | `/bins`                     | Private | Lấy tất cả bins (tất cả racks) |
| GET    | `/racks/:rackId/bins`       | Private | Lấy tất cả bins trong một rack |
| GET    | `/bins/:id`                 | Private | Lấy thông tin bin theo ID      |
| GET    | `/bins/:id/inventory`       | Private | Lấy tất cả inventory trong bin |
| POST   | `/racks/:rackId/bins`       | Owner   | Tạo bin mới trong rack         |
| POST   | `/racks/:rackId/bins/batch` | Owner   | Tạo nhiều bins với mã tự động  |
| PATCH  | `/bins/:id`                 | Owner   | Cập nhật thông tin bin         |
| DELETE | `/bins/:id`                 | Owner   | Xóa bin                        |

---

## 14. Report Management

**Base Path**: `/api/reports`

| Method | Endpoint   | Access  | Mô tả                                      |
| ------ | ---------- | ------- | ------------------------------------------ |
| GET    | `/`        | Private | Lấy danh sách tất cả reports với filtering |
| GET    | `/:id`     | Private | Lấy thông tin report theo ID               |
| GET    | `/daily`   | Private | Tạo báo cáo bán hàng theo ngày             |
| GET    | `/weekly`  | Private | Tạo báo cáo bán hàng theo tuần             |
| GET    | `/monthly` | Private | Tạo báo cáo bán hàng theo tháng            |
| POST   | `/`        | Private | Tạo/generate report mới                    |
| DELETE | `/:id`     | Owner   | Xóa report                                 |

---

## 15. Shift Management

**Base Path**: `/api/shifts`

**Note**: Quản lý định nghĩa ca làm việc (shift templates)

| Method | Endpoint          | Access  | Mô tả                                                                       |
| ------ | ----------------- | ------- | --------------------------------------------------------------------------- |
| GET    | `/`               | Private | Lấy tất cả shifts (định nghĩa ca làm việc)                                  |
| GET    | `/:id`            | Private | Lấy thông tin shift theo ID                                                 |
| GET    | `/:shiftId/staff` | Private | Lấy danh sách nhân viên làm việc trong ca này vào ngày cụ thể (query: date) |
| POST   | `/`               | Owner   | Tạo shift mới                                                               |
| PATCH  | `/:id`            | Owner   | Cập nhật thông tin shift                                                    |
| DELETE | `/:id`            | Owner   | Xóa shift                                                                   |

---

## 16. Shift Assignment Management

**Base Path**: `/api/shift-assignments`

**Note**: Quản lý phân ca cho nhân viên theo ngày

| Method | Endpoint         | Access  | Mô tả                                                                              |
| ------ | ---------------- | ------- | ---------------------------------------------------------------------------------- |
| GET    | `/`              | Private | Lấy tất cả shift assignments (filter: userId, shiftId, startDate, endDate, status) |
| GET    | `/:id`           | Private | Lấy thông tin shift assignment theo ID                                             |
| POST   | `/`              | Owner   | Tạo shift assignment (hỗ trợ single hoặc batch)                                    |
| PATCH  | `/:id`           | Owner   | Cập nhật shift assignment (status, notes)                                          |
| POST   | `/:id/check-in`  | Private | Check-in vào ca làm việc (bắt đầu làm)                                             |
| POST   | `/:id/check-out` | Private | Check-out khỏi ca làm việc (kết thúc)                                              |
| DELETE | `/:id`           | Owner   | Xóa shift assignment                                                               |

---

## 17. Email Services

**Base Path**: `/api`

| Method | Endpoint                     | Access  | Mô tả                                 |
| ------ | ---------------------------- | ------- | ------------------------------------- |
| POST   | `/send-purchase-order-email` | Private | Gửi email purchase order đến supplier |

---

## 🔐 Access Levels

- **Public**: Không cần authentication
- **Private**: Cần authentication (JWT token)
- **Owner**: Cần authentication và role `owner`
- **Private (Owner hoặc chính user đó)**: User có thể truy cập data của chính mình, owner có thể truy cập tất cả

---

## 📝 Notes

1. **Authentication**: Sử dụng JWT token trong header `Authorization: Bearer <token>`
2. **Pagination**: Hầu hết list endpoints hỗ trợ query params cho pagination (`page`, `limit`)
3. **Filtering**: Nhiều endpoints hỗ trợ filtering qua query params (xem từng endpoint cụ thể)
4. **Batch Operations**: Một số endpoints hỗ trợ tạo nhiều records cùng lúc (medications, variants, suppliers, v.v.)
5. **Nested Routes**: Một số resources có nested routes để thể hiện mối quan hệ (ví dụ: medications/:id/variants)
6. **UUID v7**: Tất cả IDs sử dụng UUID version 7

---

## 🔄 Common Query Parameters

### List Endpoints (GET /)

- `page` - Số trang (default: 1)
- `limit` - Số records mỗi trang (default: 10)
- `search` - Tìm kiếm text
- `sortBy` - Sắp xếp theo field
- `sortOrder` - Thứ tự sắp xếp (asc/desc)

### Filtering

- Tùy từng endpoint có các filter params khác nhau
- Ví dụ: `status`, `role`, `customerId`, `supplierId`, v.v.

---

**Last Updated**: October 21, 2025  
**API Version**: 1.0.0
