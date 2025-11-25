"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Calendar, Save, Loader2, Banknote } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BillsSummary } from "./bills-summary";
import { useCashierBillCount, useCreateOrUpdateBillCount } from "@/hooks";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Cashier } from "@/types/auth.types";
import {
  BillType,
  BILL_TYPES_ORDERED,
  getBillDisplayName,
  getBillValue,
  type BillItemInput,
} from "@/types/bill.types";

interface CashierBillsViewProps {
  cashier: Cashier;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onBack: () => void;
}

// Helper to create initial bill amounts
function createInitialBillAmounts(
  billCount?: { billsByType: Record<BillType, number> } | null
): Record<BillType, number> {
  const amounts: Record<BillType, number> = {} as Record<BillType, number>;
  BILL_TYPES_ORDERED.forEach((type) => {
    amounts[type] = billCount?.billsByType[type] || 0;
  });
  return amounts;
}

// Create a stable key for resetting form state when data changes
function getBillCountKey(
  billCount:
    | { id?: string; beginningBalance: number; showBeginningBalance: boolean }
    | null
    | undefined
): string {
  if (!billCount) return "empty";
  return `${billCount.id ?? "new"}-${billCount.beginningBalance}-${billCount.showBeginningBalance}`;
}

export function CashierBillsView({
  cashier,
  selectedDate,
  onDateChange,
  onBack,
}: CashierBillsViewProps) {
  const { data: billCount, isLoading } = useCashierBillCount(cashier.id, selectedDate);
  const createOrUpdate = useCreateOrUpdateBillCount();

  // Create a key that changes when billCount data changes
  const billCountKey = useMemo(() => getBillCountKey(billCount), [billCount]);

  // Form state - initialized from billCount data, reset when billCountKey changes
  const [beginningBalance, setBeginningBalance] = useState<number>(
    billCount?.beginningBalance ?? 0
  );
  const [showBeginningBalance, setShowBeginningBalance] = useState<boolean>(
    billCount?.showBeginningBalance ?? false
  );
  const [billAmounts, setBillAmounts] = useState<Record<BillType, number>>(() =>
    createInitialBillAmounts(billCount)
  );

  // Reset form state when billCount data changes (using key pattern)
  const [prevKey, setPrevKey] = useState(billCountKey);
  if (prevKey !== billCountKey) {
    setPrevKey(billCountKey);
    setBeginningBalance(billCount?.beginningBalance ?? 0);
    setShowBeginningBalance(billCount?.showBeginningBalance ?? false);
    setBillAmounts(createInitialBillAmounts(billCount));
  }

  // Calculate totals
  const billsTotal = BILL_TYPES_ORDERED.reduce((sum, type) => {
    return sum + billAmounts[type] * getBillValue(type);
  }, 0);

  const handleBillAmountChange = (type: BillType, value: string) => {
    const numValue = parseInt(value) || 0;
    setBillAmounts((prev) => ({
      ...prev,
      [type]: Math.max(0, numValue),
    }));
  };

  const handleSave = () => {
    const bills: BillItemInput[] = BILL_TYPES_ORDERED.map((type) => ({
      type,
      amount: billAmounts[type],
    })).filter((bill) => bill.amount > 0);

    createOrUpdate.mutate({
      cashierId: cashier.id,
      date: selectedDate,
      data: {
        beginningBalance,
        showBeginningBalance,
        bills,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{cashier.branchName}</h1>
            <p className="text-muted-foreground">Manage bill count for this branch</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && onDateChange(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={createOrUpdate.isPending}>
            {createOrUpdate.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {isLoading ? (
        <BillsFormSkeleton />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bill Count Form */}
          <div className="space-y-6">
            {/* Beginning Balance Card */}
            <Card>
              <CardHeader>
                <CardTitle>Beginning Balance</CardTitle>
                <CardDescription>Set the starting cash balance for this day</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showBeginningBalance">Show Beginning Balance</Label>
                  <Switch
                    id="showBeginningBalance"
                    checked={showBeginningBalance}
                    onCheckedChange={setShowBeginningBalance}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beginningBalance">Amount (₱)</Label>
                  <Input
                    id="beginningBalance"
                    type="number"
                    min="0"
                    step="0.01"
                    value={beginningBalance}
                    onChange={(e) => setBeginningBalance(parseFloat(e.target.value) || 0)}
                    className="text-right font-mono"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bills Input Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  Bill Counts
                </CardTitle>
                <CardDescription>Enter the number of bills for each denomination</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {BILL_TYPES_ORDERED.map((type) => (
                    <BillInputRow
                      key={type}
                      type={type}
                      amount={billAmounts[type]}
                      onChange={(value) => handleBillAmountChange(type, value)}
                    />
                  ))}

                  {/* Total Row */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">Total Cash from Bills</span>
                      <span className="font-bold text-xl text-primary">
                        ₱{billsTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Section */}
          <BillsSummary
            billCount={billCount}
            billsTotal={billsTotal}
            beginningBalance={beginningBalance}
            showBeginningBalance={showBeginningBalance}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}

interface BillInputRowProps {
  type: BillType;
  amount: number;
  onChange: (value: string) => void;
}

function BillInputRow({ type, amount, onChange }: BillInputRowProps) {
  const value = getBillValue(type);
  const total = amount * value;

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 shrink-0">
        <span className="font-medium">{getBillDisplayName(type)}</span>
      </div>
      <div className="flex-1">
        <Input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => onChange(e.target.value)}
          className="text-center font-mono"
          placeholder="0"
        />
      </div>
      <div className="w-8 text-center text-muted-foreground">×</div>
      <div className="w-20 text-right font-mono text-muted-foreground">
        ₱{value.toLocaleString()}
      </div>
      <div className="w-8 text-center text-muted-foreground">=</div>
      <div className="w-28 text-right font-mono font-semibold">₱{total.toLocaleString()}</div>
    </div>
  );
}

function BillsFormSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
