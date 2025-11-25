"use client";

import { useState } from "react";
import { ArrowLeft, Calendar, RefreshCw, Truck, Package, User, Clock, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDebounce } from "@/hooks";
import { useCashierDeliveries } from "@/hooks/use-delivery";
import { cn, formatLocalDateTime, formatLocalTime } from "@/utils";
import { format } from "date-fns";
import type { Cashier } from "@/types/auth.types";
import type { Delivery, DeliveryItem, DeliveryFilters } from "@/types/delivery.types";
import { getSackTypeDisplayName, calculateTotalItems } from "@/types/delivery.types";

interface CashierDeliveryViewProps {
  cashier: Cashier;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onBack: () => void;
}

export function CashierDeliveryView({
  cashier,
  selectedDate,
  onDateChange,
  onBack,
}: CashierDeliveryViewProps) {
  const [productSearch, setProductSearch] = useState("");
  const debouncedSearch = useDebounce(productSearch, 300);

  // Build additional filters
  const additionalFilters: Partial<DeliveryFilters> = {};
  if (debouncedSearch) {
    additionalFilters.productSearch = debouncedSearch;
  }

  // Fetch deliveries for this cashier
  const {
    data: deliveries,
    isLoading,
    refetch,
    isFetching,
  } = useCashierDeliveries(cashier.id, selectedDate, additionalFilters);

  const handleRefresh = () => {
    refetch();
  };

  // Calculate summary stats
  const totalDeliveries = deliveries?.length ?? 0;
  const totalItems = deliveries?.reduce((sum, d) => sum + calculateTotalItems(d), 0) ?? 0;
  const uniqueDrivers = new Set(deliveries?.map((d) => d.driverName)).size;

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
            <p className="text-muted-foreground">View delivery records for this branch</p>
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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <DeliveryDataSkeleton />
      ) : deliveries && deliveries.length > 0 ? (
        <>
          {/* Summary Cards */}
          <DeliverySummaryCards
            totalDeliveries={totalDeliveries}
            totalItems={totalItems}
            uniqueDrivers={uniqueDrivers}
          />

          {/* Deliveries List */}
          <DeliveryList deliveries={deliveries} />
        </>
      ) : (
        <EmptyDeliveryState />
      )}
    </div>
  );
}

interface DeliverySummaryCardsProps {
  totalDeliveries: number;
  totalItems: number;
  uniqueDrivers: number;
}

function DeliverySummaryCards({
  totalDeliveries,
  totalItems,
  uniqueDrivers,
}: DeliverySummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDeliveries}</div>
          <p className="text-xs text-muted-foreground">deliveries recorded</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">items delivered</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Drivers</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueDrivers}</div>
          <p className="text-xs text-muted-foreground">drivers involved</p>
        </CardContent>
      </Card>
    </div>
  );
}

interface DeliveryListProps {
  deliveries: Delivery[];
}

function DeliveryList({ deliveries }: DeliveryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Deliveries
        </CardTitle>
        <CardDescription>
          {deliveries.length} deliver{deliveries.length !== 1 ? "ies" : "y"} recorded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {deliveries.map((delivery, index) => (
            <AccordionItem key={delivery.id} value={`delivery-${index}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {delivery.driverName}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatLocalTime(delivery.deliveryTimeStart)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">
                      {delivery.deliveryItems.length} item
                      {delivery.deliveryItems.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <DeliveryItemsList items={delivery.deliveryItems} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

interface DeliveryItemsListProps {
  items: DeliveryItem[];
}

function DeliveryItemsList({ items }: DeliveryItemsListProps) {
  return (
    <div className="space-y-2 pt-2">
      <div className="grid grid-cols-4 gap-2 px-2 py-1 text-xs font-medium text-muted-foreground border-b">
        <div>Product</div>
        <div>Quantity</div>
        <div>Type</div>
        <div>Category</div>
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-4 gap-2 px-2 py-2 text-sm rounded-lg hover:bg-muted/50"
        >
          <div className="font-medium flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            {item.product.name}
          </div>
          <div className="font-mono">{parseFloat(item.quantity).toFixed(2)}</div>
          <div>
            {item.sackType ? (
              <Badge variant="outline">{getSackTypeDisplayName(item.sackType)}</Badge>
            ) : item.perKiloPriceId ? (
              <Badge variant="outline">Per Kilo</Badge>
            ) : (
              <Badge variant="secondary">Unknown</Badge>
            )}
          </div>
          <div>
            <Badge
              variant="secondary"
              className={cn(
                item.product.category === "NORMAL" && "bg-blue-100 text-blue-700",
                item.product.category === "ASIN" && "bg-amber-100 text-amber-700",
                item.product.category === "PLASTIC" && "bg-green-100 text-green-700"
              )}
            >
              {item.product.category}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyDeliveryState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="p-4 bg-muted/50 rounded-full mb-4">
          <Truck className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">No deliveries</p>
        <p className="text-sm text-muted-foreground/70">
          No deliveries recorded for the selected date and filters
        </p>
      </CardContent>
    </Card>
  );
}

function DeliveryDataSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Deliveries List Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
