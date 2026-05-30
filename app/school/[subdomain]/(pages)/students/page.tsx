"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { CreateStudentDrawer } from "./components/CreateStudentDrawer";
import { StudentDetailsView } from "./components/StudentDetailsView";
import { StudentsOverviewBar } from "./components/StudentsOverviewBar";
import { StudentsTable } from "./components/StudentsTable";
import { StudentsContextBar } from "./components/StudentsContextBar";
import { SchoolSearchFilter } from "@/components/dashboard/SchoolSearchFilter";
import { ClassesStats } from "../classes/components/ClassesStats";
import { ClassesContextBar } from "../classes/components/ClassesContextBar";
import { GradeDetailsView } from "../classes/components/GradeDetailsView";
import { useStudents, useStudentsFromStore } from "@/lib/hooks/useStudents";
import { useSchoolConfig } from "@/lib/hooks/useSchoolConfig";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { GraphQLStudent } from "@/types/student";
import { formatGradeDisplayName } from "@/lib/utils/grade-display";
import { cn } from "@/lib/utils";
import type { SchoolConfiguration } from "@/lib/types/school-config";

function resolveStreamName(
  config: SchoolConfiguration | null,
  gradeId: string | undefined,
  streamId: string | null | undefined,
): string {
  if (!streamId || !gradeId || !config?.selectedLevels) return "—";
  for (const level of config.selectedLevels) {
    const grade = level.gradeLevels?.find((g) => g.id === gradeId);
    const stream = grade?.streams?.find((s) => s.id === streamId);
    if (stream) return stream.name;
  }
  return "—";
}

function mapGraphQLStudent(
  student: GraphQLStudent,
  config: SchoolConfiguration | null,
) {
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
      ? student.grade?.gradeLevel?.id
      : undefined;

  const streamId = student.streamId;

  return {
    id: student.id,
    name,
    admissionNumber: student.admission_number,
    grade: formatGradeDisplayName(gradeName),
    gradeId,
    stream: resolveStreamName(config, gradeId, streamId),
    streamId,
    status: student.isActive ? ("active" as const) : ("inactive" as const),
  };
}

export default function StudentsPage() {
  const searchParams = useSearchParams();
  const openAddStudent = searchParams.get("action") === "add";

  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [selectedStreamId, setSelectedStreamId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

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

  const selectedGrade = useMemo(() => {
    if (!selectedGradeId || !config) return null;
    for (const level of config.selectedLevels) {
      const grade = level.gradeLevels?.find((g) => g.id === selectedGradeId);
      if (grade) {
        const stream = selectedStreamId
          ? grade.streams?.find((s) => s.id === selectedStreamId)
          : null;
        return {
          name: grade.name,
          displayName: formatGradeDisplayName(grade.name),
          levelName: level.name,
          streamName: stream?.name,
          grade,
          level,
        };
      }
    }
    return null;
  }, [selectedGradeId, selectedStreamId, config]);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) ?? null,
    [students, selectedStudentId],
  );

  const filteredStudents = useMemo(() => {
    let result = [...students];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.admissionNumber.toLowerCase().includes(q),
      );
    }

    if (selectedGradeId) {
      result = result.filter((s) => s.gradeId === selectedGradeId);
    }

    if (selectedStreamId) {
      result = result.filter((s) => s.streamId === selectedStreamId);
    }

    result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [students, searchTerm, selectedGradeId, selectedStreamId]);

  const gradesWithStudents = useMemo(() => {
    const ids = new Set<string>();
    for (const s of students) {
      if (s.gradeId) ids.add(s.gradeId);
    }
    return ids.size;
  }, [students]);

  const activeCount = students.filter((s) => s.status === "active").length;
  const inactiveCount = students.length - activeCount;

  const handleGradeSelect = useCallback((gradeId: string, levelId: string) => {
    setSelectedGradeId(gradeId);
    setSelectedLevelId(levelId);
    setSelectedStreamId("");
    setSelectedStudentId(null);
    setSearchTerm("");
  }, []);

  const handleStreamSelect = useCallback(
    (streamId: string, gradeId: string, levelId: string) => {
      setSelectedStreamId(streamId);
      setSelectedStudentId(null);
      if (gradeId !== selectedGradeId || levelId !== selectedLevelId) {
        setSelectedGradeId(gradeId);
        setSelectedLevelId(levelId);
      }
    },
    [selectedGradeId, selectedLevelId],
  );

  const clearFilters = useCallback(() => {
    setSelectedGradeId("");
    setSelectedLevelId("");
    setSelectedStreamId("");
    setSearchTerm("");
    setSelectedStudentId(null);
  }, []);

  useEffect(() => {
    const handle = () => {
      const w = window.innerWidth;
      if (w >= 768 && w < 1200) setIsSidebarMinimized(true);
      else if (w >= 1200) setIsSidebarMinimized(false);
    };
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  const pageError = error || configError;
  const pageLoading = isLoading || configLoading;
  const isGradeView = !!selectedGradeId && !selectedStudentId;
  const isOverview = !selectedGradeId && !selectedStudentId;

  const tableTitle = selectedGrade
    ? selectedGrade.streamName
      ? `${selectedGrade.displayName} · ${selectedGrade.streamName}`
      : selectedGrade.displayName
    : "All students";

  const tableDescription = isOverview
    ? "Select a row to view student details."
    : filteredStudents.length === 0
      ? "No students enrolled in this grade yet."
      : `${filteredStudents.length} enrolled`;

  const emptyMessage = selectedGradeId
    ? "No students in this grade yet"
    : searchTerm
      ? "No students match your search"
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
      {/* Sidebar */}
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
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
          >
            {isSidebarMinimized ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!isSidebarMinimized && (
          <div className="flex-1 overflow-hidden px-3 pb-3">
            <SchoolSearchFilter
              className="h-full"
              variant="minimal"
              type="grades"
              onGradeSelect={handleGradeSelect}
              onStreamSelect={handleStreamSelect}
              isLoading={pageLoading}
              selectedGradeId={selectedGradeId}
              selectedStreamId={selectedStreamId}
            />
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-slate-200/80 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Students
                </h1>
                {isOverview && (
                  <p className="mt-0.5 text-xs text-slate-400">
                    Browse and enroll students by grade.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isSidebarMinimized && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                    onClick={() => setIsSidebarMinimized(false)}
                  >
                    <PanelLeftOpen className="h-4 w-4" />
                  </Button>
                )}
                {!selectedStudentId && (
                  <CreateStudentDrawer
                    defaultOpen={openAddStudent}
                    onStudentCreated={() => {
                      refetch();
                      clearFilters();
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div
            className={cn(
              "mx-auto max-w-5xl p-4 sm:p-6",
              selectedStudentId || selectedGradeId ? "space-y-4" : "space-y-5",
            )}
          >
            {selectedStudent ? (
              <>
                <StudentsContextBar
                  gradeName={selectedStudent.grade}
                  studentName={selectedStudent.name}
                  admissionNumber={selectedStudent.admissionNumber}
                  onClear={() => setSelectedStudentId(null)}
                />
                <StudentDetailsView
                  studentId={selectedStudent.id}
                  onClose={() => setSelectedStudentId(null)}
                  schoolConfig={config}
                  embedded
                />
              </>
            ) : (
              <>
                {isOverview && (
                  <>
                    <ClassesStats
                      config={config}
                      isLoading={pageLoading}
                      studentCount={students.length}
                      studentsLoading={pageLoading}
                    />
                    <StudentsOverviewBar
                      total={students.length}
                      active={activeCount}
                      inactive={inactiveCount}
                      gradeCount={gradesWithStudents}
                      isLoading={pageLoading}
                    />
                  </>
                )}

                {selectedGrade && (
                  <>
                    <ClassesContextBar
                      levelName={selectedGrade.levelName}
                      gradeName={selectedGrade.displayName}
                      streamName={selectedGrade.streamName}
                      onClear={clearFilters}
                      actions={[]}
                    />
                    <GradeDetailsView
                      grade={selectedGrade.grade}
                      selectedStreamId={selectedStreamId || undefined}
                      onStreamSelect={(streamId) =>
                        handleStreamSelect(
                          streamId,
                          selectedGrade.grade.id,
                          selectedGrade.level.id,
                        )
                      }
                    />
                  </>
                )}

                {searchTerm && isOverview && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Search results
                    </span>
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      &ldquo;{searchTerm}&rdquo;
                      <X className="h-3 w-3 text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Clear search
                    </button>
                  </div>
                )}

                <StudentsTable
                  students={filteredStudents}
                  isLoading={pageLoading}
                  onStudentClick={setSelectedStudentId}
                  title={tableTitle}
                  description={tableDescription}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  hideGradeColumn={isGradeView}
                  emptyMessage={emptyMessage}
                  showAddAction={filteredStudents.length === 0}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
