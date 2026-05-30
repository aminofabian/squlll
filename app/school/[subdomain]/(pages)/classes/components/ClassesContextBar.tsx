"use client";

import { ChevronRight, X } from "lucide-react";
import { ClassActionBar, type ClassAction } from "./ClassActionBar";

interface ClassesContextBarProps {
  levelName: string;
  gradeName: string;
  streamName?: string;
  onClear: () => void;
  actions: ClassAction[];
}

export function ClassesContextBar({
  levelName,
  gradeName,
  streamName,
  onClear,
  actions,
}: ClassesContextBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
        <span>{levelName}</span>
        <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" />
        <span className="font-medium text-slate-800 dark:text-slate-100">
          {gradeName}
        </span>
        {streamName && (
          <>
            <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" />
            <span className="font-medium text-slate-800 dark:text-slate-100">
              {streamName}
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ClassActionBar actions={actions} layout="links" />
        <button
          type="button"
          onClick={onClear}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          aria-label="Clear selection"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
