'use client'

import { useParams, useRouter } from 'next/navigation'
import { BookOpen, Calendar, Clock, ClipboardList, RefreshCw, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  EmptyState,
  PageHeader,
  Section,
  StateMessage,
  StatusPill,
  StudentPage,
  type PillTone,
} from '../_ui'
import { useStudentExamTimetable } from '@/lib/student/useStudentExamTimetable'

function statusTone(status: string): PillTone {
  const s = status.toLowerCase()
  if (s.includes('cancel')) return 'danger'
  if (s.includes('complet') || s.includes('done') || s.includes('graded')) return 'success'
  if (s.includes('ongoing') || s.includes('active') || s.includes('progress')) return 'warning'
  return 'info'
}

function formatDateLabel(dateKey: string): string {
  const date = new Date(dateKey)
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function StudentExamTimetablePage() {
  const params = useParams()
  const router = useRouter()
  const subdomain =
    typeof params.subdomain === 'string'
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : ''

  const { grouped, tests, loading, error, refetch } =
    useStudentExamTimetable(subdomain)

  const refreshButton = (
    <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={loading}>
      <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
      Refresh
    </Button>
  )

  return (
    <StudentPage>
      <PageHeader
        title="Exam Timetable"
        subtitle="Scheduled tests and exams for your grade"
        onBack={() => router.push(`/school/${subdomain}/student`)}
        actions={refreshButton}
      />

      {loading ? (
        <Section padded={false}>
          <StateMessage variant="loading" title="Loading exam timetable…" />
        </Section>
      ) : error ? (
        <Section padded={false}>
          <StateMessage
            variant="error"
            title="Couldn't load the exam timetable"
            description={error}
            onRetry={() => void refetch()}
          />
        </Section>
      ) : tests.length === 0 ? (
        <Section padded={false}>
          <EmptyState
            icon={ClipboardList}
            title="No scheduled exams"
            description="Your exam timetable will appear here when teachers publish tests."
          />
        </Section>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ date, tests: dayTests }) => (
            <Section key={date} title={formatDateLabel(date)} icon={Calendar}>
              <ul className="divide-y divide-border">
                {dayTests.map((test) => (
                  <li
                    key={test.id}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <h3 className="truncate text-sm font-semibold text-foreground">
                        {test.title}
                      </h3>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5" />
                        {test.subject.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {test.startTime}
                          {test.endTime ? ` – ${test.endTime}` : ''}
                          {' · '}
                          {test.duration} min
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="h-4 w-4" />
                          {test.teacher.fullName}
                        </span>
                        <span>{test.totalMarks} marks</span>
                      </div>
                    </div>
                    <StatusPill tone={statusTone(test.status)} className="self-start">
                      {test.status}
                    </StatusPill>
                  </li>
                ))}
              </ul>
            </Section>
          ))}
        </div>
      )}
    </StudentPage>
  )
}
