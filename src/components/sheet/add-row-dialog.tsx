"use client";

import { useState } from "react";
import { Plus, CalendarIcon } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface AddRowDialogProps {
  onAddRows: (options: { rowCount: number; customDate?: Date }) => void;
  isLoading?: boolean;
  currentDate: Date;
}

export function AddRowDialog({ onAddRows, isLoading, currentDate }: AddRowDialogProps) {
  const [open, setOpen] = useState(false);
  const [rowCount, setRowCount] = useState(1);
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [customDate, setCustomDate] = useState<Date>(currentDate);

  const handleSubmit = () => {
    onAddRows({
      rowCount,
      customDate: useCustomDate ? customDate : undefined,
    });
    // Reset form
    setRowCount(1);
    setUseCustomDate(false);
    setCustomDate(currentDate);
    setOpen(false);
  };

  const canSubmit = !isLoading && rowCount > 0 && rowCount <= 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Row
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Rows</DialogTitle>
          <DialogDescription>
            Add rows to the sheet. You can optionally specify a custom date for the rows.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Row Count */}
          <div className="space-y-2">
            <Label htmlFor="row-count">Number of Rows</Label>
            <Input
              id="row-count"
              type="number"
              min={1}
              max={100}
              value={rowCount}
              onChange={(e) =>
                setRowCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))
              }
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Enter a number between 1 and 100</p>
          </div>

          {/* Custom Date Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="custom-date">Custom Date</Label>
              <p className="text-sm text-muted-foreground">Add rows to a different date</p>
            </div>
            <Switch id="custom-date" checked={useCustomDate} onCheckedChange={setUseCustomDate} />
          </div>

          {/* Date Picker (shown only when custom date is enabled) */}
          {useCustomDate && (
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !customDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDate ? format(customDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customDate}
                    onSelect={(date) => date && setCustomDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isLoading ? "Adding..." : `Add ${rowCount} Row${rowCount > 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
