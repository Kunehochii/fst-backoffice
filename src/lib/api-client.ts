import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import type { ApiError } from "@/types";

/**
 * Axios instance configured with interceptors for auth
 */
const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

/**
 * Request interceptor - adds auth token to requests
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip auth for public endpoints if needed
    if (config.headers?.["skip-auth"]) {
      delete config.headers["skip-auth"];
      return config;
    }

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error("Error getting session for API request:", error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handles errors globally
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - token might be expired
    if (error.response?.status === 401 && originalRequest) {
      try {
        const supabase = createClient();
        const { data, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError || !data.session) {
          // Refresh failed, redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }
          return Promise.reject(error);
        }

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`;
        return apiClient(originalRequest);
      } catch {
        // Refresh failed, redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
    }

    // Extract error message
    const errorMessage =
      error.response?.data?.message || error.message || "An unexpected error occurred";

    // You can add toast notifications here if needed
    console.error("API Error:", errorMessage);

    return Promise.reject(error);
  }
);

export { apiClient };

/**
 * Helper function to extract error message from API errors
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined;
    if (apiError?.message) {
      return Array.isArray(apiError.message) ? apiError.message[0] : apiError.message;
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}
