'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { gql } from 'graphql-request'
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
  Mail,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Search,
  X,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { graphqlClient } from '@/lib/graphql-client'
import { ApplicationsPulseHero } from './components/ApplicationsPulseHero'
import { ApplicationsEmptyHero } from './components/ApplicationsEmptyHero'
import {
  appsActionButton,
  appsControlShell,
  appsDirectoryMeta,
  appsFilterPill,
  appsIconButton,
  appsPanel,
  appsPrimaryButton,
  appsSearchInput,
  appsSidebarItem,
  appsTd,
  appsTh,
} from './components/applications-ui'
import {
  type AdmissionApplication,
  type ApplicationStatus,
  formatDate,
  initials,
  normalizeStatus,
  PROGRAMME_LABELS,
  statusMeta,
  studentName,
  TERM_LABELS,
} from './components/applications-types'
import {
  AcceptApplicationDialog,
  type AcceptResult,
} from './components/AcceptApplicationDialog'

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

const ACCEPT_MUTATION = gql`
  mutation AcceptAdmissionApplication($input: AcceptAdmissionApplicationInput!) {
    acceptAdmissionApplication(input: $input) {
      ok
      studentId
      admissionNumber
      studentName
      gradeName
      parentInvited
      emailSent
      message
      application {
        id
        status
        adminNotes
        enrolledStudentId
        admissionNumber
        updatedAt
      }
    }
  }
`

const FILTERS: { id: ApplicationStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'reviewing', label: 'Reviewing' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'rejected', label: 'Declined' },
]

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
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false)
  const [displayedCount, setDisplayedCount] = useState(20)
  const [acceptOpen, setAcceptOpen] = useState(false)
  const [acceptResult, setAcceptResult] = useState<AcceptResult | null>(null)
  const [accepting, setAccepting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await graphqlClient.request<{
        admissionApplications: AdmissionApplication[]
      }>(LIST_QUERY)
      setApps(
        (data.admissionApplications || []).map((app) => ({
          ...app,
          status: normalizeStatus(app.status),
        })),
      )
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
      list = list.filter((a) => normalizeStatus(a.status) === statusFilter)
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

  const sidebarApps = useMemo(
    () => filtered.slice(0, displayedCount),
    [filtered, displayedCount],
  )

  const counts = useMemo(() => {
    const base = {
      all: apps.length,
      new: 0,
      reviewing: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0,
    }
    for (const a of apps) base[normalizeStatus(a.status)] += 1
    return base
  }, [apps])

  const clearFilters = useCallback(() => {
    setSearch('')
    setStatusFilter('all')
    setSelectedId(null)
  }, [])

  const updateStatus = async (status: ApplicationStatus) => {
    if (!selected) return
    if (status === 'accepted') {
      setAcceptResult(null)
      setAcceptOpen(true)
      return
    }
    setSaving(true)
    try {
      const data = await graphqlClient.request<{
        updateAdmissionApplication: Pick<
          AdmissionApplication,
          'id' | 'status' | 'adminNotes' | 'updatedAt'
        >
      }>(UPDATE_MUTATION, {
        input: {
          id: selected.id,
          status: status.toUpperCase(),
          adminNotes,
        },
      })
      const updated = data.updateAdmissionApplication
      setApps((prev) =>
        prev.map((a) =>
          a.id === updated.id
            ? {
                ...a,
                status: normalizeStatus(updated.status),
                adminNotes: updated.adminNotes,
                updatedAt: updated.updatedAt,
              }
            : a,
        ),
      )
      toast.success(`Marked as ${statusMeta(status).label.toLowerCase()}`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not update application',
      )
    } finally {
      setSaving(false)
    }
  }

  const acceptApplication = async (input: {
    tenantGradeLevelId: string
    streamId?: string
    admissionNumber?: string
  }) => {
    if (!selected) return
    setAccepting(true)
    try {
      const data = await graphqlClient.request<{
        acceptAdmissionApplication: {
          ok: boolean
          studentId: string
          admissionNumber: string
          studentName: string
          gradeName: string
          parentInvited: boolean
          emailSent: boolean
          message: string
          application: Pick<
            AdmissionApplication,
            | 'id'
            | 'status'
            | 'adminNotes'
            | 'enrolledStudentId'
            | 'admissionNumber'
            | 'updatedAt'
          >
        }
      }>(ACCEPT_MUTATION, {
        input: {
          id: selected.id,
          tenantGradeLevelId: input.tenantGradeLevelId,
          streamId: input.streamId,
          admissionNumber: input.admissionNumber,
          adminNotes,
        },
      })
      const payload = data.acceptAdmissionApplication
      const updated = payload.application
      setApps((prev) =>
        prev.map((a) =>
          a.id === updated.id
            ? {
                ...a,
                status: normalizeStatus(updated.status),
                adminNotes: updated.adminNotes,
                enrolledStudentId: updated.enrolledStudentId,
                admissionNumber: updated.admissionNumber,
                updatedAt: updated.updatedAt,
              }
            : a,
        ),
      )
      setAcceptResult({
        studentId: payload.studentId,
        admissionNumber: payload.admissionNumber,
        studentName: payload.studentName,
        gradeName: payload.gradeName,
        parentInvited: payload.parentInvited,
        emailSent: payload.emailSent,
        message: payload.message,
      })
      toast.success('Applicant accepted', {
        description: payload.message,
      })
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not accept application',
      )
    } finally {
      setAccepting(false)
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
                status: normalizeStatus(updated.status),
                adminNotes: updated.adminNotes,
                updatedAt: updated.updatedAt,
              }
            : a,
        ),
      )
      toast.success('Notes saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save notes')
    } finally {
      setSaving(false)
    }
  }

  const hasActiveFilters = Boolean(search.trim()) || statusFilter !== 'all'

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f3f7f5] dark:bg-[#071411]">
        <div className="rounded-none border border-red-300/80 bg-white px-6 py-8 text-center shadow-[3px_3px_0_0_rgba(10,31,26,0.04)] dark:border-red-900/50 dark:bg-[#0c1a17]">
          <h2 className="mb-1 font-display text-lg tracking-tight text-red-700 dark:text-red-400">
            Error loading applications
          </h2>
          <p className="text-sm text-[#1a4d42]/55 dark:text-white/45">{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(appsActionButton, 'mt-4')}
            onClick={load}
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f7f5] dark:bg-[#071411]">
      {/* Directory sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#1a4d42]/12 bg-[#f8fbfa] transition-all duration-300 dark:border-white/10 dark:bg-[#0c1a17]',
          'md:relative md:translate-x-0',
          isSidebarMinimized ? 'w-14' : 'w-64',
        )}
      >
        <div
          className={cn(
            'flex shrink-0 border-b border-[#1a4d42]/10 px-2 py-2 dark:border-white/10',
            isSidebarMinimized ? 'justify-center' : 'justify-end',
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            className={appsIconButton}
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
          >
            {isSidebarMinimized ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        {!isSidebarMinimized ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-3">
            <div className={appsDirectoryMeta}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#246a59]">
                Directory
              </p>
              <p className="mt-1 text-xs text-[#1a4d42]/55 dark:text-white/45">
                {filtered.length} showing
                {apps.length !== filtered.length ? ` · ${apps.length} total` : ''}
              </p>
            </div>

            <div className="relative mb-2.5 shrink-0">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#1a4d42]/40" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setDisplayedCount(20)
                }}
                placeholder="Search applications…"
                className={appsSearchInput}
              />
              {search ? (
                <button
                  type="button"
                  className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-[#1a4d42]/40 hover:text-[#0a1f1a]"
                  onClick={() => setSearch('')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10 text-xs text-[#1a4d42]/45">
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Loading…
                </div>
              ) : sidebarApps.length === 0 ? (
                <p className="px-2 py-6 text-center text-xs text-[#1a4d42]/45">
                  No matches
                </p>
              ) : (
                sidebarApps.map((app) => {
                  const name = studentName(app)
                  const meta = statusMeta(app.status)
                  return (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setSelectedId(app.id)}
                      className={appsSidebarItem(app.id === selectedId)}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-none bg-[#0a1f1a] text-[10px] font-semibold text-white">
                          {initials(name) || '?'}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-[#0a1f1a] dark:text-white">
                            {name}
                          </span>
                          <span className="mt-0.5 flex items-center gap-1.5">
                            <span
                              className={cn(
                                'rounded-none border px-1 py-px text-[9px] font-semibold uppercase tracking-wide',
                                meta.className,
                              )}
                            >
                              {meta.label}
                            </span>
                            <span className="truncate text-[10px] tabular-nums text-[#1a4d42]/40">
                              {app.reference}
                            </span>
                          </span>
                        </span>
                      </div>
                    </button>
                  )
                })
              )}
              {filtered.length > displayedCount ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-7 w-full rounded-none text-xs text-[#1a4d42]/55"
                  onClick={() => setDisplayedCount((n) => n + 20)}
                >
                  Load more
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-[#1a4d42]/12 bg-[#f8fbfa]/95 px-4 py-2.5 backdrop-blur-md dark:border-white/10 dark:bg-[#071411]/95 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#246a59]">
                  Admissions
                </p>
                <h1 className="font-display text-xl tracking-tight text-[#0a1f1a] dark:text-white">
                  {selected ? 'Application review' : 'Applications'}
                </h1>
                <p className="mt-0.5 text-xs text-[#1a4d42]/50 dark:text-white/45">
                  {selected
                    ? `${studentName(selected)} · ${selected.reference}`
                    : apps.length > 0
                      ? `${filtered.length} showing · ${apps.length} received`
                      : 'Review applications from your public apply form'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selected ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={appsActionButton}
                    onClick={() => setSelectedId(null)}
                  >
                    <X className="h-3.5 w-3.5" />
                    Close
                  </Button>
                ) : (
                  <Link
                    href="/apply"
                    target="_blank"
                    rel="noreferrer"
                    className={appsPrimaryButton}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Apply form
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl space-y-4 px-4 py-4 sm:px-6 sm:py-5">
            {selected ? (
              <ApplicationDetail
                app={selected}
                adminNotes={adminNotes}
                onAdminNotesChange={setAdminNotes}
                saving={saving}
                onSaveNotes={saveNotes}
                onUpdateStatus={updateStatus}
                onClose={() => setSelectedId(null)}
              />
            ) : (
              <>
                <ApplicationsPulseHero
                  total={counts.all}
                  newCount={counts.new}
                  reviewing={counts.reviewing}
                  accepted={counts.accepted}
                  isLoading={loading}
                  onFilterSelect={setStatusFilter}
                />

                <div className={appsControlShell}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {FILTERS.map(({ id, label }) => {
                        const active = statusFilter === id
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setStatusFilter(id)}
                            className={appsFilterPill(active)}
                          >
                            {label}
                            <span
                              className={cn(
                                'tabular-nums',
                                active ? 'opacity-75' : 'text-[#1a4d42]/40',
                              )}
                            >
                              {counts[id]}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {hasActiveFilters ? (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1 rounded-none border border-[#1a4d42]/12 bg-white px-2 py-0.5 text-xs text-[#1a4d42]/80 hover:border-[#246a59]/35 dark:border-white/10 dark:bg-[#0c1a17]"
                      >
                        <X className="h-3 w-3" />
                        Clear filters
                        {search ? (
                          <span className="max-w-[120px] truncate text-[#1a4d42]/45">
                            “{search}”
                          </span>
                        ) : null}
                      </button>
                    ) : null}
                  </div>
                </div>

                {loading ? (
                  <div className="flex h-40 items-center justify-center text-sm text-[#1a4d42]/50">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading applications…
                  </div>
                ) : filtered.length === 0 ? (
                  <ApplicationsEmptyHero filtered={hasActiveFilters || apps.length > 0} />
                ) : (
                  <div className={appsPanel}>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px] border-collapse text-left">
                        <thead>
                          <tr className="border-b border-[#1a4d42]/10 bg-[#f8fbfa] dark:border-white/10 dark:bg-[#071411]">
                            <th className={appsTh}>Learner</th>
                            <th className={appsTh}>Pathway</th>
                            <th className={appsTh}>Guardian</th>
                            <th className={appsTh}>Status</th>
                            <th className={appsTh}>Submitted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((app) => {
                            const meta = statusMeta(app.status)
                            const name = studentName(app)
                            return (
                              <tr
                                key={app.id}
                                className="cursor-pointer border-b border-[#1a4d42]/8 transition-colors last:border-b-0 hover:bg-[#246a59]/[0.04] dark:border-white/5"
                                onClick={() => setSelectedId(app.id)}
                              >
                                <td className={appsTd}>
                                  <div className="flex items-center gap-2.5">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-[#0a1f1a] text-[11px] font-semibold text-white">
                                      {initials(name) || '?'}
                                    </span>
                                    <div className="min-w-0">
                                      <p className="truncate font-medium">
                                        {name}
                                      </p>
                                      <p className="truncate text-[11px] tabular-nums text-[#1a4d42]/45">
                                        {app.reference}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className={appsTd}>
                                  <p className="text-sm">
                                    {PROGRAMME_LABELS[app.programme] ||
                                      app.programme}
                                  </p>
                                  <p className="text-[11px] text-[#1a4d42]/45">
                                    {TERM_LABELS[app.startTerm] || app.startTerm}
                                  </p>
                                </td>
                                <td className={appsTd}>
                                  <p className="truncate text-sm">
                                    {app.guardianName}
                                  </p>
                                  <p className="truncate text-[11px] text-[#1a4d42]/45">
                                    {app.relationship}
                                  </p>
                                </td>
                                <td className={appsTd}>
                                  <span
                                    className={cn(
                                      'inline-flex rounded-none border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                                      meta.className,
                                    )}
                                  >
                                    {meta.label}
                                  </span>
                                </td>
                                <td className={cn(appsTd, 'text-[#1a4d42]/55')}>
                                  {formatDate(app.createdAt)}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <AcceptApplicationDialog
        open={acceptOpen}
        app={selected}
        submitting={accepting}
        result={acceptResult}
        onOpenChange={(open) => {
          setAcceptOpen(open)
          if (!open) setAcceptResult(null)
        }}
        onConfirm={acceptApplication}
      />
    </div>
  )
}

function ApplicationDetail({
  app,
  adminNotes,
  onAdminNotesChange,
  saving,
  onSaveNotes,
  onUpdateStatus,
  onClose,
}: {
  app: AdmissionApplication
  adminNotes: string
  onAdminNotesChange: (v: string) => void
  saving: boolean
  onSaveNotes: () => void
  onUpdateStatus: (status: ApplicationStatus) => void
  onClose: () => void
}) {
  const meta = statusMeta(app.status)
  const name = studentName(app)

  return (
    <div className="space-y-4">
      <section className={appsPanel}>
        <div className="border-b border-[#1a4d42]/10 bg-gradient-to-br from-[#246a59]/[0.06] via-[#f8fbfa] to-white px-4 py-4 dark:border-white/10 dark:from-[#246a59]/12 dark:via-[#0c1a17] dark:to-[#0c1a17] sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-[#0a1f1a] text-sm font-semibold text-white">
                {initials(name) || '?'}
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#246a59]">
                  {app.reference}
                </p>
                <h2 className="mt-0.5 font-display text-xl tracking-tight text-[#0a1f1a] dark:text-white">
                  {name}
                </h2>
                <p className="mt-1 text-xs text-[#1a4d42]/55">
                  Submitted {formatDate(app.createdAt)}
                  {' · '}
                  <span
                    className={cn(
                      'inline-flex rounded-none border px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide',
                      meta.className,
                    )}
                  >
                    {meta.label}
                  </span>
                  {app.admissionNumber ? (
                    <>
                      {' · '}
                      <span className="font-mono text-[#246a59]">
                        {app.admissionNumber}
                      </span>
                    </>
                  ) : null}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={appsActionButton}
              onClick={onClose}
            >
              Back to list
            </Button>
          </div>
        </div>

        {app.enrolledStudentId ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a4d42]/10 bg-[#e8f2ef] px-4 py-3 dark:border-white/10 dark:bg-[#246a59]/15 sm:px-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#246a59]">
                Enrolled
              </p>
              <p className="text-sm text-[#0a1f1a] dark:text-white">
                Admission{' '}
                <span className="font-mono font-semibold">
                  {app.admissionNumber}
                </span>
              </p>
            </div>
            <Button asChild size="sm" className={appsPrimaryButton}>
              <Link href={`/students?studentId=${app.enrolledStudentId}`}>
                Open student profile
              </Link>
            </Button>
          </div>
        ) : null}

        <div className="grid gap-0 md:grid-cols-2">
          <dl className="space-y-0 border-b border-[#1a4d42]/10 p-4 md:border-b-0 md:border-r dark:border-white/10 sm:p-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
              Learner
            </p>
            {(
              [
                ['Born', formatDate(app.dateOfBirth)],
                ['Gender', app.gender || '—'],
                [
                  'Pathway',
                  PROGRAMME_LABELS[app.programme] || app.programme,
                ],
                ['Start', TERM_LABELS[app.startTerm] || app.startTerm],
                ['Current school', app.currentSchool || '—'],
              ] as [string, string][]
            ).map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between gap-4 border-b border-[#1a4d42]/8 py-2.5 last:border-b-0 dark:border-white/5"
              >
                <dt className="text-xs text-[#1a4d42]/45">{k}</dt>
                <dd className="text-right text-sm font-medium text-[#0a1f1a] dark:text-white">
                  {v}
                </dd>
              </div>
            ))}
          </dl>

          <div className="space-y-4 p-4 sm:p-5">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
                Family
              </p>
              <p className="text-sm font-medium text-[#0a1f1a] dark:text-white">
                {app.guardianName}
                <span className="ml-1.5 font-normal text-[#1a4d42]/45">
                  · {app.relationship}
                </span>
              </p>
              <div className="mt-3 space-y-2">
                <a
                  href={`mailto:${app.guardianEmail}`}
                  className="flex items-center gap-2 text-sm font-medium text-[#246a59] hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {app.guardianEmail}
                </a>
                <a
                  href={`tel:${app.guardianPhone}`}
                  className="flex items-center gap-2 text-sm text-[#0a1f1a] hover:underline dark:text-white/80"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {app.guardianPhone}
                </a>
              </div>
            </div>

            {(app.interests?.length || app.whyUs || app.notes) && (
              <div className="border-t border-[#1a4d42]/10 pt-4 dark:border-white/10">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
                  Story
                </p>
                <div className="space-y-3 text-sm text-[#1a4d42]/80 dark:text-white/70">
                  {app.interests?.length ? (
                    <p>
                      <span className="font-medium text-[#0a1f1a] dark:text-white">
                        Interests:{' '}
                      </span>
                      {app.interests.join(', ')}
                    </p>
                  ) : null}
                  {app.whyUs ? (
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {app.whyUs}
                    </p>
                  ) : null}
                  {app.notes ? (
                    <p className="whitespace-pre-wrap leading-relaxed text-[#1a4d42]/60">
                      {app.notes}
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={cn(appsPanel, 'p-4 sm:p-5')}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
          Internal notes
        </p>
        <Textarea
          value={adminNotes}
          onChange={(e) => onAdminNotesChange(e.target.value)}
          placeholder="Only visible to school admins…"
          className="mt-2 min-h-[88px] rounded-none border-[#1a4d42]/15 bg-white shadow-none focus-visible:ring-[#246a59]/20 dark:border-white/15 dark:bg-[#0c1a17]"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            disabled={saving}
            className={appsPrimaryButton}
            onClick={onSaveNotes}
          >
            Save notes
          </Button>
          <div className="mx-1 hidden h-5 w-px bg-[#1a4d42]/15 sm:block" />
          <Button
            type="button"
            size="sm"
            disabled={saving || app.status === 'reviewing'}
            className={cn(
              appsActionButton,
              'border-amber-300/80 text-amber-900 hover:bg-amber-50',
            )}
            onClick={() => onUpdateStatus('reviewing')}
          >
            <Clock3 className="h-3.5 w-3.5" />
            Reviewing
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={saving || Boolean(app.enrolledStudentId) || app.status === 'accepted'}
            className={cn(appsPrimaryButton, 'bg-[#246a59] hover:bg-[#1a4d42]')}
            onClick={() => onUpdateStatus('accepted')}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Accept & enroll
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={saving || app.status === 'rejected'}
            className={cn(
              appsActionButton,
              'border-rose-200 text-rose-700 hover:bg-rose-50',
            )}
            onClick={() => onUpdateStatus('rejected')}
          >
            <XCircle className="h-3.5 w-3.5" />
            Decline
          </Button>
        </div>
      </section>
    </div>
  )
}
