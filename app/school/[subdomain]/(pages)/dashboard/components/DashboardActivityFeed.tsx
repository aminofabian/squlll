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
  { icon: typeof Activity; dot: string; bg: string }
> = {
  payment: {
    icon: Banknote,
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  lesson: {
    icon: BookOpenCheck,
    dot: "bg-sky-500",
    bg: "bg-sky-50 dark:bg-sky-950/30",
  },
  invite: {
    icon: UserPlus,
    dot: "bg-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
  assignment: {
    icon: GraduationCap,
    dot: "bg-[#0073ea]",
    bg: "bg-[#0073ea]/8 dark:bg-[#0073ea]/15",
  },
  attendance: {
    icon: ClipboardCheck,
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  exam: {
    icon: Sparkles,
    dot: "bg-fuchsia-500",
    bg: "bg-fuchsia-50 dark:bg-fuchsia-950/30",
  },
  default: {
    icon: Activity,
    dot: "bg-slate-400",
    bg: "bg-slate-50 dark:bg-slate-800/40",
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
    <div className="relative overflow-hidden rounded-xl border border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-900/50">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#0073ea]/10 blur-2xl"
        aria-hidden
      />
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {connected ? (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </>
            ) : (
              <span className="relative inline-flex h-2 w-2 rounded-full bg-slate-300" />
            )}
          </span>
          <h3 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
            Happening now
          </h3>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
            connected
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
              : "bg-slate-100 text-slate-500",
          )}
        >
          <Radio className="h-3 w-3" />
          {connected ? "Live" : "Connecting"}
        </span>
      </div>

      <ul className="max-h-[220px] space-y-0 overflow-y-auto p-1.5 sm:max-h-[260px]">
        {items.map((item, index) => {
          const cfg = toneConfig[item.tone];
          const Icon = cfg.icon;
          return (
            <li
              key={item.id}
              className={cn(
                "flex gap-2.5 rounded-lg px-2 py-2 transition-colors",
                cfg.bg,
                index === 0 && item.id !== "welcome" && "dashboard-feed-enter",
              )}
            >
              <div
                className={cn(
                  "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/80 shadow-sm dark:bg-slate-900/60",
                )}
              >
                <Icon className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-100">
                    {item.message}
                  </p>
                  <span className="shrink-0 font-mono text-[9px] tabular-nums text-slate-400">
                    {formatFeedTime(item.at)}
                  </span>
                </div>
                {item.detail ? (
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                    {item.detail}
                  </p>
                ) : null}
              </div>
              <span
                className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", cfg.dot)}
                aria-hidden
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
