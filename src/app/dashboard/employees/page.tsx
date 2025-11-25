"use client";

import { useState } from "react";
import { Search, Users2, FolderKanban } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CashierFolderCard, UnassignedEmployeesCard } from "@/components/employees";
import { useCashiers, useEmployeesByCashier, useDebounce } from "@/hooks";

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: cashiers, isLoading: cashiersLoading } = useCashiers();
  const {
    data: employeesByCashier,
    employees,
    isLoading: employeesLoading,
  } = useEmployeesByCashier();

  const isLoading = cashiersLoading || employeesLoading;

  // Filter cashiers based on search
  const filteredCashiers = cashiers?.filter(
    (cashier) =>
      cashier.branchName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      cashier.username.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // Get unassigned employees
  const unassignedEmployees = employeesByCashier?.["unassigned"] || [];

  // Get total employee count
  const totalEmployees = employees?.length || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users2 className="h-6 w-6" />
            Employees
          </h1>
          <p className="text-muted-foreground">Manage employees across your branches</p>
        </div>
      </div>

      {/* Stats & Search Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5" />
                Branch Folders
              </CardTitle>
              <CardDescription>
                {totalEmployees} employee{totalEmployees !== 1 ? "s" : ""} across{" "}
                {cashiers?.length || 0} branch{(cashiers?.length || 0) !== 1 ? "es" : ""}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <FoldersSkeleton />
          ) : (
            <div className="space-y-4">
              {/* Unassigned employees card - show at top if any */}
              <UnassignedEmployeesCard
                employees={unassignedEmployees}
                isLoading={employeesLoading}
              />

              {/* Cashier folder cards */}
              {filteredCashiers && filteredCashiers.length > 0 ? (
                filteredCashiers.map((cashier) => (
                  <CashierFolderCard
                    key={cashier.id}
                    cashier={cashier}
                    employees={employeesByCashier?.[cashier.id] || []}
                    isLoading={employeesLoading}
                  />
                ))
              ) : (
                <EmptyState hasSearch={!!debouncedSearch} />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FoldersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-14 w-14 rounded-xl" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-5" />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  hasSearch: boolean;
}

function EmptyState({ hasSearch }: EmptyStateProps) {
  if (hasSearch) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 bg-muted/50 rounded-full mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">No branches found</p>
        <p className="text-sm text-muted-foreground/70">Try adjusting your search term</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-4 bg-muted/50 rounded-full mb-4">
        <FolderKanban className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-lg font-medium text-muted-foreground">No branches yet</p>
      <p className="text-sm text-muted-foreground/70">
        Create a cashier first to organize your employees by branch
      </p>
    </div>
  );
}
