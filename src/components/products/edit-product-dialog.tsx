"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductForm } from "./product-form";
import { useUpdateProduct } from "@/hooks";
import { updateProductSchema, type UpdateProductInput } from "@/schemas/product.schema";
import type { Product, SackPrice } from "@/types/product.types";
import { fromDecimalString } from "@/lib/decimal";

interface EditProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Convert a product from API to form format
 */
function productToFormData(product: Product): UpdateProductInput {
  return {
    name: product.name,
    picture: product.picture,
    category: product.category,
    sackPrices: product.sackPrices.map((sp: SackPrice) => ({
      id: sp.id,
      price: fromDecimalString(sp.price) ?? 0,
      type: sp.type,
      stock: fromDecimalString(sp.stock) ?? 0,
      profit: fromDecimalString(sp.profit),
      specialPrice: sp.specialPrice
        ? {
            id: sp.specialPrice.id,
            price: fromDecimalString(sp.specialPrice.price) ?? 0,
            minimumQty: fromDecimalString(sp.specialPrice.minimumQty) ?? 0,
            profit: fromDecimalString(sp.specialPrice.profit),
          }
        : null,
    })),
    perKiloPrice: product.perKiloPrice
      ? {
          price: fromDecimalString(product.perKiloPrice.price) ?? 0,
          stock: fromDecimalString(product.perKiloPrice.stock) ?? 0,
          profit: fromDecimalString(product.perKiloPrice.profit),
        }
      : null,
  };
}

export function EditProductDialog({ product, open, onOpenChange }: EditProductDialogProps) {
  const updateProduct = useUpdateProduct();

  const form = useForm<UpdateProductInput>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: product ? productToFormData(product) : {},
  });

  const onSubmit = async (data: UpdateProductInput) => {
    if (!product) return;

    await updateProduct.mutateAsync({
      id: product.id,
      data,
    });
    onOpenChange(false);
  };

  if (!product) return null;

  // Use product.id as key to force form re-creation when product changes
  const formKey = `edit-product-${product.id}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 flex-shrink-0">
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update details for {product.name}</DialogDescription>
        </DialogHeader>
        <FormProvider {...form} key={formKey}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6">
              <div className="pb-4">
                <ProductForm hideCashier />
              </div>
            </div>
            <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateProduct.isPending}>
                {updateProduct.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
