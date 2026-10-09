"use client";

import { CalendarDays } from "lucide-react";

import { cn } from "@/lib/utils";
import { Section, StatusPill } from "../_ui";

// Semantic status colours, shared by the grid and the legend.
const CELL_STYLE: Record<number, string> = {
  0: "bg-red-500", // Absent
  1: "bg-emerald-500", // Present
  2: "bg-amber-500", // Late
  3: "bg-blue-500", // Excused
  4: "bg-muted-foreground/25", // No School
  5: "bg-muted", // Weekend
};

const statusNames = ["Absent", "Present", "Late", "Excused", "No School", "Weekend"];

const legendItems: { value: number; label: string }[] = [
  { value: 1, label: "Present" },
  { value: 2, label: "Late" },
  { value: 3, label: "Excused" },
  { value: 0, label: "Absent" },
  { value: 4, label: "No School" },
  { value: 5, label: "Weekend" },
];

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const termWeeks = 14;

// Generate mock data for a term (14 weeks x 7 days)
const generateTermAttendance = (startDate = new Date()) => {
  // Find the previous Monday
  const start = new Date(startDate);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const data: { date: string; value: number; isWeekend: boolean }[][] = [];
  for (let w = 0; w < termWeeks; w++) {
    const week: { date: string; value: number; isWeekend: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start);
      day.setDate(start.getDate() + w * 7 + d);
      const dayOfWeek = day.getDay();
      let value;
      let isWeekend = false;
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        value = 5; // Weekend
        isWeekend = true;
      } else {
        value = Math.random() < 0.8 ? Math.floor(Math.random() * 3) + 1 : 0;
      }
      week.push({ date: day.toISOString().slice(0, 10), value, isWeekend });
    }
    data.push(week);
  }
  return data;
};

const termData = generateTermAttendance();

function getWeekRange(week: { date: string }[]) {
  if (!week.length) return "";
  const start = new Date(week[0].date);
  const end = new Date(week[6].date);
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export default function AttendanceTermGrid({
  data = termData,
}: {
  data?: { date: string; value: number; isWeekend: boolean }[][];
}) {
  // Calculate summary
  const flat = data.flat();
  const summary = flat.reduce(
    (acc, d) => {
      if (d.value === 5) acc.weekend++;
      else if (d.value === 4) acc.noSchool++;
      else if (d.value === 0) acc.absent++;
      else if (d.value === 1) acc.present++;
      else if (d.value === 2) acc.late++;
      else if (d.value === 3) acc.excused++;
      return acc;
    },
    { present: 0, absent: 0, late: 0, excused: 0, noSchool: 0, weekend: 0 },
  );
  const totalSchoolDays = flat.length - summary.noSchool - summary.weekend;

  return (
    <Section
      title="Term attendance"
      description="Rolling 14-week overview"
      icon={CalendarDays}
      bodyClassName="space-y-4"
    >
      <div className="overflow-x-auto pb-1">
        <div
          className="grid min-w-[560px] gap-1"
          style={{ gridTemplateColumns: `32px repeat(${data.length}, minmax(0, 1fr))` }}
        >
          <div />
          {data.map((_, wi) => (
            <div
              key={wi}
              className="truncate text-center text-[10px] font-medium text-muted-foreground"
            >
              W{wi + 1}
            </div>
          ))}

          <div className="flex flex-col justify-between border-r border-border pr-1 text-[10px] text-muted-foreground">
            {daysOfWeek.map((d) => (
              <div key={d} className="text-right leading-none">
                {d[0]}
              </div>
            ))}
          </div>

          {data.map((week, wi) => (
            <div
              key={wi}
              className={cn(
                "flex flex-col gap-px rounded-lg border border-border p-1",
                wi % 2 === 0 ? "bg-muted/40" : "bg-transparent",
              )}
            >
              {week.map((day, di) => (
                <div
                  key={di}
                  title={`${day.date}: ${statusNames[day.value]}`}
                  className={cn(
                    "h-5 w-full rounded-[3px]",
                    CELL_STYLE[day.value],
                    day.isWeekend && "ring-1 ring-inset ring-border",
                  )}
                />
              ))}
              <div className="mt-1 truncate text-center text-[10px] text-muted-foreground">
                {getWeekRange(week)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={cn("h-3 w-3 rounded-[3px]", CELL_STYLE[item.value])} />
            {item.label}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-xs">
        <span className="text-muted-foreground">
          Total school days{" "}
          <span className="font-semibold text-foreground">{totalSchoolDays}</span>
        </span>
        <StatusPill tone="success">Present {summary.present}</StatusPill>
        <StatusPill tone="warning">Late {summary.late}</StatusPill>
        <StatusPill tone="info">Excused {summary.excused}</StatusPill>
        <StatusPill tone="danger">Absent {summary.absent}</StatusPill>
        <StatusPill tone="neutral">No school {summary.noSchool}</StatusPill>
        <StatusPill tone="accent">Weekend {summary.weekend}</StatusPill>
      </div>
    </Section>
  );
}
