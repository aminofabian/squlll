"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  LayoutGrid,
  Search,
  Users,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  filterClassRows,
  visibleStreams,
  type ClassDirectory,
  type ClassRow,
} from "../utils/classDirectory";
import { classHealthMeta } from "./classHealth";

interface ClassesSidebarProps {
  directory: ClassDirectory;
  selectedGradeId: string;
  selectedStreamId: string;
  onSelectGrade: (gradeId: string, levelId: string) => void;
  onSelectStream: (streamId: string, gradeId: string, levelId: string) => void;
  onSelectAll: () => void;
  isLoading?: boolean;
  surface?: "sidebar" | "drawer";
  className?: string;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.isContentEditable
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const term = query.trim();
  if (!term) return <>{text}</>;
  const index = text.toLowerCase().indexOf(term.toLowerCase());
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <span className="rounded-[3px] bg-[#246a59]/15 px-0.5 font-semibold text-[#0a1f1a] dark:bg-[#8fe3c8]/20 dark:text-white">
        {text.slice(index, index + term.length)}
      </span>
      {text.slice(index + term.length)}
    </>
  );
}

function monogram(row: ClassRow) {
  const label = row.displayName || row.name;
  const words = label.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export function ClassesSidebar({
  directory,
  selectedGradeId,
  selectedStreamId,
  onSelectGrade,
  onSelectStream,
  onSelectAll,
  isLoading = false,
  surface = "sidebar",
  className,
}: ClassesSidebarProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (isTypingTarget(event.target)) return;
      // There can be two sidebars mounted (desktop rail + mobile drawer).
      // Only steal focus when this instance is actually visible.
      if (!inputRef.current || inputRef.current.offsetParent === null) return;
      event.preventDefault();
      inputRef.current.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredRows = useMemo(
    () => filterClassRows(directory.rows, search),
    [directory.rows, search],
  );

  const filteredLevels = useMemo(() => {
    const allowed = new Set(filteredRows.map((row) => row.gradeId));
    return directory.levels
      .map((level) => ({
        ...level,
        rows: level.rows.filter((row) => allowed.has(row.gradeId)),
      }))
      .filter((level) => level.rows.length > 0);
  }, [directory.levels, filteredRows]);

  const isSearching = search.trim().length > 0;
  const isDrawer = surface === "drawer";

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col bg-[#f8fbfa] dark:bg-[#071411]",
        className,
      )}
    >
      <div
        className={cn(
          "shrink-0 border-b border-[#1a4d42]/10 dark:border-white/10",
          isDrawer ? "px-4 pb-3 pt-1" : "px-3 py-3",
        )}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#246a59] dark:text-[#8fe3c8]">
            Classes
          </p>
          <span className="rounded-full border border-[#1a4d42]/10 bg-white px-2 py-0.5 text-[10px] font-semibold tabular-nums text-[#1a4d42]/55 dark:border-white/10 dark:bg-[#0c1a17] dark:text-white/50">
            {isSearching
              ? `${filteredRows.length}/${directory.rows.length}`
              : directory.rows.length}
          </span>
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#1a4d42]/40 dark:text-white/35"
            aria-hidden
          />
          <Input
            ref={inputRef}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setSearch("");
                event.currentTarget.blur();
              }
            }}
            placeholder="Search classes, streams…"
            aria-label="Search classes by name, level or stream"
            autoComplete="off"
            className="h-9 border-[#1a4d42]/12 bg-white pl-8 pr-8 text-[13px] shadow-sm placeholder:text-[#1a4d42]/40 focus-visible:border-[#246a59]/50 focus-visible:ring-[#246a59]/20 dark:border-white/10 dark:bg-[#0c1a17] dark:placeholder:text-white/35"
          />
          {isSearching ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear class search"
              className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#1a4d42]/40 transition-colors hover:bg-[#e8f2ef] hover:text-[#0a1f1a] dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <p className="mt-1.5 flex items-center justify-between gap-2 text-[10px] text-[#1a4d42]/45 dark:text-white/40">
          <span>Pick a class to open its profile</span>
          {!isSearching && directory.rows.length > 4 ? (
            <kbd className="hidden shrink-0 rounded border border-[#1a4d42]/12 bg-white px-1.5 py-0.5 font-sans text-[9px] font-semibold text-[#1a4d42]/45 dark:border-white/10 dark:bg-[#0c1a17] dark:text-white/40 sm:inline">
              /
            </kbd>
          ) : null}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2">
        <button
          type="button"
          onClick={onSelectAll}
          className={cn(
            "mb-2 flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
            !selectedGradeId
              ? "border-[#0a1f1a] bg-[#0a1f1a] text-white shadow-[0_1px_2px_rgba(10,31,26,0.18)]"
              : "border-[#1a4d42]/12 bg-white text-[#0a1f1a] hover:border-[#246a59]/35 hover:bg-[#f3f7f5] dark:border-white/10 dark:bg-[#0c1a17] dark:text-white dark:hover:bg-white/5",
          )}
        >
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
              !selectedGradeId
                ? "border-white/15 bg-white/10 text-[#8fe3c8]"
                : "border-[#1a4d42]/10 bg-[#f3f7f5] text-[#246a59] dark:border-white/10 dark:bg-white/5 dark:text-[#8fe3c8]",
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] font-semibold tracking-tight">
              All classes
            </span>
            <span
              className={cn(
                "mt-0.5 block text-[10px] tabular-nums",
                !selectedGradeId ? "text-white/60" : "text-[#1a4d42]/45 dark:text-white/40",
              )}
            >
              {directory.totalClasses} classes · {directory.totalStudents}{" "}
              learners
            </span>
          </span>
          {!selectedGradeId ? (
            <Check className="h-3.5 w-3.5 shrink-0 text-[#8fe3c8]" strokeWidth={2.5} />
          ) : null}
        </button>

        {isLoading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-lg bg-[#e8f2ef] dark:bg-white/5"
              />
            ))}
          </div>
        ) : filteredLevels.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#1a4d42]/15 px-3 py-8 text-center dark:border-white/15">
            <p className="text-xs font-medium text-[#1a4d42]/70 dark:text-white/60">
              No classes match “{search.trim()}”
            </p>
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-2 text-[11px] font-semibold text-[#246a59] underline-offset-2 hover:underline dark:text-[#8fe3c8]"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLevels.map((level) => (
              <section key={level.id}>
                <div className="mb-1 flex items-center justify-between gap-2 px-1">
                  <p className="truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-[#1a4d42]/45 dark:text-white/35">
                    {level.name}
                  </p>
                  <span className="text-[9px] font-semibold tabular-nums text-[#1a4d42]/30 dark:text-white/25">
                    {level.rows.length}
                  </span>
                </div>
                <ul className="space-y-1">
                  {level.rows.map((row) => (
                    <ClassRowButton
                      key={row.gradeId}
                      row={row}
                      query={search}
                      selectedGradeId={selectedGradeId}
                      selectedStreamId={selectedStreamId}
                      onSelectGrade={onSelectGrade}
                      onSelectStream={onSelectStream}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#1a4d42]/10 px-3 py-2 dark:border-white/10">
        <p className="flex items-center gap-1.5 text-[10px] text-[#1a4d42]/45 dark:text-white/35">
          <Users className="h-3 w-3" />
          {directory.totalStudents} learners across {directory.rows.length}{" "}
          grades
        </p>
      </div>
    </div>
  );
}

function ClassRowButton({
  row,
  query,
  selectedGradeId,
  selectedStreamId,
  onSelectGrade,
  onSelectStream,
}: {
  row: ClassRow;
  query: string;
  selectedGradeId: string;
  selectedStreamId: string;
  onSelectGrade: ClassesSidebarProps["onSelectGrade"];
  onSelectStream: ClassesSidebarProps["onSelectStream"];
}) {
  const active = selectedGradeId === row.gradeId;
  const streams = visibleStreams(row, query);
  const health = classHealthMeta[row.health];
  const hasStreams = row.streams.length > 0;

  return (
    <li>
      <div
        className={cn(
          "rounded-lg border transition-colors",
          active
            ? "border-[#246a59]/35 bg-white shadow-[0_1px_2px_rgba(10,31,26,0.05)] dark:border-[#246a59]/50 dark:bg-[#0c1a17]"
            : "border-transparent hover:border-[#1a4d42]/10 hover:bg-white dark:hover:border-white/10 dark:hover:bg-white/[0.04]",
        )}
      >
        <button
          type="button"
          onClick={() => onSelectGrade(row.gradeId, row.levelId)}
          aria-current={active ? "true" : undefined}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246a59]/35"
        >
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[10px] font-bold tracking-tight transition-colors",
              active
                ? "border-[#0a1f1a] bg-[#0a1f1a] text-white dark:border-[#246a59] dark:bg-[#246a59]"
                : "border-[#1a4d42]/10 bg-[#f3f7f5] text-[#1a4d42]/70 dark:border-white/10 dark:bg-white/5 dark:text-white/60",
            )}
          >
            {monogram(row)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  "truncate text-[12px] font-semibold tracking-tight",
                  active
                    ? "text-[#0a1f1a] dark:text-white"
                    : "text-[#1a4d42]/80 dark:text-white/70",
                )}
              >
                <Highlight text={row.displayName} query={query} />
              </span>
              <span
                className={cn("h-1.5 w-1.5 shrink-0 rounded-full", health.dot)}
                title={`${health.label} — ${health.description}`}
                aria-label={health.label}
              />
            </span>
            <span className="mt-0.5 block truncate text-[10px] tabular-nums text-[#1a4d42]/45 dark:text-white/35">
              {row.studentCount} learner{row.studentCount === 1 ? "" : "s"}
              {hasStreams ? ` · ${row.streams.length} streams` : ""}
              {row.totalSubjects > 0
                ? ` · ${row.assignedSubjects}/${row.totalSubjects} staffed`
                : ""}
            </span>
          </span>
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-[#1a4d42]/30 transition-transform dark:text-white/25",
              active && "rotate-90 text-[#246a59] dark:text-[#8fe3c8]",
            )}
          />
        </button>

        {active && hasStreams ? (
          <div className="px-2 pb-2">
            <div className="flex flex-wrap gap-1">
              <StreamPill
                label="All"
                count={row.studentCount}
                active={!selectedStreamId}
                onClick={() => onSelectStream("", row.gradeId, row.levelId)}
              />
              {streams.map((stream) => (
                <StreamPill
                  key={stream.id}
                  label={stream.name}
                  count={row.streamCounts[stream.id] ?? 0}
                  active={selectedStreamId === stream.id}
                  onClick={() =>
                    onSelectStream(stream.id, row.gradeId, row.levelId)
                  }
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </li>
  );
}

function StreamPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={`${label}: ${count} learner${count === 1 ? "" : "s"}`}
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-md border px-1.5 py-1 text-[10px] font-semibold transition-colors",
        active
          ? "border-[#246a59] bg-[#246a59] text-white dark:border-[#8fe3c8] dark:bg-[#246a59]"
          : "border-[#1a4d42]/12 bg-[#f8fbfa] text-[#1a4d42]/65 hover:border-[#246a59]/35 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white/55 dark:hover:bg-white/10",
      )}
    >
      <span className="truncate">{label}</span>
      <span
        className={cn(
          "rounded px-1 text-[9px] tabular-nums",
          active
            ? "bg-white/20 text-white"
            : "bg-[#1a4d42]/8 text-[#1a4d42]/45 dark:bg-white/10 dark:text-white/35",
        )}
      >
        {count}
      </span>
    </button>
  );
}
