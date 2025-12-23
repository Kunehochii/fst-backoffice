"use client";

import { useState } from "react";
import { Search, TrendingUp, Store, ChevronRight, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCashiers, useDebounce, useBusiness } from "@/hooks";
import { useProfitRealtimeSubscription } from "@/hooks/use-profit";
import { ProfitSummaryCard } from "./profit-summary-card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Cashier } from "@/types/auth.types";

interface ProfitPageProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onSelectCashier: (cashier: Cashier) => void;
}

export function ProfitPage({ selectedDate, onDateChange, onSelectCashier }: ProfitPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { businessId } = useBusiness();

  const { data: cashiers, isLoading } = useCashiers();

  // Subscribe to real-time profit updates
  useProfitRealtimeSubscription(businessId ?? undefined);

  // Filter cashiers based on search
  const filteredCashiers = cashiers?.filter(
    (cashier) =>
      cashier.branchName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      cashier.username.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Profit Report
          </h1>
          <p className="text-muted-foreground">
            Track and analyze profit margins across your branches
          </p>
        </div>

        {/* Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
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
      </div>

      {/* Profit Summary Card */}
      <ProfitSummaryCard selectedDate={selectedDate} />

      {/* Branch Selection Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Select a Branch
              </CardTitle>
              <CardDescription>
                View profit data for {format(selectedDate, "MMMM d, yyyy")}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <BranchListSkeleton />
          ) : filteredCashiers && filteredCashiers.length > 0 ? (
            <div className="space-y-2">
              {filteredCashiers.map((cashier) => (
                <BranchCard
                  key={cashier.id}
                  cashier={cashier}
                  onClick={() => onSelectCashier(cashier)}
                />
              ))}
            </div>
          ) : (
            <EmptyState hasSearch={!!debouncedSearch} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface BranchCardProps {
  cashier: Cashier;
  onClick: () => void;
}

function BranchCard({ cashier, onClick }: BranchCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left group"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Store className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{cashier.branchName}</h3>
          <p className="text-sm text-muted-foreground">@{cashier.username}</p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
    </button>
  );
}

function BranchListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  hasSearch: boolean;
}

function EmptyState({ hasSearch }: EmptyStateProps) {
  if (hasSearch) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 bg-muted/50 rounded-full mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">No branches found</p>
        <p className="text-sm text-muted-foreground/70">Try adjusting your search term</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-4 bg-muted/50 rounded-full mb-4">
        <Store className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-lg font-medium text-muted-foreground">No branches yet</p>
      <p className="text-sm text-muted-foreground/70">
        Create a cashier first to start tracking profit
      </p>
    </div>
  );
}
