"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  RefreshCw,
  TrendingUp,
  Package,
  DollarSign,
  Star,
  Layers,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDebounce } from "@/hooks";
import { useAllCashierProfits, useCashierProfitRealtimeSubscription } from "@/hooks/use-profit";
import { cn, formatCurrency, formatLocalDateTime } from "@/utils";
import { format } from "date-fns";
import type { Cashier } from "@/types/auth.types";
import type { GroupedProfit, ProfitItemDetail, ProfitFilters } from "@/types/profit.types";
import { getPriceTypeDisplayName } from "@/types/profit.types";
import { ProductCategory } from "@/types/product.types";

interface CashierProfitViewProps {
  cashier: Cashier;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onBack: () => void;
}

export function CashierProfitView({
  cashier,
  selectedDate,
  onDateChange,
  onBack,
}: CashierProfitViewProps) {
  const [productSearch, setProductSearch] = useState("");
  const [priceTypeFilter, setPriceTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(productSearch, 300);

  // Build additional filters
  const additionalFilters: Partial<ProfitFilters> = {};
  if (debouncedSearch) {
    additionalFilters.productSearch = debouncedSearch;
  }
  if (priceTypeFilter !== "all") {
    additionalFilters.priceType = priceTypeFilter as "SACK" | "KILO";
  }
  if (categoryFilter !== "all") {
    additionalFilters.category = categoryFilter as ProductCategory;
  }

  // Fetch all cashier profits data
  const {
    data: allCashierProfits,
    isLoading,
    refetch,
    isFetching,
  } = useAllCashierProfits(selectedDate, additionalFilters);

  // Find this cashier's data
  const cashierData = allCashierProfits?.find((c) => c.cashier.id === cashier.id);

  // Subscribe to real-time updates for this cashier
  useCashierProfitRealtimeSubscription(cashier.id);

  const handleRefresh = () => {
    refetch();
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
            <p className="text-muted-foreground">View profit data for this branch</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isFetching}>
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          </Button>

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
        </div>
      </div>

      {/* Filters */}
      <FiltersSection
        productSearch={productSearch}
        onProductSearchChange={setProductSearch}
        priceTypeFilter={priceTypeFilter}
        onPriceTypeChange={setPriceTypeFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      {isLoading ? (
        <ProfitDataSkeleton />
      ) : cashierData ? (
        <>
          {/* Summary Cards */}
          <ProfitSummaryCards
            totalProfit={cashierData.profits.totalProfit}
            items={cashierData.profits.items}
            rawItems={cashierData.profits.rawItems}
          />

          {/* Profit List */}
          <ProfitGroupedList
            profits={cashierData.profits.items}
            rawItems={cashierData.profits.rawItems}
          />
        </>
      ) : (
        <EmptyProfitState />
      )}
    </div>
  );
}

interface FiltersSectionProps {
  productSearch: string;
  onProductSearchChange: (value: string) => void;
  priceTypeFilter: string;
  onPriceTypeChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
}

function FiltersSection({
  productSearch,
  onProductSearchChange,
  priceTypeFilter,
  onPriceTypeChange,
  categoryFilter,
  onCategoryChange,
}: FiltersSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="Search products..."
              value={productSearch}
              onChange={(e) => onProductSearchChange(e.target.value)}
            />
          </div>
          <Select value={priceTypeFilter} onValueChange={onPriceTypeChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Price Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="SACK">Sack</SelectItem>
              <SelectItem value="KILO">Kilo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="ASIN">Asin</SelectItem>
              <SelectItem value="PLASTIC">Plastic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProfitSummaryCardsProps {
  totalProfit: string;
  items: GroupedProfit[];
  rawItems: ProfitItemDetail[];
}

function ProfitSummaryCards({ totalProfit, items, rawItems }: ProfitSummaryCardsProps) {
  const totalProfitNum = parseFloat(totalProfit) || 0;
  const totalQuantity = items.reduce((sum, item) => sum + parseFloat(item.totalQuantity), 0);
  const totalOrders = items.reduce((sum, item) => sum + item.orderCount, 0);
  const avgProfitPerUnit = totalQuantity > 0 ? totalProfitNum / totalQuantity : 0;

  // Count special price items
  const specialPriceItems = rawItems.filter((item) => item.isSpecialPrice).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalProfitNum)}</div>
          <p className="text-xs text-muted-foreground">{totalQuantity} items sold</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Profit/Unit</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(avgProfitPerUnit)}</div>
          <p className="text-xs text-muted-foreground">Per unit average</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <BarChart3 className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{totalOrders}</div>
          <p className="text-xs text-muted-foreground">
            {items.length} product group{items.length !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Special Prices</CardTitle>
          <Star className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{specialPriceItems}</div>
          <p className="text-xs text-muted-foreground">
            {rawItems.length > 0 ? ((specialPriceItems / rawItems.length) * 100).toFixed(1) : 0}% of
            sales
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface ProfitGroupedListProps {
  profits: GroupedProfit[];
  rawItems: ProfitItemDetail[];
}

function ProfitGroupedList({ profits, rawItems }: ProfitGroupedListProps) {
  if (!profits || profits.length === 0) {
    return <EmptyProfitState />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Profit by Product
        </CardTitle>
        <CardDescription>
          {profits.length} product group{profits.length !== 1 ? "s" : ""} with profits today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {profits.map((profit, index) => {
            // Find raw items for this product group
            const productRawItems = rawItems.filter(
              (item) =>
                item.productName === profit.productName && item.priceType === profit.priceType
            );

            return (
              <AccordionItem
                key={`${profit.productName}-${profit.priceType}-${index}`}
                value={`item-${index}`}
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                        <Package className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{profit.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {getPriceTypeDisplayName(profit.priceType)} • {profit.totalQuantity} sold
                          • {profit.orderCount} order{profit.orderCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600">
                        {formatCurrency(parseFloat(profit.totalProfit))}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(parseFloat(profit.profitPerUnit))}/unit
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ProfitItemsList items={productRawItems} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}

interface ProfitItemsListProps {
  items: ProfitItemDetail[];
}

function ProfitItemsList({ items }: ProfitItemsListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        No detailed breakdown available
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2">
      <div className="grid grid-cols-5 gap-2 px-2 py-1 text-xs font-medium text-muted-foreground border-b">
        <div>Qty</div>
        <div>Profit/Unit</div>
        <div>Total Profit</div>
        <div>Tags</div>
        <div>Time</div>
      </div>
      {items.map((item, idx) => (
        <div
          key={`${item.productName}-${item.saleDate}-${idx}`}
          className="grid grid-cols-5 gap-2 px-2 py-2 text-sm rounded-lg hover:bg-muted/50"
        >
          <div className="font-medium">{item.quantity}</div>
          <div className="font-mono">{formatCurrency(parseFloat(item.profitPerUnit))}</div>
          <div className="font-mono font-medium text-green-600">
            {formatCurrency(parseFloat(item.totalProfit))}
          </div>
          <div className="flex gap-1 flex-wrap">
            {item.isSpecialPrice && (
              <Badge variant="secondary" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Special
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {item.paymentMethod}
            </Badge>
          </div>
          <div className="text-muted-foreground text-xs">{formatLocalDateTime(item.saleDate)}</div>
        </div>
      ))}
    </div>
  );
}

function EmptyProfitState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="p-4 bg-muted/50 rounded-full mb-4">
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">No profit data</p>
        <p className="text-sm text-muted-foreground/70">
          No profits recorded for the selected date and filters
        </p>
      </CardContent>
    </Card>
  );
}

function ProfitDataSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profit List Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
