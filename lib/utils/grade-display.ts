/**
 * CBC-friendly grade labels. Uses G1–G12 (not F1–F6) so sidebar matches
 * table names like "Grade 7" / "Grade 12".
 */

function normalizeGradeName(gradeName: string): string {
  return gradeName.toLowerCase().trim();
}

/** PP1/PP2/PP3 in their common spellings (PP1, Pre-Primary 2, pre primary 3). */
function prePrimaryNumber(gradeName: string): 1 | 2 | 3 | null {
  const lower = normalizeGradeName(gradeName);
  const pp = lower.match(/\bpp\s*([123])\b/);
  if (pp) return Number(pp[1]) as 1 | 2 | 3;
  const pre = lower.match(/\bpre[\s-]*primary\s*([123])\b/);
  if (pre) return Number(pre[1]) as 1 | 2 | 3;
  return null;
}

/** Short label for sidebar chips, e.g. G4, G7, PP1 */
export function abbreviateGradeShort(gradeName: string): string {
  const lower = normalizeGradeName(gradeName);

  if (
    lower === "baby" ||
    lower === "play group" ||
    lower === "playgroup" ||
    lower.startsWith("baby") ||
    lower.includes("play group") ||
    lower.includes("baby class")
  ) {
    return "PG";
  }
  const pp = prePrimaryNumber(gradeName);
  if (pp) return `PP${pp}`;
  if (lower.includes("early childhood")) return "EC";
  if (lower.includes("kindergarten")) return "KG";
  if (lower.includes("nursery")) return "NS";
  if (lower.includes("reception")) return "RC";

  // Legacy 8-4-4 form names — keep readable, don't remap to F-series in sidebar
  const formMatch = lower.match(/^form\s*(\d+)/);
  if (formMatch) return `Form ${formMatch[1]}`;

  const gradeMatch = gradeName.match(/grade\s*(\d+)/i);
  if (gradeMatch) {
    const num = parseInt(gradeMatch[1], 10);
    if (num >= 1 && num <= 12) return `G${num}`;
  }

  const bareNum = gradeName.match(/\d+/);
  if (bareNum) {
    const num = parseInt(bareNum[0], 10);
    if (num >= 1 && num <= 12) return `G${num}`;
  }

  return gradeName.length > 4 ? gradeName.slice(0, 4) : gradeName;
}

/** Sort key for grade ordering within a level */
export function getGradeSortOrder(gradeName: string): number {
  const lower = normalizeGradeName(gradeName);

  if (
    lower.includes("baby") ||
    lower.includes("play group") ||
    lower.includes("playgroup")
  ) {
    return 1;
  }
  const pp = prePrimaryNumber(gradeName);
  if (pp) return 1 + pp;

  const formMatch = lower.match(/^form\s*(\d+)/);
  if (formMatch) return 10 + parseInt(formMatch[1], 10);

  const match = gradeName.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    if (num >= 1 && num <= 12) return 4 + num;
  }

  return 999;
}

/** Human-readable grade name for dashboard headings */
export function formatGradeDisplayName(gradeName: string): string {
  const lower = normalizeGradeName(gradeName);

  const pp = prePrimaryNumber(gradeName);
  if (pp) return `PP${pp}`;

  const formMatch = lower.match(/^form\s*(\d+)/);
  if (formMatch) return `Form ${formMatch[1]}`;

  const gradeMatch = gradeName.match(/grade\s*(\d+)/i);
  if (gradeMatch) return `Grade ${gradeMatch[1]}`;

  const bareNum = gradeName.match(/\d+/);
  if (bareNum) {
    const num = parseInt(bareNum[0], 10);
    if (num >= 1 && num <= 6) return `Grade ${num}`;
    if (num >= 7 && num <= 12) return `Grade ${num}`;
  }

  return gradeName;
}

/** Curriculum band for default sidebar grouping (not level-based minimal) */
export function getGradeCurriculumBand(
  gradeName: string,
): "preschool" | "primary" | "secondary" | "other" {
  const order = getGradeSortOrder(gradeName);
  const abbr = abbreviateGradeShort(gradeName);

  if (order >= 1 && order <= 4) return "preschool";
  if (order >= 5 && order <= 10) return "primary";
  if (order >= 11 && order <= 16) return "secondary";
  if (/^G([7-9]|1[0-2])$/.test(abbr)) return "secondary";
  if (/^G[1-6]$/.test(abbr)) return "primary";
  if (abbr.startsWith("Form")) return "secondary";
  return "other";
}
