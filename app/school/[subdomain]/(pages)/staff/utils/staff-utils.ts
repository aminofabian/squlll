import type { Staff } from "../hooks/useStaff";

export type StaffFilter = "all" | "active" | "inactive" | "incomplete";

export function matchesStaffFilter(
  member: Pick<Staff, "isActive" | "hasCompletedProfile">,
  filter: StaffFilter,
) {
  if (filter === "all") return true;
  if (filter === "active") return member.isActive;
  if (filter === "inactive") return !member.isActive;
  if (filter === "incomplete") return !member.hasCompletedProfile;
  return true;
}

export function formatStaffLabel(value: string | null | undefined): string {
  if (!value?.trim()) return "—";
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatStaffDate(date: string | null | undefined): string {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return date;
  }
}

export function staffDisplayName(member: Staff): string {
  return member.fullName?.trim() || "Unknown staff";
}
