"use client";

import { ChevronRight, X } from "lucide-react";

interface StudentsContextBarProps {
  gradeName: string;
  studentName: string;
  admissionNumber?: string;
  onClear: () => void;
}

export function StudentsContextBar({
  gradeName,
  studentName,
  admissionNumber,
  onClear,
}: StudentsContextBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
        <span>{gradeName}</span>
        <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" />
        <span className="font-medium text-slate-800 dark:text-slate-100">
          {studentName}
        </span>
        {admissionNumber && (
          <span className="text-slate-400">· {admissionNumber}</span>
        )}
      </div>
      <button
        type="button"
        onClick={onClear}
        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        aria-label="Back to list"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
