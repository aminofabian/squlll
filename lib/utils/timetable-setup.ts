const STORAGE_PREFIX = 'squl_timetable_wizard_done_'

export type TimetableBreakDraft = {
  id: string
  type: string
  label: string
  icon: string
  color: string
  afterPeriod: number
  durationMinutes: string
}

/** Preset break types — matches GraphQL `BreakType` enum. */
export const TIMETABLE_BREAK_TYPES = [
  { value: 'ASSEMBLY', label: 'Assembly', icon: '🏫', color: '#8B5CF6' },
  { value: 'SHORT_BREAK', label: 'Short break', icon: '☕', color: '#3B82F6' },
  { value: 'TEA_BREAK', label: 'Tea break', icon: '🫖', color: '#3B82F6' },
  { value: 'LONG_BREAK', label: 'Long break', icon: '⏳', color: '#0EA5E9' },
  { value: 'LUNCH', label: 'Lunch', icon: '🍽️', color: '#F59E0B' },
  { value: 'GAMES_BREAK', label: 'Games / sports', icon: '🎮', color: '#EF4444' },
  { value: 'RECESS', label: 'Recess', icon: '🌳', color: '#22C55E' },
  { value: 'SNACK_BREAK', label: 'Snack break', icon: '🍎', color: '#F97316' },
] as const

const GRAPHQL_BREAK_TYPE_VALUES = new Set<string>(
  TIMETABLE_BREAK_TYPES.map((t) => t.value),
)

/** Wizard-only option: styling only; API uses `apiType` or nearest enum. */
export const TIMETABLE_BREAK_TYPE_CUSTOM = 'CUSTOM' as const

export type TimetableWizardBreakTypeOption = {
  value: string
  label: string
  icon: string
  color: string
  /** GraphQL enum value when `value` is not on the API (e.g. Preps, Dinner). */
  apiType?: string
}

/** Full dropdown list for the setup wizard (ordered for school admins). */
export const TIMETABLE_WIZARD_BREAK_TYPE_OPTIONS: TimetableWizardBreakTypeOption[] =
  [
    ...TIMETABLE_BREAK_TYPES,
    {
      value: 'PREPS',
      label: 'Preps',
      icon: '📖',
      color: '#6366F1',
      apiType: 'LONG_BREAK',
    },
    {
      value: 'DINNER_BREAK',
      label: 'Dinner break',
      icon: '🌙',
      color: '#7C3AED',
      apiType: 'LUNCH',
    },
    {
      value: TIMETABLE_BREAK_TYPE_CUSTOM,
      label: 'Other — type your own name',
      icon: '✏️',
      color: '#64748B',
      apiType: 'SHORT_BREAK',
    },
  ]

export function getWizardBreakTypeOption(
  type: string,
): TimetableWizardBreakTypeOption | undefined {
  return TIMETABLE_WIZARD_BREAK_TYPE_OPTIONS.find((t) => t.value === type)
}

export function defaultLabelForBreakType(type: string): string {
  return getWizardBreakTypeOption(type)?.label ?? 'Break'
}

/** GraphQL only accepts `BreakType` enum values — wizard extras map via `apiType`. */
export function resolveBreakTypeForApi(type: string): string {
  const opt = getWizardBreakTypeOption(type)
  if (opt?.apiType) return opt.apiType
  if (GRAPHQL_BREAK_TYPE_VALUES.has(type)) return type
  return 'SHORT_BREAK'
}

export function isPresetBreakLabel(label: string): boolean {
  const trimmed = label.trim()
  if (!trimmed) return true
  return TIMETABLE_WIZARD_BREAK_TYPE_OPTIONS.some((t) => t.label === trimmed)
}

export function isTimetableWizardComplete(tenantId: string | null | undefined): boolean {
  if (!tenantId || typeof window === 'undefined') return false
  return localStorage.getItem(`${STORAGE_PREFIX}${tenantId}`) === 'true'
}

export function markTimetableWizardComplete(tenantId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${STORAGE_PREFIX}${tenantId}`, 'true')
}

export function parsePositiveInt(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const num = Number(trimmed)
  if (!Number.isFinite(num)) return null
  const int = Math.trunc(num)
  if (int <= 0) return null
  return int
}

function defaultWeekdayNumbers(count: number): number[] {
  const n = Math.min(Math.max(count, 1), 7)
  return Array.from({ length: n }, (_, i) => i + 1)
}

/**
 * Only include schoolDayNumbers when days are non-contiguous (e.g. Mon/Wed/Fri).
 * Mon–Fri uses numberOfDays alone for compatibility with older API schemas.
 */
export function schoolDayNumbersForApi(
  numberOfDays: number,
  schoolDayNumbers?: number[],
): number[] | undefined {
  if (!schoolDayNumbers?.length) return undefined
  const sorted = [...new Set(schoolDayNumbers)].sort((a, b) => a - b)
  const defaultDays = defaultWeekdayNumbers(sorted.length)
  const isContiguousFromMonday =
    sorted.length === defaultDays.length &&
    sorted.every((d, i) => d === defaultDays[i])
  if (isContiguousFromMonday) return undefined
  return sorted
}

export function humanizeWeekTemplateError(message: string): string {
  const lower = message.toLowerCase()
  if (
    lower.includes('schooldaynumbers') &&
    (lower.includes('not defined') || lower.includes('invalid value'))
  ) {
    return 'Custom school days are not supported on this server yet. Use Monday–Friday, or update the backend.'
  }
  if (lower.includes('schooldaynumbers')) {
    return 'Could not save those school days. Try Monday–Friday or refresh and try again.'
  }
  if (
    (lower.includes('gradelevel') || lower.includes('stream') || lower.includes('termid')) &&
    (lower.includes('invalid') || lower.includes('not found'))
  ) {
    return 'Could not link this timetable to the class or term. Refresh the page and try again.'
  }
  if (
    lower.includes('periodcount') ||
    lower.includes('periodduration') ||
    lower.includes('starttime')
  ) {
    return 'Check lesson count, lesson length, and start time, then try again.'
  }
  if (message.length > 160) {
    return 'Could not create the timetable. Refresh the page and try again.'
  }
  return message
}

export function calculateDayEndTime(
  startTime: string,
  periodCount: number,
  periodDurationMinutes: number,
): string {
  const [hours, mins] = startTime.split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(mins)) return '--:--'
  const totalMinutes = hours * 60 + mins + periodCount * periodDurationMinutes
  const endHours = Math.floor(totalMinutes / 60) % 24
  const endMins = totalMinutes % 60
  return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
}

export function buildPeriodPreview(
  startTime: string,
  periodCount: number,
  periodDurationMinutes: number,
): { period: number; start: string; end: string }[] {
  const [h, m] = startTime.split(':').map(Number)
  let cursor = h * 60 + m
  const rows: { period: number; start: string; end: string }[] = []

  for (let p = 1; p <= periodCount; p++) {
    const start = formatMinutes(cursor)
    cursor += periodDurationMinutes
    const end = formatMinutes(cursor)
    rows.push({ period: p, start, end })
  }
  return rows
}

export type DayTimelineRow =
  | { kind: 'period'; period: number; start: string; end: string }
  | {
      kind: 'break'
      label: string
      afterPeriod: number
      durationMinutes: number
      icon?: string
    }

/** Merges lesson periods and breaks for wizard review (one sample day). */
export function buildDayTimelinePreview(
  startTime: string,
  periodCount: number,
  periodDurationMinutes: number,
  breakDrafts: TimetableBreakDraft[],
): DayTimelineRow[] {
  const periods = buildPeriodPreview(
    startTime,
    periodCount,
    periodDurationMinutes,
  )
  const rows: DayTimelineRow[] = []

  for (const b of breakDrafts.filter((x) => x.afterPeriod === 0)) {
    const mins = parsePositiveInt(b.durationMinutes) ?? 15
    rows.push({
      kind: 'break',
      label: b.label.trim() || defaultLabelForBreakType(b.type),
      afterPeriod: 0,
      durationMinutes: mins,
      icon: b.icon,
    })
  }

  for (const p of periods) {
    rows.push({ kind: 'period', ...p })
    for (const b of breakDrafts.filter((x) => x.afterPeriod === p.period)) {
      const mins = parsePositiveInt(b.durationMinutes) ?? 15
      rows.push({
        kind: 'break',
        label: b.label.trim() || defaultLabelForBreakType(b.type),
        afterPeriod: p.period,
        durationMinutes: mins,
        icon: b.icon,
      })
    }
  }

  return rows
}

function formatMinutes(total: number): string {
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export type GradeStreamInfo = {
  tenantStreamId: string
  name: string
}

export type GradeLevelWithStreams = {
  /** Tenant grade level id (for API gradeLevelIds) */
  id: string
  /** Underlying grade level id (for UI / entries) */
  gradeLevelId: string
  name: string
  displayName?: string
  streams: GradeStreamInfo[]
}

export type TimetableScopeTarget = {
  key: string
  gradeLevelId: string
  gradeId: string
  gradeName: string
  streamId?: string
  streamName?: string
  label: string
}

export function buildDefaultScopeKeys(gradeLevels: GradeLevelWithStreams[]): string[] {
  const keys: string[] = []
  for (const gl of gradeLevels) {
    if (gl.streams.length > 0) {
      for (const s of gl.streams) {
        keys.push(`${gl.gradeLevelId}:${s.tenantStreamId}`)
      }
    } else {
      keys.push(`${gl.gradeLevelId}:`)
    }
  }
  return keys
}

export function buildTimetableScopeTargets(
  selectedKeys: Set<string>,
  gradeLevels: GradeLevelWithStreams[],
): TimetableScopeTarget[] {
  const targets: TimetableScopeTarget[] = []
  for (const gl of gradeLevels) {
    if (gl.streams.length > 0) {
      for (const s of gl.streams) {
        const key = `${gl.gradeLevelId}:${s.tenantStreamId}`
        if (!selectedKeys.has(key)) continue
        targets.push({
          key,
          gradeLevelId: gl.id,
          gradeId: gl.gradeLevelId,
          gradeName: gl.displayName || gl.name,
          streamId: s.tenantStreamId,
          streamName: s.name,
          label: `${gl.displayName || gl.name} — ${s.name}`,
        })
      }
    } else {
      const key = `${gl.gradeLevelId}:`
      if (!selectedKeys.has(key)) continue
      targets.push({
        key,
        gradeLevelId: gl.id,
        gradeId: gl.gradeLevelId,
        gradeName: gl.displayName || gl.name,
        label: gl.displayName || gl.name,
      })
    }
  }
  return targets
}

export function scopeSummaryLabel(targets: TimetableScopeTarget[]): string {
  if (targets.length === 0) return 'None selected'
  if (targets.length <= 2) return targets.map((t) => t.label).join(', ')
  return `${targets.length} timetables (${targets.slice(0, 2).map((t) => t.label).join(', ')}…)`
}

export function timetableBlockMatchesScope(
  block: { gradeLevel?: { id: string }; stream?: { id: string } | null },
  gradeId: string,
  streamId: string | null | undefined,
  tenantGradeLevelId?: string,
): boolean {
  const blockGradeId = block.gradeLevel?.id
  const matchesGrade =
    blockGradeId === gradeId ||
    (!!tenantGradeLevelId && blockGradeId === tenantGradeLevelId)
  if (!matchesGrade) return false
  const blockStreamId = block.stream?.id ?? null
  if (streamId) {
    if (blockStreamId) return blockStreamId === streamId
    return true
  }
  return !blockStreamId
}

export function mapGradeLevelsForSchoolType(
  items: Array<{
    id: string
    isActive?: boolean
    shortName?: string | null
    sortOrder?: number
    gradeLevel?: { id: string; name: string }
    tenantStreams?: Array<{ id: string; stream?: { id: string; name: string } }>
  }>,
): GradeLevelWithStreams[] {
  return items
    .filter((item) => item.isActive !== false)
    .map((item) => {
      const name = item.gradeLevel?.name || item.shortName || 'Unknown'
      return {
        id: item.id,
        gradeLevelId: item.gradeLevel?.id || item.id,
        name,
        displayName: item.shortName || name,
        streams: (item.tenantStreams ?? [])
          .filter((ts) => ts.id && ts.stream?.name)
          .map((ts) => ({
            tenantStreamId: ts.id,
            name: ts.stream!.name,
          })),
      }
    })
    .sort((a, b) => (a.displayName || a.name).localeCompare(b.displayName || b.name))
}

export function mapGradesToTenantLevelIds(
  grades: Array<{ id: string; tenantGradeLevelId?: string }>,
  selectedGradeIds: string[],
): string[] {
  return selectedGradeIds
    .map((gradeId) => {
      const grade = grades.find((g) => g.id === gradeId)
      return grade?.tenantGradeLevelId || gradeId
    })
    .filter((id): id is string => Boolean(id))
}

export function newBreakDraft(
  partial?: Partial<TimetableBreakDraft>,
): TimetableBreakDraft {
  const type = TIMETABLE_BREAK_TYPES[1]
  return {
    id: `break-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: type.value,
    label: type.label,
    icon: type.icon,
    color: type.color,
    afterPeriod: 0,
    durationMinutes: '15',
    ...partial,
  }
}

/** Sensible defaults for Kenyan-style school day */
export function suggestBreaksForPeriodCount(periodCount: number): TimetableBreakDraft[] {
  const lunchAfter = Math.min(Math.max(2, Math.floor(periodCount / 2)), periodCount)
  return [
    newBreakDraft({
      type: 'ASSEMBLY',
      label: 'Assembly',
      icon: '🏫',
      color: '#8B5CF6',
      afterPeriod: 0,
      durationMinutes: '15',
    }),
    newBreakDraft({
      type: 'SHORT_BREAK',
      label: 'Short break',
      afterPeriod: Math.min(2, periodCount),
      durationMinutes: '15',
    }),
    newBreakDraft({
      type: 'LUNCH',
      label: 'Lunch',
      icon: '🍽️',
      color: '#F59E0B',
      afterPeriod: lunchAfter,
      durationMinutes: '40',
    }),
  ]
}

export async function createWeekTemplateFromSetup(input: {
  name: string
  startTime: string
  periodCount: number
  periodDuration: number
  numberOfDays: number
  schoolDayNumbers?: number[]
  termId: string
  gradeLevelIds: string[]
  streamIds?: string[]
  replaceExisting?: boolean
}) {
  const mutation = `
    mutation CreateWeekTemplate($input: CreateWeekTemplateInput!) {
      createWeekTemplate(input: $input) {
        id
        name
        dayTemplates {
          id
          dayOfWeek
          periods { id periodNumber }
        }
      }
    }
  `

  const customDays = schoolDayNumbersForApi(
    input.numberOfDays,
    input.schoolDayNumbers,
  )

  const buildVariables = (includeSchoolDayNumbers: boolean) => ({
    input: {
      name: input.name,
      startTime: input.startTime,
      periodCount: input.periodCount,
      periodDuration: input.periodDuration,
      numberOfDays: input.numberOfDays,
      ...(includeSchoolDayNumbers && customDays?.length
        ? { schoolDayNumbers: customDays }
        : {}),
      termId: input.termId,
      gradeLevelIds: input.gradeLevelIds,
      streamIds: input.streamIds ?? [],
      replaceExisting: input.replaceExisting ?? false,
    },
  })

  const post = async (includeSchoolDayNumbers: boolean) => {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        query: mutation,
        variables: buildVariables(includeSchoolDayNumbers),
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(
        humanizeWeekTemplateError(text.slice(0, 500) || 'Failed to create week template'),
      )
    }

    return response.json() as Promise<{
      data?: { createWeekTemplate?: unknown }
      errors?: { message: string }[]
    }>
  }

  let result = await post(Boolean(customDays?.length))

  if (
    result.errors?.length &&
    customDays?.length &&
    result.errors.some((e) => /schoolDayNumbers/i.test(e.message))
  ) {
    result = await post(false)
  }

  if (result.errors?.length) {
    const raw = result.errors.map((e) => e.message).join(', ')
    throw new Error(humanizeWeekTemplateError(raw))
  }

  if (!result.data?.createWeekTemplate) {
    throw new Error('Could not create the timetable. Please try again.')
  }

  return result.data.createWeekTemplate as {
    id: string
    name: string
    dayTemplates: { id: string; dayOfWeek: number }[]
  }
}

export async function createBreaksFromSetup(
  dayTemplateId: string,
  breaks: TimetableBreakDraft[],
  applyToAllDays: boolean,
) {
  if (breaks.length === 0) return 0

  const mutations = breaks
    .map((entry, index) => {
      const alias = `break${index + 1}`
      const duration = parsePositiveInt(entry.durationMinutes) ?? 15
      const displayName =
        entry.label.trim() || defaultLabelForBreakType(entry.type)
      return `
        ${alias}: createTimetableBreak(input: {
          dayTemplateId: "${dayTemplateId}"
          name: "${displayName.replace(/"/g, '\\"')}"
          type: ${resolveBreakTypeForApi(entry.type)}
          afterPeriod: ${entry.afterPeriod}
          durationMinutes: ${duration}
          icon: "${entry.icon}"
          color: "${entry.color}"
          applyToAllDays: ${applyToAllDays}
        }) { id }
      `
    })
    .join('\n')

  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      query: `mutation CreateAllBreaks { ${mutations} }`,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to create breaks')
  }

  const result = await response.json()
  if (result.errors?.length) {
    throw new Error(result.errors.map((e: { message: string }) => e.message).join(', '))
  }

  return Object.keys(result.data ?? {}).length
}

export async function createTimetablesForScopes(input: {
  baseName: string
  startTime: string
  periodCount: number
  periodDuration: number
  numberOfDays: number
  schoolDayNumbers?: number[]
  termId: string
  targets: TimetableScopeTarget[]
  breaks: TimetableBreakDraft[]
  replaceExisting?: boolean
}): Promise<{ created: number }> {
  const { targets, breaks, replaceExisting, baseName, ...templateInput } = input
  if (targets.length === 0) {
    throw new Error('Select at least one grade or stream')
  }

  let created = 0
  let breaksApplied = false
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]
    const scopeName =
      targets.length === 1 ? baseName.trim() : `${baseName.trim()} — ${target.label}`

    const template = await createWeekTemplateFromSetup({
      ...templateInput,
      name: scopeName,
      gradeLevelIds: [target.gradeLevelId],
      streamIds: target.streamId ? [target.streamId] : [],
      replaceExisting: replaceExisting === true && i === 0,
    })

    const firstDay = template.dayTemplates?.[0]
    // Global breaks (applyToAllDays) are tenant-wide — create once, not per class.
    if (firstDay?.id && breaks.length > 0 && !breaksApplied) {
      await createBreaksFromSetup(firstDay.id, breaks, true)
      breaksApplied = true
    }
    created += 1
  }

  return { created }
}
