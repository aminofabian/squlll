"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useTeacherActivity,
  type AssesStatus,
  type AssessType,
  type NoteVisibility,
  type TeacherActivityAssessment,
  type TeacherActivityNote,
} from "@/lib/hooks/useTeacherActivity";
import { formatTeacherDate } from "../utils/teachers-utils";
import { teachersPanel } from "./teachers-ui";
import {
  AlertCircle,
  BookOpen,
  ClipboardList,
  FileText,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface TeacherActivityPanelProps {
  teacherUserId?: string | null;
  teacherName: string;
  tenantSubjectIds: string[];
  tenantGradeLevelIds: string[];
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
        {title}
      </p>
      <p className="mt-1 max-w-sm text-xs text-slate-400">{description}</p>
    </div>
  );
}

function visibilityBadge(visibility: NoteVisibility) {
  const styles: Record<NoteVisibility, string> = {
    PRIVATE:
      "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
    GRADE:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400",
    SCHOOL:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
  };

  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-medium capitalize", styles[visibility])}
    >
      {visibility.toLowerCase()}
    </Badge>
  );
}

function assessmentTypeBadge(type: AssessType) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-medium",
        type === "EXAM"
          ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-400"
          : "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400",
      )}
    >
      {type === "EXAM" ? "Exam" : "CA"}
    </Badge>
  );
}

function assessmentStatusBadge(status: AssesStatus) {
  const styles: Record<AssesStatus, string> = {
    COMPLETED:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
    PENDING:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
    UPCOMING:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400",
  };

  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-medium capitalize", styles[status])}
    >
      {status.toLowerCase()}
    </Badge>
  );
}

function truncateContent(content: string, maxLength = 140) {
  const trimmed = content.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trim()}…`;
}

function NoteRow({ note }: { note: TeacherActivityNote }) {
  const subjectName = note.subject?.name;
  const gradeName = note.gradeLevel?.gradeLevel?.name;

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-3 dark:border-slate-800 dark:bg-slate-800/30">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
            {note.title}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {truncateContent(note.content)}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {note.is_ai_generated ? (
            <Badge
              variant="outline"
              className="border-fuchsia-200 bg-fuchsia-50 text-[10px] font-medium text-fuchsia-700 dark:border-fuchsia-800 dark:bg-fuchsia-950/40 dark:text-fuchsia-400"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              AI
            </Badge>
          ) : null}
          {visibilityBadge(note.visibility)}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
        {subjectName ? <span>{subjectName}</span> : null}
        {gradeName ? <span>{gradeName}</span> : null}
        <span>{formatTeacherDate(note.created_at)}</span>
      </div>
    </div>
  );
}

function AssessmentRow({ assessment }: { assessment: TeacherActivityAssessment }) {
  const subjectName =
    assessment.tenantSubject?.subject?.name ?? "Unknown subject";
  const gradeName =
    assessment.tenantGradeLevel?.gradeLevel?.name ?? "Unknown grade";

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-3 dark:border-slate-800 dark:bg-slate-800/30">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
            {assessment.title}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {subjectName} · {gradeName}
          </p>
          {assessment.description?.trim() ? (
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {truncateContent(assessment.description, 100)}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {assessmentTypeBadge(assessment.type)}
          {assessmentStatusBadge(assessment.status)}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
        <span>
          Term {assessment.term}
          {assessment.academicYear ? ` · ${assessment.academicYear}` : ""}
        </span>
        {assessment.maxScore != null ? (
          <span>Max {assessment.maxScore}</span>
        ) : null}
        {assessment.cutoff != null ? (
          <span>Cutoff {assessment.cutoff}</span>
        ) : null}
        <span>Updated {formatTeacherDate(assessment.updatedAt)}</span>
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function TeacherActivityPanel({
  teacherUserId,
  teacherName,
  tenantSubjectIds,
  tenantGradeLevelIds,
}: TeacherActivityPanelProps) {
  const { notes, assessments, loading, error, refetch, hasTeachingScope } =
    useTeacherActivity({
      teacherUserId,
      tenantSubjectIds,
      tenantGradeLevelIds,
    });

  if (error) {
    return (
      <div className={`${teachersPanel} p-5`}>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <AlertCircle className="mb-3 h-8 w-8 text-red-400" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Could not load activity
          </p>
          <p className="mt-1 max-w-sm text-xs text-slate-400">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => refetch()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className={`${teachersPanel} overflow-hidden`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Teaching notes
              </h3>
              <p className="text-xs text-slate-400">
                Notes created by {teacherName}
              </p>
            </div>
          </div>
          {!loading ? (
            <Badge variant="secondary" className="text-[10px] font-medium">
              {notes.length}
            </Badge>
          ) : null}
        </div>
        <div className="p-4 sm:p-5">
          {loading ? (
            <SectionSkeleton />
          ) : notes.length === 0 ? (
            <EmptyPanel
              icon={FileText}
              title="No notes yet"
              description="This teacher has not created any teaching notes."
            />
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <NoteRow key={note.id} note={note} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`${teachersPanel} overflow-hidden`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-slate-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Assessments
              </h3>
              <p className="text-xs text-slate-400">
                CAs and exams in assigned subjects and grades
              </p>
            </div>
          </div>
          {!loading ? (
            <Badge variant="secondary" className="text-[10px] font-medium">
              {assessments.length}
            </Badge>
          ) : null}
        </div>
        <div className="p-4 sm:p-5">
          {loading ? (
            <SectionSkeleton />
          ) : !hasTeachingScope ? (
            <EmptyPanel
              icon={BookOpen}
              title="No teaching assignments"
              description="Assign subjects and grade levels on the Academic tab to see related assessments."
            />
          ) : assessments.length === 0 ? (
            <EmptyPanel
              icon={ClipboardList}
              title="No matching assessments"
              description="No CAs or exams found for this teacher's assigned subjects and grades."
            />
          ) : (
            <div className="space-y-3">
              {assessments.map((assessment) => (
                <AssessmentRow key={assessment.id} assessment={assessment} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
