import type { Grade, Subject, Teacher } from "@/lib/types/timetable";
import type { TeacherLessonAllocation } from "@/lib/types/timetable-allocation";
import { isSameGrade } from "./resolveGradeForSchoolConfig";
import { subjectsForSelectedTeacher } from "./subjectsForSelectedTeacher";

type ClassScope = {
  gradeId: string | null | undefined;
  streamId: string | null | undefined;
  grades: Grade[];
};

/**
 * Subjects a teacher takes in this class. Lesson allocations for the class win;
 * without any, fall back to the subjects on the teacher's profile.
 */
export function subjectsForTeacherInClass(
  teacher: Pick<Teacher, "id" | "subjectIds" | "subjects"> | undefined,
  classSubjects: Subject[],
  allocations: Pick<TeacherLessonAllocation, "teacherId" | "subjectId" | "gradeLevelId" | "streamId">[],
  scope: ClassScope,
): Subject[] {
  if (!teacher) return [];
  const allocatedIds = new Set(
    allocations
      .filter(
        (a) =>
          a.teacherId === teacher.id &&
          isSameGrade(a.gradeLevelId, scope.gradeId, scope.grades) &&
          (!a.streamId || a.streamId === scope.streamId),
      )
      .map((a) => a.subjectId),
  );
  if (allocatedIds.size === 0) return subjectsForSelectedTeacher(teacher, classSubjects);
  return classSubjects.filter((s) => allocatedIds.has(s.id));
}
