import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { API_ROUTES, QUERY_KEYS } from "@/lib/constants";
import type { Cashier } from "@/types/auth.types";
import type {
  CreateCashierInput,
  EditCashierInput,
  EditCashierPasswordInput,
} from "@/schemas/cashier.schema";
import { toast } from "sonner";

/**
 * Hook to fetch all cashiers for the current business
 */
export function useCashiers(branchName?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CASHIERS.LIST(branchName),
    queryFn: async () => {
      const params = branchName ? { branchName } : undefined;
      const response = await apiClient.get<Cashier[]>(API_ROUTES.CASHIER.GET_ALL, {
        params,
      });
      return response.data;
    },
  });
}

/**
 * Hook to fetch a single cashier by ID
 */
export function useCashier(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CASHIERS.DETAIL(id),
    queryFn: async () => {
      const response = await apiClient.get<Cashier>(API_ROUTES.CASHIER.GET_BY_ID(id));
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new cashier
 */
export function useCreateCashier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCashierInput) => {
      const response = await apiClient.post<Cashier>(API_ROUTES.AUTH.CASHIER_CREATE, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CASHIERS.ALL });
      toast.success("Cashier created successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

/**
 * Hook to edit a cashier's details
 */
export function useEditCashier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EditCashierInput }) => {
      const response = await apiClient.patch<Cashier>(API_ROUTES.AUTH.CASHIER_EDIT(id), data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CASHIERS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CASHIERS.DETAIL(variables.id) });
      toast.success("Cashier updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

/**
 * Hook to edit a cashier's password
 */
export function useEditCashierPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EditCashierPasswordInput }) => {
      const response = await apiClient.patch<{ message: string }>(
        API_ROUTES.AUTH.CASHIER_EDIT_PASSWORD(id),
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CASHIERS.DETAIL(variables.id) });
      toast.success("Password updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
