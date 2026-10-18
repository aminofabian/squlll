"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  studentsClassHref,
  studentProfileHref,
} from "../../classes/utils/class-page-links";
import type { ClassRosterStudent } from "../../classes/utils/filterStudentsForClass";

function formatKes(value?: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);
}

export function GradeStudentRoster({
  gradeId,
  streamId,
  displayName,
  students,
}: {
  gradeId: string;
  streamId?: string | null;
  displayName: string;
  students: ClassRosterStudent[];
}) {
  const [expanded, setExpanded] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (window.matchMedia("(max-width: 639px)").matches) {
      setExpanded(false);
    }
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return students;
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(term) ||
        student.admissionNumber.toLowerCase().includes(term),
    );
  }, [search, students]);

  const visible = filtered.slice(0, expanded ? 40 : 0);
  const withBalance = students.filter((student) => (student.feeBalance ?? 0) > 0);
  const cleared = students.length - withBalance.length;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#1a4d42]/10 bg-white shadow-[0_1px_2px_rgba(10,31,26,0.04)] dark:border-white/10 dark:bg-[#0c1a17]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a4d42]/8 px-4 py-3.5 dark:border-white/8 sm:px-5">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex min-w-0 items-center gap-2.5 text-left"
          aria-expanded={expanded}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#246a59]/10 text-[#246a59] dark:bg-[#246a59]/20 dark:text-[#9dcec1]">
            <Users className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-[#0a1f1a] dark:text-white">
              Students
              <span className="rounded-full bg-[#f3f7f5] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-[#1a4d42]/60 dark:bg-white/5 dark:text-white/50">
                {students.length}
              </span>
            </span>
            <span className="mt-0.5 block truncate text-[11px] text-[#1a4d42]/50 dark:text-white/40">
              {displayName}
              {streamId ? ` · ${students[0]?.streamName ?? "Stream"}` : ""}
              {" · "}
              {cleared} fee cleared
            </span>
          </span>
          <span className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#1a4d42]/40 hover:bg-[#f3f7f5] dark:text-white/35 dark:hover:bg-white/5">
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {students.length > 0 ? (
            <ButtonLink
              href={studentsClassHref(gradeId, {
                streamId: streamId ?? undefined,
                action: "add",
              })}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Enrol student
            </ButtonLink>
          ) : null}
          <ButtonLink
            href={studentsClassHref(gradeId, {
              streamId: streamId ?? undefined,
            })}
            subtle
          >
            Open roster
          </ButtonLink>
        </div>
      </div>

      {expanded ? (
        <div className="px-4 pb-4 pt-3 sm:px-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[12rem] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#1a4d42]/35 dark:text-white/30" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or admission number"
                className="h-9 w-full rounded-lg border border-[#1a4d42]/10 bg-[#f8fbfa] pl-9 pr-3 text-[12px] text-[#0a1f1a] outline-none placeholder:text-[#1a4d42]/35 focus:border-[#246a59]/40 focus:ring-2 focus:ring-[#246a59]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/30"
              />
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#1a4d42]/50 dark:text-white/40">
              <span>{withBalance.length} with balance</span>
              <span className="h-1 w-1 rounded-full bg-[#1a4d42]/20" />
              <span>{cleared} cleared</span>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#1a4d42]/15 px-5 py-8 text-center dark:border-white/10">
              <p className="text-sm font-medium text-[#0a1f1a] dark:text-white">
                No students here yet
              </p>
              <p className="mt-1 text-[12px] text-[#1a4d42]/50 dark:text-white/40">
                Enrol a learner to start fees, attendance and parent visibility.
              </p>
              <div className="mt-3 flex justify-center">
                <ButtonLink
                  href={studentsClassHref(gradeId, {
                    streamId: streamId ?? undefined,
                    action: "add",
                  })}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Enrol first student
                </ButtonLink>
              </div>
            </div>
          ) : visible.length === 0 ? (
            <p className="py-8 text-center text-[12px] text-[#1a4d42]/50 dark:text-white/40">
              No students match “{search}”.
            </p>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-xl border border-[#1a4d42]/8 sm:block dark:border-white/8">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-[#f8fbfa] text-[9px] font-semibold uppercase tracking-[0.12em] text-[#1a4d42]/40 dark:bg-white/[0.02] dark:text-white/35">
                    <tr>
                      <th className="px-3.5 py-2.5">Student</th>
                      <th className="px-3.5 py-2.5">Admission</th>
                      <th className="px-3.5 py-2.5">Stream</th>
                      <th className="px-3.5 py-2.5 text-right">Fee balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a4d42]/6 dark:divide-white/6">
                    {visible.map((student) => (
                      <tr
                        key={student.id}
                        className="transition-colors hover:bg-[#f8fbfa] dark:hover:bg-white/[0.02]"
                      >
                        <td className="px-3.5 py-2.5">
                          <Link
                            href={studentProfileHref(student.id)}
                            className="font-medium text-[#0a1f1a] hover:text-[#246a59] dark:text-white"
                          >
                            {student.name}
                          </Link>
                        </td>
                        <td className="px-3.5 py-2.5 font-mono text-[10.5px] text-[#1a4d42]/50 dark:text-white/40">
                          {student.admissionNumber}
                        </td>
                        <td className="px-3.5 py-2.5 text-[#1a4d42]/60 dark:text-white/45">
                          {student.streamName ?? "—"}
                        </td>
                        <td
                          className={cn(
                            "px-3.5 py-2.5 text-right font-semibold tabular-nums",
                            (student.feeBalance ?? 0) === 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-amber-700 dark:text-amber-300",
                          )}
                        >
                          {formatKes(student.feeBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-[#1a4d42]/6 overflow-hidden rounded-xl border border-[#1a4d42]/8 sm:hidden dark:divide-white/6 dark:border-white/8">
                {visible.map((student) => (
                  <Link
                    key={student.id}
                    href={studentProfileHref(student.id)}
                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium text-[#0a1f1a] dark:text-white">
                        {student.name}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-[#1a4d42]/45 dark:text-white/35">
                        {student.admissionNumber}
                        {student.streamName ? ` · ${student.streamName}` : ""}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-[11px] font-semibold tabular-nums",
                        (student.feeBalance ?? 0) === 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-700 dark:text-amber-300",
                      )}
                    >
                      {formatKes(student.feeBalance)}
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}

          {filtered.length > visible.length ? (
            <p className="mt-3 text-center text-[11px] text-[#1a4d42]/45 dark:text-white/35">
              Showing {visible.length} of {filtered.length}.{" "}
              <Link
                href={studentsClassHref(gradeId, {
                  streamId: streamId ?? undefined,
                })}
                className="font-semibold text-[#246a59] hover:underline dark:text-[#9dcec1]"
              >
                Open the full roster
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function ButtonLink({
  href,
  children,
  subtle,
}: {
  href: string;
  children: React.ReactNode;
  subtle?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold transition-colors",
        subtle
          ? "border border-[#1a4d42]/10 text-[#1a4d42]/65 hover:border-[#1a4d42]/20 hover:bg-[#f8fbfa] dark:border-white/10 dark:text-white/55 dark:hover:bg-white/5"
          : "bg-[#0a1f1a] text-white hover:bg-[#246a59]",
      )}
    >
      {children}
    </Link>
  );
}
