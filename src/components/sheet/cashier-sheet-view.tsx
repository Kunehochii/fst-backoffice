"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SheetTable } from "./sheet-table";
import { SheetToolbar } from "./sheet-toolbar";
import {
  useAddRow,
  useDeleteRow,
  useReorderRow,
  useUpdateCell,
  useUpdateCells,
  useAddCells,
} from "@/hooks";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  generateSumAllAboveFormula,
  generateSumAboveFormula,
  generateSubtractAboveFormula,
  generateSubtractAllAboveFormula,
  generateMultiplyLeftFormula,
  generateAddLeftFormula,
  generateMultiplyForAllRows,
  generateAddForAllRows,
  evaluateFormula,
  formatCellNumber,
  parseNumericValue,
  type QuickFormulaType,
  type CellValueLookup,
} from "@/utils/sheet-utils";
import type { Cashier } from "@/types/auth.types";
import type { SheetWithCashier, SheetType, Row, Cell, EditCellInput } from "@/types/sheet.types";

interface CashierSheetViewProps {
  sheet: SheetWithCashier;
  sheetType: SheetType;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onBack: () => void;
  isLoading?: boolean;
}

// Pending changes tracking
interface PendingCellChange {
  cellId: string | null; // null means new cell
  rowId: string;
  columnIndex: number;
  value: string | null;
  formula: string | null;
  color: string | null;
}

export function CashierSheetView({
  sheet,
  sheetType,
  selectedDate,
  onDateChange,
  onBack,
  isLoading,
}: CashierSheetViewProps) {
  // Local state
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    columnIndex: number;
  } | null>(null);
  const [selectedCell, setSelectedCell] = useState<{
    rowIndex: number;
    columnIndex: number;
  } | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingCellChange>>(new Map());

  // Mutations
  const addRowMutation = useAddRow();
  const deleteRowMutation = useDeleteRow();
  const reorderRowMutation = useReorderRow();
  const updateCellMutation = useUpdateCell();
  const updateCellsMutation = useUpdateCells();
  const addCellsMutation = useAddCells();

  // Get the current selected cell data
  const selectedCellData = useMemo(() => {
    if (!selectedCell) return null;
    const row = sheet.rows.find((r) => r.rowIndex === selectedCell.rowIndex);
    if (!row) return null;
    return row.cells.find((c) => c.columnIndex === selectedCell.columnIndex) || null;
  }, [sheet.rows, selectedCell]);

  // Get cell value lookup function (for formula evaluation)
  const getCellValue: CellValueLookup = useMemo(() => {
    const lookup: CellValueLookup = (rowIndex: number, columnIndex: number) => {
      const row = sheet.rows.find((r) => r.rowIndex === rowIndex);
      if (!row) return 0;

      const cell = row.cells.find((c) => c.columnIndex === columnIndex);
      if (!cell) return 0;

      // Check pending changes first
      const pendingKey = `${row.id}-${columnIndex}`;
      const pending = pendingChanges.get(pendingKey);
      if (pending) {
        if (pending.formula) {
          try {
            return evaluateFormula(pending.formula, lookup);
          } catch {
            return 0;
          }
        }
        return parseNumericValue(pending.value);
      }

      if (cell.formula) {
        try {
          return evaluateFormula(cell.formula, lookup);
        } catch {
          return 0;
        }
      }

      return parseNumericValue(cell.value);
    };
    return lookup;
  }, [sheet.rows, pendingChanges]);

  // Get the format mode based on sheet type
  const formatMode = sheetType === "KAHON" ? "ceil" : "decimal";

  // Handlers
  const handleAddRow = useCallback(
    (options: { rowCount: number; customDate?: Date }) => {
      const maxRowIndex = Math.max(...sheet.rows.map((r) => r.rowIndex), -1);
      const customCreatedAt = options.customDate?.toISOString();

      // Add multiple rows based on rowCount
      for (let i = 0; i < options.rowCount; i++) {
        addRowMutation.mutate({
          sheetId: sheet.id,
          rowIndex: maxRowIndex + 1 + i,
          createdAt: customCreatedAt,
        });
      }
    },
    [sheet.id, sheet.rows, addRowMutation]
  );

  const handleDeleteSelectedRows = useCallback(() => {
    // Delete rows one by one
    selectedRowIds.forEach((rowId) => {
      deleteRowMutation.mutate(rowId);
    });
    setSelectedRowIds(new Set());
  }, [selectedRowIds, deleteRowMutation]);

  const handleCellSelect = useCallback(
    (rowIndex: number, columnIndex: number, cell: Cell | null) => {
      setSelectedCell({ rowIndex, columnIndex });
    },
    []
  );

  const handleCellEdit = useCallback((rowId: string, columnIndex: number) => {
    setEditingCell({ rowId, columnIndex });
  }, []);

  const handleCellSave = useCallback(
    (
      rowId: string,
      cellId: string | null,
      columnIndex: number,
      value: string | null,
      formula: string | null
    ) => {
      const changeKey = `${rowId}-${columnIndex}`;

      // Get current cell color if exists
      const row = sheet.rows.find((r) => r.id === rowId);
      const cell = row?.cells.find((c) => c.columnIndex === columnIndex);

      setPendingChanges((prev) => {
        const newChanges = new Map(prev);
        newChanges.set(changeKey, {
          cellId,
          rowId,
          columnIndex,
          value,
          formula,
          color: cell?.color || null,
        });
        return newChanges;
      });

      setEditingCell(null);
    },
    [sheet.rows]
  );

  const handleCellEditCancel = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleRowReorder = useCallback(
    (rowId: string, newIndex: number) => {
      reorderRowMutation.mutate({ rowId, newRowIndex: newIndex });
    },
    [reorderRowMutation]
  );

  const handleCellColorChange = useCallback(
    (color: string | null) => {
      if (!selectedCell) return;

      const row = sheet.rows.find((r) => r.rowIndex === selectedCell.rowIndex);
      if (!row) return;

      const cell = row.cells.find((c) => c.columnIndex === selectedCell.columnIndex);
      const changeKey = `${row.id}-${selectedCell.columnIndex}`;

      setPendingChanges((prev) => {
        const newChanges = new Map(prev);
        const existing = newChanges.get(changeKey);
        newChanges.set(changeKey, {
          cellId: cell?.id || null,
          rowId: row.id,
          columnIndex: selectedCell.columnIndex,
          value: existing?.value ?? cell?.value ?? null,
          formula: existing?.formula ?? cell?.formula ?? null,
          color,
        });
        return newChanges;
      });
    },
    [selectedCell, sheet.rows]
  );

  const handleApplyQuickFormula = useCallback(
    (type: QuickFormulaType) => {
      if (!selectedCell) return;

      const row = sheet.rows.find((r) => r.rowIndex === selectedCell.rowIndex);
      if (!row) return;

      let formula = "";

      switch (type) {
        case "sum-all-above":
          formula = generateSumAllAboveFormula(selectedCell.rowIndex, selectedCell.columnIndex);
          break;
        case "sum-above-2":
          formula = generateSumAboveFormula(selectedCell.rowIndex, selectedCell.columnIndex, 2);
          break;
        case "subtract-above-2":
          formula = generateSubtractAboveFormula(
            selectedCell.rowIndex,
            selectedCell.columnIndex,
            2
          );
          break;
        case "subtract-all-above":
          formula = generateSubtractAllAboveFormula(
            selectedCell.rowIndex,
            selectedCell.columnIndex
          );
          break;
        case "multiply-left-2":
          formula = generateMultiplyLeftFormula(selectedCell.rowIndex, selectedCell.columnIndex, 2);
          break;
        case "add-left-2":
          formula = generateAddLeftFormula(selectedCell.rowIndex, selectedCell.columnIndex, 2);
          break;
        case "multiply-all-rows":
        case "add-all-rows": {
          // Bulk operations
          const rowsData = sheet.rows.map((r) => ({
            rowIndex: r.rowIndex,
            cells: r.cells.map((c) => ({
              columnIndex: c.columnIndex,
              value: c.value,
            })),
          }));

          const bulkResults =
            type === "multiply-all-rows"
              ? generateMultiplyForAllRows(rowsData, selectedCell.columnIndex, 2)
              : generateAddForAllRows(rowsData, selectedCell.columnIndex, 2);

          // Apply bulk formulas
          bulkResults.forEach((result) => {
            const targetRow = sheet.rows.find((r) => r.rowIndex === result.rowIndex);
            if (!targetRow) return;

            const cell = targetRow.cells.find((c) => c.columnIndex === result.columnIndex);
            const changeKey = `${targetRow.id}-${result.columnIndex}`;

            try {
              const calculatedValue = evaluateFormula(result.formula, getCellValue);
              setPendingChanges((prev) => {
                const newChanges = new Map(prev);
                newChanges.set(changeKey, {
                  cellId: cell?.id || null,
                  rowId: targetRow.id,
                  columnIndex: result.columnIndex,
                  value: formatCellNumber(calculatedValue, formatMode),
                  formula: result.formula,
                  color: cell?.color || null,
                });
                return newChanges;
              });
            } catch {
              // Skip cells where formula evaluation fails
            }
          });
          return;
        }
      }

      if (formula) {
        const cell = row.cells.find((c) => c.columnIndex === selectedCell.columnIndex);
        try {
          const calculatedValue = evaluateFormula(formula, getCellValue);
          const changeKey = `${row.id}-${selectedCell.columnIndex}`;

          setPendingChanges((prev) => {
            const newChanges = new Map(prev);
            newChanges.set(changeKey, {
              cellId: cell?.id || null,
              rowId: row.id,
              columnIndex: selectedCell.columnIndex,
              value: formatCellNumber(calculatedValue, formatMode),
              formula,
              color: cell?.color || null,
            });
            return newChanges;
          });
        } catch {
          // Formula evaluation failed
        }
      }
    },
    [selectedCell, sheet.rows, getCellValue, formatMode]
  );

  const handleSaveChanges = useCallback(async () => {
    if (pendingChanges.size === 0) return;

    const updates: Array<EditCellInput & { id: string }> = [];
    const newCells: Array<{
      rowId: string;
      columnIndex: number;
      value?: string;
      formula?: string;
      color?: string;
      isCalculated?: boolean;
    }> = [];

    pendingChanges.forEach((change) => {
      if (change.cellId) {
        // Update existing cell
        updates.push({
          id: change.cellId,
          value: change.value || undefined,
          formula: change.formula || undefined,
          color: change.color || undefined,
          isCalculated: !!change.formula,
        });
      } else {
        // Create new cell
        newCells.push({
          rowId: change.rowId,
          columnIndex: change.columnIndex,
          value: change.value || undefined,
          formula: change.formula || undefined,
          color: change.color || undefined,
          isCalculated: !!change.formula,
        });
      }
    });

    // Execute mutations
    const promises: Promise<unknown>[] = [];

    if (updates.length > 0) {
      promises.push(updateCellsMutation.mutateAsync({ cells: updates }));
    }

    if (newCells.length > 0) {
      promises.push(addCellsMutation.mutateAsync({ cells: newCells }));
    }

    await Promise.all(promises);
    setPendingChanges(new Map());
  }, [pendingChanges, updateCellsMutation, addCellsMutation]);

  // Merge pending changes with actual rows for display
  const displayRows = useMemo(() => {
    return sheet.rows.map((row) => {
      const updatedCells = row.cells.map((cell) => {
        const changeKey = `${row.id}-${cell.columnIndex}`;
        const pending = pendingChanges.get(changeKey);
        if (pending) {
          return {
            ...cell,
            value: pending.value,
            formula: pending.formula,
            color: pending.color,
          };
        }
        return cell;
      });

      // Add pending changes for new cells
      pendingChanges.forEach((change, key) => {
        if (change.rowId === row.id && !change.cellId) {
          const existingCell = updatedCells.find((c) => c.columnIndex === change.columnIndex);
          if (!existingCell) {
            updatedCells.push({
              id: `pending-${key}`,
              columnIndex: change.columnIndex,
              value: change.value,
              formula: change.formula,
              color: change.color,
              isCalculated: !!change.formula,
              rowId: row.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
      });

      return { ...row, cells: updatedCells };
    });
  }, [sheet.rows, pendingChanges]);

  // Get selected cell color (from pending or actual)
  const selectedCellColor = useMemo(() => {
    if (!selectedCell) return null;
    const row = sheet.rows.find((r) => r.rowIndex === selectedCell.rowIndex);
    if (!row) return null;

    const changeKey = `${row.id}-${selectedCell.columnIndex}`;
    const pending = pendingChanges.get(changeKey);
    if (pending) return pending.color;

    const cell = row.cells.find((c) => c.columnIndex === selectedCell.columnIndex);
    return cell?.color || null;
  }, [selectedCell, sheet.rows, pendingChanges]);

  const isSaving = updateCellsMutation.isPending || addCellsMutation.isPending;
  const sheetTypeName = sheetType === "KAHON" ? "Kahon" : "Inventory";
  const branchName = sheet.cashier?.branchName || "Unknown Branch";

  if (isLoading) {
    return <SheetViewSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {branchName} - {sheetTypeName}
            </h1>
            <p className="text-muted-foreground">
              Manage {sheetTypeName.toLowerCase()} sheet for this branch
            </p>
          </div>
        </div>

        {/* Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateChange(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Sheet Card */}
      <Card>
        <CardContent className="p-0">
          {/* Toolbar */}
          <SheetToolbar
            onAddRow={handleAddRow}
            onDeleteSelectedRows={handleDeleteSelectedRows}
            isAddingRow={addRowMutation.isPending}
            isDeletingRows={deleteRowMutation.isPending}
            hasSelectedRows={selectedRowIds.size > 0}
            selectedCell={selectedCell}
            selectedCellColor={selectedCellColor}
            onCellColorChange={handleCellColorChange}
            onApplyQuickFormula={handleApplyQuickFormula}
            hasChanges={pendingChanges.size > 0}
            onSaveChanges={handleSaveChanges}
            isSaving={isSaving}
            currentDate={selectedDate}
          />

          {/* Table */}
          <SheetTable
            rows={displayRows}
            sheetType={sheetType}
            selectedRowIds={selectedRowIds}
            onRowSelectionChange={setSelectedRowIds}
            editingCell={editingCell}
            onCellSelect={handleCellSelect}
            onCellEdit={handleCellEdit}
            onCellSave={handleCellSave}
            onCellEditCancel={handleCellEditCancel}
            onRowReorder={handleRowReorder}
            selectedCell={selectedCell}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SheetViewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
