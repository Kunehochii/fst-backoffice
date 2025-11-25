import { useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/client";
import { getDateRangeForDay } from "@/utils";
import type {
  GroupedSale,
  TotalSalesResponse,
  CashierSalesData,
  SalesFilters,
} from "@/types/sales.types";

/**
 * API Routes for Sales Check
 */
const SALES_CHECK_API_ROUTES = {
  // Business endpoints (Supabase Auth)
  GET_ALL: "/sales-check",
  GET_TOTAL: "/sales-check/total",
  GET_ALL_CASHIERS: "/sales-check/cashiers/all",
} as const;

/**
 * Query keys for sales check
 */
export const SALES_QUERY_KEYS = {
  ALL: ["sales-check"],
  LIST: (filters?: SalesFilters) => ["sales-check", "list", filters],
  TOTAL: (filters?: SalesFilters) => ["sales-check", "total", filters],
  ALL_CASHIERS: (filters?: SalesFilters) => ["sales-check", "cashiers", filters],
  CASHIER: (cashierId: string, filters?: SalesFilters) => [
    "sales-check",
    "cashier",
    cashierId,
    filters,
  ],
} as const;

/**
 * Build filters with date range for a specific day
 */
export function buildDayFilters(
  date: Date,
  additionalFilters?: Partial<SalesFilters>
): SalesFilters {
  const { startDate, endDate } = getDateRangeForDay(date);
  return {
    startDate,
    endDate,
    ...additionalFilters,
  };
}

/**
 * Hook to fetch all sales for the business (grouped by product)
 */
export function useSalesCheck(date: Date, additionalFilters?: Partial<SalesFilters>) {
  const filters = buildDayFilters(date, additionalFilters);

  return useQuery({
    queryKey: SALES_QUERY_KEYS.LIST(filters),
    queryFn: async () => {
      const response = await apiClient.get<GroupedSale[]>(SALES_CHECK_API_ROUTES.GET_ALL, {
        params: filters,
      });
      return response.data;
    },
  });
}

/**
 * Hook to fetch total sales summary for the business
 */
export function useTotalSales(date: Date, additionalFilters?: Partial<SalesFilters>) {
  const filters = buildDayFilters(date, additionalFilters);

  return useQuery({
    queryKey: SALES_QUERY_KEYS.TOTAL(filters),
    queryFn: async () => {
      const response = await apiClient.get<TotalSalesResponse>(SALES_CHECK_API_ROUTES.GET_TOTAL, {
        params: filters,
      });
      return response.data;
    },
  });
}

/**
 * Hook to fetch sales for all cashiers grouped by cashier
 */
export function useAllCashierSales(date: Date, additionalFilters?: Partial<SalesFilters>) {
  const filters = buildDayFilters(date, additionalFilters);

  return useQuery({
    queryKey: SALES_QUERY_KEYS.ALL_CASHIERS(filters),
    queryFn: async () => {
      const response = await apiClient.get<CashierSalesData[]>(
        SALES_CHECK_API_ROUTES.GET_ALL_CASHIERS,
        { params: filters }
      );
      return response.data;
    },
  });
}

/**
 * Hook to subscribe to real-time sales updates via Supabase Realtime
 * This will invalidate the sales queries when a new sale is detected
 */
export function useSalesRealtimeSubscription(businessId: string | undefined) {
  const queryClient = useQueryClient();

  const invalidateSalesQueries = useCallback(() => {
    // Invalidate all sales-related queries to refetch fresh data
    queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.ALL });
  }, [queryClient]);

  useEffect(() => {
    if (!businessId) return;

    const supabase = createClient();

    // Subscribe to Sale table changes for the business
    // We listen for INSERT and UPDATE events
    const channel = supabase
      .channel(`sales-${businessId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "Sale",
        },
        (payload) => {
          console.log("Sale change detected:", payload);
          // Invalidate queries to refetch updated data
          invalidateSalesQueries();
        }
      )
      .subscribe((status) => {
        console.log("Sales subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, invalidateSalesQueries]);
}

/**
 * Hook to subscribe to real-time sales updates for a specific cashier
 */
export function useCashierSalesRealtimeSubscription(cashierId: string | undefined) {
  const queryClient = useQueryClient();

  const invalidateSalesQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.ALL });
  }, [queryClient]);

  useEffect(() => {
    if (!cashierId) return;

    const supabase = createClient();

    // Subscribe to Sale table changes for the specific cashier
    const channel = supabase
      .channel(`sales-cashier-${cashierId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Sale",
          filter: `cashierId=eq.${cashierId}`,
        },
        (payload) => {
          console.log("Cashier sale change detected:", payload);
          invalidateSalesQueries();
        }
      )
      .subscribe((status) => {
        console.log("Cashier sales subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cashierId, invalidateSalesQueries]);
}
