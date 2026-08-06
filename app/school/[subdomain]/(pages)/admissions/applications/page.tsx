'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { gql } from 'graphql-request'
import {
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  Phone,
  Search,
  UserRoundPlus,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { graphqlClient } from '@/lib/graphql-client'
import { SCHOOL_SHELL } from '@/lib/school/schoolShell'

const LIST_QUERY = gql`
  query AdmissionApplications {
    admissionApplications {
      id
      reference
      status
      studentFirstName
      studentLastName
      dateOfBirth
      gender
      programme
      startTerm
      currentSchool
      guardianName
      relationship
      guardianEmail
      guardianPhone
      interests
      whyUs
      notes
      adminNotes
      createdAt
      updatedAt
    }
  }
`

const UPDATE_MUTATION = gql`
  mutation UpdateAdmissionApplication($input: UpdateAdmissionApplicationInput!) {
    updateAdmissionApplication(input: $input) {
      id
      status
      adminNotes
      updatedAt
    }
  }
`

export type ApplicationStatus =
  | 'new'
  | 'reviewing'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'

export type AdmissionApplication = {
  id: string
  reference: string
  status: ApplicationStatus
  studentFirstName: string
  studentLastName: string
  dateOfBirth: string
  gender: string | null
  programme: string
  startTerm: string
  currentSchool: string | null
  guardianName: string
  relationship: string
  guardianEmail: string
  guardianPhone: string
  interests: string[] | null
  whyUs: string | null
  notes: string | null
  adminNotes: string | null
  createdAt: string
  updatedAt: string
}

const STATUS_META: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  new: {
    label: 'New',
    className: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  reviewing: {
    label: 'Reviewing',
    className: 'bg-amber-50 text-amber-900 border-amber-200',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  },
  rejected: {
    label: 'Declined',
    className: 'bg-rose-50 text-rose-900 border-rose-200',
  },
  withdrawn: {
    label: 'Withdrawn',
    className: 'bg-slate-50 text-slate-700 border-slate-200',
  },
}

const PROGRAMME_LABELS: Record<string, string> = {
  'early-years': 'Early Years',
  primary: 'Primary',
  'junior-secondary': 'Junior Secondary',
  'senior-secondary': 'Senior Secondary',
}

const TERM_LABELS: Record<string, string> = {
  'sep-2026': 'September 2026',
  'jan-2027': 'January 2027',
  'apr-2027': 'April 2027',
  'sep-2027': 'September 2027',
}

function studentName(app: AdmissionApplication) {
  return `${app.studentFirstName} ${app.studentLastName}`.trim()
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

export default function AdmissionsApplicationsPage() {
  const [apps, setApps] = useState<AdmissionApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>(
    'all',
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await graphqlClient.request<{
        admissionApplications: AdmissionApplication[]
      }>(LIST_QUERY)
      setApps(data.admissionApplications || [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load applications',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const selected = useMemo(
    () => apps.find((a) => a.id === selectedId) ?? null,
    [apps, selectedId],
  )

  useEffect(() => {
    setAdminNotes(selected?.adminNotes || '')
  }, [selected?.id, selected?.adminNotes])

  const filtered = useMemo(() => {
    let list = apps
    if (statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (a) =>
          studentName(a).toLowerCase().includes(q) ||
          a.reference.toLowerCase().includes(q) ||
          a.guardianName.toLowerCase().includes(q) ||
          a.guardianEmail.toLowerCase().includes(q) ||
          a.programme.toLowerCase().includes(q),
      )
    }
    return list
  }, [apps, search, statusFilter])

  const counts = useMemo(() => {
    const base = {
      all: apps.length,
      new: 0,
      reviewing: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0,
    }
    for (const a of apps) base[a.status] += 1
    return base
  }, [apps])

  const updateStatus = async (status: ApplicationStatus) => {
    if (!selected) return
    setSaving(true)
    try {
      const data = await graphqlClient.request<{
        updateAdmissionApplication: Pick<
          AdmissionApplication,
          'id' | 'status' | 'adminNotes' | 'updatedAt'
        >
      }>(UPDATE_MUTATION, {
        input: { id: selected.id, status, adminNotes },
      })
      const updated = data.updateAdmissionApplication
      setApps((prev) =>
        prev.map((a) =>
          a.id === updated.id
            ? {
                ...a,
                status: updated.status,
                adminNotes: updated.adminNotes,
                updatedAt: updated.updatedAt,
              }
            : a,
        ),
      )
      toast.success(`Marked as ${STATUS_META[status].label.toLowerCase()}`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not update application',
      )
    } finally {
      setSaving(false)
    }
  }

  const saveNotes = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const data = await graphqlClient.request<{
        updateAdmissionApplication: Pick<
          AdmissionApplication,
          'id' | 'status' | 'adminNotes' | 'updatedAt'
        >
      }>(UPDATE_MUTATION, {
        input: { id: selected.id, adminNotes },
      })
      const updated = data.updateAdmissionApplication
      setApps((prev) =>
        prev.map((a) =>
          a.id === updated.id
            ? {
                ...a,
                adminNotes: updated.adminNotes,
                updatedAt: updated.updatedAt,
              }
            : a,
        ),
      )
      toast.success('Notes saved')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not save notes',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={cn('flex h-full min-h-0 flex-col', SCHOOL_SHELL.shell)}>
      <div className="border-b border-slate-200/70 bg-white px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Applications
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Admissions inbox from your public apply form.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <UserRoundPlus className="h-4 w-4" />
            {counts.all} total
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search learner, guardian, or reference…"
              className="h-10 pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                'all',
                'new',
                'reviewing',
                'accepted',
                'rejected',
              ] as const
            ).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                  statusFilter === key
                    ? 'border-[#0073ea] bg-[#dcebfd] text-[#0073ea]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                )}
              >
                {key === 'all' ? 'All' : STATUS_META[key].label}
                <span className="ml-1.5 tabular-nums opacity-70">
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <div className="min-h-0 overflow-auto border-r border-slate-200/70 bg-white">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading applications…
            </div>
          ) : error ? (
            <div className="m-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              {error}
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={load}
              >
                Retry
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dcebfd] text-[#0073ea]">
                <UserRoundPlus className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-slate-900">
                No applications yet
              </h2>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                When families submit via your website’s Apply form, they’ll show
                up here with a reference number.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((app) => {
                const active = app.id === selectedId
                const meta = STATUS_META[app.status]
                return (
                  <li key={app.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(app.id)}
                      className={cn(
                        'flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors sm:px-5',
                        active
                          ? 'bg-[#dcebfd]/60'
                          : 'hover:bg-slate-50',
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-slate-900">
                            {studentName(app)}
                          </p>
                          <span
                            className={cn(
                              'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                              meta.className,
                            )}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-sm text-slate-500">
                          {PROGRAMME_LABELS[app.programme] || app.programme}
                          {' · '}
                          {TERM_LABELS[app.startTerm] || app.startTerm}
                        </p>
                        <p className="mt-1 text-xs tabular-nums text-slate-400">
                          {app.reference} · {formatDate(app.createdAt)}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <aside className="min-h-0 overflow-auto bg-[#f8f9fb]">
          {!selected ? (
            <div className="flex h-full min-h-[240px] items-center justify-center px-6 text-center text-sm text-slate-500">
              Select an application to review details.
            </div>
          ) : (
            <div className="space-y-5 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {selected.reference}
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  {studentName(selected)}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Submitted {formatDate(selected.createdAt)}
                </p>
              </div>

              <dl className="space-y-3 rounded-xl border border-slate-200/80 bg-white p-4 text-sm">
                {(
                  [
                    ['Born', formatDate(selected.dateOfBirth)],
                    [
                      'Pathway',
                      PROGRAMME_LABELS[selected.programme] || selected.programme,
                    ],
                    [
                      'Start',
                      TERM_LABELS[selected.startTerm] || selected.startTerm,
                    ],
                    ['Current school', selected.currentSchool || '—'],
                    [
                      'Guardian',
                      `${selected.guardianName} · ${selected.relationship}`,
                    ],
                  ] as [string, string][]
                ).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="text-right font-medium text-slate-900">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="space-y-2 rounded-xl border border-slate-200/80 bg-white p-4">
                <a
                  href={`mailto:${selected.guardianEmail}`}
                  className="flex items-center gap-2 text-sm font-medium text-[#0073ea] hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  {selected.guardianEmail}
                </a>
                <a
                  href={`tel:${selected.guardianPhone}`}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  {selected.guardianPhone}
                </a>
              </div>

              {(selected.interests?.length ||
                selected.whyUs ||
                selected.notes) && (
                <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white p-4 text-sm">
                  {selected.interests?.length ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Interests
                      </p>
                      <p className="mt-1 text-slate-700">
                        {selected.interests.join(', ')}
                      </p>
                    </div>
                  ) : null}
                  {selected.whyUs ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Why this school
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-slate-700">
                        {selected.whyUs}
                      </p>
                    </div>
                  ) : null}
                  {selected.notes ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Notes from family
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-slate-700">
                        {selected.notes}
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Internal notes
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Only visible to school admins…"
                  className="min-h-[88px] bg-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={saving}
                  onClick={saveNotes}
                >
                  Save notes
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-slate-200/70 pt-4">
                <Button
                  type="button"
                  size="sm"
                  disabled={saving || selected.status === 'reviewing'}
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={() => updateStatus('reviewing')}
                >
                  <Clock3 className="mr-1.5 h-3.5 w-3.5" />
                  Reviewing
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={saving || selected.status === 'accepted'}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => updateStatus('accepted')}
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Accept
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={saving || selected.status === 'rejected'}
                  className="border-rose-200 text-rose-700 hover:bg-rose-50"
                  onClick={() => updateStatus('rejected')}
                >
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  Decline
                </Button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
