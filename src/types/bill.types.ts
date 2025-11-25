/**
 * Bill type enum (matches backend - Philippine peso denominations)
 */
export enum BillType {
  PESO_1000 = "PESO_1000",
  PESO_500 = "PESO_500",
  PESO_200 = "PESO_200",
  PESO_100 = "PESO_100",
  PESO_50 = "PESO_50",
  PESO_20 = "PESO_20",
  PESO_1 = "PESO_1",
}

/**
 * Bill item in a bill count
 */
export interface Bill {
  id: string;
  type: BillType;
  amount: number;
  value: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cashier info included in bill count response
 */
export interface BillCountCashier {
  id: string;
  username: string;
  branchName: string;
}

/**
 * Bill count response from backend
 */
export interface BillCount {
  id: string;
  date: string;
  updatedAt: string;
  cashier: BillCountCashier;
  beginningBalance: number;
  showBeginningBalance: boolean;
  totalCash: number;
  totalExpenses: number;
  netCash: number;
  bills: Bill[];
  billsByType: Record<BillType, number>;
  billsTotal: number;
  summaryStep1: number;
  summaryFinal: number;
}

/**
 * Bill item input for creating/updating
 */
export interface BillItemInput {
  type: BillType;
  amount: number;
}

/**
 * Create/update bill count input
 */
export interface CreateBillCountInput {
  beginningBalance?: number;
  showBeginningBalance?: boolean;
  bills?: BillItemInput[];
}

/**
 * Helper to get bill monetary value
 */
export function getBillValue(billType: BillType): number {
  const values: Record<BillType, number> = {
    [BillType.PESO_1000]: 1000,
    [BillType.PESO_500]: 500,
    [BillType.PESO_200]: 200,
    [BillType.PESO_100]: 100,
    [BillType.PESO_50]: 50,
    [BillType.PESO_20]: 20,
    [BillType.PESO_1]: 1,
  };
  return values[billType];
}

/**
 * Helper to format bill type display name
 */
export function getBillDisplayName(billType: BillType): string {
  const names: Record<BillType, string> = {
    [BillType.PESO_1000]: "₱1,000",
    [BillType.PESO_500]: "₱500",
    [BillType.PESO_200]: "₱200",
    [BillType.PESO_100]: "₱100",
    [BillType.PESO_50]: "₱50",
    [BillType.PESO_20]: "₱20",
    [BillType.PESO_1]: "₱1",
  };
  return names[billType];
}

/**
 * All bill types in order (highest to lowest denomination)
 */
export const BILL_TYPES_ORDERED: BillType[] = [
  BillType.PESO_1000,
  BillType.PESO_500,
  BillType.PESO_200,
  BillType.PESO_100,
  BillType.PESO_50,
  BillType.PESO_20,
  BillType.PESO_1,
];
