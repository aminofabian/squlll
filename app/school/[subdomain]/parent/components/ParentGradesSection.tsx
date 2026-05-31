'use client'

import { Award, BookOpen, ClipboardList, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useParentChildMarks } from '@/lib/parent/useParentChildMarks'
import { useParentChildAssignments } from '@/lib/parent/useParentChildAssignments'
import type { ParentPortalChild } from '@/lib/parent/types'

interface ParentGradesSectionProps {
  subdomain: string
  child?: ParentPortalChild
}

export function ParentGradesSection({
  subdomain,
  child,
}: ParentGradesSectionProps) {
  const studentId = child?.studentId ?? null
  const isDemo = !studentId || studentId.startsWith('demo-')
  const { sessions, loading, error, refetch } = useParentChildMarks(
    subdomain,
    isDemo ? null : studentId,
  )
  const {
    assignments: gradedAssignments,
    loading: assignmentsLoading,
    error: assignmentsError,
    refetch: refetchAssignments,
  } = useParentChildAssignments(subdomain, isDemo ? null : studentId)

  const recentMarks = sessions.flatMap((s) =>
    s.results.map((r) => ({
      ...r,
      sessionName: s.sessionName,
    })),
  )

  const average =
    recentMarks.length > 0
      ? Math.round(
          recentMarks.reduce((sum, m) => sum + m.percentage, 0) /
            recentMarks.length,
        )
      : 0

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary via-primary to-primary/80 p-6 text-white shadow-2xl md:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black md:text-4xl">
              Academic Performance
            </h1>
            <p className="text-sm text-white/90 md:text-base">
              {child ? `${child.name} — exam & assessment marks` : 'Grades'}
            </p>
          </div>
          {!isDemo ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                void refetch()
                void refetchAssignments()
              }}
              disabled={loading || assignmentsLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading || assignmentsLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          ) : null}
        </div>

        {!isDemo && recentMarks.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-white/80">Average score</p>
              <p className="text-3xl font-black">{average}%</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-white/80">Assessments</p>
              <p className="text-3xl font-black">{recentMarks.length}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-white/80">Sessions</p>
              <p className="text-3xl font-black">{sessions.length}</p>
            </div>
          </div>
        ) : null}
      </div>

      {isDemo ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Link a child to your parent account to see live grades.
        </p>
      ) : null}

      {error || assignmentsError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error ?? assignmentsError}
        </p>
      ) : null}

      {!isDemo ? (
        <div className="rounded-2xl border-2 border-primary/20 bg-white shadow-xl">
          <div className="border-b-2 border-primary/20 p-4 md:p-6">
            <h2 className="flex items-center gap-2 text-lg font-black text-primary md:text-xl">
              <ClipboardList className="h-5 w-5" />
              Assignment Grades
            </h2>
          </div>
          <div className="space-y-3 p-4 md:p-6">
            {assignmentsLoading && gradedAssignments.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Loading assignments…
              </p>
            ) : null}
            {!assignmentsLoading && gradedAssignments.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No graded assignments yet.
              </p>
            ) : null}
            {gradedAssignments.map((item) => (
              <div
                key={item.submissionId}
                className="flex flex-col gap-2 rounded-xl border-2 border-primary/20 p-4 hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="font-black text-slate-800">{item.subject}</p>
                    <p className="truncate text-sm text-slate-600">{item.title}</p>
                    {item.teacherName ? (
                      <p className="text-xs text-slate-500">{item.teacherName}</p>
                    ) : null}
                    {item.feedback ? (
                      <p className="mt-1 text-xs text-slate-600">{item.feedback}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">
                      {item.grade}/{item.maxScore}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(item.gradedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge>
                    {Math.round((item.grade / item.maxScore) * 100)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border-2 border-primary/20 bg-white shadow-xl">
        <div className="border-b-2 border-primary/20 p-4 md:p-6">
          <h2 className="flex items-center gap-2 text-lg font-black text-primary md:text-xl">
            <Award className="h-5 w-5" />
            Recent Grades
          </h2>
        </div>
        <div className="space-y-3 p-4 md:p-6">
          {loading && recentMarks.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Loading grades…
            </p>
          ) : null}
          {!loading && !isDemo && recentMarks.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No graded assessments yet.
            </p>
          ) : null}
          {recentMarks.slice(0, 20).map((mark) => (
            <div
              key={mark.id}
              className="flex flex-col gap-2 rounded-xl border-2 border-primary/20 p-4 hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="font-black text-slate-800">{mark.subject}</p>
                  <p className="truncate text-sm text-slate-600">{mark.title}</p>
                  <p className="text-xs text-slate-500">{mark.sessionName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:shrink-0">
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900">
                    {mark.percentage}%
                  </p>
                  <p className="text-xs text-slate-500">
                    {mark.marksScored}/{mark.totalMarks}
                  </p>
                </div>
                <Badge>{mark.grade}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
