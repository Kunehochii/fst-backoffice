"use client";

import { useState } from "react";
import { Search, FileSpreadsheet, Store, ChevronRight, Calendar, Package, Box } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useCashiers, useDebounce } from "@/hooks";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Cashier } from "@/types/auth.types";
import { SheetType } from "@/types/sheet.types";

interface SheetPageProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onSelectCashier: (cashier: Cashier, sheetType: SheetType) => void;
}

export function SheetPage({ selectedDate, onDateChange, onSelectCashier }: SheetPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<SheetType>(SheetType.KAHON);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: cashiers, isLoading } = useCashiers();

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
            <FileSpreadsheet className="h-6 w-6" />
            Sheets
          </h1>
          <p className="text-muted-foreground">
            Manage Kahon and Inventory sheets across your branches
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

      {/* Sheet Type Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SheetType)}>
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value={SheetType.KAHON} className="gap-2">
            <Package className="h-4 w-4" />
            Kahon
          </TabsTrigger>
          <TabsTrigger value={SheetType.INVENTORY} className="gap-2">
            <Box className="h-4 w-4" />
            Inventory
          </TabsTrigger>
        </TabsList>

        {/* Kahon Tab */}
        <TabsContent value={SheetType.KAHON}>
          <BranchSelectionCard
            title="Kahon Sheets"
            description={`Select a branch to view or edit its Kahon sheet for ${format(
              selectedDate,
              "MMMM d, yyyy"
            )}`}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            cashiers={filteredCashiers}
            isLoading={isLoading}
            onSelectCashier={(cashier) => onSelectCashier(cashier, SheetType.KAHON)}
            sheetType={SheetType.KAHON}
          />
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value={SheetType.INVENTORY}>
          <BranchSelectionCard
            title="Inventory Sheets"
            description={`Select a branch to view or edit its Inventory sheet for ${format(
              selectedDate,
              "MMMM d, yyyy"
            )}`}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            cashiers={filteredCashiers}
            isLoading={isLoading}
            onSelectCashier={(cashier) => onSelectCashier(cashier, SheetType.INVENTORY)}
            sheetType={SheetType.INVENTORY}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface BranchSelectionCardProps {
  title: string;
  description: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  cashiers: Cashier[] | undefined;
  isLoading: boolean;
  onSelectCashier: (cashier: Cashier) => void;
  sheetType: SheetType;
}

function BranchSelectionCard({
  title,
  description,
  searchTerm,
  onSearchChange,
  cashiers,
  isLoading,
  onSelectCashier,
  sheetType,
}: BranchSelectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <BranchListSkeleton />
        ) : cashiers && cashiers.length > 0 ? (
          <div className="space-y-2">
            {cashiers.map((cashier) => (
              <BranchCard
                key={cashier.id}
                cashier={cashier}
                sheetType={sheetType}
                onClick={() => onSelectCashier(cashier)}
              />
            ))}
          </div>
        ) : (
          <EmptyState hasSearch={!!searchTerm} />
        )}
      </CardContent>
    </Card>
  );
}

interface BranchCardProps {
  cashier: Cashier;
  sheetType: SheetType;
  onClick: () => void;
}

function BranchCard({ cashier, sheetType, onClick }: BranchCardProps) {
  const icon =
    sheetType === SheetType.KAHON ? (
      <Package className="h-6 w-6 text-primary" />
    ) : (
      <Box className="h-6 w-6 text-primary" />
    );

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left group"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold">{cashier.branchName}</h3>
          <p className="text-sm text-muted-foreground">@{cashier.username}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="hidden sm:flex">
          {sheetType === SheetType.KAHON ? "Kahon" : "Inventory"}
        </Badge>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
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
        Create a cashier first to start using sheets
      </p>
    </div>
  );
}
