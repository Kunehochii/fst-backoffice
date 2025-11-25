"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { useCreateCashier } from "@/hooks";
import { createCashierSchema, type CreateCashierInput } from "@/schemas";
import { CashierPermissions } from "@/types/auth.types";

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

export function CreateCashierDialog() {
  const [open, setOpen] = useState(false);
  const createCashier = useCreateCashier();

  const form = useForm<CreateCashierInput>({
    resolver: zodResolver(createCashierSchema),
    defaultValues: {
      username: "",
      branchName: "",
      accessKey: "",
      secureCode: "",
      permissions: [],
    },
  });

  const onSubmit = async (data: CreateCashierInput) => {
    await createCashier.mutateAsync(data);
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Cashier
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Cashier</DialogTitle>
          <DialogDescription>
            Add a new cashier to your business. They will use these credentials to log in.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="cashier01" {...field} />
                  </FormControl>
                  <FormDescription>A unique username with no spaces</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              name="accessKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormDescription>Minimum 4 characters for login</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secureCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secure Code (6-digit PIN)</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="123456" maxLength={6} {...field} />
                  </FormControl>
                  <FormDescription>Used for POS entry verification</FormDescription>
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
              <Button type="submit" disabled={createCashier.isPending}>
                {createCashier.isPending ? "Creating..." : "Create Cashier"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
