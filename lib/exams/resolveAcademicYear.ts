import type { AcademicYear } from '@/lib/hooks/useAcademicYears'

/** Prefer the school's current year; fall back to date range, active flag, then first listed. */
export function resolveDefaultAcademicYear(
  years: AcademicYear[],
): AcademicYear | null {
  if (years.length === 0) return null

  const current = years.find((year) => year.isCurrent)
  if (current) return current

  const withCurrentTerm = years.find((year) =>
    year.terms.some((term) => term.isCurrent),
  )
  if (withCurrentTerm) return withCurrentTerm

  const today = new Date()
  today.setHours(12, 0, 0, 0)

  const containingToday = years.find((year) => {
    const start = new Date(year.startDate)
    const end = new Date(year.endDate)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    return today >= start && today <= end
  })
  if (containingToday) return containingToday

  const active = years.find((year) => year.isActive)
  if (active) return active

  return years[0]
}

function fallbackTermByMonth(terms: AcademicYear['terms']): string {
  const month = new Date().getMonth() + 1
  if (terms.length >= 3) {
    if (month <= 4) return terms[0].id
    if (month <= 8) return terms[1].id
    return terms[2].id
  }

  if (terms.length === 2) {
    return month <= 6 ? terms[0].id : terms[1].id
  }

  return terms[0].id
}

/** Prefer the school's current term; fall back to date range, active flag, then calendar heuristic. */
export function resolveDefaultTerm(
  terms: AcademicYear['terms'],
): string | null {
  if (terms.length === 0) return null
  if (terms.length === 1) return terms[0].id

  const current = terms.find((term) => term.isCurrent)
  if (current) return current.id

  const today = new Date()
  today.setHours(12, 0, 0, 0)

  const containingToday = terms.find((term) => {
    if (!term.startDate || !term.endDate) return false
    const start = new Date(term.startDate)
    const end = new Date(term.endDate)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    return today >= start && today <= end
  })
  if (containingToday) return containingToday.id

  const active = terms.find((term) => term.isActive)
  if (active) return active.id

  return fallbackTermByMonth(terms)
}

/** Default academic year + term pair for new exam sessions. */
export function resolveDefaultExamPeriod(
  years: AcademicYear[],
): { year: AcademicYear; termId: string } | null {
  if (years.length === 0) return null

  for (const year of years) {
    const currentTerm = year.terms.find((term) => term.isCurrent)
    if (currentTerm) {
      return { year, termId: currentTerm.id }
    }
  }

  const year = resolveDefaultAcademicYear(years)
  if (!year) return null

  const termId = resolveDefaultTerm(year.terms)
  if (!termId) return null

  return { year, termId }
}
