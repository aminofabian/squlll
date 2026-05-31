"use client";

import type { ComponentProps } from "react";
import {
  TimetableNextLessonBar,
  TimetableNextLessonBarSkeleton,
} from "@/components/timetable/TimetableNextLessonBar";

export type StudentNextLessonBarProps = Omit<
  ComponentProps<typeof TimetableNextLessonBar>,
  "viewType"
>;

export function StudentNextLessonBar(props: StudentNextLessonBarProps) {
  return <TimetableNextLessonBar viewType="student" {...props} />;
}

export function StudentNextLessonBarSkeleton() {
  return <TimetableNextLessonBarSkeleton viewType="student" />;
}
