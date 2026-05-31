import { getCookie } from "@/lib/utils";

export const SUPER_ADMIN_ROLE = "SUPER_ADMIN";
export const SUPER_ADMIN_LOGIN_PATH = "/superadmin/login";

export function getSuperAdminRoleFromCookie(): string | null {
  const role = getCookie("userRole");
  if (!role) return null;
  try {
    return decodeURIComponent(role);
  } catch {
    return role;
  }
}

export function isSuperAdminSession(): boolean {
  return getSuperAdminRoleFromCookie() === SUPER_ADMIN_ROLE;
}
