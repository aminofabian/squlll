'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fetchLessonPlan, type LessonPlan } from '@/lib/lesson-planning/api'
import { LessonPlanEditor } from './LessonPlanEditor'

export default function TeacherLessonPlanPage() {
  const params = useParams()
  const subdomain =
    typeof params.subdomain === 'string'
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : ''
  const id =
    typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : ''

  const [plan, setPlan] = useState<LessonPlan | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!subdomain || !id) return
    let cancelled = false
    fetchLessonPlan(subdomain, id)
      .then((data) => {
        if (!cancelled) setPlan(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Could not load this lesson plan',
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [subdomain, id])

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <AlertCircle className="mx-auto size-5 text-rose-500" />
          <h1 className="mt-2 text-base font-semibold">Plan unavailable</h1>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/teacher/lesson-plans">
              <ArrowLeft className="size-4" />
              Back to lesson plans
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <LessonPlanEditor
      subdomain={subdomain}
      termId={plan.termId}
      initialPlan={plan}
    />
  )
}
