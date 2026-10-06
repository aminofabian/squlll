"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StudentRow } from "./StudentsTable";
import {
  exportStudentsToCsv,
  exportStudentsToJson,
} from "../utils/exportStudentsCsv";
import { studentsActionButton } from "./students-ui";

interface StudentsBulkActionsProps {
  students: StudentRow[];
}

export function StudentsBulkActions({ students }: StudentsBulkActionsProps) {
  if (students.length === 0) return null;

  const date = new Date().toISOString().slice(0, 10);
  const summary = `Exported ${students.length} student${students.length !== 1 ? "s" : ""}`;

  const handleCsv = () => {
    exportStudentsToCsv(students, `students-${date}.csv`);
    toast.success(summary);
  };

  const handleJson = () => {
    exportStudentsToJson(students, `students-${date}.json`);
    toast.success(summary);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={studentsActionButton}
        >
          <Download className="h-3.5 w-3.5 opacity-70" />
          Export student list
          <span className="text-slate-400">({students.length})</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-none">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-slate-400">
          Download as
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCsv} className="gap-2 text-xs">
          <FileSpreadsheet className="h-3.5 w-3.5 opacity-70" />
          CSV spreadsheet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleJson} className="gap-2 text-xs">
          <FileJson className="h-3.5 w-3.5 opacity-70" />
          JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
