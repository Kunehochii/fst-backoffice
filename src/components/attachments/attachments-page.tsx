"use client";

import { useState } from "react";
import { Search, Paperclip, Store, ChevronRight, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCashiers, useDebounce, useAttachments, filterAttachmentsByCashier } from "@/hooks";
import { AttachmentType, ATTACHMENT_TYPE_LABELS } from "@/types/attachment.types";
import type { Cashier } from "@/types/auth.types";

interface AttachmentsPageProps {
  onSelectCashier: (cashier: Cashier) => void;
}

export function AttachmentsPage({ onSelectCashier }: AttachmentsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: cashiers, isLoading: cashiersLoading } = useCashiers();
  const { data: attachments, isLoading: attachmentsLoading } = useAttachments(
    typeFilter !== "all" ? (typeFilter as AttachmentType) : undefined
  );

  const isLoading = cashiersLoading || attachmentsLoading;

  // Filter cashiers based on search
  const filteredCashiers = cashiers?.filter(
    (cashier) =>
      cashier.branchName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      cashier.username.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // Get attachment count per cashier
  const getAttachmentCount = (cashierId: string) => {
    if (!attachments) return 0;
    return filterAttachmentsByCashier(attachments, cashierId).length;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Paperclip className="h-6 w-6" />
            Attachments
          </h1>
          <p className="text-muted-foreground">
            View and manage attachments uploaded by your cashiers
          </p>
        </div>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[240px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(ATTACHMENT_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Branch Selection Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Select a Branch
              </CardTitle>
              <CardDescription>Choose a branch to view their uploaded attachments</CardDescription>
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
            <BranchListSkeleton />
          ) : filteredCashiers && filteredCashiers.length > 0 ? (
            <div className="space-y-2">
              {filteredCashiers.map((cashier) => (
                <BranchCard
                  key={cashier.id}
                  cashier={cashier}
                  attachmentCount={getAttachmentCount(cashier.id)}
                  onClick={() => onSelectCashier(cashier)}
                />
              ))}
            </div>
          ) : (
            <EmptyState hasSearch={!!debouncedSearch} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface BranchCardProps {
  cashier: Cashier;
  attachmentCount: number;
  onClick: () => void;
}

function BranchCard({ cashier, attachmentCount, onClick }: BranchCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left group"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Store className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{cashier.branchName}</h3>
          <p className="text-sm text-muted-foreground">@{cashier.username}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">
            {attachmentCount} attachment{attachmentCount !== 1 ? "s" : ""}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </button>
  );
}

function BranchListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
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
        <Store className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-lg font-medium text-muted-foreground">No branches yet</p>
      <p className="text-sm text-muted-foreground/70">
        Create a cashier first to start viewing attachments
      </p>
    </div>
  );
}
