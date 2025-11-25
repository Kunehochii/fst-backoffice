"use client";

import { useEffect, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient } from "@/lib/api-client";
import { API_ROUTES } from "@/lib/constants";
import type { BusinessProfile } from "@/types";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setSupabaseUser, setBusinessProfile, setLoading, setInitialized, logout } =
    useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setSupabaseUser(session.user);

          // Try to fetch business profile from backend
          try {
            const response = await apiClient.post<BusinessProfile>(API_ROUTES.AUTH.SYNC_PROFILE, {
              supabaseUserId: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "",
            });
            setBusinessProfile(response.data);
          } catch (error) {
            console.error("Failed to sync business profile:", error);
            // User is still authenticated via Supabase, just no profile yet
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setSupabaseUser(session.user);

        // Sync profile on sign in
        try {
          const response = await apiClient.post<BusinessProfile>(API_ROUTES.AUTH.SYNC_PROFILE, {
            supabaseUserId: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "",
          });
          setBusinessProfile(response.data);
        } catch (error) {
          console.error("Failed to sync business profile on sign in:", error);
        }
      } else if (event === "SIGNED_OUT") {
        logout();
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setSupabaseUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSupabaseUser, setBusinessProfile, setLoading, setInitialized, logout]);

  return <>{children}</>;
}
