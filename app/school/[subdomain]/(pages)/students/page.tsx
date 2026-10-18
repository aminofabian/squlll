"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  parseStudentProfileTab,
  type StudentProfileTab,
} from "./components/student-profile-tabs";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen, Loader2, Users, X } from "lucide-react";
import { CreateStudentDrawer } from "./components/CreateStudentDrawer";
import { ImportStudentsDrawer } from "./components/ImportStudentsDrawer";
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
import {
  EditStudentIdentityDialog,
  type StudentIdentityTarget,
} from "./components/EditStudentIdentityDialog";
import { StudentsDirectorySidebar } from "./components/StudentsDirectorySidebar";
import { StudentsFilterBar } from "./components/StudentsFilterBar";
import { StudentsBulkActions } from "./components/StudentsBulkActions";
import { useStudents, useStudentsFromStore } from "@/lib/hooks/useStudents";
import { useSchoolConfig } from "@/lib/hooks/useSchoolConfig";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { GraphQLStudent } from "@/types/student";
import {
  formatGradeDisplayName,
  getGradeSortOrder,
} from "@/lib/utils/grade-display";
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
    email: student.user?.email,
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
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [studentFilter, setStudentFilter] = useState<StudentFilter>("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [gradeIdFilter, setGradeIdFilter] = useState<string | null>(null);
  const [streamIdFilter, setStreamIdFilter] = useState<string | null>(null);
  const [assignTarget, setAssignTarget] = useState<StudentRow | null>(null);
  const [identityTarget, setIdentityTarget] =
    useState<StudentIdentityTarget | null>(null);

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

  const classOptions = useMemo(() => {
    if (!config?.selectedLevels) return [];
    const counts = new Map<string, number>();
    for (const student of students) {
      if (!student.gradeId) continue;
      counts.set(student.gradeId, (counts.get(student.gradeId) ?? 0) + 1);
    }
    return config.selectedLevels.flatMap((level) =>
      [...(level.gradeLevels ?? [])]
        .sort((a, b) => getGradeSortOrder(a.name) - getGradeSortOrder(b.name))
        .map((grade) => ({
          id: grade.id,
          name: formatGradeDisplayName(grade.name),
          levelName: level.name,
          count: counts.get(grade.id) ?? 0,
          streams: grade.streams ?? [],
        })),
    );
  }, [config, students]);

  const selectedClassOption = useMemo(
    () => classOptions.find((option) => option.id === gradeIdFilter) ?? null,
    [classOptions, gradeIdFilter],
  );

  const streamOptions = useMemo(() => {
    if (!selectedClassOption) return [];
    const counts = new Map<string, number>();
    for (const student of students) {
      if (
        student.gradeId !== selectedClassOption.id ||
        !student.streamId
      ) {
        continue;
      }
      counts.set(student.streamId, (counts.get(student.streamId) ?? 0) + 1);
    }
    return (selectedClassOption.streams ?? []).map((stream) => ({
      id: stream.id,
      name: stream.name,
      count: counts.get(stream.id) ?? 0,
    }));
  }, [selectedClassOption, students]);

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
      setIsDirectoryOpen(false);
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

  const applyClassFilter = useCallback(
    (classId: string | null) => {
      const option = classId
        ? classOptions.find((item) => item.id === classId)
        : null;
      setGradeIdFilter(classId);
      setStreamIdFilter(null);
      setGradeFilter(option?.name ?? "all");

      const params = new URLSearchParams(searchParams.toString());
      if (classId) params.set("gradeId", classId);
      else params.delete("gradeId");
      params.delete("streamId");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, {
        scroll: false,
      });
    },
    [classOptions, pathname, router, searchParams],
  );

  const applyStreamFilter = useCallback(
    (streamId: string | null) => {
      setStreamIdFilter(streamId);
      const params = new URLSearchParams(searchParams.toString());
      if (streamId) params.set("streamId", streamId);
      else params.delete("streamId");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

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
      <div className="flex h-screen items-center justify-center bg-[#f3f7f5] dark:bg-[#071411]">
        <div className="rounded-none border border-red-300/80 bg-white px-6 py-8 text-center shadow-[3px_3px_0_0_rgba(10,31,26,0.04)] dark:border-red-900/50 dark:bg-[#0c1a17]">
          <h2 className="mb-1 font-display text-lg tracking-tight text-red-700 dark:text-red-400">
            Error loading students
          </h2>
          <p className="text-sm text-[#1a4d42]/55 dark:text-white/45">
            {pageError instanceof Error ? pageError.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f7f5] dark:bg-[#071411]">
      {isDirectoryOpen ? (
        <button
          type="button"
          aria-label="Close student directory"
          onClick={() => setIsDirectoryOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      ) : null}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#1a4d42]/12 bg-[#f8fbfa] transition-all duration-300 dark:border-white/10 dark:bg-[#0c1a17]",
          "md:relative md:translate-x-0",
          isDirectoryOpen ? "translate-x-0" : "-translate-x-full",
          isSidebarMinimized ? "w-14" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 border-b border-[#1a4d42]/10 px-2 py-2 dark:border-white/10",
            isSidebarMinimized ? "justify-center" : "justify-end",
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            className={cn(studentsIconButton, "hidden md:inline-flex")}
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
          >
            {isSidebarMinimized ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(studentsIconButton, "md:hidden")}
            onClick={() => setIsDirectoryOpen(false)}
            aria-label="Close student directory"
          >
            <X className="h-4 w-4" />
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
              onEditIdentity={(student) =>
                setIdentityTarget({
                  id: student.id,
                  name: student.name,
                  admissionNumber: student.admissionNumber,
                  email: student.email,
                })
              }
              isLoading={pageLoading}
            />
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-[#1a4d42]/12 bg-[#f8fbfa]/95 px-4 py-2.5 backdrop-blur-md dark:border-white/10 dark:bg-[#071411]/95 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#246a59]">
                  Enrollment
                </p>
                <h1 className="font-display text-xl tracking-tight text-[#0a1f1a] dark:text-white">
                  {selectedStudent ? "Student profile" : "Students"}
                </h1>
                <p className="mt-0.5 text-xs text-[#1a4d42]/50 dark:text-white/45">
                  {selectedStudent
                    ? `${selectedStudent.name} · ${selectedStudent.admissionNumber}`
                    : students.length > 0
                      ? `${tableStudents.length} showing · ${students.length} enrolled`
                      : "Browse, enroll, and manage enrolled students"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!selectedStudentId ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs md:hidden"
                      onClick={() => setIsDirectoryOpen(true)}
                    >
                      <Users className="h-3.5 w-3.5" />
                      Directory
                    </Button>
                    <ImportStudentsDrawer
                      onImported={() => {
                        refetch();
                        clearFilters();
                      }}
                    />
                    <CreateStudentDrawer
                      defaultOpen={openAddStudent}
                      onStudentCreated={() => {
                        refetch();
                        clearFilters();
                      }}
                    />
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl space-y-3 p-4 sm:p-5">
            {pageLoading && students.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-[#1a4d42]/55">
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
                          onGradeSelect={(name) => {
                            const option = classOptions.find(
                              (item) => item.name === name,
                            );
                            if (option) applyClassFilter(option.id);
                            else setGradeFilter(name);
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {!pageLoading && students.length > 0 ? (
                  <div className={studentsControlShell}>
                    <StudentsFilterBar
                      filter={studentFilter}
                      onFilterChange={setStudentFilter}
                      counts={filterCounts}
                      classOptions={classOptions}
                      classId={gradeIdFilter ?? "all"}
                      onClassChange={(classId) =>
                        applyClassFilter(classId === "all" ? null : classId)
                      }
                      streamOptions={streamOptions}
                      streamId={streamIdFilter ?? "all"}
                      onStreamChange={(streamId) =>
                        applyStreamFilter(
                          streamId === "all" ? null : streamId,
                        )
                      }
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
                          <ImportStudentsDrawer
                            triggerVariant="toolbar"
                            onImported={() => {
                              refetch();
                            }}
                          />
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
                        <div className="flex items-center gap-2">
                          <ImportStudentsDrawer
                            triggerVariant="toolbar"
                            onImported={() => {
                              refetch();
                            }}
                          />
                          <CreateStudentDrawer
                            triggerVariant="toolbar"
                            onStudentCreated={() => {
                              refetch();
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                <StudentsTable
                  students={tableStudents}
                  isLoading={pageLoading}
                  onStudentClick={selectStudent}
                  onAssignClass={setAssignTarget}
                  onEditIdentity={(student) =>
                    setIdentityTarget({
                      id: student.id,
                      name: student.name,
                      admissionNumber: student.admissionNumber,
                      email: student.email,
                    })
                  }
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
      <EditStudentIdentityDialog
        student={identityTarget}
        open={Boolean(identityTarget)}
        onOpenChange={(open) => {
          if (!open) setIdentityTarget(null);
        }}
        onSaved={() => {
          void refetch();
        }}
      />
    </div>
  );
}
