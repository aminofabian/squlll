'use client'

import { useParams, useRouter } from 'next/navigation'
import { Award, CalendarDays, GraduationCap, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStudentReportCard } from '@/lib/student/useStudentReportCard'
import {
  EmptyState,
  PageHeader,
  Section,
  StateMessage,
  StudentPage,
} from '../_ui'

export default function StudentReportCardsPage() {
  const params = useParams()
  const router = useRouter()
  const subdomain =
    typeof params.subdomain === 'string'
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : ''

  const { reportCard, academicYear, loading, error, refetch } =
    useStudentReportCard(subdomain)

  return (
    <StudentPage>
      <PageHeader
        title="Report Card"
        subtitle={
          academicYear
            ? `Academic year ${academicYear}`
            : 'Current academic year'
        }
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
            <StateMessage variant="loading" title="Loading report card…" />
          </Section>
        ) : error ? (
          <Section>
            <StateMessage
              variant="error"
              description={error}
              onRetry={() => void refetch()}
            />
          </Section>
        ) : !reportCard ? (
          <Section>
            <EmptyState
              icon={Award}
              title="No report card available yet"
              description="Results will appear here once assessments are graded."
            />
          </Section>
        ) : (
          <>
            <Section bodyClassName="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Student
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                  {reportCard.studentName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {reportCard.admissionNumber} · {reportCard.gradeLevel}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Overall grade
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-primary">
                  {reportCard.overallGrade}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(reportCard.overallAverage)}% average
                </p>
              </div>
            </Section>

            {reportCard.termPerformances.length > 0 && (
              <Section title="Term summary" icon={CalendarDays}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {reportCard.termPerformances.map((term) => (
                    <div
                      key={`${term.academicYear}-${term.term}`}
                      className="rounded-lg border border-border p-4"
                    >
                      <p className="text-sm font-medium text-muted-foreground">
                        Term {term.term}
                      </p>
                      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                        {term.grade}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(term.percentage)}% · {term.totalAssessments}{' '}
                        assessments
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Subject breakdown" icon={GraduationCap}>
              <div className="space-y-3">
                {reportCard.allSubjects.map((subject) => (
                  <div
                    key={subject.subjectId}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {subject.subjectName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {subject.assessmentsCount} assessment
                        {subject.assessmentsCount === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">
                        {Math.round(subject.percentage)}%
                      </span>
                      <Badge variant="secondary">{subject.grade}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}
      </div>
    </StudentPage>
  )
}
