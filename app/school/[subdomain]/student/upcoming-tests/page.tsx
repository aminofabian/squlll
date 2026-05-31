'use client'

import { useCallback, useEffect, useState } from 'react'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'
import { fetchMyUpcomingTests } from '@/lib/student/studentTests'
import type { StudentTestApi } from '@/lib/student/types'

export default function StudentUpcomingTestsPage() {
  const params = useParams()
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
    setError(null)
    try {
      const upcoming = await fetchMyUpcomingTests(subdomain)
      setTests(upcoming)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load upcoming tests')
      setTests([])
    }
  }, [subdomain])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void load().finally(() => {
      if (!cancelled) setLoading(false)
    })
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
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5">
      <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="p-2">
            <Link href={`/school/${subdomain}/student`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Upcoming Tests</h1>
            <p className="text-sm text-muted-foreground">
              Tests scheduled in the next 7 days
            </p>
          </div>
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
              <Button onClick={() => void load()}>Try again</Button>
            </CardContent>
          </Card>
        ) : tests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center space-y-2">
              <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="font-medium">No upcoming tests</p>
              <p className="text-sm text-muted-foreground">
                You have no tests scheduled for the next week.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => (
              <Card key={test.id} className="border-primary/20">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-lg">{test.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {test.subject.name}
                      </p>
                    </div>
                    <Badge variant="secondary">{test.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(test.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {test.startTime}
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
        )}
      </div>
    </div>
  )
}
