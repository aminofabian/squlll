"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Search,
  BookOpen,
  CalendarDays,
  GraduationCap,
  FileText,
  ArrowRight,
  Upload,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5 py-8 px-2 md:px-8 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-primary drop-shadow-sm">
              My Exams
            </h1>
            <p className="text-muted-foreground mt-1">
              Enter marks for papers you are assigned to.
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
            <span className="ml-3 text-muted-foreground">Loading your exams...</span>
          </div>
        )}

        {/* Empty states */}
        {!isLoading && papers.length === 0 && (
          <Card className="rounded-2xl shadow-lg border border-border">
            <CardContent className="py-16 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-primary/40 mb-4" />
              <p className="text-lg font-medium text-foreground">No exam papers assigned</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                Papers will appear here once your school admin creates an exam session and assigns
                you to the corresponding subject and class.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Grouped list */}
        {!isLoading &&
          groupedBySession.map(({ session, papers }) => (
            <Card key={session.id} className="rounded-2xl shadow-lg border border-border overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {session.name}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        Term {session.term}, {session.academicYear}
                      </span>
                      <Badge variant="outline">{session.status.replace(/_/g, " ")}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground bg-muted/30">
                        <th className="text-left font-semibold px-6 py-3">Subject</th>
                        <th className="text-left font-semibold px-6 py-3">Class</th>
                        <th className="text-left font-semibold px-6 py-3">Schedule</th>
                        <th className="text-left font-semibold px-6 py-3">Max Score</th>
                        <th className="text-left font-semibold px-6 py-3">Progress</th>
                        <th className="px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {papers.map((paper) => {
                        const slot = paper.timetableSlots?.[0];
                        return (
                          <tr
                            key={paper.id}
                            className="border-b last:border-b-0 border-border hover:bg-primary/5 transition"
                          >
                            <td className="px-6 py-4 font-medium text-foreground">
                              {paper.tenantSubject?.subject?.name ?? "Unknown Subject"}
                              {paper.paperLabel && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {paper.paperLabel}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-foreground">
                              {paper.tenantGradeLevel?.gradeLevel?.name ?? "Unknown Class"}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {slot
                                ? `${new Date(slot.date).toLocaleDateString()} · ${slot.startTime}`
                                : "—"}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {paper.maxScore ?? session.defaultMaxScore ?? "—"}
                            </td>
                            <td className="px-6 py-4">
                              <PaperStatusBadge submission={submissionsByPaperId.get(paper.id)} />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                size="sm"
                                onClick={() => setSelectedPaper(paper)}
                              >
                                Enter Marks
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
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

function PaperStatusBadge({ submission }: { submission?: MarkSubmissionRecord }) {
  if (!submission) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
        Draft
      </span>
    );
  }

  const variants: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    RETURNED: "bg-red-100 text-red-700",
    SUBMITTED: "bg-blue-100 text-blue-700",
    UNDER_REVIEW: "bg-purple-100 text-purple-700",
    APPROVED: "bg-green-100 text-green-700",
    LOCKED: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${variants[submission.status] ?? variants.DRAFT}`}
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
      <SheetContent side="right" className="w-full md:w-3/4 max-w-4xl p-0 flex flex-col">
        <SheetHeader className="p-6 border-b bg-primary/5">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-bold text-primary flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Mark Entry
              </SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {entryQuery.data?.subjectName ?? paper.tenantSubject?.subject?.name} ·{" "}
                {entryQuery.data?.gradeName ?? paper.tenantGradeLevel?.gradeLevel?.name} ·{" "}
                Max {maxScore}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Session: {paper.sessionName}
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

        <div className="flex-1 overflow-auto p-6">
          <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search student by name or admission number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
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
            <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-700 text-sm">
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
              <table className="min-w-full text-sm border-separate border-spacing-y-1">
                <thead>
                  <tr className="text-muted-foreground text-left">
                    <th className="font-semibold px-2 py-2">#</th>
                    <th className="font-semibold px-2 py-2">Student Name</th>
                    <th className="font-semibold px-2 py-2">Adm. No.</th>
                    <th className="font-semibold px-2 py-2">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => (
                    <tr
                      key={student.id}
                      className="bg-primary/5 hover:bg-primary/10 rounded-lg transition"
                    >
                      <td className="px-2 py-2 font-medium text-muted-foreground w-8 rounded-l-lg">
                        {idx + 1}
                      </td>
                      <td className="px-2 py-2 font-semibold text-foreground">
                        {student.name}
                      </td>
                      <td className="px-2 py-2 text-muted-foreground">
                        {student.admissionNumber}
                      </td>
                      <td className="px-2 py-2 rounded-r-lg">
                        <Input
                          type="number"
                          min={0}
                          max={maxScore}
                          className="w-24 text-center"
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
              {filteredStudents.length === 0 && !entryQuery.isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  No students found.
                </div>
              )}
              {error && <div className="text-red-600 mt-4 font-medium">{error}</div>}
            </>
          )}
        </div>

        <div className="p-4 border-t bg-primary/5 flex items-center justify-between gap-4">
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
