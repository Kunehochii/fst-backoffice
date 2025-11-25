"use client";

import { useEffect, type ReactNode } from "react";
import axios from "axios";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth.store";
import { API_ROUTES } from "@/lib/constants";
import { env } from "@/lib/env";
import type { BusinessProfile } from "@/types";

interface AuthProviderProps {
  children: ReactNode;
}

// Direct API call that doesn't go through the interceptor (which calls getSession again)
async function syncBusinessProfile(
  accessToken: string,
  userId: string,
  email: string | undefined,
  name: string
): Promise<BusinessProfile | null> {
  console.log("[AuthProvider] Attempting to sync profile for user:", userId);
  try {
    const response = await axios.post<BusinessProfile>(
      `${env.NEXT_PUBLIC_API_URL}${API_ROUTES.AUTH.SYNC_PROFILE}`,
      {
        supabaseUserId: userId,
        email: email,
        name: name,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 30000,
      }
    );
    console.log("[AuthProvider] Profile sync successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("[AuthProvider] Failed to sync business profile:", error);
    return null;
  }
}

// Fetch existing business profile from backend
async function fetchBusinessProfile(accessToken: string): Promise<BusinessProfile | null> {
  console.log("[AuthProvider] Fetching business profile...");
  try {
    const response = await axios.get<BusinessProfile>(
      `${env.NEXT_PUBLIC_API_URL}${API_ROUTES.AUTH.ME}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 30000,
      }
    );
    console.log("[AuthProvider] Profile fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("[AuthProvider] Failed to fetch business profile:", error);
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const setSupabaseUser = useAuthStore((state) => state.setSupabaseUser);
  const setBusinessProfile = useAuthStore((state) => state.setBusinessProfile);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    // Listen for auth state changes - this is the PRIMARY source of truth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "[AuthProvider] Auth state change:",
        event,
        session ? "has session" : "no session"
      );

      if (!isMounted) return;

      if (event === "INITIAL_SESSION") {
        // This fires on page load/refresh with the current session state
        if (session?.user && session.access_token) {
          setSupabaseUser(session.user);

          // Fetch fresh profile from backend on page refresh
          const profile = await fetchBusinessProfile(session.access_token);
          if (isMounted && profile) {
            setBusinessProfile(profile);
          } else if (isMounted) {
            // If fetch fails, try using persisted profile as fallback
            const persistedProfile = useAuthStore.getState().businessProfile;
            console.log("[AuthProvider] Using persisted profile as fallback:", persistedProfile);
          }
        } else {
          setSupabaseUser(null);
          setBusinessProfile(null);
        }
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      } else if (event === "SIGNED_IN" && session?.user && session.access_token) {
        // This fires on actual sign-in (login/signup), NOT on page refresh
        setSupabaseUser(session.user);

        // Only sync profile on actual sign-in events
        const profile = await syncBusinessProfile(
          session.access_token,
          session.user.id,
          session.user.email,
          session.user.user_metadata?.name || session.user.email?.split("@")[0] || ""
        );
        if (isMounted && profile) {
          setBusinessProfile(profile);
        }
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      } else if (event === "SIGNED_OUT") {
        logout();
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setSupabaseUser(session.user);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setSupabaseUser, setBusinessProfile, setLoading, setInitialized, logout]);

  return <>{children}</>;
}
