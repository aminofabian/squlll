"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSchoolConfig } from "../../../../../lib/hooks/useSchoolConfig";
import { useTenantStatistics } from "../../../../../lib/hooks/useTenantStatistics";
import {
  CalendarDays,
  Plus,
  PanelLeftOpen,
  PanelLeftClose,
  UserPlus,
} from "lucide-react";
import { useStudentsStore } from "@/lib/stores/useStudentsStore";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { Button } from "@/components/ui/button";
import { SchoolSearchFilter } from "@/components/dashboard/SchoolSearchFilter";
import { CreateTermModal } from "./components/CreateTermModal";
import { ViewAcademicYearsDrawer } from "./components/ViewAcademicYearsDrawer";
import { ClassesStats } from "../classes/components/ClassesStats";
import { DashboardSchoolBar } from "./components/DashboardSchoolBar";
import { DashboardOverview } from "./components/DashboardOverview";
import { DashboardSetupBanner } from "./components/DashboardSetupBanner";
import { ClassesContextBar } from "../classes/components/ClassesContextBar";
import { GradeDetailsView } from "../classes/components/GradeDetailsView";
import {
  ClassActionBar,
  type ClassAction,
} from "../classes/components/ClassActionBar";
import { useCurrentAcademicYear } from "@/lib/hooks/useAcademicYears";
import { cn } from "@/lib/utils";
import { formatGradeDisplayName } from "@/lib/utils/grade-display";

// ─── Helpers ───────────────────────────────────────────────────

function getGradeDisplayName(gradeName: string): string {
  return formatGradeDisplayName(gradeName);
}

// ─── Component ─────────────────────────────────────────────────

export default function SchoolDashboard() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;

  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [selectedStreamId, setSelectedStreamId] = useState("");
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [showCreateTermModal, setShowCreateTermModal] = useState(false);

  // Data hooks
  const { getActiveAcademicYear } = useCurrentAcademicYear();
  const currentAcademicYear = getActiveAcademicYear();
  const { data: config, isLoading, error } = useSchoolConfig();
  const {
    data: tenantStats,
    isLoading: statsLoading,
  } = useTenantStatistics();
  const { students } = useStudentsStore();
  const { config: schoolConfig } = useSchoolConfigStore();

  // Selected grade info
  const selectedGradeInfo = useMemo(() => {
    if (!selectedGrade || !schoolConfig) return null;
    for (const level of schoolConfig.selectedLevels) {
      const grade = level.gradeLevels?.find((g) => g.id === selectedGrade);
      if (grade) {
        return { grade, level, displayName: getGradeDisplayName(grade.name) };
      }
    }
    return null;
  }, [selectedGrade, schoolConfig]);

  // Filter students by grade
  const filteredStudents = useMemo(() => {
    if (!selectedGrade || !selectedGradeInfo) return students;
    return students.filter((s) => {
      if (typeof s.grade === "string") return false;
      return (
        s.grade.gradeLevel.name.toLowerCase() ===
        selectedGradeInfo.grade.name.toLowerCase()
      );
    });
  }, [students, selectedGrade, selectedGradeInfo]);

  // Stats — only use real counts; never show fake deltas or random metrics
  const stats = useMemo(() => {
    const pool = selectedGrade ? filteredStudents : students;
    const totalStudents =
      !selectedGrade && tenantStats
        ? tenantStats.studentCount
        : pool.length;

    const gradeSet = new Set<string>();
    pool.forEach((s) => {
      if (typeof s.grade !== "string" && s.grade?.gradeLevel?.name) {
        gradeSet.add(s.grade.gradeLevel.name);
      }
    });
    const totalClasses = selectedGrade
      ? selectedGradeInfo?.grade.streams?.length || 1
      : gradeSet.size;

    const totalSubjects =
      selectedGrade && selectedGradeInfo
        ? selectedGradeInfo.level.subjects.length
        : schoolConfig?.selectedLevels.reduce(
            (sum, l) => sum + l.subjects.length,
            0,
          ) || 0;

    return {
      totalStudents,
      totalClasses,
      totalSubjects,
      attendanceRate: null as number | null,
      academicProgress: null as number | null,
    };
  }, [
    students,
    filteredStudents,
    selectedGrade,
    selectedGradeInfo,
    schoolConfig,
    tenantStats,
  ]);

  const selectedStreamName = useMemo(() => {
    if (!selectedStreamId || !selectedGradeInfo) return undefined;
    return selectedGradeInfo.grade.streams?.find((s) => s.id === selectedStreamId)
      ?.name;
  }, [selectedStreamId, selectedGradeInfo]);

  // Redirect if not configured
  useEffect(() => {
    if (!isLoading && !error && (!config || !config.selectedLevels?.length)) {
      router.push(`/school/${subdomain}`);
    }
  }, [config, isLoading, error, router, subdomain]);

  // Auto-collapse sidebar on medium screens
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

  const handleGradeSelect = useCallback((gradeId: string, levelId: string) => {
    setSelectedGrade(gradeId);
    setSelectedLevelId(levelId);
    setSelectedStreamId("");
  }, []);

  const handleStreamSelect = useCallback(
    (streamId: string, gradeId: string, levelId: string) => {
      setSelectedStreamId(streamId);
      if (gradeId !== selectedGrade || levelId !== selectedLevelId) {
        setSelectedGrade(gradeId);
        setSelectedLevelId(levelId);
      }
    },
    [selectedGrade, selectedLevelId],
  );

  const handleClearFilters = useCallback(() => {
    setSelectedGrade(null);
    setSelectedLevelId("");
    setSelectedStreamId("");
  }, []);

  const headerActions: ClassAction[] = [
    {
      id: "create-term",
      label: "Create term",
      icon: Plus,
      onClick: () => setShowCreateTermModal(true),
      disabled: !currentAcademicYear,
      disabledReason: "Add an academic year first",
    },
  ];

  const contextActions: ClassAction[] = [
    {
      id: "add-student",
      label: "Add student",
      icon: UserPlus,
      onClick: () => router.push("/students?action=add"),
    },
  ];

  // ─── Loading ───────────────────────────────────────────────

  if (isLoading || (statsLoading && !selectedGrade)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50/80 dark:bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#246a59] border-t-transparent" />
          <p className="text-sm text-slate-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50/80 dark:bg-slate-950">
        <div className="rounded-xl border border-red-200 bg-white px-6 py-8 text-center dark:border-red-900 dark:bg-slate-900">
          <h2 className="text-base font-semibold text-red-600 mb-1">
            Something went wrong
          </h2>
          <p className="text-sm text-slate-500">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            size="sm"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!config?.selectedLevels?.length) return null;

  // ─── Render ──────────────────────────────────────────────────

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
              isLoading={isLoading}
              selectedGradeId={selectedGrade || ""}
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
                  Dashboard
                </h1>
                {!selectedGrade && (
                  <p className="mt-0.5 text-xs text-slate-400">
                    Browse and select a grade in the sidebar to view activity.
                  </p>
                )}
              </div>
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
            </div>
            {!selectedGrade && (
              <div className="mt-2.5 flex flex-wrap items-center gap-x-1 gap-y-1 text-xs">
                <ViewAcademicYearsDrawer
                  onAcademicYearCreated={() => {}}
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded px-1 py-0.5 font-medium text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                    >
                      <CalendarDays className="h-3 w-3" />
                      Academic year
                    </button>
                  }
                />
                <span className="select-none text-slate-300 dark:text-slate-600">
                  ·
                </span>
                <ClassActionBar actions={headerActions} layout="links" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div
            className={cn(
              "mx-auto max-w-5xl p-4 sm:p-6",
              selectedGrade ? "space-y-4" : "space-y-5",
            )}
          >
            <DashboardSetupBanner />

            {!selectedGrade && (
              <ClassesStats
                config={schoolConfig}
                isLoading={isLoading}
                studentCount={tenantStats?.studentCount ?? students.length}
                studentsLoading={statsLoading}
              />
            )}

            {selectedGrade && selectedGradeInfo && (
              <ClassesContextBar
                levelName={selectedGradeInfo.level.name}
                gradeName={selectedGradeInfo.displayName}
                streamName={selectedStreamName}
                onClear={handleClearFilters}
                actions={contextActions}
              />
            )}

            {!selectedGrade ? (
              <>
                <DashboardSchoolBar
                  studentCount={stats.totalStudents}
                  teacherCount={tenantStats?.teacherCount}
                  streamCount={tenantStats?.streamCount}
                  attendanceRate={stats.attendanceRate}
                  academicProgress={stats.academicProgress}
                  isLoading={statsLoading}
                />
                <DashboardOverview
                  config={schoolConfig}
                  students={students}
                  isLoading={isLoading}
                />
              </>
            ) : (
              selectedGradeInfo && (
                <GradeDetailsView
                  grade={selectedGradeInfo.grade}
                  selectedStreamId={selectedStreamId || undefined}
                  onStreamSelect={(streamId) =>
                    handleStreamSelect(
                      streamId,
                      selectedGradeInfo.grade.id,
                      selectedGradeInfo.level.id,
                    )
                  }
                />
              )
            )}
          </div>
        </div>
      </div>

      {currentAcademicYear && (
        <CreateTermModal
          isOpen={showCreateTermModal}
          onClose={() => setShowCreateTermModal(false)}
          onSuccess={() => setShowCreateTermModal(false)}
          academicYear={currentAcademicYear}
        />
      )}
    </div>
  );
}
