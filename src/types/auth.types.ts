import type { User } from "@supabase/supabase-js";

/**
 * Business profile from the backend
 * Synced with Supabase auth
 */
export interface BusinessProfile {
  id: string;
  supabaseUserId: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Auth user combining Supabase user and business profile
 */
export interface AuthUser {
  supabaseUser: User;
  businessProfile: BusinessProfile | null;
}

/**
 * Auth state for the store
 */
export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Cashier permissions enum (matches backend)
 */
export enum CashierPermissions {
  SALES = "SALES",
  DELIVERIES = "DELIVERIES",
  STOCKS = "STOCKS",
  EDIT_PRICE = "EDIT_PRICE",
  KAHON = "KAHON",
  BILLS = "BILLS",
  ATTACHMENTS = "ATTACHMENTS",
  SALES_HISTORY = "SALES_HISTORY",
  VOID = "VOID",
}

/**
 * Cashier type with permissions
 */
export interface Cashier {
  id: string;
  username: string;
  branchName: string;
  businessId: string;
  permissions: CashierPermissions[];
  createdAt: string;
  updatedAt: string;
}
