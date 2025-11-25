"use client";

import * as React from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const defaultRequirements: PasswordRequirement[] = [
  { label: "At least 6 characters", test: (pwd) => pwd.length >= 6 },
];

interface PasswordInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  showRequirements?: boolean;
  requirements?: PasswordRequirement[];
}

function PasswordInput({
  className,
  showRequirements = false,
  requirements = defaultRequirements,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const value = (props.value as string) || "";

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          data-slot="input"
          className={cn(
            "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-10 w-full min-w-0 rounded-md border bg-muted/50 px-3 py-2 pr-10 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:ring-primary/50 focus-visible:bg-background focus-visible:border-primary/50 focus-visible:ring-4",
            "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
            className
          )}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          disabled={props.disabled}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
        </Button>
      </div>
      {showRequirements && value.length > 0 && (
        <div className="space-y-1">
          {requirements.map((req, index) => {
            const isMet = req.test(value);
            return (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-2 text-xs transition-colors",
                  isMet ? "text-green-600 dark:text-green-500" : "text-muted-foreground"
                )}
              >
                {isMet ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3" />
                )}
                <span>{req.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { PasswordInput, type PasswordRequirement };
