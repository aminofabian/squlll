"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { parentsInviteLink } from "./parents-ui";

interface ParentsOverviewBarProps {
  total: number;
  active: number;
  pendingInvites: number;
  linkedChildren: number;
  isLoading?: boolean;
}

export function ParentsOverviewBar({
  total,
  active,
  pendingInvites,
  linkedChildren,
  isLoading,
}: ParentsOverviewBarProps) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200/50 bg-slate-100/35 dark:border-slate-800/60 dark:bg-slate-900/25">
        <div className="grid grid-cols-2 gap-px bg-slate-200/40 dark:bg-slate-800/60 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/60 px-4 py-3 dark:bg-slate-900/30">
              <div className="h-3 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              <div className="mt-2 h-4 w-12 animate-pulse rounded bg-slate-50 dark:bg-slate-800/60" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activationRate =
    total > 0 ? Math.round((active / total) * 100) : 0;
  const needsSetup = total - active;

  const cells = [
    {
      label: "Registered",
      content:
        total > 0 ? (
          <p className="mt-1 text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
            {total}
            {needsSetup > 0 ? (
              <span className="ml-1.5 text-xs font-normal text-slate-400">
                · {needsSetup} awaiting activation
              </span>
            ) : null}
          </p>
        ) : (
          <div className="mt-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No parents registered yet.
            </p>
            <Link href="/parents?action=add" className={cn(parentsInviteLink, "mt-2")}>
              Add parent
              <ArrowRight className="h-3 w-3 text-white/70" />
            </Link>
          </div>
        ),
    },
    {
      label: "Active",
      value: String(active),
      hint: `${activationRate}% activated`,
      muted: active === 0,
    },
    {
      label: "Linked children",
      value: String(linkedChildren),
      hint: linkedChildren === 1 ? "1 student" : "Across families",
      muted: linkedChildren === 0,
    },
    {
      label: "Pending invites",
      value: String(pendingInvites),
      hint: pendingInvites > 0 ? "Awaiting signup" : "All caught up",
      muted: pendingInvites === 0,
      accent: pendingInvites > 0,
    },
  ];

  return (
    <div
      className="overflow-hidden rounded-xl border border-slate-200/50 bg-slate-100/35 dark:border-slate-800/60 dark:bg-slate-900/25"
      role="group"
      aria-label="Parent statistics"
    >
      <div className="grid grid-cols-2 gap-px bg-slate-200/40 dark:bg-slate-800/60 lg:grid-cols-4">
        {cells.map((cell) => (
          <div
            key={cell.label}
            className="bg-white/60 px-4 py-3 dark:bg-slate-900/30"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {cell.label}
            </p>
            {"content" in cell && cell.content ? (
              cell.content
            ) : (
              <>
                <p
                  className={cn(
                    "mt-1 text-sm font-semibold tabular-nums",
                    cell.muted
                      ? "text-slate-400"
                      : cell.accent
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-slate-800 dark:text-slate-100",
                  )}
                >
                  {cell.value}
                </p>
                {cell.hint ? (
                  <p className="mt-0.5 truncate text-[11px] text-slate-400">
                    {cell.hint}
                  </p>
                ) : null}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
