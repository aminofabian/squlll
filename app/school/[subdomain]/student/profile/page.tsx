"use client"

import { useParams, useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { GraduationCap, Hash, Mail, User, Users } from "lucide-react"
import { useCurrentStudent } from "@/lib/hooks/useCurrentStudent"
import { EmptyState, PageHeader, Section, StateMessage, StudentPage } from "../_ui"

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className="text-right text-sm font-medium text-foreground">
        {value && value.trim() ? value : "—"}
      </span>
    </div>
  )
}

export default function StudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const subdomain =
    typeof params.subdomain === "string"
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : ""

  const { student, loading, error, refetch } = useCurrentStudent()

  return (
    <StudentPage>
      <PageHeader
        title="Profile"
        subtitle="Your student account details"
        onBack={() => router.push(`/school/${subdomain}/student`)}
      />

      <div className="space-y-6">
        {loading ? (
          <Section>
            <StateMessage variant="loading" title="Loading profile…" />
          </Section>
        ) : error ? (
          <Section>
            <StateMessage
              variant="error"
              description={error}
              onRetry={() => void refetch()}
            />
          </Section>
        ) : !student ? (
          <Section>
            <EmptyState
              icon={User}
              title="Profile unavailable"
              description="We could not load your student details right now."
            />
          </Section>
        ) : (
          <>
            <Section bodyClassName="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold tracking-tight text-foreground">
                  {student.name || "Student"}
                </h2>
                <p className="truncate text-sm text-muted-foreground">
                  {student.email || "No email on file"}
                </p>
              </div>
            </Section>

            <Section title="Details" icon={GraduationCap}>
              <div className="divide-y divide-border">
                <DetailRow
                  icon={Hash}
                  label="Admission number"
                  value={student.admissionNumber}
                />
                <DetailRow
                  icon={GraduationCap}
                  label="Grade"
                  value={typeof student.grade === "string" ? student.grade : ""}
                />
                <DetailRow
                  icon={Users}
                  label="Stream"
                  value={student.streamName}
                />
                <DetailRow icon={Mail} label="Email" value={student.email} />
              </div>
            </Section>
          </>
        )}
      </div>
    </StudentPage>
  )
}
