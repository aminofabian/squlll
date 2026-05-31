'use client'

import { useState } from 'react'
import { ArrowLeft, Megaphone, Send, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { broadcastToStudents } from '@/lib/chat/broadcast'
import { toast } from 'sonner'

interface SchoolBroadcastSectionProps {
  subdomain: string
  /** Full-page teacher flow — shows back control and page header. */
  onBack?: () => void
  /** Hide the page header (e.g. inside admin sheet). */
  compact?: boolean
}

export function SchoolBroadcastSection({
  subdomain,
  onBack,
  compact = false,
}: SchoolBroadcastSectionProps) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [lastReach, setLastReach] = useState<{
    students: number
    parents: number
  } | null>(null)

  const handleSend = async () => {
    const trimmed = content.trim()
    if (!trimmed) {
      toast.error('Enter a message to broadcast')
      return
    }
    setSending(true)
    try {
      const result = await broadcastToStudents(subdomain, trimmed)
      setLastReach({
        students: result.studentsReached,
        parents: result.parentsReached,
      })
      setContent('')
      const parts: string[] = []
      if (result.studentsReached > 0) {
        parts.push(
          `${result.studentsReached} student${result.studentsReached === 1 ? '' : 's'}`,
        )
      }
      if (result.parentsReached > 0) {
        parts.push(
          `${result.parentsReached} parent${result.parentsReached === 1 ? '' : 's'}`,
        )
      }
      toast.success(
        parts.length > 0
          ? `Announcement sent to ${parts.join(' and ')}`
          : 'No students or parents to receive this announcement',
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send announcement')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {!compact && (
        <div className="flex items-center gap-4">
          {onBack ? (
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : null}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">School Announcement</h1>
              <p className="text-sm text-muted-foreground">
                Broadcast a message to all students and parents
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="border-primary/20 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Message students &amp; parents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            rows={compact ? 6 : 8}
            placeholder="Write your announcement here. Students and parents will receive it in their messages inbox and get a live notification."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={sending}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Delivered via chat + live WebSocket push
            </p>
            <Button onClick={() => void handleSend()} disabled={sending || !content.trim()}>
              <Send className="mr-2 h-4 w-4" />
              {sending ? 'Sending…' : 'Broadcast'}
            </Button>
          </div>
          {lastReach != null ? (
            <p className="text-sm text-green-700">
              Last broadcast reached {lastReach.students} student
              {lastReach.students === 1 ? '' : 's'}
              {lastReach.parents > 0
                ? ` and ${lastReach.parents} parent${lastReach.parents === 1 ? '' : 's'}`
                : ''}
              .
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
