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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StudentDetailSummary } from "@/types/student";
import { studentsPanel } from "./students-ui";
import { cn } from "@/lib/utils";

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
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          <Icon className="h-4 w-4 text-slate-400" />
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
            className="h-7 gap-1 text-xs text-[#0073ea]"
            onClick={() => onTabSelect("money")}
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Button>
        }
      >
        <dl className="grid grid-cols-2 gap-3">
          <div>
            <dt className="text-[10px] font-medium uppercase text-slate-400">
              Balance
            </dt>
            <dd
              className={cn(
                "mt-0.5 text-lg font-bold tabular-nums",
                balance > 0 ? "text-amber-700" : "text-emerald-700",
              )}
            >
              {formatCurrency(balance)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase text-slate-400">
              Collected
            </dt>
            <dd className="mt-0.5 text-lg font-bold tabular-nums text-emerald-700">
              {collectionRate}%
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-slate-500">
          {student.feeSummary.numberOfFeeItems} fee item
          {student.feeSummary.numberOfFeeItems !== 1 ? "s" : ""} assigned
        </p>
        {balance > 0 ? (
          <Button
            type="button"
            size="sm"
            className="mt-3 h-8 bg-[#0073ea] text-xs hover:bg-[#0062c4]"
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
            className="h-7 gap-1 text-xs text-[#0073ea]"
            onClick={() => onTabSelect("enrollment")}
          >
            Details
            <ArrowRight className="h-3 w-3" />
          </Button>
        }
      >
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between gap-2">
            <span className="text-slate-400">Grade</span>
            <span className="font-medium text-slate-800 dark:text-slate-100">
              {student.gradeLevelName}
            </span>
          </li>
          <li className="flex justify-between gap-2">
            <span className="text-slate-400">Stream</span>
            <span
              className={cn(
                "font-medium",
                missingStream
                  ? "text-amber-700"
                  : "text-slate-800 dark:text-slate-100",
              )}
            >
              {student.streamName || "Not assigned"}
            </span>
          </li>
          <li className="flex justify-between gap-2">
            <span className="text-slate-400">Curriculum</span>
            <span className="font-medium text-slate-800 dark:text-slate-100">
              {student.curriculumName || "—"}
            </span>
          </li>
        </ul>
        {missingStream ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 h-8 w-full text-xs"
            onClick={onAssignClass}
          >
            Assign class now
          </Button>
        ) : null}
      </OverviewCard>

      <OverviewCard title="Contact" icon={Mail}>
        <ul className="space-y-2.5 text-sm">
          <li className="flex items-start gap-2">
            <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            {student.email ? (
              <a
                href={`mailto:${student.email}`}
                className="break-all text-[#0073ea] hover:underline"
              >
                {student.email}
              </a>
            ) : (
              <span className="text-slate-400">No email</span>
            )}
          </li>
          <li className="flex items-start gap-2">
            <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            {student.phone ? (
              <a href={`tel:${student.phone}`} className="hover:underline">
                {student.phone}
              </a>
            ) : (
              <span className="text-slate-400">No phone</span>
            )}
          </li>
        </ul>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-3 h-7 px-0 text-xs text-[#0073ea]"
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
            className="h-7 gap-1 text-xs text-[#0073ea]"
            onClick={() => onTabSelect("access")}
          >
            Manage
            <ArrowRight className="h-3 w-3" />
          </Button>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {student.userId
            ? "Student account is linked — they can sign in to the student portal when active."
            : "No login account yet. Set up credentials so this student can access the portal."}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Registered{" "}
          {new Date(student.createdAt).toLocaleDateString("en-KE", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </OverviewCard>

      <div className={cn(studentsPanel, "lg:col-span-2")}>
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <BookOpen className="h-4 w-4 text-slate-400" />
            Documents
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-[#0073ea]"
            onClick={() => onTabSelect("documents")}
          >
            Open
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
        <p className="px-4 py-4 text-xs text-slate-500">
          Report cards and uploaded files — view and print from the Documents
          tab.
        </p>
      </div>
    </div>
  );
}
