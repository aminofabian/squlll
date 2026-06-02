"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  applyKenyaDefaultSplits,
  normalizeSplitsTo100,
  splitEvenlyAcrossCategories,
  splitsAreValid,
  splitsTotalPercent,
} from "../lib/categorySplits";
import { getCategoryColor } from "../lib/feeCategories";
import { roundToNearestTen } from "../lib/feesAmounts";
import { FEES_BRAND } from "../lib/fees-ui";

interface CategorySplitEditorProps {
  categories: string[];
  splits: Record<string, number>;
  onChange: (splits: Record<string, number>) => void;
  previewTotalKes?: number;
  className?: string;
  /** Tighter layout for setup wizard step 3 */
  compact?: boolean;
}

export function CategorySplitEditor({
  categories,
  splits,
  onChange,
  previewTotalKes,
  className,
  compact = false,
}: CategorySplitEditorProps) {
  const total = splitsTotalPercent(categories, splits);
  const valid = splitsAreValid(categories, splits);

  const updateOne = (cat: string, value: number) => {
    const next = { ...splits, [cat]: Math.min(100, Math.max(0, value)) };
    onChange(next);
  };

  const amountFor = (cat: string) => {
    if (!previewTotalKes || previewTotalKes <= 0) return null;
    const pct = splits[cat] ?? 0;
    return roundToNearestTen((previewTotalKes * pct) / 100);
  };

  const totalLabel =
    total % 1 === 0 ? total.toFixed(0) : total.toFixed(1);

  const splitBar =
    previewTotalKes != null && previewTotalKes > 0 ? (
      <div className="flex h-1.5 overflow-hidden rounded-full bg-slate-100">
        {categories.map((cat) => {
          const pct = splits[cat] ?? 0;
          if (pct <= 0) return null;
          return (
            <div
              key={cat}
              title={`${cat} ${pct}%`}
              className={cn("transition-all", getCategoryColor(cat))}
              style={{ width: `${pct}%` }}
            />
          );
        })}
      </div>
    ) : null;

  const presetButtons = (
    <div className="flex flex-wrap gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "border-slate-200 bg-white text-xs",
          compact ? "h-7 px-2" : "h-8",
        )}
        onClick={() => onChange(applyKenyaDefaultSplits(categories))}
      >
        Kenya defaults
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "border-slate-200 bg-white text-xs",
          compact ? "h-7 px-2" : "h-8",
        )}
        onClick={() => onChange(splitEvenlyAcrossCategories(categories))}
      >
        Split evenly
      </Button>
      {!valid && (
        <Button
          type="button"
          size="sm"
          className={cn(
            "text-xs text-white",
            compact ? "h-7 px-2" : "h-8",
          )}
          style={{ backgroundColor: FEES_BRAND.primary }}
          onClick={() => onChange(normalizeSplitsTo100(splits, categories))}
        >
          Balance to 100%
        </Button>
      )}
    </div>
  );

  if (compact) {
    return (
      <div className={cn("space-y-2.5", className)}>
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md border px-2.5 py-1.5 text-xs",
            valid
              ? "border-emerald-200/80 bg-emerald-50/80 text-emerald-900"
              : "border-amber-200/80 bg-amber-50/80 text-amber-900",
          )}
        >
          <span className="font-semibold tabular-nums">
            Total {totalLabel}%
            {valid ? (
              <span className="ml-1 font-normal text-emerald-700">· OK</span>
            ) : (
              <span className="ml-1 font-normal">· must equal 100%</span>
            )}
          </span>
          {previewTotalKes != null && previewTotalKes > 0 ? (
            <span className="tabular-nums text-slate-600">
              Preview KES {previewTotalKes.toLocaleString("en-KE")}/term
            </span>
          ) : null}
        </div>

        {splitBar}

        <div className="overflow-hidden rounded-md border border-slate-200/80">
          <div className="grid grid-cols-[1fr_3.5rem_4.5rem] gap-2 border-b border-slate-100 bg-slate-50/80 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <span>Category</span>
            <span className="text-right">%</span>
            {previewTotalKes != null && previewTotalKes > 0 ? (
              <span className="text-right">KES</span>
            ) : (
              <span />
            )}
          </div>
          <ul className="divide-y divide-slate-100">
            {categories.map((cat) => {
              const pct = splits[cat] ?? 0;
              const kes = amountFor(cat);
              return (
                <li
                  key={cat}
                  className="grid grid-cols-[1fr_3.5rem_4.5rem] items-center gap-2 px-2.5 py-1.5"
                >
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        getCategoryColor(cat),
                      )}
                    />
                    <span className="truncate text-xs font-medium text-slate-800">
                      {cat}
                    </span>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="h-7 w-full px-1.5 text-right text-xs tabular-nums"
                    value={pct === 0 ? "" : pct}
                    onChange={(e) =>
                      updateOne(cat, Number(e.target.value) || 0)
                    }
                  />
                  {previewTotalKes != null && previewTotalKes > 0 ? (
                    <span className="text-right text-[11px] tabular-nums text-slate-500">
                      {kes != null ? kes.toLocaleString("en-KE") : "—"}
                    </span>
                  ) : (
                    <span />
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {presetButtons}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {splitBar && (
        <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
          {categories.map((cat) => {
            const pct = splits[cat] ?? 0;
            if (pct <= 0) return null;
            return (
              <div
                key={cat}
                title={`${cat} ${pct}%`}
                className={cn("transition-all", getCategoryColor(cat))}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>
      )}

      <ul className="space-y-2">
        {categories.map((cat) => {
          const pct = splits[cat] ?? 0;
          const kes = amountFor(cat);
          return (
            <li
              key={cat}
              className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5"
            >
              <span
                className={cn(
                  "h-2.5 w-2.5 shrink-0 rounded-full",
                  getCategoryColor(cat),
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {cat}
                </p>
                {kes != null && (
                  <p className="text-xs tabular-nums text-slate-500">
                    KES {kes.toLocaleString("en-KE")}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  className="h-8 w-16 text-right text-sm tabular-nums"
                  value={pct === 0 ? "" : pct}
                  onChange={(e) =>
                    updateOne(cat, Number(e.target.value) || 0)
                  }
                />
                <span className="w-4 text-xs text-slate-500">%</span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className={cn(
            "text-sm font-medium tabular-nums",
            valid ? "text-emerald-700" : "text-amber-700",
          )}
        >
          Total: {totalLabel}%
          {!valid && (
            <span className="ml-1 font-normal text-amber-600">
              — must equal 100%
            </span>
          )}
        </div>
        {presetButtons}
      </div>
    </div>
  );
}
