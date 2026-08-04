"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  DoorClosed,
  Info,
  Scale,
  ShieldAlert,
  User,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Conflict } from "@/lib/types/timetable";
import type {
  AllocationQuotaIssue,
  WorkloadRuleBreach,
} from "@/lib/types/timetable-allocation";
import { dayNameFromNumber } from "@/lib/utils/timetable-user-messages";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";

interface TimetableConflictsPanelProps {
  teacherConflicts: Conflict[];
  roomConflicts: Conflict[];
  onJumpToLesson: (entryId: string) => void;
  quotaIssues?: AllocationQuotaIssue[];
  workloadBreaches?: WorkloadRuleBreach[];
}

function GroupHeader({
  icon: Icon,
  title,
  hint,
  count,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
  count: number;
  tone: "danger" | "warn";
}) {
  return (
    <div className="flex items-start gap-2.5 px-4 py-3">
      <span
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-none",
          tone === "danger"
            ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
            : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
        )}
        aria-hidden
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-slate-900 dark:text-slate-100">
          {title}
          <span
            className={cn(
              tt.pill.base,
              tone === "danger" ? tt.pill.danger : tt.pill.warn,
              "px-2 py-0.5",
            )}
          >
            {count}
          </span>
        </p>
        <p className={cn(tt.caption, "mt-0.5")}>{hint}</p>
      </div>
    </div>
  );
}

function ClashCard({
  kind,
  subject,
  entries,
  onJumpToLesson,
}: {
  kind: "teacher" | "room";
  subject: string;
  entries: Conflict["entries"];
  onJumpToLesson: (entryId: string) => void;
}) {
  const Icon = kind === "teacher" ? User : DoorClosed;
  return (
    <li className="rounded-none border border-red-200/80 bg-red-50/40 p-3 dark:border-red-900/50 dark:bg-red-950/20">
      <p className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-900 dark:text-slate-100">
        <Icon className="h-3.5 w-3.5 shrink-0 text-red-500" strokeWidth={2.25} />
        {subject}
        <span className="font-normal text-slate-500 dark:text-slate-400">
          is double-booked
        </span>
      </p>
      <ul className="mt-2 space-y-1">
        {entries.map((e) => (
          <li
            key={e.id}
            className="flex items-center justify-between gap-2 rounded-none bg-white/80 px-2.5 py-1.5 dark:bg-slate-900/50"
          >
            <span className="min-w-0 truncate text-[11px] text-slate-600 dark:text-slate-300">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {dayNameFromNumber(e.dayOfWeek)} {e.timeSlot}
              </span>
              {" · "}
              {e.grade} · {e.subject}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 shrink-0 gap-0.5 px-2 text-[11px] font-medium text-[#246a59] hover:bg-[#246a59]/10 hover:text-[#1a4d42]"
              onClick={() => onJumpToLesson(e.id)}
            >
              Open
              <ArrowRight className="h-3 w-3" />
            </Button>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function TimetableConflictsPanel({
  teacherConflicts,
  roomConflicts,
  onJumpToLesson,
  quotaIssues = [],
  workloadBreaches = [],
}: TimetableConflictsPanelProps) {
  const clashTotal = teacherConflicts.length + roomConflicts.length;
  const advisoryTotal = quotaIssues.length + workloadBreaches.length;
  const total = clashTotal + advisoryTotal;
  const [expanded, setExpanded] = useState(true);

  if (total === 0) return null;

  return (
    <section className={cn(tt.panel, "overflow-hidden")} aria-label="Timetable review">
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-none",
            clashTotal > 0
              ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
          )}
          aria-hidden
        >
          <AlertTriangle className="h-4 w-4" strokeWidth={2.25} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-slate-900 dark:text-slate-100">
            Review {total} {total === 1 ? "item" : "items"}
          </span>
          <span className={cn(tt.caption, "block")}>
            {clashTotal > 0
              ? `${clashTotal} must be fixed before publishing`
              : "Nothing blocking — a few things worth checking"}
            {advisoryTotal > 0 ? ` · ${advisoryTotal} to check` : ""}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded && (
        <div className="max-h-[26rem] overflow-y-auto overscroll-contain border-t border-slate-100 dark:border-slate-800">
          {clashTotal > 0 ? (
            <div className="border-b border-slate-100 dark:border-slate-800">
              <GroupHeader
                icon={ShieldAlert}
                title="Must fix"
                hint="The same teacher or room is booked twice at once."
                count={clashTotal}
                tone="danger"
              />
              <ul className="space-y-2 px-3 pb-3">
                {teacherConflicts.map((conflict, i) => (
                  <ClashCard
                    key={`teacher-${i}`}
                    kind="teacher"
                    subject={conflict.teacher?.name ?? "Teacher"}
                    entries={conflict.entries}
                    onJumpToLesson={onJumpToLesson}
                  />
                ))}
                {roomConflicts.map((conflict, i) => (
                  <ClashCard
                    key={`room-${i}`}
                    kind="room"
                    subject={conflict.room ?? "Room"}
                    entries={conflict.entries}
                    onJumpToLesson={onJumpToLesson}
                  />
                ))}
              </ul>
            </div>
          ) : null}

          {advisoryTotal > 0 ? (
            <div>
              <GroupHeader
                icon={Info}
                title="Worth checking"
                hint="Allocations not fully met and workload rules stretched."
                count={advisoryTotal}
                tone="warn"
              />
              <ul className="space-y-2 px-3 pb-3">
                {quotaIssues.map((issue, i) => (
                  <li
                    key={`quota-${i}`}
                    className="rounded-none border border-amber-200/80 bg-amber-50/40 p-3 dark:border-amber-900/50 dark:bg-amber-950/20"
                  >
                    <p className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                      <Scale className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                      {issue.type === "under"
                        ? "Fewer lessons than allocated"
                        : "More lessons than allocated"}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                      {issue.message}
                    </p>
                  </li>
                ))}
                {workloadBreaches.map((breach, i) => (
                  <li
                    key={`rule-${i}`}
                    className="rounded-none border border-amber-200/80 bg-amber-50/40 p-3 dark:border-amber-900/50 dark:bg-amber-950/20"
                  >
                    <p className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                      <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                      Workload rule stretched
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                      {breach.message}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
