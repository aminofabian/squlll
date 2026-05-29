import type { GradeTimetableOverview } from "../hooks/useTimetableTermOverview";

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export interface ClassLessonCell {
  subject: string;
  teacher: string;
  room?: string;
}

export function buildClassTimetableCsv(options: {
  classLabel: string;
  termName?: string;
  streamName?: string;
  days: { dayOfWeek: number; label: string }[];
  periods: { periodNumber: number; timeLabel: string }[];
  getLesson: (dayOfWeek: number, period: number) => ClassLessonCell | null;
}): string {
  const { classLabel, termName, streamName, days, periods, getLesson } = options;
  const header = [
    "Class",
    "Term",
    "Section",
    "Day",
    "Period",
    "Time",
    "Subject",
    "Teacher",
    "Room",
  ];
  const rows: string[][] = [header];

  for (const day of days) {
    for (const period of periods) {
      const lesson = getLesson(day.dayOfWeek, period.periodNumber);
      rows.push([
        classLabel,
        termName ?? "",
        streamName ?? "",
        day.label,
        String(period.periodNumber),
        period.timeLabel,
        lesson?.subject ?? "",
        lesson?.teacher ?? "",
        lesson?.room ?? "",
      ]);
    }
  }

  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

export function downloadTextFile(
  filename: string,
  content: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildTermTimetableSummaryText(options: {
  termName?: string;
  academicYearName?: string;
  overallPercentage: number;
  totalFilled: number;
  totalSlots: number;
  conflictCount: number;
  byGrade: GradeTimetableOverview[];
}): string {
  const {
    termName,
    academicYearName,
    overallPercentage,
    totalFilled,
    totalSlots,
    conflictCount,
    byGrade,
  } = options;

  const lines = [
    `School timetable — ${termName ?? "Current term"}`,
    academicYearName ? `Year: ${academicYearName}` : "",
    `Overall: ${overallPercentage}% filled (${totalFilled}/${totalSlots} slots)`,
    `Scheduling clashes: ${conflictCount}`,
    "",
    "By class:",
    ...byGrade.map((g) => {
      const sparse =
        g.totalSlots > 0 && g.lessonCount > 0 && g.completionPercentage < 50
          ? " (still sparse)"
          : g.lessonCount === 0
            ? " (no lessons yet)"
            : "";
      return `  • ${g.label}: ${g.completionPercentage}% (${g.filledSlots}/${g.totalSlots})${sparse}`;
    }),
  ];

  return lines.filter(Boolean).join("\n");
}

export function buildTermTimetableCsv(options: {
  termName?: string;
  academicYearName?: string;
  grades: { gradeId: string; label: string }[];
  days: { dayOfWeek: number; label: string }[];
  periods: { periodNumber: number; timeLabel: string }[];
  getLesson: (
    gradeId: string,
    dayOfWeek: number,
    period: number,
  ) => ClassLessonCell | null;
}): string {
  const sections = options.grades.map((grade) =>
    buildClassTimetableCsv({
      classLabel: grade.label,
      termName: options.termName,
      days: options.days,
      periods: options.periods,
      getLesson: (dayOfWeek, period) =>
        options.getLesson(grade.gradeId, dayOfWeek, period),
    }),
  );
  const header = [
    `# Term: ${options.termName ?? ""}`,
    options.academicYearName ? `# Year: ${options.academicYearName}` : "",
    "",
  ].filter(Boolean);
  return [...header, ...sections].join("\n");
}

export function buildClassTimetableSummaryText(options: {
  classLabel: string;
  streamName?: string;
  termName?: string;
  filledSlots: number;
  totalSlots: number;
  completionPercentage: number;
  conflictCount: number;
  subjectDistribution: Record<string, number>;
  insightLines?: string[];
}): string {
  const {
    classLabel,
    streamName,
    termName,
    filledSlots,
    totalSlots,
    completionPercentage,
    conflictCount,
    subjectDistribution,
    insightLines,
  } = options;

  const lines = [
    `Timetable: ${classLabel}${streamName ? ` — ${streamName}` : ""}`,
    `Term: ${termName ?? "Current term"}`,
    `Filled: ${filledSlots}/${totalSlots} slots (${completionPercentage}%)`,
    `Clashes: ${conflictCount}`,
    "",
    "Subjects this week:",
    ...Object.entries(subjectDistribution)
      .sort((a, b) => b[1] - a[1])
      .map(
        ([name, count]) =>
          `  • ${name}: ${count} lesson${count !== 1 ? "s" : ""}`,
      ),
  ];

  if (insightLines && insightLines.length > 0) {
    lines.push("", "Notes:", ...insightLines);
  }

  return lines.join("\n");
}
