import { isParentProfileIncomplete } from "./mapGraphqlParent";

export type ParentFilter = "all" | "active" | "needs-setup" | "incomplete";

export function matchesParentFilter(
  parent: {
    status: "active" | "inactive";
    email?: string | null;
    phone?: string | null;
    homeAddress?: string | null;
  },
  filter: ParentFilter,
) {
  if (filter === "all") return true;
  if (filter === "active") return parent.status === "active";
  if (filter === "needs-setup") return parent.status === "inactive";
  if (filter === "incomplete") return isParentProfileIncomplete(parent);
  return true;
}

export function formatParentDate(
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

export function formatRelationship(relationship: string): string {
  if (!relationship?.trim()) return "Other";
  return relationship.charAt(0).toUpperCase() + relationship.slice(1).toLowerCase();
}

export function relationshipBadgeClass(relationship: string): string {
  switch (relationship.toLowerCase()) {
    case "father":
      return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400";
    case "mother":
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400";
    case "guardian":
      return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-400";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300";
  }
}
