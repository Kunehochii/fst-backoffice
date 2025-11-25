/**
 * Sheet Cell Utilities
 *
 * Universal cell designation and formula system for Excel-style spreadsheets.
 * This module is designed to be portable across different frontends (business, POS).
 */

// ============================================================================
// CELL DESIGNATION (A1, B2, etc.)
// ============================================================================

/**
 * Convert column index (0-based) to column letter (A, B, C, ..., Z, AA, AB, ...)
 */
export function columnIndexToLetter(index: number): string {
  let result = "";
  let temp = index;

  while (temp >= 0) {
    result = String.fromCharCode((temp % 26) + 65) + result;
    temp = Math.floor(temp / 26) - 1;
  }

  return result;
}

/**
 * Convert column letter to column index (0-based)
 */
export function columnLetterToIndex(letter: string): number {
  let result = 0;
  const upper = letter.toUpperCase();

  for (let i = 0; i < upper.length; i++) {
    result = result * 26 + (upper.charCodeAt(i) - 64);
  }

  return result - 1;
}

/**
 * Get cell address from row and column indices (both 0-based)
 * Row becomes 1-based in the address (like Excel)
 */
export function getCellAddress(rowIndex: number, columnIndex: number): string {
  return `${columnIndexToLetter(columnIndex)}${rowIndex + 1}`;
}

/**
 * Parse cell address to get row and column indices (both 0-based)
 */
export function parseCellAddress(address: string): {
  rowIndex: number;
  columnIndex: number;
} | null {
  const match = address.toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;

  const columnLetter = match[1];
  const rowNumber = parseInt(match[2], 10);

  return {
    columnIndex: columnLetterToIndex(columnLetter),
    rowIndex: rowNumber - 1, // Convert to 0-based
  };
}

/**
 * Validate if a string is a valid cell address
 */
export function isValidCellAddress(address: string): boolean {
  return parseCellAddress(address) !== null;
}

// ============================================================================
// FORMULA PARSING AND EVALUATION
// ============================================================================

/**
 * Supported operators in formulas
 */
export type FormulaOperator = "+" | "-" | "*" | "/";

/**
 * Token types in a formula
 */
export type FormulaToken =
  | { type: "cell"; address: string; rowIndex: number; columnIndex: number }
  | { type: "number"; value: number }
  | { type: "operator"; operator: FormulaOperator }
  | { type: "lparen" }
  | { type: "rparen" };

/**
 * Tokenize a formula string
 */
export function tokenizeFormula(formula: string): FormulaToken[] {
  const tokens: FormulaToken[] = [];
  let i = 0;
  const cleanFormula = formula.trim();

  while (i < cleanFormula.length) {
    const char = cleanFormula[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Operators
    if (["+", "-", "*", "/"].includes(char)) {
      tokens.push({ type: "operator", operator: char as FormulaOperator });
      i++;
      continue;
    }

    // Parentheses
    if (char === "(") {
      tokens.push({ type: "lparen" });
      i++;
      continue;
    }
    if (char === ")") {
      tokens.push({ type: "rparen" });
      i++;
      continue;
    }

    // Cell reference (starts with letter) or Number
    if (/[A-Za-z]/.test(char)) {
      let cellRef = "";
      while (i < cleanFormula.length && /[A-Za-z0-9]/.test(cleanFormula[i])) {
        cellRef += cleanFormula[i];
        i++;
      }
      const parsed = parseCellAddress(cellRef);
      if (parsed) {
        tokens.push({
          type: "cell",
          address: cellRef.toUpperCase(),
          rowIndex: parsed.rowIndex,
          columnIndex: parsed.columnIndex,
        });
      }
      continue;
    }

    // Number
    if (/[0-9.]/.test(char)) {
      let numStr = "";
      while (i < cleanFormula.length && /[0-9.]/.test(cleanFormula[i])) {
        numStr += cleanFormula[i];
        i++;
      }
      const num = parseFloat(numStr);
      if (!isNaN(num)) {
        tokens.push({ type: "number", value: num });
      }
      continue;
    }

    // Unknown character, skip
    i++;
  }

  return tokens;
}

/**
 * Get all cell references from a formula
 */
export function getCellReferencesFromFormula(
  formula: string
): Array<{ address: string; rowIndex: number; columnIndex: number }> {
  const tokens = tokenizeFormula(formula);
  return tokens
    .filter((t): t is FormulaToken & { type: "cell" } => t.type === "cell")
    .map((t) => ({
      address: t.address,
      rowIndex: t.rowIndex,
      columnIndex: t.columnIndex,
    }));
}

/**
 * Cell value lookup function type
 */
export type CellValueLookup = (rowIndex: number, columnIndex: number) => number;

/**
 * Evaluate a formula with a cell value lookup function
 * Uses a simple recursive descent parser for expressions
 */
export function evaluateFormula(formula: string, getCellValue: CellValueLookup): number {
  const tokens = tokenizeFormula(formula);
  let pos = 0;

  function peek(): FormulaToken | undefined {
    return tokens[pos];
  }

  function consume(): FormulaToken | undefined {
    return tokens[pos++];
  }

  function parsePrimary(): number {
    const token = peek();

    if (!token) return 0;

    if (token.type === "number") {
      consume();
      return token.value;
    }

    if (token.type === "cell") {
      consume();
      return getCellValue(token.rowIndex, token.columnIndex);
    }

    if (token.type === "lparen") {
      consume(); // consume '('
      const result = parseExpression();
      if (peek()?.type === "rparen") {
        consume(); // consume ')'
      }
      return result;
    }

    // Handle unary minus
    if (token.type === "operator" && token.operator === "-") {
      consume();
      return -parsePrimary();
    }

    return 0;
  }

  function parseTerm(): number {
    let left = parsePrimary();

    while (true) {
      const token = peek();
      if (token?.type === "operator" && (token.operator === "*" || token.operator === "/")) {
        consume();
        const right = parsePrimary();
        if (token.operator === "*") {
          left = left * right;
        } else {
          left = right !== 0 ? left / right : 0;
        }
      } else {
        break;
      }
    }

    return left;
  }

  function parseExpression(): number {
    let left = parseTerm();

    while (true) {
      const token = peek();
      if (token?.type === "operator" && (token.operator === "+" || token.operator === "-")) {
        consume();
        const right = parseTerm();
        if (token.operator === "+") {
          left = left + right;
        } else {
          left = left - right;
        }
      } else {
        break;
      }
    }

    return left;
  }

  return parseExpression();
}

// ============================================================================
// QUICK FORMULA GENERATORS
// ============================================================================

/**
 * Generate formula to sum all cells above (in same column, from row 0 to currentRow - 1)
 */
export function generateSumAllAboveFormula(currentRowIndex: number, columnIndex: number): string {
  if (currentRowIndex <= 0) return "";

  const parts: string[] = [];
  for (let row = 0; row < currentRowIndex; row++) {
    parts.push(getCellAddress(row, columnIndex));
  }
  return parts.join("+");
}

/**
 * Generate formula to sum the next N cells above
 */
export function generateSumAboveFormula(
  currentRowIndex: number,
  columnIndex: number,
  count: number = 2
): string {
  const parts: string[] = [];
  for (let i = 1; i <= count && currentRowIndex - i >= 0; i++) {
    parts.push(getCellAddress(currentRowIndex - i, columnIndex));
  }
  return parts.reverse().join("+");
}

/**
 * Generate formula to subtract the next N cells above (sequential subtraction)
 */
export function generateSubtractAboveFormula(
  currentRowIndex: number,
  columnIndex: number,
  count: number = 2
): string {
  const parts: string[] = [];
  for (let i = 1; i <= count && currentRowIndex - i >= 0; i++) {
    parts.push(getCellAddress(currentRowIndex - i, columnIndex));
  }
  parts.reverse();
  return parts.join("-");
}

/**
 * Generate formula to subtract all cells above sequentially
 */
export function generateSubtractAllAboveFormula(
  currentRowIndex: number,
  columnIndex: number
): string {
  if (currentRowIndex <= 0) return "";

  const parts: string[] = [];
  for (let row = 0; row < currentRowIndex; row++) {
    parts.push(getCellAddress(row, columnIndex));
  }
  return parts.join("-");
}

/**
 * Generate formula to multiply the next N cells to the left
 */
export function generateMultiplyLeftFormula(
  rowIndex: number,
  currentColumnIndex: number,
  count: number = 2
): string {
  const parts: string[] = [];
  for (let i = 1; i <= count && currentColumnIndex - i >= 0; i++) {
    parts.push(getCellAddress(rowIndex, currentColumnIndex - i));
  }
  parts.reverse();
  return parts.join("*");
}

/**
 * Generate formula to add the next N cells to the left
 */
export function generateAddLeftFormula(
  rowIndex: number,
  currentColumnIndex: number,
  count: number = 2
): string {
  const parts: string[] = [];
  for (let i = 1; i <= count && currentColumnIndex - i >= 0; i++) {
    parts.push(getCellAddress(rowIndex, currentColumnIndex - i));
  }
  parts.reverse();
  return parts.join("+");
}

// ============================================================================
// BULK FORMULA GENERATORS (Apply to all rows)
// ============================================================================

export interface BulkFormulaResult {
  rowIndex: number;
  columnIndex: number;
  formula: string;
}

/**
 * Generate multiply formula for all rows with valid numeric data in the source columns
 * Used for "Apply multiply to all rows"
 */
export function generateMultiplyForAllRows(
  rows: Array<{ rowIndex: number; cells: Array<{ columnIndex: number; value: string | null }> }>,
  targetColumnIndex: number,
  sourceColumnOffset: number = 2 // Number of columns to the left to use
): BulkFormulaResult[] {
  const results: BulkFormulaResult[] = [];

  for (const row of rows) {
    // Check if source columns have valid numeric data
    const sourceCols: number[] = [];
    let valid = true;

    for (let i = 1; i <= sourceColumnOffset; i++) {
      const colIndex = targetColumnIndex - i;
      if (colIndex < 0) {
        valid = false;
        break;
      }
      const cell = row.cells.find((c) => c.columnIndex === colIndex);
      const value = parseFloat(cell?.value || "");
      if (isNaN(value)) {
        valid = false;
        break;
      }
      sourceCols.push(colIndex);
    }

    if (valid && sourceCols.length === sourceColumnOffset) {
      const formula = generateMultiplyLeftFormula(
        row.rowIndex,
        targetColumnIndex,
        sourceColumnOffset
      );
      results.push({
        rowIndex: row.rowIndex,
        columnIndex: targetColumnIndex,
        formula,
      });
    }
  }

  return results;
}

/**
 * Generate addition formula for all rows
 * Used for "Apply addition to all rows"
 */
export function generateAddForAllRows(
  rows: Array<{ rowIndex: number; cells: Array<{ columnIndex: number; value: string | null }> }>,
  targetColumnIndex: number,
  sourceColumnOffset: number = 2
): BulkFormulaResult[] {
  const results: BulkFormulaResult[] = [];

  for (const row of rows) {
    // Check if source columns have valid numeric data
    const sourceCols: number[] = [];
    let valid = true;

    for (let i = 1; i <= sourceColumnOffset; i++) {
      const colIndex = targetColumnIndex - i;
      if (colIndex < 0) {
        valid = false;
        break;
      }
      const cell = row.cells.find((c) => c.columnIndex === colIndex);
      const value = parseFloat(cell?.value || "");
      if (isNaN(value)) {
        valid = false;
        break;
      }
      sourceCols.push(colIndex);
    }

    if (valid && sourceCols.length === sourceColumnOffset) {
      const formula = generateAddLeftFormula(row.rowIndex, targetColumnIndex, sourceColumnOffset);
      results.push({
        rowIndex: row.rowIndex,
        columnIndex: targetColumnIndex,
        formula,
      });
    }
  }

  return results;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a value is numeric
 */
export function isNumericValue(value: string | null | undefined): boolean {
  if (value === null || value === undefined || value.trim() === "") return false;
  return !isNaN(parseFloat(value));
}

/**
 * Parse numeric value with fallback
 */
export function parseNumericValue(value: string | null | undefined): number {
  if (!isNumericValue(value)) return 0;
  return parseFloat(value!);
}

/**
 * Format mode for cell numbers
 * - 'default': removes trailing zeros, up to 4 decimal places
 * - 'ceil': ceiling (round up to integer) - used for Kahon
 * - 'decimal': keeps 2 decimal places - used for Inventory
 */
export type FormatMode = "default" | "ceil" | "decimal";

/**
 * Format number for display
 * @param value - The numeric value to format
 * @param mode - The formatting mode (default, ceil, decimal)
 */
export function formatCellNumber(value: number, mode: FormatMode = "default"): string {
  switch (mode) {
    case "ceil":
      return Math.ceil(value).toString();
    case "decimal":
      return value.toFixed(2);
    case "default":
    default:
      if (Number.isInteger(value)) return value.toString();
      // Format with up to 4 decimal places, removing trailing zeros
      return parseFloat(value.toFixed(4)).toString();
  }
}

/**
 * Get default column headers (A, B, C, ...)
 */
export function getDefaultColumnHeaders(count: number): string[] {
  return Array.from({ length: count }, (_, i) => columnIndexToLetter(i));
}

/**
 * Validate hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Default cell colors palette
 */
export const CELL_COLOR_PALETTE = [
  "#FFFFFF", // White (default)
  "#FFE4E1", // Misty Rose
  "#FFE4B5", // Moccasin
  "#FFFACD", // Lemon Chiffon
  "#E0FFE0", // Light Green
  "#E0FFFF", // Light Cyan
  "#E6E6FA", // Lavender
  "#FFE4E1", // Light Pink
  "#D3D3D3", // Light Gray
  "#FFDAB9", // Peach Puff
] as const;

export type QuickFormulaType =
  | "sum-all-above"
  | "sum-above-2"
  | "subtract-above-2"
  | "subtract-all-above"
  | "multiply-left-2"
  | "add-left-2"
  | "multiply-all-rows"
  | "add-all-rows";

export interface QuickFormulaOption {
  type: QuickFormulaType;
  label: string;
  description: string;
  isBulk: boolean; // Whether this applies to all rows
}

export const QUICK_FORMULA_OPTIONS: QuickFormulaOption[] = [
  {
    type: "sum-all-above",
    label: "Sum All Above",
    description: "Add all cells above in this column",
    isBulk: false,
  },
  {
    type: "sum-above-2",
    label: "Sum 2 Above",
    description: "Add the 2 cells above",
    isBulk: false,
  },
  {
    type: "subtract-above-2",
    label: "Subtract 2 Above",
    description: "Subtract the 2 cells above",
    isBulk: false,
  },
  {
    type: "subtract-all-above",
    label: "Subtract All Above",
    description: "Subtract all cells above sequentially",
    isBulk: false,
  },
  {
    type: "multiply-left-2",
    label: "Multiply 2 Left",
    description: "Multiply the 2 cells to the left",
    isBulk: false,
  },
  {
    type: "add-left-2",
    label: "Add 2 Left",
    description: "Add the 2 cells to the left",
    isBulk: false,
  },
  {
    type: "multiply-all-rows",
    label: "Multiply All Rows",
    description: "Apply multiply formula to all rows in this column",
    isBulk: true,
  },
  {
    type: "add-all-rows",
    label: "Add All Rows",
    description: "Apply addition formula to all rows in this column",
    isBulk: true,
  },
];
