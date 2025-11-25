import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/constants";
import type {
  Sheet,
  SheetWithCashier,
  SheetType,
  AddRowInput,
  AddRowsInput,
  AddCellsInput,
  EditCellInput,
  EditCellsInput,
  BatchUpdateRowPositionsInput,
  ReorderRowInput,
  Row,
  Cell,
} from "@/types/sheet.types";
import { toast } from "sonner";

/**
 * API Routes for Sheet
 */
const SHEET_API_ROUTES = {
  // Business endpoints
  BUSINESS_KAHON: "/sheet/business/kahon",
  BUSINESS_INVENTORY: "/sheet/business/inventory",
  BUSINESS_ADD_ROW: "/sheet/business/row",
  BUSINESS_ADD_ROWS: "/sheet/business/rows",
  BUSINESS_DELETE_ROW: (id: string) => `/sheet/business/row/${id}`,
  BUSINESS_BATCH_POSITIONS: "/sheet/business/rows/positions",
  BUSINESS_REORDER_ROW: "/sheet/business/row/reorder",
  BUSINESS_ADD_CELL: "/sheet/business/cell",
  BUSINESS_ADD_CELLS: "/sheet/business/cells",
  BUSINESS_UPDATE_CELL: (id: string) => `/sheet/business/cell/${id}`,
  BUSINESS_UPDATE_CELLS: "/sheet/business/cells",
  BUSINESS_DELETE_CELL: (id: string) => `/sheet/business/cell/${id}`,
} as const;

/**
 * Converts a date to the start of day in user's timezone as UTC ISO string
 */
export function getDateRangeForApi(date: Date): { startDate: string; endDate: string } {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return {
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  };
}

// ============================================================================
// BUSINESS HOOKS
// ============================================================================

/**
 * Hook to fetch all Kahon sheets for business
 */
export function useBusinessKahonSheets(date?: Date) {
  const dateRange = date ? getDateRangeForApi(date) : undefined;

  return useQuery({
    queryKey: [...QUERY_KEYS.SHEET.BUSINESS_KAHON, dateRange?.startDate],
    queryFn: async () => {
      const response = await apiClient.get<SheetWithCashier[]>(SHEET_API_ROUTES.BUSINESS_KAHON, {
        params: dateRange,
      });
      return response.data;
    },
  });
}

/**
 * Hook to fetch all Inventory sheets for business
 */
export function useBusinessInventorySheets(date?: Date) {
  const dateRange = date ? getDateRangeForApi(date) : undefined;

  return useQuery({
    queryKey: [...QUERY_KEYS.SHEET.BUSINESS_INVENTORY, dateRange?.startDate],
    queryFn: async () => {
      const response = await apiClient.get<SheetWithCashier[]>(
        SHEET_API_ROUTES.BUSINESS_INVENTORY,
        { params: dateRange }
      );
      return response.data;
    },
  });
}

// ============================================================================
// ROW MUTATIONS (Business)
// ============================================================================

/**
 * Hook to add a single row (business)
 */
export function useAddRow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddRowInput) => {
      const response = await apiClient.post<Row>(SHEET_API_ROUTES.BUSINESS_ADD_ROW, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SHEET.ALL });
      toast.success("Row added successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

/**
 * Hook to add multiple rows (business)
 */
export function useAddRows() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddRowsInput) => {
      const response = await apiClient.post<Row[]>(SHEET_API_ROUTES.BUSINESS_ADD_ROWS, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SHEET.ALL });
      toast.success("Rows added successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

/**
 * Hook to delete a row (business)
 */
export function useDeleteRow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rowId: string) => {
      await apiClient.delete(SHEET_API_ROUTES.BUSINESS_DELETE_ROW(rowId));
      return rowId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SHEET.ALL });
      toast.success("Row deleted successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

/**
 * Hook to batch update row positions (business)
 */
export function useBatchUpdateRowPositions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BatchUpdateRowPositionsInput) => {
      const response = await apiClient.patch(SHEET_API_ROUTES.BUSINESS_BATCH_POSITIONS, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SHEET.ALL });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

/**
 * Hook to reorder a single row (business)
 */
export function useReorderRow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReorderRowInput) => {
      const response = await apiClient.patch(SHEET_API_ROUTES.BUSINESS_REORDER_ROW, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SHEET.ALL });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

// ============================================================================
// CELL MUTATIONS (Business)
// ============================================================================

/**
 * Hook to add cells (business)
 */
export function useAddCells() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddCellsInput) => {
      const response = await apiClient.post<Cell[]>(SHEET_API_ROUTES.BUSINESS_ADD_CELLS, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SHEET.ALL });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

/**
 * Hook to update a single cell (business)
 */
export function useUpdateCell() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cellId, data }: { cellId: string; data: EditCellInput }) => {
      const response = await apiClient.patch<Cell>(
        SHEET_API_ROUTES.BUSINESS_UPDATE_CELL(cellId),
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SHEET.ALL });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

/**
 * Hook to update multiple cells (business)
 */
export function useUpdateCells() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EditCellsInput) => {
      const response = await apiClient.patch(SHEET_API_ROUTES.BUSINESS_UPDATE_CELLS, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SHEET.ALL });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

/**
 * Hook to delete a cell (business)
 */
export function useDeleteCell() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cellId: string) => {
      await apiClient.delete(SHEET_API_ROUTES.BUSINESS_DELETE_CELL(cellId));
      return cellId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SHEET.ALL });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
