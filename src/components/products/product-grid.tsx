"use client";

import { Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "./product-card";
import type { Product } from "@/types/product.types";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onTransfer: (product: Product) => void;
}

export function ProductGrid({
  products,
  isLoading,
  onEdit,
  onDelete,
  onTransfer,
}: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 bg-muted/50 rounded-full mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">No products found</p>
        <p className="text-sm text-muted-foreground/70">Create your first product to get started</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onTransfer={onTransfer}
        />
      ))}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card overflow-hidden flex">
          <Skeleton className="w-24 h-24 flex-shrink-0" />
          <div className="p-3 flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <div className="flex gap-1.5 flex-wrap">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
