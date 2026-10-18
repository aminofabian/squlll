"use client";

import { getSubjectPaletteColor } from "@/lib/timetable/constants";

const MAX_SUBJECTS_SHOWN = 6;
const PERCENT = 100;

type WeekSubjectMixCardProps = {
  subjectDistribution: Record<string, number>;
};

export function WeekSubjectMixCard({ subjectDistribution }: WeekSubjectMixCardProps) {
  const subjects = Object.entries(subjectDistribution)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, MAX_SUBJECTS_SHOWN);
  const busiest = subjects[0]?.[1] ?? 1;

  if (subjects.length === 0) return null;

  return (
    <section className="rounded-xl border border-[#1a4d42]/10 bg-[#fffdf8] px-4 py-3 dark:border-white/10 dark:bg-[#0c1a17]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1a4d42]/85 dark:text-white/70">Subject mix</p>
      <ul className="mt-2 space-y-1.5">
        {subjects.map(([name, count]) => {
          const accent = getSubjectPaletteColor(name).accent;
          return (
            <li key={name}>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accent }} aria-hidden />
                <span className="min-w-0 flex-1 truncate font-medium text-[#0a1f1a] dark:text-white/85">{name}</span>
                <span className="tabular-nums text-[#1a4d42]/80 dark:text-white/65">{count}</span>
              </div>
              <div className="ml-4 mt-1 h-[2px] overflow-hidden rounded-full bg-[#1a4d42]/[0.06] dark:bg-white/[0.06]">
                <div className="h-full rounded-full" style={{ width: `${(count / busiest) * PERCENT}%`, backgroundColor: accent }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
