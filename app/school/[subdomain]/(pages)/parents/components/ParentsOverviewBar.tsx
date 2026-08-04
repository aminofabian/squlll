"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { parentsInviteLink, parentsPanel } from "./parents-ui";

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
      <div className={parentsPanel}>
        <div className="grid grid-cols-2 gap-px bg-[#1a4d42]/10 dark:bg-white/10 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white px-4 py-3 dark:bg-[#0c1a17]">
              <div className="h-3 w-16 animate-pulse bg-[#e8f2ef] dark:bg-white/10" />
              <div className="mt-2 h-4 w-12 animate-pulse bg-[#f3f7f5] dark:bg-white/5" />
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
          <p className="mt-1 text-sm font-semibold tabular-nums text-[#0a1f1a] dark:text-white">
            {total}
            {needsSetup > 0 ? (
              <span className="ml-1.5 text-xs font-normal text-[#1a4d42]/45">
                · {needsSetup} awaiting activation
              </span>
            ) : null}
          </p>
        ) : (
          <div className="mt-1">
            <p className="text-xs text-[#1a4d42]/55 dark:text-white/45">
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
    <div className={parentsPanel} role="group" aria-label="Parent statistics">
      <div className="grid grid-cols-2 gap-px bg-[#1a4d42]/10 dark:bg-white/10 lg:grid-cols-4">
        {cells.map((cell) => (
          <div
            key={cell.label}
            className="bg-white px-4 py-3 dark:bg-[#0c1a17]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
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
                      ? "text-[#1a4d42]/40"
                      : cell.accent
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-[#0a1f1a] dark:text-white",
                  )}
                >
                  {cell.value}
                </p>
                {cell.hint ? (
                  <p className="mt-0.5 truncate text-[11px] text-[#1a4d42]/45">
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
