"use client";

import { Calculator, ChevronDown, ArrowUp, ArrowLeft, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QUICK_FORMULA_OPTIONS, type QuickFormulaType } from "@/utils/sheet-utils";

interface QuickFormulaMenuProps {
  onSelectFormula: (type: QuickFormulaType) => void;
  disabled?: boolean;
  currentRowIndex?: number;
  currentColumnIndex?: number;
}

export function QuickFormulaMenu({
  onSelectFormula,
  disabled,
  currentRowIndex,
  currentColumnIndex,
}: QuickFormulaMenuProps) {
  const singleCellFormulas = QUICK_FORMULA_OPTIONS.filter((f) => !f.isBulk);
  const bulkFormulas = QUICK_FORMULA_OPTIONS.filter((f) => f.isBulk);

  // Determine which formulas are valid based on current cell position
  const canUseVertical = currentRowIndex !== undefined && currentRowIndex > 0;
  const canUseHorizontal = currentColumnIndex !== undefined && currentColumnIndex >= 2;

  const getFormulaIcon = (type: QuickFormulaType) => {
    if (type.includes("above") || type.includes("all-above")) {
      return <ArrowUp className="h-4 w-4" />;
    }
    if (type.includes("left")) {
      return <ArrowLeft className="h-4 w-4" />;
    }
    if (type.includes("all-rows")) {
      return <Grid3X3 className="h-4 w-4" />;
    }
    return <Calculator className="h-4 w-4" />;
  };

  const isFormulaDisabled = (type: QuickFormulaType): boolean => {
    if (disabled) return true;

    // Vertical formulas need at least one row above
    if (type.includes("above") || type === "subtract-all-above" || type === "sum-all-above") {
      return !canUseVertical;
    }

    // Horizontal formulas need at least 2 columns to the left
    if (type.includes("left")) {
      return !canUseHorizontal;
    }

    // Bulk formulas are always enabled (they'll apply where valid)
    return false;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Calculator className="h-4 w-4 mr-2" />
          Quick Formula
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Single Cell Formulas</DropdownMenuLabel>
        {singleCellFormulas.map((formula) => (
          <DropdownMenuItem
            key={formula.type}
            onClick={() => onSelectFormula(formula.type)}
            disabled={isFormulaDisabled(formula.type)}
            className="flex items-start gap-2"
          >
            {getFormulaIcon(formula.type)}
            <div className="flex flex-col">
              <span>{formula.label}</span>
              <span className="text-xs text-muted-foreground">{formula.description}</span>
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Bulk Formulas (All Rows)</DropdownMenuLabel>
        {bulkFormulas.map((formula) => (
          <DropdownMenuItem
            key={formula.type}
            onClick={() => onSelectFormula(formula.type)}
            disabled={isFormulaDisabled(formula.type)}
            className="flex items-start gap-2"
          >
            {getFormulaIcon(formula.type)}
            <div className="flex flex-col">
              <span>{formula.label}</span>
              <span className="text-xs text-muted-foreground">{formula.description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
