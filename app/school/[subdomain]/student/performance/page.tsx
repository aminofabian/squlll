'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { BarChart3, Percent, RefreshCw, TrendingUp, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStudentPerformance } from '@/lib/student/useStudentReportCard'
import {
  EmptyState,
  PageHeader,
  Section,
  StateMessage,
  StatTile,
  StudentPage,
} from '../_ui'

export default function StudentPerformancePage() {
  const params = useParams()
  const router = useRouter()
  const subdomain =
    typeof params.subdomain === 'string'
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : ''

  const { reportCard, ranking, academicYear, termName, loading, error, refetch } =
    useStudentPerformance(subdomain)

  const subtitle =
    academicYear && termName
      ? `${academicYear} · ${termName}`
      : academicYear
        ? academicYear
        : 'Current term'

  return (
    <StudentPage>
      <PageHeader
        title="Track Performance"
        subtitle={subtitle}
        onBack={() => router.push(`/school/${subdomain}/student`)}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      <div className="space-y-6">
        {loading ? (
          <Section>
            <StateMessage variant="loading" title="Loading performance…" />
          </Section>
        ) : error ? (
          <Section>
            <StateMessage
              variant="error"
              description={error}
              onRetry={() => void refetch()}
            />
          </Section>
        ) : (
          <>
            {ranking && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile
                  label="Class rank"
                  icon={Trophy}
                  value={
                    <>
                      {ranking.rank}
                      <span className="text-sm font-normal text-muted-foreground">
                        {' '}
                        / {ranking.totalStudents}
                      </span>
                    </>
                  }
                />
                <StatTile
                  label="Your average"
                  icon={TrendingUp}
                  value={`${Math.round(ranking.studentAverage)}%`}
                />
                <StatTile
                  label="Class average"
                  icon={BarChart3}
                  value={`${Math.round(ranking.classAverage)}%`}
                />
                <StatTile
                  label="Percentile"
                  icon={Percent}
                  value={ranking.percentile}
                  hint={`Top score ${Math.round(ranking.topScore)}%`}
                />
              </div>
            )}

            {reportCard ? (
              <Section title="Subject performance" icon={BarChart3}>
                <div className="space-y-3">
                  {reportCard.allSubjects.map((subject) => (
                    <div
                      key={subject.subjectId}
                      className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {subject.subjectName}
                        </p>
                        <div className="mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.min(subject.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      <Badge variant="secondary">{subject.grade}</Badge>
                    </div>
                  ))}
                </div>
              </Section>
            ) : (
              <Section>
                <EmptyState
                  icon={BarChart3}
                  title="No performance data yet"
                  description="Results will appear here once assessments are graded."
                />
              </Section>
            )}

            <div className="text-center">
              <Button variant="outline" asChild>
                <Link href={`/school/${subdomain}/student/report-cards`}>
                  View full report card
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </StudentPage>
  )
}
