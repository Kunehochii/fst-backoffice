/**
 * API Routes - Backend endpoints
 */
export const API_ROUTES = {
  AUTH: {
    SYNC_PROFILE: "/auth/business/sync-profile",
    CASHIER_CREATE: "/auth/cashier/create",
    CASHIER_LOGIN: "/auth/cashier/login",
  },
  // Add more routes as needed
} as const;

/**
 * App Routes - Frontend pages
 */
export const APP_ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    CALLBACK: "/auth/callback",
  },
  DASHBOARD: "/dashboard",
  // Add more routes as needed
} as const;

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  APP_ROUTES.AUTH.LOGIN,
  APP_ROUTES.AUTH.SIGNUP,
  APP_ROUTES.AUTH.FORGOT_PASSWORD,
  APP_ROUTES.AUTH.RESET_PASSWORD,
  APP_ROUTES.AUTH.CALLBACK,
] as const;

/**
 * Query Keys for React Query
 */
export const QUERY_KEYS = {
  AUTH: {
    USER: ["auth", "user"],
    SESSION: ["auth", "session"],
  },
  // Add more query keys as needed
} as const;

/**
 * Storage Keys for localStorage/sessionStorage
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER: "user",
} as const;
