"use client";

import { useMemo, useState } from "react";
import { GripVertical, Calculator } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  getDefaultColumnHeaders,
  evaluateFormula,
  formatCellNumber,
  parseNumericValue,
  type CellValueLookup,
} from "@/utils/sheet-utils";
import type { Row as SheetRow, Cell, SheetType } from "@/types/sheet.types";

// Default number of columns
const DEFAULT_COLUMNS = 10;

interface SheetTableProps {
  rows: SheetRow[];
  selectedRowIds: Set<string>;
  onRowSelectionChange: (rowIds: Set<string>) => void;
  editingCell: { rowId: string; columnIndex: number } | null;
  onCellSelect: (rowIndex: number, columnIndex: number, cell: Cell | null) => void;
  onCellEdit: (rowId: string, columnIndex: number) => void;
  onCellSave: (
    rowId: string,
    cellId: string | null,
    columnIndex: number,
    value: string | null,
    formula: string | null
  ) => void;
  onCellEditCancel: () => void;
  onRowReorder: (rowId: string, newIndex: number) => void;
  selectedCell: { rowIndex: number; columnIndex: number } | null;
  sheetType: SheetType;
}

export function SheetTable({
  rows,
  selectedRowIds,
  onRowSelectionChange,
  editingCell,
  onCellSelect,
  onCellEdit,
  onCellSave,
  onCellEditCancel,
  onRowReorder,
  selectedCell,
  sheetType,
}: SheetTableProps) {
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  // Sort rows by rowIndex
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => a.rowIndex - b.rowIndex);
  }, [rows]);

  // Create a lookup map for cell values (used for formula evaluation)
  const getCellValue: CellValueLookup = useMemo(() => {
    const lookup: CellValueLookup = (rowIndex: number, columnIndex: number) => {
      const row = sortedRows.find((r) => r.rowIndex === rowIndex);
      if (!row) return 0;

      const cell = row.cells.find((c) => c.columnIndex === columnIndex);
      if (!cell) return 0;

      // If cell has a formula, evaluate it recursively
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
  }, [sortedRows]);

  // Generate column headers (A, B, C, ...)
  const columnHeaders = useMemo(() => getDefaultColumnHeaders(DEFAULT_COLUMNS), []);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, rowId: string) => {
    setDraggedRowId(rowId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, rowIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetIndex(rowIndex);
  };

  const handleDragLeave = () => {
    setDropTargetIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetRowIndex: number) => {
    e.preventDefault();
    if (draggedRowId) {
      onRowReorder(draggedRowId, targetRowIndex);
    }
    setDraggedRowId(null);
    setDropTargetIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedRowId(null);
    setDropTargetIndex(null);
  };

  // Toggle row selection
  const toggleRowSelection = (rowId: string) => {
    const newSelection = new Set(selectedRowIds);
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }
    onRowSelectionChange(newSelection);
  };

  // Toggle all rows selection
  const toggleAllRows = () => {
    if (selectedRowIds.size === sortedRows.length) {
      onRowSelectionChange(new Set());
    } else {
      onRowSelectionChange(new Set(sortedRows.map((r) => r.id)));
    }
  };

  // Get cell by column index from a row
  const getCellByColumn = (row: SheetRow, columnIndex: number): Cell | null => {
    return row.cells.find((c) => c.columnIndex === columnIndex) || null;
  };

  // Calculate display value for a cell (handles formulas)
  const getDisplayValue = (cell: Cell | null): string => {
    if (!cell) return "";
    if (cell.formula) {
      try {
        const calculated = evaluateFormula(cell.formula, getCellValue);
        // Kahon uses ceiling, Inventory keeps 2 decimal places
        return formatCellNumber(calculated, sheetType === "KAHON" ? "ceil" : "decimal");
      } catch {
        return cell.value || "Error";
      }
    }
    return cell.value || "";
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {/* Checkbox column */}
              <TableHead className="w-10 text-center sticky left-0 bg-muted/50 z-20">
                <Checkbox
                  checked={sortedRows.length > 0 && selectedRowIds.size === sortedRows.length}
                  onCheckedChange={toggleAllRows}
                />
              </TableHead>

              {/* Drag handle column */}
              <TableHead className="w-10 sticky left-10 bg-muted/50 z-20" />

              {/* Row number column */}
              <TableHead className="w-12 text-center font-mono text-muted-foreground sticky left-20 bg-muted/50 z-20">
                #
              </TableHead>

              {/* Data columns (A, B, C, ...) */}
              {columnHeaders.map((header) => (
                <TableHead key={header} className="min-w-[120px] text-center font-mono">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3 + columnHeaders.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No rows yet. Click &quot;Add Row&quot; to get started.
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.map((row) => (
                <TableRow
                  key={row.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, row.id)}
                  onDragOver={(e) => handleDragOver(e, row.rowIndex)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, row.rowIndex)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "group transition-colors",
                    draggedRowId === row.id && "opacity-50",
                    dropTargetIndex === row.rowIndex &&
                      draggedRowId !== row.id &&
                      "border-t-2 border-t-primary"
                  )}
                >
                  {/* Checkbox */}
                  <TableCell className="text-center sticky left-0 bg-background z-10">
                    <Checkbox
                      checked={selectedRowIds.has(row.id)}
                      onCheckedChange={() => toggleRowSelection(row.id)}
                    />
                  </TableCell>

                  {/* Drag handle */}
                  <TableCell className="sticky left-10 bg-background z-10 cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </TableCell>

                  {/* Row number */}
                  <TableCell className="text-center font-mono text-xs text-muted-foreground sticky left-20 bg-background z-10">
                    {row.rowIndex + 1}
                  </TableCell>

                  {/* Data cells */}
                  {columnHeaders.map((_, colIndex) => {
                    const cell = getCellByColumn(row, colIndex);
                    const isEditing =
                      editingCell?.rowId === row.id && editingCell?.columnIndex === colIndex;
                    const isSelected =
                      selectedCell?.rowIndex === row.rowIndex &&
                      selectedCell?.columnIndex === colIndex;

                    return (
                      <TableCell
                        key={`${row.id}-${colIndex}`}
                        className={cn(
                          "p-0 relative",
                          isSelected && "ring-2 ring-inset ring-primary",
                          cell?.color && "relative"
                        )}
                        style={{
                          backgroundColor: cell?.color || undefined,
                        }}
                        onClick={() => onCellSelect(row.rowIndex, colIndex, cell)}
                        onDoubleClick={() => onCellEdit(row.id, colIndex)}
                      >
                        {isEditing ? (
                          <CellInput
                            cell={cell}
                            rowId={row.id}
                            columnIndex={colIndex}
                            sheetType={sheetType}
                            getCellValue={getCellValue}
                            onSave={onCellSave}
                            onCancel={onCellEditCancel}
                          />
                        ) : (
                          <div className="px-2 py-1 min-h-[32px] flex items-center justify-between">
                            <span
                              className={cn(
                                "text-sm truncate",
                                cell?.formula && "text-blue-600 dark:text-blue-400"
                              )}
                            >
                              {getDisplayValue(cell)}
                            </span>
                            {cell?.formula && (
                              <Calculator className="h-3 w-3 text-muted-foreground shrink-0 ml-1" />
                            )}
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Cell input component for editing
interface CellInputProps {
  cell: Cell | null;
  rowId: string;
  columnIndex: number;
  getCellValue: CellValueLookup;
  sheetType: SheetType;
  onSave: (
    rowId: string,
    cellId: string | null,
    columnIndex: number,
    value: string | null,
    formula: string | null
  ) => void;
  onCancel: () => void;
}

function CellInput({
  cell,
  rowId,
  columnIndex,
  getCellValue,
  sheetType,
  onSave,
  onCancel,
}: CellInputProps) {
  const [value, setValue] = useState(cell?.formula || cell?.value || "");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const handleSave = () => {
    const trimmed = value.trim();

    if (trimmed === "") {
      onSave(rowId, cell?.id || null, columnIndex, null, null);
      return;
    }

    // Check if it's a formula
    const formulaPattern = /[A-Za-z]+\d+/;
    const hasOperators = /[\+\-\*\/]/.test(trimmed);
    const isFormula = formulaPattern.test(trimmed) && hasOperators;

    if (isFormula) {
      try {
        const calculated = evaluateFormula(trimmed, getCellValue);
        const formatMode = sheetType === "KAHON" ? "ceil" : "decimal";
        onSave(
          rowId,
          cell?.id || null,
          columnIndex,
          formatCellNumber(calculated, formatMode),
          trimmed
        );
      } catch {
        onSave(rowId, cell?.id || null, columnIndex, trimmed, null);
      }
    } else {
      onSave(rowId, cell?.id || null, columnIndex, trimmed, null);
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleSave}
      autoFocus
      className="w-full h-full px-2 py-1 text-sm font-mono bg-background border-none outline-none focus:ring-0"
      placeholder="Value or formula"
    />
  );
}
