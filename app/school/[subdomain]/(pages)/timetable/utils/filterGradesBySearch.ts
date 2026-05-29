import type { Grade } from "@/lib/types/timetable";

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Build searchable strings for a grade (name, short name, level, streams). */
function gradeSearchFields(grade: Grade): string[] {
  const fields: string[] = [];

  if (grade.name) fields.push(normalize(grade.name));
  if (grade.displayName) fields.push(normalize(grade.displayName));
  if (grade.level != null && !Number.isNaN(grade.level)) {
    fields.push(String(grade.level));
    fields.push(`grade ${grade.level}`);
    fields.push(`form ${grade.level}`);
    fields.push(`year ${grade.level}`);
  }

  for (const stream of grade.streams ?? []) {
    if (stream.name) fields.push(normalize(stream.name));
  }

  return fields;
}

function tokenMatchesGrade(token: string, grade: Grade, fields: string[]): boolean {
  const t = normalize(token);
  if (!t) return true;

  if (/^\d+$/.test(t)) {
    const n = parseInt(t, 10);
    if (grade.level === n) return true;
  }

  return fields.some((field) => field.includes(t));
}

/**
 * Filter grades by a search query. Supports multi-word queries (all tokens must match).
 * Matches class name, display/short name, numeric level, and stream names.
 */
export function filterGradesBySearch(grades: Grade[], query: string): Grade[] {
  const q = query.trim();
  if (!q) return grades;

  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return grades;

  return grades.filter((grade) => {
    const fields = gradeSearchFields(grade);
    return tokens.every((token) => tokenMatchesGrade(token, grade, fields));
  });
}

export function highlightGradeSearchMatch(
  label: string,
  query: string,
): { before: string; match: string; after: string } | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const lower = label.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx < 0) return null;
  return {
    before: label.slice(0, idx),
    match: label.slice(idx, idx + q.length),
    after: label.slice(idx + q.length),
  };
}
