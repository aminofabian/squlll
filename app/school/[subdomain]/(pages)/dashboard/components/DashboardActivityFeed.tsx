"use client";

import {
  Activity,
  Banknote,
  BookOpenCheck,
  ClipboardCheck,
  GraduationCap,
  Radio,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { cn } from "@/lib/utils";
import {
  useDashboardActivityFeed,
  type FeedTone,
} from "../hooks/useDashboardActivityFeed";

const toneConfig: Record<
  FeedTone,
  { icon: typeof Activity; iconClass: string }
> = {
  payment: {
    icon: Banknote,
    iconClass:
      "text-emerald-700 bg-emerald-50 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50",
  },
  lesson: {
    icon: BookOpenCheck,
    iconClass:
      "text-[#246a59] bg-[#246a59]/10 border-[#246a59]/20 dark:bg-[#246a59]/15",
  },
  invite: {
    icon: UserPlus,
    iconClass:
      "text-[#1a4d42] bg-[#f3f7f5] border-[#1a4d42]/15 dark:bg-white/5 dark:text-emerald-200 dark:border-white/10",
  },
  assignment: {
    icon: GraduationCap,
    iconClass:
      "text-[#246a59] bg-[#246a59]/10 border-[#246a59]/20 dark:bg-[#246a59]/15",
  },
  attendance: {
    icon: ClipboardCheck,
    iconClass:
      "text-amber-800 bg-amber-50 border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40",
  },
  exam: {
    icon: Sparkles,
    iconClass:
      "text-[#0a1f1a] bg-[#e8f2ef] border-[#246a59]/20 dark:bg-[#246a59]/20 dark:text-emerald-200",
  },
  default: {
    icon: Activity,
    iconClass:
      "text-[#1a4d42]/70 bg-[#f3f7f5] border-[#1a4d42]/12 dark:bg-white/5 dark:text-white/70 dark:border-white/10",
  },
};

function formatFeedTime(at: number): string {
  const sec = Math.floor((Date.now() - at) / 1000);
  if (sec < 10) return "Just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  return new Date(at).toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DashboardActivityFeed() {
  const { items } = useDashboardActivityFeed();
  const { connected } = useRealtime();

  return (
    <section
      className="overflow-hidden border border-[#1a4d42]/12 bg-white shadow-[3px_3px_0_0_rgba(10,31,26,0.05)] dark:border-white/10 dark:bg-[#0c1a17]"
      aria-label="Live activity"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-2 dark:border-white/10 dark:bg-[#071411]">
        <h3 className="font-display text-base tracking-tight text-[#0a1f1a] dark:text-white">
          Happening now
        </h3>
        <span
          className={cn(
            "inline-flex items-center gap-1 border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
            connected
              ? "border-emerald-300/60 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50"
              : "border-[#1a4d42]/15 bg-[#f3f7f5] text-[#1a4d42]/55 dark:bg-white/5",
          )}
        >
          {connected ? (
            <span className="h-1.5 w-1.5 bg-emerald-500" />
          ) : (
            <Radio className="h-3 w-3" />
          )}
          {connected ? "Live" : "…"}
        </span>
      </div>

      <ul className="max-h-[min(220px,32vh)] divide-y divide-[#1a4d42]/10 overflow-y-auto dark:divide-white/10">
        {items.slice(0, 5).map((item, index) => {
          const cfg = toneConfig[item.tone];
          const Icon = cfg.icon;
          return (
            <li
              key={item.id}
              className={cn(
                "flex gap-2.5 px-3 py-2 transition-colors hover:bg-[#f3f7f5]/80 dark:hover:bg-white/[0.03]",
                index === 0 && item.id !== "welcome" && "dashboard-feed-enter",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border",
                  cfg.iconClass,
                )}
              >
                <Icon className="h-3 w-3" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12px] font-medium leading-snug text-[#0a1f1a] dark:text-white line-clamp-1">
                    {item.message}
                  </p>
                  <time className="shrink-0 text-[10px] tabular-nums text-[#1a4d42]/40">
                    {formatFeedTime(item.at)}
                  </time>
                </div>
                {item.detail ? (
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-[#1a4d42]/50 dark:text-white/40">
                    {item.detail}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
