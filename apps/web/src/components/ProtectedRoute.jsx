import { Navigate } from "react-router";

/**
 * ProtectedRoute component
 * Redirects to login if user is not authenticated
 */
export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  // Authenticated, render children
  return children;
};

/**
 * PublicRoute component
 * Redirects to dashboard if user is already authenticated
 */
export const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (token) {
    // Already authenticated, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Not authenticated, render children (login/register page)
  return children;
};
