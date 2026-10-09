"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  GraduationCap,
  Hourglass,
  Layers,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SchoolEmpty,
  SchoolLoading,
  SchoolPage,
  SchoolPanel,
  SchoolStat,
  fieldShell,
  labelClass,
  outlineButtonClass,
  selectShell,
  thClass,
} from "@/components/school/SchoolContentPage";
import { cn } from "@/lib/utils";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { examSessionPath } from "@/lib/school/schoolRoutes";
import { fetchAcademicYears } from "@/lib/school/academicYears";
import {
  fetchReportExamSessions,
  fetchReportStudentsByGrade,
  fetchStudentReportCard,
  type ReportExamSession,
} from "@/lib/school/reports";

const STATUS_CLASSES: Record<string, string> = {
  DRAFT:
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  SCHEDULED:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  IN_PROGRESS:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
  MARKING:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  UNDER_REVIEW:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300",
  PUBLISHED:
    "border-[#246a59]/30 bg-[#246a59]/10 text-[#246a59] dark:border-[#246a59]/40 dark:text-emerald-300",
  CLOSED:
    "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const PUBLICATION_CLASSES: Record<string, string> = {
  PUBLISHED:
    "border-[#246a59]/30 bg-[#246a59]/10 text-[#246a59] dark:border-[#246a59]/40 dark:text-emerald-300",
  SCHEDULED:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
  HIDDEN:
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function humanize(value: string): string {
  return value
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatSessionDates(session: ReportExamSession): string | null {
  if (!session.startDate) return null;
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const start = new Date(session.startDate).toLocaleDateString("en-KE", opts);
  if (!session.endDate || session.endDate === session.startDate) {
    return start;
  }
  const end = new Date(session.endDate).toLocaleDateString("en-KE", opts);
  return `${start} – ${end}`;
}

function SessionRow({
  session,
  subdomain,
}: {
  session: ReportExamSession;
  subdomain: string;
}) {
  const dates = formatSessionDates(session);
  const candidates = session.registeredCandidatesCount ?? 0;

  return (
    <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-[#0a1f1a] dark:text-white">
            {session.name}
          </p>
          <Badge
            variant="outline"
            className={cn(
              "rounded-none",
              STATUS_CLASSES[session.status] ?? STATUS_CLASSES.DRAFT,
            )}
          >
            {humanize(session.status)}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "rounded-none",
              PUBLICATION_CLASSES[session.publicationState] ??
                PUBLICATION_CLASSES.HIDDEN,
            )}
          >
            {humanize(session.publicationState)}
          </Badge>
          {session.resultsPublished ? (
            <Badge
              variant="outline"
              className="rounded-none border-[#246a59]/30 bg-[#246a59]/10 text-[#246a59] dark:border-[#246a59]/40 dark:text-emerald-300"
            >
              <CheckCircle2 className="h-3 w-3" />
              Results published
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="rounded-none border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
            >
              <Hourglass className="h-3 w-3" />
              Processing pending
            </Badge>
          )}
        </div>

        <p className="text-xs text-[#1a4d42]/60 dark:text-white/50">
          {session.academicYear} · Term {session.term} · {session.type}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#1a4d42]/60 dark:text-white/50">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {candidates} candidate{candidates === 1 ? "" : "s"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            {session.gradesCount} grade{session.gradesCount === 1 ? "" : "s"}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {session.subjectsCount} subject
            {session.subjectsCount === 1 ? "" : "s"}
          </span>
          {dates ? (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {dates}
            </span>
          ) : null}
        </div>
      </div>

      <Button
        asChild
        size="sm"
        className="shrink-0 rounded-none bg-[#0a1f1a] text-xs text-white shadow-none hover:bg-[#246a59]"
      >
        <Link href={examSessionPath(subdomain, session.id)}>
          View results &amp; report cards
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </li>
  );
}

function StudentReportCardPanel({ subdomain }: { subdomain: string }) {
  const schoolConfig = useSchoolConfigStore((state) => state.config);
  const [academicYear, setAcademicYear] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [studentId, setStudentId] = useState("");

  const gradeOptions = useMemo(() => {
    if (!schoolConfig) return [];
    return schoolConfig.selectedLevels.flatMap((level) =>
      (level.gradeLevels ?? []).map((grade) => ({
        id: grade.id,
        name: grade.name,
        levelName: level.name,
      })),
    );
  }, [schoolConfig]);

  const yearsQuery = useQuery({
    queryKey: ["academicYears", subdomain],
    queryFn: () => fetchAcademicYears(subdomain),
    enabled: Boolean(subdomain),
  });

  const studentsQuery = useQuery({
    queryKey: ["reportStudents", subdomain, gradeId],
    queryFn: () => fetchReportStudentsByGrade(subdomain, gradeId),
    enabled: Boolean(subdomain && gradeId),
  });

  const reportQuery = useQuery({
    queryKey: ["studentReportCard", subdomain, academicYear, studentId],
    queryFn: () => fetchStudentReportCard(subdomain, academicYear, studentId),
    enabled: Boolean(subdomain && academicYear && studentId),
  });

  const years = yearsQuery.data ?? [];
  const students = studentsQuery.data ?? [];
  const report = reportQuery.data ?? null;

  return (
    <SchoolPanel icon={GraduationCap} title="Student report card">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className={labelClass}>Academic year</Label>
          <Select value={academicYear} onValueChange={setAcademicYear}>
            <SelectTrigger className={selectShell}>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.length === 0 ? (
                <SelectItem value="__none__" disabled>
                  No academic years
                </SelectItem>
              ) : (
                years.map((year) => (
                  <SelectItem key={year.id} value={year.name}>
                    {year.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className={labelClass}>Grade</Label>
          <Select
            value={gradeId}
            onValueChange={(value) => {
              setGradeId(value);
              setStudentId("");
            }}
          >
            <SelectTrigger className={selectShell}>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {gradeOptions.length === 0 ? (
                <SelectItem value="__none__" disabled>
                  No grades configured
                </SelectItem>
              ) : (
                gradeOptions.map((grade) => (
                  <SelectItem key={grade.id} value={grade.id}>
                    {grade.name} · {grade.levelName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className={labelClass}>Student</Label>
          <Select
            value={studentId}
            onValueChange={setStudentId}
            disabled={!gradeId || studentsQuery.isLoading}
          >
            <SelectTrigger className={selectShell}>
              <SelectValue
                placeholder={
                  studentsQuery.isLoading ? "Loading…" : "Select student"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {students.length === 0 ? (
                <SelectItem value="__none__" disabled>
                  No students
                </SelectItem>
              ) : (
                students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.user?.name ?? student.admission_number}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4">
        {!academicYear || !studentId ? (
          <SchoolEmpty
            icon={FileText}
            title="Pick a year and student"
            description="Choose an academic year, grade and student to preview their report card."
          />
        ) : reportQuery.isLoading ? (
          <SchoolLoading label="Building report card…" />
        ) : reportQuery.isError ? (
          <SchoolEmpty
            icon={AlertTriangle}
            title="Could not load the report card"
            description={
              reportQuery.error instanceof Error
                ? reportQuery.error.message
                : "Please try again."
            }
          />
        ) : !report ? (
          <SchoolEmpty
            icon={FileText}
            title="No report card available"
            description="This student has no recorded marks for the selected academic year yet."
          />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a4d42]/10 pb-3 dark:border-white/10">
              <div>
                <p className="text-sm font-semibold text-[#0a1f1a] dark:text-white">
                  {report.studentName}
                </p>
                <p className="text-xs text-[#1a4d42]/60 dark:text-white/50">
                  {report.admissionNumber} · {report.gradeLevel} · {
                    report.totalAssessments
                  }{" "}
                  assessment{report.totalAssessments === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#1a4d42]/45 dark:text-white/40">
                    Overall
                  </p>
                  <p className="font-display text-xl text-[#0a1f1a] dark:text-white">
                    {report.overallGrade}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="rounded-none border-[#246a59]/30 bg-[#246a59]/10 text-[#246a59] dark:border-[#246a59]/40 dark:text-emerald-300"
                >
                  {report.overallAverage.toFixed(1)}%
                </Badge>
              </div>
            </div>

            {report.termPerformances.length ? (
              <div className="flex flex-wrap gap-1.5">
                {report.termPerformances.map((term) => (
                  <Badge
                    key={`${term.academicYear}-${term.term}`}
                    variant="outline"
                    className="rounded-none border-[#1a4d42]/15 bg-white text-xs font-normal text-[#0a1f1a] dark:border-white/15 dark:bg-[#0c1a17] dark:text-white/80"
                  >
                    Term {term.term}: {term.grade} · {term.percentage.toFixed(1)}%
                  </Badge>
                ))}
              </div>
            ) : null}

            {report.allSubjects.length ? (
              <div className="overflow-x-auto border border-[#1a4d42]/12 dark:border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1a4d42]/10 bg-[#f8fbfa] text-left dark:border-white/10 dark:bg-[#071411]">
                      <th className={thClass}>Subject</th>
                      <th className={thClass}>Grade</th>
                      <th className={thClass}>Average</th>
                      <th className={thClass}>Score</th>
                      <th className={thClass}>Assessments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.allSubjects.map((row) => (
                      <tr
                        key={row.subjectId}
                        className="border-b border-[#1a4d42]/8 last:border-0 dark:border-white/5"
                      >
                        <td className="px-3 py-2.5 font-medium text-[#0a1f1a] dark:text-white">
                          {row.subjectName}
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge
                            variant="outline"
                            className="rounded-none border-[#1a4d42]/15 text-[#0a1f1a] dark:border-white/15 dark:text-white/80"
                          >
                            {row.grade}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 tabular-nums text-[#1a4d42]/70 dark:text-white/60">
                          {row.average.toFixed(1)}
                        </td>
                        <td className="px-3 py-2.5 tabular-nums text-[#1a4d42]/70 dark:text-white/60">
                          {row.totalScore}/{row.maxPossibleScore}
                        </td>
                        <td className="px-3 py-2.5 tabular-nums text-[#1a4d42]/70 dark:text-white/60">
                          {row.assessmentsCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <SchoolEmpty
                icon={BookOpen}
                title="No subject marks"
                description="There are no subject marks recorded on this report card."
              />
            )}
          </div>
        )}
      </div>
    </SchoolPanel>
  );
}

export function ReportsPanel() {
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [academicYear, setAcademicYear] = useState("");
  const trimmedYear = academicYear.trim();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["school-reports", subdomain, trimmedYear],
    queryFn: () => fetchReportExamSessions(subdomain, trimmedYear || undefined),
    enabled: Boolean(subdomain),
  });

  const sessions = useMemo(() => {
    const list = data ?? [];
    return [...list].sort((a, b) => {
      if (a.academicYear !== b.academicYear) {
        return a.academicYear < b.academicYear ? 1 : -1;
      }
      if (a.term !== b.term) return b.term - a.term;
      return a.name.localeCompare(b.name);
    });
  }, [data]);

  const publishedCount = sessions.filter((s) => s.resultsPublished).length;
  const pendingCount = sessions.length - publishedCount;
  const candidateTotal = sessions.reduce(
    (total, s) => total + (s.registeredCandidatesCount ?? 0),
    0,
  );

  const errorMessage =
    error instanceof Error ? error.message : "Something went wrong.";

  const handleRefresh = async () => {
    const result = await refetch();
    if (result.isError) {
      toast.error(
        result.error instanceof Error
          ? result.error.message
          : "Could not refresh reports",
      );
    } else {
      toast.success("Reports refreshed");
    }
  };

  return (
    <SchoolPage
      eyebrow="Insights"
      title="Reports"
      subtitle="Exam results, rankings and report cards are generated per exam session — review each session's output or open it to publish and download."
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SchoolStat
          icon={FileText}
          label="Exam sessions"
          value={sessions.length}
          hint={trimmedYear ? trimmedYear : "All academic years"}
        />
        <SchoolStat
          icon={CheckCircle2}
          label="Results published"
          value={publishedCount}
        />
        <SchoolStat
          icon={Hourglass}
          label="Processing pending"
          value={pendingCount}
        />
        <SchoolStat
          icon={Users}
          label="Registered candidates"
          value={candidateTotal}
        />
      </div>

      <StudentReportCardPanel subdomain={subdomain} />

      <SchoolPanel
        icon={FileText}
        title="Exam sessions"
        actions={
          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <label htmlFor="reports-academic-year" className={labelClass}>
                Academic year
              </label>
              <Input
                id="reports-academic-year"
                className={cn(fieldShell, "w-40")}
                placeholder="e.g. 2025"
                value={academicYear}
                onChange={(event) => setAcademicYear(event.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className={outlineButtonClass}
              onClick={() => void handleRefresh()}
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Refresh
            </Button>
          </div>
        }
      >
        {isLoading ? (
          <SchoolLoading label="Loading exam sessions…" />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <AlertTriangle className="h-7 w-7 text-red-500" />
            <p className="text-sm font-medium text-[#0a1f1a] dark:text-white">
              Could not load reports
            </p>
            <p className="max-w-md text-sm text-[#1a4d42]/55 dark:text-white/45">
              {errorMessage}
            </p>
            <Button
              type="button"
              variant="outline"
              className={cn(outlineButtonClass, "mt-1")}
              onClick={() => void handleRefresh()}
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Try again
            </Button>
          </div>
        ) : sessions.length === 0 ? (
          <SchoolEmpty
            icon={FileText}
            title={
              trimmedYear
                ? `No exam sessions for ${trimmedYear}`
                : "No exam sessions yet"
            }
            description="Create an exam session from the Exams module to generate results, rankings and report cards."
          />
        ) : (
          <ul className="divide-y divide-[#1a4d42]/10 dark:divide-white/10">
            {sessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                subdomain={subdomain}
              />
            ))}
          </ul>
        )}
      </SchoolPanel>
    </SchoolPage>
  );
}
