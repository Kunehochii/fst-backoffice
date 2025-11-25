"use client";

import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CELL_COLOR_PALETTE, isValidHexColor } from "@/utils/sheet-utils";

interface ColorPickerProps {
  value: string | null;
  onChange: (color: string | null) => void;
  disabled?: boolean;
}

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value || "#FFFFFF");
  const [open, setOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    onChange(color === "#FFFFFF" ? null : color);
    setOpen(false);
  };

  const handleCustomColorChange = (hex: string) => {
    setCustomColor(hex);
    if (isValidHexColor(hex)) {
      onChange(hex === "#FFFFFF" ? null : hex);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" disabled={disabled} className="h-8 w-8">
          <div className="h-4 w-4 rounded border" style={{ backgroundColor: value || "#FFFFFF" }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-3">
          <div className="text-sm font-medium">Cell Color</div>

          {/* Preset colors */}
          <div className="grid grid-cols-5 gap-2">
            {CELL_COLOR_PALETTE.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={cn(
                  "h-8 w-8 rounded border-2 transition-all hover:scale-110",
                  (value || "#FFFFFF") === color
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted"
                )}
                style={{ backgroundColor: color }}
              >
                {(value || "#FFFFFF") === color && (
                  <Check
                    className={cn(
                      "h-4 w-4 mx-auto",
                      color === "#FFFFFF" || color === "#FFFACD" ? "text-gray-600" : "text-white"
                    )}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Custom color input */}
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded border shrink-0"
              style={{
                backgroundColor: isValidHexColor(customColor) ? customColor : "#FFFFFF",
              }}
            />
            <Input
              type="text"
              placeholder="#FFFFFF"
              value={customColor}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              className="font-mono text-sm"
              maxLength={7}
            />
          </div>

          {/* Clear button */}
          {value && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleColorSelect("#FFFFFF")}
            >
              Clear Color
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface CellColorIndicatorProps {
  color: string | null;
  className?: string;
}

export function CellColorIndicator({ color, className }: CellColorIndicatorProps) {
  if (!color) return null;

  return (
    <div
      className={cn("absolute inset-0 pointer-events-none opacity-30", className)}
      style={{ backgroundColor: color }}
    />
  );
}
