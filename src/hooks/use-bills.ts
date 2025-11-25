import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/constants";
import type { BillCount, CreateBillCountInput } from "@/types/bill.types";
import { toast } from "sonner";

/**
 * API Routes for Bills
 */
const BILLS_API_ROUTES = {
  // Business endpoints
  GET_ALL_BY_DATE: "/bills/all/by-date",
  GET_CASHIER_BY_DATE: (cashierId: string) => `/bills/cashier/${cashierId}`,
  CREATE_FOR_CASHIER: (cashierId: string) => `/bills/cashier/${cashierId}`,
} as const;

/**
 * Converts a date to the start of day in user's timezone as UTC ISO string
 * This is the format the backend expects
 */
export function getDateForApi(date: Date): string {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay.toISOString();
}

/**
 * Hook to fetch all cashiers' bill counts for a specific date
 */
export function useAllBillCounts(date: Date) {
  const dateStr = getDateForApi(date);

  return useQuery({
    queryKey: [...QUERY_KEYS.BILLS.ALL, dateStr],
    queryFn: async () => {
      const response = await apiClient.get<BillCount[]>(BILLS_API_ROUTES.GET_ALL_BY_DATE, {
        params: { date: dateStr },
      });
      return response.data;
    },
  });
}

/**
 * Hook to fetch a specific cashier's bill count for a date
 */
export function useCashierBillCount(cashierId: string, date: Date) {
  const dateStr = getDateForApi(date);

  return useQuery({
    queryKey: QUERY_KEYS.BILLS.CASHIER(cashierId, dateStr),
    queryFn: async () => {
      const response = await apiClient.get<BillCount>(
        BILLS_API_ROUTES.GET_CASHIER_BY_DATE(cashierId),
        {
          params: { date: dateStr },
        }
      );
      return response.data;
    },
    enabled: !!cashierId,
  });
}

/**
 * Hook to create or update a cashier's bill count
 */
export function useCreateOrUpdateBillCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cashierId,
      date,
      data,
    }: {
      cashierId: string;
      date: Date;
      data: CreateBillCountInput;
    }) => {
      const dateStr = getDateForApi(date);
      const response = await apiClient.post<BillCount>(
        BILLS_API_ROUTES.CREATE_FOR_CASHIER(cashierId),
        data,
        { params: { date: dateStr } }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      const dateStr = getDateForApi(variables.date);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BILLS.ALL });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BILLS.CASHIER(variables.cashierId, dateStr),
      });
      toast.success("Bill count saved successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
