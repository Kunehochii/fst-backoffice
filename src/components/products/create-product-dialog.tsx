"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductForm } from "./product-form";
import { useCreateProduct } from "@/hooks";
import { createProductSchema, type CreateProductInput } from "@/schemas/product.schema";
import { ProductCategory } from "@/types/product.types";

interface CreateProductDialogProps {
  cashierId: string;
  branchName: string;
}

export function CreateProductDialog({ cashierId, branchName }: CreateProductDialogProps) {
  const [open, setOpen] = useState(false);
  const createProduct = useCreateProduct();

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      picture: "https://placehold.co/800x800?text=Product",
      category: ProductCategory.NORMAL,
      cashierId: cashierId,
      sackPrices: [],
      perKiloPrice: null,
    },
  });

  const onSubmit = async (data: CreateProductInput) => {
    await createProduct.mutateAsync({
      ...data,
      cashierId,
    });
    setOpen(false);
    form.reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 flex-shrink-0">
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>Add a new product to {branchName}</DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6">
              <div className="pb-4">
                <ProductForm hideCashier />
              </div>
            </div>
            <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProduct.isPending}>
                {createProduct.isPending ? "Creating..." : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
