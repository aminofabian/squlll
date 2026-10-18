"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Search,
  Shield,
  ShieldCheck,
  UserRoundPlus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ClassRosterStudent } from "../utils/filterStudentsForClass";
import { initials, type ClassLeadership, type PrefectRef } from "../utils/classPulse";

interface ClassLeadershipCardProps {
  leadership: ClassLeadership;
  roster: ClassRosterStudent[];
  gradeId: string;
  onAssign: (role: "prefect" | "deputy", student: PrefectRef) => void;
  onClear: (role: "prefect" | "deputy") => void;
  className?: string;
}

const roleMeta = {
  prefect: {
    label: "Class prefect",
    hint: "Leads the class day to day",
    icon: ShieldCheck,
    tone: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300",
  },
  deputy: {
    label: "Deputy prefect",
    hint: "Steps in when the prefect is away",
    icon: Shield,
    tone: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300",
  },
} as const;

export function ClassLeadershipCard({
  leadership,
  roster,
  gradeId,
  onAssign,
  onClear,
  className,
}: ClassLeadershipCardProps) {
  const [pickerRole, setPickerRole] = useState<"prefect" | "deputy" | null>(
    null,
  );
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return roster;
    return roster.filter(
      (student) =>
        student.name.toLowerCase().includes(term) ||
        student.admissionNumber.toLowerCase().includes(term),
    );
  }, [roster, search]);

  const openPicker = (role: "prefect" | "deputy") => {
    setSearch("");
    setPickerRole(role);
  };

  const pick = (student: ClassRosterStudent) => {
    if (!pickerRole) return;
    onAssign(pickerRole, {
      studentId: student.id,
      name: student.name,
      admissionNumber: student.admissionNumber,
    });
    setPickerRole(null);
  };

  return (
    <>
      <section
        className={cn(
          "overflow-hidden rounded-xl border border-[#1a4d42]/12 bg-white shadow-[0_1px_2px_rgba(10,31,26,0.04)] dark:border-white/10 dark:bg-[#0c1a17]",
          className,
        )}
      >
        <div className="flex items-center gap-2 border-b border-[#1a4d42]/10 px-3.5 py-3 dark:border-white/10">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-sm tracking-tight text-[#0a1f1a] dark:text-white">
              Class leadership
            </h3>
            <p className="text-[10px] text-[#1a4d42]/50 dark:text-white/40">
              Prefect &amp; deputy
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#1a4d42]/8 dark:divide-white/8">
          {(["prefect", "deputy"] as const).map((role) => {
            const meta = roleMeta[role];
            const Icon = meta.icon;
            const person = leadership[role];
            return (
              <div key={role} className="group flex items-center gap-2.5 px-3.5 py-3">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    person ? meta.tone : "bg-[#f3f7f5] text-[#1a4d42]/35 dark:bg-white/5 dark:text-white/30",
                  )}
                >
                  {person ? initials(person.name) : <Icon className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45 dark:text-white/35">
                    {meta.label}
                  </p>
                  {person ? (
                    <p className="truncate text-[12px] font-semibold text-[#0a1f1a] dark:text-white">
                      {person.name}
                    </p>
                  ) : (
                    <p className="truncate text-[11px] text-[#1a4d42]/50 dark:text-white/40">
                      Not chosen yet
                    </p>
                  )}
                  {person ? (
                    <p className="truncate font-mono text-[9px] text-[#1a4d42]/40 dark:text-white/30">
                      {person.admissionNumber || "—"}
                    </p>
                  ) : (
                    <p className="truncate text-[9px] text-[#1a4d42]/40 dark:text-white/30">
                      {meta.hint}
                    </p>
                  )}
                </div>
                {person ? (
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => openPicker(role)}
                      className="rounded-md px-1.5 py-1 text-[10px] font-semibold text-[#246a59] transition-colors hover:bg-[#e8f2ef] dark:text-[#8fe3c8] dark:hover:bg-white/10"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => onClear(role)}
                      title={`Remove ${meta.label.toLowerCase()}`}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-[#1a4d42]/35 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-white/30 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openPicker(role)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-dashed border-[#1a4d42]/20 px-2 py-1 text-[10px] font-semibold text-[#1a4d42]/55 transition-colors hover:border-[#246a59]/40 hover:text-[#246a59] dark:border-white/15 dark:text-white/45"
                  >
                    <UserRoundPlus className="h-3 w-3" />
                    Choose
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[#1a4d42]/10 bg-[#f8fbfa] px-3.5 py-2 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-[9px] text-[#1a4d42]/40 dark:text-white/30">
            Saved in this browser for this class
          </p>
          <Link
            href={`/students?gradeId=${encodeURIComponent(gradeId)}`}
            className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-[#246a59] hover:underline dark:text-[#8fe3c8]"
          >
            Roster
            <ArrowUpRight className="h-2.5 w-2.5" />
          </Link>
        </div>
      </section>

      <Dialog
        open={Boolean(pickerRole)}
        onOpenChange={(open) => {
          if (!open) setPickerRole(null);
        }}
      >
        <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-b border-[#1a4d42]/10 px-4 py-3.5 text-left dark:border-white/10">
            <DialogTitle className="font-display text-base tracking-tight text-[#0a1f1a] dark:text-white">
              {pickerRole ? `Choose ${roleMeta[pickerRole].label.toLowerCase()}` : ""}
            </DialogTitle>
            <DialogDescription className="text-[11px] text-[#1a4d42]/55 dark:text-white/45">
              Pick a learner from this class roster. Choosing the same learner
              again removes the badge.
            </DialogDescription>
          </DialogHeader>

          <div className="relative border-b border-[#1a4d42]/10 px-4 py-2.5 dark:border-white/10">
            <Search className="pointer-events-none absolute left-6 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#1a4d42]/40" />
            <Input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or admission number"
              className="h-8 border-[#1a4d42]/12 bg-white pl-8 text-[12px] dark:border-white/10 dark:bg-[#071411]"
            />
          </div>

          <div className="max-h-[46vh] overflow-y-auto p-2">
            {roster.length === 0 ? (
              <div className="px-3 py-8 text-center text-[11px] text-[#1a4d42]/50 dark:text-white/40">
                This class has no students yet. Enrol learners first.
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-3 py-8 text-center text-[11px] text-[#1a4d42]/50 dark:text-white/40">
                No learners match “{search.trim()}”.
              </div>
            ) : (
              <ul className="space-y-0.5">
                {filtered.map((student) => {
                  const selected =
                    pickerRole != null &&
                    leadership[pickerRole]?.studentId === student.id;
                  const otherRole = pickerRole === "prefect" ? "deputy" : "prefect";
                  const otherSelected =
                    leadership[otherRole]?.studentId === student.id;
                  return (
                    <li key={student.id}>
                      <button
                        type="button"
                        onClick={() => pick(student)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors",
                          selected
                            ? "bg-[#246a59]/10 dark:bg-[#246a59]/25"
                            : "hover:bg-[#f3f7f5] dark:hover:bg-white/5",
                        )}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3f7f5] text-[9px] font-bold text-[#1a4d42]/60 dark:bg-white/5 dark:text-white/60">
                          {initials(student.name)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-semibold text-[#0a1f1a] dark:text-white">
                            {student.name}
                          </span>
                          <span className="block truncate font-mono text-[9px] text-[#1a4d42]/40 dark:text-white/30">
                            {student.admissionNumber}
                            {student.streamName ? ` · ${student.streamName}` : ""}
                          </span>
                        </span>
                        {selected ? (
                          <Check className="h-3.5 w-3.5 shrink-0 text-[#246a59] dark:text-[#8fe3c8]" />
                        ) : otherSelected ? (
                          <span className="shrink-0 rounded bg-[#f3f7f5] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-[#1a4d42]/45 dark:bg-white/5 dark:text-white/40">
                            {otherRole}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-[#1a4d42]/10 px-4 py-2.5 dark:border-white/10">
            <p className="text-[9px] text-[#1a4d42]/40 dark:text-white/30">
              {roster.length} learner{roster.length === 1 ? "" : "s"} in this class
            </p>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 rounded-md px-2 text-[11px]"
              onClick={() => setPickerRole(null)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
