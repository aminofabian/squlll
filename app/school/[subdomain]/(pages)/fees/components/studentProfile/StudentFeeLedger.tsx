"use client";

import { BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEES_BRAND } from "../../lib/fees-ui";

type FeeItemRow = {
  id: string;
  feeBucketName: string;
  amount: number;
  isMandatory: boolean;
  feeStructureName?: string;
  academicYearName?: string;
};

function formatKes(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

function groupKey(item: FeeItemRow) {
  return (
    [item.feeStructureName, item.academicYearName].filter(Boolean).join(" · ") ||
    "General fees"
  );
}

const GROUP_COLORS = [
  FEES_BRAND.primary,
  "#2d7a66",
  "#1e5c8a",
  "#7c5c2e",
  "#5c3d6e",
];

export function StudentFeeLedger({ items }: { items: FeeItemRow[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <BookOpen className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-700">No line items yet</p>
        <p className="mt-1 max-w-[14rem] text-xs text-slate-500">
          Fees appear here once a structure is linked and invoiced.
        </p>
      </div>
    );
  }

  const grouped = items.reduce<Record<string, FeeItemRow[]>>((acc, item) => {
    const key = groupKey(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const grandTotal = items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles
          className="h-4 w-4"
          style={{ color: FEES_BRAND.primary }}
          aria-hidden
        />
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Fee ledger
        </p>
        <span className="ml-auto text-[11px] tabular-nums text-slate-500">
          {items.length} lines
        </span>
      </div>

      {Object.entries(grouped).map(([label, groupItems], groupIndex) => {
        const subtotal = groupItems.reduce((s, i) => s + i.amount, 0);
        const accent = GROUP_COLORS[groupIndex % GROUP_COLORS.length];

        return (
          <article
            key={label}
            className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_14px_-4px_rgba(15,23,42,0.08)]"
          >
            <div
              className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5"
              style={{
                background: `linear-gradient(90deg, ${accent}12 0%, transparent 70%)`,
              }}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: accent }}
                aria-hidden
              />
              <h3 className="min-w-0 flex-1 truncate text-xs font-bold text-slate-800">
                {label}
              </h3>
              <span className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-600">
                {formatKes(subtotal)}
              </span>
            </div>

            <ul className="divide-y divide-slate-100/90 px-1 py-1">
              {groupItems.map((item) => (
                <li key={item.id}>
                  <LedgerLine
                    name={item.feeBucketName}
                    amount={item.amount}
                    optional={!item.isMandatory}
                  />
                </li>
              ))}
            </ul>
          </article>
        );
      })}

      <div
        className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm"
        style={{
          background: `linear-gradient(135deg, ${FEES_BRAND.primaryLight} 0%, #fff 100%)`,
          border: `1px solid ${FEES_BRAND.primaryMuted}`,
        }}
      >
        <span className="font-medium text-slate-700">Assessed total</span>
        <span className="font-bold tabular-nums text-slate-900">
          {formatKes(grandTotal)}
        </span>
      </div>
    </div>
  );
}

function LedgerLine({
  name,
  amount,
  optional,
}: {
  name: string;
  amount: number;
  optional: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2 px-2 py-2.5">
      <span className="min-w-0 shrink text-sm font-medium text-slate-800">
        {name}
        {optional ? (
          <span className="ml-1.5 text-[10px] font-normal text-slate-400">
            optional
          </span>
        ) : null}
      </span>
      <span
        className="min-w-[1rem] flex-1 border-b border-dotted border-slate-300/90"
        aria-hidden
      />
      <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
        {formatKes(amount)}
      </span>
    </div>
  );
}

export function StudentFeeReceipt({
  items,
  balance,
  studentName,
  admissionNumber,
  classLabel,
}: {
  items: FeeItemRow[];
  balance: number;
  studentName: string;
  admissionNumber: string;
  classLabel: string;
}) {
  return (
    <div className="mx-auto max-w-sm">
      <div
        className={cn(
          "relative overflow-hidden rounded-t-2xl border border-b-0 border-slate-200 bg-[#fafaf9] px-5 py-6",
          "before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-transparent before:via-slate-300 before:to-transparent",
        )}
      >
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Fee statement
        </p>
        <p className="mt-3 text-center text-base font-bold text-slate-900">
          {studentName}
        </p>
        <p className="text-center text-xs text-slate-500">
          {admissionNumber}
          {classLabel ? ` · ${classLabel}` : ""}
        </p>
        <p className="mt-4 text-center text-[10px] text-slate-400">
          {new Date().toLocaleDateString("en-KE", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>

        <div className="mt-5 space-y-0 border-t border-dashed border-slate-300 pt-4">
          {items.map((item) => (
            <LedgerLine
              key={item.id}
              name={item.feeBucketName}
              amount={item.amount}
              optional={!item.isMandatory}
            />
          ))}
        </div>

        <div className="mt-4 flex items-baseline justify-between border-t-2 border-slate-800 pt-3">
          <span className="text-sm font-bold uppercase tracking-wide text-slate-900">
            Balance due
          </span>
          <span className="text-lg font-bold tabular-nums text-rose-700">
            {formatKes(balance)}
          </span>
        </div>
      </div>
      <div
        className="h-3 rounded-b-2xl border border-t-0 border-slate-200 bg-slate-100"
        style={{
          backgroundImage:
            "radial-gradient(circle at 8px 0, transparent 6px, #f1f5f9 6px)",
          backgroundSize: "16px 12px",
          backgroundPosition: "bottom",
        }}
        aria-hidden
      />
    </div>
  );
}
