"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { CashierProductsView } from "@/components/products";
import { useCashier } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";

interface CashierProductsPageProps {
  params: Promise<{ id: string }>;
}

export default function CashierProductsPage({ params }: CashierProductsPageProps) {
  const { id } = use(params);
  const { data: cashier, isLoading, error } = useCashier(id);

  if (isLoading) {
    return <CashierProductsPageSkeleton />;
  }

  if (error || !cashier) {
    notFound();
  }

  return (
    <CashierProductsView
      cashier={cashier}
      onBack={() => {
        window.history.back();
      }}
    />
  );
}

function CashierProductsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>

      {/* Products */}
      <Skeleton className="h-96" />
    </div>
  );
}
