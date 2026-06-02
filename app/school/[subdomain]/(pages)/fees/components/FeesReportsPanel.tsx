"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Download, Loader2 } from "lucide-react";

type ReportId =
  | "daily"
  | "outstanding"
  | "term"
  | "methods"
  | "waivers"
  | "audit";

const REPORTS: { id: ReportId; label: string; question: string }[] = [
  {
    id: "daily",
    label: "Daily collection",
    question: "What came in each day?",
  },
  {
    id: "outstanding",
    label: "Outstanding by grade",
    question: "Who owes what, by class?",
  },
  {
    id: "term",
    label: "Term collection",
    question: "Expected vs collected school-wide",
  },
  {
    id: "methods",
    label: "Payment methods",
    question: "Cash, bank, cheque, and other methods",
  },
  {
    id: "waivers",
    label: "Adjustments log",
    question: "Discounts and waivers recorded",
  },
  {
    id: "audit",
    label: "Activity log",
    question: "Recent fee changes on this device",
  },
];

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

interface FeesReportsPanelProps {
  students: StudentSummaryFromAPI[];
  auditEntries: FeeAuditEntry[];
  canExport: boolean;
  /** When true, omit outer card chrome (parent provides panel) */
  embedded?: boolean;
}

export const FeesReportsPanel = ({
  students,
  auditEntries,
  canExport,
  embedded = false,
}: FeesReportsPanelProps) => {
  const [active, setActive] = useState<ReportId>("outstanding");
  const [rangeDays, setRangeDays] = useState(30);
  const { payments, fetchPayments, isLoading, error } = usePaymentsQuery();

  useEffect(() => {
    fetchPayments({
      startDate: isoDaysAgo(rangeDays),
      endDate: new Date().toISOString().split("T")[0],
    });
  }, [rangeDays, fetchPayments]);

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

  const termTotals = useMemo(() => {
    let expected = 0;
    let collected = 0;
    let outstanding = 0;
    for (const s of students) {
      expected += s.feeSummary.totalOwed;
      collected += s.feeSummary.totalPaid;
      outstanding += s.feeSummary.balance;
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
      className={
        embedded
          ? "space-y-4"
          : "space-y-4 rounded-xl border border-slate-200 bg-white p-5"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {!embedded && (
            <h2 className="text-lg font-semibold text-slate-900">Reports</h2>
          )}
          <p
            className={
              embedded
                ? "text-sm text-slate-600"
                : "text-sm text-slate-600 mt-0.5"
            }
          >
            {activeMeta.question}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border border-slate-200 px-2 text-sm"
            value={rangeDays}
            onChange={(e) => setRangeDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          {canExport && (
            <Button variant="outline" size="sm" onClick={exportActive}>
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {REPORTS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setActive(r.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
              active === r.id
                ? "text-white border-transparent shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300",
            )}
            style={
              active === r.id
                ? { backgroundColor: "#246a59" }
                : undefined
            }
          >
            {r.label}
          </button>
        ))}
      </div>

      {isLoading && active !== "outstanding" && active !== "term" && (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-8 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading payment data…
        </div>
      )}

      {error && (
        <p className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {active === "daily" && (
        <ReportTable
          headers={["Date", "Payments", "Total (KES)"]}
          rows={byDay.map((r) => [
            r.date,
            String(r.count),
            r.total.toLocaleString(),
          ])}
          empty="No payments in this period."
        />
      )}

      {active === "outstanding" && (
        <ReportTable
          headers={["Grade", "Students", "Outstanding (KES)"]}
          rows={byGrade.map((r) => [
            r.grade,
            String(r.studentCount),
            r.outstanding.toLocaleString(),
          ])}
          empty="No student balance data."
        />
      )}

      {active === "term" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatBox label="Expected" value={`KES ${termTotals.expected.toLocaleString()}`} />
          <StatBox
            label="Collected"
            value={`KES ${termTotals.collected.toLocaleString()}`}
            accent="emerald"
          />
          <StatBox
            label="Outstanding"
            value={`KES ${termTotals.outstanding.toLocaleString()}`}
            accent="rose"
          />
          <p className="sm:col-span-3 text-xs text-slate-500">
            Collection rate: {termTotals.rate}% of expected fees (all students
            with fee assignments).
          </p>
          {credits.length > 0 && (
            <p className="sm:col-span-3 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              {credits.length} student{credits.length !== 1 ? "s have" : " has"}{" "}
              overpayment (credit balance). Review on the balances tab.
            </p>
          )}
        </div>
      )}

      {active === "methods" && (
        <ReportTable
          headers={["Method", "Count", "Total (KES)"]}
          rows={byMethod.map((r) => [
            formatMethodLabel(r.method),
            String(r.count),
            r.total.toLocaleString(),
          ])}
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

function StatBox({
  label,
  value,
  accent = "neutral",
}: {
  label: string;
  value: string;
  accent?: "neutral" | "emerald" | "rose";
}) {
  const styles = {
    neutral: "border-slate-200 bg-slate-50",
    emerald: "border-emerald-200 bg-emerald-50",
    rose: "border-rose-200 bg-rose-50",
  };
  return (
    <div className={cn("rounded-lg border p-4", styles[accent])}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

function ReportTable({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: string[][];
  empty: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-8 text-center border border-dashed border-slate-200 rounded-lg">
        {empty}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wide">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/80">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={cn(
                    "px-3 py-2.5 text-slate-700",
                    j > 0 && "tabular-nums text-right",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
