import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { getDateRangeForDay } from "@/utils";
import type { Delivery, DeliveryFilters } from "@/types/delivery.types";

/**
 * API Routes for Delivery
 */
const DELIVERY_API_ROUTES = {
  // Business endpoints (Supabase Auth)
  GET_BUSINESS: "/delivery/business",
} as const;

/**
 * Query keys for delivery
 */
export const DELIVERY_QUERY_KEYS = {
  ALL: ["delivery"],
  LIST: (filters?: DeliveryFilters) => ["delivery", "list", filters],
  BUSINESS: (filters?: DeliveryFilters) => ["delivery", "business", filters],
  DETAIL: (id: string) => ["delivery", "detail", id],
} as const;

/**
 * Build filters with date range for a specific day
 */
export function buildDayFilters(
  date: Date,
  additionalFilters?: Partial<DeliveryFilters>
): DeliveryFilters {
  const { startDate, endDate } = getDateRangeForDay(date);
  return {
    startDate,
    endDate,
    ...additionalFilters,
  };
}

/**
 * Hook to fetch all deliveries for the business
 */
export function useBusinessDeliveries(date: Date, additionalFilters?: Partial<DeliveryFilters>) {
  const filters = buildDayFilters(date, additionalFilters);

  return useQuery({
    queryKey: DELIVERY_QUERY_KEYS.BUSINESS(filters),
    queryFn: async () => {
      const response = await apiClient.get<Delivery[]>(DELIVERY_API_ROUTES.GET_BUSINESS, {
        params: filters,
      });
      return response.data;
    },
  });
}

/**
 * Hook to fetch deliveries for a specific cashier (filtered from business deliveries)
 * Since the backend returns all deliveries for the business, we filter client-side
 */
export function useCashierDeliveries(
  cashierId: string | undefined,
  date: Date,
  additionalFilters?: Partial<DeliveryFilters>
) {
  const filters = buildDayFilters(date, additionalFilters);

  return useQuery({
    queryKey: [...DELIVERY_QUERY_KEYS.BUSINESS(filters), "cashier", cashierId],
    queryFn: async () => {
      const response = await apiClient.get<Delivery[]>(DELIVERY_API_ROUTES.GET_BUSINESS, {
        params: filters,
      });
      // Filter by cashier ID
      if (cashierId) {
        return response.data.filter((delivery) => delivery.cashierId === cashierId);
      }
      return response.data;
    },
    enabled: !!cashierId,
  });
}

/**
 * Group deliveries by cashier for summary view
 */
export function groupDeliveriesByCashier(deliveries: Delivery[]): Map<string, Delivery[]> {
  const grouped = new Map<string, Delivery[]>();

  for (const delivery of deliveries) {
    const cashierId = delivery.cashierId;
    if (!grouped.has(cashierId)) {
      grouped.set(cashierId, []);
    }
    grouped.get(cashierId)!.push(delivery);
  }

  return grouped;
}
