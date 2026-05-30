/**
 * Compact labels for whole-school timetable cells, e.g. MAT-G7, ENG-F2.
 */

const SUBJECT_ALIASES: Record<string, string> = {
  mathematics: "MAT",
  math: "MAT",
  maths: "MAT",
  english: "ENG",
  kiswahili: "KIS",
  swahili: "SWA",
  science: "SCI",
  biology: "BIO",
  chemistry: "CHE",
  physics: "PHY",
  history: "HIS",
  geography: "GEO",
  "religious education": "CRE",
  cre: "CRE",
  "business studies": "BUS",
  agriculture: "AGR",
  "computer studies": "CMP",
  "computer science": "CS",
  "physical education": "PE",
  "home science": "HSC",
  music: "MUS",
  art: "ART",
};

/** Subject code — prefers configured code, then known aliases, then acronym. */
export function getSubjectShortCode(
  name: string,
  code?: string | null,
): string {
  const trimmed = code?.trim();
  if (trimmed) {
    return trimmed.toUpperCase();
  }

  const key = name.toLowerCase().trim();
  if (SUBJECT_ALIASES[key]) {
    return SUBJECT_ALIASES[key];
  }

  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return words
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 4);
  }

  return name.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "?";
}

/** Grade code — prefers backend shortName / displayName, else derives G7, F2, PP1, etc. */
export function getGradeShortCode(
  gradeName: string,
  displayName?: string | null,
): string {
  const display = displayName?.trim();
  if (display && display.length <= 4 && /^[A-Za-z0-9]+$/.test(display)) {
    return display.toUpperCase();
  }

  const name = gradeName.toLowerCase();

  if (name.includes("pp1")) return "PP1";
  if (name.includes("pp2")) return "PP2";

  const gradeMatch = name.match(/grade\s*(\d{1,2})/);
  if (gradeMatch) {
    return `G${gradeMatch[1]}`;
  }

  const formMatch = name.match(/form\s*(\d)/);
  if (formMatch) {
    return `F${formMatch[1]}`;
  }

  if (/\bf1\b/.test(name)) return "F1";
  if (/\bf2\b/.test(name)) return "F2";
  if (/\bf3\b/.test(name)) return "F3";
  if (/\bf4\b/.test(name)) return "F4";
  if (/\bf5\b/.test(name)) return "F5";
  if (/\bf6\b/.test(name)) return "F6";

  const match = gradeName.match(/(\d+)/);
  if (match) {
    return `G${match[1]}`;
  }

  return gradeName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "?";
}

export function formatCombinedLessonShortcode(
  subject: { name: string; code?: string | null },
  grade: { name: string; displayName?: string | null },
): string {
  return `${getSubjectShortCode(subject.name, subject.code)}-${getGradeShortCode(grade.name, grade.displayName)}`;
}

/** Whole-school cell label: grade code with optional stream, e.g. G7 or G7 · East */
export function formatCombinedGradeLabel(
  grade: { name: string; displayName?: string | null },
  streamName?: string | null,
): string {
  const gradeCode = getGradeShortCode(grade.name, grade.displayName);
  const stream = streamName?.trim();
  if (!stream) return gradeCode;
  return `${gradeCode} · ${stream}`;
}

/** Split MAT-G7 into { subject: "MAT", grade: "G7" } for two-part chip UI. */
export function parseLessonShortcode(label: string): {
  subject: string;
  grade: string;
} {
  const dash = label.lastIndexOf("-");
  if (dash <= 0) {
    return { subject: label, grade: "" };
  }
  return {
    subject: label.slice(0, dash),
    grade: label.slice(dash + 1),
  };
}
