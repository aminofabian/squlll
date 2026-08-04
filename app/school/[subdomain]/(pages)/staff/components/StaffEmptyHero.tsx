"use client";

import { Briefcase, Users } from "lucide-react";
import { CreateStaffDrawer } from "./CreateStaffDrawer";

interface StaffEmptyHeroProps {
  defaultOpen?: boolean;
  onStaffCreated: () => void;
}

export function StaffEmptyHero({
  defaultOpen = false,
  onStaffCreated,
}: StaffEmptyHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-none border border-[#1a4d42]/12 bg-gradient-to-br from-[#246a59]/[0.06] via-[#f8fbfa] to-[#f3f7f5] px-6 py-14 text-center dark:border-white/10 dark:from-[#246a59]/12 dark:via-[#0c1a17] dark:to-[#071411]">
      <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-none bg-[#0a1f1a]">
        <Users className="h-7 w-7 text-white" strokeWidth={1.75} />
        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-none bg-white shadow-sm ring-1 ring-[#1a4d42]/12 dark:bg-[#0c1a17] dark:ring-white/15">
          <Briefcase className="h-3 w-3 text-[#246a59]" />
        </span>
      </div>

      <h2 className="relative font-display text-lg tracking-tight text-[#0a1f1a] dark:text-white">
        Build your staff directory
      </h2>
      <p className="relative mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#1a4d42]/55 dark:text-white/45">
        Add administrators and support staff. Each member receives an invitation
        to set up their account.
      </p>

      <div className="relative mt-6 flex flex-col items-center gap-3">
        <CreateStaffDrawer
          defaultOpen={defaultOpen}
          triggerVariant="hero"
          onStaffCreated={onStaffCreated}
        />
        <p className="text-[11px] text-[#1a4d42]/45">
          Finance · admin · support roles
        </p>
      </div>
    </div>
  );
}
