import { BookCopy, CalendarDays, Map as MapIcon } from 'lucide-react'

export const PLANNER_TABS = [
  { value: 'week', label: 'This week', icon: CalendarDays },
  { value: 'plans', label: 'All plans', icon: BookCopy },
  { value: 'schemes', label: 'Schemes of work', icon: MapIcon },
] as const

export type PlannerTab = (typeof PLANNER_TABS)[number]['value']
