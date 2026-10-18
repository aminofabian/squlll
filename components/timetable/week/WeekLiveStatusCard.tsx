"use client";

import { cn } from "@/lib/utils";
import { WEEK_CARD_CLASS } from "./weekCardClass";
import type { CurrentLessonStatus } from "@/lib/timetable/types";
import { describeLiveStatus, type LiveStatusTone } from "@/lib/timetable/weekView/describeLiveStatus";
import type { WeekViewerType } from "@/lib/timetable/weekView/weekViewerType";

const MAX_PERCENT = 100;

const TONE_DOT: Record<LiveStatusTone, string> = {
  live: "bg-emerald-500",
  break: "bg-amber-500",
  calm: "bg-[#9aa7a1] dark:bg-white/30",
};

const TONE_BAR: Record<LiveStatusTone, string> = {
  live: "from-emerald-600 to-emerald-400",
  break: "from-amber-500 to-amber-300",
  calm: "from-[#9aa7a1] to-[#cfd6d2]",
};

type WeekLiveStatusCardProps = {
  status: CurrentLessonStatus;
  formattedTime: string;
  viewType: WeekViewerType;
};

export function WeekLiveStatusCard({ status, formattedTime, viewType }: WeekLiveStatusCardProps) {
  const description = describeLiveStatus(status, viewType);
  const progress = Math.min(Math.max(status.progressPercent, 0), MAX_PERCENT);
  const isLive = description.tone === "live";

  return (
    <section className={`${WEEK_CARD_CLASS} px-4 py-3`}>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          {isLive ? <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /> : null}
          <span className={cn("relative inline-flex h-2 w-2 rounded-full", TONE_DOT[description.tone])} />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5b6862] dark:text-white/65">
          {description.eyebrow}
        </span>
        <span className="ml-auto text-[11.5px] font-semibold tabular-nums text-[#111a16] dark:text-white/70">
          {formattedTime}
        </span>
      </div>
      <p className="mt-1 truncate text-[15px] font-bold leading-tight text-[#111a16] dark:text-white">
        {description.headline}
      </p>
      {description.detail ? (
        <p className="mt-0.5 truncate text-[12px] leading-snug text-[#4a5751] dark:text-white/65">{description.detail}</p>
      ) : null}
      {description.showProgress ? (
        <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-[#e6e9e4] dark:bg-white/10">
          <div
            className={cn("h-full rounded-full bg-gradient-to-r transition-[width] duration-1000 ease-linear", TONE_BAR[description.tone])}
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
    </section>
  );
}
