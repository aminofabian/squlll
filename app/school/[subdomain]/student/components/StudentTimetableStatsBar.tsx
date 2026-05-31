"use client";

import type { ComponentProps } from "react";
import {
  TimetableMobileStatsBar,
  TimetableMobileStatsBarSkeleton,
} from "@/components/timetable/TimetableMobileStatsBar";

export type StudentTimetableStatsBarProps = Omit<
  ComponentProps<typeof TimetableMobileStatsBar>,
  "viewType"
>;

export function StudentTimetableStatsBar(props: StudentTimetableStatsBarProps) {
  return <TimetableMobileStatsBar viewType="student" {...props} />;
}

export function StudentTimetableStatsBarSkeleton() {
  return <TimetableMobileStatsBarSkeleton viewType="student" />;
}
