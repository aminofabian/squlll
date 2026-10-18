"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Award,
  Crown,
  Loader2,
  Medal,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { classesActionButton, classesPanel, classesSectionHead } from "./classes-ui";
import {
  initials,
  type ClassPerformance,
  type RankingRowLike,
} from "../utils/classPulse";

interface ClassMeritBoardProps {
  performance: ClassPerformance & {
    sessionName?: string | null;
    isLoading?: boolean;
    isError?: boolean;
    hasAnySession?: boolean;
  };
  streamName?: string;
  className?: string;
}

const podiumStyles = [
  {
    // second place
    ring: "ring-slate-300/70 dark:ring-slate-500/60",
    chip: "bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-200",
    bar: "bg-slate-200/80 dark:bg-slate-700/70",
    height: "h-16",
    icon: Medal,
    label: "2nd",
  },
  {
    // first place
    ring: "ring-amber-400/80",
    chip: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
    bar: "bg-gradient-to-t from-amber-300/80 to-amber-200/40 dark:from-amber-500/40 dark:to-amber-400/10",
    height: "h-24",
    icon: Crown,
    label: "1st",
  },
  {
    // third place
    ring: "ring-orange-300/70 dark:ring-orange-500/40",
    chip: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200",
    bar: "bg-orange-200/70 dark:bg-orange-800/40",
    height: "h-12",
    icon: Award,
    label: "3rd",
  },
];

function positionOf(row: RankingRowLike, streamScoped: boolean) {
  return (streamScoped ? row.streamPosition : row.gradePosition) ?? null;
}

export function ClassMeritBoard({
  performance,
  streamName,
  className,
}: ClassMeritBoardProps) {
  const scoped = Boolean(streamName);
  const topThree = performance.top.slice(0, 3);
  const rest = performance.top.slice(3);
  const podiumSlots = [
    { row: topThree[1], style: podiumStyles[0], place: 2 },
    { row: topThree[0], style: podiumStyles[1], place: 1 },
    { row: topThree[2], style: podiumStyles[2], place: 3 },
  ].filter(
    (slot): slot is { row: RankingRowLike; style: (typeof podiumStyles)[number]; place: number } =>
      Boolean(slot.row),
  );

  return (
    <section
      className={cn(classesPanel, className)}
    >
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5",
          classesSectionHead,
        )}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
            <Trophy className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-[#0a1f1a] dark:text-white">
              Merit board
            </h3>
            <p className="text-[10px] text-[#1a4d42]/50 dark:text-white/40">
              {performance.sessionName
                ? `${performance.sessionName}${streamName ? ` · ${streamName}` : ""}`
                : "Top performers in the latest exam"}
            </p>
          </div>
        </div>
        <Link
          href="/exams"
          className={cn(classesActionButton, "h-7 px-2 text-[10px]")}
        >
          Exams
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {performance.isLoading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-[11px] text-[#1a4d42]/45 dark:text-white/40">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading merit list…
        </div>
      ) : performance.isError ? (
        <div className="px-4 py-10 text-center text-[11px] text-[#1a4d42]/50 dark:text-white/40">
          We couldn’t load exam rankings right now.
        </div>
      ) : performance.top.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-9 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
            <Trophy className="h-5 w-5" />
          </span>
          <p className="mt-3 text-sm font-semibold text-[#0a1f1a] dark:text-white">
            {performance.hasAnySession
              ? "No processed results yet"
              : "No exam sessions yet"}
          </p>
          <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-[#1a4d42]/55 dark:text-white/45">
            {performance.hasAnySession
              ? "Run results processing on this term’s exam to reveal the class merit list."
              : "Create an exam session and enter marks — top performers will appear here automatically."}
          </p>
          <Link
            href="/exams"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#0a1f1a] px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#246a59]"
          >
            Open exams
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <>
          <div className="px-4 pt-4 sm:px-5">
            <div className="flex items-end justify-center gap-2 sm:gap-4">
              {podiumSlots.map(({ row, style, place }) => {
                const Icon = style.icon;
                const position = positionOf(row, scoped) ?? place;
                return (
                  <div
                    key={row.studentId}
                    className="flex min-w-0 flex-1 flex-col items-center sm:max-w-[9rem]"
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f7f5] text-[11px] font-bold text-[#1a4d42]/70 ring-2 dark:bg-white/5 dark:text-white/70 sm:h-11 sm:w-11",
                        style.ring,
                      )}
                      title={row.studentName}
                    >
                      {initials(row.studentName)}
                    </span>
                    <p className="mt-1.5 w-full truncate text-center text-[11px] font-semibold text-[#0a1f1a] dark:text-white">
                      {row.studentName.split(" ")[0]}
                    </p>
                    <p className="text-[10px] font-semibold tabular-nums text-[#246a59] dark:text-[#8fe3c8]">
                      {row.meanPercentage.toFixed(1)}%
                    </p>
                    <div
                      className={cn(
                        "mt-1.5 flex w-full flex-col items-center justify-center rounded-t-lg border border-b-0 border-[#1a4d42]/8 dark:border-white/10",
                        style.bar,
                        style.height,
                      )}
                    >
                      <span
                        className={cn(
                          "mb-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                          style.chip,
                        )}
                      >
                        <Icon className="h-2.5 w-2.5" />
                        {position}
                      </span>
                      <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#1a4d42]/45 dark:text-white/40">
                        {style.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {rest.length > 0 ? (
            <ul className="mt-2 divide-y divide-[#1a4d42]/8 border-t border-[#1a4d42]/8 dark:divide-white/8 dark:border-white/8">
              {rest.map((row, index) => {
                const position = positionOf(row, scoped) ?? index + 4;
                return (
                  <li
                    key={row.studentId}
                    className="flex items-center gap-2.5 px-4 py-2 sm:px-5"
                  >
                    <span className="w-4 shrink-0 text-center text-[10px] font-bold tabular-nums text-[#1a4d42]/40 dark:text-white/35">
                      {position}
                    </span>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f3f7f5] text-[9px] font-bold text-[#1a4d42]/60 dark:bg-white/5 dark:text-white/60">
                      {initials(row.studentName)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#0a1f1a] dark:text-white/85">
                      {row.studentName}
                    </span>
                    <span className="shrink-0 text-[10px] font-semibold tabular-nums text-[#1a4d42]/65 dark:text-white/55">
                      {row.meanPercentage.toFixed(1)}%
                    </span>
                    <span className="w-9 shrink-0 text-right text-[9px] font-bold uppercase text-[#246a59] dark:text-[#8fe3c8]">
                      {row.overallGrade}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : null}

          <div className="flex items-center justify-between gap-3 border-t border-[#1a4d42]/10 px-4 py-2.5 dark:border-white/10 sm:px-5">
            <p className="text-[10px] text-[#1a4d42]/50 dark:text-white/40">
              Class mean{" "}
              <span className="font-semibold tabular-nums text-[#0a1f1a] dark:text-white">
                {performance.mean != null
                  ? `${performance.mean.toFixed(1)}%`
                  : "—"}
              </span>
            </p>
            <p className="text-[10px] text-[#1a4d42]/50 dark:text-white/40">
              Best{" "}
              <span className="font-semibold tabular-nums text-[#246a59] dark:text-[#8fe3c8]">
                {performance.best != null
                  ? `${performance.best.toFixed(1)}%`
                  : "—"}
              </span>
              <span className="mx-1 opacity-40">·</span>
              {performance.withResults} with results
            </p>
          </div>
        </>
      )}
    </section>
  );
}
