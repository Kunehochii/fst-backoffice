import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { API_ROUTES, QUERY_KEYS } from "@/lib/constants";
import { createProductToApi, updateProductToApi } from "@/lib/decimal";
import type { Product, ProductFilters } from "@/types/product.types";
import type {
  CreateProductInput,
  UpdateProductInput,
  TransferProductInput,
} from "@/schemas/product.schema";
import { toast } from "sonner";

/**
 * Hook to fetch all products for a specific cashier
 */
export function useProducts(cashierId: string, filters?: ProductFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTS.LIST(cashierId, filters),
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters?.category) params.category = filters.category;
      if (filters?.productSearch) params.productSearch = filters.productSearch;

      const response = await apiClient.get<Product[]>(
        API_ROUTES.PRODUCTS.GET_BY_CASHIER(cashierId),
        { params }
      );
      return response.data;
    },
    enabled: !!cashierId,
  });
}

/**
 * Hook to fetch all products for the business
 */
export function useAllProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTS.ALL_BUSINESS(filters),
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters?.category) params.category = filters.category;
      if (filters?.productSearch) params.productSearch = filters.productSearch;

      const response = await apiClient.get<Product[]>(API_ROUTES.PRODUCTS.GET_ALL, { params });
      return response.data;
    },
  });
}

/**
 * Hook to fetch a single product by ID
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTS.DETAIL(id),
    queryFn: async () => {
      const response = await apiClient.get<Product>(API_ROUTES.PRODUCTS.GET_BY_ID(id));
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductInput) => {
      const apiData = createProductToApi(data);
      const response = await apiClient.post<Product>(API_ROUTES.PRODUCTS.CREATE, apiData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS.ALL });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PRODUCTS.LIST(variables.cashierId),
      });
      toast.success("Product created successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

/**
 * Hook to update a product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductInput }) => {
      const apiData = updateProductToApi(data);
      const response = await apiClient.put<Product>(API_ROUTES.PRODUCTS.UPDATE(id), apiData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS.ALL });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PRODUCTS.LIST(data.cashierId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS.DETAIL(data.id) });
      toast.success("Product updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

/**
 * Hook to delete a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<Product>(API_ROUTES.PRODUCTS.DELETE(id));
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS.ALL });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PRODUCTS.LIST(data.cashierId),
      });
      toast.success("Product deleted successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

/**
 * Hook to transfer a product to another cashier
 */
export function useTransferProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TransferProductInput) => {
      const response = await apiClient.post<Product>(API_ROUTES.PRODUCTS.TRANSFER, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS.ALL });
      toast.success("Product transferred successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
