import { useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/client";
import { getDateRangeForDay } from "@/utils";
import type { ProfitResponse, CashierProfitData, ProfitFilters } from "@/types/profit.types";

/**
 * API Routes for Profit
 */
const PROFIT_API_ROUTES = {
  // Business endpoints (Supabase Auth)
  GET_ALL: "/profit",
  GET_ALL_CASHIERS: "/profit/cashiers/all",
} as const;

/**
 * Query keys for profit
 */
export const PROFIT_QUERY_KEYS = {
  ALL: ["profit"],
  LIST: (filters?: ProfitFilters) => ["profit", "list", filters],
  ALL_CASHIERS: (filters?: ProfitFilters) => ["profit", "cashiers", filters],
  DATE_RANGE: (startDate: string, endDate: string) => ["profit", "range", startDate, endDate],
  CASHIER: (cashierId: string, filters?: ProfitFilters) => [
    "profit",
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
  additionalFilters?: Partial<ProfitFilters>
): ProfitFilters {
  const { startDate, endDate } = getDateRangeForDay(date);
  return {
    startDate,
    endDate,
    ...additionalFilters,
  };
}

/**
 * Build filters with custom date range
 */
export function buildDateRangeFilters(
  start: Date,
  end: Date,
  additionalFilters?: Partial<ProfitFilters>
): ProfitFilters {
  const startOfDay = new Date(start);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(end);
  endOfDay.setHours(23, 59, 59, 999);

  return {
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
    ...additionalFilters,
  };
}

/**
 * Hook to fetch all profits for the business (grouped by product)
 */
export function useProfit(date: Date, additionalFilters?: Partial<ProfitFilters>) {
  const filters = buildDayFilters(date, additionalFilters);

  return useQuery({
    queryKey: PROFIT_QUERY_KEYS.LIST(filters),
    queryFn: async () => {
      const response = await apiClient.get<ProfitResponse>(PROFIT_API_ROUTES.GET_ALL, {
        params: filters,
      });
      return response.data;
    },
  });
}

/**
 * Hook to fetch profits for a date range (e.g., last 30 days)
 */
export function useProfitDateRange(
  startDate: Date,
  endDate: Date,
  additionalFilters?: Partial<ProfitFilters>
) {
  const filters = buildDateRangeFilters(startDate, endDate, additionalFilters);

  return useQuery({
    queryKey: PROFIT_QUERY_KEYS.DATE_RANGE(filters.startDate!, filters.endDate!),
    queryFn: async () => {
      const response = await apiClient.get<ProfitResponse>(PROFIT_API_ROUTES.GET_ALL, {
        params: filters,
      });
      return response.data;
    },
  });
}

/**
 * Hook to fetch profits for all cashiers grouped by cashier
 */
export function useAllCashierProfits(date: Date, additionalFilters?: Partial<ProfitFilters>) {
  const filters = buildDayFilters(date, additionalFilters);

  return useQuery({
    queryKey: PROFIT_QUERY_KEYS.ALL_CASHIERS(filters),
    queryFn: async () => {
      const response = await apiClient.get<CashierProfitData[]>(
        PROFIT_API_ROUTES.GET_ALL_CASHIERS,
        { params: filters }
      );
      return response.data;
    },
  });
}

/**
 * Hook to subscribe to real-time profit updates via Supabase Realtime
 * This will invalidate the profit queries when a new sale is detected
 */
export function useProfitRealtimeSubscription(businessId: string | undefined) {
  const queryClient = useQueryClient();

  const invalidateProfitQueries = useCallback(() => {
    // Invalidate all profit-related queries to refetch fresh data
    queryClient.invalidateQueries({ queryKey: PROFIT_QUERY_KEYS.ALL });
  }, [queryClient]);

  useEffect(() => {
    if (!businessId) return;

    const supabase = createClient();

    // Subscribe to Sale table changes for the business
    // We listen for INSERT and UPDATE events
    const channel = supabase
      .channel(`profit-${businessId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "Sale",
        },
        (payload) => {
          console.log("Sale change detected (profit):", payload);
          // Invalidate queries to refetch updated data
          invalidateProfitQueries();
        }
      )
      .subscribe((status) => {
        console.log("Profit subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, invalidateProfitQueries]);
}

/**
 * Hook to subscribe to real-time profit updates for a specific cashier
 */
export function useCashierProfitRealtimeSubscription(cashierId: string | undefined) {
  const queryClient = useQueryClient();

  const invalidateProfitQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: PROFIT_QUERY_KEYS.ALL });
  }, [queryClient]);

  useEffect(() => {
    if (!cashierId) return;

    const supabase = createClient();

    // Subscribe to Sale table changes for the specific cashier
    const channel = supabase
      .channel(`profit-cashier-${cashierId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Sale",
          filter: `cashierId=eq.${cashierId}`,
        },
        (payload) => {
          console.log("Cashier sale change detected (profit):", payload);
          invalidateProfitQueries();
        }
      )
      .subscribe((status) => {
        console.log("Cashier profit subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cashierId, invalidateProfitQueries]);
}
