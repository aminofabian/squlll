'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowRight,
  Bug,
  LifeBuoy,
  Loader2,
  Send,
  Sparkles,
  Wrench,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { chatGraphqlFetch } from '@/lib/chat/graphql'
import { CHAT_CONTACTS } from '@/lib/chat/queries'
import type { ChatContact } from '@/lib/chat/types'
import { sendMessageViaGraphql } from '@/lib/chat/sendMessageViaGraphql'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface SupportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subdomain: string
}

const TOPICS = [
  {
    id: 'bug',
    label: 'Report a bug',
    prefix: 'Bug report',
    icon: Bug,
  },
  {
    id: 'feature',
    label: 'Request a feature',
    prefix: 'Feature request',
    icon: Sparkles,
  },
  {
    id: 'change',
    label: 'Request a change',
    prefix: 'Change request',
    icon: Wrench,
  },
  {
    id: 'help',
    label: 'Get help',
    prefix: 'Help request',
    icon: LifeBuoy,
  },
] as const

type TopicId = (typeof TOPICS)[number]['id']

export function SupportDialog({
  open,
  onOpenChange,
  subdomain,
}: SupportDialogProps) {
  const router = useRouter()
  const [topic, setTopic] = useState<TopicId>('help')
  const [message, setMessage] = useState('')
  const [support, setSupport] = useState<ChatContact | null>(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !subdomain) return
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await chatGraphqlFetch<{ chatContacts: ChatContact[] }>(
          CHAT_CONTACTS,
          {},
          subdomain,
        )
        const contact =
          data.chatContacts?.find((item) => item.type === 'superadmin') ?? null
        if (!cancelled) {
          setSupport(contact)
          if (!contact) {
            setError(
              'Squl Technical Support is not available for this school yet. Please contact your school admin.',
            )
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Could not reach platform support.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [open, subdomain])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setMessage('')
      setTopic('help')
      setError(null)
      setSupport(null)
    }
    onOpenChange(next)
  }

  const handleSend = async () => {
    const trimmed = message.trim()
    const selectedTopic = TOPICS.find((item) => item.id === topic) ?? TOPICS[3]
    if (!trimmed || !support || sending) return

    setSending(true)
    setError(null)
    try {
      const sent = await sendMessageViaGraphql(subdomain, {
        recipientType: 'SUPERADMIN',
        recipientId: support.id,
        content: `[${selectedTopic.prefix}]\n${trimmed}`,
      })
      toast.success('Message sent to platform support. Replies will appear in Messages.')
      handleOpenChange(false)
      router.push(`/communication?conversationId=${sent.conversationId}`)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not send your message.'
      setError(message)
      toast.error(message)
    } finally {
      setSending(false)
    }
  }

  const selectedTopic = TOPICS.find((item) => item.id === topic) ?? TOPICS[3]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 [&_[data-slot=dialog-close]]:text-white [&_[data-slot=dialog-close]]:opacity-80 [&_[data-slot=dialog-close]]:hover:text-white [&_[data-slot=dialog-close]]:focus:ring-white/40 sm:max-w-md">
        <DialogHeader className="space-y-0 border-b border-slate-100 bg-[#0a1f1a] px-4 py-4 text-left dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center border border-white/15 bg-white/10 text-emerald-200">
              <LifeBuoy className="h-4.5 w-4.5" />
            </span>
            <div>
              <DialogTitle className="text-sm font-semibold text-white">
                Talk to Squl Technical Support
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[11px] text-white/60">
                Report a bug, request a feature or change, or ask for help.
                You&apos;re messaging Squl&apos;s technical support team.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 px-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting to support…
            </div>
          ) : (
            <>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  What do you need?
                </p>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  {TOPICS.map((item) => {
                    const Icon = item.icon
                    const active = topic === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTopic(item.id)}
                        className={cn(
                          'flex items-center gap-1.5 border px-2 py-2 text-left text-[11px] font-medium transition-colors',
                          active
                            ? 'border-primary/30 bg-primary/[0.07] text-primary'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-primary/25 hover:bg-primary/[0.04] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                        )}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <Textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={5}
                  maxLength={2000}
                  placeholder={`${selectedTopic.label}… describe what happened, what you'd like changed, or what you need help with.`}
                  className="resize-none text-sm"
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  {support
                    ? 'Goes directly to Squl Technical Support.'
                    : 'Squl Technical Support is not available right now.'}
                </p>
              </div>

              {error ? (
                <div className="flex items-start gap-1.5 border border-destructive/25 bg-destructive/5 px-2.5 py-2 text-[11px] text-destructive">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/communication"
                  onClick={() => handleOpenChange(false)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                >
                  Open my Messages
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <Button
                  type="button"
                  className="h-9 gap-1.5 bg-[#0a1f1a] text-xs text-white hover:bg-[#246a59]"
                  disabled={!support || !message.trim() || sending}
                  onClick={() => void handleSend()}
                >
                  {sending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Send to Squl support
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
