import type { FeesSetupWizardResult } from "../components/FeesSetupWizardDialog";
import { DEFAULT_CATEGORY_PERCENT } from "./categorySplits";
import { roundToNearestTen } from "./feesAmounts";
import type { FeeWizardFormData } from "./feesWizardPdfForm";
import {
  buildDefaultFeePlanName,
  isLegacyAutoFeePlanName,
} from "./feePlanStats";

const STORAGE_KEY = "fees-setup-draft";

/** @deprecated Use DEFAULT_CATEGORY_PERCENT (0–100) or draft.categorySplits */
export const CATEGORY_SPLITS: Record<string, number> = Object.fromEntries(
  Object.entries(DEFAULT_CATEGORY_PERCENT).map(([k, v]) => [k, v / 100]),
);

export function loadFeesSetupDraft(): FeesSetupWizardResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FeesSetupWizardResult;
    if (!parsed.categorySplits && parsed.categories?.length) {
      parsed.categorySplits = Object.fromEntries(
        parsed.categories.map((c) => [
          c,
          DEFAULT_CATEGORY_PERCENT[c] ??
            Math.round(100 / parsed.categories.length),
        ]),
      );
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearFeesSetupDraft(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function saveFeesSetupDraft(draft: FeesSetupWizardResult): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

/** Push wizard line-item / term totals back into the shared setup draft */
export function syncWizardFormToSetupDraft(
  draft: FeesSetupWizardResult,
  form: Pick<
    FeeWizardFormData,
    "terms" | "termBucketAmounts" | "selectedGrades" | "previewGrade"
  >,
  options?: { categorySplits?: Record<string, number> },
): FeesSetupWizardResult {
  const grades = gradesWithFeesInDraft(draft);
  const gradeAmounts = { ...draft.gradeAmounts };
  const terms = form.terms ?? [];

  const termTotals = terms
    .map((term) => {
      const rows = form.termBucketAmounts?.[term.id];
      if (!rows) return 0;
      return Object.values(rows).reduce((sum, row) => sum + (row.amount || 0), 0);
    })
    .filter((t) => t > 0);

  if (termTotals.length > 0 && grades.length > 0) {
    const representative = roundToNearestTen(termTotals[0]);
    const configured = grades.filter((g) => (draft.gradeAmounts[g] ?? 0) > 0);
    const values = configured.map((g) => draft.gradeAmounts[g] ?? 0);
    const allSame =
      values.length <= 1 || new Set(values).size === 1;

    if (allSame) {
      for (const g of configured) {
        gradeAmounts[g] = representative;
      }
    } else {
      const primary =
        form.previewGrade ||
        form.selectedGrades?.[0] ||
        configured[0];
      if (primary) {
        gradeAmounts[primary] = representative;
      }
    }
  }

  return {
    ...draft,
    gradeAmounts,
    categorySplits:
      options?.categorySplits ?? draft.categorySplits,
  };
}

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Match setup category labels to tenant fee bucket names */
export function matchCategoryToBucket(
  category: string,
  buckets: Array<{ id: string; name: string }>,
): { id: string; name: string } | null {
  const cat = normalizeName(category);
  const aliases: Record<string, string[]> = {
    tuition: ["tuition", "tuitionfee", "academic"],
    lunch: ["lunch", "meal", "catering", "meals"],
    transport: ["transport", "transportation", "bus"],
    boarding: ["boarding", "boarder", "hostel"],
    activityfee: ["activity", "activities", "extracurricular"],
    examinationfee: ["exam", "examination", "exams"],
    medicalfee: ["medical", "health"],
    developmentfee: ["development", "devfund", "building"],
    uniform: ["uniform", "uniforms", "attire"],
    sports: ["sports", "games", "athletics"],
    schooltrip: ["trip", "tour", "excursion", "travel"],
    entertainment: ["entertainment", "fun", "social"],
    stationery: ["stationery", "books", "supplies"],
    ictcomputer: ["ict", "computer", "technology", "digital"],
    library: ["library", "books"],
    insurance: ["insurance", "cover"],
    ptacontribution: ["pta", "parents", "association"],
    graduation: ["graduation", "grad", "leaving"],
  };

  const keys = aliases[cat] ?? [cat];
  for (const bucket of buckets) {
    const bn = normalizeName(bucket.name);
    if (keys.some((k) => bn.includes(k) || k.includes(bn))) {
      return bucket;
    }
  }
  return null;
}

/** Which setup category a fee bucket belongs to */
export function categoryForBucket(
  bucket: { id: string; name: string },
  categories: string[],
): string | null {
  for (const cat of categories) {
    const match = matchCategoryToBucket(cat, [bucket]);
    if (match?.id === bucket.id) return cat;
  }
  const bn = normalizeName(bucket.name);
  for (const cat of categories) {
    if (normalizeName(cat) === bn) return cat;
  }
  return null;
}

type BucketAmountRow = {
  id: string;
  name: string;
  amount: number;
  isMandatory: boolean;
};

/** Split a term total across selected buckets using category % weights */
export function distributeTermTotalToBuckets(
  total: number,
  bucketIds: string[],
  bucketsInfo: Record<
    string,
    { id: string; name: string; isMandatory?: boolean }
  >,
  categories: string[],
  categorySplits?: Record<string, number>,
): Record<string, BucketAmountRow> {
  const roundedTotal = roundToNearestTen(Math.max(0, total));
  if (roundedTotal <= 0 || bucketIds.length === 0) return {};

  const bucketToCat: Record<string, string> = {};
  const catsUsed = new Set<string>();

  for (const bid of bucketIds) {
    const info = bucketsInfo[bid];
    if (!info) continue;
    const cat = categoryForBucket({ id: bid, name: info.name }, categories);
    if (cat) {
      bucketToCat[bid] = cat;
      catsUsed.add(cat);
    }
  }

  const catsList =
    categories.length > 0
      ? categories.filter((c) => catsUsed.has(c))
      : [];

  const result: Record<string, BucketAmountRow> = {};
  let amountsByBucket: Record<string, number> = {};

  if (catsList.length > 0) {
    const catAmounts = splitTotalAcrossCategories(
      roundedTotal,
      catsList,
      categorySplits,
    );
    const byCat: Record<string, string[]> = {};
    for (const bid of bucketIds) {
      const cat = bucketToCat[bid];
      if (!cat) continue;
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push(bid);
    }
    for (const cat of catsList) {
      const catTotal = catAmounts[cat] ?? 0;
      const peers = byCat[cat] ?? [];
      if (peers.length === 0) continue;
      let allocated = 0;
      peers.forEach((bid, i) => {
        const amt =
          i === peers.length - 1
            ? Math.max(0, roundToNearestTen(catTotal - allocated))
            : roundToNearestTen(catTotal / peers.length);
        amountsByBucket[bid] = amt;
        allocated += amt;
      });
    }
    const unmapped = bucketIds.filter((id) => !bucketToCat[id]);
    if (unmapped.length > 0) {
      const mappedSum = Object.values(amountsByBucket).reduce((a, b) => a + b, 0);
      const remainder = Math.max(0, roundedTotal - mappedSum);
      let uAlloc = 0;
      unmapped.forEach((bid, i) => {
        const amt =
          i === unmapped.length - 1
            ? Math.max(0, roundToNearestTen(remainder - uAlloc))
            : roundToNearestTen(remainder / unmapped.length);
        amountsByBucket[bid] = amt;
        uAlloc += amt;
      });
    }
  } else {
    let allocated = 0;
    bucketIds.forEach((bid, i) => {
      const amt =
        i === bucketIds.length - 1
          ? Math.max(0, roundToNearestTen(roundedTotal - allocated))
          : roundToNearestTen(roundedTotal / bucketIds.length);
      amountsByBucket[bid] = amt;
      allocated += amt;
    });
  }

  const sum = Object.values(amountsByBucket).reduce((a, b) => a + b, 0);
  if (sum !== roundedTotal && bucketIds.length > 0) {
    const lastId = bucketIds[bucketIds.length - 1];
    amountsByBucket[lastId] = Math.max(
      0,
      (amountsByBucket[lastId] ?? 0) + (roundedTotal - sum),
    );
  }

  for (const bid of bucketIds) {
    const info = bucketsInfo[bid];
    if (!info) continue;
    result[bid] = {
      id: bid,
      name: info.name,
      amount: amountsByBucket[bid] ?? 0,
      isMandatory: info.isMandatory ?? true,
    };
  }

  return result;
}

export function splitTotalAcrossCategories(
  total: number,
  categories: string[],
  categorySplits?: Record<string, number>,
): Record<string, number> {
  if (total <= 0 || categories.length === 0) return {};

  const roundedTotal = roundToNearestTen(total);
  const weights = categories.map((c) => {
    const pct = categorySplits?.[c];
    if (pct != null && pct > 0) return pct / 100;
    return (DEFAULT_CATEGORY_PERCENT[c] ?? 100 / categories.length) / 100;
  });
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const amounts: Record<string, number> = {};
  let allocated = 0;

  categories.forEach((cat, i) => {
    if (i === categories.length - 1) {
      amounts[cat] = Math.max(0, roundToNearestTen(roundedTotal - allocated));
    } else {
      const amt = roundToNearestTen((roundedTotal * weights[i]) / weightSum);
      amounts[cat] = amt;
      allocated += amt;
    }
  });

  const sum = Object.values(amounts).reduce((a, b) => a + b, 0);
  if (sum !== roundedTotal && categories.length > 0) {
    const last = categories[categories.length - 1];
    amounts[last] = Math.max(0, amounts[last] + (roundedTotal - sum));
  }

  return amounts;
}

/** Grades that have a positive term amount in the setup draft */
export function gradesWithFeesInDraft(
  draft: FeesSetupWizardResult,
): string[] {
  return Object.entries(draft.gradeAmounts)
    .filter(([, amt]) => amt > 0)
    .map(([g]) => g);
}

/** Term total for one grade, or the first configured grade, or the average */
export function getDraftTermTotal(
  draft: FeesSetupWizardResult,
  preferredGrade?: string,
): number {
  const configured = gradesWithFeesInDraft(draft);
  if (configured.length === 0) return 0;

  if (preferredGrade && (draft.gradeAmounts[preferredGrade] ?? 0) > 0) {
    return roundToNearestTen(draft.gradeAmounts[preferredGrade]);
  }
  if (configured.length === 1) {
    return roundToNearestTen(draft.gradeAmounts[configured[0]]);
  }
  return getRepresentativeTermTotal(draft);
}

export function getRepresentativeTermTotal(
  draft: FeesSetupWizardResult,
): number {
  const amounts = Object.values(draft.gradeAmounts).filter((a) => a > 0);
  if (amounts.length === 0) return 0;
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  return roundToNearestTen(avg);
}

type BucketAmount = {
  id: string;
  name: string;
  amount: number;
  isMandatory: boolean;
};

export function buildBucketPrefillFromDraft(
  draft: FeesSetupWizardResult,
  apiBuckets: Array<{ id: string; name: string }>,
  terms: Array<{ id: string; name: string }>,
  preferredGrade?: string,
): {
  selectedBuckets: string[];
  bucketAmounts: Record<string, BucketAmount>;
  termBucketAmounts: Record<string, Record<string, BucketAmount>>;
} {
  const total = getDraftTermTotal(draft, preferredGrade);
  const categoryAmounts = splitTotalAcrossCategories(
    total,
    draft.categories,
    draft.categorySplits,
  );

  const selectedBuckets: string[] = [];
  const bucketAmounts: Record<string, BucketAmount> = {};
  const termBucketAmounts: Record<string, Record<string, BucketAmount>> = {};

  for (const [category, amount] of Object.entries(categoryAmounts)) {
    const match = matchCategoryToBucket(category, apiBuckets);
    if (!match || amount <= 0) continue;

    if (!selectedBuckets.includes(match.id)) {
      selectedBuckets.push(match.id);
    }

    const entry: BucketAmount = {
      id: match.id,
      name: match.name,
      amount: roundToNearestTen(amount),
      isMandatory: category !== "Activity Fee",
    };
    bucketAmounts[match.id] = entry;

    for (const term of terms) {
      if (!termBucketAmounts[term.id]) termBucketAmounts[term.id] = {};
      termBucketAmounts[term.id][match.id] = { ...entry };
    }
  }

  return { selectedBuckets, bucketAmounts, termBucketAmounts };
}

export function applyDraftToWizardForm(
  draft: FeesSetupWizardResult,
  base: FeeWizardFormData,
): FeeWizardFormData {
  const gradesWithFees = gradesWithFeesInDraft(draft);
  const primaryGrade = gradesWithFees[0] ?? "";

  const hasBoarding = draft.categories.some((c) =>
    c.toLowerCase().includes("boarding"),
  );
  const boardingType = hasBoarding
    ? draft.categories.length === 1
      ? "boarding"
      : "both"
    : "day";

  const defaultName = buildDefaultFeePlanName({
    academicYearName: draft.academicYearName,
    boardingType: boardingType as "day" | "boarding" | "both",
    selectedGrades: gradesWithFees.length > 0 ? gradesWithFees : base.selectedGrades,
  });

  return {
    ...base,
    name: isLegacyAutoFeePlanName(base.name) ? defaultName : base.name || defaultName,
    academicYearId: draft.academicYearId || base.academicYearId,
    academicYear: draft.academicYearName || base.academicYear,
    selectedGrades: gradesWithFees.length > 0 ? gradesWithFees : base.selectedGrades,
    boardingType: boardingType as "day" | "boarding" | "both",
    previewGrade: primaryGrade || base.previewGrade,
    previewTermIds:
      base.previewTermIds?.length > 0
        ? base.previewTermIds
        : base.terms?.map((t) => t.id) ?? [],
  };
}
