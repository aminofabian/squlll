"use client"
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Section, StatTile } from "../_ui";

// Generate mock attendance data for 1 year (365 days)
const generateMockAttendance = () => {
  const days = 365;
  const today = new Date();
  const data: { date: string; value: number; isWeekend: boolean }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
    let value;
    let isWeekend = false;

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      value = 5; // Weekend
      isWeekend = true;
    } else {
      // More realistic attendance patterns
      const random = Math.random();
      if (random < 0.85) value = 1; // Present (85%)
      else if (random < 0.92) value = 2; // Late (7%)
      else if (random < 0.97) value = 3; // Excused (5%)
      else if (random < 0.99) value = 4; // No School (2%)
      else value = 0; // Absent (1%)
    }

    data.push({ date: d.toISOString().slice(0, 10), value, isWeekend });
  }
  return data;
};

const attendanceData = generateMockAttendance();

// Semantic status colours, shared by the grid and the legend.
const CELL_STYLE: Record<number, string> = {
  0: "bg-red-500", // Absent
  1: "bg-emerald-500", // Present
  2: "bg-amber-500", // Late
  3: "bg-blue-500", // Excused
  4: "bg-muted-foreground/25", // No School
  5: "bg-muted", // Weekend
};

const statusLabels = ["Absent", "Present", "Late", "Excused", "No School", "Weekend"];

const legendItems: { value: number; label: string }[] = [
  { value: 1, label: "Present" },
  { value: 2, label: "Late" },
  { value: 3, label: "Excused" },
  { value: 0, label: "Absent" },
  { value: 4, label: "No School" },
  { value: 5, label: "Weekend" },
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AttendanceHeatmap({
  data = attendanceData,
  startMonth: _startMonth = 0,
  endMonth: _endMonth = 11,
}: {
  data?: { date: string; value: number; isWeekend?: boolean }[];
  startMonth?: number;
  endMonth?: number;
}) {
  // Normalize data to ensure isWeekend is present
  const normalizedData = data.map((d) => ({ ...d, isWeekend: d.isWeekend ?? false }));

  // Group data by week and pad to start on Sunday
  const weeks: { date: string; value: number; isWeekend: boolean }[][] = [];
  let currentWeek: { date: string; value: number; isWeekend: boolean }[] = [];

  normalizedData.forEach((d) => {
    const dayOfWeek = new Date(d.date).getDay();

    // Start new week on Sunday
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      // Fill remaining days of previous week if needed
      while (currentWeek.length < 7) {
        currentWeek.push({ date: "", value: -1, isWeekend: false });
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }

    // Fill empty days at start of first week
    if (currentWeek.length === 0 && dayOfWeek > 0) {
      for (let j = 0; j < dayOfWeek; j++) {
        currentWeek.push({ date: "", value: -1, isWeekend: false });
      }
    }

    currentWeek.push(d);
  });

  // Add the last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: "", value: -1, isWeekend: false });
    }
    weeks.push(currentWeek);
  }

  // Get month labels
  const monthLabels: { index: number; label: string; month: number }[] = [];
  weeks.forEach((week, weekIndex) => {
    const firstValidDay = week.find((d) => d.date !== "");
    if (firstValidDay) {
      const month = new Date(firstValidDay.date).getMonth();
      if (monthLabels.length === 0 || monthLabels[monthLabels.length - 1].month !== month) {
        monthLabels.push({
          index: weekIndex,
          label: monthNames[month],
          month,
        });
      }
    }
  });

  // Calculate summary statistics
  const summary = normalizedData.reduce(
    (acc, d) => {
      if (d.value === 4) acc.noSchool++;
      else if (d.value === 0) acc.absent++;
      else if (d.value === 1) acc.present++;
      else if (d.value === 2) acc.late++;
      else if (d.value === 3) acc.excused++;
      else if (d.value === 5) acc.weekend++;
      return acc;
    },
    { present: 0, absent: 0, late: 0, excused: 0, noSchool: 0, weekend: 0 },
  );

  const summaryKey: Record<number, keyof typeof summary> = {
    0: "absent",
    1: "present",
    2: "late",
    3: "excused",
    4: "noSchool",
    5: "weekend",
  };

  const totalSchoolDays = normalizedData.length - summary.noSchool - summary.weekend;
  const attendanceRate =
    totalSchoolDays > 0
      ? ((summary.present + summary.late + summary.excused) / totalSchoolDays) * 100
      : 0;
  const rateValue = attendanceRate.toFixed(1);
  const rateBar =
    attendanceRate >= 90
      ? "bg-emerald-500"
      : attendanceRate >= 80
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Attendance rate
            </span>
            <span className="text-2xl font-semibold tracking-tight text-foreground">
              {rateValue}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all", rateBar)}
              style={{ width: `${Math.min(attendanceRate, 100)}%` }}
            />
          </div>
        </div>
        <StatTile
          label="School days"
          value={totalSchoolDays}
          hint="Total academic days"
          icon={CalendarDays}
        />
        <StatTile
          label="Present days"
          value={summary.present}
          hint="Perfect attendance"
          icon={CheckCircle2}
        />
      </div>

      <Section
        title="Attendance Overview"
        description="Academic Year 2024-2025"
        icon={CalendarCheck}
        bodyClassName="space-y-5"
      >
        <div className="flex">
          <div className="w-8 shrink-0" />
          <div className="flex flex-1 justify-between gap-1 pr-1">
            {monthLabels.map((month) => (
              <span
                key={month.index}
                className="truncate text-xs font-medium text-muted-foreground"
              >
                {month.label}
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="flex gap-2">
            <div className="flex shrink-0 flex-col justify-between py-0.5">
              {daysOfWeek.map((day, i) => (
                <div
                  key={day}
                  className="flex h-4 items-center justify-end pr-1 text-[10px] text-muted-foreground"
                >
                  {i % 2 === 1 ? day : ""}
                </div>
              ))}
            </div>

            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={cn(
                        "h-4 w-4 rounded-[3px] transition-colors",
                        day.date === ""
                          ? "bg-transparent"
                          : cn(CELL_STYLE[day.value], "hover:ring-2 hover:ring-primary/40"),
                      )}
                      title={
                        day.date
                          ? `${new Date(day.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}: ${statusLabels[day.value]}`
                          : ""
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-4">
          {legendItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <span
                className={cn("h-3 w-3 rounded-[3px]", CELL_STYLE[item.value])}
              />
              <span className="font-medium text-foreground">{item.label}</span>
              <span>{summary[summaryKey[item.value]]}</span>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile
          label="Days present"
          value={summary.present}
          hint="Perfect attendance"
          icon={CheckCircle2}
        />
        <StatTile
          label="Days late"
          value={summary.late}
          hint="Tardy arrivals"
          icon={Clock}
        />
        <StatTile
          label="Days absent"
          value={summary.absent}
          hint="Unexcused absences"
          icon={XCircle}
        />
        <StatTile
          label="Excused"
          value={summary.excused}
          hint="Documented reasons"
          icon={CalendarCheck}
        />
      </div>
    </div>
  );
}
