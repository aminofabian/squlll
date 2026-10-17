"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PlannerTeacherRow } from "../utils/plannerTeacherRows";
import { tt } from "../utils/timetableTheme";

type TimetableTeacherLessonRowProps = {
  row: PlannerTeacherRow;
  teacherName: string;
  onLessonsChange: (lessonsPerWeek: number) => void;
};

/** One teacher's lessons for one subject and class; edits go into the planner above. */
export function TimetableTeacherLessonRow({ row, teacherName, onLessonsChange }: TimetableTeacherLessonRowProps) {
  const place = [row.gradeName, row.streamName].filter(Boolean).join(" · ");
  return (
    <li className="flex items-center gap-3 bg-white px-3 py-2.5 dark:bg-[#071411]">
      <div className="min-w-0 flex-1">
        <p className={cn(tt.text.body, tt.ink.strong, "truncate font-medium")}>
          {teacherName}
          <span className={cn("font-normal", tt.ink.faint)}> · {row.subjectName}</span>
        </p>
        <p className={cn(tt.text.caption, tt.ink.muted, "truncate")}>
          {place}
          {row.unsaved ? <span className="text-amber-700 dark:text-amber-300"> · Not saved yet</span> : null}
        </p>
      </div>
      <Input
        type="number"
        min={0}
        aria-label={`Lessons a week for ${teacherName}, ${row.subjectName}`}
        className={cn(tt.text.small, tt.numeral, "h-8 w-16 text-center")}
        defaultValue={row.lessonsPerWeek}
        key={row.lessonsPerWeek}
        onBlur={(e) => {
          const lessons = Number(e.target.value);
          if (Number.isInteger(lessons) && lessons >= 0 && lessons !== row.lessonsPerWeek) {
            onLessonsChange(lessons);
          }
        }}
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={`Remove ${row.subjectName} from ${teacherName}`}
        className={cn(tt.ink.faint, "h-8 w-8 hover:text-red-600")}
        onClick={() => onLessonsChange(0)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </li>
  );
}
