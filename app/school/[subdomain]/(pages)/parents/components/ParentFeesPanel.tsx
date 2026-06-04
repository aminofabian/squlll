"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { parentsPanel, parentsSectionLabel } from "./parents-ui";
import {
  useAdminChildFeeBalance,
  type AdminFeeBalance,
} from "@/lib/hooks/useAdminChildFeeBalance";
import { formatCurrency } from "@/lib/parent/parentFees";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
  Receipt,
  Wallet,
} from "lucide-react";

interface ParentFeesPanelProps {
  students: {
    id: string;
    name: string;
    grade: string;
    admissionNumber: string;
  }[];
}

type FeeLineItem = AdminFeeBalance["items"][number];

type GroupedFeeLine = {
  key: string;
  bucketName: string;
  itemName: string | null;
  amount: number;
  amountPaid: number;
  balance: number;
  isMandatory: boolean;
  lineCount: number;
};

function groupFeeLines(items: FeeLineItem[]): GroupedFeeLine[] {
  const map = new Map<string, GroupedFeeLine>();

  for (const item of items) {
    const key = item.itemName
      ? `${item.bucketName}::${item.itemName}`
      : item.bucketName;
    const existing = map.get(key);

    if (existing) {
      existing.amount += item.amount;
      existing.amountPaid += item.amountPaid;
      existing.balance += item.balance;
      existing.lineCount += 1;
      existing.isMandatory = existing.isMandatory || item.isMandatory;
    } else {
      map.set(key, {
        key,
        bucketName: item.bucketName,
        itemName: item.itemName,
        amount: item.amount,
        amountPaid: item.amountPaid,
        balance: item.balance,
        isMandatory: item.isMandatory,
        lineCount: 1,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.balance !== a.balance) return b.balance - a.balance;
    return a.bucketName.localeCompare(b.bucketName);
  });
}

function paymentProgress(totalBilled: number, totalPaid: number) {
  if (totalBilled <= 0) return 0;
  return Math.min(100, Math.round((totalPaid / totalBilled) * 100));
}

function FeeSummaryMetrics({ balance }: { balance: AdminFeeBalance }) {
  const totalBilled =
    balance.feesOwed > 0
      ? balance.feesOwed
      : balance.totalPaid + balance.totalDue;
  const progress = paymentProgress(totalBilled, balance.totalPaid);
  const hasOutstanding = balance.totalDue > 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <MetricTile
          label="Total billed"
          value={formatCurrency(totalBilled)}
          muted
        />
        <MetricTile
          label="Paid"
          value={formatCurrency(balance.totalPaid)}
          valueClassName="text-emerald-700 dark:text-emerald-400"
        />
        <MetricTile
          label="Outstanding"
          value={formatCurrency(balance.totalDue)}
          valueClassName={
            hasOutstanding
              ? "text-amber-700 dark:text-amber-400"
              : "text-emerald-700 dark:text-emerald-400"
          }
        />
      </div>

      {totalBilled > 0 ? (
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Payment progress</span>
            <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">
              {progress}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                hasOutstanding ? "bg-amber-500" : "bg-emerald-500",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MetricTile({
  label,
  value,
  valueClassName,
  muted,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-100 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/50",
        muted && "bg-slate-50/80 dark:bg-slate-900/30",
      )}
    >
      <p className={parentsSectionLabel}>{label}</p>
      <p
        className={cn(
          "mt-1 text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100",
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}

function FeeBreakdownTable({
  lines,
  variant,
}: {
  lines: GroupedFeeLine[];
  variant: "outstanding" | "cleared";
}) {
  if (lines.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
      <table className="w-full min-w-[420px] text-xs">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80 text-left dark:border-slate-800 dark:bg-slate-900/60">
            <th className="px-3 py-2 font-medium uppercase tracking-wide text-slate-400">
              Fee item
            </th>
            <th className="px-3 py-2 text-right font-medium uppercase tracking-wide text-slate-400">
              Billed
            </th>
            <th className="px-3 py-2 text-right font-medium uppercase tracking-wide text-slate-400">
              Paid
            </th>
            <th className="px-3 py-2 text-right font-medium uppercase tracking-wide text-slate-400">
              Balance
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {lines.map((line) => (
            <tr
              key={line.key}
              className={cn(
                variant === "outstanding" &&
                  line.balance > 0 &&
                  "bg-amber-50/20 dark:bg-amber-950/10",
              )}
            >
              <td className="px-3 py-2.5">
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  {line.itemName ?? line.bucketName}
                </p>
                {line.itemName ? (
                  <p className="text-[11px] text-slate-400">{line.bucketName}</p>
                ) : null}
                <div className="mt-1 flex flex-wrap gap-1">
                  {line.isMandatory ? (
                    <Badge
                      variant="outline"
                      className="h-4 border-slate-200 px-1 text-[9px] font-normal text-slate-500"
                    >
                      Required
                    </Badge>
                  ) : null}
                  {line.lineCount > 1 ? (
                    <Badge
                      variant="outline"
                      className="h-4 border-slate-200 px-1 text-[9px] font-normal text-slate-500"
                    >
                      {line.lineCount} charges
                    </Badge>
                  ) : null}
                </div>
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-400">
                {formatCurrency(line.amount)}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-400">
                {formatCurrency(line.amountPaid)}
              </td>
              <td
                className={cn(
                  "px-3 py-2.5 text-right tabular-nums font-medium",
                  line.balance > 0
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-emerald-700 dark:text-emerald-400",
                )}
              >
                {formatCurrency(line.balance)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CollapsibleFeeSection({
  title,
  count,
  defaultOpen,
  children,
}: {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <div className="rounded-lg border border-slate-100 dark:border-slate-800">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50/80 dark:text-slate-300 dark:hover:bg-slate-800/40"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        )}
        <span>{title}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] tabular-nums text-slate-500 dark:bg-slate-800">
          {count}
        </span>
      </button>
      {open ? <div className="border-t border-slate-100 p-2 dark:border-slate-800">{children}</div> : null}
    </div>
  );
}

function StudentFeeCard({
  student,
}: {
  student: ParentFeesPanelProps["students"][0];
}) {
  const { balance, loading, error, refetch } = useAdminChildFeeBalance(
    student.id,
  );
  const [showBreakdown, setShowBreakdown] = useState(false);

  const grouped = useMemo(
    () => (balance ? groupFeeLines(balance.items) : []),
    [balance],
  );

  const outstandingLines = useMemo(
    () => grouped.filter((line) => line.balance > 0),
    [grouped],
  );

  const clearedLines = useMemo(
    () => grouped.filter((line) => line.balance <= 0),
    [grouped],
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/30">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading fees for {student.name}…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50/60 px-4 py-4 dark:border-red-900/30 dark:bg-red-950/20">
        <p className="text-sm text-red-700 dark:text-red-300">
          Could not load fees for {student.name}.
        </p>
        <p className="mt-1 text-xs text-red-600/80">{error}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 h-7 text-xs"
          onClick={() => void refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!balance) return null;

  const hasOutstanding = balance.totalDue > 0;
  const hasLines = grouped.length > 0;

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800 sm:px-5">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {student.name}
          </h4>
          <p className="mt-0.5 text-xs text-slate-500">
            {student.grade} · {student.admissionNumber}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-medium",
              hasOutstanding
                ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"
                : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300",
            )}
          >
            {hasOutstanding ? "Balance due" : "Cleared"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-[11px]"
            asChild
          >
            <Link href="/fees">
              <Receipt className="h-3 w-3" />
              Fees desk
              <ExternalLink className="h-3 w-3 opacity-50" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <FeeSummaryMetrics balance={balance} />

        {hasLines ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowBreakdown((v) => !v)}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300 dark:hover:bg-slate-800/50"
            >
              <span className="flex items-center gap-1.5">
                {showBreakdown ? (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                )}
                Fee breakdown
                <span className="font-normal text-slate-400">
                  ({grouped.length} item{grouped.length !== 1 ? "s" : ""}
                  {balance.items.length > grouped.length
                    ? ` · ${balance.items.length} charges combined`
                    : ""}
                  )
                </span>
              </span>
              {outstandingLines.length > 0 ? (
                <span className="text-amber-700 dark:text-amber-400">
                  {outstandingLines.length} with balance
                </span>
              ) : null}
            </button>

            {showBreakdown ? (
              <div className="space-y-3">
                {outstandingLines.length > 0 ? (
                  <div>
                    <p className={cn(parentsSectionLabel, "mb-2 px-0.5")}>
                      Outstanding
                    </p>
                    <FeeBreakdownTable
                      lines={outstandingLines}
                      variant="outstanding"
                    />
                  </div>
                ) : null}

                {clearedLines.length > 0 ? (
                  <CollapsibleFeeSection
                    title="Paid in full"
                    count={clearedLines.length}
                    defaultOpen={outstandingLines.length === 0}
                  >
                    <FeeBreakdownTable lines={clearedLines} variant="cleared" />
                  </CollapsibleFeeSection>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-400 dark:border-slate-700">
            No fee line items yet. Assign a fee structure from the fees page.
          </p>
        )}
      </div>
    </article>
  );
}

export function ParentFeesPanel({ students }: ParentFeesPanelProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeStudent = students[selectedIndex] ?? students[0];

  if (students.length === 0) {
    return (
      <div className={`${parentsPanel} overflow-hidden`}>
        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <Wallet className="h-4 w-4 text-slate-400" />
            Fee balances
          </h3>
        </div>
        <p className="p-4 text-xs text-slate-400 sm:p-5">
          Link children to this parent to view fee balances.
        </p>
      </div>
    );
  }

  if (students.length === 1) {
    return (
      <div className="space-y-4">
        <StudentFeeCard student={students[0]} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          parentsPanel,
          "flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5",
        )}
      >
        <Wallet className="h-4 w-4 shrink-0 text-primary" />
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {students.length} children
          </span>{" "}
          — select to view fees
        </p>
        <div className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto">
          {students.map((student, index) => (
            <button
              key={student.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                selectedIndex === index
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700",
              )}
            >
              {student.name}
            </button>
          ))}
        </div>
      </div>

      <StudentFeeCard key={activeStudent.id} student={activeStudent} />
    </div>
  );
}
