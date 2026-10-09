'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, ClipboardList, Clock, User } from 'lucide-react'
import {
  EmptyState,
  PageHeader,
  Section,
  StateMessage,
  StatusPill,
  StudentPage,
  type PillTone,
} from '../_ui'
import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'
import { fetchMyUpcomingTests } from '@/lib/student/studentTests'
import type { StudentTestApi } from '@/lib/student/types'

function statusTone(status: string): PillTone {
  const s = status.toLowerCase()
  if (s.includes('cancel')) return 'danger'
  if (s.includes('complet') || s.includes('done') || s.includes('graded')) return 'success'
  if (s.includes('ongoing') || s.includes('active') || s.includes('progress')) return 'warning'
  return 'info'
}

export default function StudentUpcomingTestsPage() {
  const params = useParams()
  const router = useRouter()
  const subdomain =
    typeof params.subdomain === 'string'
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : ''

  const [tests, setTests] = useState<StudentTestApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!subdomain) return
    try {
      const upcoming = await fetchMyUpcomingTests(subdomain)
      setError(null)
      setTests(upcoming)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load upcoming tests')
      setTests([])
    }
  }, [subdomain])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        await load()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [load])

  useDomainRealtime({
    onAssignmentPublished: () => {
      void load()
    },
    onExamPublished: () => {
      void load()
    },
  })

  return (
    <StudentPage>
      <PageHeader
        title="Upcoming Tests"
        subtitle="Tests scheduled in the next 7 days"
        onBack={() => router.push(`/school/${subdomain}/student`)}
      />

      {loading ? (
        <Section padded={false}>
          <StateMessage variant="loading" title="Loading tests…" />
        </Section>
      ) : error ? (
        <Section padded={false}>
          <StateMessage
            variant="error"
            title="Couldn't load tests"
            description={error}
            onRetry={() => void load()}
          />
        </Section>
      ) : tests.length === 0 ? (
        <Section padded={false}>
          <EmptyState
            icon={ClipboardList}
            title="No upcoming tests"
            description="You have no tests scheduled for the next week."
          />
        </Section>
      ) : (
        <Section
          title="Scheduled tests"
          description={`${tests.length} test${tests.length === 1 ? '' : 's'} this week`}
          icon={ClipboardList}
        >
          <ul className="divide-y divide-border">
            {tests.map((test) => (
              <li
                key={test.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <h3 className="truncate text-sm font-semibold text-foreground">
                    {test.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{test.subject.name}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {new Date(test.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {test.startTime}
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
      )}
    </StudentPage>
  )
}
