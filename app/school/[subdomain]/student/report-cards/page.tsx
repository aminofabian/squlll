'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Award,
  RefreshCw,
  AlertCircle,
  GraduationCap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStudentReportCard } from '@/lib/student/useStudentReportCard'

export default function StudentReportCardsPage() {
  const params = useParams()
  const subdomain =
    typeof params.subdomain === 'string'
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : ''

  const { reportCard, academicYear, loading, error, refetch } =
    useStudentReportCard(subdomain)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5">
      <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="p-2">
            <Link href={`/school/${subdomain}/student`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Report Card</h1>
            <p className="text-sm text-muted-foreground">
              {academicYear ? `Academic year ${academicYear}` : 'Current academic year'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="border-destructive/20">
            <CardContent className="p-8 text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => void refetch()}>Try again</Button>
            </CardContent>
          </Card>
        ) : !reportCard ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Award className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No report card available yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Results will appear here once assessments are graded.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-background">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Student</p>
                    <h2 className="text-xl font-bold">{reportCard.studentName}</h2>
                    <p className="text-sm text-muted-foreground">
                      {reportCard.admissionNumber} · {reportCard.gradeLevel}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Overall grade</p>
                    <p className="text-3xl font-bold text-primary">{reportCard.overallGrade}</p>
                    <p className="text-sm font-medium">{Math.round(reportCard.overallAverage)}% average</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {reportCard.termPerformances.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Term summary</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {reportCard.termPerformances.map((term) => (
                    <div
                      key={`${term.academicYear}-${term.term}`}
                      className="rounded-lg border border-border p-4"
                    >
                      <p className="font-semibold">Term {term.term}</p>
                      <p className="text-2xl font-bold mt-1">{term.grade}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(term.percentage)}% · {term.totalAssessments} assessments
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-5 w-5" />
                  Subject breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reportCard.allSubjects.map((subject) => (
                  <div
                    key={subject.subjectId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="font-medium">{subject.subjectName}</p>
                      <p className="text-xs text-muted-foreground">
                        {subject.assessmentsCount} assessment
                        {subject.assessmentsCount === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {Math.round(subject.percentage)}%
                      </span>
                      <Badge variant="secondary">{subject.grade}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
