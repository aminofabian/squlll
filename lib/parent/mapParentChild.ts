import type { MyChildApi, ParentPortalChild } from './types'
import { formatGradeDisplayName } from '@/lib/utils/grade-display'

function resolveChildGradeLabel(grade: MyChildApi['grade']): string {
  const raw =
    grade?.shortName?.trim() ||
    grade?.name?.trim() ||
    grade?.gradeLevel?.name?.trim()
  if (!raw) return 'Grade'
  return formatGradeDisplayName(raw)
}

export function mapApiChildToPortalChild(
  dto: MyChildApi,
  index: number,
  attendanceRate = 0,
): ParentPortalChild {
  const gradeLabel = resolveChildGradeLabel(dto.grade)

  return {
    id: index + 1,
    studentId: dto.id,
    gradeId: dto.grade?.id ?? '',
    name: dto.name,
    grade: gradeLabel,
    class: '',
    avatar: dto.gender?.toLowerCase() === 'female' ? '👧' : '👦',
    attendance: attendanceRate,
    currentGPA: 0,
    behavior: dto.isActive ? 'Active' : 'Inactive',
  }
}
