"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSchoolConfig } from "@/lib/hooks/useSchoolConfig";
import { useTenantStatistics } from "@/lib/hooks/useTenantStatistics";
import { useStudents } from "@/lib/hooks/useStudents";
import { useStudentsStore } from "@/lib/stores/useStudentsStore";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { Button } from "@/components/ui/button";
import { SchoolSearchFilter } from "@/components/dashboard/SchoolSearchFilter";
import { CreateTermModal } from "./components/CreateTermModal";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardOverview } from "./components/DashboardOverview";
import { DashboardSetupBanner } from "./components/DashboardSetupBanner";
import { DashboardLiveActivity } from "./components/DashboardLiveActivity";
import { DashboardSchoolBar } from "./components/DashboardSchoolBar";
import { DashboardQuickActions } from "./components/DashboardQuickActions";
import { DashboardGradeSheet } from "./components/DashboardGradeSheet";
import { DashboardPageSkeleton } from "./components/DashboardSkeleton";
import { DashboardSection } from "./components/DashboardSection";
import { ClassesContextBar } from "../classes/components/ClassesContextBar";
import { GradeDetailsView } from "../classes/components/GradeDetailsView";
import { useCurrentAcademicYear } from "@/lib/hooks/useAcademicYears";
import { cn } from "@/lib/utils";
import { formatGradeDisplayName } from "@/lib/utils/grade-display";

export default function SchoolDashboard() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;

  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [selectedStreamId, setSelectedStreamId] = useState("");
  const [isGradePanelOpen, setIsGradePanelOpen] = useState(false);
  const [isGradeSheetOpen, setIsGradeSheetOpen] = useState(false);
  const [showCreateTermModal, setShowCreateTermModal] = useState(false);

  const { getActiveAcademicYear } = useCurrentAcademicYear();
  const currentAcademicYear = getActiveAcademicYear();
  const { data: config, isLoading, error } = useSchoolConfig();
  const {
    data: tenantStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useTenantStatistics();
  const { isLoading: studentsQueryLoading } = useStudents();
  const { students, isLoading: studentsStoreLoading } = useStudentsStore();
  const { config: schoolConfig } = useSchoolConfigStore();

  const studentsLoading = studentsQueryLoading || studentsStoreLoading;
  const studentCount = tenantStats?.studentCount ?? students.length;

  const selectedGradeInfo = useMemo(() => {
    if (!selectedGrade || !schoolConfig) return null;
    for (const level of schoolConfig.selectedLevels) {
      const grade = level.gradeLevels?.find((item) => item.id === selectedGrade);
      if (grade) {
        return {
          grade,
          level,
          displayName: formatGradeDisplayName(grade.name),
        };
      }
    }
    return null;
  }, [selectedGrade, schoolConfig]);

  const selectedStreamName = useMemo(() => {
    if (!selectedStreamId || !selectedGradeInfo) return undefined;
    return selectedGradeInfo.grade.streams?.find(
      (stream) => stream.id === selectedStreamId,
    )?.name;
  }, [selectedStreamId, selectedGradeInfo]);

  useEffect(() => {
    if (!isLoading && !error && (!config || !config.selectedLevels?.length)) {
      router.push(`/school/${subdomain}`);
    }
  }, [config, isLoading, error, router, subdomain]);

  useEffect(() => {
    const handleResize = () => {
      setIsGradePanelOpen(window.innerWidth >= 1280);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  if (isLoading || (statsLoading && !selectedGrade)) {
    return <DashboardPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-lg border border-red-200 bg-white px-4 py-6 text-center dark:border-red-900 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-red-600">
            Could not load dashboard
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-3 h-8"
            size="sm"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!config?.selectedLevels?.length) return null;

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex min-w-0 flex-1">
        <aside
          className={cn(
            "hidden shrink-0 flex-col border-r border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 lg:flex",
            isGradePanelOpen ? "w-56" : "w-0 overflow-hidden border-r-0",
          )}
          aria-label="Grade navigation"
        >
          {isGradePanelOpen ? (
            <div className="sticky top-[2.75rem] flex max-h-[calc(100vh-5.5rem)] flex-col overflow-hidden px-2 py-2">
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
          ) : null}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader
            subdomain={subdomain}
            selectedGradeLabel={selectedGradeInfo?.displayName}
            selectedStreamLabel={selectedStreamName}
            hasGradeSelected={Boolean(selectedGrade)}
            onOpenGradePicker={() => setIsGradeSheetOpen(true)}
            onCreateTerm={() => setShowCreateTermModal(true)}
            canCreateTerm={Boolean(currentAcademicYear)}
            showDesktopGradeToggle
            isGradePanelOpen={isGradePanelOpen}
            onToggleGradePanel={() => setIsGradePanelOpen((open) => !open)}
          />

          <div className="flex-1">
            <div className="mx-auto max-w-5xl space-y-3 p-3 sm:space-y-3.5 sm:p-4">
              {!selectedGrade ? (
                <>
                  <DashboardSetupBanner />

                  {statsError ? (
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200/80 bg-amber-50 px-2.5 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                      <span>Stats unavailable</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => void refetchStats()}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : null}

                  <DashboardSection
                    title="At a glance"
                    description="Live activity and key counts"
                    bodyClassName="space-y-2.5 p-2.5"
                  >
                    <DashboardLiveActivity compact />
                    <DashboardSchoolBar
                      studentCount={studentCount}
                      teacherCount={tenantStats?.teacherCount}
                      streamCount={tenantStats?.streamCount}
                      attendanceRate={null}
                      academicProgress={null}
                      isLoading={statsLoading}
                      compact
                    />
                  </DashboardSection>

                  <DashboardSection
                    title="Quick tasks"
                    bodyClassName="p-2"
                  >
                    <DashboardQuickActions subdomain={subdomain} />
                  </DashboardSection>

                  <DashboardSection
                    title="Browse by grade"
                    description="Grouped by school level — tap a grade, then pick a stream if needed"
                    bodyClassName="p-2 sm:p-2.5"
                  >
                    <DashboardOverview
                      config={schoolConfig}
                      students={students}
                      isLoading={isLoading || studentsLoading}
                      selectedGradeId={selectedGrade || ""}
                      selectedStreamId={selectedStreamId}
                      onGradeSelect={handleGradeSelect}
                      onStreamSelect={handleStreamSelect}
                    />
                  </DashboardSection>
                </>
              ) : (
                selectedGradeInfo && (
                  <div className="space-y-3">
                    <ClassesContextBar
                      levelName={selectedGradeInfo.level.name}
                      gradeName={selectedGradeInfo.displayName}
                      streamName={selectedStreamName}
                      onClear={handleClearFilters}
                    />
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
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <DashboardGradeSheet
        open={isGradeSheetOpen}
        onOpenChange={setIsGradeSheetOpen}
        onGradeSelect={handleGradeSelect}
        onStreamSelect={handleStreamSelect}
        selectedGradeId={selectedGrade || ""}
        selectedStreamId={selectedStreamId}
        isLoading={isLoading}
      />

      {currentAcademicYear ? (
        <CreateTermModal
          isOpen={showCreateTermModal}
          onClose={() => setShowCreateTermModal(false)}
          onSuccess={() => setShowCreateTermModal(false)}
          academicYear={currentAcademicYear}
        />
      ) : null}
    </div>
  );
}
