"use client";

import { useMemo } from "react";
import { useGetTeachers } from "@/lib/hooks/useTeachers";
import type { TenantSubject } from "@/lib/hooks/useTenantSubjects";
import { resolveTeacherDisplayName } from "@/lib/utils/teacher-display";
import { getSubjectMasterKey } from "./dedupeSubjects";

function register(
  map: Map<string, string>,
  key: string | undefined,
  teacherName: string,
) {
  if (!key || !teacherName || map.has(key)) return;
  map.set(key, teacherName);
}

export function useSubjectTeacherMap() {
  const { teachers, isLoading, refetch } = useGetTeachers();

  const teacherBySubjectId = useMemo(() => {
    const map = new Map<string, string>();

    for (const teacher of teachers) {
      if (teacher.isActive === false) continue;
      const name = resolveTeacherDisplayName(teacher);
      if (!name) continue;

      for (const subject of teacher.tenantSubjects || []) {
        register(map, subject.id, name);

        const catalogId =
          (subject as { subject?: { id?: string } }).subject?.id;
        const customId =
          (subject as { customSubject?: { id?: string } }).customSubject?.id;
        const subjectName = subject.name || "";
        const subjectCode =
          (subject as { subject?: { code?: string } }).subject?.code ||
          (subject as { customSubject?: { code?: string } }).customSubject
            ?.code ||
          "";

        if (catalogId) {
          register(map, catalogId, name);
          register(map, `subject:${catalogId}`, name);
        }
        if (customId) {
          register(map, `custom:${customId}`, name);
        }

        if (subjectName) {
          const stub = {
            subject: catalogId ? { id: catalogId } : null,
            customSubject: customId ? { id: customId } : null,
          } as TenantSubject;
          register(
            map,
            getSubjectMasterKey(stub, subjectName, subjectCode || ""),
            name,
          );
        }
      }
    }

    return map;
  }, [teachers]);

  const getTeacherForSubject = (
    tenantSubjectIds: string[],
    meta?: { _tenantSubject: TenantSubject; name: string; code: string },
  ) => {
    for (const id of tenantSubjectIds) {
      const hit = teacherBySubjectId.get(id);
      if (hit) return hit;
    }

    if (meta) {
      const { _tenantSubject, name, code } = meta;
      const catalogId = _tenantSubject.subject?.id;
      const customId = _tenantSubject.customSubject?.id;

      if (catalogId) {
        const hit =
          teacherBySubjectId.get(catalogId) ||
          teacherBySubjectId.get(`subject:${catalogId}`);
        if (hit) return hit;
      }
      if (customId) {
        const hit = teacherBySubjectId.get(`custom:${customId}`);
        if (hit) return hit;
      }

      const masterKey = getSubjectMasterKey(_tenantSubject, name, code);
      const byMaster = teacherBySubjectId.get(masterKey);
      if (byMaster) return byMaster;
    }

    return undefined;
  };

  return { getTeacherForSubject, isLoading, refetch, teacherBySubjectId };
}
