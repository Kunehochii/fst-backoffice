import { z } from "zod";
import { CashierPermissions } from "@/types/auth.types";

/**
 * Create cashier schema
 */
export const createCashierSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .regex(/^\S+$/, "Username must be a single word with no spaces"),
  branchName: z.string().min(1, "Branch name is required"),
  accessKey: z.string().min(4, "Password must be at least 4 characters"),
  secureCode: z.string().length(6, "Secure code must be exactly 6 digits"),
  permissions: z.array(z.nativeEnum(CashierPermissions)),
});

export type CreateCashierInput = z.infer<typeof createCashierSchema>;

/**
 * Edit cashier schema
 */
export const editCashierSchema = z.object({
  branchName: z.string().min(1, "Branch name is required").optional(),
  permissions: z.array(z.nativeEnum(CashierPermissions)).optional(),
});

export type EditCashierInput = z.infer<typeof editCashierSchema>;

/**
 * Edit cashier password schema
 */
export const editCashierPasswordSchema = z.object({
  accessKey: z.string().min(4, "Password must be at least 4 characters"),
});

export type EditCashierPasswordInput = z.infer<typeof editCashierPasswordSchema>;

/**
 * Filter cashiers schema
 */
export const filterCashiersSchema = z.object({
  branchName: z.string().optional(),
});

export type FilterCashiersInput = z.infer<typeof filterCashiersSchema>;
