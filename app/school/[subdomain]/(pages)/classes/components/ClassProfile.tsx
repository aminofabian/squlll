"use client";

import { useMemo } from "react";
import { Mail, UserRound, UserPlus } from "lucide-react";
import type { GradeLevel, Level } from "@/lib/types/school-config";
import { useClassTeacherAssignment } from "@/lib/hooks/useClassTeacherAssignment";
import { cn } from "@/lib/utils";
import {
  classHealth,
  computeClassReadiness,
  initials,
} from "../utils/classPulse";
import { useClassSubjectsForLevel } from "../utils/useClassSubjectsForLevel";
import {
  filterStudentsForClass,
  type ClassRosterStudent,
} from "../utils/filterStudentsForClass";
import {
  feesClassHref,
  studentsClassHref,
  timetableClassHref,
} from "../utils/class-page-links";
import { useClassFeeHealth } from "../hooks/useClassFeeHealth";
import { useClassPerformance } from "../hooks/useClassPerformance";
import { useClassLeadership } from "../hooks/useClassLeadership";
import { ClassProfileHero, type ClassNeighbour } from "./ClassProfileHero";
import { ClassStatStrip } from "./ClassStatStrip";
import { ClassSubjectStudio } from "./ClassSubjectStudio";
import { ClassMeritBoard } from "./ClassMeritBoard";
import { ClassLeadershipCard } from "./ClassLeadershipCard";
import { ClassFeeCard } from "./ClassFeeCard";
import { ClassStudentsRoster } from "./ClassStudentsRoster";
import { ClassDetailQuickLinks } from "./ClassDetailQuickLinks";

interface StudentLike {
  id?: string;
  admission_number?: string;
  streamId?: string | null;
  streamName?: string | null;
  feesOwed?: number;
  grade?: { gradeLevel?: { id?: string; name?: string } } | string;
  user?: { name?: string; email?: string };
}

interface ClassProfileProps {
  level: Level;
  grade: GradeLevel;
  displayName: string;
  levelName: string;
  streamId: string;
  streamName?: string;
  students: StudentLike[];
  schoolStudentCount: number;
  onStreamSelect: (streamId: string) => void;
  onAssignTeacher: () => void;
  onAddSubject: () => void;
  prevClass?: ClassNeighbour | null;
  nextClass?: ClassNeighbour | null;
  onGoToClass?: (neighbour: ClassNeighbour) => void;
}

export function ClassProfile({
  level,
  grade,
  displayName,
  levelName,
  streamId,
  streamName,
  students,
  schoolStudentCount,
  onStreamSelect,
  onAssignTeacher,
  onAddSubject,
  prevClass,
  nextClass,
  onGoToClass,
}: ClassProfileProps) {
  const roster = useMemo<ClassRosterStudent[]>(
    () => filterStudentsForClass(students, grade.id, streamId || undefined),
    [students, grade.id, streamId],
  );

  const admissions = useMemo(
    () => roster.map((student) => student.admissionNumber),
    [roster],
  );

  const { subjects, assignedCount, totalCount } = useClassSubjectsForLevel(
    level,
    grade.id,
  );

  const { data: streamTeacher } = useClassTeacherAssignment(
    null,
    streamId || null,
  );
  const { data: gradeTeacher } = useClassTeacherAssignment(grade.id, null);
  const classTeacher = streamId
    ? (streamTeacher ?? gradeTeacher)
    : gradeTeacher;
  const classTeacherRole = streamId
    ? streamTeacher
      ? "Stream teacher"
      : "Class teacher · whole grade"
    : "Class teacher";

  const { health: feeHealth, isLoading: feesLoading } = useClassFeeHealth(
    grade.id,
    admissions,
  );
  const performance = useClassPerformance(grade.id, streamId, streamName);
  const { leadership, assign, clear } = useClassLeadership(grade.id, streamId);

  const studentCount = roster.length;
  const hasTeacher = Boolean(classTeacher);
  const rosterBadges: Record<string, string> = {};
  if (leadership.prefect) {
    rosterBadges[leadership.prefect.studentId] = "Prefect";
  }
  if (leadership.deputy) {
    rosterBadges[leadership.deputy.studentId] = "Deputy";
  }
  const readiness = computeClassReadiness({
    studentCount,
    hasTeacher,
    assignedSubjects: assignedCount,
    totalSubjects: totalCount,
  });
  const health = classHealth({
    studentCount,
    hasTeacher,
    assignedSubjects: assignedCount,
    totalSubjects: totalCount,
  });

  const hrefs = {
    students: studentsClassHref(grade.id, {
      streamId: streamId || undefined,
    }),
    timetable: timetableClassHref(grade.id, streamId || null),
    fees: feesClassHref(displayName),
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      <ClassProfileHero
        displayName={displayName}
        levelName={levelName}
        streamName={streamName}
        streams={grade.streams ?? []}
        selectedStreamId={streamId}
        studentCount={studentCount}
        assignedSubjects={assignedCount}
        totalSubjects={totalCount}
        classTeacherName={classTeacher?.teacher.fullName}
        classTeacherRole={classTeacherRole}
        health={health}
        readiness={readiness}
        hrefs={hrefs}
        prev={prevClass}
        next={nextClass}
        onGoToClass={onGoToClass}
        onStreamSelect={onStreamSelect}
        onAssignTeacher={onAssignTeacher}
      />

      <ClassStatStrip
        studentCount={studentCount}
        schoolStudentCount={schoolStudentCount}
        classTeacherName={classTeacher?.teacher.fullName}
        assignedSubjects={assignedCount}
        totalSubjects={totalCount}
        feeHealth={feeHealth}
        classMean={performance.mean}
      />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
        <div className="min-w-0 space-y-3">
          <ClassSubjectStudio
            level={level}
            gradeId={grade.id}
            onAddSubject={onAddSubject}
          />

          <ClassMeritBoard
            performance={{
              ...performance,
              sessionName: performance.sessionName,
              isLoading: performance.isLoading,
              isError: performance.isError,
              hasAnySession: performance.hasAnySession,
            }}
            streamName={streamName}
          />

          <ClassStudentsRoster
            gradeId={grade.id}
            streamId={streamId || null}
            streamName={streamName}
            displayName={displayName}
            students={roster}
            showStreamColumn={!streamId && (grade.streams?.length ?? 0) > 1}
            maxRows={6}
            badges={rosterBadges}
          />
        </div>

        <aside className="min-w-0 space-y-3 lg:sticky lg:top-3">
          <TeacherCard
            name={classTeacher?.teacher.fullName}
            email={classTeacher?.teacher.email}
            role={classTeacherRole}
            onAssign={onAssignTeacher}
          />

          <ClassLeadershipCard
            leadership={leadership}
            roster={roster}
            gradeId={grade.id}
            onAssign={assign}
            onClear={clear}
          />

          <ClassFeeCard
            health={feeHealth}
            feesHref={hrefs.fees}
            isLoading={feesLoading}
          />

          <section>
            <p className="mb-1.5 px-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#1a4d42]/40 dark:text-white/30">
              Jump to
            </p>
            <ClassDetailQuickLinks
              gradeId={grade.id}
              gradeDisplayName={displayName}
              streamId={streamId || null}
              layout="stack"
            />
          </section>

          <p className="px-1 text-[9px] leading-relaxed text-[#1a4d42]/35 dark:text-white/25">
            {subjects.length} subject{subjects.length === 1 ? "" : "s"} on{" "}
            {level.name} · shared by every stream
          </p>
        </aside>
      </div>
    </div>
  );
}

function TeacherCard({
  name,
  email,
  role,
  onAssign,
}: {
  name?: string;
  email?: string;
  role: string;
  onAssign: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#1a4d42]/12 bg-white shadow-[0_1px_2px_rgba(10,31,26,0.04)] dark:border-white/10 dark:bg-[#0c1a17]">
      <div className="flex items-center gap-2 border-b border-[#1a4d42]/10 px-3.5 py-3 dark:border-white/10">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
          <UserRound className="h-4 w-4" />
        </span>
        <div>
          <h3 className="font-display text-sm tracking-tight text-[#0a1f1a] dark:text-white">
            {role}
          </h3>
          <p className="text-[10px] text-[#1a4d42]/50 dark:text-white/40">
            Owns attendance &amp; class welfare
          </p>
        </div>
      </div>

      {name ? (
        <div className="px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#246a59] to-[#1a4d42] text-[11px] font-bold text-white">
              {initials(name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-[#0a1f1a] dark:text-white">
                {name}
              </p>
              {email ? (
                <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-[#1a4d42]/45 dark:text-white/35">
                  <Mail className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{email}</span>
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onAssign}
              className="shrink-0 rounded-md border border-[#1a4d42]/12 px-2 py-1 text-[10px] font-semibold text-[#1a4d42]/60 transition-colors hover:border-[#246a59]/35 hover:text-[#246a59] dark:border-white/10 dark:text-white/50 dark:hover:text-white"
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        <div className="px-3.5 py-4">
          <p className="text-[11px] leading-relaxed text-[#1a4d42]/50 dark:text-white/40">
            No {role.toLowerCase()} assigned. Assign one so parents and staff
            know who to contact.
          </p>
          <button
            type="button"
            onClick={onAssign}
            className={cn(
              "mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#0a1f1a] px-2.5 py-1.5 text-[10px] font-semibold text-white transition-colors hover:bg-[#246a59]",
            )}
          >
            <UserPlus className="h-3 w-3" />
            Assign teacher
          </button>
        </div>
      )}
    </section>
  );
}
