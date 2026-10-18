import {
  CalendarClock,
  Compass,
  History,
  ListChecks,
  MessageSquareQuote,
  Target,
} from 'lucide-react'

export const EDITOR_SECTIONS = [
  {
    id: 'details',
    step: 1,
    title: 'Lesson details',
    shortTitle: 'Details',
    description: 'Pre-filled from your timetable — adjust only what differs.',
    icon: CalendarClock,
    accent: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  },
  {
    id: 'curriculum',
    step: 2,
    title: 'Curriculum alignment',
    shortTitle: 'Curriculum',
    description: 'Strand and outcomes come from your scheme of work. Refine them for this lesson.',
    icon: Compass,
    accent: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  },
  {
    id: 'activities',
    step: 3,
    title: 'Lesson flow',
    shortTitle: 'Flow',
    description: 'How the lesson unfolds, minute by minute.',
    icon: ListChecks,
    accent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  {
    id: 'assessment',
    step: 4,
    title: 'Assessment & resources',
    shortTitle: 'Assess',
    description: 'What you will use, how you check understanding, and how you adapt.',
    icon: Target,
    accent: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  },
  {
    id: 'reflection',
    step: 5,
    title: 'Post-lesson reflection',
    shortTitle: 'Reflect',
    description: 'Completed after teaching — what was covered and what needs follow-up.',
    icon: MessageSquareQuote,
    accent: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  },
  {
    id: 'history',
    step: 6,
    title: 'Review history',
    shortTitle: 'History',
    description: 'Every submission, approval, return and comment is kept.',
    icon: History,
    accent: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
  },
] as const

export type EditorSectionId = (typeof EDITOR_SECTIONS)[number]['id']
