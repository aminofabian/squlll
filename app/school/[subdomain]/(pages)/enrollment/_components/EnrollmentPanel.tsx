"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock3,
  GraduationCap,
  Layers,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SchoolEmpty,
  SchoolLoading,
  SchoolPage,
  SchoolPanel,
  SchoolStat,
  outlineButtonClass,
  primaryButtonClass,
  thClass,
} from "@/components/school/SchoolContentPage";
import { cn } from "@/lib/utils";
import {
  fetchAdmissionApplications,
  fetchEnrollmentByGradeLevel,
  type AdmissionApplicationStatus,
} from "@/lib/school/enrollment";

const STATUS_LABEL: Record<AdmissionApplicationStatus, string> = {
  NEW: "New",
  REVIEWING: "Reviewing",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

const STATUS_BADGE_CLASS: Record<AdmissionApplicationStatus, string> = {
  NEW: "border-amber-300/70 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200",
  REVIEWING:
    "border-[#246a59]/30 bg-[#e8f2ef] text-[#1a4d42] dark:border-white/15 dark:bg-[#246a59]/20 dark:text-emerald-200",
  ACCEPTED:
    "border-emerald-300/70 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200",
  REJECTED:
    "border-rose-300/70 bg-rose-50 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200",
  WITHDRAWN:
    "border-[#1a4d42]/15 bg-[#f3f7f5] text-[#1a4d42]/70 dark:border-white/10 dark:bg-white/5 dark:text-white/55",
};

const PROGRAMME_LABEL: Record<string, string> = {
  "early-years": "Early Years",
  primary: "Primary",
  "junior-secondary": "Junior Secondary",
  "senior-secondary": "Senior Secondary",
};

function programmeLabel(programme: string): string {
  return PROGRAMME_LABEL[programme] ?? programme;
}

/**
 * Read-only enrollment overview for a school: the admissions funnel (applied,
 * accepted, enrolled, pending) plus the enrolled-student totals per grade level.
 */
export function EnrollmentPanel() {
  const params = useParams();
  const subdomain = params.subdomain as string;

  const enrollmentQuery = useQuery({
    queryKey: ["enrollment", subdomain],
    queryFn: async () => {
      const [applications, byGradeLevel] = await Promise.all([
        fetchAdmissionApplications(subdomain),
        fetchEnrollmentByGradeLevel(subdomain),
      ]);
      return { applications, byGradeLevel };
    },
    enabled: Boolean(subdomain),
  });

  const { refetch, isFetching } = enrollmentQuery;

  useEffect(() => {
    if (enrollmentQuery.isError) {
      toast.error(
        enrollmentQuery.error instanceof Error
          ? enrollmentQuery.error.message
          : "Failed to load enrollment",
      );
    }
  }, [enrollmentQuery.isError, enrollmentQuery.error]);

  const applications = enrollmentQuery.data?.applications ?? [];
  const byGradeLevel = enrollmentQuery.data?.byGradeLevel ?? [];

  const acceptedCount = applications.filter(
    (app) => app.status === "ACCEPTED",
  ).length;
  const enrolledCount = applications.filter(
    (app) => app.status === "ACCEPTED" && app.enrolledStudentId != null,
  ).length;
  const pendingCount = applications.filter(
    (app) => app.status === "NEW" || app.status === "REVIEWING",
  ).length;

  return (
    <SchoolPage
      eyebrow="Admissions"
      title="Enrollment"
      subtitle="The admissions funnel at a glance — applications, acceptances and the students enrolled in each grade level."
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            className={outlineButtonClass}
          >
            <RefreshCw
              className={cn("mr-2 h-3.5 w-3.5", isFetching && "animate-spin")}
            />
            Refresh
          </Button>
          <Button asChild size="sm" className={primaryButtonClass}>
            <Link href="/admissions/applications">
              <ClipboardList className="mr-2 h-3.5 w-3.5" />
              Manage admissions
            </Link>
          </Button>
        </>
      }
    >
      {enrollmentQuery.isLoading ? (
        <SchoolPanel icon={GraduationCap}>
          <SchoolLoading label="Loading enrollment…" />
        </SchoolPanel>
      ) : enrollmentQuery.isError ? (
        <SchoolPanel icon={AlertCircle}>
          <SchoolEmpty
            icon={AlertCircle}
            title="Couldn't load enrollment"
            description={
              enrollmentQuery.error instanceof Error
                ? enrollmentQuery.error.message
                : "Something went wrong while fetching enrollment data."
            }
          />
        </SchoolPanel>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SchoolStat
              label="Applications"
              value={applications.length}
              icon={ClipboardList}
            />
            <SchoolStat
              label="Accepted"
              value={acceptedCount}
              icon={CheckCircle2}
            />
            <SchoolStat
              label="Enrolled"
              value={enrolledCount}
              hint="Accepted & enrolled"
              icon={UserCheck}
            />
            <SchoolStat
              label="Pending"
              value={pendingCount}
              hint="New + reviewing"
              icon={Clock3}
            />
          </div>

          <SchoolPanel icon={Layers} title="Students by grade level">
            {byGradeLevel.length === 0 ? (
              <SchoolEmpty
                icon={GraduationCap}
                title="No grade levels yet"
                description="Once students are enrolled, their grade-level totals will appear here."
              />
            ) : (
              <div className="overflow-x-auto border border-[#1a4d42]/12 dark:border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1a4d42]/10 bg-[#f8fbfa] text-left dark:border-white/10 dark:bg-[#071411]">
                      <th className={thClass}>Grade</th>
                      <th className={thClass}>Curriculum</th>
                      <th className={cn(thClass, "text-right")}>
                        Students enrolled
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {byGradeLevel.map((row) => (
                      <tr
                        key={row.gradeLevelId}
                        className="border-b border-[#1a4d42]/8 last:border-0 dark:border-white/5"
                      >
                        <td className="px-3 py-2.5 text-[#0a1f1a] dark:text-white">
                          {row.gradeLevelName}
                        </td>
                        <td className="px-3 py-2.5 text-[#1a4d42]/70 dark:text-white/60">
                          {row.curriculumName}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-[#0a1f1a] dark:text-white">
                          {row.totalStudents}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SchoolPanel>

          <SchoolPanel icon={ClipboardList} title="Admission applications">
            {applications.length === 0 ? (
              <SchoolEmpty
                icon={ClipboardList}
                title="No applications yet"
                description="New admission applications will show up here as they arrive."
              />
            ) : (
              <div className="overflow-x-auto border border-[#1a4d42]/12 dark:border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1a4d42]/10 bg-[#f8fbfa] text-left dark:border-white/10 dark:bg-[#071411]">
                      <th className={thClass}>Student</th>
                      <th className={thClass}>Programme</th>
                      <th className={thClass}>Start term</th>
                      <th className={thClass}>Reference</th>
                      <th className={thClass}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr
                        key={app.id}
                        className="border-b border-[#1a4d42]/8 last:border-0 dark:border-white/5"
                      >
                        <td className="px-3 py-2.5 text-[#0a1f1a] dark:text-white">
                          {app.studentFirstName} {app.studentLastName}
                        </td>
                        <td className="px-3 py-2.5 text-[#1a4d42]/70 dark:text-white/60">
                          {programmeLabel(app.programme)}
                        </td>
                        <td className="px-3 py-2.5 text-[#1a4d42]/70 dark:text-white/60">
                          {app.startTerm}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs text-[#1a4d42]/70 dark:text-white/60">
                          {app.reference}
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-full text-[10px] font-semibold",
                              STATUS_BADGE_CLASS[app.status],
                            )}
                          >
                            {STATUS_LABEL[app.status]}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SchoolPanel>
        </>
      )}
    </SchoolPage>
  );
}
