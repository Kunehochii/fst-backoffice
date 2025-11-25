import { z } from "zod";
import { BillType } from "@/types/bill.types";

/**
 * Bill item schema
 */
export const billItemSchema = z.object({
  type: z.nativeEnum(BillType),
  amount: z.number().int().min(0, "Amount cannot be negative"),
});

export type BillItemInput = z.infer<typeof billItemSchema>;

/**
 * Create/update bill count schema
 */
export const createBillCountSchema = z.object({
  beginningBalance: z.number().min(0, "Beginning balance cannot be negative").optional().default(0),
  showBeginningBalance: z.boolean().optional().default(false),
  bills: z.array(billItemSchema).optional(),
});

export type CreateBillCountFormInput = z.infer<typeof createBillCountSchema>;

/**
 * Bill date filter schema (for API queries)
 */
export const billDateFilterSchema = z.object({
  date: z.string().datetime().optional(),
});

export type BillDateFilterInput = z.infer<typeof billDateFilterSchema>;
