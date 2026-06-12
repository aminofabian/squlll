/**
 * Default exam paper components per subject (Kenyan curriculum patterns).
 * Used when building exam sessions — each subject can have multiple papers.
 */

export type PaperComponentId =
  | 'PAPER_1'
  | 'PAPER_2'
  | 'PAPER_3'
  | 'COMPOSITION'
  | 'PRACTICAL'
  | 'ORAL'
  | 'LISTENING'
  | 'WRITTEN'
  | (string & {})

export interface PaperComponentTemplate {
  id: PaperComponentId
  label: string
  defaultDurationMinutes: number
  defaultMaxScore?: number
}

export interface PaperComponentSelection {
  id: PaperComponentId
  label: string
  enabled: boolean
  durationMinutes: number
}

export function paperComponentKey(subjectId: string, componentId: string): string {
  return `${subjectId}:${componentId}`
}

function matchSubject(
  subjectName: string,
  subjectCode: string | undefined,
  patterns: { codes?: string[]; names?: string[] },
): boolean {
  const code = (subjectCode ?? '').toUpperCase().trim()
  const name = subjectName.toLowerCase()

  if (patterns.codes?.some((c) => code === c || code.startsWith(c))) {
    return true
  }
  return patterns.names?.some((n) => name.includes(n)) ?? false
}

const ENGLISH_COMPONENTS: PaperComponentTemplate[] = [
  { id: 'PAPER_1', label: 'Paper 1', defaultDurationMinutes: 120 },
  { id: 'PAPER_2', label: 'Paper 2', defaultDurationMinutes: 120 },
  { id: 'COMPOSITION', label: 'Composition', defaultDurationMinutes: 40 },
  { id: 'ORAL', label: 'Oral', defaultDurationMinutes: 15 },
]

const SCIENCES_COMPONENTS: PaperComponentTemplate[] = [
  { id: 'PAPER_1', label: 'Paper 1', defaultDurationMinutes: 120 },
  { id: 'PAPER_2', label: 'Paper 2', defaultDurationMinutes: 120 },
  { id: 'PRACTICAL', label: 'Practical', defaultDurationMinutes: 150 },
]

const SINGLE_PAPER: PaperComponentTemplate[] = [
  { id: 'PAPER_1', label: 'Paper 1', defaultDurationMinutes: 120 },
]

const DUAL_PAPER: PaperComponentTemplate[] = [
  { id: 'PAPER_1', label: 'Paper 1', defaultDurationMinutes: 120 },
  { id: 'PAPER_2', label: 'Paper 2', defaultDurationMinutes: 120 },
]

const SUBJECT_COMPONENT_RULES: Array<{
  match: { codes?: string[]; names?: string[] }
  components: PaperComponentTemplate[]
  defaultEnabled?: PaperComponentId[]
}> = [
  {
    match: { codes: ['ENG'], names: ['english'] },
    components: ENGLISH_COMPONENTS,
    defaultEnabled: ['PAPER_1', 'PAPER_2', 'COMPOSITION'],
  },
  {
    match: { codes: ['KIS', 'KSW'], names: ['kiswahili', 'swahili'] },
    components: [
      { id: 'PAPER_1', label: 'Paper 1', defaultDurationMinutes: 120 },
      { id: 'PAPER_2', label: 'Paper 2', defaultDurationMinutes: 120 },
      { id: 'COMPOSITION', label: 'Insha', defaultDurationMinutes: 40 },
      { id: 'ORAL', label: 'Lugha', defaultDurationMinutes: 15 },
    ],
    defaultEnabled: ['PAPER_1', 'PAPER_2', 'COMPOSITION'],
  },
  {
    match: { codes: ['PHY'], names: ['physics'] },
    components: SCIENCES_COMPONENTS,
    defaultEnabled: ['PAPER_1', 'PAPER_2', 'PRACTICAL'],
  },
  {
    match: { codes: ['CHE', 'CHM'], names: ['chemistry'] },
    components: SCIENCES_COMPONENTS,
    defaultEnabled: ['PAPER_1', 'PAPER_2', 'PRACTICAL'],
  },
  {
    match: { codes: ['BIO'], names: ['biology'] },
    components: SCIENCES_COMPONENTS,
    defaultEnabled: ['PAPER_1', 'PAPER_2', 'PRACTICAL'],
  },
  {
    match: { codes: ['AGR'], names: ['agriculture'] },
    components: [
      ...DUAL_PAPER,
      { id: 'PRACTICAL', label: 'Practical', defaultDurationMinutes: 120 },
    ],
    defaultEnabled: ['PAPER_1', 'PAPER_2', 'PRACTICAL'],
  },
  {
    match: { codes: ['COM', 'ICT'], names: ['computer', 'ict'] },
    components: [
      { id: 'PAPER_1', label: 'Paper 1 (Theory)', defaultDurationMinutes: 120 },
      { id: 'PRACTICAL', label: 'Practical', defaultDurationMinutes: 150 },
    ],
    defaultEnabled: ['PAPER_1', 'PRACTICAL'],
  },
  {
    match: { codes: ['HSC'], names: ['home science'] },
    components: [
      ...DUAL_PAPER,
      { id: 'PRACTICAL', label: 'Practical', defaultDurationMinutes: 150 },
    ],
    defaultEnabled: ['PAPER_1', 'PAPER_2', 'PRACTICAL'],
  },
  {
    match: { names: ['mathematics', 'math'] },
    components: [
      { id: 'PAPER_1', label: 'Paper 1', defaultDurationMinutes: 150 },
      { id: 'PAPER_2', label: 'Paper 2', defaultDurationMinutes: 150 },
    ],
    defaultEnabled: ['PAPER_1', 'PAPER_2'],
  },
  {
    match: { names: ['history', 'government', 'geography', 'cre', 'ire', 'hre'] },
    components: DUAL_PAPER,
    defaultEnabled: ['PAPER_1', 'PAPER_2'],
  },
  {
    match: { names: ['business', 'economics', 'accounting'] },
    components: DUAL_PAPER,
    defaultEnabled: ['PAPER_1', 'PAPER_2'],
  },
]

export function getPaperComponentsForSubject(
  subjectName: string,
  subjectCode?: string,
): PaperComponentTemplate[] {
  for (const rule of SUBJECT_COMPONENT_RULES) {
    if (matchSubject(subjectName, subjectCode, rule.match)) {
      return rule.components
    }
  }
  return SINGLE_PAPER
}

export function defaultPaperSelectionsForSubject(
  subjectName: string,
  subjectCode?: string,
): PaperComponentSelection[] {
  const templates = getPaperComponentsForSubject(subjectName, subjectCode)
  const rule = SUBJECT_COMPONENT_RULES.find((r) =>
    matchSubject(subjectName, subjectCode, r.match),
  )
  const enabledSet = new Set(
    rule?.defaultEnabled ?? templates.map((t) => t.id),
  )

  return templates.map((t) => ({
    id: t.id,
    label: t.label,
    enabled: enabledSet.has(t.id),
    durationMinutes: t.defaultDurationMinutes,
  }))
}

/** Extra paper types users can add beyond subject defaults. */
export const EXTRA_PAPER_TEMPLATES: PaperComponentTemplate[] = [
  { id: 'PAPER_3', label: 'Paper 3', defaultDurationMinutes: 120 },
  { id: 'WRITTEN', label: 'Written', defaultDurationMinutes: 120 },
  { id: 'LISTENING', label: 'Listening', defaultDurationMinutes: 30 },
  { id: 'ORAL', label: 'Oral', defaultDurationMinutes: 15 },
  { id: 'PRACTICAL', label: 'Practical', defaultDurationMinutes: 150 },
  { id: 'COMPOSITION', label: 'Composition', defaultDurationMinutes: 40 },
]

export function allTemplatesForSubject(
  subjectName: string,
  subjectCode?: string,
): PaperComponentTemplate[] {
  const defaults = getPaperComponentsForSubject(subjectName, subjectCode)
  const seen = new Set(defaults.map((t) => t.id))
  const extras = EXTRA_PAPER_TEMPLATES.filter((t) => !seen.has(t.id))
  return [...defaults, ...extras]
}

export function addableTemplates(
  subjectName: string,
  subjectCode: string | undefined,
  existing: PaperComponentSelection[],
): PaperComponentTemplate[] {
  const taken = new Set(existing.map((c) => c.id))
  return allTemplatesForSubject(subjectName, subjectCode).filter(
    (t) => !taken.has(t.id),
  )
}

export function createCustomPaperSelection(
  label: string,
  durationMinutes = 60,
): PaperComponentSelection {
  const slug = label
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .slice(0, 24)
  return {
    id: `CUSTOM_${slug || 'PAPER'}`,
    label: label.trim() || 'Custom paper',
    enabled: true,
    durationMinutes,
  }
}

export function addTemplateToSelection(
  components: PaperComponentSelection[],
  template: PaperComponentTemplate,
): PaperComponentSelection[] {
  if (components.some((c) => c.id === template.id)) return components
  return [
    ...components,
    {
      id: template.id,
      label: template.label,
      enabled: true,
      durationMinutes: template.defaultDurationMinutes,
    },
  ]
}

export function removeFromSelection(
  components: PaperComponentSelection[],
  componentId: string,
): PaperComponentSelection[] {
  return components.filter((c) => c.id !== componentId)
}

export function paperExistsInSession(
  papers: Array<{
    tenantGradeLevelId: string
    tenantSubjectId: string
    paperComponent?: string | null
  }>,
  gradeId: string,
  subjectId: string,
  componentId: string,
): boolean {
  return papers.some(
    (p) =>
      p.tenantGradeLevelId === gradeId &&
      p.tenantSubjectId === subjectId &&
      (p.paperComponent ?? 'PAPER_1') === componentId,
  )
}

export function formatPaperDisplayName(
  subjectName: string,
  paperLabel?: string | null,
): string {
  if (!paperLabel || paperLabel === 'Paper 1') {
    const components = getPaperComponentsForSubject(subjectName)
    if (components.length === 1) return subjectName
  }
  if (!paperLabel) return subjectName
  return `${subjectName} — ${paperLabel}`
}

export type ExamPrintSubjectLabelMode = 'full' | 'code'

/** Print timetable label — full subject name or subject code */
export function formatPrintPaperLabel(
  subjectName: string,
  subjectCode: string | undefined,
  paperLabel: string | null | undefined,
  mode: ExamPrintSubjectLabelMode,
): string {
  if (mode === 'full') {
    return formatPaperDisplayName(subjectName, paperLabel)
  }

  const code = (subjectCode ?? '').trim().toUpperCase()
  const base = code || subjectName
  if (!paperLabel || paperLabel === 'Paper 1') {
    const components = getPaperComponentsForSubject(subjectName)
    if (components.length === 1) return base
  }
  if (!paperLabel) return base
  return `${base} — ${paperLabel}`
}
