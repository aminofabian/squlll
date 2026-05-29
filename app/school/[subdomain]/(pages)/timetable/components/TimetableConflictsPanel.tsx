"use client";

import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Conflict } from "@/lib/types/timetable";
import { dayNameFromNumber } from "@/lib/utils/timetable-user-messages";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";

interface TimetableConflictsPanelProps {
  teacherConflicts: Conflict[];
  roomConflicts: Conflict[];
  onJumpToLesson: (entryId: string) => void;
}

export function TimetableConflictsPanel({
  teacherConflicts,
  roomConflicts,
  onJumpToLesson,
}: TimetableConflictsPanelProps) {
  const total = teacherConflicts.length + roomConflicts.length;
  const [expanded, setExpanded] = useState(true);

  if (total === 0) return null;

  return (
    <div className={cn(tt.panel, "overflow-hidden")}>
      <button
        type="button"
        className="flex w-full items-start gap-2 px-4 py-3 text-left"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
            {total} scheduling {total === 1 ? "clash" : "clashes"}
          </p>
          <p className={cn(tt.caption, "mt-0.5")}>
            Teacher or room double-booked — open a row to fix.
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-zinc-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
        )}
      </button>

      {expanded && (
        <ul className="max-h-52 space-y-2 overflow-y-auto border-t border-zinc-100 px-3 py-3 dark:border-zinc-800">
          {teacherConflicts.map((conflict, i) => (
            <li
              key={`teacher-${i}`}
              className="rounded-lg border border-zinc-200/90 bg-zinc-50/50 p-2.5 dark:border-zinc-700 dark:bg-zinc-900/40"
            >
              <p className="text-[12px] font-medium text-zinc-900 dark:text-zinc-100">
                <span className="text-red-600 dark:text-red-400">Teacher</span> ·{" "}
                {conflict.teacher?.name}
              </p>
              <ul className="mt-1.5 space-y-1">
                {conflict.entries.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-2 text-[11px]"
                  >
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {dayNameFromNumber(e.dayOfWeek)} · {e.timeSlot} · {e.grade}{" "}
                      · {e.subject}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 shrink-0 px-2 text-[11px]"
                      onClick={() => onJumpToLesson(e.id)}
                    >
                      Fix
                      <ChevronRight className="ml-0.5 h-3 w-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            </li>
          ))}

          {roomConflicts.map((conflict, i) => (
            <li
              key={`room-${i}`}
              className="rounded-lg border border-zinc-200/90 bg-zinc-50/50 p-2.5 dark:border-zinc-700 dark:bg-zinc-900/40"
            >
              <p className="text-[12px] font-medium text-zinc-900 dark:text-zinc-100">
                <span className="text-red-600 dark:text-red-400">Room</span> ·{" "}
                {conflict.room}
              </p>
              <ul className="mt-1.5 space-y-1">
                {conflict.entries.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-2 text-[11px]"
                  >
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {dayNameFromNumber(e.dayOfWeek)} · {e.timeSlot} · {e.grade}{" "}
                      · {e.subject}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 shrink-0 px-2 text-[11px]"
                      onClick={() => onJumpToLesson(e.id)}
                    >
                      Fix
                      <ChevronRight className="ml-0.5 h-3 w-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
