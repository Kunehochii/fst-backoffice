/**
 * Product category enum (matches backend)
 */
export enum ProductCategory {
  NORMAL = "NORMAL",
  ASIN = "ASIN",
  PLASTIC = "PLASTIC",
}

/**
 * Sack type enum (matches backend)
 */
export enum SackType {
  FIFTY_KG = "FIFTY_KG",
  TWENTY_FIVE_KG = "TWENTY_FIVE_KG",
  FIVE_KG = "FIVE_KG",
}

/**
 * Special price for bulk orders
 */
export interface SpecialPrice {
  id: string;
  price: string;
  minimumQty: string;
  profit: string | null;
  sackPriceId: string;
}

/**
 * Sack price with optional special price
 */
export interface SackPrice {
  id: string;
  price: string;
  type: SackType;
  stock: string;
  profit: string | null;
  productId: string;
  specialPrice: SpecialPrice | null;
}

/**
 * Per kilo price
 */
export interface PerKiloPrice {
  id: string;
  price: string;
  stock: string;
  profit: string | null;
  productId: string;
}

/**
 * Cashier info included in product response
 */
export interface ProductCashier {
  id: string;
  username: string;
  branchName: string;
  businessId: string;
}

/**
 * Full product type from backend
 */
export interface Product {
  id: string;
  name: string;
  picture: string;
  category: ProductCategory;
  createdAt: string;
  updatedAt: string;
  cashierId: string;
  cashier: ProductCashier;
  sackPrices: SackPrice[];
  perKiloPrice: PerKiloPrice | null;
}

/**
 * Product filter options
 */
export interface ProductFilters {
  category?: ProductCategory;
  productSearch?: string;
}
