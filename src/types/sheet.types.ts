/**
 * Sheet type enum (matches backend)
 */
export enum SheetType {
  KAHON = "KAHON",
  INVENTORY = "INVENTORY",
}

/**
 * Cell in a sheet row
 */
export interface Cell {
  id: string;
  columnIndex: number;
  value: string | null;
  formula: string | null;
  color: string | null;
  isCalculated: boolean;
  rowId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Row in a sheet
 */
export interface Row {
  id: string;
  rowIndex: number;
  isItemRow: boolean;
  itemName: string | null;
  sheetId: string;
  createdAt: string;
  updatedAt: string;
  cells: Cell[];
}

/**
 * Sheet with all data
 */
export interface Sheet {
  id: string;
  type: SheetType;
  cashierId: string;
  createdAt: string;
  updatedAt: string;
  rows: Row[];
}

/**
 * Sheet with cashier info (for business endpoints)
 */
export interface SheetWithCashier extends Sheet {
  cashier?: {
    id: string;
    username: string;
    branchName: string;
  };
}

/**
 * Add row input
 */
export interface AddRowInput {
  sheetId: string;
  rowIndex: number;
  isItemRow?: boolean;
  itemName?: string;
  createdAt?: string; // ISO 8601 UTC format
  cells?: AddCellInput[];
}

/**
 * Add multiple rows input
 */
export interface AddRowsInput {
  sheetId: string;
  rows: Omit<AddRowInput, "sheetId">[];
}

/**
 * Add cell input
 */
export interface AddCellInput {
  columnIndex: number;
  value?: string;
  formula?: string;
  color?: string;
  isCalculated?: boolean;
}

/**
 * Add cell with row ID
 */
export interface AddCellWithRowInput extends AddCellInput {
  rowId: string;
}

/**
 * Add multiple cells input
 */
export interface AddCellsInput {
  cells: AddCellWithRowInput[];
}

/**
 * Edit cell input
 */
export interface EditCellInput {
  value?: string;
  formula?: string;
  color?: string;
  isCalculated?: boolean;
}

/**
 * Edit multiple cells input
 */
export interface EditCellsInput {
  cells: (EditCellInput & { id: string })[];
}

/**
 * Batch update row positions input
 */
export interface BatchUpdateRowPositionsInput {
  updates: {
    rowId: string;
    newRowIndex: number;
  }[];
}

/**
 * Reorder single row input
 */
export interface ReorderRowInput {
  rowId: string;
  newRowIndex: number;
}

/**
 * Get sheet by date query params
 */
export interface GetSheetByDateParams {
  startDate?: string; // ISO 8601 UTC
  endDate?: string; // ISO 8601 UTC
}
