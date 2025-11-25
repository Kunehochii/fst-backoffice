"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { BillCount } from "@/types/bill.types";

interface BillsSummaryProps {
  billCount: BillCount | null | undefined;
  billsTotal: number;
  beginningBalance: number;
  showBeginningBalance: boolean;
  isLoading?: boolean;
}

export function BillsSummary({
  billCount,
  billsTotal,
  beginningBalance,
  showBeginningBalance,
  isLoading,
}: BillsSummaryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Use real-time calculated values from form, with server values as fallback for expenses/cash
  const totalCash = billCount?.totalCash ?? 0;
  const totalExpenses = billCount?.totalExpenses ?? 0;
  const netCash = totalCash - totalExpenses;

  // Summary calculations using form state
  const summaryStep1 = billsTotal;
  const summaryFinal = summaryStep1 + totalExpenses - (showBeginningBalance ? beginningBalance : 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Summary Breakdown</CardTitle>
        <CardDescription>Overview of cash flow and bill count calculations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cash Overview Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Cash Overview
          </h3>
          <div className="space-y-3">
            <SummaryRow label="Total Cash (from Sales)" value={totalCash} variant="default" />
            <Separator />
            <SummaryRow label="Total Cash from Bills" value={billsTotal} variant="primary" />
            <Separator />
            <SummaryRow label="Net Cash (Cash - Expenses)" value={netCash} variant="default" />
          </div>
        </div>

        {/* Summary Calculation Section */}
        <div className="rounded-lg border-l-4 border-l-primary bg-muted/30 p-4 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Summary Calculation
          </h3>
          <div className="space-y-3">
            <SummaryRow label="Total Cash from Bills" value={billsTotal} variant="default" />
            <div className="flex items-center justify-between py-2 bg-primary/5 rounded px-2">
              <span className="font-medium">Step 1 Result</span>
              <span className="font-bold text-primary">₱{summaryStep1.toLocaleString()}</span>
            </div>
            <Separator />
            <SummaryRow label="Step 1 Result" value={summaryStep1} variant="default" />
            <SummaryRow label="+ Expenses" value={totalExpenses} variant="success" prefix="+" />
            {showBeginningBalance && (
              <SummaryRow
                label="- Beginning Balance"
                value={beginningBalance}
                variant="danger"
                prefix="-"
              />
            )}
            <Separator className="my-2" />
            <div className="flex items-center justify-between py-3 bg-primary/10 rounded-lg px-3">
              <span className="font-semibold text-lg">Final Summary</span>
              <span className="font-bold text-xl text-primary">
                ₱{summaryFinal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        {billCount && (
          <p className="text-xs text-muted-foreground text-center">
            Last updated: {new Date(billCount.updatedAt).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface SummaryRowProps {
  label: string;
  value: number;
  variant?: "default" | "primary" | "success" | "danger";
  prefix?: string;
}

function SummaryRow({ label, value, variant = "default", prefix }: SummaryRowProps) {
  const colorClasses = {
    default: "text-foreground",
    primary: "text-primary font-semibold",
    success: "text-green-600 dark:text-green-400",
    danger: "text-orange-600 dark:text-orange-400",
  };

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className={colorClasses[variant]}>
        {prefix && <span className="mr-1">{prefix}</span>}₱{value.toLocaleString()}
      </span>
    </div>
  );
}
