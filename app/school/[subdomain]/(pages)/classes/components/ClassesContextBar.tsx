"use client";

import { ArrowLeft } from "lucide-react";

interface ClassesContextBarProps {
  levelName: string;
  gradeName: string;
  streamName?: string;
  onClear: () => void;
}

export function ClassesContextBar({
  levelName,
  gradeName,
  streamName,
  onClear,
}: ClassesContextBarProps) {
  const trail = [levelName, gradeName, streamName].filter(Boolean).join(" · ");

  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-left text-xs text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:bg-slate-800/40"
    >
      <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      <span className="truncate">
        <span className="text-slate-400">Back · </span>
        {trail}
      </span>
    </button>
  );
}
