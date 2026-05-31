'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Trophy,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStudentPerformance } from '@/lib/student/useStudentReportCard'

export default function StudentPerformancePage() {
  const params = useParams()
  const subdomain =
    typeof params.subdomain === 'string'
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : ''

  const { reportCard, ranking, academicYear, termName, loading, error, refetch } =
    useStudentPerformance(subdomain)

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
            <h1 className="text-2xl font-bold">Track Performance</h1>
            <p className="text-sm text-muted-foreground">
              {academicYear && termName
                ? `${academicYear} · ${termName}`
                : academicYear
                  ? academicYear
                  : 'Current term'}
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
        ) : (
          <>
            {ranking && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Class rank</p>
                    <p className="text-2xl font-bold">
                      {ranking.rank}
                      <span className="text-sm font-normal text-muted-foreground">
                        {' '}/ {ranking.totalStudents}
                      </span>
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Your average</p>
                    <p className="text-2xl font-bold">{Math.round(ranking.studentAverage)}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Class average</p>
                    <p className="text-2xl font-bold">{Math.round(ranking.classAverage)}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground">Percentile</p>
                    <p className="text-2xl font-bold">{ranking.percentile}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Top score {Math.round(ranking.topScore)}%
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {reportCard ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Subject performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reportCard.allSubjects.map((subject) => (
                    <div
                      key={subject.subjectId}
                      className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
                    >
                      <div>
                        <p className="font-medium">{subject.subjectName}</p>
                        <div className="mt-2 h-2 w-full max-w-xs rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(subject.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      <Badge variant="secondary">{subject.grade}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No performance data available for this term yet.
                </CardContent>
              </Card>
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
    </div>
  )
}
