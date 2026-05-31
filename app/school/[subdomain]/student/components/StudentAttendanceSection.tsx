'use client'

import { ArrowLeft, CalendarCheck, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStudentAttendanceSummary } from '@/lib/student/useStudentAttendanceSummary'

interface StudentAttendanceSectionProps {
  subdomain: string
  onBack: () => void
}

const STATUS_STYLE: Record<string, string> = {
  PRESENT: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  LATE: 'bg-amber-100 text-amber-800 border-amber-200',
  ABSENT: 'bg-red-100 text-red-800 border-red-200',
  SUSPENDED: 'bg-slate-100 text-slate-700 border-slate-200',
}

export function StudentAttendanceSection({
  subdomain,
  onBack,
}: StudentAttendanceSectionProps) {
  const { summary, loading, error, refetch } =
    useStudentAttendanceSummary(subdomain)

  const records = [...(summary?.records ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">My Attendance</h2>
        </div>

        {error ? (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {summary ? (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <Stat label="Rate" value={`${Math.round(summary.percentage)}%`} />
              <Stat label="Present" value={summary.presentDays} />
              <Stat label="Late" value={summary.lateDays} />
              <Stat label="Absent" value={summary.absentDays} />
              <Stat label="Total" value={summary.totalDays} />
            </div>

            {loading && records.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Loading records…
              </p>
            ) : records.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No attendance records yet.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-primary/20">
                <div className="grid grid-cols-2 gap-2 border-b border-primary/20 bg-primary/10 px-4 py-3 text-xs font-bold uppercase tracking-wide text-primary">
                  <span>Date</span>
                  <span className="text-right">Status</span>
                </div>
                <div className="divide-y divide-primary/10">
                  {records.map((row) => (
                    <div
                      key={`${row.date}-${row.status}`}
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
        ) : loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Loading attendance…
          </p>
        ) : null}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
      <p className="text-lg font-bold text-primary">{value}</p>
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
    </div>
  )
}
