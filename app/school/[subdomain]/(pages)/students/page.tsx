"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  parseStudentProfileTab,
  type StudentProfileTab,
} from "./components/student-profile-tabs";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen, Loader2, X } from "lucide-react";
import { CreateStudentDrawer } from "./components/CreateStudentDrawer";
import { StudentsEmptyHero } from "./components/StudentsEmptyHero";
import { StudentDetailsView } from "./components/StudentDetailsView";
import { StudentsPulseHero } from "./components/StudentsPulseHero";
import { StudentsGradeMix } from "./components/StudentsGradeMix";
import {
  StudentsRecentlyEnrolled,
  type RecentStudent,
} from "./components/StudentsRecentlyEnrolled";
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
    createdAt: student.createdAt,
  };
}

const STUDENT_TAB_PARAM = "tab";

export default function StudentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const openAddStudent = searchParams.get("action") === "add";
  const deepLinkStudentId = searchParams.get("studentId");
  const deepLinkTab = searchParams.get(STUDENT_TAB_PARAM);

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [profileTab, setProfileTab] = useState<StudentProfileTab>("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [displayedStudentsCount, setDisplayedStudentsCount] = useState(10);
  const [studentFilter, setStudentFilter] = useState<StudentFilter>("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [gradeIdFilter, setGradeIdFilter] = useState<string | null>(null);
  const [streamIdFilter, setStreamIdFilter] = useState<string | null>(null);
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

  const syncStudentUrl = useCallback(
    (studentId: string | null, tab?: StudentProfileTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (studentId) {
        params.set("studentId", studentId);
        if (tab) params.set(STUDENT_TAB_PARAM, tab);
      } else {
        params.delete("studentId");
        params.delete(STUDENT_TAB_PARAM);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const selectStudent = useCallback(
    (studentId: string, tab: StudentProfileTab = "overview") => {
      setSelectedStudentId(studentId);
      setProfileTab(tab);
      syncStudentUrl(studentId, tab);
    },
    [syncStudentUrl],
  );

  const closeStudentProfile = useCallback(() => {
    setSelectedStudentId(null);
    setProfileTab("overview");
    syncStudentUrl(null);
  }, [syncStudentUrl]);

  const handleProfileTabChange = useCallback(
    (tab: StudentProfileTab) => {
      setProfileTab(tab);
      if (selectedStudentId) {
        syncStudentUrl(selectedStudentId, tab);
      }
    },
    [selectedStudentId, syncStudentUrl],
  );

  useEffect(() => {
    if (
      deepLinkStudentId &&
      students.some((s) => s.id === deepLinkStudentId) &&
      selectedStudentId !== deepLinkStudentId
    ) {
      setSelectedStudentId(deepLinkStudentId);
      setProfileTab(parseStudentProfileTab(deepLinkTab));
    }
  }, [deepLinkStudentId, deepLinkTab, students, selectedStudentId]);

  useEffect(() => {
    const gradeId = searchParams.get("gradeId");
    const streamId = searchParams.get("streamId");
    if (!gradeId || !config?.selectedLevels) {
      setGradeIdFilter(null);
      setStreamIdFilter(null);
      return;
    }

    setGradeIdFilter(gradeId);
    setStreamIdFilter(streamId);

    for (const level of config.selectedLevels) {
      const grade = level.gradeLevels?.find((g) => g.id === gradeId);
      if (grade) {
        setGradeFilter(formatGradeDisplayName(grade.name));
        break;
      }
    }
  }, [searchParams, config?.selectedLevels]);

  useEffect(() => {
    if (!selectedStudentId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeStudentProfile();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedStudentId, closeStudentProfile]);

  const filteredStudents = useMemo(() => {
    let result = [...students];

    if (gradeIdFilter) {
      result = result.filter((s) => s.gradeId === gradeIdFilter);
      if (streamIdFilter) {
        result = result.filter((s) => s.streamId === streamIdFilter);
      }
    } else if (gradeFilter !== "all") {
      result = result.filter((s) => s.grade === gradeFilter);
    }

    result = result.filter((s) => matchesStudentFilter(s, studentFilter));
    result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [students, gradeFilter, gradeIdFilter, streamIdFilter, studentFilter]);

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

  const missingClassCount = filterCounts.missingClass;

  const gradesWithStudents = useMemo(() => {
    const ids = new Set<string>();
    for (const s of students) {
      if (s.gradeId) ids.add(s.gradeId);
    }
    return ids.size;
  }, [students]);

  const activeCount = students.filter((s) => s.status === "active").length;
  const inactiveCount = students.length - activeCount;

  const gradeMixRows = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of students) {
      if (!s.grade || s.grade === "—") continue;
      counts.set(s.grade, (counts.get(s.grade) ?? 0) + 1);
    }
    const total = students.length || 1;
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([grade, count]) => ({
        grade,
        count,
        percent: Math.round((count / total) * 100),
      }));
  }, [students]);

  const recentlyEnrolled = useMemo((): RecentStudent[] => {
    return [...students]
      .filter((s) => s.createdAt)
      .sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
      )
      .slice(0, 6)
      .map((s) => ({
        id: s.id,
        name: s.name,
        grade: s.grade,
        admissionNumber: s.admissionNumber,
        createdAt: s.createdAt!,
      }));
  }, [students]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    closeStudentProfile();
    setStudentFilter("all");
    setGradeFilter("all");
    setGradeIdFilter(null);
    setStreamIdFilter(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("gradeId");
    params.delete("streamId");
    if (params.get("action") === "add") {
      /* keep add action */
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [closeStudentProfile, pathname, router, searchParams]);

  const pageError = error || configError;
  const pageLoading = isLoading || configLoading;

  const hasClassFilter = Boolean(gradeIdFilter);
  const emptyMessage =
    searchTerm ||
    gradeFilter !== "all" ||
    studentFilter !== "all" ||
    hasClassFilter
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
    <div className="flex h-screen overflow-hidden bg-[#f8f9fb] dark:bg-slate-950">
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
              onStudentSelect={selectStudent}
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
        <div className="shrink-0 border-b border-slate-200/60 bg-[#f8f9fb]/90 px-4 py-3 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/90 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {selectedStudent ? "Student profile" : "Students"}
                </h1>
                <p className="mt-0.5 text-xs text-slate-400">
                  {selectedStudent
                    ? `${selectedStudent.name} · ${selectedStudent.admissionNumber}`
                    : students.length > 0
                      ? `${tableStudents.length} showing · ${students.length} enrolled`
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
          <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
            {pageLoading && students.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading students…
              </div>
            ) : null}

            {selectedStudent ? (
              <StudentDetailsView
                studentId={selectedStudent.id}
                onClose={closeStudentProfile}
                schoolConfig={config ?? undefined}
                embedded
                onEnrollmentUpdated={() => refetch()}
                activeTab={profileTab}
                onTabChange={handleProfileTabChange}
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
              <div className="space-y-4">
                <StudentsPulseHero
                  total={students.length}
                  active={activeCount}
                  inactive={inactiveCount}
                  missingClass={missingClassCount}
                  gradeCount={gradesWithStudents}
                  isLoading={pageLoading}
                  onFilterSelect={setStudentFilter}
                />

                {!pageLoading &&
                students.length > 0 &&
                (recentlyEnrolled.length > 0 || gradeMixRows.length > 0) ? (
                  <div className="grid gap-4 lg:grid-cols-5">
                    {recentlyEnrolled.length > 0 ? (
                      <div
                        className={
                          gradeMixRows.length > 0 ? "lg:col-span-3" : "lg:col-span-5"
                        }
                      >
                        <StudentsRecentlyEnrolled
                          students={recentlyEnrolled}
                          selectedStudentId={selectedStudentId}
                          onSelect={selectStudent}
                        />
                      </div>
                    ) : null}
                    {gradeMixRows.length > 0 ? (
                      <div
                        className={
                          recentlyEnrolled.length > 0
                            ? "lg:col-span-2"
                            : "lg:col-span-5"
                        }
                      >
                        <StudentsGradeMix
                          rows={gradeMixRows}
                          total={students.length}
                          activeGrade={gradeFilter}
                          onGradeSelect={setGradeFilter}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {!pageLoading && students.length > 0 ? (
                  <div className={studentsControlShell}>
                    {gradeIdFilter ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#0073ea]/25 bg-[#0073ea]/[0.06] px-3 py-2.5 text-xs text-slate-600 dark:text-slate-300">
                        <span>
                          Filtered to class{" "}
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {gradeFilter !== "all" ? gradeFilter : "selected grade"}
                          </span>
                          {streamIdFilter
                            ? (() => {
                                for (const level of config?.selectedLevels ?? []) {
                                  const grade = level.gradeLevels?.find(
                                    (g) => g.id === gradeIdFilter,
                                  );
                                  const stream = grade?.streams?.find(
                                    (s) => s.id === streamIdFilter,
                                  );
                                  if (stream) {
                                    return (
                                      <>
                                        {" "}
                                        · stream{" "}
                                        <span className="font-semibold">
                                          {stream.name}
                                        </span>
                                      </>
                                    );
                                  }
                                }
                                return null;
                              })()
                            : null}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[11px] text-[#0073ea]"
                          onClick={clearFilters}
                        >
                          Clear class filter
                        </Button>
                      </div>
                    ) : null}

                    <StudentsFilterBar
                      filter={studentFilter}
                      onFilterChange={setStudentFilter}
                      counts={filterCounts}
                      grades={grades}
                      gradeFilter={gradeFilter}
                      onGradeFilterChange={(grade) => {
                        setGradeFilter(grade);
                        setGradeIdFilter(null);
                        setStreamIdFilter(null);
                        const params = new URLSearchParams(
                          searchParams.toString(),
                        );
                        params.delete("gradeId");
                        params.delete("streamId");
                        const qs = params.toString();
                        router.replace(
                          qs ? `${pathname}?${qs}` : pathname,
                          { scroll: false },
                        );
                      }}
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
                  onStudentClick={selectStudent}
                  onAssignClass={setAssignTarget}
                  title={
                    gradeFilter !== "all" || studentFilter !== "all"
                      ? "Filtered roster"
                      : "All students"
                  }
                  description={
                    tableStudents.length !== students.length
                      ? `${tableStudents.length} of ${students.length} students match your filters`
                      : undefined
                  }
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
