"use client";

import { useMemo } from "react";
import { TrendingUp, Calendar, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfit, useProfitDateRange } from "@/hooks/use-profit";
import { formatCurrency } from "@/utils";

interface ProfitSummaryCardProps {
  selectedDate: Date;
}

/**
 * Get the date range for the previous 30 days (excluding today)
 */
function getPrevious30DaysRange(today: Date): { startDate: Date; endDate: Date } {
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() - 1); // Yesterday

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 30); // 30 days ago

  return { startDate, endDate };
}

export function ProfitSummaryCard({ selectedDate }: ProfitSummaryCardProps) {
  // Get today's date at midnight for comparison
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Check if selected date is today
  const isToday = useMemo(() => {
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    return selected.getTime() === today.getTime();
  }, [selectedDate, today]);

  // Get the previous 30 days range (always based on actual today, not selected date)
  const { startDate: prev30Start, endDate: prev30End } = useMemo(
    () => getPrevious30DaysRange(today),
    [today]
  );

  // Fetch today's profit
  const { data: todayProfit, isLoading: isTodayLoading } = useProfit(today);

  // Fetch previous 30 days profit
  const { data: previousProfit, isLoading: isPreviousLoading } = useProfitDateRange(
    prev30Start,
    prev30End
  );

  const todayProfitValue = parseFloat(todayProfit?.totalProfit || "0");
  const previousProfitValue = parseFloat(previousProfit?.totalProfit || "0");
  const isLoading = isTodayLoading || isPreviousLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profit Summary</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-36" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Profit Summary</CardTitle>
        <TrendingUp className="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's Profit */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Today&apos;s Profit</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(todayProfitValue)}
          </div>
          {!isToday && (
            <p className="text-xs text-muted-foreground">
              (Viewing data for a different date)
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Previous 30 Days Profit */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <History className="h-3 w-3" />
            <span>Previous 30 Days</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(previousProfitValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Accumulated profit from the last 30 days
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
