"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "./image-upload";
import { SackPriceFields } from "./sack-price-fields";
import { ProductCategory } from "@/types/product.types";
import type { CreateProductInput } from "@/schemas/product.schema";
import { useState } from "react";

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  [ProductCategory.NORMAL]: "Normal",
  [ProductCategory.ASIN]: "Asin",
  [ProductCategory.PLASTIC]: "Plastic",
};

interface ProductFormProps {
  hideCategory?: boolean;
  hideCashier?: boolean;
}

export function ProductForm({ hideCategory, hideCashier }: ProductFormProps) {
  const form = useFormContext<CreateProductInput>();
  const [perKiloEnabled, setPerKiloEnabled] = useState(
    form.getValues("perKiloPrice") !== null && form.getValues("perKiloPrice") !== undefined
  );

  const togglePerKilo = (enabled: boolean) => {
    setPerKiloEnabled(enabled);
    if (enabled) {
      form.setValue("perKiloPrice", {
        price: 0,
        stock: 0,
        profit: null,
      });
    } else {
      form.setValue("perKiloPrice", null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField
            control={form.control}
            name="picture"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Image</FormLabel>
                <FormControl>
                  <ImageUpload value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormDescription>
                  Upload a product image (JPEG, PNG, WebP, or GIF, max 5MB)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Premium Rice" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!hideCategory && (
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(ProductCategory).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {!hideCashier && (
          <FormField
            control={form.control}
            name="cashierId"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input type="hidden" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </div>

      {/* Sack Prices */}
      <SackPriceFields />

      {/* Per Kilo Price */}
      <Card>
        <CardHeader className="py-3 px-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="per-kilo-enabled"
              checked={perKiloEnabled}
              onCheckedChange={(checked) => togglePerKilo(checked as boolean)}
            />
            <Label htmlFor="per-kilo-enabled" className="font-medium cursor-pointer">
              Enable Per Kilo Pricing
            </Label>
          </div>
        </CardHeader>
        {perKiloEnabled && (
          <CardContent className="px-4 pb-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="perKiloPrice.price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per KG (₱)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          field.onChange(isNaN(val) ? 0 : Math.round(val * 100) / 100);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="perKiloPrice.stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock (KG)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          field.onChange(isNaN(val) ? 0 : Math.round(val * 100) / 100);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="perKiloPrice.profit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profit (₱)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00 (optional)"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            field.onChange(null);
                          } else {
                            const num = parseFloat(val);
                            field.onChange(isNaN(num) ? null : Math.round(num * 100) / 100);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
