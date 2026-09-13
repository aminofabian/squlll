"use client";

import { forwardRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";

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
            className={cn(
              "pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2",
              tt.ink.faint,
            )}
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
              "h-9 border-[#1a4d42]/12 bg-white pl-8 pr-8 shadow-sm placeholder:text-[#1a4d42]/40 dark:border-white/10 dark:bg-[#0c1a17] dark:placeholder:text-white/35",
              tt.text.body,
              inputClassName,
            )}
          />
          {isFiltering && (
            <button
              type="button"
              onClick={() => onChange("")}
              className={cn(
                "absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-none hover:bg-[#e8f2ef] hover:text-[#0a1f1a] dark:hover:bg-white/10 dark:hover:text-white",
                tt.ink.faint,
                tt.focus,
              )}
              aria-label="Clear class search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {showCount && (
          <p className={cn(tt.text.caption, tt.numeral, tt.ink.muted)}>
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
          <p className={cn(tt.text.micro, tt.ink.faint)}>Press / to focus search</p>
        )}
      </div>
    );
  },
);
