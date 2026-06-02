"use client";

import { GraduationCap, Users } from "lucide-react";
import { CreateStudentDrawer } from "./CreateStudentDrawer";

interface StudentsEmptyHeroProps {
  defaultOpen?: boolean;
  onStudentCreated: () => void;
}

export function StudentsEmptyHero({
  defaultOpen = false,
  onStudentCreated,
}: StudentsEmptyHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-white to-primary/10 px-6 py-16 text-center dark:border-primary/25 dark:from-primary/10 dark:via-slate-900/50 dark:to-primary/5">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl"
        aria-hidden
      />

      <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30 ring-1 ring-white/30">
        <Users className="h-7 w-7 text-white" strokeWidth={1.75} />
        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-primary/15 dark:bg-slate-900 dark:ring-primary/30">
          <GraduationCap className="h-3 w-3 text-primary" />
        </span>
      </div>

      <h2 className="relative text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        Your student roster is empty
      </h2>
      <p className="relative mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Enroll your first student to unlock attendance, fees, report cards, and
        parent portal access.
      </p>

      <div className="relative mt-7 flex flex-col items-center gap-3">
        <CreateStudentDrawer
          defaultOpen={defaultOpen}
          triggerVariant="hero"
          onStudentCreated={onStudentCreated}
        />
        <p className="text-[11px] text-slate-400">
          Takes about a minute · admission number auto-generated
        </p>
      </div>
    </div>
  );
}
