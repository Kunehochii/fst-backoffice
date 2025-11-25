import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { API_ROUTES, QUERY_KEYS } from "@/lib/constants";
import type { Employee, EmployeeWithShifts } from "@/types/employee.types";
import type { CreateEmployeeInput, UpdateEmployeeInput } from "@/schemas/employee.schema";
import { toast } from "sonner";

/**
 * Hook to fetch all employees for the current business
 */
export function useEmployees() {
  return useQuery({
    queryKey: QUERY_KEYS.EMPLOYEES.ALL,
    queryFn: async () => {
      const response = await apiClient.get<Employee[]>(API_ROUTES.EMPLOYEES.GET_ALL);
      return response.data;
    },
  });
}

/**
 * Hook to fetch employees grouped by cashier (branch)
 * Returns a map of cashierId -> employees[]
 */
export function useEmployeesByCashier() {
  const { data: employees, ...rest } = useEmployees();

  const grouped = employees?.reduce(
    (acc, employee) => {
      const key = employee.cashierId || "unassigned";
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(employee);
      return acc;
    },
    {} as Record<string, Employee[]>
  );

  return {
    data: grouped,
    employees,
    ...rest,
  };
}

/**
 * Hook to fetch a single employee by ID
 */
export function useEmployee(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.EMPLOYEES.DETAIL(id),
    queryFn: async () => {
      const response = await apiClient.get<EmployeeWithShifts>(API_ROUTES.EMPLOYEES.GET_BY_ID(id));
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new employee
 */
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEmployeeInput) => {
      const response = await apiClient.post<Employee>(API_ROUTES.EMPLOYEES.CREATE, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.ALL });
      toast.success("Employee created successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

/**
 * Hook to update an employee
 */
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEmployeeInput }) => {
      const response = await apiClient.patch<Employee>(API_ROUTES.EMPLOYEES.UPDATE(id), data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.DETAIL(variables.id) });
      toast.success("Employee updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

/**
 * Hook to delete an employee
 */
export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(API_ROUTES.EMPLOYEES.DELETE(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.ALL });
      toast.success("Employee deleted successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
