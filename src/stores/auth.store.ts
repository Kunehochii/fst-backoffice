import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@supabase/supabase-js";
import type { BusinessProfile } from "@/types";

interface AuthState {
  // State
  supabaseUser: User | null;
  businessProfile: BusinessProfile | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Computed
  isAuthenticated: boolean;

  // Actions
  setSupabaseUser: (user: User | null) => void;
  setBusinessProfile: (profile: BusinessProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  login: (user: User, profile: BusinessProfile | null) => void;
  logout: () => void;
  reset: () => void;
}

const initialState = {
  supabaseUser: null,
  businessProfile: null,
  isLoading: true,
  isInitialized: false,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      setSupabaseUser: (user) =>
        set({
          supabaseUser: user,
          isAuthenticated: !!user,
        }),

      setBusinessProfile: (profile) =>
        set({
          businessProfile: profile,
        }),

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      setInitialized: (initialized) =>
        set({
          isInitialized: initialized,
        }),

      login: (user, profile) =>
        set({
          supabaseUser: user,
          businessProfile: profile,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          ...initialState,
          isLoading: false,
          isInitialized: true,
        }),

      reset: () => set(initialState),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist certain fields
      partialize: (state) => ({
        businessProfile: state.businessProfile,
        // Don't persist supabaseUser as it contains sensitive tokens
        // Supabase handles its own session persistence
      }),
    }
  )
);

/**
 * Selector hooks for better performance
 */
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useSupabaseUser = () => useAuthStore((state) => state.supabaseUser);
export const useBusinessProfile = () => useAuthStore((state) => state.businessProfile);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
