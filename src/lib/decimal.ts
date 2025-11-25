/**
 * Decimal/String Conversion Utilities
 *
 * The backend expects decimal values as strings in request bodies.
 * These utilities help convert between number (form) and string (API) formats.
 *
 * Usage:
 * - Use numbers in forms for better UX (number inputs, validation)
 * - Convert to strings before sending to API
 * - Convert from strings when receiving from API (if needed)
 */

/**
 * Convert a number to a string for API requests
 * Handles null/undefined values
 *
 * @example
 * toDecimalString(123.45) // "123.45"
 * toDecimalString(null) // null
 */
export function toDecimalString(value: number | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return value.toString();
}

/**
 * Convert a string decimal to a number
 * Handles null/undefined values
 *
 * @example
 * fromDecimalString("123.45") // 123.45
 * fromDecimalString(null) // null
 */
export function fromDecimalString(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

/**
 * Convert a string decimal to a number, with a default value
 *
 * @example
 * fromDecimalStringOrDefault("123.45", 0) // 123.45
 * fromDecimalStringOrDefault(null, 0) // 0
 */
export function fromDecimalStringOrDefault(
  value: string | null | undefined,
  defaultValue: number
): number {
  const result = fromDecimalString(value);
  return result ?? defaultValue;
}

/**
 * Interface for sack price form data (numbers)
 */
interface SackPriceFormData {
  id?: string;
  price: number;
  type: string;
  stock: number;
  profit?: number | null;
  specialPrice?: {
    id?: string;
    price: number;
    minimumQty: number;
    profit?: number | null;
  } | null;
}

/**
 * Interface for sack price API data (strings)
 */
interface SackPriceApiData {
  id?: string;
  price: string;
  type: string;
  stock: string;
  profit?: string | null;
  specialPrice?: {
    id?: string;
    price: string;
    minimumQty: string;
    profit?: string | null;
  } | null;
}

/**
 * Convert sack price form data to API format
 */
export function sackPriceToApi(formData: SackPriceFormData): SackPriceApiData {
  return {
    id: formData.id,
    price: formData.price.toString(),
    type: formData.type,
    stock: formData.stock.toString(),
    profit: toDecimalString(formData.profit),
    specialPrice: formData.specialPrice
      ? {
          id: formData.specialPrice.id,
          price: formData.specialPrice.price.toString(),
          minimumQty: formData.specialPrice.minimumQty.toString(),
          profit: toDecimalString(formData.specialPrice.profit),
        }
      : null,
  };
}

/**
 * Interface for per kilo price form data (numbers)
 */
interface PerKiloPriceFormData {
  price: number;
  stock: number;
  profit?: number | null;
}

/**
 * Interface for per kilo price API data (strings)
 */
interface PerKiloPriceApiData {
  price: string;
  stock: string;
  profit?: string | null;
}

/**
 * Convert per kilo price form data to API format
 */
export function perKiloPriceToApi(
  formData: PerKiloPriceFormData | null | undefined
): PerKiloPriceApiData | null {
  if (!formData) return null;

  return {
    price: formData.price.toString(),
    stock: formData.stock.toString(),
    profit: toDecimalString(formData.profit),
  };
}

/**
 * Interface for create product form data
 */
interface CreateProductFormData {
  name: string;
  picture: string;
  category: string;
  cashierId: string;
  sackPrices: SackPriceFormData[];
  perKiloPrice?: PerKiloPriceFormData | null;
}

/**
 * Interface for create product API data
 */
interface CreateProductApiData {
  name: string;
  picture: string;
  category: string;
  cashierId: string;
  sackPrices: SackPriceApiData[];
  perKiloPrice?: PerKiloPriceApiData | null;
}

/**
 * Convert create product form data to API format
 */
export function createProductToApi(formData: CreateProductFormData): CreateProductApiData {
  return {
    name: formData.name,
    picture: formData.picture,
    category: formData.category,
    cashierId: formData.cashierId,
    sackPrices: formData.sackPrices.map(sackPriceToApi),
    perKiloPrice: perKiloPriceToApi(formData.perKiloPrice),
  };
}

/**
 * Interface for update product form data
 */
interface UpdateProductFormData {
  name?: string;
  picture?: string;
  category?: string;
  sackPrices?: SackPriceFormData[];
  perKiloPrice?: PerKiloPriceFormData | null;
}

/**
 * Interface for update product API data
 */
interface UpdateProductApiData {
  name?: string;
  picture?: string;
  category?: string;
  sackPrices?: SackPriceApiData[];
  perKiloPrice?: PerKiloPriceApiData | null;
}

/**
 * Convert update product form data to API format
 */
export function updateProductToApi(formData: UpdateProductFormData): UpdateProductApiData {
  const result: UpdateProductApiData = {};

  if (formData.name !== undefined) {
    result.name = formData.name;
  }

  if (formData.picture !== undefined) {
    result.picture = formData.picture;
  }

  if (formData.category !== undefined) {
    result.category = formData.category;
  }

  if (formData.sackPrices !== undefined) {
    result.sackPrices = formData.sackPrices.map(sackPriceToApi);
  }

  if (formData.perKiloPrice !== undefined) {
    result.perKiloPrice = perKiloPriceToApi(formData.perKiloPrice);
  }

  return result;
}
