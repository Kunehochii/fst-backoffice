"use client";

import { User, MoreVertical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditEmployeeDialog } from "./edit-employee-dialog";
import { DeleteEmployeeDialog } from "./delete-employee-dialog";
import type { Employee } from "@/types/employee.types";
import { useState } from "react";

interface EmployeeListProps {
  employees: Employee[];
  isLoading?: boolean;
  cashierId: string;
}

export function EmployeeList({ employees, isLoading, cashierId }: EmployeeListProps) {
  if (isLoading) {
    return <EmployeeListSkeleton />;
  }

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="p-3 bg-muted/50 rounded-full mb-3">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No employees yet</p>
        <p className="text-xs text-muted-foreground/70">
          Create your first employee for this branch
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {employees.map((employee) => (
        <EmployeeItem key={employee.id} employee={employee} />
      ))}
    </div>
  );
}

interface EmployeeItemProps {
  employee: Employee;
}

function EmployeeItem({ employee }: EmployeeItemProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{employee.name}</span>
            <span className="text-xs text-muted-foreground">
              Added {new Date(employee.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditEmployeeDialog employee={employee} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteEmployeeDialog employee={employee} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}

function EmployeeListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}
