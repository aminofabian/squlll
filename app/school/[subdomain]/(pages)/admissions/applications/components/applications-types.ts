export type ApplicationStatus =
  | 'new'
  | 'reviewing'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'

export type AdmissionApplication = {
  id: string
  reference: string
  status: ApplicationStatus
  studentFirstName: string
  studentLastName: string
  dateOfBirth: string
  gender: string | null
  programme: string
  startTerm: string
  currentSchool: string | null
  guardianName: string
  relationship: string
  guardianEmail: string
  guardianPhone: string
  interests: string[] | null
  whyUs: string | null
  notes: string | null
  adminNotes: string | null
  enrolledStudentId: string | null
  admissionNumber: string | null
  createdAt: string
  updatedAt: string
}

export const STATUS_META: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  new: {
    label: 'New',
    className:
      'border-[#1a4d42]/15 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200',
  },
  reviewing: {
    label: 'Reviewing',
    className:
      'border-[#1a4d42]/15 bg-[#e8f2ef] text-[#1a4d42] dark:border-white/15 dark:bg-[#246a59]/20 dark:text-emerald-200',
  },
  accepted: {
    label: 'Accepted',
    className:
      'border-[#1a4d42]/15 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200',
  },
  rejected: {
    label: 'Declined',
    className:
      'border-[#1a4d42]/15 bg-rose-50 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200',
  },
  withdrawn: {
    label: 'Withdrawn',
    className:
      'border-[#1a4d42]/15 bg-[#f3f7f5] text-[#1a4d42]/70 dark:border-white/10 dark:bg-white/5 dark:text-white/55',
  },
}

/** GraphQL enums serialize as NEW/REVIEWING; DB stores new/reviewing. */
export function normalizeStatus(
  status: string | null | undefined,
): ApplicationStatus {
  const raw = String(status || 'new').toLowerCase()
  if (raw in STATUS_META) return raw as ApplicationStatus
  return 'new'
}

export function statusMeta(status: string | null | undefined) {
  return STATUS_META[normalizeStatus(status)]
}

export const PROGRAMME_LABELS: Record<string, string> = {
  'early-years': 'Early Years',
  primary: 'Primary',
  'junior-secondary': 'Junior Secondary',
  'senior-secondary': 'Senior Secondary',
}

export const TERM_LABELS: Record<string, string> = {
  'sep-2026': 'September 2026',
  'jan-2027': 'January 2027',
  'apr-2027': 'April 2027',
  'sep-2027': 'September 2027',
}

export function studentName(app: Pick<AdmissionApplication, 'studentFirstName' | 'studentLastName'>) {
  return `${app.studentFirstName} ${app.studentLastName}`.trim()
}

export function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}
