'use client'

import { RefreshCw, CalendarCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useParentAttendanceDetails } from '@/lib/parent/useParentAttendanceDetails'
import type { ParentPortalChild } from '@/lib/parent/types'

interface ParentAttendanceSectionProps {
  subdomain: string
  child?: ParentPortalChild
}

const STATUS_STYLE: Record<string, string> = {
  PRESENT: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  LATE: 'bg-amber-100 text-amber-800 border-amber-200',
  ABSENT: 'bg-red-100 text-red-800 border-red-200',
  SUSPENDED: 'bg-slate-100 text-slate-700 border-slate-200',
}

export function ParentAttendanceSection({
  subdomain,
  child,
}: ParentAttendanceSectionProps) {
  const studentId = child?.studentId ?? null
  const isDemo = !studentId || studentId.startsWith('demo-')
  const { records, loading, error, refetch } = useParentAttendanceDetails(
    subdomain,
    isDemo ? null : studentId,
  )

  const present = records.filter((r) => r.status === 'PRESENT').length
  const absent = records.filter((r) => r.status === 'ABSENT').length
  const late = records.filter((r) => r.status === 'LATE').length

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-primary/20 bg-white p-6 shadow-xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-black text-primary">Attendance</h2>
              {child ? (
                <p className="text-sm text-slate-600">
                  Last 30 days — {child.name}
                </p>
              ) : null}
            </div>
          </div>
          {!isDemo ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          ) : null}
        </div>

        {isDemo ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Link a child to your parent account to see live attendance records.
          </p>
        ) : null}

        {error ? (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {!isDemo ? (
          <>
            <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-center">
                <p className="text-2xl font-black text-emerald-700">{present}</p>
                <p className="text-xs font-medium uppercase text-emerald-800">
                  Present
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-center">
                <p className="text-2xl font-black text-amber-700">{late}</p>
                <p className="text-xs font-medium uppercase text-amber-800">
                  Late
                </p>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 text-center">
                <p className="text-2xl font-black text-red-700">{absent}</p>
                <p className="text-xs font-medium uppercase text-red-800">
                  Absent
                </p>
              </div>
            </div>

            {loading && records.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Loading attendance…
              </p>
            ) : records.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No attendance records in the last 30 days.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-primary/20">
                <div className="grid grid-cols-2 gap-2 border-b border-primary/20 bg-primary/10 px-4 py-3 text-xs font-bold uppercase tracking-wide text-primary sm:grid-cols-2">
                  <span>Date</span>
                  <span className="text-right">Status</span>
                </div>
                <div className="divide-y divide-primary/10">
                  {records.map((row) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-2 items-center gap-2 px-4 py-3 text-sm"
                    >
                      <span className="font-medium text-slate-800">
                        {new Date(row.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="flex justify-end">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            STATUS_STYLE[row.status] ??
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {row.status}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
