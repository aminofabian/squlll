import type { ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Download,
  Lock,
  XCircle,
} from 'lucide-react'
import { RichText } from '@/lib/content/rich-text'
import type { FigureScene } from '@/lib/content/types'

/**
 * Illustrative product-UI figures for the CBC & academic management cluster.
 *
 * These are deliberately drawn in the DOM rather than shipped as raster
 * screenshots: the copy stays legible on every screen, the labels can be
 * updated with policy changes, and no real learner data is ever exposed.
 */

const LEVELS: Record<string, string> = {
  EE: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  ME: 'border-[#cfe6dc] bg-[#e8f5f0] text-[#1d5547]',
  AE: 'border-amber-200 bg-amber-50 text-amber-800',
  BE: 'border-rose-200 bg-rose-50 text-rose-700',
  '—': 'border-[#1a4d42]/15 bg-[#f6faf8] text-[#1a4d42]/45',
}

const PILLS: Record<string, string> = {
  green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
  red: 'border-rose-200 bg-rose-50 text-rose-700',
  neutral: 'border-[#1a4d42]/15 bg-[#f6faf8] text-[#1a4d42]/65',
  dark: 'border-white/15 bg-white/10 text-white/80',
}

function Pill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: keyof typeof PILLS | string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] ${PILLS[tone] ?? PILLS.neutral}`}
    >
      {children}
    </span>
  )
}

function Level({ code }: { code: string }) {
  return (
    <span
      className={`inline-flex min-w-8 justify-center border px-1.5 py-0.5 font-mono text-[10px] font-semibold ${LEVELS[code] ?? LEVELS['—']}`}
    >
      {code}
    </span>
  )
}

function Meter({ value, tone = 'green' }: { value: number; tone?: 'green' | 'amber' | 'red' }) {
  const fill =
    tone === 'amber' ? 'bg-[#c08a3e]' : tone === 'red' ? 'bg-rose-500' : 'bg-[#1d5547]'
  return (
    <div className="h-1.5 w-full overflow-hidden bg-[#1a4d42]/10" aria-hidden>
      <div className={`h-full ${fill}`} style={{ width: `${value}%` }} />
    </div>
  )
}

function Frame({
  label,
  title,
  meta,
  children,
}: {
  label: string
  title: string
  meta?: string
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden border border-[#1a4d42]/15 bg-white shadow-[0_22px_50px_-34px_rgba(10,31,26,0.45)]">
        <div className="flex items-center gap-1.5 border-b border-[#1a4d42]/10 bg-[#0a1f1a] px-3 py-2.5 sm:px-4">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="ml-2 truncate font-ui text-[10px] font-semibold tracking-wide text-emerald-300">
            {label}
          </span>
          <span className="ml-auto hidden shrink-0 font-ui text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35 sm:block">
            Illustrative UI
          </span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#1a4d42]/10 bg-[#f6faf8] px-4 py-3">
          <div className="min-w-0">
            <p className="font-ui text-[9px] font-semibold uppercase tracking-[0.16em] text-[#1a4d42]/55">
              {title}
            </p>
            <p className="mt-0.5 truncate text-[13px] font-semibold text-[#0a1f1a]">
              {meta ?? 'CBC assessment record'}
            </p>
          </div>
          <Pill tone="green">Term 3 · 2026</Pill>
        </div>

        <div className="p-3.5 sm:p-5">{children}</div>
    </div>
  )
}

function Stat({
  label,
  value,
  note,
  tone = 'dark',
}: {
  label: string
  value: string
  note?: string
  tone?: 'dark' | 'green' | 'amber' | 'red'
}) {
  const valueTone =
    tone === 'amber'
      ? 'text-amber-700'
      : tone === 'red'
        ? 'text-rose-700'
        : tone === 'green'
          ? 'text-[#1d5547]'
          : 'text-[#0a1f1a]'
  return (
    <div className="border border-[#1a4d42]/12 bg-[#fbfdfc] p-3">
      <p className="font-ui text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/55">
        {label}
      </p>
      <p className={`mt-1 font-mono text-[1.35rem] font-semibold leading-none ${valueTone}`}>
        {value}
      </p>
      {note ? <p className="mt-1.5 text-[10px] leading-snug text-[#1a4d42]/60">{note}</p> : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

const WORKFLOW = [
  { title: 'Classroom evidence', text: 'Observation, project, task or test', count: '212 learners' },
  { title: 'School record', text: 'Strand, level, date, teacher, evidence', count: '96% captured' },
  { title: 'KNEC CBA portal', text: 'SBA scores uploaded and verified', count: '4 missing' },
  { title: 'Reports', text: 'Report cards, KPSEA/KJSEA, board pack', count: 'Ready' },
]

function AssessmentWorkflow() {
  return (
    <Frame
      label="CBC · Assessment workflow"
      title="One record, four audiences"
      meta="Grade 8 · Term 3 · 212 learners"
    >
      <div className="grid gap-2 sm:grid-cols-4">
        {WORKFLOW.map((step, index) => (
          <div key={step.title} className="relative border border-[#1a4d42]/12 bg-[#fbfdfc] p-3">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[9px] font-semibold text-[#a98a55]">0{index + 1}</p>
              {index < WORKFLOW.length - 1 ? (
                <ArrowRight className="hidden h-3 w-3 text-[#1a4d42]/25 sm:block" aria-hidden />
              ) : null}
            </div>
            <p className="mt-1.5 text-[11px] font-semibold leading-snug text-[#0a1f1a]">
              {step.title}
            </p>
            <p className="mt-1 text-[10px] leading-snug text-[#1a4d42]/60">{step.text}</p>
            <p className="mt-2 font-mono text-[10px] text-[#1d5547]">{step.count}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#1a4d42]/10 pt-3">
        <Pill tone="green">
          <CheckCircle2 className="h-3 w-3" aria-hidden /> 204 of 212 complete
        </Pill>
        <Pill tone="amber">
          <Clock3 className="h-3 w-3" aria-hidden /> 8 records need evidence
        </Pill>
        <span className="ml-auto text-[10px] text-[#1a4d42]/55">Last saved 14:22 · A. Wanjiru</span>
      </div>
    </Frame>
  )
}

const TERMS = [
  {
    term: 'Term 1',
    window: 'Jan – Apr',
    items: ['Baseline assessment', 'Strand mapping', 'Term 1 report cards'],
  },
  {
    term: 'Term 2',
    window: 'May – Aug',
    items: ['SBA projects & practicals', 'Moderation', 'Mid-year review'],
  },
  {
    term: 'Term 3',
    window: 'Sep – Oct',
    items: ['SBA written tests', 'Upload & verify scores', 'KPSEA / KJSEA', 'Final reports'],
  },
]

function TermCalendar() {
  return (
    <Frame
      label="CBC · Assessment calendar"
      title="The assessment year"
      meta="Three terms, two national assessment points"
    >
      <div className="grid gap-2 sm:grid-cols-3">
        {TERMS.map((term) => (
          <div key={term.term} className="border border-[#1a4d42]/12 bg-[#fbfdfc] p-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-[#0a1f1a]">{term.term}</p>
              <Pill>{term.window}</Pill>
            </div>
            <ul className="mt-2 space-y-1.5">
              {term.items.map((item) => (
                <li key={item} className="flex gap-1.5 text-[10px] leading-snug text-[#1a4d42]/70">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#a98a55]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="border border-[#1a4d42]/15 bg-[#0a1f1a] p-3 text-white">
          <p className="font-ui text-[9px] uppercase tracking-[0.14em] text-emerald-300/80">
            Grade 6 · national
          </p>
          <p className="mt-1 text-[11px] font-semibold">KPSEA</p>
          <p className="mt-0.5 text-[10px] text-white/55">SBA in Grades 4–6 + national assessment</p>
        </div>
        <div className="border border-[#1a4d42]/15 bg-[#0a1f1a] p-3 text-white">
          <p className="font-ui text-[9px] uppercase tracking-[0.14em] text-emerald-300/80">
            Grade 9 · national
          </p>
          <p className="mt-1 text-[11px] font-semibold">KJSEA</p>
          <p className="mt-0.5 text-[10px] text-white/55">KPSEA + Grades 7–8 SBA + Grade 9 assessment</p>
        </div>
      </div>
    </Frame>
  )
}

const RUBRIC_ROWS = [
  { learner: 'Brian Otieno', levels: ['EE', 'ME', 'EE', 'EE'], done: '4/4' },
  { learner: 'Grace Wambui', levels: ['ME', 'ME', 'ME', 'ME'], done: '4/4' },
  { learner: 'Kevin Mwenda', levels: ['AE', 'AE', 'ME', '—'], done: '3/4' },
  { learner: 'Faith Njeri', levels: ['EE', 'EE', 'EE', 'EE'], done: '4/4' },
  { learner: 'Samuel Kiptoo', levels: ['ME', 'AE', 'ME', 'ME'], done: '4/4' },
]

function RubricGrid() {
  return (
    <Frame
      label="CBC · Strand capture"
      title="Rubrics without a workbook"
      meta="Grade 7 · Mathematics · Strand: Numbers"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="bg-[#efeadd]">
              {['Learner', 'Place value', 'Fractions', 'Decimals', 'Ratios', 'Captured'].map(
                (header) => (
                  <th
                    key={header}
                    className="border-b border-[#1a4d42]/15 px-2.5 py-2 font-ui text-[9px] font-semibold uppercase tracking-[0.12em] text-[#14201b]"
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {RUBRIC_ROWS.map((row, index) => (
              <tr key={row.learner} className={index % 2 ? 'bg-[#f7f4ec]' : 'bg-white'}>
                <td className="border-b border-[#1a4d42]/8 px-2.5 py-2 text-[11px] font-medium text-[#0a1f1a]">
                  {row.learner}
                </td>
                {row.levels.map((level, levelIndex) => (
                  <td key={levelIndex} className="border-b border-[#1a4d42]/8 px-2.5 py-2">
                    <Level code={level} />
                  </td>
                ))}
                <td className="border-b border-[#1a4d42]/8 px-2.5 py-2 font-mono text-[10px] text-[#1a4d42]/60">
                  {row.done}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="min-w-[180px] flex-1">
          <div className="flex items-center justify-between text-[10px] text-[#1a4d42]/60">
            <span>Strand completion</span>
            <span className="font-mono">18 / 20</span>
          </div>
          <div className="mt-1.5">
            <Meter value={90} tone="amber" />
          </div>
        </div>
        <Pill tone="amber">
          <AlertTriangle className="h-3 w-3" aria-hidden /> 2 sub-strands missing
        </Pill>
      </div>
    </Frame>
  )
}

function FormativeSummative() {
  return (
    <Frame
      label="CBC · Assessment types"
      title="Two purposes, one learner record"
      meta="Grade 8 East · Term 3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-[#1a4d42]/15">
          <div className="border-b border-[#1a4d42]/12 bg-[#e8f5f0] px-3 py-2">
            <p className="text-[11px] font-semibold text-[#0a1f1a]">Formative · for learning</p>
            <p className="text-[10px] text-[#1a4d42]/60">Ongoing, low stakes, used to adjust teaching</p>
          </div>
          <div className="space-y-2 p-3">
            {[
              ['Week 3', 'Fractions task', 'ME'],
              ['Week 5', 'Group project', 'EE'],
              ['Week 7', 'Oral reading', 'AE'],
            ].map(([week, task, level]) => (
              <div key={task} className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-[9px] text-[#1a4d42]/45">{week}</p>
                  <p className="text-[11px] text-[#0a1f1a]">{task}</p>
                </div>
                <Level code={level} />
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[#1a4d42]/15">
          <div className="border-b border-[#1a4d42]/12 bg-[#efeadd] px-3 py-2">
            <p className="text-[11px] font-semibold text-[#0a1f1a]">Summative · of learning</p>
            <p className="text-[10px] text-[#1a4d42]/60">End of cycle, reported, used for progression</p>
          </div>
          <div className="space-y-2 p-3">
            {[
              ['Term 3 exam', 'Mathematics', 'EE'],
              ['SBA written test', 'Integrated Science', 'ME'],
              ['End-of-term exam', 'Social Studies', 'AE'],
            ].map(([label, task, level]) => (
              <div key={task} className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-[9px] text-[#1a4d42]/45">{label}</p>
                  <p className="text-[11px] text-[#0a1f1a]">{task}</p>
                </div>
                <Level code={level} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 border-t border-[#1a4d42]/10 pt-2.5 text-[10px] text-[#1a4d42]/60">
        Formative evidence does not disappear at term end — it is the audit trail behind the
        summative level.
      </p>
    </Frame>
  )
}

const REPORT_ROWS = [
  ['Mathematics', '8 / 8', 'EE'],
  ['English', '7 / 8', 'ME'],
  ['Integrated Science', '8 / 8', 'ME'],
  ['Social Studies', '6 / 8', 'AE'],
  ['Pre-Technical Studies', '8 / 8', 'EE'],
]

function ReportCard() {
  return (
    <Frame
      label="CBC · Report card"
      title="Rendered, not retyped"
      meta="Mwangaza Junior School · Grade 8 East"
    >
      <div className="border border-[#1a4d42]/15 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#1a4d42]/12 bg-[#0a1f1a] px-3.5 py-3 text-white">
          <div>
            <p className="font-ui text-[9px] uppercase tracking-[0.16em] text-emerald-300/80">
              Term 3 report card
            </p>
            <p className="mt-0.5 text-[13px] font-semibold">Brian Otieno · ADM 2043</p>
            <p className="text-[10px] text-white/50">Grade 8 East · Class teacher: A. Wanjiru</p>
          </div>
          <Pill tone="dark">
            <Lock className="h-3 w-3" aria-hidden /> Locked 18 Oct
          </Pill>
        </div>

        <div className="grid grid-cols-1 gap-3 p-3.5 sm:grid-cols-[1fr_120px]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[300px] border-collapse text-left">
              <thead>
                <tr>
                  {['Learning area', 'Strands', 'Level'].map((header) => (
                    <th
                      key={header}
                      className="border-b border-[#1a4d42]/12 px-1.5 py-1.5 font-ui text-[8px] font-semibold uppercase tracking-[0.12em] text-[#1a4d42]/55"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REPORT_ROWS.map(([area, strands, level]) => (
                  <tr key={area}>
                    <td className="border-b border-[#1a4d42]/8 px-1.5 py-1.5 text-[10px] text-[#0a1f1a]">
                      {area}
                    </td>
                    <td className="border-b border-[#1a4d42]/8 px-1.5 py-1.5 font-mono text-[9px] text-[#1a4d42]/60">
                      {strands}
                    </td>
                    <td className="border-b border-[#1a4d42]/8 px-1.5 py-1.5">
                      <Level code={level} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <div className="border border-[#1a4d42]/12 bg-[#f6faf8] p-2">
              <p className="font-ui text-[8px] uppercase tracking-[0.12em] text-[#1a4d42]/55">
                Attendance
              </p>
              <p className="mt-0.5 font-mono text-[15px] font-semibold text-[#0a1f1a]">94%</p>
            </div>
            <div className="border border-[#1a4d42]/12 bg-[#f6faf8] p-2">
              <p className="font-ui text-[8px] uppercase tracking-[0.12em] text-[#1a4d42]/55">
                Next step
              </p>
              <p className="mt-0.5 text-[9px] leading-snug text-[#1a4d42]/70">
                More practice on ratio word problems.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-[#1a4d42]/10 bg-[#f6faf8] px-3.5 py-2.5">
          <span className="text-[10px] text-[#1a4d42]/60">42 learners · 42 ready</span>
          <span className="ml-auto inline-flex items-center gap-1 border border-[#1a4d42]/20 bg-white px-2 py-1 font-mono text-[9px] font-semibold text-[#1d5547]">
            <Download className="h-3 w-3" aria-hidden /> Print all
          </span>
        </div>
      </div>
    </Frame>
  )
}

const STREAM_ROWS = [
  ['Grade 7', 'East', '42', '42', '0', 'Locked'],
  ['Grade 7', 'West', '40', '38', '2', 'In review'],
  ['Grade 7', 'North', '38', '31', '7', 'Open'],
  ['Grade 8', 'East', '44', '44', '0', 'Locked'],
  ['Grade 8', 'West', '43', '43', '0', 'Locked'],
]

function StreamsMatrix() {
  return (
    <Frame
      label="CBC · Multi-stream records"
      title="Every stream, one standard"
      meta="Grade 7–8 · 207 learners · 5 streams"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className="bg-[#efeadd]">
              {['Grade', 'Stream', 'Learners', 'Captured', 'Missing', 'Status'].map((header) => (
                <th
                  key={header}
                  className="border-b border-[#1a4d42]/15 px-2.5 py-2 font-ui text-[9px] font-semibold uppercase tracking-[0.12em] text-[#14201b]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STREAM_ROWS.map((row, index) => (
              <tr key={`${row[0]}-${row[1]}`} className={index % 2 ? 'bg-[#f7f4ec]' : 'bg-white'}>
                <td className="border-b border-[#1a4d42]/8 px-2.5 py-2 font-mono text-[10px] text-[#1a4d42]/70">
                  {row[0]}
                </td>
                <td className="border-b border-[#1a4d42]/8 px-2.5 py-2 text-[11px] font-medium text-[#0a1f1a]">
                  {row[1]}
                </td>
                {row.slice(2, 5).map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border-b border-[#1a4d42]/8 px-2.5 py-2 font-mono text-[10px] text-[#1a4d42]/70"
                  >
                    {cell}
                  </td>
                ))}
                <td className="border-b border-[#1a4d42]/8 px-2.5 py-2">
                  <Pill tone={row[5] === 'Locked' ? 'green' : row[5] === 'In review' ? 'amber' : 'neutral'}>
                    {row[5]}
                  </Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#1a4d42]/10 pt-3">
        <p className="text-[10px] text-[#1a4d42]/60">
          Moderation: one rubric, three class teachers, same sub-strands.
        </p>
        <Pill tone="amber">9 records to chase</Pill>
      </div>
    </Frame>
  )
}

const TRANSFER_STEPS = [
  ['Requested', '14 Oct · 09:10', 'Done'],
  ['Cleared', '14 Oct · 11:40', 'Done'],
  ['Exported', '14 Oct · 12:05', 'Done'],
  ['Imported', '14 Oct · 12:19', 'Done'],
  ['Verified', '14 Oct · 14:02', 'Done'],
]

function TransferRecord() {
  return (
    <Frame
      label="CBC · Learner transfer"
      title="The record travels with the learner"
      meta="Brian Otieno · Grade 8 · Mid-term transfer"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border border-[#1a4d42]/12 bg-[#f6faf8] px-3 py-2.5">
        <div>
          <p className="text-[11px] font-semibold text-[#0a1f1a]">From: Mwangaza Junior School</p>
          <p className="text-[10px] text-[#1a4d42]/60">To: St. Mary’s Junior School · UPI 2019-044-8821</p>
        </div>
        <Pill tone="green">
          <CheckCircle2 className="h-3 w-3" aria-hidden /> Imported
        </Pill>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <div>
          <p className="font-ui text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/55">
            Transfer timeline
          </p>
          <ol className="mt-2 space-y-2">
            {TRANSFER_STEPS.map(([step, time, status], index) => (
              <li key={step} className="flex items-center gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1d5547] font-mono text-[8px] font-semibold text-white">
                  {index + 1}
                </span>
                <span className="text-[11px] text-[#0a1f1a]">{step}</span>
                <span className="ml-auto font-mono text-[9px] text-[#1a4d42]/45">{time}</span>
                <Pill tone={status === 'Done' ? 'green' : 'neutral'}>{status}</Pill>
              </li>
            ))}
          </ol>
        </div>

        <div className="border border-[#1a4d42]/12 bg-[#fbfdfc] p-2.5">
          <p className="font-ui text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/55">
            Record package
          </p>
          <ul className="mt-2 space-y-1.5">
            {[
              'Profile & UPI',
              'Grade 7–8 assessment history',
              'Evidence samples',
              'Attendance record',
              'Transfer letter',
            ].map((item) => (
              <li key={item} className="flex items-start gap-1.5 text-[10px] text-[#1a4d42]/70">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[#1d5547]" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-3 flex items-start gap-1.5 border-t border-[#1a4d42]/10 pt-2.5 text-[10px] leading-snug text-[#8a5a1f]">
        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
        If the learner is a KPSEA or KJSEA candidate, confirm the assessment centre and SBA
        ownership before either school uploads.
      </p>
    </Frame>
  )
}

function KpseaKjsea() {
  return (
    <Frame
      label="CBC · National reports"
      title="What the numbers mean"
      meta="KPSEA (Grade 6) · KJSEA (Grade 9)"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-[#1a4d42]/12 p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-[#0a1f1a]">KPSEA</p>
            <Pill tone="green">Grade 6</Pill>
          </div>
          <div className="mt-2 flex h-5 overflow-hidden border border-[#1a4d42]/10">
            <div className="flex w-[20%] items-center justify-center bg-[#1d5547] font-mono text-[8px] text-white">
              20
            </div>
            <div className="flex w-[20%] items-center justify-center bg-[#2f6b5a] font-mono text-[8px] text-white">
              20
            </div>
            <div className="flex w-[20%] items-center justify-center bg-[#4b8a76] font-mono text-[8px] text-white">
              20
            </div>
            <div className="flex w-[40%] items-center justify-center bg-[#c9b48b] font-mono text-[8px] text-[#3d2f18]">
              40
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1 text-[9px] text-[#1a4d42]/60">
            <span>Grade 4 SBA · 20%</span>
            <span>Grade 5 SBA · 20%</span>
            <span>Grade 6 SBA · 20%</span>
            <span>National · 40%</span>
          </div>
        </div>

        <div className="border border-[#1a4d42]/12 p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-[#0a1f1a]">KJSEA</p>
            <Pill tone="green">Grade 9</Pill>
          </div>
          <div className="mt-2 flex h-5 overflow-hidden border border-[#1a4d42]/10">
            <div className="flex w-[20%] items-center justify-center bg-[#1d5547] font-mono text-[8px] text-white">
              20
            </div>
            <div className="flex w-[20%] items-center justify-center bg-[#4b8a76] font-mono text-[8px] text-white">
              20
            </div>
            <div className="flex w-[60%] items-center justify-center bg-[#c9b48b] font-mono text-[8px] text-[#3d2f18]">
              60
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1 text-[9px] text-[#1a4d42]/60">
            <span>KPSEA · 20%</span>
            <span>Grade 7–8 SBA · 20%</span>
            <span>Grade 9 national · 60%</span>
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-[#1a4d42]/10 pt-3">
        <div className="flex items-center justify-between">
          <p className="font-ui text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/55">
            KJSEA reporting scale
          </p>
          <Pill>Illustrative distribution</Pill>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {[
            ['EE', '28%'],
            ['ME', '46%'],
            ['AE', '19%'],
            ['BE', '7%'],
          ].map(([level, value]) => (
            <div key={level} className="border border-[#1a4d42]/10 bg-[#fbfdfc] p-2">
              <div className="flex items-center justify-between">
                <Level code={level} />
                <span className="font-mono text-[10px] text-[#1a4d42]/70">{value}</span>
              </div>
              <div className="mt-1.5">
                <Meter value={parseInt(value, 10) * 2} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-[#1a4d42]/60">
          Reported by learning area. No aggregate, no mean score, no school ranking.
        </p>
      </div>
    </Frame>
  )
}

const PORTAL_ROWS = [
  ['Candidate register', 'Grade 9 · 212 candidates', 'Current', 'Download'],
  ['SBA upload status', 'Grades 7–8 · 208 of 212', '4 missing', 'Review'],
  ['Assessment summary', 'Grade 9 · all learning areas', 'Ready', 'Download'],
  ['Candidate result slips', '2025 cohort · archived', 'Archived', 'Download'],
]

function KnecPortal() {
  return (
    <Frame
      label="cba.knec.ac.ke · School portal"
      title="School CBA portal"
      meta="Mwangaza Junior School · 2026"
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1a4d42]/12 pb-2.5">
        {['Candidates', 'SBA upload', 'Reports', 'Verification'].map((tab) => (
          <span
            key={tab}
            className={`border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] ${
              tab === 'Reports'
                ? 'border-[#1d5547] bg-[#1d5547] text-white'
                : 'border-[#1a4d42]/15 bg-[#f6faf8] text-[#1a4d42]/55'
            }`}
          >
            {tab}
          </span>
        ))}
        <Pill tone="amber" >
          <AlertTriangle className="h-3 w-3" aria-hidden /> 4 missing scores
        </Pill>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className="bg-[#efeadd]">
              {['Report', 'Scope', 'Status', 'Action'].map((header) => (
                <th
                  key={header}
                  className="border-b border-[#1a4d42]/15 px-2.5 py-2 font-ui text-[9px] font-semibold uppercase tracking-[0.12em] text-[#14201b]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PORTAL_ROWS.map((row, index) => (
              <tr key={row[0]} className={index % 2 ? 'bg-[#f7f4ec]' : 'bg-white'}>
                <td className="border-b border-[#1a4d42]/8 px-2.5 py-2 text-[10px] font-medium text-[#0a1f1a]">
                  {row[0]}
                </td>
                <td className="border-b border-[#1a4d42]/8 px-2.5 py-2 text-[10px] text-[#1a4d42]/60">
                  {row[1]}
                </td>
                <td className="border-b border-[#1a4d42]/8 px-2.5 py-2">
                  <Pill tone={row[2] === 'Ready' || row[2] === 'Current' ? 'green' : 'amber'}>
                    {row[2]}
                  </Pill>
                </td>
                <td className="border-b border-[#1a4d42]/8 px-2.5 py-2">
                  <span className="inline-flex items-center gap-1 font-mono text-[9px] font-semibold text-[#1d5547]">
                    <Download className="h-3 w-3" aria-hidden /> {row[3]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[9px] leading-snug text-[#1a4d42]/50">
        Portal labels and layouts change between releases. Use this as a mental model, then
        follow the current KNEC user manual for exact clicks.
      </p>
    </Frame>
  )
}

const EXAM_SLOTS = [
  ['08:00 – 10:00', 'Mathematics P1', 'English', 'Integrated Science', 'Kiswahili', 'Mathematics P2'],
  ['11:00 – 12:30', 'Pre-Technical', 'Social Studies', 'Agriculture', 'CRE / IRE', 'Creative Arts'],
  ['14:00 – 15:30', '—', 'Practical · Lab 2', '—', 'Practical · Lab 1', '—'],
]

function ExamTimetable() {
  return (
    <Frame
      label="CBC · Exam timetable"
      title="Clashes resolved before printing"
      meta="Grade 8 · End of Term 3 · 19–23 Oct"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left">
          <thead>
            <tr className="bg-[#efeadd]">
              <th className="border-b border-[#1a4d42]/15 px-2 py-2 font-ui text-[9px] font-semibold uppercase tracking-[0.12em] text-[#14201b]">
                Time
              </th>
              {['Mon 19', 'Tue 20', 'Wed 21', 'Thu 22', 'Fri 23'].map((day) => (
                <th
                  key={day}
                  className="border-b border-[#1a4d42]/15 px-2 py-2 font-ui text-[9px] font-semibold uppercase tracking-[0.12em] text-[#14201b]"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EXAM_SLOTS.map((row, index) => (
              <tr key={row[0]} className={index % 2 ? 'bg-[#f7f4ec]' : 'bg-white'}>
                <td className="border-b border-[#1a4d42]/8 px-2 py-2 font-mono text-[9px] text-[#1a4d42]/60">
                  {row[0]}
                </td>
                {row.slice(1).map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`border-b border-[#1a4d42]/8 px-2 py-2 text-[10px] ${
                      cell.startsWith('Practical')
                        ? 'bg-[#fdf6e8] font-medium text-[#8a5a1f]'
                        : cell === '—'
                          ? 'text-[#1a4d42]/25'
                          : 'text-[#0a1f1a]'
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="border border-[#1a4d42]/12 bg-[#fbfdfc] p-2">
          <p className="font-ui text-[8px] uppercase tracking-[0.12em] text-[#1a4d42]/55">
            Venues
          </p>
          <p className="mt-0.5 text-[10px] text-[#0a1f1a]">Hall A · Lab 1 · Lab 2</p>
        </div>
        <div className="border border-[#1a4d42]/12 bg-[#fbfdfc] p-2">
          <p className="font-ui text-[8px] uppercase tracking-[0.12em] text-[#1a4d42]/55">
            Invigilators
          </p>
          <p className="mt-0.5 text-[10px] text-[#0a1f1a]">12 assigned · 0 double-booked</p>
        </div>
        <div className="border border-[#1a4d42]/12 bg-[#fbfdfc] p-2">
          <p className="font-ui text-[8px] uppercase tracking-[0.12em] text-[#1a4d42]/55">
            SBA window
          </p>
          <p className="mt-0.5 text-[10px] text-[#0a1f1a]">Upload by 23 Oct · 16:00</p>
        </div>
      </div>
    </Frame>
  )
}

const PROGRESS = [
  { grade: 'Grade 6', label: 'KPSEA', level: 'ME', note: 'Primary exit profile' },
  { grade: 'Grade 7', label: 'Baseline', level: 'ME', note: 'Junior school entry' },
  { grade: 'Grade 8', label: 'Growth', level: 'EE', note: 'Strand coverage 88%' },
  { grade: 'Grade 9', label: 'KJSEA', level: 'EE', note: 'Senior school ready' },
]

function Progress69() {
  return (
    <Frame
      label="CBC · Learner progress"
      title="A trajectory, not a snapshot"
      meta="Brian Otieno · Grade 6 → Grade 9"
    >
      <div className="grid gap-2 sm:grid-cols-4">
        {PROGRESS.map((stage, index) => (
          <div key={stage.grade} className="relative border border-[#1a4d42]/12 bg-[#fbfdfc] p-3">
            {index < PROGRESS.length - 1 ? (
              <ArrowRight
                className="absolute -right-[7px] top-1/2 hidden h-3 w-3 -translate-y-1/2 text-[#1a4d42]/25 sm:block"
                aria-hidden
              />
            ) : null}
            <p className="font-ui text-[9px] font-semibold uppercase tracking-[0.12em] text-[#1a4d42]/50">
              {stage.grade}
            </p>
            <div className="mt-1.5 flex items-center justify-between gap-1">
              <p className="text-[11px] font-semibold text-[#0a1f1a]">{stage.label}</p>
              <Level code={stage.level} />
            </div>
            <p className="mt-1 text-[9px] leading-snug text-[#1a4d42]/60">{stage.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-[#1a4d42]/10 pt-3">
        <div className="flex items-center justify-between">
          <p className="font-ui text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/55">
            Strand coverage by year
          </p>
          <Pill>Illustrative</Pill>
        </div>
        <div className="mt-2 space-y-1.5">
          <div className="grid grid-cols-[110px_repeat(3,1fr)] gap-x-2">
            <span />
            {['Grade 7', 'Grade 8', 'Grade 9'].map((grade) => (
              <span
                key={grade}
                className="text-right font-ui text-[8px] uppercase tracking-[0.08em] text-[#1a4d42]/45"
              >
                {grade}
              </span>
            ))}
          </div>
          {[
            ['Mathematics', 58, 74, 91],
            ['English', 51, 66, 84],
            ['Integrated Science', 46, 68, 86],
          ].map(([subject, ...values]) => (
            <div
              key={subject as string}
              className="grid grid-cols-[110px_repeat(3,1fr)] items-center gap-x-2"
            >
              <span className="text-[10px] text-[#0a1f1a]">{subject as string}</span>
              {(values as number[]).map((value, index) => (
                <div key={index}>
                  <div className="h-1.5 overflow-hidden bg-[#f1ece0]" aria-hidden>
                    <div
                      className="h-full bg-[#1d5547]"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-right font-mono text-[8px] text-[#1a4d42]/50">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Pill tone="green">Attendance 94%</Pill>
          <Pill tone="amber">2 evidence gaps</Pill>
          <Pill>Reviewed 18 Oct</Pill>
        </div>
      </div>
    </Frame>
  )
}

const AUDIT_ROWS = [
  ['Duplicate UPI', '2 learners share a UPI prefix', 'warn', 'Merge or correct'],
  ['Missing sub-strand', '4 learners missing a level', 'fail', 'Capture evidence'],
  ['Level outside scale', 'All levels in EE–BE', 'pass', '—'],
  ['Term / year mismatch', 'All records in Term 3, 2026', 'pass', '—'],
  ['Stream mismatch', '1 learner moved streams mid-term', 'warn', 'Reassign class'],
  ['Evidence attached', '206 of 212 records have evidence', 'warn', 'Attach evidence'],
  ['Duplicate admission number', 'No duplicate admission numbers found', 'pass', '—'],
  ['Guardian contact', 'All active learners have a guardian phone', 'pass', '—'],
]

const AUDIT_ICON = {
  pass: CheckCircle2,
  warn: AlertTriangle,
  fail: XCircle,
} as const

const AUDIT_STYLE = {
  pass: 'text-[#1d5547]',
  warn: 'text-[#b7791f]',
  fail: 'text-rose-600',
} as const

function DataAudit() {
  return (
    <Frame
      label="CBC · Data quality"
      title="Pre-upload audit"
      meta="212 records · 8 checks · 3 need review"
    >
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Records" value="212" />
        <Stat label="Records passed" value="206" tone="green" note="97%" />
        <Stat label="Records to review" value="6" tone="amber" note="Before upload" />
      </div>

      <div className="mt-3 overflow-hidden border border-[#1a4d42]/12">
        {AUDIT_ROWS.map(([check, detail, status, action], index) => {
          const Icon = AUDIT_ICON[status as keyof typeof AUDIT_ICON]
          return (
            <div
              key={check}
              className={`flex flex-wrap items-center gap-2 px-2.5 py-2 ${
                index % 2 ? 'bg-[#f7f4ec]' : 'bg-white'
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 shrink-0 ${AUDIT_STYLE[status as keyof typeof AUDIT_STYLE]}`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-[#0a1f1a]">{check}</p>
                <p className="text-[9px] text-[#1a4d42]/55">{detail}</p>
              </div>
              <span className="font-mono text-[9px] text-[#1a4d42]/55">{action}</span>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[9px] text-[#1a4d42]/55">Audit run 20 Oct · 13:58 · by J. Mwangi</p>
        <span className="inline-flex items-center gap-1 border border-[#1a4d42] bg-[#1d5547] px-2 py-1 font-mono text-[9px] font-semibold text-white">
          Review 6 records <ArrowRight className="h-3 w-3" aria-hidden />
        </span>
      </div>
    </Frame>
  )
}

const SCENES: Record<FigureScene, () => ReactNode> = {
  'assessment-workflow': AssessmentWorkflow,
  'term-calendar': TermCalendar,
  'cbc-rubric-grid': RubricGrid,
  'formative-summative': FormativeSummative,
  'report-card': ReportCard,
  'streams-matrix': StreamsMatrix,
  'transfer-record': TransferRecord,
  'kpsea-kjsea': KpseaKjsea,
  'knec-portal': KnecPortal,
  'exam-timetable': ExamTimetable,
  'progress-6-9': Progress69,
  'data-audit': DataAudit,
}

export function ProductFigure({
  scene,
  caption,
}: {
  scene: FigureScene
  caption?: string
}) {
  const Scene = SCENES[scene]
  if (!Scene) return null

  return (
    <figure className="mt-7">
      <Scene />
      {caption ? (
        <figcaption className="mt-2.5 text-[0.8125rem] leading-relaxed text-[#1a4d42]/70">
          <RichText text={caption} />
        </figcaption>
      ) : null}
    </figure>
  )
}
