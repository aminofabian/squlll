import type { TenantSubject } from "@/lib/hooks/useTenantSubjects";

export function getSubjectMasterKey(
  ts: TenantSubject,
  name: string,
  code: string,
): string {
  if (ts.subject?.id) return `subject:${ts.subject.id}`;
  if (ts.customSubject?.id) return `custom:${ts.customSubject.id}`;
  const normalizedName = name.toLowerCase().trim();
  const normalizedCode = code.toLowerCase().trim();
  if (normalizedCode) return `name:${normalizedName}:code:${normalizedCode}`;
  return `name:${normalizedName}`;
}

export type SubjectListItem = {
  id: string;
  name: string;
  code: string;
  subjectType: "core" | "elective";
  _tenantSubject: TenantSubject;
  tenantSubjectIds: string[];
};

export function dedupeSubjectsByMaster<
  T extends {
    id: string;
    name: string;
    code: string;
    subjectType: "core" | "elective";
    _tenantSubject: TenantSubject;
  },
>(subs: T[]): (T & { tenantSubjectIds: string[] })[] {
  const map = new Map<string, T & { tenantSubjectIds: string[] }>();

  for (const s of subs) {
    const masterKey = getSubjectMasterKey(s._tenantSubject, s.name, s.code);
    const existing = map.get(masterKey);
    if (existing) {
      if (!existing.tenantSubjectIds.includes(s.id)) {
        existing.tenantSubjectIds.push(s.id);
      }
      if (s.subjectType === "core") existing.subjectType = "core";
      continue;
    }
    map.set(masterKey, { ...s, tenantSubjectIds: [s.id] });
  }

  return Array.from(map.values());
}
