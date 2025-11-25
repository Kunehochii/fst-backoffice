import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/lib/constants";

/**
 * Redirect /signup to /auth/signup
 * This page exists for backwards compatibility
 */
export default function SignupPage() {
  redirect(APP_ROUTES.AUTH.SIGNUP);
}
