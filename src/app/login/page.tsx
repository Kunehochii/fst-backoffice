import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/lib/constants";

/**
 * Redirect /login to /auth/login
 * This page exists for backwards compatibility
 */
export default function LoginPage() {
  redirect(APP_ROUTES.AUTH.LOGIN);
}
