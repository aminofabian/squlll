"use client"

import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Percent,
  RefreshCw,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStudentAttendanceSummary } from "@/lib/student/useStudentAttendanceSummary"
import {
  EmptyState,
  PageHeader,
  Section,
  StateMessage,
  StatTile,
  StatusPill,
  type PillTone,
} from "../_ui"

interface StudentAttendanceSectionProps {
  subdomain: string
  onBack: () => void
}

const STATUS_TONE: Record<string, PillTone> = {
  PRESENT: "success",
  LATE: "warning",
  ABSENT: "danger",
  SUSPENDED: "neutral",
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
      <PageHeader
        title="My Attendance"
        subtitle="Your daily attendance record for this term"
        onBack={onBack}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {error ? (
        <Section>
          <StateMessage
            variant="error"
            description={error}
            onRetry={() => void refetch()}
          />
        </Section>
      ) : null}

      {summary ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatTile
              label="Rate"
              value={`${Math.round(summary.percentage)}%`}
              icon={Percent}
            />
            <StatTile
              label="Present"
              value={summary.presentDays}
              icon={CheckCircle2}
            />
            <StatTile label="Late" value={summary.lateDays} icon={Clock} />
            <StatTile label="Absent" value={summary.absentDays} icon={XCircle} />
            <StatTile
              label="Total"
              value={summary.totalDays}
              icon={CalendarDays}
            />
          </div>

          <Section title="Attendance records" icon={CalendarCheck}>
            {loading && records.length === 0 ? (
              <StateMessage variant="loading" title="Loading records…" />
            ) : records.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title="No attendance records yet"
                description="Records will appear here once attendance has been marked."
              />
            ) : (
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="grid grid-cols-2 gap-2 border-b border-border bg-muted/50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Date</span>
                  <span className="text-right">Status</span>
                </div>
                <div className="divide-y divide-border">
                  {records.map((row) => (
                    <div
                      key={`${row.date}-${row.status}`}
                      className="grid grid-cols-2 items-center gap-2 px-4 py-3 text-sm"
                    >
                      <span className="font-medium text-foreground">
                        {new Date(row.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="flex justify-end">
                        <StatusPill tone={STATUS_TONE[row.status] ?? "neutral"}>
                          {row.status}
                        </StatusPill>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>
        </div>
      ) : loading ? (
        <Section>
          <StateMessage variant="loading" title="Loading attendance…" />
        </Section>
      ) : null}
    </div>
  )
}
