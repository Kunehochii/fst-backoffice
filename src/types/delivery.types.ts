/**
 * Sack type enum (matches backend)
 */
export enum SackType {
  FIFTY_KG = "FIFTY_KG",
  TWENTY_FIVE_KG = "TWENTY_FIVE_KG",
  FIVE_KG = "FIVE_KG",
}

/**
 * Per kilo price in delivery item
 */
export interface DeliveryPerKiloPrice {
  id: string;
  price: string;
  stock: string;
  profit: string | null;
  productId: string;
}

/**
 * Special price for bulk orders
 */
export interface DeliverySpecialPrice {
  id: string;
  price: string;
  minimumQty: string;
  profit: string | null;
  sackPriceId: string;
}

/**
 * Sack price in delivery item
 */
export interface DeliverySackPrice {
  id: string;
  price: string;
  type: SackType;
  stock: string;
  profit: string | null;
  productId: string;
  specialPrice: DeliverySpecialPrice | null;
}

/**
 * Product info in delivery item
 */
export interface DeliveryProduct {
  id: string;
  name: string;
  picture: string;
  category: string;
  perKiloPrice: DeliveryPerKiloPrice | null;
  sackPrices: DeliverySackPrice[];
}

/**
 * Delivery item type
 */
export interface DeliveryItem {
  id: string;
  quantity: string;
  productId: string;
  deliveryId: string;
  sackPriceId: string | null;
  perKiloPriceId: string | null;
  sackType: SackType | null;
  product: DeliveryProduct;
  perKiloPrice: DeliveryPerKiloPrice | null;
  sackPrice: DeliverySackPrice | null;
}

/**
 * Cashier info in delivery
 */
export interface DeliveryCashier {
  id: string;
  username: string;
  branchName: string;
}

/**
 * Full delivery type from backend
 */
export interface Delivery {
  id: string;
  driverName: string;
  deliveryTimeStart: string;
  createdAt: string;
  updatedAt: string;
  cashierId: string;
  cashier: DeliveryCashier;
  deliveryItems: DeliveryItem[];
}

/**
 * Delivery filter options for API queries
 */
export interface DeliveryFilters {
  startDate?: string;
  endDate?: string;
  productId?: string;
  productSearch?: string;
}

/**
 * Helper to format sack type display name
 */
export function getSackTypeDisplayName(type: SackType): string {
  const names: Record<SackType, string> = {
    [SackType.FIFTY_KG]: "50 KG",
    [SackType.TWENTY_FIVE_KG]: "25 KG",
    [SackType.FIVE_KG]: "5 KG",
  };
  return names[type];
}

/**
 * Helper to get the price type label for a delivery item
 */
export function getDeliveryItemPriceType(item: DeliveryItem): string {
  if (item.sackType) {
    return `Sack (${getSackTypeDisplayName(item.sackType)})`;
  }
  if (item.perKiloPriceId) {
    return "Per Kilo";
  }
  return "Unknown";
}

/**
 * Calculate total items count from a delivery
 */
export function calculateTotalItems(delivery: Delivery): number {
  return delivery.deliveryItems.reduce((total, item) => {
    return total + parseFloat(item.quantity);
  }, 0);
}
