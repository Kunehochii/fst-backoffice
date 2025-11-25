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
 * Cashier type (for reference, login happens in cashier app)
 */
export interface Cashier {
  id: string;
  username: string;
  branchName: string;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}
