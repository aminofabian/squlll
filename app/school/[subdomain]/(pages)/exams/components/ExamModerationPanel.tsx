"use client";

import React, { useMemo, useState } from "react";
import { useQueries, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Lock,
  LockKeyhole,
  Search,
  CheckCircle,
  ThumbsUp,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  fetchExamSessions,
  fetchExamSessionMarkSubmissions,
  lockExamPaperMarks,
  lockAllExamSessionMarks,
  approveAllExamSessionMarks,
  returnExamPaperMarks,
  reviewExamPaperMarks,
  MARK_SUBMISSION_STATUS_LABELS,
  type ExamSessionRecord,
  type MarkSubmissionRecord,
} from "@/lib/exams/examSessions";

interface SubmissionWithSession extends MarkSubmissionRecord {
  sessionId: string;
  sessionName: string;
  academicYear: string;
  term: number;
}

interface ExamModerationPanelProps {
  subdomain: string;
  academicYear?: string;
  term?: number;
  gradeId?: string;
}

export function ExamModerationPanel({
  subdomain,
  academicYear,
  term,
  gradeId,
}: ExamModerationPanelProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [confirmLockAllSession, setConfirmLockAllSession] = useState<ExamSessionRecord | null>(null);
  const [confirmApproveAllSession, setConfirmApproveAllSession] = useState<ExamSessionRecord | null>(null);
  const [confirmLockSubmission, setConfirmLockSubmission] = useState<SubmissionWithSession | null>(null);
  const [confirmApproveSubmission, setConfirmApproveSubmission] = useState<SubmissionWithSession | null>(null);
  const [confirmReturnSubmission, setConfirmReturnSubmission] = useState<SubmissionWithSession | null>(null);

  const sessionsQuery = useQuery({
    queryKey: ["moderationExamSessions", subdomain, academicYear, term, gradeId],
    queryFn: () =>
      fetchExamSessions(subdomain, {
        academicYear,
        term,
        tenantGradeLevelId: gradeId,
      }),
    enabled: Boolean(subdomain),
    staleTime: 30_000,
  });

  const sessionIds = useMemo(
    () => sessionsQuery.data?.map((s) => s.id) ?? [],
    [sessionsQuery.data]
  );

  const submissionsQueries = useQueries({
    queries: sessionIds.map((sessionId) => ({
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
      const sessionId = sessionIds[i];
      const session = sessionsQuery.data?.find((s) => s.id === sessionId);
      if (!query.data || !session) continue;

      for (const sub of query.data) {
        if (!["SUBMITTED", "APPROVED", "LOCKED"].includes(sub.status)) continue;
        result.push({
          ...sub,
          sessionId: session.id,
          sessionName: session.name,
          academicYear: session.academicYear,
          term: session.term,
        });
      }
    }
    return result.sort(
      (a, b) =>
        new Date(b.submittedAt ?? 0).getTime() - new Date(a.submittedAt ?? 0).getTime()
    );
  }, [submissionsQueries, sessionIds, sessionsQuery.data]);

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

  const groupedBySession = useMemo(() => {
    const map = new Map<string, ExamSessionRecord>();
    for (const sub of filteredSubmissions) {
      const session = sessionsQuery.data?.find((s) => s.id === sub.sessionId);
      if (session) map.set(session.id, session);
    }
    return Array.from(map.values());
  }, [filteredSubmissions, sessionsQuery.data]);

  const lockAllMutation = useMutation({
    mutationFn: async (sessionId: string) => lockAllExamSessionMarks(subdomain, sessionId),
    onSuccess: (_, sessionId) => {
      toast.success("All lockable marks in the session have been locked");
      queryClient.invalidateQueries({
        queryKey: ["examSessionMarkSubmissions", subdomain, sessionId],
      });
      setConfirmLockAllSession(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to lock session marks");
    },
  });

  const approveAllMutation = useMutation({
    mutationFn: async (sessionId: string) => approveAllExamSessionMarks(subdomain, sessionId),
    onSuccess: (_, sessionId) => {
      toast.success("All submitted marks in the session have been approved");
      queryClient.invalidateQueries({
        queryKey: ["examSessionMarkSubmissions", subdomain, sessionId],
      });
      setConfirmApproveAllSession(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to approve session marks");
    },
  });

  const lockMutation = useMutation({
    mutationFn: async (submissionId: string) => lockExamPaperMarks(subdomain, submissionId),
    onSuccess: () => {
      toast.success("Paper marks locked");
      const sessionId = confirmLockSubmission?.sessionId;
      if (sessionId) {
        queryClient.invalidateQueries({
          queryKey: ["examSessionMarkSubmissions", subdomain, sessionId],
        });
      }
      setConfirmLockSubmission(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to lock paper marks");
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (sub: SubmissionWithSession) =>
      reviewExamPaperMarks(subdomain, { submissionId: sub.id, approve: true, reviewNotes: "Approved by administrator" }),
    onSuccess: (_, sub) => {
      toast.success("Paper marks approved");
      queryClient.invalidateQueries({
        queryKey: ["examSessionMarkSubmissions", subdomain, sub.sessionId],
      });
      setConfirmApproveSubmission(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to approve paper marks");
    },
  });

  const returnMutation = useMutation({
    mutationFn: async (sub: SubmissionWithSession) => returnExamPaperMarks(subdomain, sub.id),
    onSuccess: (_, sub) => {
      toast.success("Paper returned for correction");
      queryClient.invalidateQueries({
        queryKey: ["examSessionMarkSubmissions", subdomain, sub.sessionId],
      });
      setConfirmReturnSubmission(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to return paper marks");
    },
  });

  const isLoading = sessionsQuery.isLoading || submissionsQueries.some((q) => q.isLoading);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Lock submitted or approved papers to finalize them for results processing.
        </p>
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

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading submissions...</span>
        </div>
      )}

      {!isLoading && submissions.length === 0 && (
        <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800">
          <CardContent className="py-14 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500/60 mb-4" />
            <p className="text-lg font-medium">Nothing to moderate</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              There are no submitted, approved or locked papers requiring moderation.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading &&
        groupedBySession.map((session) => {
          const sessionSubs = filteredSubmissions.filter((s) => s.sessionId === session.id);
          return (
            <Card
              key={session.id}
              className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden"
            >
              <CardHeader className="bg-slate-50/60 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold">{session.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Term {session.term}, {session.academicYear} · {sessionSubs.length} pending
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmApproveAllSession(session)}
                      disabled={approveAllMutation.isPending}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1.5" />
                      Approve All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmLockAllSession(session)}
                      disabled={lockAllMutation.isPending}
                    >
                      <LockKeyhole className="w-4 h-4 mr-1.5" />
                      Lock All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground bg-muted/30">
                        <th className="text-left font-semibold px-4 py-3">Subject</th>
                        <th className="text-left font-semibold px-4 py-3">Class</th>
                        <th className="text-left font-semibold px-4 py-3">Submitted</th>
                        <th className="text-left font-semibold px-4 py-3">Status</th>
                        <th className="text-left font-semibold px-4 py-3">Notes</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionSubs.map((sub) => (
                        <tr
                          key={sub.id}
                          className="border-b last:border-b-0 border-border hover:bg-muted/20 transition"
                        >
                          <td className="px-4 py-3 font-medium">
                            {sub.examPaper.tenantSubject?.subject?.name ?? "Unknown"}
                          </td>
                          <td className="px-4 py-3">
                            {sub.examPaper.tenantGradeLevel?.gradeLevel?.name ?? "Unknown"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {sub.submittedAt
                              ? new Date(sub.submittedAt).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={sub.status === "APPROVED" ? "default" : "secondary"}>
                              {MARK_SUBMISSION_STATUS_LABELS[sub.status]}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                            {sub.reviewNotes ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {sub.status === "SUBMITTED" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setConfirmApproveSubmission(sub)}
                                  disabled={approveMutation.isPending}
                                >
                                  <ThumbsUp className="w-4 h-4 mr-1.5" />
                                  Approve
                                </Button>
                              )}
                              {sub.status !== "LOCKED" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setConfirmLockSubmission(sub)}
                                  disabled={lockMutation.isPending}
                                >
                                  <Lock className="w-4 h-4 mr-1.5" />
                                  Lock
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setConfirmReturnSubmission(sub)}
                                disabled={returnMutation.isPending}
                              >
                                <RotateCcw className="w-4 h-4 mr-1.5" />
                                Return
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
          );
        })}

      <AlertDialog
        open={!!confirmLockAllSession}
        onOpenChange={(open) => !open && setConfirmLockAllSession(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <LockKeyhole className="w-5 h-5" />
              Lock all marks in session?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will lock every submitted or approved paper in{" "}
              <span className="font-medium">{confirmLockAllSession?.name}</span>. Locked marks
              cannot be edited by teachers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmLockAllSession(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                confirmLockAllSession && lockAllMutation.mutate(confirmLockAllSession.id)
              }
            >
              {lockAllMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              Lock All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!confirmApproveAllSession}
        onOpenChange={(open) => !open && setConfirmApproveAllSession(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5" />
              Approve all marks in session?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will approve every submitted paper in{" "}
              <span className="font-medium">{confirmApproveAllSession?.name}</span>. Approved marks
              cannot be edited by teachers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmApproveAllSession(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                confirmApproveAllSession && approveAllMutation.mutate(confirmApproveAllSession.id)
              }
            >
              {approveAllMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ThumbsUp className="w-4 h-4 mr-2" />
              )}
              Approve All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!confirmLockSubmission}
        onOpenChange={(open) => !open && setConfirmLockSubmission(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Lock this paper?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Locking will prevent any further edits to these marks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmLockSubmission(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmLockSubmission && lockMutation.mutate(confirmLockSubmission.id)}
            >
              {lockMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              Lock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!confirmApproveSubmission}
        onOpenChange={(open) => !open && setConfirmApproveSubmission(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5" />
              Approve this paper?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Approving will lock these marks from further teacher edits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmApproveSubmission(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmApproveSubmission && approveMutation.mutate(confirmApproveSubmission)}
            >
              {approveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ThumbsUp className="w-4 h-4 mr-2" />
              )}
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!confirmReturnSubmission}
        onOpenChange={(open) => !open && setConfirmReturnSubmission(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Return this paper for correction?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Returning will allow the teacher to edit and resubmit these marks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmReturnSubmission(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmReturnSubmission && returnMutation.mutate(confirmReturnSubmission)}
            >
              {returnMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4 mr-2" />
              )}
              Return
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
