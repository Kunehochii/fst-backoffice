import { z } from "zod";

/**
 * Create employee schema
 */
export const createEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  cashierId: z.string().optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

/**
 * Update employee schema
 */
export const updateEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  cashierId: z.string().nullable().optional(),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
