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
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0073ea]/20 to-[#0073ea]/5 text-lg font-bold text-[#0073ea] ring-2 ring-white dark:ring-slate-800">
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
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
      <div className="bg-gradient-to-br from-[#0073ea]/[0.06] via-white to-slate-50/80 px-4 py-4 dark:from-[#0073ea]/12 dark:via-slate-900 dark:to-slate-950 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <StudentAvatar name={student.studentName} />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {student.studentName}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {student.admissionNumber}
              {student.streamName
                ? ` · ${student.gradeLevelName} — ${student.streamName}`
                : ` · ${student.gradeLevelName}`}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-medium",
                  student.isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700",
                )}
              >
                {student.isActive ? "Active" : "Inactive"}
              </Badge>
              {student.gender ? (
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium capitalize text-slate-600"
                >
                  {student.gender.toLowerCase()}
                </Badge>
              ) : null}
              {student.schoolType ? (
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium capitalize text-slate-600"
                >
                  {student.schoolType}
                </Badge>
              ) : null}
              {missingStream ? (
                <Badge
                  variant="outline"
                  className="border-amber-200 bg-amber-50 text-[10px] font-medium text-amber-800"
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
              className="h-8 gap-1.5 bg-[#0073ea] text-xs hover:bg-[#0062c4]"
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
                  className="h-8 gap-1.5 text-xs"
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
                    className="h-8 w-8 p-0"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
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

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => onTabSelect("money")}
            className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2.5 text-left transition-colors hover:border-[#0073ea]/30 hover:bg-white dark:border-slate-700 dark:bg-slate-900/50"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Balance
            </p>
            <p
              className={cn(
                "mt-0.5 text-sm font-bold tabular-nums",
                balance > 0 ? "text-amber-700" : "text-emerald-700",
              )}
            >
              {formatCurrency(balance)}
            </p>
          </button>
          <button
            type="button"
            onClick={() => onTabSelect("money")}
            className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2.5 text-left transition-colors hover:border-[#0073ea]/30 dark:border-slate-700 dark:bg-slate-900/50"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Paid
            </p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-emerald-700">
              {formatCurrency(student.feeSummary.totalPaid)}
            </p>
          </button>
          <button
            type="button"
            onClick={() => onTabSelect("enrollment")}
            className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2.5 text-left transition-colors hover:border-[#0073ea]/30 dark:border-slate-700 dark:bg-slate-900/50"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Class
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              {student.streamName || student.gradeLevelName || "—"}
            </p>
          </button>
          <button
            type="button"
            onClick={() => onTabSelect("access")}
            className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2.5 text-left transition-colors hover:border-[#0073ea]/30 dark:border-slate-700 dark:bg-slate-900/50"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Portal
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
              {hasAccount ? "Linked" : "Not set up"}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
