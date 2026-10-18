'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  fetchSchemeOfWork,
  type SchemeOfWork,
} from '@/lib/lesson-planning/api'
import { SchemeOfWorkEditor } from './SchemeOfWorkEditor'

export default function SchemeOfWorkPage() {
  const params = useParams()
  const subdomain =
    typeof params.subdomain === 'string'
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : ''
  const id =
    typeof params.id === 'string'
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : ''

  const [scheme, setScheme] = useState<SchemeOfWork | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!subdomain || !id) return
    let cancelled = false
    fetchSchemeOfWork(subdomain, id)
      .then((data) => {
        if (!cancelled) setScheme(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Could not load this scheme of work',
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
          <h1 className="mt-2 text-base font-semibold">Scheme unavailable</h1>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/teacher/schemes-of-work">
              <ArrowLeft className="size-4" />
              Back to schemes
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!scheme) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <SchemeOfWorkEditor subdomain={subdomain} initialScheme={scheme} />
}
