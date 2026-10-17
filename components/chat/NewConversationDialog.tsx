'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  GraduationCap,
  LifeBuoy,
  Loader2,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { chatGraphqlFetch } from '@/lib/chat/graphql'
import { CHAT_CONTACTS } from '@/lib/chat/queries'
import type { ChatContact } from '@/lib/chat/types'
import { cn } from '@/lib/utils'
import { ChatAvatar } from './ChatAvatar'

interface NewConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subdomain: string
  onSelect: (contact: ChatContact) => void
}

const GROUP_ORDER = ['superadmin', 'admin', 'teacher', 'student', 'parent'] as const

const GROUP_META: Record<
  string,
  { label: string; description: string; icon: React.ComponentType<{ className?: string }> }
> = {
  superadmin: {
    label: 'Squl Technical Support',
    description: 'Bugs, feature requests, changes & help',
    icon: LifeBuoy,
  },
  admin: {
    label: 'School admins',
    description: 'School leadership and office',
    icon: ShieldCheck,
  },
  teacher: {
    label: 'Teachers',
    description: 'Teaching staff',
    icon: GraduationCap,
  },
  student: {
    label: 'Students',
    description: 'Learners in your school',
    icon: UserRound,
  },
  parent: {
    label: 'Parents & guardians',
    description: 'Parents and guardians in your school',
    icon: Users,
  },
}

function groupContacts(contacts: ChatContact[]): Array<{
  type: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  contacts: ChatContact[]
}> {
  const groups = new Map<string, ChatContact[]>()
  for (const contact of contacts) {
    const list = groups.get(contact.type) ?? []
    list.push(contact)
    groups.set(contact.type, list)
  }

  const order = new Map<string, number>(GROUP_ORDER.map((type, index) => [type, index]))
  return [...groups.entries()]
    .sort(
      ([a], [b]) =>
        (order.get(a) ?? GROUP_ORDER.length) - (order.get(b) ?? GROUP_ORDER.length),
    )
    .map(([type, items]) => {
      const meta = GROUP_META[type] ?? {
        label: type,
        description: 'School contacts',
        icon: Users,
      }
      return { type, ...meta, contacts: items }
    })
}

export function NewConversationDialog({
  open,
  onOpenChange,
  subdomain,
  onSelect,
}: NewConversationDialogProps) {
  const [contacts, setContacts] = useState<ChatContact[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

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
        if (!cancelled) setContacts(data.chatContacts ?? [])
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load contacts')
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter((contact) =>
      [contact.name, contact.subtitle, contact.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    )
  }, [contacts, query])

  const groups = useMemo(() => groupContacts(filtered), [filtered])
  const support = contacts.filter((contact) => contact.type === 'superadmin')

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setQuery('')
      setError(null)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="space-y-1 border-b border-border px-5 py-4 text-left">
          <DialogTitle className="text-base">New message</DialogTitle>
          <DialogDescription className="text-xs">
            Choose a teacher, student, parent, school admin or Squl Technical
            Support to start a secure conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="border-b border-border px-5 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, admission number or email…"
              className="h-9 pl-8 text-sm"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[min(26rem,60vh)] overflow-y-auto px-2 py-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading contacts…
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
              <p className="text-xs text-muted-foreground">
                Close and try again, or refresh the page.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
              <p className="text-sm font-medium">
                {query ? 'No contacts match your search' : 'No contacts available yet'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {query
                  ? 'Try a different name or admission number.'
                  : 'Teachers, students and admins will appear here as they are added.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {support.length > 0 ? (
                <div className="mx-2 rounded-xl border border-primary/20 bg-primary/[0.05] px-3 py-2.5">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <LifeBuoy className="h-3.5 w-3.5" />
                    Talk to Squl Technical Support
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    Report a bug, request a feature or change, or ask for any
                    help. Your message goes to Squl&apos;s technical support team.
                  </p>
                </div>
              ) : null}

              {groups.map((group) => {
                const Icon = group.icon
                return (
                  <section key={group.type}>
                    <div className="flex items-center gap-2 px-3 pb-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {group.label}
                      </p>
                      <span className="text-[10px] tabular-nums text-muted-foreground/60">
                        {group.contacts.length}
                      </span>
                    </div>
                    <ul className="space-y-0.5">
                      {group.contacts.map((contact) => (
                        <li key={`${contact.type}:${contact.id}`}>
                          <button
                            type="button"
                            onClick={() => {
                              onSelect(contact)
                              handleOpenChange(false)
                            }}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted',
                              contact.type === 'superadmin' && 'hover:bg-primary/[0.07]',
                            )}
                          >
                            <ChatAvatar label={contact.name} />
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-1.5">
                                <span className="truncate text-sm font-medium">
                                  {contact.name}
                                </span>
                                {contact.type === 'superadmin' ? (
                                  <LifeBuoy className="h-3 w-3 shrink-0 text-primary" />
                                ) : null}
                              </span>
                              <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                                {contact.subtitle ?? contact.email ?? 'School contact'}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
