/**
 * Payment method enum (matches backend)
 */
export enum PaymentMethod {
  CASH = "CASH",
  CHECK = "CHECK",
  BANK_TRANSFER = "BANK_TRANSFER",
}

/**
 * Sale item detail from backend
 */
export interface SaleItemDetail {
  id: string;
  quantity: string;
  product: {
    id: string;
    name: string;
  };
  priceType: string;
  unitPrice: string;
  totalAmount: string;
  paymentMethod: PaymentMethod;
  isSpecialPrice: boolean;
  isDiscounted: boolean;
  discountedPrice: string | null;
  saleDate: string;
}

/**
 * Payment totals by method
 */
export interface PaymentTotals {
  CASH: string;
  CHECK: string;
  BANK_TRANSFER: string;
}

/**
 * Grouped sale data from backend
 */
export interface GroupedSale {
  productName: string;
  priceType: string;
  items: SaleItemDetail[];
  totalQuantity: string;
  totalAmount: string;
  paymentTotals: PaymentTotals;
}

/**
 * Total sales summary item
 */
export interface TotalSalesItem {
  productName: string;
  totalQuantity: string;
  totalAmount: string;
  paymentTotals: PaymentTotals;
  formattedSummary: string;
}

/**
 * Total sales summary response
 */
export interface TotalSalesSummary {
  totalQuantity: string;
  totalAmount: string;
  paymentTotals: PaymentTotals;
}

/**
 * Total sales response from /sales-check/total
 */
export interface TotalSalesResponse {
  items: TotalSalesItem[];
  summary: TotalSalesSummary;
}

/**
 * Cashier sales data from /sales-check/cashiers/all
 */
export interface CashierSalesData {
  cashier: {
    id: string;
    branchName: string;
  };
  sales: GroupedSale[];
  totalSales: TotalSalesResponse;
}

/**
 * Sales filter options for API queries
 */
export interface SalesFilters {
  startDate?: string;
  endDate?: string;
  productId?: string;
  productSearch?: string;
  category?: "NORMAL" | "ASIN" | "PLASTIC";
  priceType?: "SACK" | "KILO";
  sackType?: "FIFTY_KG" | "TWENTY_FIVE_KG" | "FIVE_KG";
  isDiscounted?: boolean;
  isVoid?: boolean;
}

/**
 * Helper to format payment method display name
 */
export function getPaymentMethodDisplayName(method: PaymentMethod): string {
  const names: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: "Cash",
    [PaymentMethod.CHECK]: "Check",
    [PaymentMethod.BANK_TRANSFER]: "Bank Transfer",
  };
  return names[method];
}

/**
 * Helper to get payment method color
 */
export function getPaymentMethodColor(method: PaymentMethod): string {
  const colors: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: "text-green-600",
    [PaymentMethod.CHECK]: "text-blue-600",
    [PaymentMethod.BANK_TRANSFER]: "text-purple-600",
  };
  return colors[method];
}

/**
 * All payment methods
 */
export const PAYMENT_METHODS: PaymentMethod[] = [
  PaymentMethod.CASH,
  PaymentMethod.CHECK,
  PaymentMethod.BANK_TRANSFER,
];
