"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
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
  const realItems = items.filter((item) => item.id !== "welcome");
  const isEmpty = realItems.length === 0;

  return (
    <section
      className="overflow-hidden border border-[#1a4d42]/12 bg-white shadow-sm dark:border-white/10 dark:bg-[#0c1a17]"
      aria-label="Live activity"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-2 dark:border-white/10 dark:bg-[#071411]">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate font-display text-base tracking-tight text-[#0a1f1a] dark:text-white">
            Live activity
          </h3>
          <span
            className={cn(
              "inline-flex items-center gap-1 border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]",
              connected
                ? "border-emerald-300/60 bg-emerald-50 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-[#1a4d42]/15 bg-[#f3f7f5] text-[#1a4d42]/50 dark:bg-white/5 dark:text-white/40",
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
        <Link
          href="/notifications"
          className="inline-flex shrink-0 items-center gap-0.5 text-[10px] font-medium text-[#1a4d42]/50 transition-colors hover:text-[#0a1f1a] dark:text-white/40 dark:hover:text-white"
        >
          View all
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {isEmpty ? (
        <div className="flex min-h-[268px] flex-col items-center justify-center px-6 py-8 text-center">
          <div className="relative flex h-14 w-14 items-center justify-center border border-[#1a4d42]/12 bg-[#f8fbfa] dark:border-white/10 dark:bg-[#071411]">
            <Activity
              className="h-6 w-6 text-[#246a59] dark:text-emerald-300"
              strokeWidth={1.6}
            />
            <span
              aria-hidden
              className="absolute -right-1 -top-1 h-2 w-2 bg-[#c8a96a]"
            />
          </div>
          <p className="mt-4 font-display text-lg leading-tight tracking-tight text-[#0a1f1a] dark:text-white">
            Your school day, as it happens
          </p>
          <p className="mt-1.5 max-w-[19rem] text-[12px] leading-relaxed text-[#1a4d42]/50 dark:text-white/45">
            Fee payments, lessons, admissions and announcements will appear
            here in real time.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/timetable"
              className="inline-flex h-8 items-center gap-1.5 border border-[#1a4d42]/15 bg-white px-3 text-[11px] font-medium text-[#0a1f1a] transition-colors hover:border-[#246a59]/40 hover:bg-[#f3f7f5] dark:border-white/15 dark:bg-[#0c1a17] dark:text-white/80 dark:hover:bg-white/5"
            >
              Open timetable
            </Link>
            <Link
              href="/communication"
              className="inline-flex h-8 items-center gap-1.5 bg-[#0a1f1a] px-3 text-[11px] font-medium text-white transition-colors hover:bg-[#246a59] dark:bg-emerald-300 dark:text-[#071411] dark:hover:bg-emerald-200"
            >
              Send announcement
            </Link>
          </div>
        </div>
      ) : (
        <ul
          className="max-h-[340px] divide-y divide-[#1a4d42]/10 overflow-y-auto dark:divide-white/10"
          aria-live="polite"
        >
          {realItems.slice(0, 6).map((item, index) => {
            const cfg = toneConfig[item.tone];
            const Icon = cfg.icon;
            return (
              <li
                key={item.id}
                className={cn(
                  "flex gap-3 px-3.5 py-2.5 transition-colors hover:bg-[#f3f7f5]/80 dark:hover:bg-white/[0.03]",
                  index === 0 && "dashboard-feed-enter",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border",
                    cfg.iconClass,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-1 text-[12px] font-medium leading-snug text-[#0a1f1a] dark:text-white">
                      {item.message}
                    </p>
                    <time className="shrink-0 text-[10px] tabular-nums text-[#1a4d42]/40 dark:text-white/35">
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
      )}
    </section>
  );
}
