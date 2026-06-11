'use client'

import {
  Award,
  GraduationCap,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useParentChildReportCard } from '@/lib/parent/useParentChildReportCard'
import type { ParentPortalChild } from '@/lib/parent/types'

interface ParentReportCardSectionProps {
  subdomain: string
  child?: ParentPortalChild
}

function gradeFromAverage(average: number): string {
  if (average >= 80) return 'A'
  if (average >= 75) return 'A-'
  if (average >= 70) return 'B+'
  if (average >= 65) return 'B'
  if (average >= 60) return 'B-'
  if (average >= 55) return 'C+'
  if (average >= 50) return 'C'
  if (average >= 45) return 'C-'
  if (average >= 40) return 'D+'
  return 'D'
}

export function ParentReportCardSection({
  subdomain,
  child,
}: ParentReportCardSectionProps) {
  const studentId = child?.studentId ?? null
  const isDemo = !studentId || studentId.startsWith('demo-')
  const { reportCard, academicYear, term, loading, error, refetch } =
    useParentChildReportCard(subdomain, isDemo ? null : studentId)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary via-primary to-primary/80 p-6 text-white shadow-2xl md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black md:text-4xl">Report Card</h1>
            <p className="text-sm text-white/90 md:text-base">
              {child
                ? `${child.name} · Term ${term}${academicYear ? ` · ${academicYear}` : ''}`
                : 'Academic report'}
            </p>
          </div>
          {!isDemo ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void refetch()}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          ) : null}
        </div>
      </div>

      {isDemo ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Link a child to your parent account to view report cards.
        </p>
      ) : null}

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {loading && !reportCard ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : null}

      {!loading && !isDemo && reportCard && reportCard.subjects.length === 0 ? (
        <Card className="border-primary/20">
          <CardContent className="py-12 text-center text-muted-foreground">
            No assessment marks for this term yet. Results will appear when exams are graded.
          </CardContent>
        </Card>
      ) : null}

      {!isDemo && reportCard && reportCard.subjects.length > 0 ? (
        <>
          <Card className="border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5 text-primary" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-lg">{reportCard.student.name}</p>
                <p className="text-sm text-muted-foreground">
                  {reportCard.student.admissionNumber} · {reportCard.student.grade}
                  {reportCard.student.stream ? ` · ${reportCard.student.stream}` : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  {gradeFromAverage(reportCard.overallAverage)}
                </p>
                <p className="text-sm font-medium">
                  {Math.round(reportCard.overallAverage)}% average
                </p>
                <p className="text-xs text-muted-foreground">
                  {reportCard.totalSubjects} subject{reportCard.totalSubjects === 1 ? '' : 's'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-primary" />
                Subject Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportCard.subjects.map((subject) => (
                <div
                  key={subject.subject}
                  className="rounded-lg border border-primary/10 p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{subject.subject}</p>
                    <Badge variant="secondary">
                      {Math.round(subject.average)}% · {gradeFromAverage(subject.average)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {subject.scores.map((score, index) => (
                      <div
                        key={`${subject.subject}-${score.type}-${index}`}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">{score.type}</span>
                        <span className="font-medium">
                          {score.score}/{score.maxScore}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
