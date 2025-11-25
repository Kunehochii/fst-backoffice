"use client";

import { useState } from "react";
import { Folder, FolderOpen, Users, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmployeeList } from "./employee-list";
import { CreateEmployeeDialog } from "./create-employee-dialog";
import type { Cashier } from "@/types/auth.types";
import type { Employee } from "@/types/employee.types";

interface CashierFolderCardProps {
  cashier: Cashier;
  employees: Employee[];
  isLoading?: boolean;
}

export function CashierFolderCard({ cashier, employees, isLoading }: CashierFolderCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card
      className={cn(
        "transition-all duration-300 cursor-pointer group",
        isOpen && "ring-2 ring-primary/20"
      )}
    >
      <CardHeader className="pb-3" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "relative p-3 rounded-xl transition-all duration-300",
                isOpen
                  ? "bg-primary/10 text-primary"
                  : "bg-muted/50 text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary/70"
              )}
            >
              {isOpen ? <FolderOpen className="h-8 w-8" /> : <Folder className="h-8 w-8" />}
              {/* Employee count badge */}
              <div
                className={cn(
                  "absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold transition-colors",
                  isOpen
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted-foreground/20 text-muted-foreground"
                )}
              >
                {employees.length}
              </div>
            </div>
            <div className="flex flex-col">
              <h3 className="font-semibold text-lg">{cashier.branchName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {employees.length} employee{employees.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:inline-flex">
              @{cashier.username}
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
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Employees in {cashier.branchName}
                </h4>
                <CreateEmployeeDialog cashierId={cashier.id} branchName={cashier.branchName} />
              </div>
              <EmployeeList employees={employees} isLoading={isLoading} cashierId={cashier.id} />
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
