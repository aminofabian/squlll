"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePaymentsQuery } from "../hooks/useGraphQLPayments";
import type { StudentSummaryFromAPI } from "../types";
import type { FeeAuditEntry } from "../hooks/useFeeAuditLog";
import {
  aggregateDailyCollections,
  aggregateOutstandingByGrade,
  aggregatePaymentMethods,
  filterAdjustmentsFromAudit,
  studentsWithCredit,
} from "../lib/feesReportAggregates";
import { downloadCsv } from "../lib/exportCsv";
import { FEES_BRAND, FEES_BTN, FEES_LAYOUT } from "../lib/fees-ui";
import { feesSectionHref } from "../lib/feesRoutes";
import { Download, FileStack, Loader2 } from "lucide-react";

type ReportId =
  | "daily"
  | "outstanding"
  | "term"
  | "methods"
  | "waivers"
  | "audit";

const REPORTS: { id: ReportId; label: string; short: string; question: string }[] =
  [
    {
      id: "outstanding",
      label: "Outstanding by grade",
      short: "Owing",
      question: "Balances due, grouped by class",
    },
    {
      id: "daily",
      label: "Daily collection",
      short: "Daily",
      question: "Payments received per day",
    },
    {
      id: "term",
      label: "Term collection",
      short: "Term",
      question: "Expected vs collected school-wide",
    },
    {
      id: "methods",
      label: "Payment methods",
      short: "Methods",
      question: "How parents paid in this period",
    },
    {
      id: "waivers",
      label: "Adjustments",
      short: "Adjust",
      question: "Discounts and waivers recorded",
    },
    {
      id: "audit",
      label: "Activity log",
      short: "Log",
      question: "Recent fee actions on this device",
    },
  ];

const PAYMENT_REPORTS: ReportId[] = ["daily", "methods"];

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

interface FeesReportsPanelProps {
  students: StudentSummaryFromAPI[];
  auditEntries: FeeAuditEntry[];
  canExport: boolean;
  onTermInvoices?: () => void;
  embedded?: boolean;
}

export const FeesReportsPanel = ({
  students,
  auditEntries,
  canExport,
  onTermInvoices,
  embedded = false,
}: FeesReportsPanelProps) => {
  const [active, setActive] = useState<ReportId>("outstanding");
  const [rangeDays, setRangeDays] = useState(30);
  const { payments, fetchPayments, isLoading, error } = usePaymentsQuery();

  const needsPaymentData = PAYMENT_REPORTS.includes(active);

  useEffect(() => {
    if (!needsPaymentData) return;
    fetchPayments({
      startDate: isoDaysAgo(rangeDays),
      endDate: new Date().toISOString().split("T")[0],
    });
  }, [rangeDays, fetchPayments, needsPaymentData]);

  const byGrade = useMemo(
    () => aggregateOutstandingByGrade(students),
    [students],
  );
  const byMethod = useMemo(() => aggregatePaymentMethods(payments), [payments]);
  const byDay = useMemo(() => aggregateDailyCollections(payments), [payments]);
  const adjustments = useMemo(
    () => filterAdjustmentsFromAudit(auditEntries),
    [auditEntries],
  );
  const credits = useMemo(() => studentsWithCredit(students), [students]);

  const outstandingTotals = useMemo(() => {
    let outstanding = 0;
    let studentsOwing = 0;
    for (const s of students) {
      const due = Math.max(0, s.feeSummary.balance);
      outstanding += due;
      if (due > 0) studentsOwing += 1;
    }
    return { outstanding, studentsOwing, grades: byGrade.length };
  }, [students, byGrade.length]);

  const periodCollectionTotal = useMemo(
    () => byDay.reduce((sum, r) => sum + r.total, 0),
    [byDay],
  );

  const termTotals = useMemo(() => {
    let expected = 0;
    let collected = 0;
    let outstanding = 0;
    for (const s of students) {
      expected += s.feeSummary.totalOwed;
      collected += s.feeSummary.totalPaid;
      outstanding += Math.max(0, s.feeSummary.balance);
    }
    const rate =
      expected > 0 ? Math.round((collected / expected) * 100) : 0;
    return { expected, collected, outstanding, rate };
  }, [students]);

  const exportActive = () => {
    if (!canExport) return;
    const date = new Date().toISOString().split("T")[0];

    if (active === "outstanding") {
      downloadCsv(`outstanding-by-grade-${date}.csv`, [
        ["Grade", "Students", "Expected", "Collected", "Outstanding"],
        ...byGrade.map((r) => [
          r.grade,
          String(r.studentCount),
          String(r.totalOwed),
          String(r.totalPaid),
          String(r.outstanding),
        ]),
      ]);
      return;
    }

    if (active === "daily" || active === "methods") {
      const rows =
        active === "daily"
          ? byDay.map((r) => [r.date, String(r.count), String(r.total)])
          : byMethod.map((r) => [r.method, String(r.count), String(r.total)]);
      downloadCsv(`${active}-${date}.csv`, [
        active === "daily"
          ? ["Date", "Payments", "Total KES"]
          : ["Method", "Count", "Total KES"],
        ...rows,
      ]);
    }
  };

  const activeMeta = REPORTS.find((r) => r.id === active)!;

  return (
    <div
      className={cn(
        FEES_LAYOUT.page,
        embedded ? "min-w-0" : "rounded-xl border border-slate-200 bg-white p-4 sm:p-5",
      )}
    >
      <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 pb-3 backdrop-blur-sm">
        <div
          className={cn(
            FEES_LAYOUT.chipStrip,
            "gap-1 rounded-lg bg-slate-100/80 p-1 max-w-full",
          )}
          role="tablist"
          aria-label="Report type"
        >
          {REPORTS.map((r) => {
            const isActive = active === r.id;
            return (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(r.id)}
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                <span className="hidden sm:inline">{r.label}</span>
                <span className="sm:hidden">{r.short}</span>
              </button>
            );
          })}
        </div>

        <div
          className={cn(
            FEES_LAYOUT.toolbarRow,
            "mt-2.5 gap-2",
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-900">
              {activeMeta.label}
            </p>
            <p className="text-xs text-slate-500">{activeMeta.question}</p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            {needsPaymentData ? (
              <select
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs"
                value={rangeDays}
                onChange={(e) => setRangeDays(Number(e.target.value))}
                aria-label="Date range"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            ) : null}
            {canExport ? (
              <Button
                variant="outline"
                size="sm"
                className={cn(FEES_BTN.secondary, "h-8 gap-1 text-xs")}
                onClick={exportActive}
                disabled={
                  active !== "outstanding" &&
                  active !== "daily" &&
                  active !== "methods"
                }
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            ) : null}
            {onTermInvoices ? (
              <Button
                variant="outline"
                size="sm"
                className={cn(FEES_BTN.secondary, "h-8 gap-1 text-xs")}
                onClick={onTermInvoices}
              >
                <FileStack className="h-3.5 w-3.5" />
                <span className="hidden min-[420px]:inline">Term invoices</span>
                <span className="min-[420px]:hidden">Invoice</span>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {isLoading && needsPaymentData && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading payments…
          </div>
        )}

        {error ? (
          <p className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        {active === "outstanding" && (
          <>
            <ReportHero
              label="Total outstanding"
              value={
                outstandingTotals.outstanding > 0
                  ? formatKes(outstandingTotals.outstanding)
                  : "All clear"
              }
              tone={
                outstandingTotals.outstanding > 0 ? "rose" : "emerald"
              }
              detail={`${outstandingTotals.studentsOwing} student${outstandingTotals.studentsOwing === 1 ? "" : "s"} · ${outstandingTotals.grades} grade${outstandingTotals.grades === 1 ? "" : "s"}`}
            />
            <ReportTable
              headers={["Grade", "Students", "Collected", "Outstanding"]}
              rows={byGrade.map((r) => [
                r.grade,
                String(r.studentCount),
                r.totalPaid.toLocaleString("en-KE"),
                Math.max(0, r.outstanding).toLocaleString("en-KE"),
              ])}
              numericFrom={2}
              footer={
                byGrade.length > 0
                  ? [
                      "Total",
                      String(
                        byGrade.reduce((n, r) => n + r.studentCount, 0),
                      ),
                      byGrade
                        .reduce((n, r) => n + r.totalPaid, 0)
                        .toLocaleString("en-KE"),
                      byGrade
                        .reduce((n, r) => n + Math.max(0, r.outstanding), 0)
                        .toLocaleString("en-KE"),
                    ]
                  : undefined
              }
              empty="No student balance data."
              footerAction={
                <Link
                  href={feesSectionHref("balances")}
                  scroll={false}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: FEES_BRAND.primary }}
                >
                  Open Balances →
                </Link>
              }
            />
          </>
        )}

        {active === "daily" && !isLoading && (
          <>
            <ReportHero
              label={`Collected · last ${rangeDays} days`}
              value={formatKes(periodCollectionTotal)}
              tone="emerald"
              detail={`${byDay.reduce((n, r) => n + r.count, 0)} payments`}
            />
            <ReportTable
              headers={["Date", "Payments", "Total (KES)"]}
              rows={byDay.map((r) => [
                r.date,
                String(r.count),
                r.total.toLocaleString("en-KE"),
              ])}
              numericFrom={1}
              empty="No payments in this period."
            />
          </>
        )}

        {active === "term" && (
          <div className="space-y-3">
            <ReportHero
              label="Collection rate"
              value={`${termTotals.rate}%`}
              tone={termTotals.rate >= 50 ? "emerald" : "amber"}
              detail={`${formatKes(termTotals.collected)} of ${formatKes(termTotals.expected)} expected`}
            />
            <div className="grid grid-cols-3 gap-2">
              <MiniStat label="Expected" value={formatKes(termTotals.expected)} />
              <MiniStat
                label="Collected"
                value={formatKes(termTotals.collected)}
                tone="emerald"
              />
              <MiniStat
                label="Due"
                value={formatKes(termTotals.outstanding)}
                tone="rose"
              />
            </div>
            {credits.length > 0 ? (
              <p className="rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2 text-xs text-sky-900">
                {credits.length} student
                {credits.length === 1 ? " has" : "s have"} credit balances — see{" "}
                <Link
                  href={feesSectionHref("balances")}
                  scroll={false}
                  className="font-semibold underline"
                >
                  Balances
                </Link>
                .
              </p>
            ) : null}
          </div>
        )}

        {active === "methods" && !isLoading && (
          <ReportTable
            headers={["Method", "Count", "Total (KES)"]}
            rows={byMethod.map((r) => [
              formatMethodLabel(r.method),
              String(r.count),
              r.total.toLocaleString("en-KE"),
            ])}
            numericFrom={1}
            empty="No payments in this period."
          />
        )}

        {active === "waivers" && (
          <ReportTable
            headers={["When", "Summary", "By"]}
            rows={adjustments.map((e) => [
              new Date(e.createdAt).toLocaleString(),
              e.summary,
              e.actor || "—",
            ])}
            empty="No adjustments logged yet. Use Adjustments on a student profile."
          />
        )}

        {active === "audit" && (
          <ReportTable
            headers={["When", "Action", "Summary", "By"]}
            rows={auditEntries.slice(0, 100).map((e) => [
              new Date(e.createdAt).toLocaleString(),
              e.action.replace(/_/g, " "),
              e.summary,
              e.actor || "—",
            ])}
            empty="No activity logged on this browser yet."
          />
        )}
      </div>
    </div>
  );
};

function formatMethodLabel(method: string): string {
  const m = method.toUpperCase();
  if (m === "MPESA") return "M-Pesa";
  if (m === "CASH") return "Cash";
  if (m === "BANK") return "Bank transfer";
  if (m === "CHEQUE") return "Cheque";
  return method;
}

function ReportHero({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "neutral" | "emerald" | "rose" | "amber";
}) {
  const valueTone = {
    neutral: "text-slate-900",
    emerald: "text-emerald-800",
    rose: "text-rose-800",
    amber: "text-amber-900",
  }[tone];

  return (
    <div className="rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-50/80 to-white px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p
        className={cn(
          "text-xl font-bold tabular-nums tracking-tight sm:text-2xl",
          valueTone,
        )}
      >
        {value}
      </p>
      {detail ? (
        <p className="mt-0.5 text-xs text-slate-600">{detail}</p>
      ) : null}
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "emerald" | "rose";
}) {
  const valueClass = {
    neutral: "text-slate-900",
    emerald: "text-emerald-800",
    rose: "text-rose-800",
  }[tone];

  return (
    <div className="rounded-lg border border-slate-200/80 bg-white px-2.5 py-2 text-center">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={cn("text-xs font-bold tabular-nums", valueClass)}>{value}</p>
    </div>
  );
}

function ReportTable({
  headers,
  rows,
  empty,
  numericFrom = 1,
  footer,
  footerAction,
}: {
  headers: string[];
  rows: string[][];
  empty: string;
  numericFrom?: number;
  footer?: string[];
  footerAction?: ReactNode;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
        {empty}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className={FEES_LAYOUT.tableContained}>
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/90 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {headers.map((h) => (
                <th
                  key={h}
                  className={cn(
                    "px-3 py-2",
                    h !== headers[0] && "text-right",
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/60">
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={cn(
                      "px-3 py-2 text-slate-800",
                      FEES_LAYOUT.textWrap,
                      j === 0 && "font-medium",
                      j >= numericFrom && "text-right tabular-nums",
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {footer ? (
            <tfoot>
              <tr
                className="border-t border-slate-200 font-semibold"
                style={{ backgroundColor: FEES_BRAND.primaryLight }}
              >
                {footer.map((cell, j) => (
                  <td
                    key={j}
                    className={cn(
                      "px-3 py-2 text-slate-900",
                      j >= numericFrom && "text-right tabular-nums",
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
      {footerAction ? (
        <div className="flex justify-end px-0.5">{footerAction}</div>
      ) : null}
    </div>
  );
}
