import type { MyChildApi, ParentPortalChild } from './types'

export function mapApiChildToPortalChild(
  dto: MyChildApi,
  index: number,
  attendanceRate = 0,
): ParentPortalChild {
  const gradeLabel =
    dto.grade?.displayName ?? dto.grade?.name ?? 'Grade'

  return {
    id: index + 1,
    studentId: dto.id,
    gradeId: dto.grade?.id ?? '',
    name: dto.name,
    grade: gradeLabel,
    class: gradeLabel,
    avatar: dto.gender?.toLowerCase() === 'female' ? '👧' : '👦',
    attendance: attendanceRate,
    currentGPA: 0,
    behavior: dto.isActive ? 'Active' : 'Inactive',
  }
}
