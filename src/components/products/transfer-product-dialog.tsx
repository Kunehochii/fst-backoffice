"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import {
  Form,
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
import { useTransferProduct, useCashiers } from "@/hooks";
import { transferProductSchema, type TransferProductInput } from "@/schemas/product.schema";
import type { Product } from "@/types/product.types";

interface TransferProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferProductDialog({ product, open, onOpenChange }: TransferProductDialogProps) {
  const transferProduct = useTransferProduct();
  const { data: cashiers } = useCashiers();

  const form = useForm<TransferProductInput>({
    resolver: zodResolver(transferProductSchema),
    defaultValues: {
      productId: "",
      targetCashierId: "",
    },
  });

  // Update form when product changes
  useEffect(() => {
    if (product) {
      form.setValue("productId", product.id);
      form.setValue("targetCashierId", "");
    }
  }, [product, form]);

  const onSubmit = async (data: TransferProductInput) => {
    await transferProduct.mutateAsync(data);
    onOpenChange(false);
    form.reset();
  };

  if (!product) return null;

  // Filter out current cashier from options
  const availableCashiers = cashiers?.filter((c) => c.id !== product.cashierId) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Product</DialogTitle>
          <DialogDescription>
            Transfer &quot;{product.name}&quot; to another branch
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="targetCashierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Branch</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a branch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableCashiers.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No other branches available
                        </SelectItem>
                      ) : (
                        availableCashiers.map((cashier) => (
                          <SelectItem key={cashier.id} value={cashier.id}>
                            {cashier.branchName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>The product will be moved to this branch</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={transferProduct.isPending || availableCashiers.length === 0}
              >
                {transferProduct.isPending ? "Transferring..." : "Transfer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
