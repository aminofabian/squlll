import type { ProcessedFeeStructure } from "../components/FeeStructureManager/types";
import { feePlanYearTotalKes } from "./feePlanSlug";

export type FeePlansListStats = {
  totalPlans: number;
  activePlans: number;
  linkedPlans: number;
  unlinkedPlans: number;
};

export function computeFeePlansListStats(
  structures: ProcessedFeeStructure[],
  getLinkedClassCount: (id: string) => number,
): FeePlansListStats {
  let linkedPlans = 0;
  for (const s of structures) {
    if (getLinkedClassCount(s.structureId) > 0) linkedPlans++;
  }
  return {
    totalPlans: structures.length,
    activePlans: structures.filter((s) => s.isActive).length,
    linkedPlans,
    unlinkedPlans: structures.length - linkedPlans,
  };
}

/** Display academic year as YYYY-YYYY (e.g. 2026 → 2026-2027). */
export function formatAcademicYearDisplay(year: string): string {
  if (!year || year === "N/A") return year;
  const range = year.match(/(\d{4})\s*[-/]\s*(\d{4})/);
  if (range) return `${range[1]}-${range[2]}`;
  const single = year.match(/\b(\d{4})\b/);
  if (single) {
    const y = parseInt(single[1], 10);
    return `${y}-${y + 1}`;
  }
  return year;
}

const BOARDING_LABELS: Record<"day" | "boarding" | "both", string> = {
  day: "Day scholars",
  boarding: "Boarding",
  both: "Day & boarding",
};

/** Old auto-title pattern from guided setup — safe to replace when draft re-syncs */
export function isLegacyAutoFeePlanName(name: string): boolean {
  const t = name.trim();
  if (!t) return true;
  return / school fees$/i.test(t) || /^untitled plan$/i.test(t);
}

/**
 * Default fee plan title from year, grades, and student type.
 * e.g. "2027-2028 · All grades · Day & boarding" or "2027-2028 · Grade 5"
 */
export function buildDefaultFeePlanName(options: {
  academicYearName?: string;
  boardingType?: "day" | "boarding" | "both";
  selectedGrades?: string[];
}): string {
  const yearLabel = options.academicYearName
    ? formatAcademicYearDisplay(options.academicYearName)
    : null;

  const grades = (options.selectedGrades ?? []).filter((g) => g.trim());
  let scope: string | null = null;
  if (grades.length === 1) {
    scope = grades[0];
  } else if (grades.length >= 2 && grades.length <= 3) {
    scope = grades.join(", ");
  } else if (grades.length > 3) {
    scope = "All grades";
  }

  const studentType =
    options.boardingType === "boarding" || options.boardingType === "both"
      ? BOARDING_LABELS[options.boardingType]
      : null;

  const parts = [yearLabel, scope, studentType].filter(
    (p): p is string => Boolean(p),
  );
  if (parts.length === 0) return "Fee schedule";
  return parts.join(" · ");
}

/** Full amount — use in tables so users never see two conflicting figures. */
export function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

/** Compact label for tight spaces (badges, chips). */
export function formatKesCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `KES ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 10_000) {
    return `KES ${Math.round(amount / 1_000)}K`;
  }
  return formatKes(amount);
}
