/** Default share of total fees per category (0–100), Kenya-oriented presets */
export const DEFAULT_CATEGORY_PERCENT: Record<string, number> = {
  Tuition: 55,
  Lunch: 12,
  Transport: 15,
  Boarding: 10,
  "Activity Fee": 4,
  "Examination Fee": 2,
  "Medical Fee": 1,
  "Development Fee": 1,
  Uniform: 3,
  Sports: 2,
  "School Trip": 2,
  Entertainment: 1,
  Stationery: 2,
  "ICT & Computer": 2,
  Library: 1,
  Insurance: 1,
  "PTA Contribution": 1,
  Graduation: 1,
};

export function initSplitsForCategories(
  categories: string[],
  existing?: Record<string, number>,
): Record<string, number> {
  if (categories.length === 0) return {};

  const raw: Record<string, number> = {};
  for (const cat of categories) {
    const prior = existing?.[cat];
    raw[cat] =
      prior != null && prior > 0
        ? prior
        : (DEFAULT_CATEGORY_PERCENT[cat] ?? 0);
  }

  return normalizeSplitsTo100(raw, categories);
}

export function splitsTotalPercent(
  categories: string[],
  splits: Record<string, number>,
): number {
  return categories.reduce((sum, c) => sum + (splits[c] ?? 0), 0);
}

export function splitsAreValid(
  categories: string[],
  splits: Record<string, number>,
  tolerance = 0.5,
): boolean {
  if (categories.length === 0) return false;
  return Math.abs(splitsTotalPercent(categories, splits) - 100) <= tolerance;
}

/** Scale selected categories so they sum to 100% */
export function normalizeSplitsTo100(
  splits: Record<string, number>,
  categories: string[],
): Record<string, number> {
  if (categories.length === 0) return {};

  const sum = splitsTotalPercent(categories, splits);
  if (sum <= 0) {
    const even = Math.floor(100 / categories.length);
    const out: Record<string, number> = {};
    let allocated = 0;
    categories.forEach((c, i) => {
      if (i === categories.length - 1) {
        out[c] = 100 - allocated;
      } else {
        out[c] = even;
        allocated += even;
      }
    });
    return out;
  }

  const out: Record<string, number> = {};
  let allocated = 0;
  categories.forEach((c, i) => {
    if (i === categories.length - 1) {
      out[c] = Math.max(0, 100 - allocated);
    } else {
      const pct = Math.round(((splits[c] ?? 0) * 100) / sum);
      out[c] = pct;
      allocated += pct;
    }
  });
  return out;
}

export function splitEvenlyAcrossCategories(
  categories: string[],
): Record<string, number> {
  return normalizeSplitsTo100(
    Object.fromEntries(categories.map((c) => [c, 1])),
    categories,
  );
}

export function applyKenyaDefaultSplits(
  categories: string[],
): Record<string, number> {
  return normalizeSplitsTo100(
    Object.fromEntries(
      categories.map((c) => [c, DEFAULT_CATEGORY_PERCENT[c] ?? 1]),
    ),
    categories,
  );
}
