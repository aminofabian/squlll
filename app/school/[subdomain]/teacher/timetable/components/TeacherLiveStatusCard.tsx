"use client";

import { cn } from "@/lib/utils";
import type { CurrentLessonStatus } from "@/lib/timetable/types";
import { describeLiveStatus, type LiveStatusTone } from "../lib/describeLiveStatus";

const MAX_PERCENT = 100;

const TONE_DOT: Record<LiveStatusTone, string> = {
  live: "bg-emerald-500",
  break: "bg-[#c49a52]",
  calm: "bg-[#1a4d42]/30 dark:bg-white/30",
};

const TONE_BAR: Record<LiveStatusTone, string> = {
  live: "from-[#246a59] to-emerald-400",
  break: "from-[#c49a52] to-[#f0dfb8]",
  calm: "from-[#1a4d42]/40 to-[#1a4d42]/20",
};

type TeacherLiveStatusCardProps = {
  status: CurrentLessonStatus;
  formattedTime: string;
};

export function TeacherLiveStatusCard({ status, formattedTime }: TeacherLiveStatusCardProps) {
  const description = describeLiveStatus(status);
  const progress = Math.min(Math.max(status.progressPercent, 0), MAX_PERCENT);
  const isLive = description.tone === "live";

  return (
    <section className="rounded-xl border border-[#1a4d42]/10 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          {isLive ? <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /> : null}
          <span className={cn("relative inline-flex h-2 w-2 rounded-full", TONE_DOT[description.tone])} />
        </span>
        <span className="text-[9.5px] font-semibold uppercase tracking-[0.24em] text-[#1a4d42]/55 dark:text-white/45">
          {description.eyebrow}
        </span>
        <span className="ml-auto text-[11px] font-semibold tabular-nums text-[#0a1f1a]/70 dark:text-white/60">
          {formattedTime}
        </span>
      </div>
      <p className="mt-1 truncate font-display text-[17px] leading-tight tracking-[-0.02em] text-[#0a1f1a] dark:text-white">
        {description.headline}
      </p>
      {description.detail ? (
        <p className="mt-0.5 truncate text-[11px] leading-snug text-[#1a4d42]/55 dark:text-white/45">{description.detail}</p>
      ) : null}
      {description.showProgress ? (
        <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-[#1a4d42]/8 dark:bg-white/10">
          <div
            className={cn("h-full rounded-full bg-gradient-to-r transition-[width] duration-1000 ease-linear", TONE_BAR[description.tone])}
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
    </section>
  );
}
