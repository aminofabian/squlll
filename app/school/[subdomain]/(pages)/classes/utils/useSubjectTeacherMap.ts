import { useMemo } from "react";
import { useGetTeachers } from "@/lib/hooks/useTeachers";

export function useSubjectTeacherMap() {
  const { teachers, isLoading } = useGetTeachers();

  const teacherBySubjectId = useMemo(() => {
    const map = new Map<string, string>();

    for (const teacher of teachers) {
      if (teacher.isActive === false) continue;
      const name =
        teacher.fullName ||
        [teacher.firstName, teacher.lastName].filter(Boolean).join(" ");

      for (const subject of teacher.tenantSubjects || []) {
        if (subject?.id && name && !map.has(subject.id)) {
          map.set(subject.id, name);
        }
      }
    }

    return map;
  }, [teachers]);

  const getTeacherForSubject = (tenantSubjectIds: string[]) => {
    for (const id of tenantSubjectIds) {
      const name = teacherBySubjectId.get(id);
      if (name) return name;
    }
    return undefined;
  };

  return { getTeacherForSubject, isLoading };
}
