import { useAuthStore } from "@/stores/auth.store";

/**
 * Hook for quickly accessing the authenticated business profile
 * Use this in components that need business data
 *
 * @example
 * ```tsx
 * const { business, isLoading, isAuthenticated } = useBusiness();
 *
 * if (isLoading) return <Spinner />;
 * if (!isAuthenticated) return <Redirect to="/auth/login" />;
 *
 * return <div>Welcome, {business?.name}</div>;
 * ```
 */
export function useBusiness() {
  const businessProfile = useAuthStore((state) => state.businessProfile);
  const supabaseUser = useAuthStore((state) => state.supabaseUser);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  return {
    /** The business profile from the backend */
    business: businessProfile,
    /** The Supabase user object */
    user: supabaseUser,
    /** Whether auth is still loading */
    isLoading,
    /** Whether the user is authenticated */
    isAuthenticated,
    /** Whether auth has been initialized */
    isInitialized,
    /** Shorthand for business ID */
    businessId: businessProfile?.id ?? null,
    /** Shorthand for Supabase user ID */
    supabaseUserId: supabaseUser?.id ?? null,
  };
}
