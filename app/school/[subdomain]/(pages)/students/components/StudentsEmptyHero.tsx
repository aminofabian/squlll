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
    <div className="relative overflow-hidden rounded-none border border-[#1a4d42]/12 bg-gradient-to-br from-[#246a59]/[0.06] via-[#f8fbfa] to-[#f3f7f5] px-6 py-14 text-center dark:border-white/10 dark:from-[#246a59]/12 dark:via-[#0c1a17] dark:to-[#071411]">
      <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-none bg-[#0a1f1a]">
        <Users className="h-7 w-7 text-white" strokeWidth={1.75} />
        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-none bg-white shadow-sm ring-1 ring-[#1a4d42]/12 dark:bg-[#0c1a17] dark:ring-white/15">
          <GraduationCap className="h-3 w-3 text-[#246a59]" />
        </span>
      </div>

      <h2 className="relative font-display text-base tracking-tight text-[#0a1f1a] dark:text-white">
        Your student roster is empty
      </h2>
      <p className="relative mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#1a4d42]/55 dark:text-white/45">
        Enroll your first student to unlock attendance, fees, report cards, and
        parent portal access.
      </p>

      <div className="relative mt-6 flex flex-col items-center gap-3">
        <CreateStudentDrawer
          defaultOpen={defaultOpen}
          triggerVariant="hero"
          onStudentCreated={onStudentCreated}
        />
        <p className="text-[11px] text-[#1a4d42]/45">
          Takes about a minute · admission number auto-generated
        </p>
      </div>
    </div>
  );
}
