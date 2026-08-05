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

function Stat({
  label,
  value,
  warn,
}: {
  label: string;
  value: number;
  warn?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#1a4d42]/45">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-sm font-semibold tabular-nums",
          warn ? "text-amber-700" : "text-[#0a1f1a] dark:text-white",
        )}
      >
        {value}
      </p>
    </div>
  );
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
      <div className={cn(parentsPanel, "h-12 animate-pulse bg-[#e8f2ef]/60")} />
    );
  }

  const needsSetup = Math.max(0, total - active);

  return (
    <section
      className={cn(parentsPanel, "bg-[#f8fbfa] dark:bg-[#0c1a17]")}
      aria-label="Parents overview"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base tracking-tight text-[#0a1f1a] dark:text-white">
            {total === 0 ? "Build your parent list" : `${total} registered`}
          </h2>
          <p className="mt-0.5 text-[11px] text-[#1a4d42]/50">
            {total === 0 ? (
              <>
                Invite guardians to connect with student records.{" "}
                <Link href="/parents?action=add" className={cn(parentsInviteLink, "ml-1")}>
                  Add parent
                  <ArrowRight className="h-3 w-3 text-white/70" />
                </Link>
              </>
            ) : needsSetup > 0 ? (
              `${needsSetup} awaiting activation · open a row for profile & fees`
            ) : (
              "Everyone activated · open a row for profile & fees"
            )}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          <Stat label="Parents" value={total} />
          <Stat label="Active" value={active} />
          <Stat label="Children" value={linkedChildren} />
          <Stat label="Invites" value={pendingInvites} warn={pendingInvites > 0} />
        </div>
      </div>
    </section>
  );
}
