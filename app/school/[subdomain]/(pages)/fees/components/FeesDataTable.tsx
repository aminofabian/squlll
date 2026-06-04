"use client";

import { Eye, Coins, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { FEES_LAYOUT, FEES_MOBILE } from "../lib/fees-ui";
import { StudentSummaryFromAPI } from "../types";
import { formatCurrency } from "../utils";
import { ArrearsAgingBadge } from "./ArrearsAgingBadge";
import { FeesDataTableSkeleton } from "./BalancesSkeletons";

interface FeesDataTableProps {
  students: StudentSummaryFromAPI[];
  loading: boolean;
  error: string | null;
  selectedStudents: string[];
  onSelectStudent: (studentId: string) => void;
  onSelectAll: () => void;
  onViewStudent: (student: StudentSummaryFromAPI) => void;
  embedded?: boolean;
  /** Fewer columns on Balances — no duplicate status/aging. */
  streamlined?: boolean;
}

function getStudentStatus(student: StudentSummaryFromAPI) {
  const { totalPaid, balance, numberOfFeeItems, creditBalance = 0 } =
    student.feeSummary;
  const arrears = Math.max(0, balance);

  if (arrears === 0 && totalPaid === 0 && numberOfFeeItems === 0) {
    return {
      label: "Pending",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  if (arrears === 0 && creditBalance > 0) {
    return {
      label: `Credit ${formatCurrency(creditBalance)}`,
      className: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }

  if (arrears === 0 && totalPaid > 0) {
    return {
      label: "Paid up",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (arrears > 0) {
    return {
      label: `${formatCurrency(arrears)} due`,
      className: "bg-rose-50 text-rose-700 border-rose-200",
    };
  }

  return {
    label: "—",
    className: "bg-slate-50 text-slate-500 border-slate-200",
  };
}

export const FeesDataTable = ({
  students,
  loading,
  error,
  selectedStudents,
  onSelectStudent,
  onSelectAll,
  onViewStudent,
  embedded = false,
  streamlined = embedded,
}: FeesDataTableProps) => {
  if (loading) {
    return (
      <FeesDataTableSkeleton embedded={embedded} streamlined={streamlined} />
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-2xl bg-rose-50/80 md:rounded-xl md:border md:border-rose-200">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
            <Coins className="h-5 w-5 text-rose-500" />
          </div>
          <p className="mt-3 text-sm font-medium text-rose-700">
            Could not load data
          </p>
          <p className="mt-1 text-xs text-rose-500">{error}</p>
        </div>
      </div>
    );
  }

  const allSelected =
    selectedStudents.length === students.length && students.length > 0;

  return (
    <div
      className={cn(
        "min-w-0",
        embedded ? "" : FEES_MOBILE.card,
        "overflow-x-hidden md:border md:border-slate-200 md:bg-white",
      )}
    >
      {!embedded && (
        <div className="hidden items-center justify-between border-b border-slate-200 bg-slate-50/50 px-4 py-2 md:flex">
          <h3 className="text-sm font-semibold text-slate-900">
            Student balances
          </h3>
          <p className="text-xs tabular-nums text-slate-500">
            {students.length} student{students.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Mobile — contact-style list */}
      <div className={cn("md:hidden", !embedded && "px-0")}>
        {students.length > 0 && (
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-2.5">
            <Checkbox checked={allSelected} onCheckedChange={onSelectAll} />
            <span className="text-xs font-medium text-slate-500">
              Select all · {students.length}
            </span>
          </div>
        )}
        <ul className={cn(embedded ? "" : "")}>
          {students.map((student, i) => {
            const status = getStudentStatus(student);
            const selected = selectedStudents.includes(student.id);
            const { balance } = student.feeSummary;
            const arrears = Math.max(0, balance);
            return (
              <li
                key={student.id}
                className={cn(
                  i > 0 && "border-t border-slate-100",
                )}
              >
                <div className="flex items-stretch">
                  <div className="flex items-center pl-4">
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => onSelectStudent(student.id)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onViewStudent(student)}
                    className={cn(
                      FEES_MOBILE.listRow,
                      "min-h-[4.25rem] flex-1 flex-wrap pr-3",
                    )}
                  >
                    <span className="min-w-0 flex-1 basis-[55%] text-left">
                      <span
                        className={cn(
                          "block text-[15px] font-semibold text-slate-900",
                          FEES_LAYOUT.textWrap,
                        )}
                      >
                        {student.studentName}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {student.gradeLevelName}
                        <span className="text-slate-300"> · </span>
                        {student.admissionNumber}
                      </span>
                    </span>
                    <span className="ml-auto flex shrink-0 flex-col items-end gap-1">
                      <span
                        className={cn(
                          "text-sm font-bold tabular-nums",
                          balance > 0
                            ? "text-rose-600"
                            : balance < 0
                              ? "text-blue-600"
                              : "text-slate-400",
                        )}
                      >
                        {formatCurrency(balance)}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-5 border px-1.5 text-[10px] font-medium",
                          status.className,
                        )}
                      >
                        {status.label}
                      </Badge>
                      {arrears > 0 && !streamlined && (
                        <ArrearsAgingBadge
                          aging={student.feeSummary.aging}
                          hasArrears={arrears > 0}
                          compact
                          showAmount={false}
                        />
                      )}
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Desktop — table */}
      <div className={cn(FEES_LAYOUT.tableScroll, "hidden md:block")}>
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead className="text-xs font-medium text-slate-500">
                Student
              </TableHead>
              <TableHead className="text-xs font-medium text-slate-500">
                Class
              </TableHead>
              {streamlined ? (
                <TableHead className="text-right text-xs font-medium text-slate-500">
                  Balance
                </TableHead>
              ) : (
                <>
                  <TableHead className="text-xs font-medium text-slate-500">
                    Owed
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-500">
                    Paid
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-500">
                    Balance
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-500">
                    Aging
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-500">
                    Status
                  </TableHead>
                </>
              )}
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const status = getStudentStatus(student);
              const arrears = Math.max(0, student.feeSummary.balance);
              const worstAging =
                arrears > 0 && !streamlined ? (
                  <ArrearsAgingBadge
                    aging={student.feeSummary.aging}
                    hasArrears
                  />
                ) : null;

              return (
                <TableRow
                  key={student.id}
                  className="border-slate-100 hover:bg-slate-50 [&>td]:py-2"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => onSelectStudent(student.id)}
                    />
                  </TableCell>
                  <TableCell className={FEES_LAYOUT.textWrap}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {student.studentName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {student.admissionNumber}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {student.gradeLevelName}
                  </TableCell>
                  {streamlined ? (
                    <TableCell className="text-right">
                      <p
                        className={cn(
                          "text-sm font-bold tabular-nums",
                          student.feeSummary.balance > 0
                            ? "text-rose-600"
                            : student.feeSummary.balance < 0
                              ? "text-blue-600"
                              : "text-slate-400",
                        )}
                      >
                        {formatCurrency(student.feeSummary.balance)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        <span className="text-emerald-700">
                          {formatCurrency(student.feeSummary.totalPaid)}
                        </span>
                        {" paid · "}
                        <span className="text-slate-600">
                          {formatCurrency(student.feeSummary.totalOwed)} billed
                        </span>
                      </p>
                      {arrears > 0 ? (
                        <div className="mt-1 flex justify-end">
                          <ArrearsAgingBadge
                            aging={student.feeSummary.aging}
                            hasArrears
                            compact
                            showAmount={false}
                          />
                        </div>
                      ) : (
                        <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                          {status.label}
                        </p>
                      )}
                    </TableCell>
                  ) : (
                    <>
                      <TableCell className="text-sm tabular-nums text-slate-600">
                        {formatCurrency(student.feeSummary.totalOwed)}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums text-emerald-600">
                        {formatCurrency(student.feeSummary.totalPaid)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          student.feeSummary.balance > 0
                            ? "text-rose-600"
                            : student.feeSummary.balance < 0
                              ? "text-blue-600"
                              : "text-slate-400",
                        )}
                      >
                        {formatCurrency(student.feeSummary.balance)}
                      </TableCell>
                      <TableCell>
                        {worstAging ?? (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                            status.className,
                          )}
                        >
                          {status.label}
                        </span>
                      </TableCell>
                    </>
                  )}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewStudent(student)}
                      className="h-8 text-xs font-medium text-slate-500 hover:text-slate-700"
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {students.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Coins className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-500">
            No students with fee records
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Generate invoices to see student balances here
          </p>
        </div>
      )}
    </div>
  );
};
