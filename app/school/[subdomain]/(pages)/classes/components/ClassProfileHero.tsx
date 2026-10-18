"use client";

import Link from "next/link";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  GraduationCap,
  Users,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Stream } from "@/lib/types/school-config";
import {
  classMonogram,
  initials,
  type ClassHealth,
} from "../utils/classPulse";
import { classHealthMeta } from "./classHealth";
import { classesDotGrid, classesInkPanel } from "./classes-ui";

export interface ClassNeighbour {
  gradeId: string;
  levelId: string;
  label: string;
}

interface ClassProfileHeroProps {
  displayName: string;
  levelName: string;
  streamName?: string;
  streams: Stream[];
  selectedStreamId: string;
  studentCount: number;
  assignedSubjects: number;
  totalSubjects: number;
  classTeacherName?: string | null;
  classTeacherRole?: string;
  health: ClassHealth;
  readiness: number;
  hrefs: { students: string; timetable: string; fees: string };
  prev?: ClassNeighbour | null;
  next?: ClassNeighbour | null;
  onGoToClass?: (neighbour: ClassNeighbour) => void;
  onStreamSelect: (streamId: string) => void;
  onAssignTeacher: () => void;
}

function ReadinessRing({ value }: { value: number }) {
  const size = 64;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  const tone =
    value >= 85
      ? "text-[#8fe3c8]"
      : value >= 50
        ? "text-amber-300"
        : "text-rose-300";

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Class readiness ${value}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-700", tone)}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-base font-semibold leading-none tabular-nums text-white">
          {value}
        </span>
        <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-white/45">
          ready
        </span>
      </div>
    </div>
  );
}

export function ClassProfileHero({
  displayName,
  levelName,
  streamName,
  streams,
  selectedStreamId,
  studentCount,
  assignedSubjects,
  totalSubjects,
  classTeacherName,
  classTeacherRole,
  health,
  readiness,
  hrefs,
  prev,
  next,
  onGoToClass,
  onStreamSelect,
  onAssignTeacher,
}: ClassProfileHeroProps) {
  const meta = classHealthMeta[health];
  const monogram = classMonogram(displayName);
  const title = streamName ? `${displayName} · ${streamName}` : displayName;

  return (
    <section className={classesInkPanel} aria-label="Class overview">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={classesDotGrid}
      />
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#246a59]/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-[#1a4d42]/40 blur-3xl" />

      <div className="relative p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#246a59] to-[#1a4d42] text-sm font-bold tracking-tight text-white ring-1 ring-white/15 sm:h-14 sm:w-14 sm:text-base">
              {monogram}
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-lg border-2 border-[#0a1f1a] bg-[#8fe3c8] text-[8px] font-bold text-[#0a1f1a]">
                <GraduationCap className="h-2.5 w-2.5" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                  {levelName}
                </p>
                <span
                  className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-semibold text-white/65 sm:inline-flex"
                  title={meta.description}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-lg", meta.dot)} />
                  {meta.label}
                </span>
              </div>
              <h2 className="mt-1 truncate font-display text-xl tracking-tight text-white sm:text-2xl">
                {title}
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] tabular-nums text-white/55">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {studentCount} learner{studentCount === 1 ? "" : "s"}
                </span>
                <span className="h-1 w-1 rounded-lg bg-white/25" />
                <span>
                  {totalSubjects > 0
                    ? `${assignedSubjects}/${totalSubjects} subjects staffed`
                    : "No subjects yet"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40">
                Readiness
              </p>
              <p className="mt-0.5 max-w-[9rem] text-[10px] leading-snug text-white/50">
                {health === "ready"
                  ? "This class is ready to teach."
                  : readiness >= 50
                    ? "Almost there — close the gaps below."
                    : "Finish setup to unlock the class."}
              </p>
            </div>
            <ReadinessRing value={readiness} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
          <div className="mr-auto flex min-w-0 flex-wrap items-center gap-2">
            {classTeacherName ? (
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] py-1 pl-1 pr-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#8fe3c8]/20 text-[9px] font-bold text-[#8fe3c8]">
                  {initials(classTeacherName)}
                </span>
                <span className="min-w-0">
                  <span className="block max-w-[10rem] truncate text-[11px] font-semibold text-white">
                    {classTeacherName}
                  </span>
                  <span className="block text-[8px] font-semibold uppercase tracking-[0.12em] text-white/40">
                    {classTeacherRole ??
                      (streamName ? "Stream teacher" : "Class teacher")}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={onAssignTeacher}
                  className="rounded-md px-1.5 py-1 text-[10px] font-semibold text-[#8fe3c8] transition-colors hover:bg-white/10"
                >
                  Change
                </button>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={onAssignTeacher}
                className="h-8 gap-1.5 rounded-lg border border-dashed border-white/20 bg-white/[0.04] px-2.5 text-[11px] text-white/75 hover:bg-white/10 hover:text-white"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Assign class teacher
              </Button>
            )}

            {streams.length > 1 ? (
              <div className="flex flex-wrap items-center gap-1">
                <span className="mr-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/35">
                  Focus
                </span>
                <button
                  type="button"
                  onClick={() => onStreamSelect("")}
                  aria-pressed={!selectedStreamId}
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[10px] font-semibold transition-colors",
                    !selectedStreamId
                      ? "border-[#8fe3c8]/50 bg-[#8fe3c8]/15 text-[#c9f4e5]"
                      : "border-white/10 bg-white/[0.04] text-white/55 hover:bg-white/10 hover:text-white",
                  )}
                >
                  All streams
                </button>
                {streams.map((stream) => (
                  <button
                    key={stream.id}
                    type="button"
                    onClick={() => onStreamSelect(stream.id)}
                    aria-pressed={selectedStreamId === stream.id}
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[10px] font-semibold transition-colors",
                      selectedStreamId === stream.id
                        ? "border-[#8fe3c8]/50 bg-[#8fe3c8]/15 text-[#c9f4e5]"
                        : "border-white/10 bg-white/[0.04] text-white/55 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    {stream.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5">
            {onGoToClass && (prev || next) ? (
              <div className="mr-1 flex items-center rounded-lg border border-white/10 bg-white/[0.04]">
                <button
                  type="button"
                  disabled={!prev}
                  title={prev ? `Previous: ${prev.label}` : "First class"}
                  onClick={() => prev && onGoToClass(prev)}
                  className="flex h-7 w-7 items-center justify-center rounded-l-lg text-white/55 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="h-4 w-px bg-white/10" />
                <button
                  type="button"
                  disabled={!next}
                  title={next ? `Next: ${next.label}` : "Last class"}
                  onClick={() => next && onGoToClass(next)}
                  className="flex h-7 w-7 items-center justify-center rounded-r-lg text-white/55 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}

            <HeroLink href={hrefs.timetable} icon={CalendarRange} label="Timetable" />
            <HeroLink href={hrefs.students} icon={Users} label="Students" />
            <HeroLink href={hrefs.fees} icon={CircleDollarSign} label="Fees" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Users;
  label: string;
}) {
  return (
    <Button
      asChild
      type="button"
      size="sm"
      variant="ghost"
      className="h-7 gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 text-[10px] font-semibold text-white/70 hover:bg-white/10 hover:text-white"
    >
      <Link href={href}>
        <Icon className="h-3 w-3" />
        {label}
      </Link>
    </Button>
  );
}
