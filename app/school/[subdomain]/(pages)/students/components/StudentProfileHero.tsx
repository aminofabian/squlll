"use client";

import Link from "next/link";
import {
  Banknote,
  Copy,
  GraduationCap,
  KeyRound,
  MoreHorizontal,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StudentDetailSummary } from "@/types/student";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  studentsActionButton,
  studentsEnrollLink,
  studentsPanel,
} from "./students-ui";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

function StudentAvatar({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-none bg-[#0a1f1a] text-lg font-bold text-white">
      {initials || "?"}
    </div>
  );
}

interface StudentProfileHeroProps {
  student: StudentDetailSummary;
  missingStream: boolean;
  onAssignClass: () => void;
  onTabSelect: (tab: string) => void;
}

export function StudentProfileHero({
  student,
  missingStream,
  onAssignClass,
  onTabSelect,
}: StudentProfileHeroProps) {
  const balance = Math.max(0, student.feeSummary.balance);
  const hasAccount = Boolean(student.userId);

  const copyCard = () => {
    const lines = [
      student.studentName,
      student.admissionNumber,
      student.gradeLevelName,
      student.streamName,
      student.email,
      student.phone,
    ].filter(Boolean);
    void navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Student details copied");
  };

  return (
    <div className={cn(studentsPanel)}>
      <div className="border-b border-[#1a4d42]/10 bg-[#f8fbfa] px-4 py-4 dark:border-white/10 dark:bg-[#071411] sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <StudentAvatar name={student.studentName} />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-normal tracking-tight text-[#0a1f1a] dark:text-white sm:text-2xl">
              {student.studentName}
            </h2>
            <p className="mt-0.5 text-sm text-[#1a4d42]/55">
              {student.admissionNumber}
              {student.streamName
                ? ` · ${student.gradeLevelName} — ${student.streamName}`
                : ` · ${student.gradeLevelName}`}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className={cn(
                  "rounded-none text-[10px] font-medium",
                  student.isActive
                    ? "border-[#246a59]/25 bg-[#e8f2ef] text-[#1a4d42]"
                    : "border-amber-200 bg-amber-50 text-amber-800",
                )}
              >
                {student.isActive ? "Active" : "Inactive"}
              </Badge>
              {student.gender ? (
                <Badge
                  variant="outline"
                  className="rounded-none text-[10px] font-medium capitalize text-[#1a4d42]/65"
                >
                  {student.gender.toLowerCase()}
                </Badge>
              ) : null}
              {student.schoolType ? (
                <Badge
                  variant="outline"
                  className="rounded-none text-[10px] font-medium capitalize text-[#1a4d42]/65"
                >
                  {student.schoolType}
                </Badge>
              ) : null}
              {missingStream ? (
                <Badge
                  variant="outline"
                  className="rounded-none border-amber-200 bg-amber-50 text-[10px] font-medium text-amber-800"
                >
                  No stream
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
            <Button
              type="button"
              size="sm"
              className={cn(studentsEnrollLink, "h-8 gap-1.5 px-3")}
              onClick={onAssignClass}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              {student.gradeLevelId ? "Change class" : "Assign class"}
            </Button>
            <div className="flex gap-1.5">
              {balance > 0 ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={cn(studentsActionButton, "h-8")}
                  asChild
                >
                  <Link href={`/fees?section=balances`}>
                    <Banknote className="h-3.5 w-3.5" />
                    Record payment
                  </Link>
                </Button>
              ) : null}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(studentsActionButton, "h-8 w-8 p-0")}
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 rounded-none"
                >
                  <DropdownMenuItem onClick={copyCard}>
                    <Copy className="mr-2 h-3.5 w-3.5" />
                    Copy details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTabSelect("person")}>
                    <User className="mr-2 h-3.5 w-3.5" />
                    Personal info
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTabSelect("access")}>
                    <KeyRound className="mr-2 h-3.5 w-3.5" />
                    Portal access
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-[#1a4d42]/10 bg-[#1a4d42]/12 sm:grid-cols-4">
        <StatCell
          label="Balance"
          onClick={() => onTabSelect("money")}
          value={
            <span
              className={cn(
                "tabular-nums",
                balance > 0 ? "text-amber-800" : "text-[#246a59]",
              )}
            >
              {formatCurrency(balance)}
            </span>
          }
        />
        <StatCell
          label="Paid"
          onClick={() => onTabSelect("money")}
          value={
            <span className="tabular-nums text-[#246a59]">
              {formatCurrency(student.feeSummary.totalPaid)}
            </span>
          }
        />
        <StatCell
          label="Class"
          onClick={() => onTabSelect("enrollment")}
          value={
            <span className="truncate">
              {student.streamName || student.gradeLevelName || "—"}
            </span>
          }
        />
        <StatCell
          label="Portal"
          onClick={() => onTabSelect("access")}
          value={hasAccount ? "Linked" : "Not set up"}
        />
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-[#f8fbfa] px-3 py-2.5 text-left transition-colors hover:bg-[#e8f2ef] dark:bg-[#071411] dark:hover:bg-[#0c1a17]"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-[#0a1f1a] dark:text-white">
        {value}
      </p>
    </button>
  );
}
