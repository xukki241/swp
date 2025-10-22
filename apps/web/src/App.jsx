import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";
import DashboardPage from "@/pages/Dashboard";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import LoginPage from "@/pages/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";
import POSPage from "@/pages/POSPage";
import PolicyPage from "@/pages/PolicyPage";
import RegisterPage from "@/pages/RegisterPage";
import RegistrationRequestsPage from "@/pages/RegistrationRequestsPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import UserListPage from "@/pages/UserListPage";
import UserProfilePage from "@/pages/UserProfilePage";
import PolicyPage from "@/pages/PolicyPage";
// Supplier & Purchase Order imports
import PurchaseOrderCreatePage from "./pages/purchaseOrder/PurchaseOrderCreatePage";
import PurchaseOrderDetailPage from "./pages/purchaseOrder/PurchaseOrderDetailPage";
import PurchaseOrderListPage from "./pages/purchaseOrder/PurchaseOrderListPage";
import PurchaseOrderReceiptCreatePage from "./pages/purchaseOrder/PurchaseOrderReceiptCreatePage";
import PurchaseOrderReceiptDetailPage from "./pages/purchaseOrder/PurchaseOrderReceiptDetailPage";
import PurchaseOrderReceiptListPage from "./pages/purchaseOrder/PurchaseOrderReceiptListPage";
import SupplierCreatePage from "./pages/supplier/SupplierCreatePage";
import SupplierDetailPage from "./pages/supplier/SupplierDetailPage";
import SupplierEditPage from "./pages/supplier/SupplierEditPage";
import SupplierListPage from "./pages/supplier/SupplierListPage";
// Inventory imports
import InventoryTrackingPage from "@/pages/inventory/InventoryTrackingPage";
import StockOverviewPage from "@/pages/inventory/StockOverviewPage";
import WarehousePage from "@/pages/inventory/WarehousePage";
import MedicationDetailPage from "@/pages/medications/MedicationDetailPage";
import MedicationFormPage from "@/pages/medications/MedicationFormPage";
import SalesPage from "./pages/sales/SalesPage";
import SalesOrderListPage from "./pages/sales/SalesOrderListPage";
import SalesOrderDetailPage from "./pages/sales/SalesOrderDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />

        {/* Protected routes - require authentication */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/list"
          element={
            <ProtectedRoute>
              <UserListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/registrations"
          element={
            <ProtectedRoute>
              <RegistrationRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Supplier Routes */}
        <Route
          path="/suppliers"
          element={
            <ProtectedRoute>
              <SupplierListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/suppliers/create"
          element={
            <ProtectedRoute>
              <SupplierCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/suppliers/:id"
          element={
            <ProtectedRoute>
              <SupplierDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/suppliers/:id/edit"
          element={
            <ProtectedRoute>
              <SupplierEditPage />
            </ProtectedRoute>
          }
        />

        {/* Purchase Order Routes */}
        <Route
          path="/procurement/purchase-orders"
          element={
            <ProtectedRoute>
              <PurchaseOrderListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-orders/create"
          element={
            <ProtectedRoute>
              <PurchaseOrderCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-orders/:id"
          element={
            <ProtectedRoute>
              <PurchaseOrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/procurement/receipts"
          element={
            <ProtectedRoute>
              <PurchaseOrderReceiptListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/procurement/receipts/:id"
          element={
            <ProtectedRoute>
              <PurchaseOrderReceiptDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-orders/:purchaseOrderId/receipts/create"
          element={
            <ProtectedRoute>
              <PurchaseOrderReceiptCreatePage />
            </ProtectedRoute>
          }
        />

        {/* Inventory Routes */}
        <Route
          path="/inventory/stock"
          element={
            <ProtectedRoute>
              <StockOverviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/warehouse"
          element={
            <ProtectedRoute>
              <WarehousePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/tracking"
          element={
            <ProtectedRoute>
              <InventoryTrackingPage />
            </ProtectedRoute>
          }
        />

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

        <Route
          path="/sales/orders/:id"
          element={
            <ProtectedRoute>
              <SalesOrderDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Public routes - redirect to dashboard if already logged in */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/policy"
          element={
            <PublicRoute>
              <PolicyPage />
            </PublicRoute>
          }
        />
        {/* --- Medications routes --- */}
        <Route
          path="/medications"
          element={
            <ProtectedRoute>
              <MedicationListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medications/new"
          element={
            <ProtectedRoute>
              <MedicationFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medications/edit/:id"
          element={
            <ProtectedRoute>
              <MedicationFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medications/:id"
          element={
            <ProtectedRoute>
              <MedicationDetailPage />
            </ProtectedRoute>
          }
        />

        {/* 404 page - accessible to everyone */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
