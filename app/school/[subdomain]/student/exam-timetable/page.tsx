'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  Clock,
  ClipboardList,
  User,
  AlertCircle,
  RefreshCw,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStudentExamTimetable } from '@/lib/student/useStudentExamTimetable'

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
  const subdomain =
    typeof params.subdomain === 'string'
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : ''

  const { grouped, tests, loading, error, refetch } =
    useStudentExamTimetable(subdomain)

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
            <h1 className="text-2xl font-bold">Exam Timetable</h1>
            <p className="text-sm text-muted-foreground">
              Scheduled tests and exams for your grade
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
        ) : tests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center space-y-2">
              <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="font-medium">No scheduled exams</p>
              <p className="text-sm text-muted-foreground">
                Your exam timetable will appear here when teachers publish tests.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {grouped.map(({ date, tests: dayTests }) => (
              <section key={date} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  {formatDateLabel(date)}
                </div>
                <div className="space-y-3 pl-2 border-l-2 border-primary/20">
                  {dayTests.map((test) => (
                    <Card key={test.id} className="border-primary/20 ml-4">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 className="font-semibold text-lg">{test.title}</h2>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <BookOpen className="w-3.5 h-3.5" />
                              {test.subject.name}
                            </p>
                          </div>
                          <Badge variant="secondary">{test.status}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {test.startTime}
                            {test.endTime ? ` – ${test.endTime}` : ''}
                            {' · '}
                            {test.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {test.teacher.name}
                          </span>
                          <span>{test.totalMarks} marks</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
