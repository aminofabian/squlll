"use client";

export function WeekSubjectMixCard({ subjectDistribution }: { subjectDistribution: Record<string, number> }) {
  const entries = Object.entries(subjectDistribution).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return (
    <section className="rounded-xl border border-[#1a4d42]/10 bg-[#fffdf8] px-4 py-3 dark:border-white/10 dark:bg-[#0c1a17]">
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#1a4d42]/40 dark:text-white/35">
        Subject mix
      </p>
      <div className="mt-2 space-y-1.5">
        {entries.map(([name, count]) => (
          <div key={name} className="flex items-center justify-between gap-2 text-[10px]">
            <span className="truncate text-[#1a4d42]/65 dark:text-white/55">{name}</span>
            <span className="font-semibold tabular-nums text-[#0a1f1a] dark:text-white">{count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
