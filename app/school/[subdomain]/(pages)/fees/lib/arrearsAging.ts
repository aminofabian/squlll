import { formatCurrency } from "../utils";

export type ArrearsAgingCategory =
  | "CURRENT"
  | "DAYS_30"
  | "DAYS_60"
  | "DAYS_90";

export interface AgingBucket {
  category: ArrearsAgingCategory | string;
  amount: number;
}

export const AGING_LABELS: Record<ArrearsAgingCategory, string> = {
  CURRENT: "Current",
  DAYS_30: "30+ days",
  DAYS_60: "60+ days",
  DAYS_90: "90+ days",
};

export const AGING_SHORT_LABELS: Record<ArrearsAgingCategory, string> = {
  CURRENT: "Current",
  DAYS_30: "30+",
  DAYS_60: "60+",
  DAYS_90: "90+",
};

export const AGING_BADGE_STYLES: Record<ArrearsAgingCategory, string> = {
  CURRENT: "bg-amber-50 text-amber-800 border-amber-200",
  DAYS_30: "bg-orange-50 text-orange-800 border-orange-200",
  DAYS_60: "bg-rose-50 text-rose-800 border-rose-200",
  DAYS_90: "bg-red-900 text-white border-red-950",
};

const SEVERITY_ORDER: ArrearsAgingCategory[] = [
  "DAYS_90",
  "DAYS_60",
  "DAYS_30",
  "CURRENT",
];

export function normalizeAgingCategory(
  category: string,
): ArrearsAgingCategory | null {
  if (
    category === "CURRENT" ||
    category === "DAYS_30" ||
    category === "DAYS_60" ||
    category === "DAYS_90"
  ) {
    return category;
  }
  return null;
}

export function getWorstAgingCategory(
  aging: AgingBucket[] | undefined,
  hasArrears: boolean,
): ArrearsAgingCategory | null {
  if (aging && aging.length > 0) {
    for (const category of SEVERITY_ORDER) {
      const bucket = aging.find((b) => b.category === category);
      if (bucket && bucket.amount > 0) {
        return category;
      }
    }
  }

  return hasArrears ? "CURRENT" : null;
}

export function getAgingBucketAmount(
  aging: AgingBucket[] | undefined,
  category: ArrearsAgingCategory,
): number {
  return aging?.find((b) => b.category === category)?.amount ?? 0;
}

export function getAgingBadgeLabel(
  category: ArrearsAgingCategory,
  amount?: number,
  compact = false,
): string {
  const label = compact ? AGING_SHORT_LABELS[category] : AGING_LABELS[category];
  if (amount != null && amount > 0) {
    return `${label} · ${formatCurrency(amount)}`;
  }
  return label;
}

export function getNonZeroAgingBuckets(
  aging: AgingBucket[] | undefined,
): Array<{ category: ArrearsAgingCategory; amount: number; label: string }> {
  if (!aging) return [];

  return SEVERITY_ORDER.map((category) => ({
    category,
    amount: getAgingBucketAmount(aging, category),
    label: AGING_LABELS[category],
  })).filter((bucket) => bucket.amount > 0);
}
