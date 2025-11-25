"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEditCashier } from "@/hooks";
import { editCashierSchema, type EditCashierInput } from "@/schemas";
import { CashierPermissions, type Cashier } from "@/types/auth.types";

const PERMISSION_LABELS: Record<CashierPermissions, string> = {
  [CashierPermissions.SALES]: "Sales",
  [CashierPermissions.DELIVERIES]: "Deliveries",
  [CashierPermissions.STOCKS]: "Stocks",
  [CashierPermissions.EDIT_PRICE]: "Edit Price",
  [CashierPermissions.KAHON]: "Kahon",
  [CashierPermissions.BILLS]: "Bills",
  [CashierPermissions.ATTACHMENTS]: "Attachments",
  [CashierPermissions.SALES_HISTORY]: "Sales History",
  [CashierPermissions.VOID]: "Void",
};

interface EditCashierDialogProps {
  cashier: Cashier;
}

export function EditCashierDialog({ cashier }: EditCashierDialogProps) {
  const [open, setOpen] = useState(false);
  const editCashier = useEditCashier();

  const form = useForm<EditCashierInput>({
    resolver: zodResolver(editCashierSchema),
    defaultValues: {
      branchName: cashier.branchName,
      permissions: cashier.permissions,
    },
  });

  const onSubmit = async (data: EditCashierInput) => {
    await editCashier.mutateAsync({ id: cashier.id, data });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Cashier</DialogTitle>
          <DialogDescription>
            Update the branch name and permissions for {cashier.username}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="branchName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Main Branch" {...field} />
                  </FormControl>
                  <FormDescription>The branch this cashier is assigned to</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissions"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Permissions</FormLabel>
                    <FormDescription>Select what this cashier can do</FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.values(CashierPermissions).map((permission) => (
                      <FormField
                        key={permission}
                        control={form.control}
                        name="permissions"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(permission)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, permission]);
                                  } else {
                                    field.onChange(current.filter((p) => p !== permission));
                                  }
                                }}
                              />
                            </FormControl>
                            <Label className="font-normal cursor-pointer">
                              {PERMISSION_LABELS[permission]}
                            </Label>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editCashier.isPending}>
                {editCashier.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
