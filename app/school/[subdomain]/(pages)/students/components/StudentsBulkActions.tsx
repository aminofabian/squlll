"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import type { StudentRow } from "./StudentsTable";
import { exportStudentsToCsv } from "../utils/exportStudentsCsv";
import { studentsActionButton } from "./students-ui";

interface StudentsBulkActionsProps {
  students: StudentRow[];
}

export function StudentsBulkActions({ students }: StudentsBulkActionsProps) {
  if (students.length === 0) return null;

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    exportStudentsToCsv(students, `students-${date}.csv`);
    toast.success(
      `Exported ${students.length} student${students.length !== 1 ? "s" : ""}`,
    );
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={studentsActionButton}
      onClick={handleExport}
    >
      <Download className="h-3.5 w-3.5 opacity-70" />
      Export student list
      <span className="text-slate-400">({students.length})</span>
    </Button>
  );
}
