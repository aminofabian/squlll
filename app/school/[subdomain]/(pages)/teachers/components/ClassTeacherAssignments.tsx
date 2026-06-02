"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { graphqlClient } from "@/lib/graphql-client";
import { gql } from "graphql-request";
import { cn } from "@/lib/utils";
import { formatTeacherDate } from "../utils/teachers-utils";
import { buildClassesHref } from "../utils/classLinks";
import { teachersPanel } from "./teachers-ui";
import { Calendar, School, Users } from "lucide-react";

function EmptyPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
        {title}
      </p>
      <p className="mt-1 max-w-xs text-xs text-slate-400">{description}</p>
    </div>
  );
}

export interface ClassTeacherAssignmentItem {
  id: string;
  active?: boolean;
  startDate?: string;
  endDate?: string;
  stream?: {
    id: string;
    stream?: { id: string; name: string };
    tenantGradeLevel?: {
      id?: string;
      gradeLevel?: { id: string; name: string };
    };
  };
  gradeLevel?: {
    id: string;
    gradeLevel?: { id: string; name: string };
  };
}

interface StudentSummaryRow {
  gradeLevelId: string;
  streamId?: string | null;
}

const GET_STUDENT_COUNTS = gql`
  query GetStudentCountsForAssignments {
    allStudentsSummary {
      gradeLevelId
      streamId
    }
  }
`;

function useStudentCountsByAssignment() {
  return useQuery({
    queryKey: ["assignmentStudentCounts"],
    queryFn: async () => {
      const data = await graphqlClient.request<{
        allStudentsSummary: StudentSummaryRow[];
      }>(GET_STUDENT_COUNTS);
      return data.allStudentsSummary ?? [];
    },
    staleTime: 30_000,
  });
}

function getAssignmentLabel(assignment: ClassTeacherAssignmentItem): string {
  const streamName = assignment.stream?.stream?.name;
  const gradeFromStream =
    assignment.stream?.tenantGradeLevel?.gradeLevel?.name;
  const gradeName = assignment.gradeLevel?.gradeLevel?.name ?? gradeFromStream;

  if (streamName && gradeName) {
    return `${gradeName} · ${streamName}`;
  }
  if (streamName) return streamName;
  if (gradeName) return gradeName;
  return "Unknown class";
}

function getAssignmentType(assignment: ClassTeacherAssignmentItem): string {
  return assignment.stream?.stream?.name ? "Stream class teacher" : "Grade class teacher";
}

function getCountKeys(assignment: ClassTeacherAssignmentItem): {
  gradeLevelId?: string;
  streamId?: string;
} {
  const streamId = assignment.stream?.stream?.id;
  const gradeLevelId =
    assignment.gradeLevel?.gradeLevel?.id ??
    assignment.stream?.tenantGradeLevel?.gradeLevel?.id;

  if (streamId) return { gradeLevelId, streamId };
  if (gradeLevelId) return { gradeLevelId };
  return {};
}

function countStudents(
  students: StudentSummaryRow[],
  keys: { gradeLevelId?: string; streamId?: string },
): number {
  if (!keys.gradeLevelId && !keys.streamId) return 0;

  return students.filter((student) => {
    if (keys.streamId) {
      return student.streamId === keys.streamId;
    }
    return student.gradeLevelId === keys.gradeLevelId;
  }).length;
}

function AssignmentStatusBadge({ active }: { active?: boolean }) {
  const isActive = active !== false;

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-medium",
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
          : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400",
      )}
    >
      {isActive ? "Active" : "Ended"}
    </Badge>
  );
}

function AssignmentCard({
  assignment,
  studentCount,
  studentsLoading,
}: {
  assignment: ClassTeacherAssignmentItem;
  studentCount: number;
  studentsLoading: boolean;
}) {
  const label = getAssignmentLabel(assignment);
  const type = getAssignmentType(assignment);
  const startDate = formatTeacherDate(assignment.startDate);
  const endDate = formatTeacherDate(assignment.endDate);
  const classesHref = buildClassesHref(assignment);

  return (
    <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/30 dark:hover:bg-slate-800/50">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-900">
            <School className="h-4 w-4 text-slate-400" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {label}
              </p>
              <AssignmentStatusBadge active={assignment.active} />
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{type}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
              {startDate && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Since {startDate}
                </span>
              )}
              {endDate && (
                <span className="inline-flex items-center gap-1">
                  Ended {endDate}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" />
                {studentsLoading ? (
                  "Loading students…"
                ) : (
                  <>
                    {studentCount} student{studentCount !== 1 ? "s" : ""}
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        <Link
          href={classesHref}
          className="shrink-0 text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
        >
          View class →
        </Link>
      </div>
    </div>
  );
}

function AssignmentsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  );
}

interface ClassTeacherAssignmentsProps {
  assignments: ClassTeacherAssignmentItem[];
  teacherName: string;
}

export function ClassTeacherAssignments({
  assignments,
  teacherName,
}: ClassTeacherAssignmentsProps) {
  const { data: students = [], isLoading: studentsLoading } =
    useStudentCountsByAssignment();

  const assignmentsWithCounts = useMemo(
    () =>
      assignments.map((assignment) => ({
        assignment,
        studentCount: countStudents(students, getCountKeys(assignment)),
      })),
    [assignments, students],
  );

  const activeCount = assignments.filter((a) => a.active !== false).length;

  return (
    <div className={`${teachersPanel} overflow-hidden`}>
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Class teacher assignments
        </h3>
        <p className="mt-0.5 text-xs text-slate-400">
          {assignments.length > 0
            ? `${teacherName} is class teacher for ${assignments.length} class${assignments.length !== 1 ? "es" : ""}${activeCount > 0 ? ` · ${activeCount} active` : ""}`
            : `Classes where ${teacherName} is the class teacher`}
        </p>
      </div>
      <div className="p-4 sm:p-5">
        {assignments.length === 0 ? (
          <EmptyPanel
            icon={School}
            title="No class assignments"
            description={`${teacherName} is not assigned as a class teacher for any grade or stream yet.`}
          />
        ) : studentsLoading && students.length === 0 ? (
          <AssignmentsSkeleton />
        ) : (
          <div className="space-y-2">
            {assignmentsWithCounts.map(({ assignment, studentCount }) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                studentCount={studentCount}
                studentsLoading={studentsLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
