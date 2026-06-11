'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import type { ExamSessionRecord } from '@/lib/exams/examSessions'
import { examSessionPath } from '@/lib/school/schoolRoutes'
import { SessionRankingsPanel } from './SessionRankingsPanel'
import { SessionAnalyticsPanel } from './SessionAnalyticsPanel'

interface ExamsSessionScopedPanelProps {
  subdomain: string
  sessions: ExamSessionRecord[]
  mode: 'rankings' | 'analytics'
}

export function ExamsSessionScopedPanel({
  subdomain,
  sessions,
  mode,
}: ExamsSessionScopedPanelProps) {
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? '')

  const session = sessions.find((s) => s.id === sessionId)

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-slate-500 text-center py-12">
        No exam sessions available. Create a session first.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2 min-w-[240px]">
          <Label>Exam session</Label>
          <Select value={sessionId} onValueChange={setSessionId}>
            <SelectTrigger>
              <SelectValue placeholder="Select session" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} · Term {s.term}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {session && (
          <Button variant="outline" size="sm" asChild>
            <Link href={examSessionPath(subdomain, session.id)}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open session
            </Link>
          </Button>
        )}
      </div>

      {session && mode === 'rankings' && (
        <SessionRankingsPanel
          subdomain={subdomain}
          sessionId={session.id}
          session={session}
        />
      )}

      {session && mode === 'analytics' && (
        <SessionAnalyticsPanel subdomain={subdomain} sessionId={session.id} />
      )}
    </div>
  )
}
