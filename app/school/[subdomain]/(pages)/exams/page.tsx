"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { SchoolSearchFilter } from "@/components/dashboard/SchoolSearchFilter";
import { DashboardGradeSheet } from "../dashboard/components/DashboardGradeSheet";
import { useSchoolConfig } from "@/lib/hooks/useSchoolConfig";
import { cn } from "@/lib/utils";
import { formatGradeDisplayName } from "@/lib/utils/grade-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  BookOpen,
  BarChart3,
  Trophy,
  GraduationCap,
  User,
  RefreshCw,
  FileText,
  Lock,
} from "lucide-react";
import { CreateExamSessionDrawer } from "./components/CreateExamSessionDrawer";
import { ExamSessionsTable } from "./components/ExamSessionsTable";
import {
  examCreativeSurfaceClass,
  examFilterSelectClass,
  examPageShellClass,
  examPanelBodyClass,
  examSessionMicroScopeClass,
  examSurfaceClass,
} from "./components/exam-session-ui";
import {
  ExamEmptyState,
  ExamPanelHeader,
  ExamSectionNav,
} from "./components/ExamModuleChrome";
import { ExamListHero } from "./components/ExamListHero";
import { BulkReportCardsPanel } from "./components/BulkReportCardsPanel";
import { ExamsSessionScopedPanel } from "./components/ExamsSessionScopedPanel";
import { ExamModerationPanel } from "./components/ExamModerationPanel";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { useExamSessions } from "@/lib/hooks/useExamSessions";
import { examTimetableFill } from "@/lib/exams/examSessions";
import { useAcademicYears } from "@/lib/hooks/useAcademicYears";
import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";
import {
  publishExamSessionResults,
  unpublishExamSessionResults,
} from "@/lib/exams/examSessions";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ─── Student Performance View ──────────────────────────────────

function StudentPerformanceView({
  studentId,
  configSubjects,
}: {
  studentId: string;
  configSubjects: { id: string; name: string; code: string }[];
}) {
  // TODO: Wire to real API data when student result endpoint is available
  void studentId;
  void configSubjects;

  return (
    <div className={examSurfaceClass}>
      <ExamPanelHeader
        icon={User}
        title="Student performance"
        description="Detailed marks and subject breakdown"
        tone="blue"
      />
      <div className={examPanelBodyClass}>
        <ExamEmptyState
          icon={<User className="h-7 w-7" />}
          title="Performance data coming soon"
          description="Student-level exam analytics will appear here once wired to the results API."
        />
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────

export default function ExamsPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const queryClient = useQueryClient();

  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [viewMode, setViewMode] = useState<"overview" | "student">("overview");
  const [selectedStudentId, setSelectedStudentId] = useState<string>();
  const [examTypeFilter, setExamTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedGradeId, setSelectedGradeId] = useState<string>();
  const [selectedLevelId, setSelectedLevelId] = useState<string>();
  const [selectedStreamId, setSelectedStreamId] = useState<string>("");
  const [isGradePanelOpen, setIsGradePanelOpen] = useState(false);
  const [isGradeSheetOpen, setIsGradeSheetOpen] = useState(false);
  const filtersTouchedRef = useRef(false);
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  const { isLoading: configLoading } = useSchoolConfig();
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    sessionId: string;
    publish: boolean;
  } | null>(null);
  const [activeSection, setActiveSection] = useState<
    "sessions" | "report-cards" | "rankings" | "analytics" | "moderation"
  >("sessions");

  const { getAllSubjects, config } = useSchoolConfigStore();
  const { academicYears, getActiveAcademicYear } = useAcademicYears();
  const { selectedTerm: contextTerm, termsLoading: contextTermsLoading } =
    useSelectedTerm();
  const configSubjects = getAllSubjects();

  const availableTerms = useMemo(() => {
    const year = academicYears.find((y) => y.name === selectedYear);
    return year?.terms ?? [];
  }, [academicYears, selectedYear]);

  const selectedTermNumber = useMemo(() => {
    const idx = availableTerms.findIndex((t) => t.id === selectedTerm);
    return idx >= 0 ? idx + 1 : undefined;
  }, [availableTerms, selectedTerm]);

  const filtersReady = filtersInitialized || filtersTouchedRef.current;

  const {
    data: examSessions = [],
    isLoading: examsLoading,
    refetch: refetchExams,
  } = useExamSessions(
    {
      academicYear: selectedYear || undefined,
      term: selectedTermNumber,
      type: examTypeFilter === "all" ? undefined : (examTypeFilter as "CA" | "EXAM"),
      tenantGradeLevelId: selectedGradeId,
    },
    { enabled: filtersReady },
  );

  useEffect(() => {
    if (contextTermsLoading || filtersInitialized || filtersTouchedRef.current) return;

    if (contextTerm) {
      const year = academicYears.find((y) => y.name === contextTerm.academicYear.name);
      const termInYear = year?.terms?.some((t) => t.id === contextTerm.id);
      setSelectedYear(contextTerm.academicYear.name);
      if (termInYear) {
        setSelectedTerm(contextTerm.id);
      } else if (year?.terms?.[0]) {
        setSelectedTerm(year.terms[0].id);
      }
      setFiltersInitialized(true);
      return;
    }

    const active = getActiveAcademicYear();
    if (active) {
      setSelectedYear(active.name);
      if (active.terms[0]) {
        setSelectedTerm(active.terms[0].id);
      }
    }
    setFiltersInitialized(true);
  }, [
    academicYears,
    contextTerm,
    contextTermsLoading,
    filtersInitialized,
    getActiveAcademicYear,
  ]);

  useEffect(() => {
    if (contextTermsLoading || !contextTerm || filtersTouchedRef.current) return;
    const year = academicYears.find((y) => y.name === contextTerm.academicYear.name);
    const termInYear = year?.terms?.some((t) => t.id === contextTerm.id);
    setSelectedYear(contextTerm.academicYear.name);
    if (termInYear) {
      setSelectedTerm(contextTerm.id);
    } else if (year?.terms?.[0]) {
      setSelectedTerm(year.terms[0].id);
    }
  }, [contextTerm, contextTermsLoading, academicYears]);

  const filteredSessions = useMemo(() => {
    return examSessions.filter((session) => {
      const matchesStatus =
        statusFilter === "all" || session.status === statusFilter;
      return matchesStatus;
    });
  }, [examSessions, statusFilter]);

  useEffect(() => {
    const handleResize = () => {
      setIsGradePanelOpen(window.innerWidth >= 1280);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        };
      }
    }
    return null;
  }, [selectedGradeId, selectedStreamId, config]);

  const handleGradeSelect = useCallback((gradeId: string, levelId: string) => {
    setSelectedGradeId(gradeId);
    setSelectedLevelId(levelId);
    setSelectedStreamId("");
  }, []);

  const handleStreamSelect = useCallback(
    (streamId: string, gradeId: string, levelId: string) => {
      setSelectedGradeId(gradeId);
      setSelectedLevelId(levelId);
      setSelectedStreamId(streamId);
    },
    [],
  );

  const handleSelectAllGrades = useCallback(() => {
    setSelectedGradeId(undefined);
    setSelectedLevelId(undefined);
    setSelectedStreamId("");
  }, []);

  const handleExamCreated = () => {
    void refetchExams();
  };

  const handleTogglePublish = async (
    sessionId: string,
    published: boolean,
  ) => {
    setConfirmAction({ sessionId, publish: !published });
  };

  const executePublishAction = async () => {
    if (!confirmAction) return;
    const { sessionId, publish } = confirmAction;
    setPublishingId(sessionId);
    setConfirmAction(null);
    try {
      if (publish) {
        await publishExamSessionResults(subdomain, sessionId);
        toast.success("Results published to students");
      } else {
        await unpublishExamSessionResults(subdomain, sessionId);
        toast.success("Results unpublished");
      }
      await queryClient.invalidateQueries({ queryKey: ["examSessions", subdomain] });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update publish status",
      );
    } finally {
      setPublishingId(null);
    }
  };

  const headerSubtitle = selectedGrade
    ? `${selectedGrade.displayName}${selectedGrade.streamName ? ` · ${selectedGrade.streamName}` : ""} · ${selectedGrade.levelName}`
    : viewMode === "student"
      ? "Detailed performance analysis"
      : "Manage and track examinations";

  const sectionLabels: Record<typeof activeSection, string> = {
    sessions: "Sessions",
    "report-cards": "Report cards",
    rankings: "Rankings",
    analytics: "Analytics",
    moderation: "Moderation",
  };

  const sessionStats = useMemo(() => {
    const fills = filteredSessions.map((s) => examTimetableFill(s));
    const withPapers = fills.filter((f) => f.total > 0);
    const complete = withPapers.filter((f) => f.percent >= 100).length;
    const avgFill =
      withPapers.length > 0
        ? Math.round(
            withPapers.reduce((sum, f) => sum + f.percent, 0) / withPapers.length,
          )
        : null;
    return {
      count: filteredSessions.length,
      complete,
      avgFill,
    };
  }, [filteredSessions]);

  const sessionFilters = (
    <>
      <select
        value={selectedYear}
        onChange={(e) => {
          filtersTouchedRef.current = true;
          setFiltersInitialized(true);
          const yearName = e.target.value;
          setSelectedYear(yearName);
          if (!yearName) {
            setSelectedTerm("");
            return;
          }
          if (contextTerm?.academicYear.name === yearName) {
            setSelectedTerm(contextTerm.id);
            return;
          }
          const year = academicYears.find((y) => y.name === yearName);
          setSelectedTerm(year?.terms?.[0]?.id ?? "");
        }}
        className={examFilterSelectClass}
        aria-label="Filter by academic year"
      >
        <option value="">All years</option>
        {academicYears.map((y) => (
          <option key={y.id} value={y.name}>
            {y.name}
          </option>
        ))}
      </select>
      <select
        value={selectedTerm}
        onChange={(e) => {
          filtersTouchedRef.current = true;
          setFiltersInitialized(true);
          setSelectedTerm(e.target.value);
        }}
        className={examFilterSelectClass}
        aria-label="Filter by term"
      >
        <option value="">All terms</option>
        {availableTerms.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <select
        value={examTypeFilter}
        onChange={(e) => setExamTypeFilter(e.target.value)}
        className={examFilterSelectClass}
        aria-label="Filter by exam type"
      >
        <option value="all">All types</option>
        <option value="CA">CA</option>
        <option value="EXAM">Exam</option>
      </select>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className={examFilterSelectClass}
        aria-label="Filter by status"
      >
        <option value="all">All statuses</option>
        <option value="DRAFT">Draft</option>
        <option value="SCHEDULED">Scheduled</option>
        <option value="MARKING">Marking</option>
        <option value="PUBLISHED">Published</option>
      </select>
    </>
  );

  return (
    <div className={cn(examPageShellClass, examSessionMicroScopeClass)}>
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35] dark:opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(36,106,89,0.35) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />
      <div className="flex min-w-0 flex-1">
        <aside
          className={cn(
            "hidden shrink-0 flex-col border-r border-slate-200/80 bg-[#f5f6f8] dark:border-slate-800 dark:bg-slate-900 lg:flex",
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
                onSelectAllClasses={handleSelectAllGrades}
                isLoading={configLoading}
                selectedGradeId={selectedGradeId ?? ""}
                selectedStreamId={selectedStreamId}
                allClassesSelected={!selectedGradeId}
              />
            </div>
          ) : null}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <ExamListHero
            viewMode={viewMode}
            subtitle={headerSubtitle}
            selectedGradeLabel={selectedGrade?.displayName}
            activeSectionLabel={
              viewMode === "overview" ? sectionLabels[activeSection] : undefined
            }
            showMobileGradeButton
            showGradeControls
            gradePanelOpen={isGradePanelOpen}
            onOpenGrades={() => setIsGradeSheetOpen(true)}
            onToggleGradePanel={() => setIsGradePanelOpen((open) => !open)}
            onBackFromStudent={() => {
              setViewMode("overview");
              setSelectedStudentId(undefined);
            }}
            onRefresh={() => void refetchExams()}
            refreshing={examsLoading}
            createAction={
              viewMode === "overview" ? (
                <CreateExamSessionDrawer
                  onCreated={handleExamCreated}
                  initialGradeId={selectedGradeId}
                  trigger={
                    <Button
                      size="sm"
                      className="h-8 gap-1 rounded-lg bg-[#246a59] px-2.5 text-xs text-white hover:bg-[#1a4c40]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Create exam</span>
                    </Button>
                  }
                />
              ) : undefined
            }
            filters={
              viewMode === "overview" && activeSection === "sessions"
                ? sessionFilters
                : undefined
            }
            stats={
              viewMode === "overview" &&
              activeSection === "sessions" &&
              filtersReady &&
              !examsLoading &&
              filteredSessions.length > 0
                ? [
                    { label: "Sessions", value: sessionStats.count, accent: "teal" },
                    {
                      label: "Fully scheduled",
                      value: sessionStats.complete,
                      accent: "emerald",
                    },
                    {
                      label: "Avg timetable",
                      value:
                        sessionStats.avgFill != null
                          ? `${sessionStats.avgFill}%`
                          : "—",
                      accent: "muted",
                    },
                  ]
                : undefined
            }
          />

          <div className="flex-1 pb-5 sm:pb-6">
            <div className="mx-auto max-w-6xl px-3 sm:px-5">
              {viewMode === "overview" ? (
                <div className={examCreativeSurfaceClass}>
                  <ExamSectionNav
                    items={[
                      { id: "sessions", label: "Sessions", icon: GraduationCap },
                      { id: "report-cards", label: "Report Cards", icon: FileText },
                      { id: "rankings", label: "Rankings", icon: Trophy },
                      { id: "analytics", label: "Analytics", icon: BarChart3 },
                      { id: "moderation", label: "Moderation", icon: Lock },
                    ]}
                    active={activeSection}
                    onChange={setActiveSection}
                    className="border-b border-slate-200/60 bg-gradient-to-b from-slate-50/50 to-white/80 px-1.5 py-1 dark:border-slate-800 dark:from-slate-900/50 dark:to-slate-900/80"
                  />

                  <div className={examPanelBodyClass}>
                    {activeSection === "report-cards" && (
                      <div className="space-y-4">
                        <ExamPanelHeader
                          icon={FileText}
                          title="Report cards"
                          description="Bulk generation and session-based report cards"
                          tone="violet"
                          className="rounded-xl border border-slate-200/80 dark:border-slate-800"
                        />
                        <BulkReportCardsPanel />
                        <p className="rounded-lg border border-slate-200/80 bg-slate-50/60 px-4 py-3 text-center text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/40">
                          For session-based report cards, open an exam session and use the
                          Report Cards tab after running results processing.
                        </p>
                      </div>
                    )}

                    {activeSection === "rankings" && (
                      <div className="space-y-4">
                        <ExamPanelHeader
                          icon={Trophy}
                          title="Session rankings"
                          description="Compare performance across exam sessions"
                          tone="amber"
                          className="rounded-xl border border-slate-200/80 dark:border-slate-800"
                        />
                        <ExamsSessionScopedPanel
                          subdomain={subdomain}
                          sessions={filteredSessions}
                          mode="rankings"
                        />
                      </div>
                    )}

                    {activeSection === "analytics" && (
                      <div className="space-y-4">
                        <ExamPanelHeader
                          icon={BarChart3}
                          title="Session analytics"
                          description="Trends and insights across your exams"
                          tone="blue"
                          className="rounded-xl border border-slate-200/80 dark:border-slate-800"
                        />
                        <ExamsSessionScopedPanel
                          subdomain={subdomain}
                          sessions={filteredSessions}
                          mode="analytics"
                        />
                      </div>
                    )}

                    {activeSection === "sessions" && (
                      <div className="space-y-2">
                        {examsLoading || !filtersReady ? (
                          <div className="flex flex-col items-center justify-center gap-2 py-12">
                            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#246a59]/20 border-t-[#246a59]" />
                            <p className="text-xs text-slate-500">Loading exam sessions…</p>
                          </div>
                        ) : filteredSessions.length === 0 ? (
                          <ExamEmptyState
                            icon={<BookOpen className="h-7 w-7" />}
                            title={
                              examSessions.length === 0
                                ? "No exam sessions yet"
                                : "No sessions match your filters"
                            }
                            description={
                              examSessions.length === 0
                                ? "Create a named exam (e.g. Term 3 End-of-Year) linked to grades and subjects."
                                : "Try adjusting your filters to see more results."
                            }
                            action={
                              examSessions.length === 0 ? (
                                <CreateExamSessionDrawer
                                  onCreated={handleExamCreated}
                                  initialGradeId={selectedGradeId}
                                  trigger={
                                    <Button className="rounded-lg bg-[#246a59] hover:bg-[#1a4c40]">
                                      <Plus className="mr-2 h-4 w-4" />
                                      Create first exam
                                    </Button>
                                  }
                                />
                              ) : undefined
                            }
                          />
                        ) : (
                          <>
                            <p className="hidden text-[10px] text-slate-500 lg:block">
                              <span className="font-semibold text-slate-700 dark:text-slate-200">
                                {filteredSessions.length}
                              </span>{" "}
                              session{filteredSessions.length === 1 ? "" : "s"}
                              {selectedYear && selectedTerm
                                ? ` · ${availableTerms.find((t) => t.id === selectedTerm)?.name ?? "Term"} · ${selectedYear}`
                                : ""}
                              {statusFilter !== "all" ? ` · ${statusFilter.toLowerCase()}` : ""}
                              {examTypeFilter !== "all" ? ` · ${examTypeFilter}` : ""}
                            </p>
                            <ExamSessionsTable
                              subdomain={subdomain}
                              sessions={filteredSessions}
                              publishingId={publishingId}
                              onTogglePublish={handleTogglePublish}
                            />
                          </>
                        )}
                      </div>
                    )}

                    {activeSection === "moderation" && (
                      <div className="space-y-4">
                        <ExamPanelHeader
                          icon={Lock}
                          title="Mark moderation"
                          description="Lock submitted or approved papers to finalize them for results processing."
                          tone="blue"
                          className="rounded-xl border border-slate-200/80 dark:border-slate-800"
                        />
                        <ExamModerationPanel
                          subdomain={subdomain}
                          academicYear={selectedYear || undefined}
                          term={selectedTermNumber}
                          gradeId={selectedGradeId}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : selectedStudentId ? (
                <div className={examCreativeSurfaceClass}>
                  <div className={examPanelBodyClass}>
                    <StudentPerformanceView
                      studentId={selectedStudentId}
                      configSubjects={configSubjects}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <DashboardGradeSheet
        open={isGradeSheetOpen}
        onOpenChange={setIsGradeSheetOpen}
        onGradeSelect={handleGradeSelect}
        onStreamSelect={handleStreamSelect}
        selectedGradeId={selectedGradeId ?? ""}
        selectedStreamId={selectedStreamId}
        isLoading={configLoading}
      />

      {/* Publish/Unpublish Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-lg">
                {confirmAction.publish ? "Publish Results?" : "Unpublish Results?"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {confirmAction.publish
                  ? "Students and parents will be able to see these marks immediately. Are you sure?"
                  : "Students and parents will no longer be able to see these marks. Are you sure?"}
              </p>
            </CardContent>
            <div className="flex justify-end gap-2 p-6 pt-0">
              <Button
                variant="outline"
                onClick={() => setConfirmAction(null)}
                disabled={!!publishingId}
              >
                Cancel
              </Button>
              <Button
                onClick={executePublishAction}
                disabled={!!publishingId}
                variant={confirmAction.publish ? "default" : "destructive"}
              >
                {publishingId ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {confirmAction.publish ? "Publish" : "Unpublish"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
