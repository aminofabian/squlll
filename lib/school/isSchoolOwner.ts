import { getCookie } from "@/lib/utils";

/** School owner / primary admin — the account that owns payment rails. */
export function isSchoolOwnerRole(roleRaw: string | null | undefined): boolean {
  const role = (roleRaw || "").trim().toUpperCase();
  return role === "SCHOOL_ADMIN";
}

export function readIsSchoolOwner(): boolean {
  if (typeof window === "undefined") return false;
  return isSchoolOwnerRole(getCookie("userRole"));
}
