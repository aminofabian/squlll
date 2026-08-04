/**
 * Suggested weekly lesson counts so an administrator corrects numbers instead of
 * inventing them. Figures are a common CBC-style starting point for Kenyan
 * schools, not a rule — every school edits these.
 */

export type GradeBand =
  | "prePrimary"
  | "lowerPrimary"
  | "upperPrimary"
  | "juniorSecondary"
  | "seniorSecondary";

export interface WeeklyLessonSuggestion {
  lessonsPerWeek: number;
  /** Practical subjects usually want one block of two lessons together. */
  doubleLessons: number;
}

interface SubjectRule {
  /** Lower-case keywords; first match wins, so put specific ones first. */
  match: string[];
  /** Lessons per week by band, falling back to `lessons`. */
  lessons: number;
  byBand?: Partial<Record<GradeBand, number>>;
  /** Suggest a double when the subject has at least this many lessons. */
  doubleFrom?: number;
}

const SUBJECT_RULES: SubjectRule[] = [
  // Pre-primary learning areas, matched before the general subjects below.
  { match: ["language activit"], lessons: 5 },
  { match: ["environmental activit"], lessons: 5 },
  { match: ["psychomotor", "creative activit"], lessons: 4 },
  {
    match: ["mathematic", "maths", "math"],
    lessons: 7,
    byBand: { prePrimary: 5, lowerPrimary: 5, juniorSecondary: 6, seniorSecondary: 6 },
  },
  {
    match: ["english"],
    lessons: 6,
    byBand: { prePrimary: 5, lowerPrimary: 5 },
  },
  {
    match: ["kiswahili", "swahili"],
    lessons: 5,
    byBand: { prePrimary: 4, lowerPrimary: 4 },
  },
  {
    match: ["kenyan sign language", "sign language"],
    lessons: 2,
  },
  {
    match: ["integrated science", "science and technology", "science & technology", "science"],
    lessons: 4,
    byBand: { lowerPrimary: 3, juniorSecondary: 5 },
    doubleFrom: 3,
  },
  { match: ["biology"], lessons: 4, doubleFrom: 3 },
  { match: ["chemistry"], lessons: 4, doubleFrom: 3 },
  { match: ["physics"], lessons: 4, doubleFrom: 3 },
  {
    match: ["social studies", "social science"],
    lessons: 3,
    byBand: { juniorSecondary: 4 },
  },
  { match: ["history"], lessons: 3 },
  { match: ["geography"], lessons: 3 },
  {
    match: [
      "religious",
      "cre",
      "ire",
      "hre",
      "christian",
      "islamic",
      "hindu",
    ],
    lessons: 3,
    byBand: { juniorSecondary: 2, seniorSecondary: 2 },
  },
  {
    match: ["agriculture", "agri"],
    lessons: 2,
    byBand: { juniorSecondary: 3 },
    doubleFrom: 2,
  },
  {
    match: ["home science", "home economics"],
    lessons: 2,
    byBand: { juniorSecondary: 3 },
    doubleFrom: 2,
  },
  {
    match: ["pre-technical", "pre technical", "pretechnical", "workshop", "technical"],
    lessons: 2,
    byBand: { juniorSecondary: 3 },
    doubleFrom: 2,
  },
  {
    match: ["computer", "ict", "information communication", "digital literacy"],
    lessons: 2,
    doubleFrom: 2,
  },
  {
    match: ["creative art", "art and craft", "art & craft", "art", "music", "performing"],
    lessons: 3,
    byBand: { juniorSecondary: 2 },
    doubleFrom: 3,
  },
  {
    match: ["physical", "games", "sport", " pe "],
    lessons: 3,
    byBand: { juniorSecondary: 2, seniorSecondary: 2 },
  },
  { match: ["business", "commerce"], lessons: 2, byBand: { juniorSecondary: 3 } },
  { match: ["life skill"], lessons: 1 },
  { match: ["health education"], lessons: 1 },
  { match: ["environmental"], lessons: 2 },
  { match: ["indigenous language", "mother tongue"], lessons: 1 },
  { match: ["literacy"], lessons: 5, byBand: { upperPrimary: 3 } },
  { match: ["hygiene", "nutrition"], lessons: 2 },
];

const DEFAULT_SUGGESTION: WeeklyLessonSuggestion = {
  lessonsPerWeek: 2,
  doubleLessons: 0,
};

/** Work out the band from a grade's level number, falling back to its name. */
export function gradeBandFor(grade: {
  level?: number;
  name?: string;
}): GradeBand {
  const name = (grade.name ?? "").toLowerCase();

  // Pre-primary classes are often numbered 1 and 2, so trust the name first.
  if (/(baby|nursery|playgroup|pre-?primary|\bpp\s?\d?\b|\bpg\b)/.test(name)) {
    return "prePrimary";
  }

  const level = Number.isFinite(grade.level) ? Number(grade.level) : null;

  if (level != null && level > 0) {
    if (level <= 3) return "lowerPrimary";
    if (level <= 6) return "upperPrimary";
    if (level <= 9) return "juniorSecondary";
    return "seniorSecondary";
  }

  if (/form\s*[34]/.test(name)) return "seniorSecondary";
  if (/form\s*[12]/.test(name)) return "juniorSecondary";

  const digits = name.match(/\d+/);
  if (digits) {
    const n = Number(digits[0]);
    if (n <= 3) return "lowerPrimary";
    if (n <= 6) return "upperPrimary";
    if (n <= 9) return "juniorSecondary";
    return "seniorSecondary";
  }

  return "upperPrimary";
}

export function suggestWeeklyLessons(
  subjectName: string,
  band: GradeBand,
): WeeklyLessonSuggestion {
  const name = ` ${subjectName.toLowerCase().trim()} `;
  const rule = SUBJECT_RULES.find((r) =>
    r.match.some((keyword) => name.includes(keyword)),
  );

  if (!rule) return DEFAULT_SUGGESTION;

  const lessonsPerWeek = rule.byBand?.[band] ?? rule.lessons;
  const doubleLessons =
    rule.doubleFrom != null && lessonsPerWeek >= rule.doubleFrom ? 1 : 0;

  return { lessonsPerWeek, doubleLessons };
}
