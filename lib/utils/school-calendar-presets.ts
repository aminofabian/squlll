import moeTermsData from "@/lib/data/ke-moe-terms-2026.json";

export type TermDraft = {
  name: string;
  startDate: string;
  endDate: string;
  active?: boolean;
  included?: boolean;
};

type MoeEntry = {
  name: string;
  type: string;
  openingDate: string;
  closingDate: string;
  duration?: string;
};

/** Suggested academic year label (e.g. 2026) — Kenyan schools often align with calendar year */
export function suggestAcademicYearName(referenceDate = new Date()): string {
  const month = referenceDate.getMonth();
  const year = referenceDate.getFullYear();
  // From September onward, many schools plan for the next calendar year
  return month >= 8 ? String(year + 1) : String(year);
}

/** Jan 1 – Dec 31 for the suggested year label */
export function suggestAcademicYearDates(yearLabel: string): {
  startDate: string;
  endDate: string;
} {
  const year = parseInt(yearLabel, 10) || new Date().getFullYear();
  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
  };
}

export function getMoeAcademicYearPreset(): {
  name: string;
  startDate: string;
  endDate: string;
  year: number;
} | null {
  const entries = (moeTermsData.entries || []) as MoeEntry[];
  if (entries.length === 0) return null;

  const earliestStart = entries.reduce(
    (min, e) => (e.openingDate < min ? e.openingDate : min),
    entries[0].openingDate,
  );
  const latestEnd = entries.reduce(
    (max, e) => (e.closingDate > max ? e.closingDate : max),
    entries[0].closingDate,
  );
  const year = moeTermsData.year || new Date().getFullYear();

  return {
    name: String(year),
    startDate: earliestStart,
    endDate: latestEnd,
    year,
  };
}

export function getMoeTermPresets(): TermDraft[] {
  return ((moeTermsData.entries || []) as MoeEntry[])
    .filter((e) => e.type === "term")
    .map((e) => ({
      name: e.name,
      startDate: e.openingDate,
      endDate: e.closingDate,
    }));
}

export const moeCalendarYear = moeTermsData.year || new Date().getFullYear();

/** Evenly split the academic year into N terms (user can edit before saving) */
export function suggestTermsForYear(
  startDate: string,
  endDate: string,
  count: number,
): TermDraft[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    count < 1
  ) {
    return [];
  }

  const totalDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const daysPerTerm = Math.floor(totalDays / count);
  const terms: TermDraft[] = [];

  for (let i = 0; i < count; i++) {
    const termStart = new Date(start);
    termStart.setDate(termStart.getDate() + daysPerTerm * i);

    const termEnd =
      i === count - 1
        ? new Date(end)
        : new Date(
            start.getTime() + daysPerTerm * (i + 1) * 24 * 60 * 60 * 1000 - 1,
          );

    terms.push({
      name:
        count === 2 ? (i === 0 ? "Semester 1" : "Semester 2") : `Term ${i + 1}`,
      startDate: toDateInput(termStart),
      endDate: toDateInput(termEnd),
      included: true,
      active: i === 0,
    });
  }

  return terms;
}

function toDateInput(d: Date): string {
  return d.toISOString().split("T")[0];
}

export const STREAM_NAME_SUGGESTIONS = [
  "A",
  "B",
  "East",
  "West",
  "North",
  "South",
  "Main",
];
