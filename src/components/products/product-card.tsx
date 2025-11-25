"use client";

import Image from "next/image";
import { MoreVertical, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Product } from "@/types/product.types";
import { ProductCategory, SackType } from "@/types/product.types";
import { fromDecimalStringOrDefault } from "@/lib/decimal";
import { formatCurrency } from "@/utils";

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  [ProductCategory.NORMAL]: "Normal",
  [ProductCategory.ASIN]: "Asin",
  [ProductCategory.PLASTIC]: "Plastic",
};

const SACK_TYPE_LABELS: Record<SackType, string> = {
  [SackType.FIFTY_KG]: "50kg",
  [SackType.TWENTY_FIVE_KG]: "25kg",
  [SackType.FIVE_KG]: "5kg",
};

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onTransfer: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onDelete, onTransfer }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Image - smaller, fixed width */}
        <div className="relative w-24 h-24 flex-shrink-0 bg-muted">
          {product.picture && product.picture !== "https://placehold.co/800x800?text=Product" ? (
            <Image
              src={product.picture}
              alt={product.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-8 w-8 text-muted-foreground/50" />
            </div>
          )}
          {/* Category Badge */}
          <Badge variant="secondary" className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0">
            {CATEGORY_LABELS[product.category]}
          </Badge>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold truncate">{product.name}</h3>
            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(product)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTransfer(product)}>Transfer</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(product)}
                  className="text-destructive focus:text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Sack Prices Stock */}
          {product.sackPrices.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {product.sackPrices.map((sp) => (
                <div
                  key={sp.id}
                  className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded"
                >
                  <span className="font-medium">{SACK_TYPE_LABELS[sp.type]}:</span>
                  <span>{fromDecimalStringOrDefault(sp.stock, 0).toLocaleString()} sacks</span>
                  <span className="text-muted-foreground">
                    ({formatCurrency(fromDecimalStringOrDefault(sp.price, 0))})
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Per Kilo Stock */}
          {product.perKiloPrice && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                <span className="font-medium">Per Kilo:</span>
                <span>
                  {fromDecimalStringOrDefault(product.perKiloPrice.stock, 0).toLocaleString()} kg
                </span>
                <span className="opacity-70">
                  ({formatCurrency(fromDecimalStringOrDefault(product.perKiloPrice.price, 0))}/kg)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
