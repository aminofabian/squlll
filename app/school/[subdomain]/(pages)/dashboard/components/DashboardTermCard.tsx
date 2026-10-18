"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckSquare,
  Clock,
  FileCheck,
} from "lucide-react";
import { useTerm } from "../../contexts/TermContext";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { label: "Timetable", href: "/timetable", icon: Clock },
  { label: "Attendance", href: "/attendances", icon: CheckSquare },
  { label: "Exams", href: "/exams", icon: FileCheck },
];

function toDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function shortDate(date: Date): string {
  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
  });
}

export function DashboardTermCard() {
  const { selectedTerm: term, termsLoading: loading } = useTerm();
  const start = toDate(term?.startDate);
  const end = toDate(term?.endDate);
  // The term progress is intentionally read at render time; it is a snapshot,
  // not reactive state, and the card is cheap to re-render.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  let percent = 0;
  let timing = "";

  if (start && end && end.getTime() > start.getTime()) {
    const total = end.getTime() - start.getTime();
    percent = Math.min(
      100,
      Math.max(0, Math.round(((now - start.getTime()) / total) * 100)),
    );
    const daysLeft = Math.ceil((end.getTime() - now) / 86_400_000);
    const daysToStart = Math.ceil((start.getTime() - now) / 86_400_000);

    if (now < start.getTime()) {
      timing = `Starts in ${daysToStart} day${daysToStart === 1 ? "" : "s"}`;
    } else if (now > end.getTime()) {
      timing = "Term ended";
    } else {
      timing = `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
    }
  }

  return (
    <section className="overflow-hidden border border-[#1a4d42]/12 bg-white shadow-sm dark:border-white/10 dark:bg-[#0c1a17]">
      <div className="flex items-center justify-between gap-2 border-b border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-2 dark:border-white/10 dark:bg-[#071411]">
        <div className="flex min-w-0 items-center gap-2">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#246a59]" />
          <h2 className="truncate font-display text-base tracking-tight text-[#0a1f1a] dark:text-white">
            This term
          </h2>
        </div>
        <Link
          href="/school-years"
          className="inline-flex shrink-0 items-center gap-0.5 text-[10px] font-medium text-[#1a4d42]/50 transition-colors hover:text-[#0a1f1a] dark:text-white/40 dark:hover:text-white"
        >
          Manage
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="p-3.5">
        {loading ? (
          <div className="space-y-3">
            <div className="h-3 w-20 animate-pulse bg-[#1a4d42]/10" />
            <div className="h-6 w-32 animate-pulse bg-[#1a4d42]/10" />
            <div className="h-1.5 w-full animate-pulse bg-[#1a4d42]/10" />
          </div>
        ) : term ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#1a4d42]/45 dark:text-white/40">
                  {term.academicYear?.name ?? "Academic year"}
                </p>
                <p className="mt-0.5 truncate font-display text-xl leading-tight tracking-tight text-[#0a1f1a] dark:text-white">
                  {term.name}
                </p>
                <p className="mt-1 text-[11px] text-[#1a4d42]/55 dark:text-white/45">
                  {start && end
                    ? `${shortDate(start)} – ${shortDate(end)}`
                    : "Term dates not set"}
                </p>
                {!term.isCurrent && !term.isActive ? (
                  <p className="mt-1.5 text-[10px] text-amber-700 dark:text-amber-300">
                    No term is marked current.{" "}
                    <Link
                      href="/school-years"
                      className="font-medium underline decoration-amber-700/40 underline-offset-2 hover:decoration-amber-700"
                    >
                      Set one
                    </Link>
                  </p>
                ) : null}
              </div>
              {timing ? (
                <span
                  className={cn(
                    "shrink-0 border px-2 py-1 text-[10px] font-semibold tabular-nums",
                    timing === "Term ended"
                      ? "border-[#1a4d42]/12 bg-[#f3f7f5] text-[#1a4d42]/50 dark:border-white/10 dark:bg-white/5 dark:text-white/45"
                      : "border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-300",
                  )}
                >
                  {timing}
                </span>
              ) : null}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden bg-[#e8f2ef] dark:bg-white/10">
                <div
                  className="h-full bg-[#246a59] transition-all duration-700 dark:bg-emerald-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="w-8 text-right text-[10px] font-semibold tabular-nums text-[#1a4d42]/45 dark:text-white/40">
                {percent}%
              </span>
            </div>

            <div className="mt-3.5 grid grid-cols-3 gap-1.5">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group inline-flex items-center justify-center gap-1.5 border border-[#1a4d42]/10 bg-[#f8fbfa] px-2 py-2 text-[11px] font-medium text-[#1a4d42]/70 transition-colors hover:border-[#246a59]/35 hover:bg-[#246a59]/[0.06] hover:text-[#246a59] dark:border-white/10 dark:bg-[#071411] dark:text-white/60 dark:hover:text-emerald-300"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                    <span className="truncate">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="font-display text-xl leading-tight tracking-tight text-[#0a1f1a] dark:text-white">
              Set up your academic year
            </p>
            <p className="max-w-sm text-[12px] leading-relaxed text-[#1a4d42]/55 dark:text-white/45">
              Add a year and a current term so attendance, exams and fee
              statements stay in sync.
            </p>
            <Link
              href="/school-years"
              className="inline-flex items-center gap-1.5 bg-[#0a1f1a] px-3 py-2 text-[11px] font-medium text-white transition-colors hover:bg-[#246a59] dark:bg-emerald-300 dark:text-[#071411]"
            >
              Set up academic year
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
