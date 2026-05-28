"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSchoolConfig } from "../../../../../lib/hooks/useSchoolConfig";
import { useTenantStatistics } from "../../../../../lib/hooks/useTenantStatistics";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MobileNav } from "@/components/dashboard/MobileNav";
import {
  Users,
  BarChart3,
  GraduationCap,
  CalendarDays,
  ClipboardList,
  TrendingUp,
  BookOpen,
  PanelLeftOpen,
  PanelLeftClose,
  Plus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useStudentsStore } from "@/lib/stores/useStudentsStore";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardSearchSidebar } from "./components/DashboardSearchSidebar";
import { CreateTermModal } from "./components/CreateTermModal";
import { ViewAcademicYearsDrawer } from "./components/ViewAcademicYearsDrawer";
import { useCurrentAcademicYear } from "@/lib/hooks/useAcademicYears";

// ─── Helpers ───────────────────────────────────────────────────

function getGradeDisplayName(gradeName: string): string {
  const lower = gradeName.toLowerCase();
  if (lower.includes("pp1") || lower.includes("baby")) return "PP1";
  if (lower.includes("pp2") || lower.includes("nursery")) return "PP2";
  if (lower.includes("pp3") || lower.includes("reception")) return "PP3";
  if (lower.includes("grade 7") || lower.includes("g7")) return "Form 1";
  if (lower.includes("grade 8") || lower.includes("g8")) return "Form 2";
  if (lower.includes("grade 9") || lower.includes("g9")) return "Form 3";
  if (lower.includes("grade 10") || lower.includes("g10")) return "Form 4";
  if (lower.includes("grade 11") || lower.includes("g11")) return "Form 5";
  if (lower.includes("grade 12") || lower.includes("g12")) return "Form 6";
  const match = gradeName.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    if (num >= 1 && num <= 6) return `Grade ${num}`;
  }
  return gradeName;
}

// ─── Component ─────────────────────────────────────────────────

export default function SchoolDashboard() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;
  const schoolName = subdomain
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showCreateTermModal, setShowCreateTermModal] = useState(false);

  // Data hooks
  const { getActiveAcademicYear } = useCurrentAcademicYear();
  const currentAcademicYear = getActiveAcademicYear();
  const { data: config, isLoading, error } = useSchoolConfig();
  const {
    data: tenantStats,
    isLoading: statsLoading,
    error: statsError,
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

  // Stats
  const stats = useMemo(() => {
    const pool = selectedGrade ? filteredStudents : students;
    const totalStudents =
      !selectedGrade && tenantStats ? tenantStats.studentCount : pool.length;
    const attendanceRate = selectedGrade ? 92.5 : 95.8;
    const academicProgress = selectedGrade ? 89.2 : 87.5;
    const monthlyChange = selectedGrade
      ? Math.floor(Math.random() * 10) + 2
      : Math.floor(Math.random() * 20) + 5;

    // Count active classes from students' grade assignments
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
      attendanceRate,
      academicProgress,
      monthlyChange,
    };
  }, [
    students,
    filteredStudents,
    selectedGrade,
    selectedGradeInfo,
    schoolConfig,
    tenantStats,
  ]);

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
      if (w >= 768 && w < 1200) setIsSidebarCollapsed(true);
      else if (w >= 1200) setIsSidebarCollapsed(false);
    };
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  const handleGradeSelect = useCallback((gradeId: string) => {
    setSelectedGrade(gradeId === "all" ? null : gradeId);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedGrade(null);
  }, []);

  // ─── Loading ───────────────────────────────────────────────

  if (isLoading || (statsLoading && !selectedGrade)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="ml-3 text-sm text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Something went wrong
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!config?.selectedLevels?.length) return null;

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div className="flex h-full">
      {!isSidebarCollapsed && (
        <DashboardSearchSidebar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearFilters={handleClearFilters}
          selectedGradeId={selectedGrade || "all"}
          onCollapse={() => setIsSidebarCollapsed(true)}
          students={students}
          selectedGrade={selectedGrade}
          onGradeSelect={handleGradeSelect}
          schoolConfig={schoolConfig}
        />
      )}

      <div className="flex-1 overflow-auto p-4 md:p-6 relative">
        {isSidebarCollapsed && (
          <div className="absolute top-4 left-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarCollapsed(false)}
              className="bg-white/80 backdrop-blur-sm shadow-sm"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Header Bar */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Dashboard
          </h1>
          <div className="flex items-center gap-2">
            <ViewAcademicYearsDrawer
              onAcademicYearCreated={() => {}}
              trigger={
                <Button variant="outline" size="sm" className="h-8">
                  <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-xs">Academic Year</span>
                </Button>
              }
            />
            {currentAcademicYear && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateTermModal(true)}
                className="h-8"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs">Create Term</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Page Header */}
          <div className="pb-5 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-medium uppercase tracking-wide text-primary bg-primary/5 px-2 py-0.5 rounded">
                {selectedGrade ? "Grade Overview" : "School Overview"}
              </span>
              {selectedGrade && (
                <button
                  onClick={() => setSelectedGrade(null)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  ← Back to All Grades
                </button>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {selectedGrade && selectedGradeInfo
                ? `${selectedGradeInfo.displayName} Dashboard`
                : `${schoolName} Dashboard`}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {selectedGrade
                ? `Monitor ${selectedGradeInfo?.displayName} performance`
                : "Monitor school performance and activities"}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Users className="h-5 w-5" />}
              label="Total Students"
              value={stats.totalStudents.toLocaleString()}
              change={`+${stats.monthlyChange} this month`}
              color="text-primary"
            />
            <StatCard
              icon={<CalendarDays className="h-5 w-5" />}
              label="Attendance Rate"
              value={`${stats.attendanceRate}%`}
              change="+0.6% vs last week"
              color="text-emerald-600"
            />
            <StatCard
              icon={<BookOpen className="h-5 w-5" />}
              label="Active Classes"
              value={stats.totalClasses.toString()}
              change="Current semester"
              color="text-purple-600"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="Academic Progress"
              value={`${stats.academicProgress}%`}
              change="+2.3% this term"
              color="text-blue-600"
            />
          </div>

          {/* Expandable School Stats (only when viewing all grades) */}
          {!selectedGrade && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
              <button
                onClick={() => setShowStats(!showStats)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      School Statistics
                    </h3>
                    <p className="text-xs text-slate-500">
                      View comprehensive metrics
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {tenantStats ? tenantStats.studentCount : students.length}{" "}
                    Students
                  </Badge>
                  {showStats ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </button>
              {showStats && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                  {tenantStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                      <div>
                        <div className="text-lg font-bold text-primary">
                          {tenantStats.studentCount}
                        </div>
                        <div className="text-xs text-slate-500">Students</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">
                          {tenantStats.teacherCount}
                        </div>
                        <div className="text-xs text-slate-500">Teachers</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">
                          {tenantStats.streamCount}
                        </div>
                        <div className="text-xs text-slate-500">Streams</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">
                          {tenantStats.totalCount}
                        </div>
                        <div className="text-xs text-slate-500">
                          Total Users
                        </div>
                      </div>
                    </div>
                  )}
                  {statsError && (
                    <p className="text-sm text-red-600 mt-2">
                      Failed to load statistics.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Grade Detail (when grade selected) */}
          {selectedGrade && selectedGradeInfo && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-5 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {selectedGradeInfo.displayName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selectedGradeInfo.level.name} ·{" "}
                    {selectedGradeInfo.level.subjects.length} subjects
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <DetailBlock
                  title="Demographics"
                  rows={[
                    {
                      label: "Male",
                      value: filteredStudents.filter(
                        (s) => s.gender.toLowerCase() === "male",
                      ).length,
                    },
                    {
                      label: "Female",
                      value: filteredStudents.filter(
                        (s) => s.gender.toLowerCase() === "female",
                      ).length,
                    },
                    {
                      label: "Active",
                      value: filteredStudents.filter((s) => s.isActive).length,
                    },
                  ]}
                />
                <DetailBlock
                  title="Financial"
                  rows={[
                    {
                      label: "Fees Paid",
                      value: `KES ${filteredStudents.reduce((sum, s) => sum + s.totalFeesPaid, 0).toLocaleString()}`,
                    },
                    {
                      label: "Outstanding",
                      value: `KES ${filteredStudents.reduce((sum, s) => sum + s.feesOwed, 0).toLocaleString()}`,
                    },
                    {
                      label: "Collection Rate",
                      value: `${(() => {
                        const p = filteredStudents.reduce(
                          (s, st) => s + st.totalFeesPaid,
                          0,
                        );
                        const o = filteredStudents.reduce(
                          (s, st) => s + st.feesOwed,
                          0,
                        );
                        return p + o > 0 ? Math.round((p / (p + o)) * 100) : 0;
                      })()}%`,
                    },
                  ]}
                />
                <DetailBlock
                  title="Academic"
                  rows={[
                    {
                      label: "Subjects",
                      value: selectedGradeInfo.level.subjects.length,
                    },
                    {
                      label: "Streams",
                      value: selectedGradeInfo.grade.streams?.length || 0,
                    },
                  ]}
                />
              </div>
            </div>
          )}

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <ContentCard title="Recent Activity">
              {[
                {
                  target:
                    selectedGrade && selectedGradeInfo
                      ? `${selectedGradeInfo.displayName}A`
                      : "Grade 10A",
                  action: "Attendance marked",
                  time: "Just now",
                },
                {
                  target: "Mathematics Class",
                  action: "Grades updated",
                  time: "30m ago",
                },
                {
                  target: "Parent-Teacher Meeting",
                  action: "Scheduled",
                  time: "1h ago",
                },
              ].map((item, i) => (
                <ActivityRow key={i} {...item} />
              ))}
            </ContentCard>

            <ContentCard title="Upcoming Events">
              {[
                {
                  name: `Parent-Teacher Conference`,
                  date: "Mar 15",
                  count: selectedGrade ? 25 : 45,
                },
                {
                  name: "Science Fair",
                  date: "Mar 20",
                  count: selectedGrade ? 60 : 120,
                },
                {
                  name: "Sports Day",
                  date: "Mar 25",
                  count: selectedGrade ? 100 : 200,
                },
              ].map((e) => (
                <div key={e.name} className="flex items-center gap-2 py-1.5">
                  <CalendarDays className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{e.name}</p>
                    <p className="text-xs text-slate-500">
                      {e.date} · {e.count} attendees
                    </p>
                  </div>
                </div>
              ))}
            </ContentCard>

            <ContentCard title="Class Performance">
              {(selectedGrade && selectedGradeInfo
                ? (selectedGradeInfo.grade.streams || []).map((s, i) => ({
                    name: `${selectedGradeInfo.displayName}${s.name}`,
                    average: 85 + Math.random() * 10,
                    students: Math.floor(
                      filteredStudents.length /
                        Math.max(
                          (selectedGradeInfo.grade.streams || []).length,
                          1,
                        ),
                    ),
                  }))
                : [
                    { name: "Grade 10A", average: 85.6, students: 32 },
                    { name: "Grade 11B", average: 82.3, students: 28 },
                    { name: "Grade 12C", average: 88.9, students: 30 },
                  ]
              ).map((c) => (
                <div key={c.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium truncate">{c.name}</span>
                    <span className="font-bold">{c.average.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${c.average}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {c.students} students
                  </p>
                </div>
              ))}
            </ContentCard>

            <ContentCard title="Quick Actions">
              <div className="grid grid-cols-2 gap-2">
                <QuickActionBtn
                  icon={<Users className="h-5 w-5" />}
                  label="Attendance"
                />
                <QuickActionBtn
                  icon={<GraduationCap className="h-5 w-5" />}
                  label="Grades"
                />
                <QuickActionBtn
                  icon={<CalendarDays className="h-5 w-5" />}
                  label="Events"
                />
                <QuickActionBtn
                  icon={<ClipboardList className="h-5 w-5" />}
                  label="Reports"
                />
              </div>
            </ContentCard>
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

// ─── Sub-components ────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  change,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  color: string;
}) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className={color}>{icon}</div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {value}
          </p>
          <p className="text-[11px] text-slate-400">{change}</p>
        </div>
      </div>
    </div>
  );
}

function ContentCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ActivityRow({
  target,
  action,
  time,
}: {
  target: string;
  action: string;
  time: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{target}</p>
        <p className="text-xs text-slate-500">{action}</p>
      </div>
      <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{time}</span>
    </div>
  );
}

function DetailBlock({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string | number }[];
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
        {title}
      </h4>
      <div className="space-y-1.5">
        {rows.map((r, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-slate-600 truncate mr-2">{r.label}</span>
            <span className="font-medium text-slate-900 dark:text-slate-100 flex-shrink-0">
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActionBtn({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="flex flex-col items-center gap-1.5 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
      <div className="text-primary">{icon}</div>
      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
        {label}
      </span>
    </button>
  );
}
