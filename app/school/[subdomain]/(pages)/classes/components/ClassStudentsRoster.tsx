"use client";

import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  studentsClassHref,
  studentProfileHref,
} from "../utils/class-page-links";

export interface ClassRosterRow {
  id: string;
  name: string;
  admissionNumber: string;
  streamName?: string | null;
  feeBalance?: number;
}

interface ClassStudentsRosterProps {
  gradeId: string;
  streamId?: string | null;
  streamName?: string;
  displayName: string;
  students: ClassRosterRow[];
  showStreamColumn?: boolean;
  maxRows?: number;
}

function formatKes(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ClassStudentsRoster({
  gradeId,
  streamId,
  streamName,
  displayName,
  students,
  showStreamColumn = false,
  maxRows = 8,
}: ClassStudentsRosterProps) {
  const visible = students.slice(0, maxRows);
  const hasMore = students.length > maxRows;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0073ea]/10 text-[#0073ea]">
            <Users className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Students in this class
            </h3>
            <p className="text-xs text-slate-500">
              {students.length} enrolled
              {streamName ? ` · ${streamName}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            type="button"
            size="sm"
            variant="outline"
            className="h-8 text-xs"
          >
            <Link href={studentsClassHref(gradeId, { streamId: streamId ?? undefined })}>
              View all
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
          <Button
            asChild
            type="button"
            size="sm"
            className="h-8 gap-1 bg-[#0073ea] text-xs hover:bg-[#0062c4]"
          >
            <Link
              href={studentsClassHref(gradeId, {
                streamId: streamId ?? undefined,
                action: "add",
              })}
            >
              Enrol student
            </Link>
          </Button>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="px-4 py-10 text-center sm:px-5">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            No students in {displayName}
            {streamName ? ` · ${streamName}` : ""} yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Enrol learners to activate fees, timetable, and parent visibility.
          </p>
          <Button
            asChild
            size="sm"
            className="mt-4 h-9 bg-[#0073ea] text-xs"
          >
            <Link
              href={studentsClassHref(gradeId, {
                streamId: streamId ?? undefined,
                action: "add",
              })}
            >
              Enrol first student
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50/90 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:bg-slate-900/80">
              <tr>
                <th className="px-4 py-2.5 sm:px-5">Student</th>
                <th className="px-4 py-2.5 sm:px-5">Admission #</th>
                {showStreamColumn ? (
                  <th className="hidden px-4 py-2.5 sm:table-cell sm:px-5">
                    Stream
                  </th>
                ) : null}
                <th className="px-4 py-2.5 text-right sm:px-5">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {visible.map((student) => (
                <tr
                  key={student.id}
                  className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
                >
                  <td className="px-4 py-2.5 sm:px-5">
                    <Link
                      href={studentProfileHref(student.id)}
                      className="font-medium text-slate-800 hover:text-[#0073ea] dark:text-slate-100"
                    >
                      {student.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500 sm:px-5">
                    {student.admissionNumber}
                  </td>
                  {showStreamColumn ? (
                    <td className="hidden px-4 py-2.5 text-slate-600 sm:table-cell sm:px-5">
                      {student.streamName || "—"}
                    </td>
                  ) : null}
                  <td
                    className={cn(
                      "px-4 py-2.5 text-right font-semibold tabular-nums sm:px-5",
                      (student.feeBalance ?? 0) === 0
                        ? "text-emerald-600"
                        : "text-amber-700",
                    )}
                  >
                    {student.feeBalance != null
                      ? formatKes(student.feeBalance)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore ? (
            <p className="border-t border-slate-100 px-4 py-2.5 text-center text-[11px] text-slate-500 dark:border-slate-800 sm:px-5">
              +{students.length - maxRows} more —{" "}
              <Link
                href={studentsClassHref(gradeId, {
                  streamId: streamId ?? undefined,
                })}
                className="font-medium text-[#0073ea] hover:underline"
              >
                open full roster
              </Link>
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
