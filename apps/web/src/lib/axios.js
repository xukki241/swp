import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Create axios instance with base configuration
export const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token to requests
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - clear auth data
    // Note: Don't redirect here, let the component handle it
    // The ProtectedRoute will automatically redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only reload if we're not already on a public page
      const publicPaths = [
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
      ];
      const currentPath = window.location.pathname;
      if (!publicPaths.includes(currentPath)) {
        // Use setTimeout to avoid interrupting the current request
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
      }
    }

    // Preserve the original axios error structure
    // This allows error.response.data.message to work in components
    return Promise.reject(error);
  }
);

export default instance;
