"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  ClipboardCheck,
  ArrowRight,
  CalendarDays,
  History,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";
import { useTeacherExamAssignments } from "@/lib/hooks/useTeacherExamAssignments";
import {
  fetchExamSessions,
  fetchExamSessionMarkSubmissions,
  fetchMarkSubmissionAuditLog,
  reviewExamPaperMarks,
  MARK_SUBMISSION_STATUS_LABELS,
  type ExamSessionRecord,
  type MarkSubmissionRecord,
  type MarkSubmissionAuditLogRecord,
} from "@/lib/exams/examSessions";

interface SubmissionWithSession extends MarkSubmissionRecord {
  sessionId: string;
  sessionName: string;
  sessionStatus: string;
  term: number;
  academicYear: string;
}

export default function HodReviewDashboard() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const { selectedTerm, availableTerms } = useSelectedTerm();
  const [search, setSearch] = useState("");
  const [actionSubmission, setActionSubmission] = useState<SubmissionWithSession | null>(null);
  const [actionType, setActionType] = useState<"approve" | "return" | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const academicYear = selectedTerm?.academicYear.name;
  const termNumber = useMemo(() => {
    if (!selectedTerm || availableTerms.length === 0) return undefined;
    const index = availableTerms.findIndex((t) => t.id === selectedTerm.id);
    return index >= 0 ? index + 1 : undefined;
  }, [selectedTerm, availableTerms]);

  const assignmentsQuery = useTeacherExamAssignments();
  const sessionsQuery = useQuery({
    queryKey: ["hodReviewExamSessions", subdomain, academicYear, termNumber],
    queryFn: () =>
      fetchExamSessions(subdomain, {
        academicYear,
        term: termNumber,
      }),
    enabled: Boolean(subdomain && academicYear && termNumber),
    staleTime: 30_000,
  });

  const hodSubjectIds = useMemo(
    () => new Set(assignmentsQuery.data?.hodSubjectIds ?? []),
    [assignmentsQuery.data]
  );

  const relevantSessionIds = useMemo(() => {
    if (!sessionsQuery.data) return [];
    return sessionsQuery.data
      .filter((session) =>
        session.papers?.some((paper) => {
          const subjectId = paper.tenantSubject?.id ?? paper.tenantSubjectId;
          return hodSubjectIds.has(subjectId);
        })
      )
      .map((s) => s.id);
  }, [sessionsQuery.data, hodSubjectIds]);

  const submissionsQueries = useQueries({
    queries: relevantSessionIds.map((sessionId) => ({
      queryKey: ["examSessionMarkSubmissions", subdomain, sessionId],
      queryFn: () => fetchExamSessionMarkSubmissions(subdomain, sessionId),
      enabled: Boolean(subdomain && sessionId),
      staleTime: 15_000,
    })),
  });

  const submissions = useMemo<SubmissionWithSession[]>(() => {
    const result: SubmissionWithSession[] = [];
    for (let i = 0; i < submissionsQueries.length; i++) {
      const query = submissionsQueries[i];
      const sessionId = relevantSessionIds[i];
      const session = sessionsQuery.data?.find((s) => s.id === sessionId);
      if (!query.data || !session) continue;

      for (const sub of query.data) {
        const paper = session.papers?.find((p) => p.id === sub.examPaper.id);
        if (!paper) continue;
        const subjectId = paper.tenantSubject?.id ?? paper.tenantSubjectId;
        if (!hodSubjectIds.has(subjectId)) continue;
        if (!["SUBMITTED", "RETURNED"].includes(sub.status)) continue;

        result.push({
          ...sub,
          sessionId: session.id,
          sessionName: session.name,
          sessionStatus: session.status,
          term: session.term,
          academicYear: session.academicYear,
        });
      }
    }
    return result.sort(
      (a, b) =>
        new Date(b.submittedAt ?? 0).getTime() -
        new Date(a.submittedAt ?? 0).getTime()
    );
  }, [submissionsQueries, relevantSessionIds, sessionsQuery.data, hodSubjectIds]);

  const filteredSubmissions = useMemo(() => {
    if (!search.trim()) return submissions;
    const q = search.toLowerCase();
    return submissions.filter(
      (s) =>
        s.sessionName.toLowerCase().includes(q) ||
        (s.examPaper.tenantSubject?.subject?.name ?? "").toLowerCase().includes(q) ||
        (s.examPaper.tenantGradeLevel?.gradeLevel?.name ?? "").toLowerCase().includes(q)
    );
  }, [submissions, search]);

  const isHod = assignmentsQuery.data && assignmentsQuery.data.hodSubjectIds.length > 0;
  const isLoading =
    assignmentsQuery.isLoading || sessionsQuery.isLoading || submissionsQueries.some((q) => q.isLoading);

  const openActionDialog = (
    submission: SubmissionWithSession,
    type: "approve" | "return"
  ) => {
    setActionSubmission(submission);
    setActionType(type);
    setReviewNotes(submission.reviewNotes ?? "");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5 py-8 px-2 md:px-8 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-primary drop-shadow-sm">
              HOD Review
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and approve marks for papers in your department.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search subject, class or session..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading submissions...</span>
          </div>
        )}

        {/* Not HOD */}
        {!isLoading && !isHod && (
          <Card className="rounded-2xl shadow-lg border border-border">
            <CardContent className="py-16 text-center">
              <ClipboardCheck className="w-12 h-12 mx-auto text-primary/40 mb-4" />
              <p className="text-lg font-medium text-foreground">Not assigned as HOD</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                You are not listed as Head of Department for any subject. Contact your school admin
                to update your HOD assignments.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {!isLoading && isHod && submissions.length === 0 && (
          <Card className="rounded-2xl shadow-lg border border-border">
            <CardContent className="py-16 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500/60 mb-4" />
              <p className="text-lg font-medium text-foreground">No papers pending review</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                Teachers have not submitted any marks for your department yet.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Submissions table */}
        {!isLoading && isHod && submissions.length > 0 && (
          <Card className="rounded-2xl shadow-lg border border-border overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
              <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                Pending Submissions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground bg-muted/30">
                      <th className="text-left font-semibold px-6 py-3">Subject</th>
                      <th className="text-left font-semibold px-6 py-3">Class</th>
                      <th className="text-left font-semibold px-6 py-3">Session</th>
                      <th className="text-left font-semibold px-6 py-3">Submitted</th>
                      <th className="text-left font-semibold px-6 py-3">Status</th>
                      <th className="text-left font-semibold px-6 py-3">Notes</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((sub) => (
                      <tr
                        key={sub.id}
                        className="border-b last:border-b-0 border-border hover:bg-primary/5 transition"
                      >
                        <td className="px-6 py-4 font-medium text-foreground">
                          {sub.examPaper.tenantSubject?.subject?.name ?? "Unknown Subject"}
                        </td>
                        <td className="px-6 py-4 text-foreground">
                          {sub.examPaper.tenantGradeLevel?.gradeLevel?.name ?? "Unknown Class"}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <div>{sub.sessionName}</div>
                          <div className="text-xs flex items-center gap-1 mt-0.5">
                            <CalendarDays className="w-3 h-3" />
                            Term {sub.term}, {sub.academicYear}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {sub.submittedAt
                            ? new Date(sub.submittedAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={sub.status === "RETURNED" ? "destructive" : "default"}
                          >
                            {MARK_SUBMISSION_STATUS_LABELS[sub.status]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">
                          {sub.reviewNotes ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openActionDialog(sub, "return")}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Return
                            </Button>
                            <Button size="sm" onClick={() => openActionDialog(sub, "approve")}>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {actionSubmission && actionType && (
        <ReviewActionDialog
          subdomain={subdomain}
          submission={actionSubmission}
          type={actionType}
          initialNotes={reviewNotes}
          onClose={() => {
            setActionSubmission(null);
            setActionType(null);
            setReviewNotes("");
          }}
        />
      )}
    </div>
  );
}

function AuditLogActionBadge({ action }: { action: MarkSubmissionAuditLogRecord["action"] }) {
  const labels: Record<string, string> = {
    SUBMIT: "Submitted",
    RETURN: "Returned",
    APPROVE: "Approved",
    LOCK: "Locked",
  };
  const classes: Record<string, string> = {
    SUBMIT: "bg-blue-100 text-blue-700",
    RETURN: "bg-red-100 text-red-700",
    APPROVE: "bg-green-100 text-green-700",
    LOCK: "bg-slate-100 text-slate-700",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${classes[action]}`}>
      {labels[action]}
    </span>
  );
}

function ReviewActionDialog({
  subdomain,
  submission,
  type,
  initialNotes,
  onClose,
}: {
  subdomain: string;
  submission: SubmissionWithSession;
  type: "approve" | "return";
  initialNotes: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState(initialNotes);

  const auditLogQuery = useQuery({
    queryKey: ["markSubmissionAuditLog", subdomain, submission.id],
    queryFn: () => fetchMarkSubmissionAuditLog(subdomain, submission.id),
    enabled: Boolean(subdomain && submission.id),
    staleTime: 15_000,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      return reviewExamPaperMarks(subdomain, {
        submissionId: submission.id,
        approve: type === "approve",
        reviewNotes: notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success(
        type === "approve"
          ? "Marks approved successfully"
          : "Marks returned for correction"
      );
      queryClient.invalidateQueries({
        queryKey: ["examSessionMarkSubmissions", subdomain, submission.sessionId],
      });
      onClose();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to review marks");
    },
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "approve" ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            {type === "approve" ? "Approve Marks" : "Return Marks"}
          </DialogTitle>
          <DialogDescription>
            {type === "approve"
              ? "Approve these marks for final processing."
              : "Return these marks to the teacher with correction notes."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {submission.examPaper.tenantSubject?.subject?.name ?? "Unknown"}
            </span>{" "}
            ·{" "}
            {submission.examPaper.tenantGradeLevel?.gradeLevel?.name ?? "Unknown"} ·{" "}
            {submission.sessionName}
          </div>

          <div className="space-y-2">
            <label htmlFor="review-notes" className="text-sm font-medium">
              {type === "approve" ? "Approval notes (optional)" : "Return notes"}
            </label>
            <Textarea
              id="review-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                type === "approve"
                  ? "Add any approval notes..."
                  : "Explain what needs to be corrected..."
              }
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <History className="w-4 h-4 text-muted-foreground" />
              History
            </h4>
            {auditLogQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading history...
              </div>
            ) : auditLogQuery.data && auditLogQuery.data.length > 0 ? (
              <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {auditLogQuery.data.map((log) => (
                  <li
                    key={log.id}
                    className="text-sm border-l-2 border-primary/30 pl-3 py-1"
                  >
                    <div className="flex items-center gap-2">
                      <AuditLogActionBadge action={log.action} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {log.oldStatus !== log.newStatus && (
                        <>
                          {MARK_SUBMISSION_STATUS_LABELS[log.oldStatus]} →{" "}
                          {MARK_SUBMISSION_STATUS_LABELS[log.newStatus]}
                        </>
                      )}
                    </div>
                    {log.notes && (
                      <p className="text-xs text-foreground mt-1">{log.notes}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No history yet.</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || (type === "return" && !notes.trim())}
            variant={type === "approve" ? "default" : "destructive"}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {type === "approve" ? "Approving" : "Returning"}
              </>
            ) : type === "approve" ? (
              "Approve"
            ) : (
              "Return"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
