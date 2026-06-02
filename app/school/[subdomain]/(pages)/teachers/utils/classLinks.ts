import type { ClassTeacherAssignmentItem } from "../components/ClassTeacherAssignments";

export function buildClassesHref(
  assignment: ClassTeacherAssignmentItem,
): string {
  const streamTenantId = assignment.stream?.id;
  const gradeTenantId =
    assignment.gradeLevel?.id ?? assignment.stream?.tenantGradeLevel?.id;

  if (gradeTenantId && streamTenantId) {
    const params = new URLSearchParams({
      gradeId: gradeTenantId,
      streamId: streamTenantId,
    });
    return `/classes?${params.toString()}`;
  }

  if (gradeTenantId) {
    const params = new URLSearchParams({ gradeId: gradeTenantId });
    return `/classes?${params.toString()}`;
  }

  return "/classes";
}
