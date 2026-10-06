import { getCookie } from "@/lib/utils";
import {
  cookieHasRole,
  parseRoleCookieValues,
  SUPER_ADMIN_ROLE,
} from "@/lib/auth/role-cookie";

export { SUPER_ADMIN_ROLE };
export const SUPER_ADMIN_LOGIN_PATH = "/superadmin/login";

export function getSuperAdminRoleFromCookie(): string | null {
  return parseRoleCookieValues(getCookie("userRole"))[0] ?? null;
}

export function isSuperAdminSession(): boolean {
  return cookieHasRole(getCookie("userRole"), SUPER_ADMIN_ROLE);
}
