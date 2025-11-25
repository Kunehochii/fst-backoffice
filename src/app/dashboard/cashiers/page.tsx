"use client";

import { useState } from "react";
import { Search, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CreateCashierDialog, CashiersTable } from "@/components/cashiers";
import { useCashiers, useDebounce } from "@/hooks";

export default function CashiersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: cashiers, isLoading } = useCashiers(debouncedSearch || undefined);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6" />
            Cashiers
          </h1>
          <p className="text-muted-foreground">Manage your cashiers and their permissions</p>
        </div>
        <CreateCashierDialog />
      </div>

      {/* Search and Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Cashiers</CardTitle>
              <CardDescription>
                {cashiers?.length ?? 0} cashier{cashiers?.length !== 1 ? "s" : ""} total
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filter by branch name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CashiersTable cashiers={cashiers} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
