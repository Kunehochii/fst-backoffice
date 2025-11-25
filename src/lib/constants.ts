/**
 * API Routes - Backend endpoints
 */
export const API_ROUTES = {
  AUTH: {
    SYNC_PROFILE: "/auth/business/sync-profile",
    ME: "/auth/business/me",
    CASHIER_CREATE: "/auth/cashier/create",
    CASHIER_LOGIN: "/auth/cashier/login",
    CASHIER_EDIT: (id: string) => `/auth/cashier/edit/${id}`,
    CASHIER_EDIT_PASSWORD: (id: string) => `/auth/cashier/edit-password/${id}`,
  },
  CASHIER: {
    GET_BY_ID: (id: string) => `/cashier/${id}`,
    GET_ALL: "/cashier",
  },
  EMPLOYEES: {
    GET_ALL: "/employees/business",
    GET_BY_ID: (id: string) => `/employees/business/${id}`,
    CREATE: "/employees/business",
    UPDATE: (id: string) => `/employees/business/${id}`,
    DELETE: (id: string) => `/employees/business/${id}`,
  },
  PRODUCTS: {
    GET_ALL: "/products",
    GET_BY_ID: (id: string) => `/products/${id}`,
    GET_BY_CASHIER: (cashierId: string) => `/products/business/cashier/${cashierId}`,
    CREATE: "/products",
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    TRANSFER: "/products/transfer",
  },
  SALES_CHECK: {
    GET_ALL: "/sales-check",
    GET_TOTAL: "/sales-check/total",
    GET_ALL_CASHIERS: "/sales-check/cashiers/all",
  },
  PROFIT: {
    GET_ALL: "/profit",
    GET_ALL_CASHIERS: "/profit/cashiers/all",
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
  CASHIERS: "/dashboard/cashiers",
  EMPLOYEES: "/dashboard/employees",
  PRODUCTS: "/dashboard/products",
  PRODUCTS_CASHIER: (cashierId: string) => `/dashboard/products/${cashierId}`,
  BILLS: "/dashboard/bills",
  SALES_CHECK: "/dashboard/sales-check",
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
  CASHIERS: {
    ALL: ["cashiers"],
    LIST: (branchName?: string) => ["cashiers", "list", { branchName }],
    DETAIL: (id: string) => ["cashiers", "detail", id],
  },
  EMPLOYEES: {
    ALL: ["employees"],
    LIST: (cashierId?: string) => ["employees", "list", { cashierId }],
    DETAIL: (id: string) => ["employees", "detail", id],
  },
  PRODUCTS: {
    ALL: ["products"],
    ALL_BUSINESS: (filters?: { category?: string; productSearch?: string }) => [
      "products",
      "business",
      filters,
    ],
    LIST: (cashierId: string, filters?: { category?: string; productSearch?: string }) => [
      "products",
      "cashier",
      cashierId,
      filters,
    ],
    DETAIL: (id: string) => ["products", "detail", id],
  },
  BILLS: {
    ALL: ["bills"],
    LIST: (date: string) => ["bills", "list", { date }],
    CASHIER: (cashierId: string, date: string) => ["bills", "cashier", cashierId, { date }],
    DETAIL: (id: string) => ["bills", "detail", id],
  },
  SALES_CHECK: {
    ALL: ["sales-check"],
    LIST: (filters?: Record<string, unknown>) => ["sales-check", "list", filters],
    TOTAL: (filters?: Record<string, unknown>) => ["sales-check", "total", filters],
    ALL_CASHIERS: (filters?: Record<string, unknown>) => ["sales-check", "cashiers", filters],
    CASHIER: (cashierId: string, filters?: Record<string, unknown>) => [
      "sales-check",
      "cashier",
      cashierId,
      filters,
    ],
  },
  PROFIT: {
    ALL: ["profit"],
    LIST: (filters?: Record<string, unknown>) => ["profit", "list", filters],
    ALL_CASHIERS: (filters?: Record<string, unknown>) => ["profit", "cashiers", filters],
    CASHIER: (cashierId: string, filters?: Record<string, unknown>) => [
      "profit",
      "cashier",
      cashierId,
      filters,
    ],
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

export const LOGIN_PAGE_IMAGE_URL =
  "https://coolbackgrounds.imgix.net/18zyrwm4RhrbpPIlIGVR2u/f21e0bb64d51cbb695ce89583ed8a439/blue-trianglify.jpg?w=3840&q=60&auto=format,compress";
