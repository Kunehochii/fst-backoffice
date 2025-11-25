# FST Backoffice - Agent Usage Guide

> **Quick Reference for AI Agents**: This document provides the essential patterns and structures for working with this codebase.

## Project Overview

- **Framework**: Next.js 16 (App Router)
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Auth**: Supabase SSR (hybrid auth with NestJS backend)
- **Validation**: Zod
- **HTTP Client**: Axios with interceptors
- **Styling**: Tailwind CSS + shadcn/ui

---

## Directory Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   └── ui/              # shadcn/ui components (auto-generated, do not edit)
├── hooks/               # Custom React hooks
├── lib/                 # Core utilities and configurations
│   ├── api-client.ts    # Axios instance with auth interceptors
│   ├── constants.ts     # API routes, app routes, query keys
│   ├── env.ts           # Zod-validated environment variables
│   ├── utils.ts         # General utilities (cn, formatDate, etc.)
│   └── supabase/        # Supabase client configurations
├── providers/           # React context providers
├── schemas/             # Zod validation schemas
├── stores/              # Zustand stores
├── types/               # TypeScript type definitions
└── utils/               # Additional utility functions
```

---

## Authentication Architecture

### Overview

This project uses **hybrid authentication**:

1. **Supabase Auth** handles user signup/login on the frontend
2. **NestJS Backend** stores business profile data and validates Supabase JWT tokens
3. **Zustand Store** manages auth state client-side

### Auth Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Supabase  │────▶│  Frontend   │────▶│   NestJS    │
│    Auth     │     │   (Next.js) │     │   Backend   │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                    │
      │ 1. Sign up/login   │                    │
      │◀───────────────────│                    │
      │                    │                    │
      │ 2. Return session  │                    │
      │───────────────────▶│                    │
      │                    │                    │
      │                    │ 3. Sync profile    │
      │                    │───────────────────▶│
      │                    │                    │
      │                    │ 4. Return business │
      │                    │◀───────────────────│
      │                    │                    │
      │                    │ 5. Store in Zustand│
      │                    │────────────────────│
```

### Key Files

| File                              | Purpose                            |
| --------------------------------- | ---------------------------------- |
| `src/lib/supabase/client.ts`      | Browser Supabase client            |
| `src/lib/supabase/server.ts`      | Server Supabase client             |
| `src/lib/supabase/middleware.ts`  | Session refresh & route protection |
| `src/stores/auth.store.ts`        | Zustand auth state                 |
| `src/providers/auth-provider.tsx` | Auth state initialization          |
| `src/hooks/use-business.ts`       | Quick access to business profile   |
| `src/middleware.ts`               | Next.js middleware for auth        |

### Using the Auth Store

```typescript
// Option 1: useBusiness hook (recommended)
import { useBusiness } from "@/hooks";

function MyComponent() {
  const { business, isLoading, isAuthenticated, businessId } = useBusiness();

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Redirect to="/auth/login" />;

  return <div>Business: {business?.name}</div>;
}

// Option 2: Direct store access
import { useAuthStore } from "@/stores";

function MyComponent() {
  const businessProfile = useAuthStore((state) => state.businessProfile);
  const logout = useAuthStore((state) => state.logout);
}

// Option 3: Selector hooks
import { useBusinessProfile, useIsAuthenticated } from "@/stores";

function MyComponent() {
  const business = useBusinessProfile();
  const isAuth = useIsAuthenticated();
}
```

### Auth Store State Shape

```typescript
interface AuthState {
  supabaseUser: User | null; // Supabase user object
  businessProfile: BusinessProfile | null; // Backend business data
  isLoading: boolean; // Auth loading state
  isInitialized: boolean; // Whether auth check completed
  isAuthenticated: boolean; // Computed: !!supabaseUser

  // Actions
  setSupabaseUser: (user: User | null) => void;
  setBusinessProfile: (profile: BusinessProfile | null) => void;
  login: (user: User, profile: BusinessProfile | null) => void;
  logout: () => void;
}
```

### Business Profile Type

```typescript
interface BusinessProfile {
  id: string; // Prisma business ID (use this for API calls)
  supabaseUserId: string; // Supabase user ID
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## API Client

### Overview

The API client (`src/lib/api-client.ts`) is a pre-configured Axios instance that:

1. Automatically attaches Supabase JWT token to requests
2. Refreshes expired tokens automatically
3. Redirects to login on auth failures

### Usage

```typescript
import { apiClient } from "@/lib/api-client";
import { API_ROUTES } from "@/lib/constants";

// GET request
const response = await apiClient.get("/products");

// POST request
const response = await apiClient.post(API_ROUTES.AUTH.SYNC_PROFILE, {
  supabaseUserId: user.id,
  email: user.email,
  name: "Business Name",
});

// With query params
const response = await apiClient.get("/sales-check", {
  params: {
    startDate: "2025-11-24T00:00:00.000Z",
    endDate: "2025-11-24T23:59:59.999Z",
  },
});
```

### Error Handling

```typescript
import { getApiErrorMessage } from "@/lib/api-client";

try {
  await apiClient.post("/endpoint", data);
} catch (error) {
  const message = getApiErrorMessage(error);
  toast.error(message);
}
```

---

## Constants & Routes

### API Routes (Backend Endpoints)

```typescript
// src/lib/constants.ts
export const API_ROUTES = {
  AUTH: {
    SYNC_PROFILE: "/auth/business/sync-profile",
    CASHIER_CREATE: "/auth/cashier/create",
    CASHIER_LOGIN: "/auth/cashier/login",
  },
} as const;
```

### App Routes (Frontend Pages)

```typescript
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
} as const;
```

### Query Keys (React Query)

```typescript
export const QUERY_KEYS = {
  AUTH: {
    USER: ["auth", "user"],
    SESSION: ["auth", "session"],
  },
} as const;
```

---

## Validation Schemas

### Location

All Zod schemas are in `src/schemas/`. Create separate files for each domain:

- `auth.schema.ts` - Authentication schemas
- `product.schema.ts` - Product schemas (example)
- `sale.schema.ts` - Sale schemas (example)

### Pattern

```typescript
// src/schemas/auth.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

### Usage with React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/schemas";

function LoginForm() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginInput) => {
    // data is fully typed and validated
  };
}
```

---

## Type Definitions

### Location

All TypeScript types are in `src/types/`. Organized by domain:

- `auth.types.ts` - Auth-related types
- `api.types.ts` - API response types

### Standard API Response

```typescript
// All NestJS endpoints return this structure
interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode?: number;
}

interface ApiError {
  message: string | string[];
  error?: string;
  statusCode: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

---

## Date/Time Handling

### CRITICAL: Timezone Strategy

The backend is **timezone-agnostic** and expects all dates in **ISO 8601 UTC format**.

### Date Utilities

```typescript
import { toUTCString, fromUTCString, getDateRangeForDay, formatLocalDate } from "@/utils";

// Convert local date to UTC for API
const utcString = toUTCString(new Date()); // "2025-11-24T16:00:00.000Z"

// Convert UTC string from API to local Date
const localDate = fromUTCString("2025-11-24T16:00:00.000Z");

// Get start/end of day in UTC for queries
const { startDate, endDate } = getDateRangeForDay(new Date());
// startDate: "2025-11-23T16:00:00.000Z" (if user is in UTC+8)
// endDate: "2025-11-24T15:59:59.999Z"

// Format for display
const display = formatLocalDate(utcString); // "Nov 24, 2025"
```

### API Query Example

```typescript
// Querying sales for "November 24, 2025" in user's timezone
const { startDate, endDate } = getDateRangeForDay(new Date("2025-11-24"));

const response = await apiClient.get("/sales-check", {
  params: { startDate, endDate },
});
```

---

## React Query Patterns

### Query Example

```typescript
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/constants";

function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await apiClient.get("/products");
      return data;
    },
  });
}
```

### Mutation Example

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { toast } from "sonner";

function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductInput) => {
      const response = await apiClient.post("/products", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
```

---

## Environment Variables

### Required Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Accessing in Code

```typescript
import { env } from "@/lib/env";

// Type-safe access
const apiUrl = env.NEXT_PUBLIC_API_URL;
```

---

## Creating New Features Checklist

When adding a new feature (e.g., "Products"):

1. **Types**: Create `src/types/product.types.ts`
2. **Schemas**: Create `src/schemas/product.schema.ts`
3. **API Routes**: Add to `src/lib/constants.ts`
4. **Query Keys**: Add to `QUERY_KEYS` in constants
5. **Hooks** (optional): Create `src/hooks/use-products.ts`
6. **Components**: Create in `src/components/products/`
7. **Pages**: Create in `src/app/products/`

---

## Common Patterns

### Protected Page

```typescript
// src/app/dashboard/page.tsx
"use client";

import { useBusiness } from "@/hooks";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardPage() {
  const { business, isLoading, isAuthenticated } = useBusiness();

  if (isLoading) {
    return <Spinner />;
  }

  // Middleware handles redirect, but double-check
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <h1>Welcome, {business?.name}</h1>
    </div>
  );
}
```

### Form with Validation

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginSchema, type LoginInput } from "@/schemas";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function LoginForm() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: LoginInput) => apiClient.post("/auth/login", data),
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
      <Input {...form.register("email")} placeholder="Email" />
      <Input {...form.register("password")} type="password" placeholder="Password" />
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Loading..." : "Login"}
      </Button>
    </form>
  );
}
```

---

## Important Notes for Agents

1. **Never edit `src/components/ui/`** - These are auto-generated by shadcn/ui
2. **Always use the `apiClient`** - Don't use raw `fetch` or `axios`
3. **Always validate with Zod** - Create schemas for all forms
4. **Use UTC for all API dates** - Convert to local only for display
5. **Check `useBusiness` for auth** - Middleware protects routes, but components should handle loading states
6. **Export from index files** - All modules have barrel exports
