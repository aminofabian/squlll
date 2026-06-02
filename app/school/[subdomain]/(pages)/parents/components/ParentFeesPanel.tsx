"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { parentsPanel } from "./parents-ui";
import { useAdminChildFeeBalance } from "@/lib/hooks/useAdminChildFeeBalance";
import { Loader2, Wallet } from "lucide-react";

interface ParentFeesPanelProps {
  students: {
    id: string;
    name: string;
    grade: string;
    admissionNumber: string;
  }[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function StudentFeeSummary({
  student,
}: {
  student: ParentFeesPanelProps["students"][0];
}) {
  const { balance, loading, error } = useAdminChildFeeBalance(student.id);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-3 text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-800/30">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading fees for {student.name}…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50/50 px-3 py-3 text-xs text-red-600 dark:border-red-900/30 dark:bg-red-950/20">
        Could not load fees for {student.name}: {error}
      </div>
    );
  }

  if (!balance) return null;

  const hasBalance = balance.totalDue > 0;

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-3 dark:border-slate-800 dark:bg-slate-800/30">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
            {student.name}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {student.grade} · {student.admissionNumber}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] font-medium",
            hasBalance
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700",
          )}
        >
          {hasBalance ? "Balance due" : "Cleared"}
        </Badge>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div>
          <dt className="text-slate-400">Total due</dt>
          <dd className="font-medium text-slate-800 dark:text-slate-100">
            {formatCurrency(balance.totalDue)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Paid</dt>
          <dd className="font-medium text-slate-800 dark:text-slate-100">
            {formatCurrency(balance.totalPaid)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Fees owed</dt>
          <dd className="font-medium text-slate-800 dark:text-slate-100">
            {formatCurrency(balance.feesOwed)}
          </dd>
        </div>
      </dl>

      {balance.items.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="pb-1 pr-2 font-medium">Item</th>
                <th className="pb-1 pr-2 font-medium">Amount</th>
                <th className="pb-1 pr-2 font-medium">Paid</th>
                <th className="pb-1 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {balance.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-1 pr-2 text-slate-700 dark:text-slate-300">
                    {item.bucketName}
                    {item.itemName ? ` — ${item.itemName}` : ""}
                    {item.isMandatory ? (
                      <span className="ml-1 text-slate-400">(required)</span>
                    ) : null}
                  </td>
                  <td className="py-1 pr-2 tabular-nums">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="py-1 pr-2 tabular-nums">
                    {formatCurrency(item.amountPaid)}
                  </td>
                  <td
                    className={cn(
                      "py-1 tabular-nums font-medium",
                      item.balance > 0
                        ? "text-amber-700"
                        : "text-emerald-700",
                    )}
                  >
                    {formatCurrency(item.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

export function ParentFeesPanel({ students }: ParentFeesPanelProps) {
  const [expanded, setExpanded] = useState(true);

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

  return (
    <div className={`${parentsPanel} overflow-hidden`}>
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center gap-2 text-left"
        >
          <Wallet className="h-4 w-4 shrink-0 text-slate-400" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Fee balances
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Outstanding fees for linked children
            </p>
          </div>
        </button>
      </div>
      {expanded ? (
        <div className="space-y-3 p-4 sm:p-5">
          {students.map((student) => (
            <StudentFeeSummary key={student.id} student={student} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
