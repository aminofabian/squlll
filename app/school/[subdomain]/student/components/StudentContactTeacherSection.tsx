'use client'

import { Mail, MessageCircle, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStudentClassTeacher } from '@/lib/student/useStudentClassTeacher'
import { EmptyState, PageHeader, Section, StateMessage } from '../_ui'

interface StudentContactTeacherSectionProps {
  subdomain: string
  onBack: () => void
  onOpenMessages: (teacherUserId: string, teacherName: string) => void
}

export function StudentContactTeacherSection({
  subdomain,
  onBack,
  onOpenMessages,
}: StudentContactTeacherSectionProps) {
  const { classTeacher, loading, error, refetch } = useStudentClassTeacher(subdomain)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Class Teacher"
        subtitle="Message your assigned class teacher"
        onBack={onBack}
      />

      {loading ? (
        <Section>
          <StateMessage variant="loading" title="Loading class teacher…" />
        </Section>
      ) : error ? (
        <Section>
          <StateMessage
            variant="error"
            description={error}
            onRetry={() => void refetch()}
          />
        </Section>
      ) : !classTeacher ? (
        <Section>
          <EmptyState
            icon={User}
            title="No class teacher assigned"
            description="Your school has not assigned a class teacher to your grade yet."
          />
        </Section>
      ) : (
        <Section
          title={classTeacher.fullName}
          description={`${classTeacher.gradeName} · Class teacher`}
          icon={User}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{classTeacher.email}</span>
            </div>

            <Button
              className="w-full"
              onClick={() =>
                onOpenMessages(classTeacher.teacherUserId, classTeacher.fullName)
              }
            >
              <MessageCircle className="h-4 w-4" />
              Send message
            </Button>
          </div>
        </Section>
      )}
    </div>
  )
}
