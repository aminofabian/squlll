"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, ChevronDown, PenLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatKes } from "../lib/feePlanStats";
import { FEES_BRAND, FEES_BTN, FEES_LAYOUT, FEES_MOBILE } from "../lib/fees-ui";
import { isPrimaryFeeCategory } from "../lib/feeCategoryDisplay";
import {
  looksLikeUniformCategoryAmounts,
  termTotalsMatchRowSums,
} from "../lib/feeTermsMatrixInsights";
import type { FeeBucketDisplay } from "./FeeCategoryBreakdown";
import type { ProcessedFeeStructure } from "./FeeStructureManager/types";

type TermCol = { id: string; name: string };

function bucketKey(b: FeeBucketDisplay): string {
  return b.id || b.name;
}

function termTotalFromMap(
  termFeesMap: ProcessedFeeStructure["termFeesMap"],
  termId: string,
  fallback?: FeeBucketDisplay[],
): number {
  const buckets = termFeesMap?.[termId] ?? fallback ?? [];
  return buckets.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
}

function bucketsForTerm(
  termId: string,
  termFeesMap: ProcessedFeeStructure["termFeesMap"],
  fallback?: FeeBucketDisplay[],
): FeeBucketDisplay[] {
  if (termId === "__fallback") return fallback ?? [];
  const fromMap = termFeesMap?.[termId];
  return fromMap?.length ? fromMap : [];
}

interface FeeTermsMatrixTableProps {
  terms: TermCol[];
  termFeesMap?: ProcessedFeeStructure["termFeesMap"];
  fallbackBuckets?: FeeBucketDisplay[];
  yearTotal: number;
  /** All terms share the same amounts (show one-line note). */
  uniformAcrossTerms?: boolean;
  /** Opens the plan editor to change categories and amounts. */
  onEditPlan?: () => void;
  /** Tighter meta bar and row padding (plan detail). */
  compact?: boolean;
  /** Cap table height with internal scroll. */
  scrollable?: boolean;
  className?: string;
}

export function FeeTermsMatrixTable({
  terms,
  termFeesMap,
  fallbackBuckets,
  yearTotal,
  uniformAcrossTerms = false,
  onEditPlan,
  compact = false,
  scrollable = false,
  className,
}: FeeTermsMatrixTableProps) {
  const [showUniformHint, setShowUniformHint] = useState(false);
  const effectiveTerms = useMemo((): TermCol[] => {
    if (terms.length > 0) return terms;
    return [{ id: "__fallback", name: "Fees" }];
  }, [terms]);

  const rows = useMemo(() => {
    const meta = new Map<
      string,
      { name: string; isOptional?: boolean; amounts: Record<string, number> }
    >();

    for (const term of effectiveTerms) {
      const buckets =
        term.id === "__fallback"
          ? fallbackBuckets ?? []
          : bucketsForTerm(term.id, termFeesMap, fallbackBuckets);

      for (const b of buckets) {
        const key = bucketKey(b);
        const existing = meta.get(key) ?? {
          name: b.name,
          isOptional: b.isOptional,
          amounts: {},
        };
        existing.amounts[term.id] = b.totalAmount;
        if (b.isOptional) existing.isOptional = true;
        meta.set(key, existing);
      }
    }

    return [...meta.values()].sort((a, b) => {
      const sumA = Object.values(a.amounts).reduce((s, n) => s + n, 0);
      const sumB = Object.values(b.amounts).reduce((s, n) => s + n, 0);
      return sumB - sumA;
    });
  }, [effectiveTerms, termFeesMap, fallbackBuckets]);

  const termTotals = useMemo(
    () =>
      effectiveTerms.map((t) => ({
        ...t,
        total:
          t.id === "__fallback"
            ? (fallbackBuckets ?? []).reduce(
                (sum, b) => sum + (b.totalAmount || 0),
                0,
              )
            : termTotalFromMap(termFeesMap, t.id),
      })),
    [effectiveTerms, termFeesMap, fallbackBuckets],
  );

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "rounded-lg border border-dashed px-4 py-6 text-center text-sm",
          className,
        )}
        style={{
          borderColor: `${FEES_BRAND.primary}33`,
          backgroundColor: `${FEES_BRAND.primaryLight}55`,
        }}
      >
        <p className="font-medium text-slate-700">No fee amounts yet</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Use Edit structure to add categories per term
        </p>
      </div>
    );
  }

  const colCount = effectiveTerms.length;
  const multiTerm = colCount > 1;
  const termIds = effectiveTerms.map((t) => t.id);
  const optionalCount = rows.filter((r) => r.isOptional).length;
  const uniformCategories = looksLikeUniformCategoryAmounts(rows, termIds);
  const totalsVerified = termTotalsMatchRowSums(rows, termTotals);

  const matrixMeta = (
    <div className={cn(compact ? "mb-2 space-y-1.5" : "mb-2.5 space-y-2")}>
      <div
        className={cn(
          "flex flex-col gap-2 text-[11px] sm:flex-row sm:items-center sm:justify-between",
          compact
            ? "rounded-lg bg-slate-50/90 px-2.5 py-2"
            : "rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200/80",
        )}
      >
        <p className={cn("min-w-0 leading-snug text-slate-600", FEES_LAYOUT.textWrap)}>
          <span className="font-medium text-slate-800">
            {rows.length} categor{rows.length === 1 ? "y" : "ies"}
          </span>
          {optionalCount > 0 ? ` · ${optionalCount} optional` : null}
          {totalsVerified ? (
            <span className="text-emerald-700"> · totals verified</span>
          ) : null}
          {uniformAcrossTerms ? (
            <span className="text-slate-500"> · same every term</span>
          ) : null}
        </p>
        {onEditPlan ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={cn(
              FEES_BTN.secondary,
              "h-8 shrink-0 gap-1.5 text-xs",
              compact && "h-7",
            )}
            onClick={onEditPlan}
          >
            <PenLine className="h-3.5 w-3.5" />
            Edit amounts
          </Button>
        ) : null}
      </div>

      {uniformCategories && compact ? (
        <button
          type="button"
          className="flex w-full items-center gap-1.5 rounded-lg border border-amber-200/70 bg-amber-50/80 px-2.5 py-1.5 text-left text-[10px] font-medium text-amber-950"
          onClick={() => setShowUniformHint((v) => !v)}
        >
          <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden />
          Similar amounts across categories
          <ChevronDown
            className={cn(
              "ml-auto h-3 w-3 transition-transform",
              showUniformHint && "rotate-180",
            )}
          />
        </button>
      ) : null}
      {uniformCategories && (!compact || showUniformHint) ? (
        <p
          className={cn(
            "text-[10px] leading-snug text-amber-900/90",
            compact
              ? "rounded-lg border border-amber-200/60 bg-amber-50/60 px-2.5 py-1.5"
              : "flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-[11px] text-amber-950",
          )}
          role="status"
        >
          {!compact ? (
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          ) : null}
          <span className={FEES_LAYOUT.textWrap}>
            Many lines share the same amount — confirm tuition, transport, and
            other fees are correct via Edit amounts.
          </span>
        </p>
      ) : null}
    </div>
  );

  const tableScrollClass = scrollable
    ? "max-h-[min(22rem,52vh)] overflow-y-auto overscroll-contain"
    : "";

  const footerVerifyNote =
    multiTerm && totalsVerified ? (
      <p className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-emerald-700">
        <Check className="h-3 w-3 shrink-0" aria-hidden />
        Year total = sum of term totals
      </p>
    ) : null;

  return (
    <div className={cn("min-w-0", className)}>
      {matrixMeta}

      {/* Mobile — table inside a card (full width, no min-width scroll) */}
      <div
        className={cn(
          FEES_MOBILE.card,
          tableScrollClass,
          "max-w-full md:hidden",
        )}
      >
        <table className="w-full max-w-full table-fixed border-collapse text-left text-[11px]">
          <colgroup>
            <col style={{ width: colCount <= 2 ? "40%" : "34%" }} />
            {effectiveTerms.map((term) => (
              <col
                key={term.id}
                style={{
                  width: `${(colCount <= 2 ? 60 : 66) / colCount}%`,
                }}
              />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/95">
              <th
                scope="col"
                className={cn(
                  "px-2.5 py-2 align-bottom font-semibold text-slate-600",
                  FEES_LAYOUT.textWrap,
                )}
              >
                Category
              </th>
              {effectiveTerms.map((term) => {
                const total =
                  termTotals.find((t) => t.id === term.id)?.total ?? 0;
                const configured = total > 0;
                return (
                  <th
                    key={term.id}
                    scope="col"
                    className={cn(
                      "px-1.5 py-2 text-right align-bottom font-semibold",
                      configured ? "text-slate-700" : "text-amber-800",
                      FEES_LAYOUT.textWrap,
                    )}
                  >
                    <span className="block text-[9px] uppercase tracking-wide opacity-80">
                      {term.name}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-[10px] tabular-nums leading-tight",
                        configured ? "text-emerald-700" : "font-medium",
                      )}
                    >
                      {configured ? formatKes(total) : "—"}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isTuition = isPrimaryFeeCategory(row.name);
              return (
                <tr
                  key={row.name}
                  className={cn(
                    "border-b border-slate-100",
                    idx % 2 === 1 && "bg-slate-50/70",
                    isTuition && "bg-[#e8f2ef]/35",
                  )}
                >
                  <th
                    scope="row"
                    className={cn(
                      "px-2.5 py-2 font-medium text-slate-800",
                      FEES_LAYOUT.textWrap,
                      isTuition && "bg-[#e8f2ef]/50",
                    )}
                  >
                    <span className="flex flex-wrap items-center gap-1">
                      <span className="text-[12px] leading-snug">{row.name}</span>
                      {row.isOptional ? (
                        <Badge
                          variant="outline"
                          className="h-3.5 border-amber-200/80 bg-amber-50/80 px-1 text-[8px] font-medium text-amber-800"
                          title="Optional — not required on every student bill"
                        >
                          <span className="md:hidden">Opt</span>
                          <span className="hidden md:inline">Optional</span>
                        </Badge>
                      ) : null}
                    </span>
                  </th>
                  {effectiveTerms.map((term) => {
                    const amount = row.amounts[term.id];
                    const has = amount != null && amount > 0;
                    return (
                      <td
                        key={term.id}
                        className={cn(
                          "px-1.5 py-2 text-right align-top tabular-nums",
                          has
                            ? "text-[12px] font-semibold text-slate-900"
                            : "text-slate-300",
                        )}
                      >
                        {has ? formatKes(amount) : "—"}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr
              className="border-t border-slate-200"
              style={{ backgroundColor: FEES_BRAND.primaryLight }}
            >
              <th
                scope="row"
                className={cn(
                  "px-2.5 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-600",
                  FEES_LAYOUT.textWrap,
                )}
                style={{ backgroundColor: FEES_BRAND.primaryLight }}
              >
                Total
              </th>
              {termTotals.map((t) => (
                <td
                  key={t.id}
                  className="px-1.5 py-2 text-right text-[11px] font-bold tabular-nums"
                  style={{ color: FEES_BRAND.primaryDark }}
                >
                  {t.total > 0 ? formatKes(t.total) : "—"}
                </td>
              ))}
            </tr>
            {multiTerm ? (
              <tr className="bg-white">
                <td
                  colSpan={colCount + 1}
                  className={cn(
                    "px-2.5 py-2 text-right text-[11px] text-slate-600",
                    FEES_LAYOUT.textWrap,
                  )}
                >
                  <span className="font-medium text-slate-500">
                    School year total
                  </span>{" "}
                  <span className="font-bold tabular-nums text-slate-900">
                    {formatKes(yearTotal)}
                  </span>
                  {totalsVerified ? (
                    <span className="ml-1 text-emerald-700" title="Matches term columns">
                      ✓
                    </span>
                  ) : null}
                </td>
              </tr>
            ) : null}
          </tfoot>
        </table>
        {footerVerifyNote}
      </div>

      {/* Desktop — matrix table */}
      <div
        className={cn(
          FEES_LAYOUT.tableScroll,
          tableScrollClass,
          "hidden rounded-lg ring-1 ring-slate-200/80 md:block",
        )}
      >
        <table className="w-full table-fixed border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90">
              <th
                scope="col"
                className={cn(
                  "bg-slate-50/95 px-2.5 py-2 font-semibold text-slate-600",
                  FEES_LAYOUT.textWrap,
                  FEES_LAYOUT.textWrap,
                )}
              >
                Category
              </th>
              {effectiveTerms.map((term) => {
                const total = termTotals.find((t) => t.id === term.id)?.total ?? 0;
                const configured = total > 0;
                return (
                  <th
                    key={term.id}
                    scope="col"
                    className={cn(
                      "px-2 py-2 text-right font-semibold",
                      configured ? "text-slate-700" : "text-amber-800",
                    )}
                  >
                    <span className="block text-[10px] uppercase tracking-wide opacity-80">
                      {term.name}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-[11px] tabular-nums",
                        configured ? "text-emerald-700" : "font-medium",
                      )}
                    >
                      {configured ? formatKes(total) : "Not set"}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isTuition = isPrimaryFeeCategory(row.name);
              return (
                <tr
                  key={row.name}
                  className={cn(
                    "border-b border-slate-100 last:border-0",
                    idx % 2 === 1 && "bg-slate-50/50",
                    isTuition && "bg-[#e8f2ef]/30",
                  )}
                >
                  <th
                    scope="row"
                    className={cn(
                      "px-2.5 py-1.5 font-medium text-slate-800",
                      FEES_LAYOUT.textWrap,
                      idx % 2 === 1 ? "bg-slate-50/95" : "bg-white",
                      isTuition && "bg-[#e8f2ef]/50",
                    )}
                  >
                    <span className="flex flex-wrap items-center gap-1">
                      <span className={FEES_LAYOUT.textWrap}>{row.name}</span>
                      {row.isOptional ? (
                        <Badge
                          variant="outline"
                          className="h-3.5 border-amber-200/80 bg-amber-50/80 px-1 text-[8px] font-medium text-amber-800"
                          title="Optional — not required on every student bill"
                        >
                          <span className="md:hidden">Opt</span>
                          <span className="hidden md:inline">Optional</span>
                        </Badge>
                      ) : null}
                    </span>
                  </th>
                  {effectiveTerms.map((term) => {
                    const amount = row.amounts[term.id];
                    const has = amount != null && amount > 0;
                    return (
                      <td
                        key={term.id}
                        className={cn(
                          "px-2 py-1.5 text-right tabular-nums",
                          has
                            ? "font-semibold text-slate-900"
                            : "text-slate-300",
                        )}
                      >
                        {has ? formatKes(amount) : "—"}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr
              className="border-t border-slate-200 font-semibold"
              style={{ backgroundColor: FEES_BRAND.primaryLight }}
            >
              <th
                scope="row"
                className={cn(
                  "px-2.5 py-2 text-left text-[10px] uppercase tracking-wide text-slate-600",
                  FEES_LAYOUT.textWrap,
                )}
                style={{ backgroundColor: FEES_BRAND.primaryLight }}
              >
                Term total
              </th>
              {termTotals.map((t) => (
                <td
                  key={t.id}
                  className="px-2 py-2 text-right text-sm tabular-nums"
                  style={{ color: FEES_BRAND.primaryDark }}
                >
                  {t.total > 0 ? formatKes(t.total) : "—"}
                </td>
              ))}
            </tr>
            {colCount > 1 ? (
              <tr className="bg-white">
                <td
                  colSpan={colCount + 1}
                  className="px-2.5 py-1.5 text-right text-[10px] text-slate-600"
                >
                  <span className="font-medium text-slate-500">
                    School year total
                  </span>{" "}
                  <span className="font-semibold tabular-nums text-slate-800">
                    {formatKes(yearTotal)}
                  </span>
                  {totalsVerified ? (
                    <span className="ml-1 text-emerald-700">✓</span>
                  ) : null}
                </td>
              </tr>
            ) : null}
          </tfoot>
        </table>
        {footerVerifyNote}
      </div>
    </div>
  );
}
