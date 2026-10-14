/**
 * API Configuration with Redux Auth Integration
 *
 * This module sets up axios with automatic token injection and refresh handling
 * using Redux store directly instead of hooks.
 */

import axios, { AxiosInstance, AxiosResponse } from "axios";
import toast from "react-hot-toast";
import { SERVER_URL } from "@/constants";
import { store } from "@/store";
import { logout, setTokens } from "@/store/slices/authSlice";
import type { AuthTokens, UserData } from "@/store/slices/authSlice";

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: SERVER_URL,
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to get current auth state from Redux store
const getAuthState = () => {
  const state = store.getState();
  return {
    accessToken: state.auth.accessToken,
    refreshToken: state.auth.refreshToken,
    isAuthenticated: state.auth.isAuthenticated,
  };
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = getAuthState();

    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken } = getAuthState();

      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const response = await axios.post(
            `${SERVER_URL}/auth/refresh-token`,
            {
              refreshToken: refreshToken,
            },
          );

          // Accept both the `{ status, message, data }` envelope (as login uses) and a bare payload
          const payload = response.data?.data ?? response.data;
          const { accessToken, refreshToken: newRefreshToken } = payload;
          if (!accessToken) throw new Error("Refresh response did not include an access token");

          const tokens: AuthTokens = {
            accessToken,
            refreshToken: newRefreshToken ?? refreshToken,
          };

          // Keep the current user unless the refresh returned a fresh one
          const currentUser = store.getState().auth.user;
          const user: UserData | null = payload.user
            ? { ...payload.user, capabilities: payload.permissions ?? currentUser?.capabilities }
            : currentUser;

          // Update tokens in Redux store
          store.dispatch(setTokens({ tokens, user: user as UserData }));

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout and redirect
          console.error("Token refresh failed:", refreshError);
          store.dispatch(logout());

          if (typeof window !== "undefined") {
            toast.error("Session expired. Please login again.");
            window.location.href = "/login";
          }

          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, logout and redirect
        store.dispatch(logout());

        if (typeof window !== "undefined") {
          toast.error("Please login to continue.");
          window.location.href = "/login";
        }
      }
    }

    // Handle other error responses
    // if (error.response?.status === 403) {
    //   toast.error(
    //     "Access denied. You do not have permission to perform this action."
    //   );
    // } else if (error.response?.status >= 500) {
    //   toast.error("Server error. Please try again later.");
    // }

    return Promise.reject(error);
  },
);

// Export the configured axios instance
export default api;
