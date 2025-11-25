"use client";

import { useState } from "react";
import { Inbox, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmployeeList } from "./employee-list";
import type { Employee } from "@/types/employee.types";

interface UnassignedEmployeesCardProps {
  employees: Employee[];
  isLoading?: boolean;
}

export function UnassignedEmployeesCard({ employees, isLoading }: UnassignedEmployeesCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (employees.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Card
      className={cn(
        "transition-all duration-300 cursor-pointer group border-dashed",
        isOpen && "ring-2 ring-muted-foreground/20"
      )}
    >
      <CardHeader className="pb-3" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "relative p-3 rounded-xl transition-all duration-300",
                isOpen
                  ? "bg-muted text-muted-foreground"
                  : "bg-muted/30 text-muted-foreground/70 group-hover:bg-muted/50"
              )}
            >
              <Inbox className="h-8 w-8" />
              {/* Employee count badge */}
              <div
                className={cn(
                  "absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
                  "bg-muted-foreground/20 text-muted-foreground"
                )}
              >
                {employees.length}
              </div>
            </div>
            <div className="flex flex-col">
              <h3 className="font-semibold text-lg text-muted-foreground">Unassigned</h3>
              <span className="text-sm text-muted-foreground/70">
                {employees.length} employee{employees.length !== 1 ? "s" : ""} not assigned to any
                branch
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              No Branch
            </Badge>
            <ChevronRight
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-300",
                isOpen && "rotate-90"
              )}
            />
          </div>
        </div>
      </CardHeader>

      {/* Expandable content */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <CardContent className="pt-0 pb-4">
            <div className="border-t border-dashed pt-4">
              <p className="text-xs text-muted-foreground mb-4">
                These employees can be assigned to a branch by editing them.
              </p>
              <EmployeeList employees={employees} isLoading={isLoading} cashierId="" />
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
