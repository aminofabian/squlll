"use client";

import { forwardRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface GradeClassSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
  totalCount?: number;
  className?: string;
  inputClassName?: string;
  id?: string;
  autoFocus?: boolean;
}

export const GradeClassSearch = forwardRef<HTMLInputElement, GradeClassSearchProps>(
  function GradeClassSearch(
    {
      value,
      onChange,
      resultCount,
      totalCount,
      className,
      inputClassName,
      id = "timetable-grade-search",
      autoFocus,
    },
    ref,
  ) {
    const isFiltering = value.trim().length > 0;
    const showCount =
      isFiltering &&
      resultCount != null &&
      totalCount != null &&
      totalCount > 0;

    return (
      <div className={cn("space-y-1.5", className)}>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
            aria-hidden
          />
          <Input
            ref={ref}
            id={id}
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search classes…"
            autoFocus={autoFocus}
            autoComplete="off"
            aria-label="Search classes by name, level, or section"
            className={cn(
              "h-9 border-zinc-200 bg-white pl-8 pr-8 text-[13px] shadow-sm placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/80",
              inputClassName,
            )}
          />
          {isFiltering && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
              aria-label="Clear class search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {showCount && (
          <p className="text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
            {resultCount === 0 ? (
              <>No classes match &ldquo;{value.trim()}&rdquo;</>
            ) : (
              <>
                {resultCount} of {totalCount} class
                {totalCount !== 1 ? "es" : ""}
              </>
            )}
          </p>
        )}
        {!isFiltering && totalCount != null && totalCount > 8 && (
          <p className="text-[10px] text-zinc-400">Press / to focus search</p>
        )}
      </div>
    );
  },
);
