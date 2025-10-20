import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";
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
import StockOverviewPage from "@/pages/inventory/StockOverviewPage";
import WarehousePage from "@/pages/inventory/WarehousePage";

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
