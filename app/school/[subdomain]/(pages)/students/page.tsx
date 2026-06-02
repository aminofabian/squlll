"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen, Loader2, X } from "lucide-react";
import { CreateStudentDrawer } from "./components/CreateStudentDrawer";
import { StudentsEmptyHero } from "./components/StudentsEmptyHero";
import { StudentDetailsView } from "./components/StudentDetailsView";
import { StudentsOverviewBar } from "./components/StudentsOverviewBar";
import { StudentsTable, type StudentRow } from "./components/StudentsTable";
import { AssignGradeStreamDialog } from "./components/AssignGradeStreamDialog";
import { StudentsDirectorySidebar } from "./components/StudentsDirectorySidebar";
import { StudentsFilterBar } from "./components/StudentsFilterBar";
import { StudentsBulkActions } from "./components/StudentsBulkActions";
import { useStudents, useStudentsFromStore } from "@/lib/hooks/useStudents";
import { useSchoolConfig } from "@/lib/hooks/useSchoolConfig";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { GraphQLStudent } from "@/types/student";
import { formatGradeDisplayName } from "@/lib/utils/grade-display";
import { cn } from "@/lib/utils";
import type { SchoolConfiguration } from "@/lib/types/school-config";
import {
  matchesStudentFilter,
  type StudentFilter,
} from "./utils/students-utils";
import {
  studentsControlDivider,
  studentsControlShell,
  studentsIconButton,
  studentsSearchChip,
} from "./components/students-ui";

function resolveStreamName(
  config: SchoolConfiguration | null,
  gradeId: string | undefined,
  streamId: string | null | undefined,
  streamName?: string | null,
): string {
  if (streamName) return streamName;
  if (!streamId || !gradeId || !config?.selectedLevels) return "—";
  for (const level of config.selectedLevels) {
    const grade = level.gradeLevels?.find((g) => g.id === gradeId);
    const stream = grade?.streams?.find((s) => s.id === streamId);
    if (stream) return stream.name;
  }
  return "—";
}

function gradeHasStreams(
  config: SchoolConfiguration | null,
  gradeId: string | undefined,
): boolean {
  if (!gradeId || !config?.selectedLevels) return false;
  for (const level of config.selectedLevels) {
    const grade = level.gradeLevels?.find((g) => g.id === gradeId);
    if (grade) return (grade.streams?.length ?? 0) > 0;
  }
  return false;
}

function mapGraphQLStudent(
  student: GraphQLStudent,
  config: SchoolConfiguration | null,
): StudentRow {
  const name =
    student.user?.name ||
    (student.user?.email
      ? student.user.email.split("@")[0].replace(/[0-9]/g, " ").trim()
      : `Student ${student.admission_number}`);

  const gradeName =
    typeof student.grade === "object"
      ? student.grade?.gradeLevel?.name || "—"
      : student.grade || "—";

  const gradeId =
    typeof student.grade === "object"
      ? student.grade?.id || student.grade?.gradeLevel?.id
      : undefined;

  const streamId = student.streamId;
  const resolvedStream = resolveStreamName(
    config,
    gradeId,
    streamId,
    student.streamName,
  );
  const missingStream =
    gradeHasStreams(config, gradeId) && resolvedStream === "—";

  return {
    id: student.id,
    name,
    admissionNumber: student.admission_number,
    grade: formatGradeDisplayName(gradeName),
    gradeId,
    stream: missingStream ? "Not assigned" : resolvedStream,
    streamId,
    missingStream,
    status: student.isActive ? ("active" as const) : ("inactive" as const),
  };
}

export default function StudentsPage() {
  const searchParams = useSearchParams();
  const openAddStudent = searchParams.get("action") === "add";
  const deepLinkStudentId = searchParams.get("studentId");

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [displayedStudentsCount, setDisplayedStudentsCount] = useState(10);
  const [studentFilter, setStudentFilter] = useState<StudentFilter>("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [assignTarget, setAssignTarget] = useState<StudentRow | null>(null);

  const {
    students: graphqlStudents,
    isLoading,
    error,
  } = useStudentsFromStore();
  const { refetch } = useStudents();
  const { isLoading: configLoading, error: configError } = useSchoolConfig();
  const { config } = useSchoolConfigStore();

  const students = useMemo(() => {
    return graphqlStudents
      .filter((s) => s?.id && s?.admission_number)
      .map((s) => mapGraphQLStudent(s, config));
  }, [graphqlStudents, config]);

  const grades = useMemo(() => {
    const unique = new Set<string>();
    for (const student of students) {
      if (student.grade && student.grade !== "—") {
        unique.add(student.grade);
      }
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [students]);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) ?? null,
    [students, selectedStudentId],
  );

  useEffect(() => {
    if (
      deepLinkStudentId &&
      students.some((s) => s.id === deepLinkStudentId) &&
      selectedStudentId !== deepLinkStudentId
    ) {
      setSelectedStudentId(deepLinkStudentId);
    }
  }, [deepLinkStudentId, students, selectedStudentId]);

  const filteredStudents = useMemo(() => {
    let result = [...students];

    if (gradeFilter !== "all") {
      result = result.filter((s) => s.grade === gradeFilter);
    }

    result = result.filter((s) => matchesStudentFilter(s, studentFilter));
    result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [students, gradeFilter, studentFilter]);

  const tableStudents = useMemo(() => {
    if (!searchTerm.trim()) return filteredStudents;
    const q = searchTerm.toLowerCase();
    return filteredStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q) ||
        s.grade.toLowerCase().includes(q),
    );
  }, [filteredStudents, searchTerm]);

  const filterCounts = useMemo(
    () => ({
      all: students.length,
      active: students.filter((s) => s.status === "active").length,
      inactive: students.filter((s) => s.status === "inactive").length,
      missingClass: students.filter((s) => s.missingStream).length,
    }),
    [students],
  );

  const gradesWithStudents = useMemo(() => {
    const ids = new Set<string>();
    for (const s of students) {
      if (s.gradeId) ids.add(s.gradeId);
    }
    return ids.size;
  }, [students]);

  const activeCount = students.filter((s) => s.status === "active").length;
  const inactiveCount = students.length - activeCount;

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedStudentId(null);
    setStudentFilter("all");
    setGradeFilter("all");
  }, []);

  const pageError = error || configError;
  const pageLoading = isLoading || configLoading;

  const emptyMessage =
    searchTerm || gradeFilter !== "all" || studentFilter !== "all"
      ? "No students match your filters"
      : "No students yet";

  if (pageError) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50/80 dark:bg-slate-950">
        <div className="rounded-xl border border-red-200 bg-white px-6 py-8 text-center dark:border-red-900 dark:bg-slate-900">
          <h2 className="mb-1 text-base font-semibold text-red-600">
            Error loading students
          </h2>
          <p className="text-sm text-slate-500">
            {pageError instanceof Error ? pageError.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/80 dark:bg-slate-950">
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200/80 bg-slate-50/50 transition-all duration-300 dark:border-slate-800 dark:bg-slate-950",
          "md:relative md:translate-x-0",
          isSidebarMinimized ? "w-14" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 border-b border-slate-200/80 px-2 py-2 dark:border-slate-800",
            isSidebarMinimized ? "justify-center" : "justify-end",
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            className={studentsIconButton}
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
          >
            {isSidebarMinimized ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!isSidebarMinimized ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-3">
            <StudentsDirectorySidebar
              students={filteredStudents}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedStudentId={selectedStudentId}
              onStudentSelect={setSelectedStudentId}
              displayedStudentsCount={displayedStudentsCount}
              onLoadMore={() =>
                setDisplayedStudentsCount((prev) => prev + 10)
              }
              isLoading={pageLoading}
            />
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-slate-200/50 bg-slate-50/80 px-4 py-3 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-950/80 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {selectedStudent ? selectedStudent.name : "Students"}
                </h1>
                <p className="mt-0.5 text-xs text-slate-400">
                  {selectedStudent
                    ? `${selectedStudent.grade} · ${selectedStudent.admissionNumber} · ${selectedStudent.status === "active" ? "Active" : "Inactive"}`
                    : "Browse, enroll, and manage enrolled students"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!selectedStudentId ? (
                  <CreateStudentDrawer
                    defaultOpen={openAddStudent}
                    onStudentCreated={() => {
                      refetch();
                      clearFilters();
                    }}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
            {pageLoading && students.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading students…
              </div>
            ) : null}

            {selectedStudent ? (
              <StudentDetailsView
                studentId={selectedStudent.id}
                onClose={() => setSelectedStudentId(null)}
                schoolConfig={config ?? undefined}
                embedded
                onEnrollmentUpdated={() => refetch()}
              />
            ) : students.length === 0 && !pageLoading ? (
              <StudentsEmptyHero
                defaultOpen={openAddStudent}
                onStudentCreated={() => {
                  refetch();
                  clearFilters();
                }}
              />
            ) : (
              <div className="space-y-5">
                <StudentsOverviewBar
                  total={students.length}
                  active={activeCount}
                  inactive={inactiveCount}
                  gradeCount={gradesWithStudents}
                  isLoading={pageLoading}
                />

                {!pageLoading && students.length > 0 ? (
                  <div className={studentsControlShell}>
                    <StudentsFilterBar
                      filter={studentFilter}
                      onFilterChange={setStudentFilter}
                      counts={filterCounts}
                      grades={grades}
                      gradeFilter={gradeFilter}
                      onGradeFilterChange={setGradeFilter}
                    />

                    {searchTerm || tableStudents.length > 0 ? (
                      <div
                        className={cn(
                          studentsControlDivider,
                          "flex flex-wrap items-center justify-between gap-2",
                        )}
                      >
                        {searchTerm && !selectedStudentId ? (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>Filtering by</span>
                            <button
                              type="button"
                              onClick={() => setSearchTerm("")}
                              className={studentsSearchChip}
                            >
                              &ldquo;{searchTerm}&rdquo;
                              <X className="h-3 w-3 text-slate-400" />
                            </button>
                          </div>
                        ) : (
                          <span />
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          <StudentsBulkActions students={tableStudents} />
                          <CreateStudentDrawer
                            triggerVariant="toolbar"
                            onStudentCreated={() => {
                              refetch();
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          studentsControlDivider,
                          "flex justify-end",
                        )}
                      >
                        <CreateStudentDrawer
                          triggerVariant="toolbar"
                          onStudentCreated={() => {
                            refetch();
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : null}

                <StudentsTable
                  students={tableStudents}
                  isLoading={pageLoading}
                  onStudentClick={setSelectedStudentId}
                  onAssignClass={setAssignTarget}
                  title="All students"
                  emptyMessage={emptyMessage}
                  showAddAction={tableStudents.length === 0}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {assignTarget ? (
        <AssignGradeStreamDialog
          studentId={assignTarget.id}
          studentName={assignTarget.name}
          currentGradeLevelId={assignTarget.gradeId}
          currentStreamId={assignTarget.streamId}
          open={Boolean(assignTarget)}
          onOpenChange={(open) => {
            if (!open) setAssignTarget(null);
          }}
          onSuccess={() => refetch()}
        />
      ) : null}
    </div>
  );
}
