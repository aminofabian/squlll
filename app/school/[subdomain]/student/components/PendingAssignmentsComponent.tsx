"use client"

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  XCircle,
  BookOpen,
  User,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  EmptyState,
  PageHeader,
  Section,
  StatTile,
  StateMessage,
  StatusPill,
} from "../_ui";
import { useStudentTests } from '@/lib/student/useStudentTests';
import type { StudentAssignmentItem } from '@/lib/student/types';
import { submitMyTest } from '@/lib/student/studentTests';
import { uploadMultipleFiles } from '@/lib/services/upload';
import { toast } from 'sonner';
import SubmitAssignmentModal from './SubmitAssignmentModal';
import { StudentTestDetailModal } from './StudentTestDetailModal';

interface PendingAssignmentsComponentProps {
  subdomain: string;
  onBack: () => void;
}

export default function PendingAssignmentsComponent({ subdomain, onBack }: PendingAssignmentsComponentProps) {
  const { assignments, loading, error, refetch } = useStudentTests(subdomain);
  const [selectedAssignment, setSelectedAssignment] = useState<StudentAssignmentItem | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [detailTestId, setDetailTestId] = useState<string | null>(null);

  const handleSubmitAssignment = (assignment: StudentAssignmentItem) => {
    setSelectedAssignment(assignment);
    setShowSubmitModal(true);
  };

  const handleSubmitAssignmentSubmit = async (assignmentId: string, files: File[], comments: string) => {
    try {
      let fileUrl: string | undefined
      if (files.length > 0) {
        const uploads = await uploadMultipleFiles(files, 'submission', assignmentId, comments)
        fileUrl = uploads.map((u) => u.url).join(',')
      }

      await submitMyTest(subdomain, {
        testId: assignmentId,
        fileUrl,
        comments: comments.trim() || undefined,
      })

      await refetch()
      toast.success('Assignment submitted successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit assignment')
      throw err
    }
  };

  const renderStatus = (status: string, dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const isOverdue = due < today && status === 'pending';

    if (isOverdue || status === 'overdue') {
      return <StatusPill tone="danger">Overdue</StatusPill>;
    } else if (status === 'graded') {
      return <StatusPill tone="accent">Graded</StatusPill>;
    } else if (status === 'submitted') {
      return <StatusPill tone="success">Submitted</StatusPill>;
    } else {
      return <StatusPill tone="warning">Pending</StatusPill>;
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else {
      return `${diffDays} days remaining`;
    }
  };

  const pendingCount = assignments.filter((a) => a.status !== 'submitted').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Assignments" onBack={onBack} />
        <Section padded={false}>
          <StateMessage variant="loading" title="Loading assignments…" />
        </Section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Assignments" onBack={onBack} />
        <Section padded={false}>
          <StateMessage
            variant="error"
            title="Couldn't load assignments"
            description={error}
            onRetry={() => void refetch()}
          />
        </Section>
      </div>
    );
  }

  const overdueCount = assignments.filter(
    (a) => a.status === 'overdue' || (a.status === 'pending' && new Date(a.dueDate) < new Date()),
  ).length;
  const completedCount = assignments.filter(
    (a) => a.status === 'submitted' || a.status === 'graded',
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        subtitle={`${pendingCount} assignment${pendingCount === 1 ? "" : "s"} to complete`}
        onBack={onBack}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile icon={FileText} label="Total" value={assignments.length} />
        <StatTile
          icon={Clock}
          label="Pending"
          value={assignments.filter((a) => a.status === 'pending' && new Date(a.dueDate) >= new Date()).length}
        />
        <StatTile icon={AlertCircle} label="Overdue" value={overdueCount} />
        <StatTile icon={CheckCircle} label="Submitted" value={completedCount} />
      </div>

      <Section title="Assignments" icon={BookOpen}>
        {assignments.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No pending assignments"
            description="You are all caught up — no assignments are pending."
          />
        ) : (
          <ul className="divide-y divide-border">
            {assignments.map((assignment) => (
              <li
                key={assignment.id}
                className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BookOpen className="h-[18px] w-[18px]" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-foreground">
                          {assignment.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {assignment.subject}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 lg:hidden">
                      {renderStatus(assignment.status, assignment.dueDate)}
                    </div>
                  </div>

                  {assignment.description ? (
                    <p className="text-sm text-muted-foreground">
                      {assignment.description}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-1.5",
                        getDaysRemaining(assignment.dueDate).includes('overdue') &&
                          "text-red-600 dark:text-red-400",
                      )}
                    >
                      <Clock className="h-4 w-4" />
                      {getDaysRemaining(assignment.dueDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      {assignment.teacher}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4" />
                      Max score: {assignment.maxScore}
                    </span>
                  </div>

                  {assignment.attachments && assignment.attachments.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">
                        Attachments
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {assignment.attachments.map((attachment, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {attachment}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {assignment.status === 'graded' && assignment.grade != null && (
                    <div className="space-y-2 rounded-lg border border-border bg-primary/5 p-4">
                      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                        <Award className="h-4 w-4 text-primary" />
                        Score: {assignment.grade}/{assignment.maxScore}
                        {assignment.gradedAt ? (
                          <span className="text-xs font-normal text-muted-foreground">
                            · Graded {new Date(assignment.gradedAt).toLocaleDateString()}
                          </span>
                        ) : null}
                      </div>
                      {assignment.feedback ? (
                        <p className="text-sm text-muted-foreground">
                          {assignment.feedback}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 flex-row items-center gap-2 lg:flex-col lg:items-stretch">
                  <div className="hidden lg:mb-1 lg:flex lg:justify-end">
                    {renderStatus(assignment.status, assignment.dueDate)}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setDetailTestId(assignment.id)}
                    className="flex-1 lg:w-[140px] lg:flex-none"
                  >
                    View details
                  </Button>
                  {assignment.status === 'pending' && (
                    <Button
                      onClick={() => handleSubmitAssignment(assignment)}
                      className="flex-1 lg:w-[140px] lg:flex-none"
                    >
                      <Upload />
                      Submit
                    </Button>
                  )}
                  {assignment.status === 'submitted' && (
                    <Button variant="outline" className="flex-1 lg:w-[140px] lg:flex-none" disabled>
                      <CheckCircle />
                      Awaiting grade
                    </Button>
                  )}
                  {assignment.status === 'graded' && (
                    <Button variant="outline" className="flex-1 lg:w-[140px] lg:flex-none" disabled>
                      <Award />
                      {assignment.grade}/{assignment.maxScore}
                    </Button>
                  )}
                  {(assignment.status === 'overdue' || (assignment.status === 'pending' && new Date(assignment.dueDate) < new Date())) && (
                    <Button variant="destructive" className="flex-1 lg:w-[140px] lg:flex-none">
                      <XCircle />
                      Overdue
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Test detail modal */}
      <StudentTestDetailModal
        subdomain={subdomain}
        testId={detailTestId}
        isOpen={Boolean(detailTestId)}
        onClose={() => setDetailTestId(null)}
        showSubmit={
          Boolean(
            detailTestId &&
              assignments.find((a) => a.id === detailTestId)?.status === 'pending',
          )
        }
        onSubmit={() => {
          const assignment = assignments.find((a) => a.id === detailTestId)
          if (assignment) {
            setDetailTestId(null)
            handleSubmitAssignment(assignment)
          }
        }}
      />

      {/* Submit Assignment Modal */}
      {selectedAssignment && (
        <SubmitAssignmentModal
          key={selectedAssignment.id}
          subdomain={subdomain}
          assignment={selectedAssignment}
          isOpen={showSubmitModal}
          onClose={() => {
            setShowSubmitModal(false);
            setSelectedAssignment(null);
          }}
          onSubmit={handleSubmitAssignmentSubmit}
        />
      )}
    </div>
  );
}
