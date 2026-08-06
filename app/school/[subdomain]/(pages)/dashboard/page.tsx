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
import { DashboardSchoolSnapshot } from "./components/DashboardSchoolSnapshot";
import { DashboardSetupBanner } from "./components/DashboardSetupBanner";
import { DashboardPulseHero } from "./components/DashboardPulseHero";
import { DashboardPendingApplications } from "./components/DashboardPendingApplications";
import { DashboardActivityFeed } from "./components/DashboardActivityFeed";
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
      <div className="flex min-h-[40vh] items-center justify-center bg-[#f3f7f5] p-6 dark:bg-[#071411]">
        <div className="w-full max-w-sm border border-red-300/80 bg-white px-5 py-7 text-center shadow-[4px_4px_0_0_rgba(185,28,28,0.12)] dark:border-red-900/50 dark:bg-[#0c1a17]">
          <h2 className="font-display text-lg tracking-tight text-red-700 dark:text-red-400">
            Could not load dashboard
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#1a4d42]/60">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 h-9 rounded-none bg-[#0a1f1a] hover:bg-[#246a59]"
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
    <div className="relative flex min-h-full flex-col bg-[#f3f7f5] dark:bg-[#071411]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(36,106,89,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(36,106,89,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative flex min-w-0 flex-1">
        <aside
          className={cn(
            "hidden shrink-0 flex-col border-r border-[#1a4d42]/12 bg-[#f3f7f5] dark:border-white/10 dark:bg-[#071411] lg:flex",
            isGradePanelOpen ? "w-60" : "w-0 overflow-hidden border-r-0",
          )}
          aria-label="Grade navigation"
        >
          {isGradePanelOpen ? (
            <div className="sticky top-[3.25rem] flex max-h-[calc(100vh-5.5rem)] flex-col overflow-hidden px-3 py-3">
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
            <div className="mx-auto max-w-6xl space-y-3 p-3 sm:p-4 lg:p-5">
              {!selectedGrade ? (
                <>
                  <DashboardPulseHero
                    subdomain={subdomain}
                    studentCount={studentCount}
                    teacherCount={tenantStats?.teacherCount}
                    streamCount={tenantStats?.streamCount}
                    statsLoading={statsLoading}
                  />

                  <DashboardPendingApplications />

                  <DashboardSetupBanner />

                  {statsError ? (
                    <div className="flex items-center justify-between gap-3 border border-amber-300/80 bg-amber-50 px-3 py-2 text-[12px] text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                      <span>Stats unavailable right now.</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 rounded-none px-2.5 text-xs"
                        onClick={() => void refetchStats()}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : null}

                  <div className="grid gap-3 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                      <DashboardActivityFeed />
                    </div>
                    <div className="lg:col-span-3">
                      <DashboardSection
                        title="Quick tasks"
                        bodyClassName="p-1.5"
                      >
                        <DashboardQuickActions subdomain={subdomain} />
                      </DashboardSection>
                    </div>
                    <div className="lg:col-span-4">
                      <DashboardSection
                        title="School snapshot"
                        bodyClassName="p-3"
                      >
                        <DashboardSchoolSnapshot
                          config={schoolConfig}
                          students={students}
                          studentCount={studentCount}
                          streamCount={tenantStats?.streamCount}
                        />
                      </DashboardSection>
                    </div>
                  </div>
                </>
              ) : (
                selectedGradeInfo && (
                  <div className="space-y-4">
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
