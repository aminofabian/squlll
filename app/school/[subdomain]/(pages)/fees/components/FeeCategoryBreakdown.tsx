"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  bucketShareOfTermPercent,
  isCoreFeeCategory,
  isPrimaryFeeCategory,
  sortBucketsByAmount,
} from "../lib/feeCategoryDisplay";
import { formatKes } from "../lib/feePlanStats";
import { FEES_BRAND } from "../lib/fees-ui";

export interface FeeBucketDisplay {
  id?: string;
  name: string;
  totalAmount: number;
  isOptional?: boolean;
}

interface FeeCategoryBreakdownProps {
  buckets: FeeBucketDisplay[];
  termTotal: number;
  className?: string;
}

function CategoryRow({
  bucket,
  termTotal,
  index,
}: {
  bucket: FeeBucketDisplay;
  termTotal: number;
  index: number;
}) {
  const sharePct = bucketShareOfTermPercent(bucket.totalAmount, termTotal);
  const isTuition = /tuition|school\s*fees?/i.test(bucket.name);

  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-slate-100/90 px-3 py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_6.5rem_1fr] sm:px-4 sm:py-3.5",
        index % 2 === 1 && "bg-slate-50/40",
        isTuition && "bg-[#e8f2ef]/35",
      )}
    >
      <div className="min-w-0 sm:col-span-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-900">{bucket.name}</span>
          {bucket.isOptional ? (
            <Badge
              variant="outline"
              className="h-4 border-amber-200/80 bg-amber-50/80 px-1.5 text-[9px] font-medium text-amber-800"
            >
              Optional
            </Badge>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs font-semibold tabular-nums text-slate-700 sm:hidden">
          {formatKes(bucket.totalAmount)}
        </p>
      </div>

      <p className="hidden text-right text-sm font-semibold tabular-nums text-slate-900 sm:block">
        {formatKes(bucket.totalAmount)}
      </p>

      <div className="col-span-2 flex items-center gap-2.5 sm:col-span-1">
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-200/70">
          <div
            className="h-full rounded-full transition-[width] duration-500 ease-out"
            style={{
              width: `${sharePct}%`,
              backgroundColor: isTuition ? FEES_BRAND.primary : "#94a3b8",
            }}
          />
        </div>
        <span className="w-8 shrink-0 text-right text-[11px] font-medium tabular-nums text-slate-500">
          {sharePct}%
        </span>
      </div>
    </div>
  );
}

function SectionBlock({
  title,
  buckets,
  termTotal,
}: {
  title: string;
  buckets: FeeBucketDisplay[];
  termTotal: number;
}) {
  const subtotal = buckets.reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3 px-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          {title}
        </p>
        <p
          className="text-sm font-semibold tabular-nums"
          style={{ color: FEES_BRAND.primaryDark }}
        >
          {formatKes(subtotal)}
        </p>
      </div>
      <div className="overflow-hidden rounded-xl ring-1 ring-slate-200/70">
        {buckets.map((bucket, idx) => (
          <CategoryRow
            key={bucket.id || bucket.name}
            bucket={bucket}
            termTotal={termTotal}
            index={idx}
          />
        ))}
      </div>
    </div>
  );
}

export function FeeCategoryBreakdown({
  buckets,
  termTotal,
  className,
}: FeeCategoryBreakdownProps) {
  const sorted = sortBucketsByAmount(buckets);

  if (sorted.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed px-6 py-10 text-center",
          className,
        )}
        style={{
          borderColor: `${FEES_BRAND.primary}33`,
          backgroundColor: `${FEES_BRAND.primaryLight}66`,
        }}
      >
        <p className="text-sm font-medium text-slate-700">No amounts for this term</p>
        <p className="mt-1 text-xs text-slate-500">
          Use Edit plan to add fee categories and amounts
        </p>
      </div>
    );
  }

  const core = sorted.filter((b) => isCoreFeeCategory(b.name));
  const additional = sorted.filter((b) => !isCoreFeeCategory(b.name));
  const showGrouped = core.length > 0 && additional.length > 0;
  const listedSum = sorted.reduce((sum, b) => sum + b.totalAmount, 0);
  const displayTotal = termTotal > 0 ? termTotal : listedSum;

  const primaryBucket = sorted.find((b) => isPrimaryFeeCategory(b.name));
  const primaryShare =
    primaryBucket && displayTotal > 0
      ? Math.round((primaryBucket.totalAmount / displayTotal) * 100)
      : null;

  return (
    <div className={cn("space-y-5", className)}>
      {primaryShare != null && primaryShare >= 50 ? (
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-700">{primaryBucket!.name}</span>{" "}
          is {primaryShare}% of this term&apos;s fees.
        </p>
      ) : null}
      {showGrouped ? (
        <>
          <SectionBlock title="Core fees" buckets={core} termTotal={displayTotal} />
          <SectionBlock
            title="Additional fees"
            buckets={additional}
            termTotal={displayTotal}
          />
        </>
      ) : (
        <div className="overflow-hidden rounded-xl ring-1 ring-slate-200/70">
          {sorted.map((bucket, idx) => (
            <CategoryRow
              key={bucket.id || bucket.name}
              bucket={bucket}
              termTotal={displayTotal}
              index={idx}
            />
          ))}
        </div>
      )}

      <div
        className="flex items-center justify-between gap-4 rounded-xl px-4 py-3.5 sm:px-5"
        style={{
          backgroundColor: FEES_BRAND.primaryLight,
          color: FEES_BRAND.primaryDark,
        }}
      >
        <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
          Term total
        </span>
        <span className="text-lg font-bold tabular-nums tracking-tight">
          {formatKes(displayTotal)}
        </span>
      </div>
    </div>
  );
}
