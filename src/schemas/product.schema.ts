import { z } from "zod";
import { ProductCategory, SackType } from "@/types/product.types";

/**
 * Helper to validate max 2 decimal places
 */
const twoDecimalPlaces = (val: number) => {
  const decimalPart = val.toString().split(".")[1];
  return !decimalPart || decimalPart.length <= 2;
};

/**
 * Special price schema for form
 */
export const specialPriceFormSchema = z.object({
  id: z.string().optional(),
  price: z
    .number()
    .positive("Price must be positive")
    .refine(twoDecimalPlaces, "Price can have at most 2 decimal places"),
  minimumQty: z
    .number()
    .int("Minimum quantity must be a whole number")
    .positive("Minimum quantity must be positive"),
  profit: z
    .number()
    .refine(twoDecimalPlaces, "Profit can have at most 2 decimal places")
    .nullable()
    .optional(),
});

export type SpecialPriceFormInput = z.infer<typeof specialPriceFormSchema>;

/**
 * Sack price schema for form
 */
export const sackPriceFormSchema = z.object({
  id: z.string().optional(),
  price: z
    .number()
    .positive("Price must be positive")
    .refine(twoDecimalPlaces, "Price can have at most 2 decimal places"),
  type: z.nativeEnum(SackType),
  stock: z.number().int("Stock must be a whole number").min(0, "Stock cannot be negative"),
  profit: z
    .number()
    .refine(twoDecimalPlaces, "Profit can have at most 2 decimal places")
    .nullable()
    .optional(),
  specialPrice: specialPriceFormSchema.nullable().optional(),
});

export type SackPriceFormInput = z.infer<typeof sackPriceFormSchema>;

/**
 * Per kilo price schema for form
 */
export const perKiloPriceFormSchema = z.object({
  price: z
    .number()
    .positive("Price must be positive")
    .refine(twoDecimalPlaces, "Price can have at most 2 decimal places"),
  stock: z
    .number()
    .min(0, "Stock cannot be negative")
    .refine(twoDecimalPlaces, "Stock can have at most 2 decimal places"),
  profit: z
    .number()
    .refine(twoDecimalPlaces, "Profit can have at most 2 decimal places")
    .nullable()
    .optional(),
});

export type PerKiloPriceFormInput = z.infer<typeof perKiloPriceFormSchema>;

/**
 * Base create product schema (without refinements for form use)
 */
const createProductBaseSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  picture: z.string().url("Picture must be a valid URL"),
  category: z.nativeEnum(ProductCategory),
  cashierId: z.string().min(1, "Cashier is required"),
  sackPrices: z.array(sackPriceFormSchema),
  perKiloPrice: perKiloPriceFormSchema.nullable().optional(),
});

/**
 * Create product input type (used in forms)
 */
export type CreateProductInput = z.infer<typeof createProductBaseSchema>;

/**
 * Create product schema with validation refinements
 */
export const createProductSchema = createProductBaseSchema
  .refine(
    (data) => {
      // Ensure unique sack types
      const types = data.sackPrices.map((sp) => sp.type);
      return new Set(types).size === types.length;
    },
    {
      message: "Each sack type can only be added once",
      path: ["sackPrices"],
    }
  )
  .refine(
    (data) => {
      // Ensure max 3 sack prices
      return data.sackPrices.length <= 3;
    },
    {
      message: "Maximum of 3 sack prices allowed",
      path: ["sackPrices"],
    }
  );

/**
 * Base update product schema (without refinements for form use)
 */
const updateProductBaseSchema = z.object({
  name: z.string().min(1, "Product name cannot be empty").optional(),
  picture: z.string().url("Picture must be a valid URL").optional(),
  category: z.nativeEnum(ProductCategory).optional(),
  sackPrices: z.array(sackPriceFormSchema).optional(),
  perKiloPrice: perKiloPriceFormSchema.nullable().optional(),
});

/**
 * Update product input type (used in forms)
 */
export type UpdateProductInput = z.infer<typeof updateProductBaseSchema>;

/**
 * Update product schema with validation refinements
 */
export const updateProductSchema = updateProductBaseSchema
  .refine(
    (data) => {
      if (!data.sackPrices) return true;
      const types = data.sackPrices.map((sp) => sp.type);
      return new Set(types).size === types.length;
    },
    {
      message: "Each sack type can only be added once",
      path: ["sackPrices"],
    }
  )
  .refine(
    (data) => {
      if (!data.sackPrices) return true;
      return data.sackPrices.length <= 3;
    },
    {
      message: "Maximum of 3 sack prices allowed",
      path: ["sackPrices"],
    }
  );

/**
 * Product filter schema
 */
export const productFilterSchema = z.object({
  category: z.nativeEnum(ProductCategory).optional(),
  productSearch: z.string().optional(),
});

export type ProductFilterInput = z.infer<typeof productFilterSchema>;

/**
 * Transfer product schema
 */
export const transferProductSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  targetCashierId: z.string().min(1, "Target cashier is required"),
});

export type TransferProductInput = z.infer<typeof transferProductSchema>;
