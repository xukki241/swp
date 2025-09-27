import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import NotFoundPage from "./pages/NotFoundPage";

import AuthLayout from "@/layout/AuthLayout";
import Layout from "@/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import LoginPage from "@/pages/LoginPage";
import Orders from "@/pages/Orders";
import RegisterPage from "@/pages/RegisterPage";
import { BreadcrumbProvider } from "@/providers/BreadcrumbProvider";

export default function App() {
  return (
    <Router>
      <BreadcrumbProvider>
        <Routes>
          {/* Auth routes */}
          <Route path="/" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
          {/* Main app routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
          </Route>
          {/* Not found route */}

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BreadcrumbProvider>
    </Router>
  );
}
