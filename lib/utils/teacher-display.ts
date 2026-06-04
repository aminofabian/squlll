/** Display name for teachers when fullName is missing in the database. */
export function resolveTeacherDisplayName(teacher: {
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  user?: { name?: string | null } | null;
  email?: string | null;
}): string {
  const direct = teacher.fullName?.trim();
  if (direct) return direct;

  const fromParts = [teacher.firstName, teacher.lastName]
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(" ")
    .trim();
  if (fromParts) return fromParts;

  const userName = teacher.user?.name?.trim();
  if (userName) return userName;

  const emailLocal = teacher.email?.split("@")[0]?.trim();
  if (emailLocal) return emailLocal;

  return "";
}
