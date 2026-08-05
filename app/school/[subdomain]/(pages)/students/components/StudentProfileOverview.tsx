"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  KeyRound,
  Mail,
  Phone,
  Wallet,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StudentDetailSummary } from "@/types/student";
import {
  studentsEnrollLink,
  studentsGhostButton,
  studentsPanel,
} from "./students-ui";
import { cn } from "@/lib/utils";
import { useStudentParents } from "@/lib/hooks/useStudentParents";
import { LinkParentDrawer } from "./LinkParentDrawer";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface StudentProfileOverviewProps {
  student: StudentDetailSummary;
  missingStream: boolean;
  onTabSelect: (tab: string) => void;
  onAssignClass: () => void;
}

function OverviewCard({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn(studentsPanel, "flex flex-col")}>
      <div className="flex items-center justify-between gap-2 border-b border-[#1a4d42]/10 bg-[#f8fbfa] px-4 py-3 dark:border-white/10 dark:bg-[#071411]">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#0a1f1a] dark:text-white">
          <Icon className="h-4 w-4 text-[#1a4d42]/40" />
          {title}
        </h3>
        {action}
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}

export function StudentProfileOverview({
  student,
  missingStream,
  onTabSelect,
  onAssignClass,
}: StudentProfileOverviewProps) {
  const balance = Math.max(0, student.feeSummary.balance);
  const grossFees = student.feeSummary.totalPaid + balance;
  const collectionRate =
    grossFees > 0
      ? Math.round((student.feeSummary.totalPaid / grossFees) * 100)
      : 100;

  const {
    parents,
    loading: parentsLoading,
    refetch: refetchParents,
  } = useStudentParents(student.id);

  const studentForLink = {
    id: student.id,
    name: student.studentName,
    admissionNumber: student.admissionNumber,
    gradeLevelName: student.gradeLevelName,
    streamName: student.streamName ?? undefined,
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <OverviewCard
        title="Fees at a glance"
        icon={Wallet}
        action={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(studentsGhostButton, "h-7 w-auto gap-1 text-[#246a59]")}
            onClick={() => onTabSelect("money")}
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Button>
        }
      >
        <dl className="grid grid-cols-2 gap-3">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
              Balance
            </dt>
            <dd
              className={cn(
                "mt-0.5 text-lg font-semibold tabular-nums",
                balance > 0 ? "text-amber-800" : "text-[#246a59]",
              )}
            >
              {formatCurrency(balance)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
              Collected
            </dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums text-[#246a59]">
              {collectionRate}%
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-[#1a4d42]/50">
          {student.feeSummary.numberOfFeeItems} fee item
          {student.feeSummary.numberOfFeeItems !== 1 ? "s" : ""} assigned
        </p>
        {balance > 0 ? (
          <Button
            type="button"
            size="sm"
            className={cn(studentsEnrollLink, "mt-3 h-8")}
            asChild
          >
            <Link href="/fees?section=balances">Record payment in Fees</Link>
          </Button>
        ) : null}
      </OverviewCard>

      <OverviewCard
        title="Enrollment"
        icon={GraduationCap}
        action={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(studentsGhostButton, "h-7 w-auto gap-1 text-[#246a59]")}
            onClick={() => onTabSelect("enrollment")}
          >
            Details
            <ArrowRight className="h-3 w-3" />
          </Button>
        }
      >
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between gap-2">
            <span className="text-[#1a4d42]/45">Grade</span>
            <span className="font-medium text-[#0a1f1a] dark:text-white">
              {student.gradeLevelName}
            </span>
          </li>
          <li className="flex justify-between gap-2">
            <span className="text-[#1a4d42]/45">Stream</span>
            <span
              className={cn(
                "font-medium",
                missingStream
                  ? "text-amber-800"
                  : "text-[#0a1f1a] dark:text-white",
              )}
            >
              {student.streamName || "Not assigned"}
            </span>
          </li>
          <li className="flex justify-between gap-2">
            <span className="text-[#1a4d42]/45">Curriculum</span>
            <span className="font-medium text-[#0a1f1a] dark:text-white">
              {student.curriculumName || "—"}
            </span>
          </li>
        </ul>
        {missingStream ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 h-8 w-full rounded-none border-[#1a4d42]/15 text-xs"
            onClick={onAssignClass}
          >
            Assign class now
          </Button>
        ) : null}
      </OverviewCard>

      <OverviewCard title="Contact" icon={Mail}>
        <ul className="space-y-2.5 text-sm">
          <li className="flex items-start gap-2">
            <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1a4d42]/40" />
            {student.email ? (
              <a
                href={`mailto:${student.email}`}
                className="break-all text-[#246a59] hover:underline"
              >
                {student.email}
              </a>
            ) : (
              <span className="text-[#1a4d42]/40">No email</span>
            )}
          </li>
          <li className="flex items-start gap-2">
            <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1a4d42]/40" />
            {student.phone ? (
              <a
                href={`tel:${student.phone}`}
                className="text-[#0a1f1a] hover:underline dark:text-white"
              >
                {student.phone}
              </a>
            ) : (
              <span className="text-[#1a4d42]/40">No phone</span>
            )}
          </li>
        </ul>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(studentsGhostButton, "mt-3 h-7 w-auto px-0 text-[#246a59]")}
          onClick={() => onTabSelect("person")}
        >
          Full personal details
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </OverviewCard>

      <OverviewCard
        title="Portal access"
        icon={KeyRound}
        action={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(studentsGhostButton, "h-7 w-auto gap-1 text-[#246a59]")}
            onClick={() => onTabSelect("access")}
          >
            Manage
            <ArrowRight className="h-3 w-3" />
          </Button>
        }
      >
        <p className="text-sm text-[#1a4d42]/65 dark:text-white/70">
          {student.userId
            ? "Student account is linked — they can sign in to the student portal when active."
            : "No login account yet. Set up credentials so this student can access the portal."}
        </p>
        <p className="mt-2 text-xs text-[#1a4d42]/45">
          Registered{" "}
          {new Date(student.createdAt).toLocaleDateString("en-KE", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </OverviewCard>

      <OverviewCard
        title="Parents & guardians"
        icon={Users}
        action={
          <LinkParentDrawer
            student={studentForLink}
            linkedParentIds={parents.map((p) => p.id)}
            onLinked={() => void refetchParents()}
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(studentsGhostButton, "h-7 w-auto gap-1 text-[#246a59]")}
              >
                Link parent
                <ArrowRight className="h-3 w-3" />
              </Button>
            }
          />
        }
      >
        {parentsLoading ? (
          <div className="flex items-center gap-2 text-sm text-[#1a4d42]/55">
            <Loader2 className="h-4 w-4 animate-spin text-[#246a59]" />
            Loading…
          </div>
        ) : parents.length === 0 ? (
          <div>
            <p className="text-sm text-[#1a4d42]/65 dark:text-white/70">
              No guardian linked yet.
            </p>
            <p className="mt-1 text-xs text-[#1a4d42]/45">
              Link a parent for portal access to fees and grades.
            </p>
            <div className="mt-3">
              <LinkParentDrawer
                student={studentForLink}
                linkedParentIds={[]}
                onLinked={() => void refetchParents()}
                trigger={
                  <Button
                    type="button"
                    size="sm"
                    className={cn(studentsEnrollLink, "h-8 gap-1.5")}
                  >
                    <Users className="h-3.5 w-3.5" />
                    Link parent
                  </Button>
                }
              />
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {parents.slice(0, 2).map((parent) => (
              <li
                key={parent.id}
                className="flex items-center justify-between gap-2 rounded-none border border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-2 dark:border-white/10 dark:bg-[#071411]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#0a1f1a] dark:text-white">
                    {parent.name}
                  </p>
                  <p className="truncate text-xs text-[#1a4d42]/50">
                    {parent.email}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-none px-2 py-0.5 text-[10px] font-medium",
                    parent.userId
                      ? "bg-[#e8f2ef] text-[#1a4d42]"
                      : "bg-amber-100 text-amber-800",
                  )}
                >
                  {parent.userId ? "Active" : "Pending"}
                </span>
              </li>
            ))}
            {parents.length > 2 ? (
              <p className="text-xs text-[#1a4d42]/45">
                +{parents.length - 2} more — see Person tab
              </p>
            ) : null}
          </ul>
        )}
      </OverviewCard>

      <div className={cn(studentsPanel, "lg:col-span-2")}>
        <div className="flex items-center justify-between gap-2 border-b border-[#1a4d42]/10 bg-[#f8fbfa] px-4 py-3 dark:border-white/10 dark:bg-[#071411]">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#0a1f1a] dark:text-white">
            <BookOpen className="h-4 w-4 text-[#1a4d42]/40" />
            Documents
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(studentsGhostButton, "h-7 w-auto gap-1 text-[#246a59]")}
            onClick={() => onTabSelect("documents")}
          >
            Open
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
        <p className="px-4 py-4 text-xs text-[#1a4d42]/50">
          Report cards and uploaded files — view and print from the Documents
          tab.
        </p>
      </div>
    </div>
  );
}
