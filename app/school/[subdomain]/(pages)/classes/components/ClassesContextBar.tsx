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
      className="inline-flex max-w-full items-center gap-1.5 rounded-none border border-[#1a4d42]/12 bg-white px-2.5 py-1.5 text-left text-xs text-[#1a4d42]/65 transition-colors hover:bg-[#f8fbfa] dark:border-white/15 dark:bg-[#0c1a17] dark:text-[#1a4d42]/30 dark:hover:bg-slate-800/40"
    >
      <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-[#1a4d42]/45" />
      <span className="truncate">
        <span className="text-[#1a4d42]/45">Back · </span>
        {trail}
      </span>
    </button>
  );
}
