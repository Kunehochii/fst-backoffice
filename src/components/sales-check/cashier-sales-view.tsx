"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Package,
  Banknote,
  CreditCard,
  Building2,
  Percent,
  Star,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useAllCashierSales, useCashierSalesRealtimeSubscription } from "@/hooks/use-sales-check";
import { cn, formatCurrency, formatLocalDateTime } from "@/utils";
import { format } from "date-fns";
import type { Cashier } from "@/types/auth.types";
import type {
  GroupedSale,
  TotalSalesResponse,
  SalesFilters,
  SaleItemDetail,
  PaymentMethod,
} from "@/types/sales.types";
import { getPaymentMethodDisplayName, getPaymentMethodColor } from "@/types/sales.types";
import { ProductCategory } from "@/types/product.types";

type SalesTab = "sales" | "voided";

interface CashierSalesViewProps {
  cashier: Cashier;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onBack: () => void;
  activeTab: SalesTab;
  onTabChange: (tab: SalesTab) => void;
}

export function CashierSalesView({
  cashier,
  selectedDate,
  onDateChange,
  onBack,
  activeTab,
  onTabChange,
}: CashierSalesViewProps) {
  const [productSearch, setProductSearch] = useState("");
  const [priceTypeFilter, setPriceTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(productSearch, 300);

  // Build additional filters
  const additionalFilters: Partial<SalesFilters> = {};
  if (debouncedSearch) {
    additionalFilters.productSearch = debouncedSearch;
  }
  if (priceTypeFilter !== "all") {
    additionalFilters.priceType = priceTypeFilter as "SACK" | "KILO";
  }
  if (categoryFilter !== "all") {
    additionalFilters.category = categoryFilter as ProductCategory;
  }
  // For voided tab, we'd need a different endpoint or filter
  // Since the backend filters isVoid=false by default, we handle voided separately
  const isVoided = activeTab === "voided";

  // Fetch all cashier sales data
  const {
    data: allCashierSales,
    isLoading,
    refetch,
    isFetching,
  } = useAllCashierSales(selectedDate, additionalFilters);

  // Find this cashier's data
  const cashierData = allCashierSales?.find((c) => c.cashier.id === cashier.id);

  // Subscribe to real-time updates for this cashier
  useCashierSalesRealtimeSubscription(cashier.id);

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
            <p className="text-muted-foreground">View sales data for this branch</p>
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as SalesTab)}>
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="voided">Voided Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-4 space-y-6">
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
            <SalesDataSkeleton />
          ) : cashierData ? (
            <>
              {/* Summary Cards */}
              <SalesSummaryCards totalSales={cashierData.totalSales} />

              {/* Sales List */}
              <SalesGroupedList sales={cashierData.sales} />
            </>
          ) : (
            <EmptySalesState />
          )}
        </TabsContent>

        <TabsContent value="voided" className="mt-4 space-y-6">
          {/* Voided sales would need a different API endpoint */}
          <VoidedSalesPlaceholder />
        </TabsContent>
      </Tabs>
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

interface SalesSummaryCardsProps {
  totalSales: TotalSalesResponse;
}

function SalesSummaryCards({ totalSales }: SalesSummaryCardsProps) {
  const summary = totalSales.summary;
  const totalAmount = parseFloat(summary.totalAmount) || 0;
  const cashTotal = parseFloat(summary.paymentTotals.CASH) || 0;
  const checkTotal = parseFloat(summary.paymentTotals.CHECK) || 0;
  const bankTotal = parseFloat(summary.paymentTotals.BANK_TRANSFER) || 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
          <p className="text-xs text-muted-foreground">{summary.totalQuantity} items sold</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cash Sales</CardTitle>
          <Banknote className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(cashTotal)}</div>
          <p className="text-xs text-muted-foreground">
            {totalAmount > 0 ? ((cashTotal / totalAmount) * 100).toFixed(1) : 0}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Check Sales</CardTitle>
          <CreditCard className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(checkTotal)}</div>
          <p className="text-xs text-muted-foreground">
            {totalAmount > 0 ? ((checkTotal / totalAmount) * 100).toFixed(1) : 0}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bank Transfer</CardTitle>
          <Building2 className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{formatCurrency(bankTotal)}</div>
          <p className="text-xs text-muted-foreground">
            {totalAmount > 0 ? ((bankTotal / totalAmount) * 100).toFixed(1) : 0}% of total
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface SalesGroupedListProps {
  sales: GroupedSale[];
}

function SalesGroupedList({ sales }: SalesGroupedListProps) {
  if (!sales || sales.length === 0) {
    return <EmptySalesState />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Sales by Product
        </CardTitle>
        <CardDescription>
          {sales.length} product group{sales.length !== 1 ? "s" : ""} with sales today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {sales.map((sale, index) => (
            <AccordionItem
              key={`${sale.productName}-${sale.priceType}-${index}`}
              value={`item-${index}`}
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{sale.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {sale.priceType} • {sale.totalQuantity} sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {formatCurrency(parseFloat(sale.totalAmount))}
                    </p>
                    <div className="flex gap-1">
                      {parseFloat(sale.paymentTotals.CASH) > 0 && (
                        <Badge variant="outline" className="text-green-600 text-xs">
                          Cash
                        </Badge>
                      )}
                      {parseFloat(sale.paymentTotals.CHECK) > 0 && (
                        <Badge variant="outline" className="text-blue-600 text-xs">
                          Check
                        </Badge>
                      )}
                      {parseFloat(sale.paymentTotals.BANK_TRANSFER) > 0 && (
                        <Badge variant="outline" className="text-purple-600 text-xs">
                          Bank
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <SaleItemsList items={sale.items} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

interface SaleItemsListProps {
  items: SaleItemDetail[];
}

function SaleItemsList({ items }: SaleItemsListProps) {
  return (
    <div className="space-y-2 pt-2">
      <div className="grid grid-cols-6 gap-2 px-2 py-1 text-xs font-medium text-muted-foreground border-b">
        <div>Qty</div>
        <div>Unit Price</div>
        <div>Total</div>
        <div>Payment</div>
        <div>Tags</div>
        <div>Time</div>
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-6 gap-2 px-2 py-2 text-sm rounded-lg hover:bg-muted/50"
        >
          <div className="font-medium">{item.quantity}</div>
          <div className="font-mono">{formatCurrency(parseFloat(item.unitPrice))}</div>
          <div className="font-mono font-medium">
            {formatCurrency(parseFloat(item.totalAmount))}
          </div>
          <div>
            <Badge
              variant="outline"
              className={cn("text-xs", getPaymentMethodColor(item.paymentMethod as PaymentMethod))}
            >
              {getPaymentMethodDisplayName(item.paymentMethod as PaymentMethod)}
            </Badge>
          </div>
          <div className="flex gap-1 flex-wrap">
            {item.isSpecialPrice && (
              <Badge variant="secondary" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Special
              </Badge>
            )}
            {item.isDiscounted && (
              <Badge variant="secondary" className="text-xs text-orange-600">
                <Percent className="h-3 w-3 mr-1" />
                Discounted
              </Badge>
            )}
          </div>
          <div className="text-muted-foreground text-xs">{formatLocalDateTime(item.saleDate)}</div>
        </div>
      ))}
    </div>
  );
}

function EmptySalesState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="p-4 bg-muted/50 rounded-full mb-4">
          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">No sales data</p>
        <p className="text-sm text-muted-foreground/70">
          No sales recorded for the selected date and filters
        </p>
      </CardContent>
    </Card>
  );
}

function VoidedSalesPlaceholder() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="p-4 bg-muted/50 rounded-full mb-4">
          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">Voided Sales</p>
        <p className="text-sm text-muted-foreground/70">
          Voided sales tracking requires additional backend endpoint
        </p>
      </CardContent>
    </Card>
  );
}

function SalesDataSkeleton() {
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

      {/* Sales List Skeleton */}
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
