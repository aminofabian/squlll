/** Decode cookie / URL-encoded display strings (e.g. Fabian%20Amino → Fabian Amino). */
export function decodeDisplayText(value: string | null | undefined): string {
  if (!value?.trim()) return "";
  const normalized = value.trim().replace(/\+/g, " ");
  try {
    return decodeURIComponent(normalized);
  } catch {
    return normalized.replace(/%20/gi, " ");
  }
}

export function childGradeSubtitle(child: {
  grade: string;
  class?: string;
}): string {
  const grade = child.grade?.trim() ?? "";
  const classLabel = child.class?.trim() ?? "";
  if (!grade) return classLabel || "Student";
  if (!classLabel || classLabel === grade) return grade;
  return `${grade} · ${classLabel}`;
}
