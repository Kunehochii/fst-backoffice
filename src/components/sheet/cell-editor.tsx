/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCellAddress,
  evaluateFormula,
  formatCellNumber,
  type CellValueLookup,
} from "@/utils/sheet-utils";

interface CellEditorProps {
  value: string | null;
  formula: string | null;
  rowIndex: number;
  columnIndex: number;
  isEditing: boolean;
  onSave: (value: string | null, formula: string | null) => void;
  onCancel: () => void;
  getCellValue: CellValueLookup;
  className?: string;
}

export function CellEditor({
  value,
  formula,
  rowIndex,
  columnIndex,
  isEditing,
  onSave,
  onCancel,
  getCellValue,
  className,
}: CellEditorProps) {
  const [editValue, setEditValue] = useState<string>("");
  const [isFormula, setIsFormula] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize edit value and focus input when entering edit mode
  const prevIsEditingRef = useRef(isEditing);
  useEffect(() => {
    if (isEditing && !prevIsEditingRef.current) {
      // Entering edit mode - initialize values
      if (formula) {
        setEditValue(formula);
        setIsFormula(true);
      } else {
        setEditValue(value || "");
        setIsFormula(false);
      }
      inputRef.current?.focus();
    }
    prevIsEditingRef.current = isEditing;
  }, [isEditing, value, formula]);

  const handleSave = useCallback(() => {
    const trimmed = editValue.trim();

    if (trimmed === "") {
      onSave(null, null);
      return;
    }

    // Check if it's a formula (contains cell references like A1, B2, etc.)
    const formulaPattern = /[A-Za-z]+\d+/;
    const hasFormulaChars = /[\+\-\*\/]/.test(trimmed);
    const isLikelyFormula = formulaPattern.test(trimmed) && hasFormulaChars;

    if (isLikelyFormula || isFormula) {
      // Calculate the value from the formula
      try {
        const calculatedValue = evaluateFormula(trimmed, getCellValue);
        onSave(formatCellNumber(calculatedValue), trimmed);
      } catch {
        // If formula evaluation fails, just save as text
        onSave(trimmed, null);
      }
    } else {
      // Regular value
      onSave(trimmed, null);
    }
  }, [editValue, isFormula, getCellValue, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    },
    [handleSave, onCancel]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEditValue(newValue);

    // Auto-detect if this looks like a formula
    const formulaPattern = /[A-Za-z]+\d+/;
    const hasFormulaChars = /[\+\-\*\/]/.test(newValue);
    setIsFormula(formulaPattern.test(newValue) && hasFormulaChars);
  };

  // Calculate preview value if editing a formula
  const previewValue = isFormula
    ? (() => {
        try {
          return formatCellNumber(evaluateFormula(editValue, getCellValue));
        } catch {
          return "Error";
        }
      })()
    : null;

  const cellAddress = getCellAddress(rowIndex, columnIndex);

  if (!isEditing) {
    return null;
  }

  return (
    <div className={cn("absolute inset-0 z-10 bg-background", className)}>
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-1 p-1 border-b bg-muted/50">
          <Badge variant="outline" className="text-xs font-mono">
            {cellAddress}
          </Badge>
          {isFormula && (
            <Badge variant="secondary" className="text-xs">
              <Calculator className="h-3 w-3 mr-1" />
              Formula
            </Badge>
          )}
          {previewValue && (
            <span className="text-xs text-muted-foreground ml-auto">= {previewValue}</span>
          )}
        </div>
        <div className="flex items-center gap-1 p-1 flex-1">
          <Input
            ref={inputRef}
            value={editValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="h-7 text-sm font-mono flex-1"
            placeholder="Enter value or formula (e.g., A1+B1)"
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-100"
            onClick={handleSave}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-100"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface CellDisplayProps {
  value: string | null;
  formula: string | null;
  color: string | null;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}

export function CellDisplay({
  value,
  formula,
  color,
  isSelected,
  onClick,
  onDoubleClick,
}: CellDisplayProps) {
  return (
    <div
      className={cn(
        "relative h-full w-full min-h-[32px] px-2 py-1 cursor-pointer transition-all",
        "hover:bg-muted/50",
        isSelected && "ring-2 ring-primary ring-inset bg-primary/5"
      )}
      style={{ backgroundColor: color || undefined }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div className="flex items-center justify-between h-full">
        <span className={cn("truncate text-sm", formula && "text-blue-700 dark:text-blue-400")}>
          {value || ""}
        </span>
        {formula && <Calculator className="h-3 w-3 text-muted-foreground shrink-0 ml-1" />}
      </div>
    </div>
  );
}
