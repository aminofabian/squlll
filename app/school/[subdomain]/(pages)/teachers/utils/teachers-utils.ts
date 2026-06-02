const AVATAR_PALETTES = [
  { bg: "bg-sky-100 dark:bg-sky-950", text: "text-sky-700 dark:text-sky-300" },
  { bg: "bg-violet-100 dark:bg-violet-950", text: "text-violet-700 dark:text-violet-300" },
  { bg: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300" },
  { bg: "bg-amber-100 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300" },
  { bg: "bg-rose-100 dark:bg-rose-950", text: "text-rose-700 dark:text-rose-300" },
  { bg: "bg-teal-100 dark:bg-teal-950", text: "text-teal-700 dark:text-teal-300" },
] as const;

export function teacherInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function getAvatarPalette(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

import { isTeacherProfileIncomplete } from "./mapGraphqlTeacher";

export type StaffFilter = "all" | "active" | "needs-setup" | "incomplete";

export function matchesStaffFilter(
  teacher: {
    status:
      | "active"
      | "inactive"
      | "on leave"
      | "former"
      | "substitute"
      | "retired";
    employeeId?: string | null;
    dateOfBirth?: string | null;
    qualifications?: string | null;
    hasCompletedProfile?: boolean;
    contacts?: { phone?: string; email?: string };
  },
  filter: StaffFilter,
) {
  if (filter === "all") return true;
  if (filter === "active") return teacher.status === "active";
  if (filter === "needs-setup") return teacher.status === "inactive";
  if (filter === "incomplete") return isTeacherProfileIncomplete(teacher);
  return true;
}

export function formatTeacherDate(
  date?: string | Date | null,
): string | null {
  if (!date) return null;
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

export function formatSubjectTypeLabel(subjectType?: string | null): string {
  if (!subjectType) return "Core";
  const normalized = subjectType.toLowerCase();
  if (normalized === "elective") return "Elective";
  if (normalized === "core") return "Core";
  if (normalized === "custom") return "Custom";
  return subjectType.charAt(0).toUpperCase() + subjectType.slice(1);
}

export function formatTenantSubjectLabel(subject: {
  name?: string | null;
  subjectType?: string | null;
  customSubject?: { name?: string | null } | null;
}): string {
  const name =
    subject.name?.trim() ||
    subject.customSubject?.name?.trim() ||
    "Unknown subject";
  return `${name} (${formatSubjectTypeLabel(subject.subjectType)})`;
}
