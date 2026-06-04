"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StudentDetailSummary } from "@/types/student";
import { useCurrentAcademicYear } from "@/lib/hooks/useAcademicYears";
import { useStudentLedger } from "@/lib/hooks/use-student-ledger";
import { StudentLedger } from "./StudentLedger";
import { studentsPanel } from "./students-ui";
import { cn } from "@/lib/utils";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface StudentProfileMoneyTabProps {
  student: StudentDetailSummary;
  studentId: string;
}

export function StudentProfileMoneyTab({
  student,
  studentId,
}: StudentProfileMoneyTabProps) {
  const { getActiveAcademicYear } = useCurrentAcademicYear();
  const activeYear = getActiveAcademicYear();

  const dateRange = useMemo(() => {
    if (activeYear?.startDate && activeYear?.endDate) {
      return {
        startDate: activeYear.startDate.slice(0, 10),
        endDate: activeYear.endDate.slice(0, 10),
      };
    }
    const year = new Date().getFullYear();
    return {
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
    };
  }, [activeYear]);

  const {
    ledgerData,
    loading: ledgerLoading,
    error: ledgerError,
  } = useStudentLedger({ studentId, dateRange });

  const balance = Math.max(0, student.feeSummary.balance);

  return (
    <div className="space-y-4">
      <div className={studentsPanel}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <Wallet className="h-4 w-4 text-slate-400" />
            Fee summary
          </h3>
          {balance > 0 ? (
            <Button
              type="button"
              size="sm"
              className="h-8 bg-[#0073ea] text-xs hover:bg-[#0062c4]"
              asChild
            >
              <Link href="/fees?section=balances">Record payment</Link>
            </Button>
          ) : null}
        </div>
        <div className="space-y-4 p-4 sm:p-5">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-slate-50/80 px-3 py-2.5 dark:bg-slate-800/30">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Total owed
              </dt>
              <dd className="mt-1 text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                {formatCurrency(student.feeSummary.totalOwed)}
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50/80 px-3 py-2.5 dark:bg-slate-800/30">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Paid
              </dt>
              <dd className="mt-1 text-sm font-semibold tabular-nums text-emerald-700">
                {formatCurrency(student.feeSummary.totalPaid)}
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50/80 px-3 py-2.5 dark:bg-slate-800/30">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Balance
              </dt>
              <dd
                className={cn(
                  "mt-1 text-sm font-semibold tabular-nums",
                  balance > 0 ? "text-amber-700" : "text-emerald-700",
                )}
              >
                {formatCurrency(balance)}
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50/80 px-3 py-2.5 dark:bg-slate-800/30">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Fee items
              </dt>
              <dd className="mt-1 text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                {student.feeSummary.numberOfFeeItems}
              </dd>
            </div>
          </dl>

          {student.feeSummary.feeItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-slate-400 dark:border-slate-800">
                    <th className="pb-2 pr-3 font-medium">Item</th>
                    <th className="pb-2 pr-3 font-medium">Amount</th>
                    <th className="pb-2 pr-3 font-medium">Type</th>
                    <th className="pb-2 font-medium">Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {student.feeSummary.feeItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 pr-3 text-slate-700 dark:text-slate-300">
                        {item.feeBucketName}
                      </td>
                      <td className="py-2 pr-3 tabular-nums">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-2 pr-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-normal",
                            item.isMandatory
                              ? "border-slate-200 text-slate-600"
                              : "border-sky-200 text-sky-700",
                          )}
                        >
                          {item.isMandatory ? "Mandatory" : "Optional"}
                        </Badge>
                      </td>
                      <td className="py-2 text-slate-500">
                        {item.academicYearName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-slate-400">
              No fee items assigned for this student&apos;s grade yet.
            </p>
          )}
        </div>
      </div>

      <div className={studentsPanel}>
        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Ledger
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            {activeYear
              ? `${activeYear.name} · ${dateRange.startDate} to ${dateRange.endDate}`
              : "Current calendar year"}
          </p>
        </div>
        <div className="p-4 sm:p-5">
          <StudentLedger
            ledgerData={ledgerData}
            loading={ledgerLoading}
            error={ledgerError}
          />
        </div>
      </div>
    </div>
  );
}
