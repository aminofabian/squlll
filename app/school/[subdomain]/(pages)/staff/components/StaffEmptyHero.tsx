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
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-white to-primary/10 px-6 py-16 text-center dark:border-primary/25 dark:from-primary/10 dark:via-slate-900/50 dark:to-primary/5">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30 ring-1 ring-white/30">
        <Users className="h-7 w-7 text-white" strokeWidth={1.75} />
        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-primary/15 dark:bg-slate-900 dark:ring-primary/30">
          <Briefcase className="h-3 w-3 text-primary" />
        </span>
      </div>

      <h2 className="relative text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        Build your staff directory
      </h2>
      <p className="relative mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Add teachers, administrators, and support staff. Each member receives an
        invitation to set up their account.
      </p>

      <div className="relative mt-7 flex flex-col items-center gap-3">
        <CreateStaffDrawer
          defaultOpen={defaultOpen}
          triggerVariant="hero"
          onStaffCreated={onStaffCreated}
        />
        <p className="text-[11px] text-slate-400">
          Non-teaching roles · finance · admin · support
        </p>
      </div>
    </div>
  );
}
