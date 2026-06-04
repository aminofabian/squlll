import type { StudentDetailSummary } from "@/types/student";

export type StudentProfileTab =
  | "overview"
  | "person"
  | "money"
  | "enrollment"
  | "access"
  | "documents";

export const STUDENT_PROFILE_TABS: {
  value: StudentProfileTab;
  label: string;
}[] = [
  { value: "overview", label: "Overview" },
  { value: "person", label: "Person" },
  { value: "money", label: "Money" },
  { value: "enrollment", label: "Enrollment" },
  { value: "access", label: "Access" },
  { value: "documents", label: "Documents" },
];

const VALID_TABS = new Set<string>(STUDENT_PROFILE_TABS.map((t) => t.value));

/** Legacy tab query values from the previous profile layout */
const TAB_ALIASES: Record<string, StudentProfileTab> = {
  details: "person",
  fees: "money",
  ledger: "money",
  account: "access",
};

export function parseStudentProfileTab(
  value: string | null,
  _student?: StudentDetailSummary | null,
): StudentProfileTab {
  if (value && VALID_TABS.has(value)) {
    return value as StudentProfileTab;
  }
  if (value && TAB_ALIASES[value]) {
    return TAB_ALIASES[value];
  }
  return "overview";
}

export function tabBadge(
  tab: StudentProfileTab,
  student: StudentDetailSummary,
  missingStream: boolean,
): string | null {
  switch (tab) {
    case "money": {
      const balance = Math.max(0, student.feeSummary.balance);
      if (balance <= 0) return null;
      if (balance >= 1000) {
        return `KES ${Math.round(balance / 1000)}k`;
      }
      return `KES ${balance}`;
    }
    case "enrollment":
      return missingStream ? "!" : null;
    case "access":
      return student.userId ? null : "Setup";
    default:
      return null;
  }
}
