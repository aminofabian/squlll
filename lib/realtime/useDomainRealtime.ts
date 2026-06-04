'use client'

import { useEffect, useRef } from 'react'
import { useRealtime } from './RealtimeProvider'
import type {
  AssignmentGradedPayload,
  AssignmentPublishedPayload,
  AssignmentSubmittedPayload,
  AttendanceRegisterPayload,
  ClassTeacherAssignedPayload,
  FeePaymentUpdatedPayload,
  InvitationPayload,
  LessonCompletedPayload,
  NotesPublishedPayload,
  ParentInvitationAcceptedPayload,
  RealtimeEnvelope,
  TimetablePublishedPayload,
  TimetableEntryChangedPayload,
} from './types'

import type {
  ExamPublishedPayload,
  ExamResultsReleasedPayload,
  PresenceUpdatedPayload,
  TenantLiveStatsSnapshot,
} from './liveStatsTypes'

export interface DomainRealtimeHandlers {
  /** When false, socket listeners are not registered. Defaults to true. */
  enabled?: boolean
  onTimetablePublished?: (payload: TimetablePublishedPayload) => void
  onTimetableUnpublished?: (payload: TimetablePublishedPayload) => void
  onTimetableEntryChanged?: (payload: TimetableEntryChangedPayload) => void
  onLessonCompleted?: (payload: LessonCompletedPayload) => void
  onFeePaymentUpdated?: (payload: FeePaymentUpdatedPayload) => void
  onInvitationSent?: (payload: InvitationPayload) => void
  onInvitationAccepted?: (payload: InvitationPayload) => void
  onInvitationRevoked?: (payload: InvitationPayload) => void
  onParentInvitationAccepted?: (payload: ParentInvitationAcceptedPayload) => void
  onClassTeacherAssigned?: (payload: ClassTeacherAssignedPayload) => void
  onAssignmentPublished?: (payload: AssignmentPublishedPayload) => void
  onAssignmentSubmitted?: (payload: AssignmentSubmittedPayload) => void
  onAssignmentGraded?: (payload: AssignmentGradedPayload) => void
  onNotesPublished?: (payload: NotesPublishedPayload) => void
  onAttendanceRegisterSubmitted?: (payload: AttendanceRegisterPayload) => void
  onPresenceUpdated?: (payload: PresenceUpdatedPayload) => void
  onStatsTenantUpdated?: (payload: TenantLiveStatsSnapshot) => void
  onExamPublished?: (payload: ExamPublishedPayload) => void
  onExamResultsReleased?: (payload: ExamResultsReleasedPayload) => void
}

/**
 * Subscribe to cross-feature domain events on the shared Socket.IO connection.
 * Handlers are kept in a ref so callers do not need stable callback identities.
 */
export function useDomainRealtime(handlers: DomainRealtimeHandlers): void {
  const { socket } = useRealtime()
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers
  const enabled = handlers.enabled !== false

  useEffect(() => {
    if (!socket || !enabled) return

    const bind = <T>(
      event: string,
      handler?: (payload: T) => void,
    ) => {
      const listener = (envelope: RealtimeEnvelope<T>) => {
        if (envelope?.payload && handler) {
          handler(envelope.payload)
        }
      }
      socket.on(event, listener)
      return () => {
        socket.off(event, listener)
      }
    }

    const cleanups = [
      bind<TimetablePublishedPayload>(
        'timetable.published',
        (p) => handlersRef.current.onTimetablePublished?.(p),
      ),
      bind<TimetablePublishedPayload>(
        'timetable.unpublished',
        (p) => handlersRef.current.onTimetableUnpublished?.(p),
      ),
      bind<TimetableEntryChangedPayload>(
        'timetable.entry_changed',
        (p) => handlersRef.current.onTimetableEntryChanged?.(p),
      ),
      bind<LessonCompletedPayload>(
        'lesson.completed',
        (p) => handlersRef.current.onLessonCompleted?.(p),
      ),
      bind<FeePaymentUpdatedPayload>(
        'fee.payment_updated',
        (p) => handlersRef.current.onFeePaymentUpdated?.(p),
      ),
      bind<InvitationPayload>(
        'invitation.sent',
        (p) => handlersRef.current.onInvitationSent?.(p),
      ),
      bind<InvitationPayload>(
        'invitation.accepted',
        (p) => handlersRef.current.onInvitationAccepted?.(p),
      ),
      bind<InvitationPayload>(
        'invitation.revoked',
        (p) => handlersRef.current.onInvitationRevoked?.(p),
      ),
      bind<ParentInvitationAcceptedPayload>(
        'invitation.parent_accepted',
        (p) => handlersRef.current.onParentInvitationAccepted?.(p),
      ),
      bind<ClassTeacherAssignedPayload>(
        'class.teacher_assigned',
        (p) => handlersRef.current.onClassTeacherAssigned?.(p),
      ),
      bind<AssignmentPublishedPayload>(
        'assignment.published',
        (p) => handlersRef.current.onAssignmentPublished?.(p),
      ),
      bind<AssignmentSubmittedPayload>(
        'assignment.submitted',
        (p) => handlersRef.current.onAssignmentSubmitted?.(p),
      ),
      bind<AssignmentGradedPayload>(
        'assignment.graded',
        (p) => handlersRef.current.onAssignmentGraded?.(p),
      ),
      bind<NotesPublishedPayload>(
        'notes.published',
        (p) => handlersRef.current.onNotesPublished?.(p),
      ),
      bind<AttendanceRegisterPayload>(
        'attendance.register_submitted',
        (p) => handlersRef.current.onAttendanceRegisterSubmitted?.(p),
      ),
      bind<PresenceUpdatedPayload>(
        'presence.updated',
        (p) => handlersRef.current.onPresenceUpdated?.(p),
      ),
      bind<TenantLiveStatsSnapshot>(
        'stats.tenant_updated',
        (p) => handlersRef.current.onStatsTenantUpdated?.(p),
      ),
      bind<ExamPublishedPayload>(
        'exam.published',
        (p) => handlersRef.current.onExamPublished?.(p),
      ),
      bind<ExamResultsReleasedPayload>(
        'exam.results_released',
        (p) => handlersRef.current.onExamResultsReleased?.(p),
      ),
    ]

    return () => {
      for (const cleanup of cleanups) cleanup()
    }
  }, [socket, enabled])
}
