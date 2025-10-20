import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import DashboardPage from "@/pages/Dashboard";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import NotFoundPage from "@/pages/NotFoundPage";
import RegistrationRequestsPage from "@/pages/RegistrationRequestsPage";
import UserListPage from "@/pages/UserListPage";
import POSPage from "@/pages/POSPage";
import PolicyPage from "@/pages/PolicyPage";
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";
import SupplierListPage from "./pages/supplier/SupplierListPage";
import SupplierCreatePage from "./pages/supplier/SupplierCreatePage";
import SupplierDetailPage from "./pages/supplier/SupplierDetailPage";
import SupplierEditPage from "./pages/supplier/SupplierEditPage";
import PurchaseOrderListPage from "./pages/purchaseOrder/PurchaseOrderListPage";
import PurchaseOrderCreatePage from "./pages/purchaseOrder/PurchaseOrderCreatePage";
import PurchaseOrderDetailPage from "./pages/purchaseOrder/PurchaseOrderDetailPage";
import PurchaseOrderReceiptListPage from "./pages/purchaseOrder/PurchaseOrderReceiptListPage";
import PurchaseOrderReceiptDetailPage from "./pages/purchaseOrder/PurchaseOrderReceiptDetailPage";
import PurchaseOrderReceiptCreatePage from "./pages/purchaseOrder/PurchaseOrderReceiptCreatePage";

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
          path="/pos"
          element={
            <ProtectedRoute>
              <POSPage />
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

        {/* 404 page - accessible to everyone */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
