"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { SchoolSearchFilter } from "@/components/dashboard/SchoolSearchFilter";
import { DashboardGradeSheet } from "../dashboard/components/DashboardGradeSheet";
import { useSchoolConfig } from "@/lib/hooks/useSchoolConfig";
import { cn } from "@/lib/utils";
import { formatGradeDisplayName } from "@/lib/utils/grade-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Download,
  FileText,
  BarChart3,
  Users,
  Trophy,
  Calendar,
  BookOpen,
  Target,
  TrendingUp,
  GraduationCap,
  ArrowLeft,
  User,
  School,
  ChevronDown,
  ChevronRight,
  Award,
  CheckCircle,
  RefreshCw,
  Filter,
} from "lucide-react";
import type { StudentExamResult } from "@/types/exam";
import { CreateExamSessionDrawer } from "./components/CreateExamSessionDrawer";
import { ReportCardTemplateModal } from "./components/ReportCardTemplateModal";
import { BulkReportCardsPanel } from "./components/BulkReportCardsPanel";
import { ExamsSessionScopedPanel } from "./components/ExamsSessionScopedPanel";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { useExamSessions } from "@/lib/hooks/useExamSessions";
import { useAcademicYears } from "@/lib/hooks/useAcademicYears";
import {
  publishExamSessionResults,
  unpublishExamSessionResults,
  statusLabel,
} from "@/lib/exams/examSessions";
import { examSessionPath } from "@/lib/school/schoolRoutes";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ─── Shared Helpers ────────────────────────────────────────────

const GRADE_THRESHOLDS = [
  { min: 80, grade: "Excellent", color: "text-green-600", bg: "bg-green-50" },
  { min: 70, grade: "Very Good", color: "text-blue-600", bg: "bg-blue-50" },
  { min: 60, grade: "Good", color: "text-yellow-600", bg: "bg-yellow-50" },
  { min: 50, grade: "Average", color: "text-orange-600", bg: "bg-orange-50" },
  { min: 0, grade: "Below Average", color: "text-red-600", bg: "bg-red-50" },
] as const;

function getPerformanceGrade(percentage: number) {
  return (
    GRADE_THRESHOLDS.find((t) => percentage >= t.min) ||
    GRADE_THRESHOLDS[GRADE_THRESHOLDS.length - 1]
  );
}

// ─── Student Performance View ──────────────────────────────────

function StudentPerformanceView({
  studentId,
  configSubjects,
}: {
  studentId: string;
  configSubjects: { id: string; name: string; code: string }[];
}) {
  // TODO: Replace with real API data
  const studentResults: StudentExamResult[] = [];
  const student = studentResults[0]?.student;

  if (!student) {
    return (
      <Card className="border border-slate-200 dark:border-slate-700">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-slate-900 dark:text-slate-100">
              Student not found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              No performance data available for this student.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const averageScore =
    studentResults.length > 0
      ? studentResults.reduce((sum, r) => sum + r.percentage, 0) /
        studentResults.length
      : 0;

  const overallGrade = getPerformanceGrade(averageScore);

  return (
    <div className="space-y-6">
      {/* Student Header */}
      <Card className="border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative flex-shrink-0">
              <div className="h-20 w-20 bg-slate-200 dark:bg-slate-700 rounded-2xl flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg">
                <span className="text-xl font-bold text-slate-700 dark:text-slate-300">
                  {student.firstName[0]}
                  {student.lastName[0]}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center">
                <Trophy className="h-3.5 w-3.5 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {student.firstName} {student.lastName}
                </h2>
                <Badge variant="outline">ID: {student.admissionNumber}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                <span className="flex items-center gap-1.5">
                  <School className="h-4 w-4" />
                  {student.class} - {student.stream}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {student.gender}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${overallGrade.bg} ${overallGrade.color}`}
                >
                  {overallGrade.grade}
                </div>
                <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {Math.round(averageScore)}%
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Overall Average
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <ReportCardTemplateModal
                student={{
                  id: student.id,
                  name: `${student.firstName} ${student.lastName}`,
                  admissionNumber: student.admissionNumber,
                  gender: student.gender,
                  grade: student.class,
                  stream: student.stream,
                  user: { email: "" },
                }}
                school={{ id: "", schoolName: "", subdomain: "" }}
                subjects={configSubjects.map((s) => ({
                  id: s.id,
                  name: s.name,
                  code: s.code,
                  category: "core" as const,
                  maxMarks: 100,
                }))}
                term="1"
                year="2024"
              />
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Transcript
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          value={studentResults.length}
          label="Total Exams"
          sub="Across all subjects"
          color="blue"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          value={`${studentResults.length > 0 ? Math.max(...studentResults.map((r) => r.percentage)) : 0}%`}
          label="Highest Score"
          sub="Personal best"
          color="emerald"
        />
        <StatCard
          icon={<Trophy className="h-5 w-5" />}
          value={`#${studentResults[0]?.positionInClass || "N/A"}`}
          label="Class Rank"
          sub="Current position"
          color="amber"
        />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          value={`${studentResults.length > 0 ? Math.round((studentResults.filter((r) => r.status === "present").length / studentResults.length) * 100) : 0}%`}
          label="Attendance"
          sub="Exam attendance"
          color="purple"
        />
      </div>

      {/* Subject Breakdown */}
      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Subject Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {studentResults.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-8 w-8" />}
              title="No exam results yet"
              description="This student hasn't taken any exams."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentResults.map((result) => {
                const grade = getPerformanceGrade(result.percentage);
                return (
                  <div
                    key={result.id}
                    className="border border-slate-100 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        Subject Result
                      </h4>
                      <div
                        className={`text-xs px-2 py-1 rounded font-medium ${grade.bg} ${grade.color}`}
                      >
                        {grade.grade}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-500 dark:text-slate-400">
                        Score
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {result.marksScored}/{result.totalMarks}
                        <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                          {result.percentage}%
                        </span>
                      </span>
                    </div>
                    <Progress value={result.percentage} className="h-2" />
                    {result.teacherComment && (
                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800 p-2 rounded">
                        &ldquo;{result.teacherComment}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
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

  const { isLoading: configLoading } = useSchoolConfig();
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    sessionId: string;
    publish: boolean;
  } | null>(null);
  const [activeSection, setActiveSection] = useState<
    "sessions" | "report-cards" | "rankings" | "analytics"
  >("sessions");

  const { getAllSubjects, config } = useSchoolConfigStore();
  const { academicYears, getActiveAcademicYear } = useAcademicYears();
  const configSubjects = getAllSubjects();

  const availableTerms = useMemo(() => {
    const year = academicYears.find((y) => y.name === selectedYear);
    return year?.terms ?? [];
  }, [academicYears, selectedYear]);

  const selectedTermNumber = useMemo(() => {
    const idx = availableTerms.findIndex((t) => t.id === selectedTerm);
    return idx >= 0 ? idx + 1 : undefined;
  }, [availableTerms, selectedTerm]);

  const {
    data: examSessions = [],
    isLoading: examsLoading,
    refetch: refetchExams,
  } = useExamSessions({
    academicYear: selectedYear || undefined,
    term: selectedTermNumber,
    type: examTypeFilter === "all" ? undefined : (examTypeFilter as "CA" | "EXAM"),
    tenantGradeLevelId: selectedGradeId,
  });

  useEffect(() => {
    const active = getActiveAcademicYear();
    if (active && !selectedYear) {
      setSelectedYear(active.name);
      if (active.terms[0]) {
        setSelectedTerm(active.terms[0].id);
      }
    }
  }, [academicYears, getActiveAcademicYear, selectedYear]);

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

  return (
    <div className="flex min-h-full flex-col bg-[#f8f9fb] dark:bg-slate-950">
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
          <div className="sticky top-0 z-20 shrink-0 border-b border-slate-200/60 bg-[#f8f9fb]/90 px-3 py-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 sm:px-4">
            <div className="mx-auto flex max-w-6xl items-center gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {viewMode === "student" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 shrink-0 p-0"
                      onClick={() => {
                        setViewMode("overview");
                        setSelectedStudentId(undefined);
                      }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="min-w-0">
                    <h1 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 sm:text-[15px]">
                      {viewMode === "student" ? "Student Performance" : "Exams"}
                    </h1>
                    <p className="hidden truncate text-[11px] text-slate-400 sm:block">
                      {headerSubtitle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant={selectedGradeId ? "secondary" : "outline"}
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs lg:hidden"
                  onClick={() => setIsGradeSheetOpen(true)}
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span className="hidden min-[380px]:inline">
                    {selectedGradeId ? "Grades" : "Browse"}
                  </span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="hidden h-7 px-2 text-xs lg:inline-flex"
                  onClick={() => setIsGradePanelOpen((open) => !open)}
                >
                  {isGradePanelOpen ? "Hide panel" : "Grades"}
                </Button>

                <Button
                  onClick={() => void refetchExams()}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  disabled={examsLoading}
                >
                  <RefreshCw className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <CreateExamSessionDrawer
                  onCreated={handleExamCreated}
                  initialGradeId={selectedGradeId}
                  trigger={
                    <Button size="sm" className="h-7 px-2 text-xs">
                      <Plus className="h-3.5 w-3.5 sm:mr-1.5" />
                      <span className="hidden sm:inline">Create exam</span>
                    </Button>
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">

        {viewMode === "overview" && (
          <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            {(
              [
                { id: "sessions", label: "Sessions", icon: GraduationCap },
                { id: "report-cards", label: "Report Cards", icon: FileText },
                { id: "rankings", label: "Rankings", icon: Trophy },
                { id: "analytics", label: "Analytics", icon: BarChart3 },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
                  activeSection === id
                    ? "border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Student View */}
        {viewMode === "student" && selectedStudentId && (
          <StudentPerformanceView
            studentId={selectedStudentId}
            configSubjects={configSubjects}
          />
        )}

        {/* Overview */}
        {viewMode === "overview" && activeSection === "report-cards" && (
          <>
            <BulkReportCardsPanel />
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardContent className="py-8 text-center text-sm text-slate-500">
                For session-based report cards, open an exam session and use the
                Report Cards tab after running results processing.
              </CardContent>
            </Card>
          </>
        )}

        {viewMode === "overview" && activeSection === "rankings" && (
          <Card className="border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Session rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExamsSessionScopedPanel
                subdomain={subdomain}
                sessions={filteredSessions}
                mode="rankings"
              />
            </CardContent>
          </Card>
        )}

        {viewMode === "overview" && activeSection === "analytics" && (
          <Card className="border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Session analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExamsSessionScopedPanel
                subdomain={subdomain}
                sessions={filteredSessions}
                mode="analytics"
              />
            </CardContent>
          </Card>
        )}

        {viewMode === "overview" && activeSection === "sessions" && (
          <>
          <Card className="border border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Exams
                </CardTitle>
                <div className="flex flex-wrap gap-2 ml-auto">
                  <select
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="text-xs border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 bg-white dark:bg-slate-900"
                  >
                    <option value="">All terms</option>
                    {availableTerms.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setSelectedTerm("");
                    }}
                    className="text-xs border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 bg-white dark:bg-slate-900"
                  >
                    <option value="">All years</option>
                    {academicYears.map((y) => (
                      <option key={y.id} value={y.name}>
                        {y.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={examTypeFilter}
                    onChange={(e) => setExamTypeFilter(e.target.value)}
                    className="text-xs border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 bg-white dark:bg-slate-900"
                  >
                    <option value="all">All types</option>
                    <option value="CA">CA</option>
                    <option value="EXAM">Exam</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 bg-white dark:bg-slate-900"
                  >
                    <option value="all">All statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="MARKING">Marking</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {examsLoading ? (
                <div className="flex items-center justify-center py-16 text-sm text-slate-500">
                  Loading exam sessions…
                </div>
              ) : filteredSessions.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="h-10 w-10" />}
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
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create first exam
                          </Button>
                        }
                      />
                    ) : undefined
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                        <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          Exam session
                        </th>
                        <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          Term / Year
                        </th>
                        <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          Scope
                        </th>
                        <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          Dates
                        </th>
                        <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          Status
                        </th>
                        <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300 w-[140px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSessions.map((session) => (
                        <tr
                          key={session.id}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <td className="py-3 px-3">
                            <Link
                              href={examSessionPath(subdomain, session.id)}
                              className="font-medium text-slate-900 dark:text-slate-100 hover:underline"
                            >
                              {session.name}
                            </Link>
                            {session.description && (
                              <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                {session.description}
                              </div>
                            )}
                            <div className="mt-1">
                              <Badge variant="outline" className="text-[10px]">
                                {session.type}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-xs">
                            Term {session.term}
                            <br />
                            {session.academicYear}
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400">
                            {session.gradesCount} grade
                            {session.gradesCount === 1 ? "" : "s"} ·{" "}
                            {session.subjectsCount} subject
                            {session.subjectsCount === 1 ? "" : "s"} ·{" "}
                            {session.papersCount} papers
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400">
                            {session.startDate
                              ? new Date(session.startDate).toLocaleDateString()
                              : "—"}
                            {session.endDate &&
                            session.endDate !== session.startDate
                              ? ` – ${new Date(session.endDate).toLocaleDateString()}`
                              : ""}
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {session.scheduledSlotsCount} timetable slot
                              {session.scheduledSlotsCount === 1 ? "" : "s"}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col gap-1">
                              <Badge variant="outline" className="text-xs w-fit">
                                {statusLabel(session.status)}
                              </Badge>
                              {session.resultsPublished ? (
                                <span className="text-[10px] text-emerald-600">
                                  Results published
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                asChild
                              >
                                <Link href={examSessionPath(subdomain, session.id)}>
                                  Open
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                disabled={publishingId === session.id}
                                onClick={() =>
                                  handleTogglePublish(
                                    session.id,
                                    session.resultsPublished,
                                  )
                                }
                              >
                                {session.resultsPublished ? "Unpublish" : "Publish"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
          </>
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

// ─── Shared Sub-Components ─────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  sub,
  color,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  sub: string;
  color: "blue" | "emerald" | "amber" | "purple";
}) {
  const colorMap = {
    blue: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400",
      value: "text-slate-900 dark:text-slate-100",
    },
    emerald: {
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      text: "text-emerald-600 dark:text-emerald-400",
      value: "text-emerald-600 dark:text-emerald-400",
    },
    amber: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-600 dark:text-amber-400",
      value: "text-amber-600 dark:text-amber-400",
    },
    purple: {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-600 dark:text-purple-400",
      value: "text-purple-600 dark:text-purple-400",
    },
  };
  const c = colorMap[color];

  return (
    <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              {label}
            </div>
            <div className={`text-2xl font-bold ${c.value}`}>{value}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              {sub}
            </div>
          </div>
          <div
            className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center`}
          >
            <div className={c.text}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="text-slate-400">{icon}</div>
        </div>
        <h3 className="text-base font-medium mb-1 text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {description}
        </p>
        {action}
      </div>
    </div>
  );
}
