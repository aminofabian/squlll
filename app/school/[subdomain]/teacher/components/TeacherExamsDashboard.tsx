"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Search,
  BookOpen,
  CalendarDays,
  FileText,
  ArrowRight,
  Upload,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";
import { useTeacherExamAssignments } from "@/lib/hooks/useTeacherExamAssignments";
import {
  fetchExamSessions,
  fetchExamSessionPaperMarkEntry,
  fetchExamSessionMarkSubmissions,
  submitExamPaperMarks,
  bulkImportExamPaperMarks,
  MARK_SUBMISSION_STATUS_LABELS,
  type ExamSessionRecord,
  type ExamPaperRecord,
  type ExamSessionPaperMarkEntry,
  type MarkSubmissionRecord,
} from "@/lib/exams/examSessions";
import { enterStudentMarks } from "@/lib/teacher/teacherMarks";
import { PageHeader } from "./ui/PageHeader";
import { Panel } from "./ui/Panel";
import { EmptyState, ListSkeleton } from "./ui/States";
import { tp } from "../styles/portal";
import { cn } from "@/lib/utils";

interface PaperWithSession extends ExamPaperRecord {
  sessionId: string;
  sessionName: string;
  sessionStatus: string;
  term: number;
  academicYear: string;
}

export default function TeacherExamsDashboard() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const { selectedTerm, availableTerms } = useSelectedTerm();
  const [search, setSearch] = useState("");
  const [selectedPaper, setSelectedPaper] = useState<PaperWithSession | null>(null);

  const academicYear = selectedTerm?.academicYear.name;
  const termNumber = useMemo(() => {
    if (!selectedTerm || availableTerms.length === 0) return undefined;
    const index = availableTerms.findIndex((t) => t.id === selectedTerm.id);
    return index >= 0 ? index + 1 : undefined;
  }, [selectedTerm, availableTerms]);

  const assignmentsQuery = useTeacherExamAssignments();
  const sessionsQuery = useQuery({
    queryKey: ["teacherExamSessions", subdomain, academicYear, termNumber],
    queryFn: () =>
      fetchExamSessions(subdomain, {
        academicYear,
        term: termNumber,
      }),
    enabled: Boolean(subdomain && academicYear && termNumber),
    staleTime: 30_000,
  });

  const papers = useMemo<PaperWithSession[]>(() => {
    const assignments = assignmentsQuery.data;
    if (!assignments || !sessionsQuery.data) return [];

    const enterableSubjectIds = new Set(assignments.subjectIds);
    const enterableGradeIds = new Set(assignments.gradeLevelIds);

    const result: PaperWithSession[] = [];
    for (const session of sessionsQuery.data) {
      for (const paper of session.papers ?? []) {
        const subjectId = paper.tenantSubject?.id ?? paper.tenantSubjectId;
        const gradeId = paper.tenantGradeLevel?.id ?? paper.tenantGradeLevelId;
        if (
          enterableSubjectIds.has(subjectId) &&
          enterableGradeIds.has(gradeId)
        ) {
          result.push({
            ...paper,
            sessionId: session.id,
            sessionName: session.name,
            sessionStatus: session.status,
            term: session.term,
            academicYear: session.academicYear,
          });
        }
      }
    }
    return result;
  }, [assignmentsQuery.data, sessionsQuery.data]);

  const filteredPapers = useMemo(() => {
    if (!search.trim()) return papers;
    const q = search.toLowerCase();
    return papers.filter(
      (p) =>
        (p.tenantSubject?.subject?.name ?? "").toLowerCase().includes(q) ||
        (p.tenantGradeLevel?.gradeLevel?.name ?? "").toLowerCase().includes(q) ||
        p.sessionName.toLowerCase().includes(q)
    );
  }, [papers, search]);

  const sessionIds = useMemo(
    () => [...new Set(filteredPapers.map((p) => p.sessionId))],
    [filteredPapers]
  );

  const submissionsQueries = useQueries({
    queries: sessionIds.map((sessionId) => ({
      queryKey: ["examSessionMarkSubmissions", subdomain, sessionId],
      queryFn: () => fetchExamSessionMarkSubmissions(subdomain, sessionId),
      enabled: Boolean(subdomain && sessionId),
      staleTime: 15_000,
    })),
  });

  const submissionsByPaperId = useMemo(() => {
    const map = new Map<string, MarkSubmissionRecord>();
    for (const query of submissionsQueries) {
      if (!query.data) continue;
      for (const sub of query.data) {
        map.set(sub.examPaper.id, sub);
      }
    }
    return map;
  }, [submissionsQueries]);

  const submissionsLoading = submissionsQueries.some((q) => q.isLoading);

  const groupedBySession = useMemo(() => {
    const map = new Map<string, { session: ExamSessionRecord; papers: PaperWithSession[] }>();
    for (const paper of filteredPapers) {
      const session = sessionsQuery.data?.find((s) => s.id === paper.sessionId);
      if (!session) continue;
      if (!map.has(session.id)) {
        map.set(session.id, { session, papers: [] });
      }
      map.get(session.id)!.papers.push(paper);
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.session.createdAt).getTime() - new Date(a.session.createdAt).getTime()
    );
  }, [filteredPapers, sessionsQuery.data]);

  const isLoading = assignmentsQuery.isLoading || sessionsQuery.isLoading || submissionsLoading;

  const paperStats = useMemo(() => {
    let submitted = 0;
    let approved = 0;
    for (const paper of papers) {
      const submission = submissionsByPaperId.get(paper.id);
      if (!submission) continue;
      if (["SUBMITTED", "UNDER_REVIEW", "APPROVED", "LOCKED"].includes(submission.status)) {
        submitted += 1;
      }
      if (submission.status === "APPROVED" || submission.status === "LOCKED") {
        approved += 1;
      }
    }
    return { total: papers.length, submitted, approved };
  }, [papers, submissionsByPaperId]);

  return (
    <div className={tp.page}>
      <div className={tp.stack}>
        <PageHeader
          eyebrow="Assessment"
          title="Exams"
          description="The papers you've been assigned. Enter marks, send them to your HOD, and follow what's been reviewed."
        />

        <Panel padded={false} delay={1}>
          <div className="flex flex-col gap-4 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <Summary label="Papers" value={paperStats.total} />
              <Summary label="Submitted" value={paperStats.submitted} />
              <Summary label="Approved" value={paperStats.approved} />
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search subject, class or session"
                className={cn(tp.inputSoft, "pl-9")}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-5 sm:p-6">
              <ListSkeleton rows={4} />
            </div>
          ) : papers.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No exam papers assigned"
              description="Papers show up here once your school admin opens an exam session and assigns you to the subject and class."
            />
          ) : groupedBySession.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matches"
              description="Nothing matches that search. Try the subject, class or session name."
            />
          ) : (
            <div className="divide-y divide-border/70">
              {groupedBySession.map(({ session, papers: sessionPapers }) => (
                <section key={session.id}>
                  <div className="flex flex-col gap-2 bg-muted/25 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="min-w-0">
                      <h2 className="truncate text-[14px] font-semibold text-foreground">
                        {session.name}
                      </h2>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3.5" strokeWidth={1.8} />
                          Term {session.term} · {session.academicYear}
                        </span>
                        <span aria-hidden>·</span>
                        <span className="capitalize">{session.status.replace(/_/g, " ")}</span>
                      </p>
                    </div>
                    <span className="shrink-0 text-[11.5px] text-muted-foreground">
                      {sessionPapers.length} {sessionPapers.length === 1 ? "paper" : "papers"}
                    </span>
                  </div>

                  <ul className="divide-y divide-border/60">
                    {sessionPapers.map((paper) => {
                      const slot = paper.timetableSlots?.[0];
                      return (
                        <li
                          key={paper.id}
                          className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
                        >
                          <span className="hidden size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/40 text-muted-foreground sm:flex">
                            <FileText className="size-4" strokeWidth={1.7} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13.5px] font-semibold text-foreground">
                              {paper.tenantSubject?.subject?.name ?? "Unknown subject"}
                              {paper.paperLabel ? (
                                <span className="ml-2 font-normal text-muted-foreground">
                                  {paper.paperLabel}
                                </span>
                              ) : null}
                            </p>
                            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted-foreground">
                              <span>{paper.tenantGradeLevel?.gradeLevel?.name ?? "Unknown class"}</span>
                              <span aria-hidden>·</span>
                              <span>
                                {slot
                                  ? `${new Date(slot.date).toLocaleDateString("en-GB", {
                                      day: "numeric",
                                      month: "short",
                                    })} · ${slot.startTime}`
                                  : "Not scheduled"}
                              </span>
                              <span aria-hidden>·</span>
                              <span>Max {paper.maxScore ?? session.defaultMaxScore ?? "—"}</span>
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-3 sm:justify-end">
                            <PaperStatusBadge submission={submissionsByPaperId.get(paper.id)} />
                            <button
                              type="button"
                              onClick={() => setSelectedPaper(paper)}
                              className="tp-focus inline-flex h-9 items-center gap-1.5 rounded-full border border-border/80 px-4 text-[12.5px] font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/[0.06] hover:text-primary"
                            >
                              {submissionsByPaperId.get(paper.id) ? "Open marks" : "Enter marks"}
                              <ArrowRight className="size-3.5" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {selectedPaper && (
        <TeacherExamMarkEntrySheet
          subdomain={subdomain}
          paper={selectedPaper}
          onClose={() => setSelectedPaper(null)}
        />
      )}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="font-display text-[1.35rem] leading-none text-foreground">{value}</span>
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
        {label}
      </span>
    </span>
  );
}

function PaperStatusBadge({ submission }: { submission?: MarkSubmissionRecord }) {
  if (!submission) {
    return (
      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[10.5px] font-semibold text-muted-foreground">
        Not started
      </span>
    );
  }

  const variants: Record<string, string> = {
    DRAFT: "bg-muted text-muted-foreground",
    RETURNED: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300",
    SUBMITTED: "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300",
    UNDER_REVIEW: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
    APPROVED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
    LOCKED: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${variants[submission.status] ?? variants.DRAFT}`}
    >
      {MARK_SUBMISSION_STATUS_LABELS[submission.status]}
    </span>
  );
}

function TeacherExamMarkEntrySheet({
  subdomain,
  paper,
  onClose,
}: {
  subdomain: string;
  paper: PaperWithSession;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [marks, setMarks] = useState<Record<string, number | undefined>>({});
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const entryQuery = useQuery({
    queryKey: ["examSessionPaperMarkEntry", subdomain, paper.sessionId, paper.id],
    queryFn: () => fetchExamSessionPaperMarkEntry(subdomain, paper.sessionId, paper.id),
    enabled: Boolean(subdomain && paper.sessionId && paper.id),
    staleTime: 15_000,
  });

  const submissionsQuery = useQuery({
    queryKey: ["examSessionMarkSubmissions", subdomain, paper.sessionId],
    queryFn: () => fetchExamSessionMarkSubmissions(subdomain, paper.sessionId),
    enabled: Boolean(subdomain && paper.sessionId),
    staleTime: 15_000,
  });

  const submission = useMemo(() => {
    return (
      submissionsQuery.data?.find(
        (s) => s.examPaper.id === paper.id
      ) ?? null
    );
  }, [submissionsQuery.data, paper.id]);

  const isReadOnly = submission
    ? !["DRAFT", "RETURNED"].includes(submission.status)
    : false;

  React.useEffect(() => {
    if (!entryQuery.data) return;
    const initial: Record<string, number | undefined> = {};
    for (const s of entryQuery.data.students) {
      if (s.score != null) initial[s.id] = s.score;
    }
    setMarks(initial);
    setSearch("");
    setError(null);
  }, [entryQuery.data]);

  const maxScore = entryQuery.data?.maxScore ?? paper.maxScore ?? 100;

  const handleMarkChange = (studentId: string, value: string) => {
    if (isReadOnly) return;
    setError(null);
    if (value === "") {
      setMarks((prev) => ({ ...prev, [studentId]: undefined }));
      return;
    }
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      setError("Marks must be a non-negative number");
      return;
    }
    if (num > maxScore) {
      setError(`Marks must be between 0 and ${maxScore}`);
      return;
    }
    setMarks((prev) => ({ ...prev, [studentId]: num }));
  };

  const filteredStudents = useMemo(() => {
    const students = entryQuery.data?.students ?? [];
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q)
    );
  }, [entryQuery.data?.students, search]);

  const enteredCount = useMemo(
    () => Object.values(marks).filter((s) => s !== undefined && !isNaN(s)).length,
    [marks]
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const assessmentId = entryQuery.data?.assessmentId ?? paper.assessment?.id;
      if (!assessmentId) throw new Error("Assessment not found for this paper");

      const inputs = Object.entries(marks)
        .filter(([, score]) => score !== undefined && !isNaN(score))
        .map(([studentId, score]) => ({
          studentId,
          marks: [{ assessmentId, score: score! }],
        }));

      if (inputs.length === 0) return [];
      return enterStudentMarks(subdomain, inputs);
    },
    onSuccess: () => {
      toast.success("Marks saved successfully");
      queryClient.invalidateQueries({
        queryKey: ["examSessionPaperMarkEntry", subdomain, paper.sessionId, paper.id],
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save marks");
    },
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const text = await file.text();
      const rows = parseMarksCsv(text, maxScore);
      return bulkImportExamPaperMarks(subdomain, {
        sessionId: paper.sessionId,
        paperId: paper.id,
        rows,
      });
    },
    onSuccess: (result) => {
      toast.success(`Imported ${result.importedCount} marks`, {
        description:
          result.errors.length > 0
            ? `${result.skippedCount} skipped · ${result.errors.slice(0, 2).join("; ")}`
            : undefined,
      });
      queryClient.invalidateQueries({
        queryKey: ["examSessionPaperMarkEntry", subdomain, paper.sessionId, paper.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["examSessionMarkSubmissions", subdomain, paper.sessionId],
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (err: Error) => {
      toast.error(err.message || "Import failed");
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!submission) throw new Error("No submission record found for this paper");
      const assessmentId = entryQuery.data?.assessmentId ?? paper.assessment?.id;
      if (!assessmentId) throw new Error("Assessment not found for this paper");

      const inputs = Object.entries(marks)
        .filter(([, score]) => score !== undefined && !isNaN(score))
        .map(([studentId, score]) => ({
          studentId,
          marks: [{ assessmentId, score: score! }],
        }));

      if (inputs.length > 0) {
        await enterStudentMarks(subdomain, inputs);
      }
      return submitExamPaperMarks(subdomain, submission.id);
    },
    onSuccess: () => {
      toast.success("Marks saved and submitted to HOD for review");
      queryClient.invalidateQueries({
        queryKey: ["examSessionPaperMarkEntry", subdomain, paper.sessionId, paper.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["examSessionMarkSubmissions", subdomain, paper.sessionId],
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to submit marks");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importMutation.mutate(file);
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex w-full max-w-4xl flex-col bg-card p-0 md:w-3/4">
        <SheetHeader className="border-b border-border/70 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-primary/75">
                Mark entry
              </p>
              <SheetTitle className="mt-1 font-display text-[1.55rem] leading-tight tracking-[-0.01em] text-foreground">
                {entryQuery.data?.subjectName ?? paper.tenantSubject?.subject?.name}
              </SheetTitle>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                {entryQuery.data?.gradeName ?? paper.tenantGradeLevel?.gradeLevel?.name} · Max{" "}
                {maxScore} · {paper.sessionName}
              </p>
              {submission && (
                <p className="text-xs mt-1">
                  Status:{" "}
                  <Badge variant={isReadOnly ? "secondary" : "default"}>
                    {MARK_SUBMISSION_STATUS_LABELS[submission.status]}
                  </Badge>
                  {submission.reviewNotes && (
                    <span className="ml-2 text-muted-foreground">
                      Note: {submission.reviewNotes}
                    </span>
                  )}
                </p>
              )}
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <span className="sr-only">Close</span>
                <span aria-hidden className="text-2xl leading-none">
                  ×
                </span>
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="tp-scroll flex-1 overflow-auto p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative w-full md:w-1/2">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                type="text"
                placeholder="Find a learner or admission number"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(tp.inputSoft, "pl-9")}
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {!isReadOnly && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={importMutation.isPending}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {importMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Import CSV
                  </Button>
                </>
              )}
              <span className="text-sm text-muted-foreground">
                Entered {enteredCount} / {entryQuery.data?.students.length ?? 0}
              </span>
            </div>
          </div>

          {isReadOnly && (
            <div className="mb-4 rounded-xl border border-border/70 bg-muted/40 px-3.5 py-2.5 text-[12.5px] text-muted-foreground">
              This paper is {MARK_SUBMISSION_STATUS_LABELS[submission!.status].toLowerCase()}.
              Marks are read-only.
            </div>
          )}

          {entryQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading students...</span>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-border/70">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/70 bg-muted/30 text-left text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      <th className="px-3 py-2.5 sm:px-4">#</th>
                      <th className="px-3 py-2.5 sm:px-4">Learner</th>
                      <th className="hidden px-3 py-2.5 sm:table-cell sm:px-4">Adm. no.</th>
                      <th className="px-3 py-2.5 text-right sm:px-4">Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredStudents.map((student, idx) => (
                      <tr key={student.id} className="transition-colors hover:bg-muted/25">
                        <td className="tp-num w-8 px-3 py-2.5 text-[11.5px] text-muted-foreground sm:px-4">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2.5 sm:px-4">
                          <span className="block text-[13px] font-medium text-foreground">
                            {student.name}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-muted-foreground sm:hidden">
                            {student.admissionNumber}
                          </span>
                        </td>
                        <td className="tp-num hidden px-3 py-2.5 text-[12px] text-muted-foreground sm:table-cell sm:px-4">
                          {student.admissionNumber}
                        </td>
                        <td className="px-3 py-2.5 text-right sm:px-4">
                          <Input
                            type="number"
                            min={0}
                            max={maxScore}
                            className="ml-auto h-9 w-20 rounded-lg border-border/80 text-center text-[13px]"
                            value={marks[student.id] ?? ""}
                            onChange={(e) => handleMarkChange(student.id, e.target.value)}
                            placeholder="—"
                            disabled={isReadOnly}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredStudents.length === 0 && !entryQuery.isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  No students found.
                </div>
              )}
              {error && <div className="text-red-600 mt-4 font-medium">{error}</div>}
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-border/70 bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="text-sm text-muted-foreground">
            {saveMutation.isPending
              ? "Saving..."
              : isReadOnly
                ? "Marks are locked for editing."
                : "Review marks before saving or submitting."}
          </div>
          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <Button
                variant="outline"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || enteredCount === 0}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving
                  </>
                ) : (
                  "Save Marks"
                )}
              </Button>
            )}
            {submission && ["DRAFT", "RETURNED"].includes(submission.status) && (
              <Button
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending || enteredCount === 0}
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit to HOD
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function parseMarksCsv(
  text: string,
  maxScore: number,
): { admissionNumber: string; score: number }[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    throw new Error("CSV must include a header row and at least one data row");
  }
  const header = lines[0].toLowerCase().split(",").map((c) => c.trim());
  const admIdx = header.findIndex(
    (h) =>
      h.includes("admission") || h === "adm" || h === "admission_number" || h === "admno"
  );
  const scoreIdx = header.findIndex(
    (h) => h.includes("score") || h === "mark" || h === "marks"
  );
  if (admIdx < 0 || scoreIdx < 0) {
    throw new Error("CSV must have admission and score columns");
  }
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    const score = Number(cols[scoreIdx]);
    if (isNaN(score)) throw new Error(`Invalid score in row: ${line}`);
    if (score < 0 || score > maxScore) {
      throw new Error(`Score ${score} in row "${line}" must be between 0 and ${maxScore}`);
    }
    return { admissionNumber: cols[admIdx], score };
  });
}
