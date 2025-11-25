"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { API_ROUTES, APP_ROUTES } from "@/lib/constants";
import type { LoginInput, SignupInput, ForgotPasswordInput, ResetPasswordInput } from "@/schemas";
import type { BusinessProfile } from "@/types";

/**
 * Hook for handling login with Supabase
 */
export function useLogin() {
  const router = useRouter();
  const { login, setLoading } = useAuthStore();

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const supabase = createClient();

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!authData.user) {
        throw new Error("Login failed. Please try again.");
      }

      // Sync with backend to get/create business profile
      const response = await apiClient.post<BusinessProfile>(API_ROUTES.AUTH.SYNC_PROFILE, {
        supabaseUserId: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name || authData.user.email?.split("@")[0] || "",
      });

      return {
        user: authData.user,
        profile: response.data,
      };
    },
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: ({ user, profile }) => {
      login(user, profile);
      toast.success("Welcome back!");
      router.push(APP_ROUTES.DASHBOARD);
    },
    onError: (error: Error) => {
      setLoading(false);
      toast.error(error.message || "Login failed. Please try again.");
    },
  });
}

/**
 * Hook for handling signup with Supabase
 */
export function useSignup() {
  const router = useRouter();
  const { setLoading } = useAuthStore();

  return useMutation({
    mutationFn: async (data: SignupInput) => {
      const supabase = createClient();

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
          emailRedirectTo: `${window.location.origin}${APP_ROUTES.AUTH.CALLBACK}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!authData.user) {
        throw new Error("Signup failed. Please try again.");
      }

      // Check if email confirmation is required
      // If user.identities is empty, email already exists
      if (authData.user.identities?.length === 0) {
        throw new Error("An account with this email already exists.");
      }

      return authData;
    },
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      setLoading(false);
      // If email confirmation is required
      if (!data.session) {
        toast.success("Please check your email to confirm your account.");
        router.push(APP_ROUTES.AUTH.LOGIN);
      } else {
        // If email confirmation is disabled, user is logged in immediately
        toast.success("Account created successfully!");
        router.push(APP_ROUTES.DASHBOARD);
      }
    },
    onError: (error: Error) => {
      setLoading(false);
      toast.error(error.message || "Signup failed. Please try again.");
    },
  });
}

/**
 * Hook for handling forgot password
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordInput) => {
      const supabase = createClient();

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}${APP_ROUTES.AUTH.RESET_PASSWORD}`,
      });

      if (error) {
        throw new Error(error.message);
      }

      return { email: data.email };
    },
    onSuccess: () => {
      toast.success("Password reset email sent. Please check your inbox.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send password reset email.");
    },
  });
}

/**
 * Hook for handling password reset
 */
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: ResetPasswordInput) => {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    },
    onSuccess: () => {
      toast.success("Password updated successfully!");
      router.push(APP_ROUTES.AUTH.LOGIN);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reset password.");
    },
  });
}

/**
 * Hook for handling logout
 */
export function useLogout() {
  const router = useRouter();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    },
    onSuccess: () => {
      logout();
      toast.success("Logged out successfully.");
      router.push(APP_ROUTES.AUTH.LOGIN);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to logout.");
    },
  });
}

/**
 * Hook for OAuth login (Google, Apple, etc.)
 */
export function useOAuthLogin() {
  return useMutation({
    mutationFn: async (provider: "google" | "apple" | "facebook") => {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}${APP_ROUTES.AUTH.CALLBACK}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    },
    onError: (error: Error) => {
      toast.error(error.message || "OAuth login failed.");
    },
  });
}
