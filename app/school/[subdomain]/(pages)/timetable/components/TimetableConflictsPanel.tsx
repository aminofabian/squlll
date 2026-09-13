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
  /** Opens the allocations step so the user can fix coverage gaps. */
  onReviewAllocations?: () => void;
  /** Opens the workload-rules step so the user can fix breaches. */
  onCheckWorkload?: () => void;
  embedded?: boolean;
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
        <p
          className={cn(
            "flex items-center gap-2 font-semibold",
            tt.text.body,
            tt.ink.strong,
          )}
        >
          {title}
          <span
            className={cn(
              tt.pill.base,
              tone === "danger" ? tt.pill.danger : tt.pill.warn,
              "px-2 py-0.5",
              tt.numeral,
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
      <p
        className={cn(
          "flex items-center gap-1.5 font-semibold",
          tt.text.small,
          tt.ink.strong,
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-red-500" strokeWidth={2.25} />
        {subject}
        <span className={cn("font-normal", tt.ink.muted)}>
          is double-booked
        </span>
      </p>
      <ul className="mt-2 space-y-1.5">
        {entries.map((e) => (
          <li
            key={e.id}
            className="flex items-center justify-between gap-2 rounded-none bg-white/80 px-2.5 py-1.5 dark:bg-white/5"
          >
            <span className={cn("min-w-0 truncate", tt.text.caption, tt.ink.base)}>
              <span className={cn("font-medium", tt.ink.strong)}>
                {dayNameFromNumber(e.dayOfWeek)} {e.timeSlot}
              </span>
              {" · "}
              {e.grade} · {e.subject}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 shrink-0 gap-1 px-2.5 font-medium text-[#246a59] hover:bg-[#246a59]/10 hover:text-[#1a4d42]",
                tt.text.caption,
              )}
              onClick={() => onJumpToLesson(e.id)}
            >
              Fix
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
  onReviewAllocations,
  onCheckWorkload,
  embedded = false,
}: TimetableConflictsPanelProps) {
  const clashTotal = teacherConflicts.length + roomConflicts.length;
  const advisoryTotal = quotaIssues.length + workloadBreaches.length;
  const total = clashTotal + advisoryTotal;
  const [expanded, setExpanded] = useState(true);

  if (total === 0) {
    if (!embedded) return null;
    return (
      <div className="px-3 py-8 text-center">
        <p className={cn("font-medium", tt.text.body, tt.ink.strong)}>
          Nothing to review
        </p>
        <p className={cn(tt.caption, "mt-1")}>
          No clashes or allocation gaps in this view.
        </p>
      </div>
    );
  }

  return (
    <section
      className={cn(!embedded && tt.panel, "overflow-hidden")}
      aria-label="Timetable review"
    >
      {!embedded ? (
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3.5 text-left",
          tt.focus,
        )}
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
          <span
            className={cn(
              "block font-semibold",
              tt.text.body,
              tt.ink.strong,
              tt.numeral,
            )}
          >
            Review {total} {total === 1 ? "item" : "items"}
          </span>
          <span className={cn(tt.caption, tt.numeral, "block")}>
            {clashTotal > 0
              ? `${clashTotal} clash${clashTotal === 1 ? "" : "es"} must be fixed before sharing`
              : "Nothing blocking — a few things worth a look"}
            {advisoryTotal > 0 ? ` · ${advisoryTotal} to review` : ""}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            tt.ink.faint,
            expanded && "rotate-180",
          )}
        />
      </button>
      ) : null}

      {(embedded || expanded) && (
        <div
          className={cn(
            "overscroll-contain",
            embedded
              ? "pb-3"
              : cn("max-h-[26rem] overflow-y-auto border-t", tt.border.hair),
          )}
        >
          {clashTotal > 0 ? (
            <div className={cn("border-b", tt.border.hair)}>
              <GroupHeader
                icon={ShieldAlert}
                title="Clashes"
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
              <p className={cn(tt.caption, "px-3 pb-3")}>
                Choose Fix on one of these lessons, then move it to another
                period or change the teacher — the clash clears once they no
                longer overlap.
              </p>
            </div>
          ) : null}

          {advisoryTotal > 0 ? (
            <div>
              <GroupHeader
                icon={Info}
                title="Coverage gaps & workload notes"
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
                    <p
                      className={cn(
                        "flex items-center gap-1.5 font-semibold",
                        tt.text.small,
                        tt.ink.strong,
                      )}
                    >
                      <Scale className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                      {issue.type === "under"
                        ? "Fewer lessons than allocated"
                        : "More lessons than allocated"}
                    </p>
                    <p className={cn("mt-1", tt.text.caption, tt.ink.base)}>
                      {issue.message}
                    </p>
                    {onReviewAllocations ? (
                      <button
                        type="button"
                        onClick={onReviewAllocations}
                        className={cn(
                          "mt-1.5 inline-flex items-center gap-1.5 font-medium text-[#246a59] hover:underline",
                          tt.text.caption,
                          tt.focus,
                        )}
                      >
                        Review allocations
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    ) : null}
                  </li>
                ))}
                {workloadBreaches.map((breach, i) => (
                  <li
                    key={`rule-${i}`}
                    className="rounded-none border border-amber-200/80 bg-amber-50/40 p-3 dark:border-amber-900/50 dark:bg-amber-950/20"
                  >
                    <p
                      className={cn(
                        "flex items-center gap-1.5 font-semibold",
                        tt.text.small,
                        tt.ink.strong,
                      )}
                    >
                      <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                      Workload rule stretched
                    </p>
                    <p className={cn("mt-1", tt.text.caption, tt.ink.base)}>
                      {breach.message}
                    </p>
                    {onCheckWorkload ? (
                      <button
                        type="button"
                        onClick={onCheckWorkload}
                        className={cn(
                          "mt-1.5 inline-flex items-center gap-1.5 font-medium text-[#246a59] hover:underline",
                          tt.text.caption,
                          tt.focus,
                        )}
                      >
                        Check workload rules
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    ) : null}
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
