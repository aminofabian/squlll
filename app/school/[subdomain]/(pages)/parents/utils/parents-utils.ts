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

export function relationshipBadgeClass(_relationship: string): string {
  return "rounded-none border-[#246a59]/25 bg-[#e8f2ef] text-[#1a4d42]";
}
