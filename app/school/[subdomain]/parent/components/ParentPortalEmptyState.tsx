'use client'

import { AlertCircle, Loader2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ParentPortalEmptyStateProps {
  variant: 'loading' | 'no-children' | 'error'
  error?: string | null
  onRetry?: () => void
}

export function ParentPortalEmptyState({
  variant,
  error,
  onRetry,
}: ParentPortalEmptyStateProps) {
  if (variant === 'loading') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your children…</p>
      </div>
    )
  }

  if (variant === 'error') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div>
          <p className="font-semibold text-foreground">Could not load parent portal</p>
          <p className="mt-1 text-sm text-muted-foreground">{error ?? 'Please try again.'}</p>
        </div>
        {onRetry ? (
          <Button onClick={onRetry} variant="outline">
            Try again
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Users className="h-7 w-7 text-primary" />
      </div>
      <div className="max-w-md">
        <p className="text-lg font-semibold text-foreground">No linked children yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask your school administrator to link your account to your child&apos;s profile. Once
          linked, you&apos;ll see attendance, grades, fees, and messages here.
        </p>
      </div>
    </div>
  )
}
