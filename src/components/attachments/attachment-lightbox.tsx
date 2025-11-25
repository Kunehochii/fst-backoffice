"use client";

import { useEffect, useCallback, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { cn, formatLocalDateTime } from "@/utils";
import type { Attachment } from "@/types/attachment.types";
import { getAttachmentTypeLabel, getAttachmentTypeColor } from "@/types/attachment.types";
import { useState } from "react";

interface AttachmentLightboxProps {
  attachment: Attachment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalCount?: number;
}

export function AttachmentLightbox({
  attachment,
  open,
  onOpenChange,
  onPrevious,
  onNext,
  currentIndex,
  totalCount,
}: AttachmentLightboxProps) {
  const [zoom, setZoom] = useState(1);
  const isImage = attachment ? isImageUrl(attachment.url) : false;
  const prevAttachmentIdRef = useRef<string | null>(null);

  // Reset zoom when attachment changes (using ref to avoid lint warning)
  if (attachment?.id !== prevAttachmentIdRef.current) {
    prevAttachmentIdRef.current = attachment?.id ?? null;
    if (zoom !== 1) {
      setZoom(1);
    }
  }

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case "ArrowLeft":
          onPrevious?.();
          break;
        case "ArrowRight":
          onNext?.();
          break;
        case "Escape":
          onOpenChange(false);
          break;
        case "+":
        case "=":
          setZoom((z) => Math.min(z + 0.25, 3));
          break;
        case "-":
          setZoom((z) => Math.max(z - 0.25, 0.5));
          break;
      }
    },
    [open, onPrevious, onNext, onOpenChange]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleDownload = () => {
    if (!attachment) return;
    const link = document.createElement("a");
    link.href = attachment.url;
    link.download = attachment.name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenExternal = () => {
    if (!attachment) return;
    window.open(attachment.url, "_blank");
  };

  if (!attachment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <DialogTitle className="truncate text-base">{attachment.name}</DialogTitle>
            <Badge
              variant="outline"
              className={cn("shrink-0 text-xs", getAttachmentTypeColor(attachment.type))}
            >
              {getAttachmentTypeLabel(attachment.type)}
            </Badge>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {/* Counter */}
            {currentIndex !== undefined && totalCount !== undefined && totalCount > 1 && (
              <span className="text-sm text-muted-foreground mr-2">
                {currentIndex + 1} / {totalCount}
              </span>
            )}

            {/* Zoom controls (only for images) */}
            {isImage && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Download */}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>

            {/* Open in new tab */}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenExternal}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="relative flex items-center justify-center bg-black/95 min-h-[60vh] max-h-[80vh] overflow-auto">
          {/* Navigation buttons */}
          {onPrevious && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={onPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          {onNext && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={onNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}

          {/* Image or File Preview */}
          {isImage ? (
            <div
              className="relative flex items-center justify-center p-4 overflow-auto"
              style={{ maxWidth: "100%", maxHeight: "80vh", minWidth: "60vw", minHeight: "60vh" }}
            >
              <Image
                src={attachment.url}
                alt={attachment.name}
                fill
                className="object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
                draggable={false}
                unoptimized
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-white">
              <FileText className="h-24 w-24 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">{attachment.name}</p>
              <p className="text-sm text-white/70 mb-4">This file type cannot be previewed</p>
              <div className="flex gap-2">
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={handleOpenExternal}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Browser
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer with metadata */}
        <div className="px-4 py-2 border-t bg-muted/50 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Uploaded: {formatLocalDateTime(attachment.createdAt)}</span>
            <span className="text-xs opacity-70">Use arrow keys to navigate • +/- to zoom</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
