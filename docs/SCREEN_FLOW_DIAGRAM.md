---
config:
  layout: elk
---

flowchart LR
Login["Login Page"] <--> Register["Register Page"]
Login --> ForgotPassword["Forgot Password"] & Dashboard["Dashboard (OWNER)"] & Sales["Sales / POS (Shared)"] & MedList["Medication List (Shared)"] & StockOverview["Stock Overview (Shared)"]
ForgotPassword --> ResetPassword["Reset Password"]
Register <--> Policy["Policy Page"]
NotFound["Not Found 404"] --> Login
Dashboard --> UserList["User List (OWNER)"] & SupplierList["Supplier List (OWNER)"] & POList["PO List (OWNER)"] & ShiftMgmt["Shift Management (OWNER)"] & MedList & StockOverview & Sales
UserList <--> RegRequests["Registration Requests (OWNER)"]
UserList --> UserProfile["User Profile (Shared)"]
SupplierList <--> SupplierDetail["Supplier Detail (OWNER)"]
SupplierDetail --> MedList
MedList <--> MedDetail["Medication Detail (Shared)"]
MedDetail <--> MedVariants["Medication Variants (Shared)"]
POList <--> PODetail["PO Detail (OWNER)"] & POCreate["PO Create (OWNER)"]
PODetail --> PORList["Receipt List (OWNER)"]
PORList <--> PORDetail["Receipt Detail (OWNER)"] & PORCreate["Receipt Create (OWNER)"]
ShiftMgmt <--> ShiftAssign["Shift Assignment (OWNER)"]
Sales <--> SalesOrderList["Sales Order List (Shared)"]
SalesOrderList <--> SalesOrderDetail["Sales Order Detail (Shared)"]
StockOverview <--> Warehouse["Warehouse (Shared)"]
Warehouse <--> InventoryTracking["Inventory Tracking (Shared)"]
UserProfile --> Dashboard & Sales
MySchedule["My Schedule (STAFF)"] --> Dashboard
Login:::authStyle
Register:::authStyle
ForgotPassword:::authStyle
Policy:::authStyle
ResetPassword:::authStyle
NotFound:::authStyle
Dashboard:::ownerOnly
UserList:::ownerOnly
RegRequests:::ownerOnly
SupplierList:::ownerOnly
SupplierDetail:::ownerOnly
MedList:::shared
MedDetail:::shared
MedVariants:::shared
POList:::ownerOnly
PODetail:::ownerOnly
POCreate:::ownerOnly
PORList:::ownerOnly
PORDetail:::ownerOnly
PORCreate:::ownerOnly
ShiftMgmt:::ownerOnly
ShiftAssign:::ownerOnly
MySchedule:::staffOnly
Sales:::shared
SalesOrderList:::shared
SalesOrderDetail:::shared
StockOverview:::shared
Warehouse:::shared
InventoryTracking:::shared
UserProfile:::shared
classDef authStyle fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000
classDef ownerOnly fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#000
classDef staffOnly fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000
classDef shared fill:#fff8e1,stroke:#f57f17,stroke-width:2px,color:#000
