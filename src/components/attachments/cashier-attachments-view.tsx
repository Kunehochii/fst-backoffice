"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  RefreshCw,
  Filter,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Search,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useAttachments,
  useDeleteAttachment,
  filterAttachmentsByCashier,
  useDebounce,
} from "@/hooks";
import { cn } from "@/utils";
import type { Cashier } from "@/types/auth.types";
import type { Attachment } from "@/types/attachment.types";
import {
  AttachmentType,
  ATTACHMENT_TYPE_LABELS,
  getAttachmentTypeLabel,
  getAttachmentTypeColor,
} from "@/types/attachment.types";
import { AttachmentLightbox } from "./attachment-lightbox";

interface CashierAttachmentsViewProps {
  cashier: Cashier;
  onBack: () => void;
}

export function CashierAttachmentsView({ cashier, onBack }: CashierAttachmentsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [deleteAttachment, setDeleteAttachment] = useState<Attachment | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const {
    data: allAttachments,
    isLoading,
    refetch,
    isFetching,
  } = useAttachments(typeFilter !== "all" ? (typeFilter as AttachmentType) : undefined);

  const { mutate: deleteAttachmentMutation, isPending: isDeleting } = useDeleteAttachment();

  // Filter attachments for this cashier
  const cashierAttachments = useMemo(() => {
    const filtered = filterAttachmentsByCashier(allAttachments, cashier.id);

    // Apply search filter
    if (debouncedSearch) {
      return filtered.filter((attachment) =>
        attachment.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    return filtered;
  }, [allAttachments, cashier.id, debouncedSearch]);

  const handleRefresh = () => {
    refetch();
  };

  const handleDelete = () => {
    if (deleteAttachment) {
      deleteAttachmentMutation(deleteAttachment.id, {
        onSuccess: () => {
          setDeleteAttachment(null);
        },
      });
    }
  };

  // Find current index for lightbox navigation
  const currentIndex = selectedAttachment
    ? cashierAttachments.findIndex((a) => a.id === selectedAttachment.id)
    : -1;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setSelectedAttachment(cashierAttachments[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < cashierAttachments.length - 1) {
      setSelectedAttachment(cashierAttachments[currentIndex + 1]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{cashier.branchName}</h1>
            <p className="text-muted-foreground">View attachments uploaded by this branch</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isFetching}>
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          </Button>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px]">
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
      </div>

      {/* Search and Attachments Grid */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5" />
                Attachments
              </CardTitle>
              <CardDescription>
                {cashierAttachments.length} attachment{cashierAttachments.length !== 1 ? "s" : ""}{" "}
                from this branch
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search attachments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <AttachmentGridSkeleton />
          ) : cashierAttachments.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {cashierAttachments.map((attachment) => (
                <AttachmentCard
                  key={attachment.id}
                  attachment={attachment}
                  onClick={() => setSelectedAttachment(attachment)}
                  onDelete={() => setDeleteAttachment(attachment)}
                />
              ))}
            </div>
          ) : (
            <EmptyAttachmentsState hasSearch={!!debouncedSearch} hasFilter={typeFilter !== "all"} />
          )}
        </CardContent>
      </Card>

      {/* Lightbox */}
      <AttachmentLightbox
        attachment={selectedAttachment}
        open={!!selectedAttachment}
        onOpenChange={(open) => !open && setSelectedAttachment(null)}
        onPrevious={currentIndex > 0 ? handlePrevious : undefined}
        onNext={currentIndex < cashierAttachments.length - 1 ? handleNext : undefined}
        currentIndex={currentIndex}
        totalCount={cashierAttachments.length}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteAttachment}
        onOpenChange={(open) => !open && setDeleteAttachment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteAttachment?.name}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface AttachmentCardProps {
  attachment: Attachment;
  onClick: () => void;
  onDelete: () => void;
}

function AttachmentCard({ attachment, onClick, onDelete }: AttachmentCardProps) {
  const isImage = isImageUrl(attachment.url);

  return (
    <div className="group relative rounded-lg border bg-card overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all">
      {/* Image/Preview */}
      <button
        onClick={onClick}
        className="relative w-full aspect-square bg-muted/50 flex items-center justify-center overflow-hidden"
      >
        {isImage ? (
          <Image
            src={attachment.url}
            alt={attachment.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            unoptimized
          />
        ) : (
          <FileText className="h-12 w-12 text-muted-foreground" />
        )}
      </button>

      {/* Info overlay */}
      <div className="p-2 space-y-1">
        <p className="text-xs font-medium truncate" title={attachment.name}>
          {attachment.name}
        </p>
        <Badge variant="outline" className={cn("text-xs", getAttachmentTypeColor(attachment.type))}>
          {getAttachmentTypeLabel(attachment.type)}
        </Badge>
      </div>

      {/* Delete button */}
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function AttachmentGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-lg border overflow-hidden">
          <Skeleton className="aspect-square w-full" />
          <div className="p-2 space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface EmptyAttachmentsStateProps {
  hasSearch: boolean;
  hasFilter: boolean;
}

function EmptyAttachmentsState({ hasSearch, hasFilter }: EmptyAttachmentsStateProps) {
  if (hasSearch || hasFilter) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 bg-muted/50 rounded-full mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">No attachments found</p>
        <p className="text-sm text-muted-foreground/70">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-4 bg-muted/50 rounded-full mb-4">
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-lg font-medium text-muted-foreground">No attachments yet</p>
      <p className="text-sm text-muted-foreground/70">
        Attachments uploaded by this branch will appear here
      </p>
    </div>
  );
}

/**
 * Check if URL is an image based on extension or common patterns
 */
function isImageUrl(url: string): boolean {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"];
  const lowercaseUrl = url.toLowerCase();
  return imageExtensions.some((ext) => lowercaseUrl.includes(ext));
}
