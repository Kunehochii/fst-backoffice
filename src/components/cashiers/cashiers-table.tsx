"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EditCashierDialog } from "./edit-cashier-dialog";
import { EditPasswordDialog } from "./edit-password-dialog";
import type { Cashier } from "@/types/auth.types";
import { CashierPermissions } from "@/types/auth.types";

const PERMISSION_LABELS: Record<CashierPermissions, string> = {
  [CashierPermissions.SALES]: "Sales",
  [CashierPermissions.DELIVERIES]: "Deliveries",
  [CashierPermissions.STOCKS]: "Stocks",
  [CashierPermissions.EDIT_PRICE]: "Edit Price",
  [CashierPermissions.KAHON]: "Kahon",
  [CashierPermissions.BILLS]: "Bills",
  [CashierPermissions.ATTACHMENTS]: "Attachments",
  [CashierPermissions.SALES_HISTORY]: "Sales History",
  [CashierPermissions.VOID]: "Void",
};

interface CashiersTableProps {
  cashiers: Cashier[] | undefined;
  isLoading: boolean;
}

export function CashiersTable({ cashiers, isLoading }: CashiersTableProps) {
  if (isLoading) {
    return <CashiersTableSkeleton />;
  }

  if (!cashiers || cashiers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No cashiers found</p>
          <p className="text-sm">Create your first cashier to get started</p>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Username</TableHead>
          <TableHead>Branch Name</TableHead>
          <TableHead>Permissions</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cashiers.map((cashier) => (
          <TableRow key={cashier.id}>
            <TableCell className="font-medium">{cashier.username}</TableCell>
            <TableCell>{cashier.branchName}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1 max-w-xs">
                {cashier.permissions.length === 0 ? (
                  <span className="text-muted-foreground text-sm">No permissions</span>
                ) : (
                  cashier.permissions.slice(0, 3).map((permission) => (
                    <Badge key={permission} variant="secondary" className="text-xs">
                      {PERMISSION_LABELS[permission]}
                    </Badge>
                  ))
                )}
                {cashier.permissions.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{cashier.permissions.length - 3} more
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(cashier.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <EditCashierDialog cashier={cashier} />
                <EditPasswordDialog cashier={cashier} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CashiersTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Username</TableHead>
          <TableHead>Branch Name</TableHead>
          <TableHead>Permissions</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
