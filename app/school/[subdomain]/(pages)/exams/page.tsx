"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ExamsFilterSidebar } from "@/components/dashboard/ExamsFilterSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Eye,
  Edit,
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
} from "lucide-react";
import { subjects } from "@/lib/data/mockExams";
import type { Exam, StudentExamResult } from "@/types/exam";
import { format } from "date-fns";
import { CreateExamDrawer } from "./components/CreateExamDrawer";
import { ReportCardTemplateModal } from "./components/ReportCardTemplateModal";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";

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

function StudentPerformanceView({ studentId }: { studentId: string }) {
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
                subjects={subjects}
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
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("Term 1");
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [viewMode, setViewMode] = useState<"overview" | "student">("overview");
  const [selectedStudentId, setSelectedStudentId] = useState<string>();
  const [examTypeFilter, setExamTypeFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedGradeId, setSelectedGradeId] = useState<string>();
  const [selectedLevelId, setSelectedLevelId] = useState<string>();
  const [refreshKey, setRefreshKey] = useState(0);

  const { config: schoolConfig } = useSchoolConfigStore();

  // Build classes from school config instead of hardcoded
  const classes = useMemo(() => {
    const result: string[] = [];
    if (schoolConfig?.selectedLevels) {
      for (const level of schoolConfig.selectedLevels) {
        for (const grade of level.gradeLevels || []) {
          const streams = grade.streams || [];
          if (streams.length > 0) {
            for (const stream of streams) {
              result.push(`${grade.name} ${stream.name}`);
            }
          } else {
            result.push(grade.name);
          }
        }
      }
    }
    return result.length > 0
      ? result
      : ["Form 1A", "Form 2A", "Form 3A", "Form 4A"];
  }, [schoolConfig]);

  const terms = ["Term 1", "Term 2", "Term 3"];
  const years = ["2023", "2024", "2025"];

  // TODO: Replace with real API data
  const exams: Exam[] = [];

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesClass = !selectedClass || exam.class === selectedClass;
      const matchesTerm = !selectedTerm || exam.term === selectedTerm;
      const matchesYear = !selectedYear || exam.academicYear === selectedYear;
      const matchesType =
        examTypeFilter === "all" || exam.examType === examTypeFilter;
      const matchesSubject =
        subjectFilter === "all" || exam.subject.name === subjectFilter;
      const matchesStatus =
        statusFilter === "all" || exam.status === statusFilter;
      return (
        matchesClass &&
        matchesTerm &&
        matchesYear &&
        matchesType &&
        matchesSubject &&
        matchesStatus
      );
    });
  }, [
    exams,
    selectedClass,
    selectedTerm,
    selectedYear,
    examTypeFilter,
    subjectFilter,
    statusFilter,
  ]);

  const handleGradeSelect = (gradeId: string, levelId: string) => {
    setSelectedGradeId(gradeId);
    setSelectedLevelId(levelId);
  };

  const handleExamCreated = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <DashboardLayout
      searchFilter={
        <ExamsFilterSidebar
          selectedGradeId={selectedGradeId}
          onGradeSelect={handleGradeSelect}
        />
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {viewMode === "student" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setViewMode("overview");
                      setSelectedStudentId(undefined);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <GraduationCap className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {viewMode === "student" ? "Student Performance" : "Exams"}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {viewMode === "student"
                      ? "Detailed performance analysis"
                      : "Manage and track examinations"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setRefreshKey((k) => k + 1)}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <CreateExamDrawer
                  onExamCreated={handleExamCreated}
                  trigger={
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Exam
                    </Button>
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student View */}
        {viewMode === "student" && selectedStudentId && (
          <StudentPerformanceView studentId={selectedStudentId} />
        )}

        {/* Overview */}
        {viewMode === "overview" && (
          <Card className="border border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Exams
                </CardTitle>
                <div className="flex flex-wrap gap-2 ml-auto">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="text-xs border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 bg-white dark:bg-slate-900"
                  >
                    <option value="">All Classes</option>
                    {classes.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="text-xs border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 bg-white dark:bg-slate-900"
                  >
                    {terms.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="text-xs border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 bg-white dark:bg-slate-900"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredExams.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="h-10 w-10" />}
                  title={
                    exams.length === 0
                      ? "No exams yet"
                      : "No exams match your filters"
                  }
                  description={
                    exams.length === 0
                      ? "Create your first exam to start tracking student performance."
                      : "Try adjusting your filters to see more results."
                  }
                  action={
                    exams.length === 0 ? (
                      <CreateExamDrawer
                        onExamCreated={handleExamCreated}
                        trigger={
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Exam
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
                          Exam
                        </th>
                        <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          Subject
                        </th>
                        <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          Type
                        </th>
                        <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          Date
                        </th>
                        <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          Marks
                        </th>
                        <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          Status
                        </th>
                        <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300 w-[100px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExams.map((exam) => (
                        <tr
                          key={exam.id}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {exam.title}
                            </div>
                            {exam.description && (
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {exam.description}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
                                <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                              </div>
                              <span className="text-slate-900 dark:text-slate-100">
                                {exam.subject.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant="outline" className="text-xs">
                              {exam.examType}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-xs">
                            {format(
                              new Date(exam.dateAdministered),
                              "MMM dd, yyyy",
                            )}
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-900 dark:text-slate-100">
                            {exam.totalMarks}
                          </td>
                          <td className="py-3 px-3">
                            <Badge
                              variant={
                                exam.status === "completed"
                                  ? "default"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {exam.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-0.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                              >
                                <Edit className="h-3.5 w-3.5" />
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
        )}
      </div>
    </DashboardLayout>
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
