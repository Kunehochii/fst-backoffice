/**
 * Payment totals by method (shared with sales)
 */
export interface PaymentTotals {
  CASH: string;
  CHECK: string;
  BANK_TRANSFER: string;
}

/**
 * Grouped profit item from backend
 */
export interface GroupedProfit {
  productName: string;
  priceType: string;
  profitPerUnit: string;
  totalQuantity: string;
  totalProfit: string;
  orderCount: number;
}

/**
 * Raw profit item detail (individual sale profit breakdown)
 */
export interface ProfitItemDetail {
  productName: string;
  priceType: string;
  profitPerUnit: string;
  quantity: string;
  totalProfit: string;
  paymentMethod: string;
  isSpecialPrice: boolean;
  saleDate: string;
}

/**
 * Profit response from backend /profit endpoint
 */
export interface ProfitResponse {
  items: GroupedProfit[];
  totalProfit: string;
  rawItems: ProfitItemDetail[];
}

/**
 * Cashier profit data from /profit/cashiers/all
 */
export interface CashierProfitData {
  cashier: {
    id: string;
    branchName: string;
  };
  profits: ProfitResponse;
}

/**
 * Profit filter options for API queries
 */
export interface ProfitFilters {
  startDate?: string;
  endDate?: string;
  productId?: string;
  productSearch?: string;
  category?: "NORMAL" | "ASIN" | "PLASTIC";
  priceType?: "SACK" | "KILO";
  sackType?: "FIFTY_KG" | "TWENTY_FIVE_KG" | "FIVE_KG";
}

/**
 * Sack type display names
 */
export const SACK_TYPE_DISPLAY: Record<string, string> = {
  FIFTY_KG: "50 KG",
  TWENTY_FIVE_KG: "25 KG",
  FIVE_KG: "5 KG",
};

/**
 * Helper to format sack type display name
 */
export function getSackTypeDisplayName(sackType: string): string {
  return SACK_TYPE_DISPLAY[sackType] || sackType;
}

/**
 * Price type display names
 */
export const PRICE_TYPE_DISPLAY: Record<string, string> = {
  SACK: "Sack",
  KILO: "Per Kilo",
  "SACK (50 KG)": "Sack (50 KG)",
  "SACK (25 KG)": "Sack (25 KG)",
  "SACK (5 KG)": "Sack (5 KG)",
};

/**
 * Helper to format price type display name
 */
export function getPriceTypeDisplayName(priceType: string): string {
  return PRICE_TYPE_DISPLAY[priceType] || priceType;
}
