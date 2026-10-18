"use client";

import { getSubjectPaletteColor } from "@/lib/timetable/constants";

const MAX_SUBJECTS_SHOWN = 6;
const PERCENT = 100;

type TeacherSubjectMixCardProps = {
  subjectDistribution: Record<string, number>;
};

export function TeacherSubjectMixCard({ subjectDistribution }: TeacherSubjectMixCardProps) {
  const subjects = Object.entries(subjectDistribution)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, MAX_SUBJECTS_SHOWN);
  const busiest = subjects[0]?.[1] ?? 1;

  if (subjects.length === 0) return null;

  return (
    <section className="rounded-[24px] bg-[#fffdf8] px-5 py-5 shadow-[0_24px_50px_-42px_rgba(10,38,32,0.55)] ring-1 ring-[#1a4d42]/10 dark:bg-[#0c1a17] dark:ring-white/10">
      <p className="text-[9.5px] font-semibold uppercase tracking-[0.24em] text-[#1a4d42]/45 dark:text-white/40">Subject mix</p>
      <ul className="mt-3.5 space-y-3">
        {subjects.map(([name, count]) => {
          const accent = getSubjectPaletteColor(name).accent;
          return (
            <li key={name}>
              <div className="flex items-center gap-2 text-[11.5px]">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accent }} aria-hidden />
                <span className="min-w-0 flex-1 truncate font-medium text-[#0a1f1a] dark:text-white/85">{name}</span>
                <span className="tabular-nums text-[#1a4d42]/50 dark:text-white/40">{count}</span>
              </div>
              <div className="ml-4 mt-1.5 h-[3px] overflow-hidden rounded-full bg-[#1a4d42]/[0.06] dark:bg-white/[0.06]">
                <div className="h-full rounded-full" style={{ width: `${(count / busiest) * PERCENT}%`, backgroundColor: accent }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
