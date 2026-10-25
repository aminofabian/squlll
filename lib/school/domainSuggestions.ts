/**
 * School-domain name suggestions.
 *
 * Implements the naming rules: strip generic institution words, keep the most
 * distinctive part of the name, normalise to a valid domain label, then offer
 * up to five ranked strategies (core → descriptive → branding → level →
 * initials). Nothing here decides availability — that is checked against the
 * registrar separately.
 */

export type NamingStrategy =
  | "core"
  | "descriptive"
  | "branding"
  | "level"
  | "initials"
  | "exact";

export interface DomainSuggestion {
  /** Domain label without the extension, e.g. `qarsaabula`. */
  label: string;
  strategy: NamingStrategy;
  explanation: string;
  /** Set only when the admin typed a complete domain. */
  domain?: string;
}

const GENERIC_WORDS = new Set([
  "primary",
  "junior",
  "senior",
  "secondary",
  "school",
  "schools",
  "institution",
  "institutions",
  "educational",
  "education",
  "learning",
  "centre",
  "center",
  "academy",
  "college",
  "campus",
  "the",
  "and",
  "of",
  "for",
  "at",
  "excellence",
  "international",
  "national",
  "high",
  "preparatory",
  "prep",
  "nursery",
  "kindergarten",
  "kg",
  "day",
  "boarding",
  "mixed",
  "boys",
  "girls",
  "public",
  "private",
  "integrated",
  "special",
  "anglican",
  "catholic",
  "adventist",
  "islamic",
  "muslim",
  "christian",
  "church",
]);

export const STRATEGY_LABEL: Record<NamingStrategy, string> = {
  core: "Core name",
  descriptive: "Core + school",
  branding: "Core + academy",
  level: "Core + level",
  initials: "Initials",
  exact: "Your choice",
};

export const STRATEGY_EXPLANATION: Record<NamingStrategy, string> = {
  core: "Uses the school's distinctive name and drops generic words like Primary, Junior and School. Shortest and easiest to remember.",
  descriptive:
    "Adds 'school' so the address reads clearly at a glance. A little longer, but very obvious.",
  branding:
    "A more formal, brand-style option. Good if you want the address to feel like an institution.",
  level:
    "Keeps the school level so it isn't confused with a sister school.",
  initials:
    "Initials are only useful if parents and staff already use them — otherwise they're hard to remember.",
  exact: "The address you typed.",
};

/** Lowercase, strip apostrophes/accents/punctuation, split into words. */
export function tokenizeSchoolName(raw: string): string[] {
  return raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’`"]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Full domain typed by the admin (so we don't append an extension twice). */
function exactDomain(raw: string): string | null {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#]/)[0]
    .replace(/\.$/, "");
  // A school name like "St. Mary's Academy" also contains a dot, so require a
  // real domain shape: no spaces, at least two labels, alphabetic TLD.
  if (!cleaned || /\s/.test(cleaned) || !/^[a-z0-9.-]+$/.test(cleaned)) {
    return null;
  }
  const tld = cleaned.split(".").pop() ?? "";
  if (!/^[a-z]{2,}$/.test(tld)) return null;
  return cleaned;
}

function detectLevel(words: string[]): string | null {
  if (words.includes("secondary") || words.includes("high")) return "secondary";
  // "Junior and Senior" describes a combined school; appending either level
  // would be misleading.
  if (words.includes("junior") && words.includes("senior")) return null;
  if (words.includes("primary")) return "primary";
  if (words.includes("junior")) return "junior";
  return null;
}

function coreWords(words: string[]): string[] {
  const source = words.filter((word) => !GENERIC_WORDS.has(word));
  if (!source.length) return [];
  // Prefer the whole distinctive name when it is still short; otherwise keep
  // the first two words so the label stays memorable.
  let picked = source.slice(0, 3);
  if (picked.join("").length > 24) picked = source.slice(0, 2);
  if (picked.join("").length > 30) picked = source.slice(0, 1);
  return picked;
}

function cleanLabel(value: string): string {
  return value.replace(/[^a-z0-9]/g, "");
}

export function suggestDomainNames(raw: string): DomainSuggestion[] {
  const exact = exactDomain(raw);
  if (exact) {
    return [
      {
        label: exact,
        domain: exact,
        strategy: "exact",
        explanation: STRATEGY_EXPLANATION.exact,
      },
    ];
  }

  const words = tokenizeSchoolName(raw);
  const picked = coreWords(words);
  const core = cleanLabel(picked.join(""));
  if (!core) return [];

  const level = detectLevel(words);
  const suggestions: DomainSuggestion[] = [];
  const seen = new Set<string>();

  const add = (label: string, strategy: NamingStrategy) => {
    const cleaned = cleanLabel(label);
    if (!cleaned || cleaned.length > 30 || seen.has(cleaned)) return;
    seen.add(cleaned);
    suggestions.push({
      label: cleaned,
      strategy,
      explanation: STRATEGY_EXPLANATION[strategy],
    });
  };

  add(core, "core");
  add(`${core}school`, "descriptive");
  add(`${core}academy`, "branding");
  if (level && !core.endsWith(level)) {
    add(`${core}${level}`, "level");
  }
  if (picked.length === 1 && level) {
    add(`${picked[0][0]}${level[0]}s`, "initials");
  }

  return suggestions.slice(0, 5);
}
