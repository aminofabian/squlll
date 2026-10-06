"use client";

import { useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  MoreHorizontal,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { GradeLevel, Level } from "@/lib/types/school-config";
import type { ClassAction } from "./ClassActionBar";
import { ClassDetailMetrics } from "./ClassDetailMetrics";
import { ClassSubjectsPanel } from "./ClassSubjectsPanel";
import { ClassSetupStrip } from "./ClassSetupStrip";
import { ClassStudentsRoster } from "./ClassStudentsRoster";
import { ClassDetailQuickLinks } from "./ClassDetailQuickLinks";
import { useClassTeacherAssignment } from "@/lib/hooks/useClassTeacherAssignment";
import { useClassSubjectsForLevel } from "../utils/useClassSubjectsForLevel";
import { filterStudentsForClass } from "../utils/filterStudentsForClass";
import { studentsClassHref } from "../utils/class-page-links";
import { cn } from "@/lib/utils";
import { classesDotGrid } from "./classes-ui";

interface StudentLike {
  grade?: {
    gradeLevel?: { id?: string; name?: string };
  } | string;
  streamId?: string | null;
}

interface ClassesClassDetailProps {
  displayName: string;
  levelName: string;
  streamName?: string;
  grade: GradeLevel;
  level: Level;
  selectedStreamId: string;
  students: StudentLike[];
  onClear: () => void;
  onStreamSelect: (streamId: string) => void;
  onAssignTeacher: () => void;
  actions: ClassAction[];
}

function countStreamStudents(
  students: StudentLike[],
  gradeId: string,
  streamId: string,
) {
  let n = 0;
  for (const s of students) {
    const gId =
      typeof s.grade === "object" ? s.grade?.gradeLevel?.id : undefined;
    if (gId === gradeId && s.streamId === streamId) n += 1;
  }
  return n;
}

function gradeStudentCount(students: StudentLike[], gradeId: string) {
  let n = 0;
  for (const s of students) {
    const gId =
      typeof s.grade === "object" ? s.grade?.gradeLevel?.id : undefined;
    if (gId === gradeId) n += 1;
  }
  return n;
}

function classMonogram(displayName: string) {
  const words = displayName.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function classStatus(
  studentCount: number,
  hasTeacher: boolean,
  subjectsCovered: boolean,
): { label: string; className: string } {
  if (studentCount === 0) {
    return {
      label: "Empty class",
      className: "border-white/15 bg-white/[0.06] text-white/60",
    };
  }
  if (!hasTeacher || !subjectsCovered) {
    return {
      label: "Setup in progress",
      className: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    };
  }
  return {
    label: "Ready to teach",
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  };
}

export function ClassesClassDetail({
  displayName,
  levelName,
  streamName,
  grade,
  level,
  selectedStreamId,
  students,
  onClear,
  onStreamSelect,
  onAssignTeacher,
  actions,
}: ClassesClassDetailProps) {
  const router = useRouter();
  const title = streamName ? `${displayName} · ${streamName}` : displayName;
  const streams = grade.streams ?? [];
  const hasStreams = streams.length > 0;
  const monogram = classMonogram(displayName);

  const streamStudentCount = selectedStreamId
    ? countStreamStudents(students, grade.id, selectedStreamId)
    : undefined;

  const { assignedCount, totalCount } = useClassSubjectsForLevel(
    level,
    grade.id,
  );
  const { data: classTeacher } = useClassTeacherAssignment(
      selectedStreamId ? null : grade.id,
      selectedStreamId || null,
    );
  const subjectsCovered =
    totalCount === 0 || assignedCount === totalCount;
  const studentCount =
    streamStudentCount ?? gradeStudentCount(students, grade.id);

  const status = classStatus(
    studentCount,
    Boolean(classTeacher),
    subjectsCovered,
  );
  const teacherRole = selectedStreamId ? "Stream teacher" : "Class teacher";

  const setupSteps = useMemo(
    () => [
      {
        id: "students",
        label: studentCount > 0 ? `${studentCount} enrolled` : "Enroll students",
        done: studentCount > 0,
        hint: "Students in this class group",
      },
      {
        id: "teacher",
        label: classTeacher ? "Teacher set" : "Assign teacher",
        done: Boolean(classTeacher),
        hint: teacherRole,
      },
      {
        id: "subjects",
        label:
          totalCount === 0
            ? "Add subjects"
            : subjectsCovered
              ? "All subjects staffed"
              : `${assignedCount}/${totalCount} subjects staffed`,
        done: subjectsCovered && totalCount > 0,
        hint: "Each subject needs a teacher assigned",
      },
    ],
    [
      studentCount,
      classTeacher,
      teacherRole,
      totalCount,
      subjectsCovered,
      assignedCount,
    ],
  );

  const menuActions = useMemo(
    () => actions.filter((a) => a.label !== "Assign teacher"),
    [actions],
  );

  const addSubjectAction = actions.find((a) => a.label === "Add subject");
  const curriculumRef = useRef<HTMLDivElement>(null);

  const rosterStudents = useMemo(
    () =>
      filterStudentsForClass(
        students,
        grade.id,
        selectedStreamId || undefined,
      ),
    [students, grade.id, selectedStreamId],
  );

  const showStreamColumn =
    !selectedStreamId && (grade.streams?.length ?? 0) > 1;

  const handleSetupStepClick = useCallback(
    (stepId: string) => {
      if (stepId === "students") {
        router.push(
          studentsClassHref(grade.id, {
            streamId: selectedStreamId || undefined,
            action: studentCount === 0 ? "add" : undefined,
          }),
        );
        return;
      }
      if (stepId === "teacher") {
        onAssignTeacher();
        return;
      }
      if (stepId === "subjects") {
        if (totalCount === 0 && addSubjectAction?.onClick) {
          addSubjectAction.onClick();
        } else {
          curriculumRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    },
    [
      grade.id,
      selectedStreamId,
      studentCount,
      onAssignTeacher,
      totalCount,
      addSubjectAction,
      router,
    ],
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <button
        type="button"
        onClick={onClear}
        className="group inline-flex items-center gap-1.5 text-xs font-medium text-[#1a4d42]/55 transition-colors hover:text-[#246a59]"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        Class directory
      </button>

      <div className="overflow-hidden rounded-none border border-[#1a4d42]/12 bg-white shadow-none dark:border-white/10 dark:bg-[#0c1a17]">
        <div className="relative overflow-hidden bg-[#0a1f1a] text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={classesDotGrid}
          />
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#246a59]/45 blur-3xl" />
          <div className="relative px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-none bg-gradient-to-br from-[#246a59] to-[#1a4d42] text-base font-bold tracking-tight text-white ring-1 ring-white/10 sm:h-16 sm:w-16 sm:text-lg">
                  {monogram}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8fe3c8]/80">
                    {levelName}
                  </p>
                  <h2 className="mt-0.5 font-display text-xl font-normal tracking-tight text-white sm:text-2xl">
                    {title}
                  </h2>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {studentCount === 0 ? (
                      <Link
                        href="/students?action=add"
                        className={cn(
                          "inline-flex items-center gap-1 rounded-none border px-2.5 py-0.5 text-[10px] font-semibold transition-colors hover:bg-white/10",
                          status.className,
                        )}
                      >
                        {status.label} — enroll students
                      </Link>
                    ) : (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-none border px-2.5 py-0.5 text-[10px] font-semibold",
                          status.className,
                        )}
                      >
                        {status.label === "Ready to teach" ? (
                          <Sparkles className="h-3 w-3" />
                        ) : null}
                        {status.label}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-none border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[11px] tabular-nums text-white/70">
                      <Users className="h-3 w-3" />
                      {studentCount} student{studentCount === 1 ? "" : "s"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-none border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[11px] tabular-nums text-white/70">
                      <BookOpen className="h-3 w-3" />
                      {totalCount === 0
                        ? "No subjects"
                        : `${assignedCount}/${totalCount} staffed`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                {classTeacher ? (
                  <div className="rounded-none border border-white/15 bg-white/[0.06] px-2.5 py-1.5 text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
                      {teacherRole}
                    </p>
                    <div className="mt-0.5 flex items-center justify-end gap-2">
                      <span className="max-w-[10rem] truncate text-xs font-semibold text-white">
                        {classTeacher.teacher.fullName}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[11px] text-[#8fe3c8] hover:bg-white/10"
                        onClick={onAssignTeacher}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 gap-1.5 rounded-none bg-[#246a59] text-xs text-white shadow-none hover:bg-[#1a4d42]"
                    onClick={onAssignTeacher}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Assign teacher
                  </Button>
                )}
                {menuActions.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 border-white/15 bg-white/[0.06] px-3 text-xs text-white/80 backdrop-blur-sm hover:bg-white/10 hover:text-white"
                        aria-label="More actions"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                        More
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {menuActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <DropdownMenuItem
                            key={action.id}
                            disabled={action.disabled}
                            onClick={action.onClick}
                            className="gap-2 text-sm"
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {action.label}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 sm:px-6 sm:py-5">

            {studentCount === 0 ? (
              <div className="mt-4 rounded-none border border-[#246a59]/25 bg-[#246a59]/[0.07] px-4 py-3.5 dark:border-[#246a59]/30 dark:bg-[#246a59]/10">
                <p className="text-sm font-semibold text-[#0a1f1a] dark:text-white">
                  No students in this class yet
                </p>
                <p className="mt-1 text-xs text-[#1a4d42]/65 dark:text-[#1a4d42]/45">
                  Enrol learners here first — then assign your {teacherRole.toLowerCase()} and subject teachers.
                </p>
                <Button
                  asChild
                  size="sm"
                  className="mt-3 h-9 gap-1.5 bg-[#246a59] text-xs hover:bg-[#1a4d42]"
                >
                  <Link href="/students?action=add">
                    Enrol students
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ) : null}

            <div className="mt-4">
              <ClassSetupStrip
                steps={setupSteps}
                onStepClick={handleSetupStepClick}
              />
            </div>

            <div className="mt-4">
              <ClassDetailQuickLinks
                gradeId={grade.id}
                gradeDisplayName={displayName}
                streamId={selectedStreamId || null}
              />
            </div>

            {hasStreams && !selectedStreamId && streams.length > 1 ? (
              <p className="mt-3 rounded-none border border-[#246a59]/15 bg-[#246a59]/5 px-3 py-2 text-xs leading-relaxed text-[#246a59] dark:bg-[#246a59]/10">
                Choose a stream to view enrollment and assign a stream teacher.
              </p>
            ) : null}

            {hasStreams ? (
              <div className="mt-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#1a4d42]/45">
                  Streams
                </p>
                <p className="mt-0.5 text-[11px] text-[#1a4d42]/55">
                  Divisions within this grade (e.g. A, B). The number is how
                  many students are in each stream.
                </p>
                <div className="mt-2 inline-flex max-w-full flex-wrap gap-1 rounded-none bg-[#e8f2ef]/90 p-1 dark:bg-slate-800/80">
                  {streams.map((stream) => {
                    const count = countStreamStudents(
                      students,
                      grade.id,
                      stream.id,
                    );
                    const active = selectedStreamId === stream.id;
                    return (
                      <button
                        key={stream.id}
                        type="button"
                        title={`${stream.name}: ${count} student${count !== 1 ? "s" : ""}`}
                        onClick={() => onStreamSelect(stream.id)}
                        className={cn(
                          "rounded-none px-3 py-2 text-left text-xs font-medium transition-all",
                          active
                            ? "bg-white text-[#246a59] shadow-none dark:bg-[#0c1a17] dark:text-[#4d9fff]"
                            : "text-[#1a4d42]/65 hover:text-[#0a1f1a] dark:text-[#1a4d42]/45 dark:hover:text-slate-200",
                        )}
                      >
                        <span className="block font-semibold">{stream.name}</span>
                        <span
                          className={cn(
                            "mt-0.5 block text-[10px] tabular-nums font-normal",
                            active ? "text-[#246a59]/80" : "text-[#1a4d42]/45",
                          )}
                        >
                          {count} student{count !== 1 ? "s" : ""}
                        </span>
                      </button>
                    );
                  })}
                  {streams.length > 1 ? (
                    <button
                      type="button"
                      title="View all streams in this grade combined"
                      onClick={() => onStreamSelect("")}
                      className={cn(
                        "rounded-none px-3 py-2 text-xs font-medium transition-all",
                        !selectedStreamId
                          ? "bg-white text-[#246a59] shadow-none dark:bg-[#0c1a17]"
                          : "text-[#1a4d42]/55 hover:text-[#0a1f1a] dark:hover:text-slate-200",
                      )}
                    >
                      All streams
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="mt-4">
              <ClassDetailMetrics
                gradeId={grade.id}
                streamName={streamName}
                streamStudentCount={streamStudentCount}
              />
            </div>
          </div>
        </div>

      <ClassStudentsRoster
        gradeId={grade.id}
        streamId={selectedStreamId || null}
        streamName={streamName}
        displayName={displayName}
        students={rosterStudents}
        showStreamColumn={showStreamColumn}
      />

      <div ref={curriculumRef}>
        <ClassSubjectsPanel
          level={level}
          selectedGradeId={grade.id}
          onAddSubject={addSubjectAction?.onClick}
        />
      </div>
    </div>
  );
}
