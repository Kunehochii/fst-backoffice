import type { Cashier } from "./auth.types";

/**
 * Employee type from backend
 */
export interface Employee {
  id: string;
  name: string;
  businessId: string;
  cashierId: string | null;
  createdAt: string;
  updatedAt: string;
  cashier?: Pick<Cashier, "id" | "username" | "branchName"> | null;
}

/**
 * Employee with shift history
 */
export interface EmployeeWithShifts extends Employee {
  shiftEmployees?: {
    id: string;
    createdAt: string;
    shift: {
      id: string;
      startTime: string;
      endTime: string | null;
    };
  }[];
}
