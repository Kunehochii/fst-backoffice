"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SackType } from "@/types/product.types";
import type { CreateProductInput } from "@/schemas/product.schema";
import { useState } from "react";

const SACK_TYPE_LABELS: Record<SackType, string> = {
  [SackType.FIFTY_KG]: "50 KG",
  [SackType.TWENTY_FIVE_KG]: "25 KG",
  [SackType.FIVE_KG]: "5 KG",
};

export function SackPriceFields() {
  const form = useFormContext<CreateProductInput>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sackPrices",
  });

  // Track which sack types have special prices enabled
  const [specialPriceEnabled, setSpecialPriceEnabled] = useState<Record<number, boolean>>({});

  // Get available sack types (ones not already added)
  const usedTypes = fields.map((f) => f.type);
  const availableTypes = Object.values(SackType).filter((type) => !usedTypes.includes(type));

  const handleAddSackPrice = () => {
    if (availableTypes.length === 0) return;
    append({
      price: 0,
      type: availableTypes[0],
      stock: 0,
      profit: null,
      specialPrice: null,
    });
  };

  const toggleSpecialPrice = (index: number, enabled: boolean) => {
    setSpecialPriceEnabled((prev) => ({ ...prev, [index]: enabled }));
    if (enabled) {
      form.setValue(`sackPrices.${index}.specialPrice`, {
        price: 0,
        minimumQty: 0,
        profit: null,
      });
    } else {
      form.setValue(`sackPrices.${index}.specialPrice`, null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Sack Prices</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddSackPrice}
          disabled={availableTypes.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Sack Price
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
          No sack prices added. Click the button above to add one.
        </p>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Sack Price #{index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => {
                      remove(index);
                      setSpecialPriceEnabled((prev) => {
                        const next = { ...prev };
                        delete next[index];
                        return next;
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`sackPrices.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sack Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* Show current value plus available types */}
                            <SelectItem value={field.value}>
                              {SACK_TYPE_LABELS[field.value as SackType]}
                            </SelectItem>
                            {availableTypes
                              .filter((t) => t !== field.value)
                              .map((type) => (
                                <SelectItem key={type} value={type}>
                                  {SACK_TYPE_LABELS[type]}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`sackPrices.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₱)</FormLabel>
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
                    name={`sackPrices.${index}.stock`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`sackPrices.${index}.profit`}
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

                {/* Special Price Toggle */}
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id={`special-price-${index}`}
                    checked={specialPriceEnabled[index] || false}
                    onCheckedChange={(checked) => toggleSpecialPrice(index, checked as boolean)}
                  />
                  <Label
                    htmlFor={`special-price-${index}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    Enable special price for bulk orders
                  </Label>
                </div>

                {/* Special Price Fields */}
                {specialPriceEnabled[index] && (
                  <div className="grid gap-4 sm:grid-cols-3 p-4 bg-muted/50 rounded-lg">
                    <FormField
                      control={form.control}
                      name={`sackPrices.${index}.specialPrice.minimumQty`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Qty</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              min="1"
                              placeholder="10"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`sackPrices.${index}.specialPrice.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Price (₱)</FormLabel>
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
                      name={`sackPrices.${index}.specialPrice.profit`}
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
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
