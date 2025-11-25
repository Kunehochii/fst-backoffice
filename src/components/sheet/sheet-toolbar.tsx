"use client";

import { Save, Loader2, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddRowDialog } from "./add-row-dialog";
import { QuickFormulaMenu } from "./quick-formula-menu";
import { ColorPicker } from "./color-picker";
import type { QuickFormulaType } from "@/utils/sheet-utils";

interface SheetToolbarProps {
  // Row operations
  onAddRow: (options: { rowCount: number; customDate?: Date }) => void;
  onDeleteSelectedRows: () => void;
  isAddingRow?: boolean;
  isDeletingRows?: boolean;
  hasSelectedRows: boolean;

  // Cell operations
  selectedCell: { rowIndex: number; columnIndex: number } | null;
  selectedCellColor: string | null;
  onCellColorChange: (color: string | null) => void;
  onApplyQuickFormula: (type: QuickFormulaType) => void;

  // Save operations
  hasChanges: boolean;
  onSaveChanges: () => void;
  isSaving?: boolean;

  // Current date for adding rows
  currentDate: Date;
}

export function SheetToolbar({
  onAddRow,
  onDeleteSelectedRows,
  isAddingRow,
  isDeletingRows,
  hasSelectedRows,
  selectedCell,
  selectedCellColor,
  onCellColorChange,
  onApplyQuickFormula,
  hasChanges,
  onSaveChanges,
  isSaving,
  currentDate,
}: SheetToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-2 border-b bg-muted/30">
      <div className="flex items-center gap-2">
        {/* Add Row */}
        <AddRowDialog onAddRows={onAddRow} isLoading={isAddingRow} currentDate={currentDate} />

        {/* Delete Selected Rows */}
        <Button
          variant="outline"
          size="sm"
          onClick={onDeleteSelectedRows}
          disabled={!hasSelectedRows || isDeletingRows}
          className="text-destructive hover:text-destructive"
        >
          {isDeletingRows ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Delete Row
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Quick Formula */}
        <QuickFormulaMenu
          onSelectFormula={onApplyQuickFormula}
          disabled={!selectedCell}
          currentRowIndex={selectedCell?.rowIndex}
          currentColumnIndex={selectedCell?.columnIndex}
        />

        {/* Cell Color */}
        <ColorPicker
          value={selectedCellColor}
          onChange={onCellColorChange}
          disabled={!selectedCell}
        />

        <div className="w-px h-6 bg-border mx-1" />

        {/* Reorder hint */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <GripVertical className="h-4 w-4" />
          <span>Drag to reorder rows</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Save Changes */}
        <Button size="sm" onClick={onSaveChanges} disabled={!hasChanges || isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {hasChanges ? "Save Changes" : "Saved"}
        </Button>
      </div>
    </div>
  );
}
