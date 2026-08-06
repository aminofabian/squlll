'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, LayoutDashboard, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getPostLoginPath } from '@/lib/auth/post-login-navigation'
import { cn, getCookie } from '@/lib/utils'

export type HomepageSession = {
  isAuthenticated: boolean
  userName: string
  firstName: string
  dashboardHref: string
}

function readHomepageSession(): HomepageSession {
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      userName: '',
      firstName: '',
      dashboardHref: '/dashboard',
    }
  }

  const userId = getCookie('userId')
  const email = getCookie('email')
  const accessToken = getCookie('accessToken')
  const rawName = getCookie('userName')
  const role = getCookie('userRole') || undefined
  const userName = rawName ? decodeURIComponent(rawName) : ''
  const firstName = userName.split(/\s+/)[0] || 'there'
  const isAuthenticated = Boolean(
    accessToken && (userId || email || userName),
  )

  return {
    isAuthenticated,
    userName,
    firstName,
    dashboardHref: getPostLoginPath(role, true),
  }
}

export function useHomepageSession(): HomepageSession {
  const [session, setSession] = useState<HomepageSession>({
    isAuthenticated: false,
    userName: '',
    firstName: '',
    dashboardHref: '/dashboard',
  })

  useEffect(() => {
    setSession(readHomepageSession())
  }, [])

  return session
}

type HomepageNavAuthActionsProps = {
  portalLabel?: string
  applyLabel?: string
  portalClassName?: string
  applyClassName?: string
  greetingClassName?: string
  className?: string
  onNavigate?: () => void
}

export function HomepageNavAuthActions({
  portalLabel = 'Portal',
  applyLabel = 'Apply now',
  portalClassName,
  applyClassName,
  greetingClassName,
  className,
  onNavigate,
}: HomepageNavAuthActionsProps) {
  const session = useHomepageSession()

  if (session.isAuthenticated) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <span
          className={cn(
            'hidden max-w-[9rem] truncate text-sm font-medium opacity-70 xl:inline',
            greetingClassName,
          )}
          title={session.userName || undefined}
        >
          Hi, {session.firstName}
        </span>
        <Button asChild className={applyClassName}>
          <Link href={session.dashboardHref} onClick={onNavigate}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Button asChild variant="outline" className={portalClassName}>
        <Link href="/login" onClick={onNavigate}>
          <LogIn className="mr-2 h-4 w-4" />
          {portalLabel}
        </Link>
      </Button>
      <Button asChild className={applyClassName}>
        <Link href="/apply" onClick={onNavigate}>
          {applyLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}

type HomepageNavAuthMobileProps = {
  portalLabel?: string
  applyLabel?: string
  onNavigate?: () => void
  linkClassName?: string
  primaryClassName?: string
}

/** Compact stacked CTAs for mobile drawers. */
export function HomepageNavAuthMobile({
  portalLabel = 'Portal',
  applyLabel = 'Apply now',
  onNavigate,
  linkClassName,
  primaryClassName,
}: HomepageNavAuthMobileProps) {
  const session = useHomepageSession()

  if (session.isAuthenticated) {
    return (
      <div className="mt-3 space-y-2 border-t border-black/10 pt-3">
        <p className="px-2 text-xs font-medium opacity-60">
          Signed in as {session.userName || session.firstName}
        </p>
        <Link
          href={session.dashboardHref}
          onClick={onNavigate}
          className={cn(
            'flex items-center justify-between px-2 py-3 text-base font-semibold',
            primaryClassName || linkClassName,
          )}
        >
          <span className="inline-flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Open dashboard
          </span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-3 space-y-2 border-t border-black/10 pt-3">
      <Link
        href="/login"
        onClick={onNavigate}
        className={cn('block px-2 py-3 text-base font-medium', linkClassName)}
      >
        {portalLabel}
      </Link>
      <Link
        href="/apply"
        onClick={onNavigate}
        className={cn(
          'flex items-center justify-between px-2 py-3 text-base font-semibold',
          primaryClassName || linkClassName,
        )}
      >
        {applyLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
