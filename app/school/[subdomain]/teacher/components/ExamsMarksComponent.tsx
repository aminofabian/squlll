"use client";

import React, { useState, useMemo } from "react";
import {
  PlusCircle,
  ArrowRight,
  XCircle,
  Save,
  Search,
  Loader2,
} from "lucide-react";
import { useTeacherMarkEntry } from "@/lib/hooks/useTeacherMarkEntry";
import type { AssessmentRecord } from "@/lib/exams/assessments";

interface ExamsMarksComponentProps {
  subdomain: string;
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    upcoming: "bg-blue-100 text-blue-700",
  };
  return (
    map[status.toLowerCase()] ||
    "bg-gray-100 text-gray-700"
  );
}

export default function ExamsMarksComponent({
  subdomain,
}: ExamsMarksComponentProps) {
  const {
    assessments,
    students,
    marks,
    selectedAssessment,
    isLoadingAssessments,
    isLoadingStudents,
    isSaving,
    selectAssessment,
    setMark,
    saveMarks,
    enteredCount,
    mean,
    highest,
    lowest,
  } = useTeacherMarkEntry();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const handleEnterMarks = (assessment: AssessmentRecord) => {
    setDrawerOpen(true);
    setSearch("");
    setVisibleCount(10);
    setError(null);
    selectAssessment(assessment);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    selectAssessment(null);
  };

  const handleMarkChange = (studentId: string, value: string) => {
    setError(null);
    if (value === "") {
      setMark(studentId, undefined);
      return;
    }
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      setError("Marks must be a non-negative number");
      return;
    }
    const maxScore = selectedAssessment?.maxScore ?? 100;
    if (num > maxScore) {
      setError(`Marks must be between 0 and ${maxScore}`);
      return;
    }
    setMark(studentId, num);
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) =>
      s.user.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  const visibleStudents = filteredStudents.slice(0, visibleCount);
  const canShowMore = visibleCount < filteredStudents.length;

  // Marksheet modal
  const [marksheetAssessment, setMarksheetAssessment] =
    useState<AssessmentRecord | null>(null);

  const handleDownloadCSV = (assessment: AssessmentRecord) => {
    const csvRows = [
      ["Student Name", "Marks"],
      ...students.map((s) => [s.user.name, marks[s.id] ?? ""]),
    ];
    const csv = csvRows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${assessment.title}-marksheet.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5 py-8 px-2 md:px-8 transition-colors">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary drop-shadow-sm">
            Assigned Exams
          </h1>
        </div>

        {/* Loading */}
        {isLoadingAssessments && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading assessments...</span>
          </div>
        )}

        {/* Exams List */}
        {!isLoadingAssessments && (
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
            <h2 className="text-xl font-bold mb-6 text-primary">Current Term Exams</h2>
            {assessments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg font-medium">No assessments found</p>
                <p className="text-sm mt-1">
                  Assessments will appear here once created by your school admin.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="text-left font-semibold">Subject</th>
                      <th className="text-left font-semibold">Class</th>
                      <th className="text-left font-semibold">Date</th>
                      <th className="text-left font-semibold">Status</th>
                      <th className="text-left font-semibold">Max Score</th>
                      <th></th>
                      <th className="text-left font-semibold uppercase text-xs">Marksheet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map((exam) => (
                      <tr
                        key={exam.id}
                        className={`border-b last:border-b-0 border-border hover:bg-primary/5 transition ${
                          selectedAssessment?.id === exam.id ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        <td className="py-3 pr-4 font-medium text-foreground">
                          {exam.tenantSubject?.subject?.name ?? "Unknown Subject"}
                        </td>
                        <td className="py-3 pr-4 text-foreground">
                          {exam.tenantGradeLevel?.gradeLevel?.name ?? "Unknown Class"}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {exam.date ? new Date(exam.date).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusBadge(
                              exam.status
                            )}`}
                          >
                            {exam.status.charAt(0).toUpperCase() +
                              exam.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {exam.maxScore ?? "—"}
                        </td>
                        <td className="py-3 pr-4">
                          <button
                            className="flex items-center gap-1 text-primary hover:underline font-semibold"
                            onClick={() => handleEnterMarks(exam)}
                          >
                            Enter Marks <ArrowRight className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="py-3 pr-4">
                          {exam.status.toLowerCase() === "completed" && (
                            <button
                              className="px-4 py-1.5 rounded-lg bg-primary text-green-50 font-semibold shadow hover:bg-primary-dark transition"
                              onClick={() => setMarksheetAssessment(exam)}
                            >
                              Marksheet
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawer for Marksheet Entry */}
      {drawerOpen && selectedAssessment && (
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30 transition-opacity"
            onClick={handleCloseDrawer}
            aria-label="Close marksheet drawer"
          />
          {/* Drawer panel */}
          <div className="relative w-full md:w-3/4 max-w-4xl h-full flex flex-col shadow-lg border-r-2 border-primary/20 bg-gradient-to-br from-card via-white to-primary/10 rounded-r-2xl animate-slideInLeft">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary/20 bg-primary/5 rounded-tr-2xl">
              <div>
                <div className="text-xl font-extrabold text-primary tracking-tight flex items-center gap-2">
                  Marksheet Entry
                  <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                </div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">
                  {selectedAssessment.tenantSubject?.subject?.name ?? "Unknown"} -{" "}
                  {selectedAssessment.tenantGradeLevel?.gradeLevel?.name ?? "Unknown"}
                </div>
              </div>
              <button
                className="text-primary hover:text-primary-dark transition"
                onClick={handleCloseDrawer}
                aria-label="Close"
              >
                <XCircle className="w-7 h-7" />
              </button>
            </div>

            {/* Search and Marksheet Table */}
            <div className="flex-1 overflow-auto p-6 bg-card rounded-br-2xl">
              {/* Stats summary */}
              <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col items-center shadow-lg">
                  <div className="text-xs text-muted-foreground font-semibold">Mean Score</div>
                  <div className="text-2xl font-bold text-primary mt-1">{mean}</div>
                </div>
                <div className="bg-green-100 border border-green-200 rounded-2xl p-4 flex flex-col items-center shadow-lg">
                  <div className="text-xs text-green-700 font-semibold">Highest</div>
                  <div className="text-2xl font-bold text-green-700 mt-1">
                    {highest ?? "—"}
                  </div>
                </div>
                <div className="bg-red-100 border border-red-200 rounded-2xl p-4 flex flex-col items-center shadow-lg">
                  <div className="text-xs text-red-700 font-semibold">Lowest</div>
                  <div className="text-2xl font-bold text-red-700 mt-1">
                    {lowest ?? "—"}
                  </div>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col items-center shadow-lg">
                  <div className="text-xs text-muted-foreground font-semibold">Entered</div>
                  <div className="text-2xl font-bold text-primary mt-1">
                    {enteredCount} / {students.length}
                  </div>
                </div>
              </div>

              <div className="mb-4 flex items-center gap-2">
                <div className="relative w-full md:w-1/2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-primary/30 focus:ring-2 focus:ring-primary outline-none bg-white text-foreground font-medium transition shadow"
                    placeholder="Search student by name..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setVisibleCount(10);
                    }}
                  />
                </div>
              </div>

              {isLoadingStudents ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading students...</span>
                </div>
              ) : (
                <>
                  <table className="min-w-full text-sm border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-muted-foreground">
                        <th className="text-left font-semibold px-2">#</th>
                        <th className="text-left font-semibold px-2">Student Name</th>
                        <th className="text-left font-semibold px-2">Adm. No.</th>
                        <th className="text-left font-semibold px-2">
                          Marks (max {selectedAssessment.maxScore ?? 100})
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleStudents.map((student, idx) => (
                        <tr
                          key={student.id}
                          className="bg-primary/5 hover:bg-primary/10 rounded-lg transition shadow-sm"
                        >
                          <td className="px-2 py-2 font-medium text-muted-foreground w-8">
                            {idx + 1}
                          </td>
                          <td className="px-2 py-2 font-semibold text-foreground">
                            {student.user.name}
                          </td>
                          <td className="px-2 py-2 text-muted-foreground">
                            {student.admission_number}
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              min={0}
                              max={selectedAssessment.maxScore ?? 100}
                              className="w-20 px-2 py-1 rounded-lg border border-primary/30 focus:ring-2 focus:ring-primary outline-none bg-white text-foreground font-semibold text-center transition shadow"
                              value={marks[student.id] ?? ""}
                              onChange={(e) =>
                                handleMarkChange(student.id, e.target.value)
                              }
                              placeholder="—"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {canShowMore && (
                    <div className="flex justify-center mt-4">
                      <button
                        className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary-dark transition"
                        onClick={() => setVisibleCount((c) => c + 10)}
                      >
                        Show More
                      </button>
                    </div>
                  )}
                  {students.length === 0 && !isLoadingStudents && (
                    <div className="text-center py-8 text-muted-foreground">
                      No students found for this assessment.
                    </div>
                  )}
                </>
              )}
              {error && <div className="text-red-600 mt-2 font-medium">{error}</div>}
            </div>

            {/* Footer with save */}
            <div className="p-4 border-t border-primary/20 bg-primary/5 flex items-center justify-between rounded-br-2xl">
              <div className="flex items-center gap-2 text-sm">
                {isSaving ? (
                  <>
                    <Save className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-primary font-medium">Saving...</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    {enteredCount > 0
                      ? "Auto-saving enabled. Click Save to commit now."
                      : "Enter marks to auto-save"}
                  </span>
                )}
              </div>
              <button
                onClick={saveMarks}
                disabled={isSaving || enteredCount === 0}
                className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Marks"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Marksheet modal */}
      {marksheetAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 print:bg-white print:relative print:inset-auto print:z-auto">
          <div className="bg-card w-full h-full max-w-none rounded-none shadow-lg p-0 relative flex flex-col print:p-0 print:shadow-none print:bg-white print:rounded-none print:max-w-full print:w-full print:h-full border-2 border-primary/20">
            <button
              className="absolute top-6 right-8 text-primary hover:text-primary-dark print:hidden z-10"
              onClick={() => setMarksheetAssessment(null)}
              aria-label="Close"
            >
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 6 6 18M6 6l12 12"
                />
              </svg>
            </button>
            {/* Header */}
            <div className="w-full flex flex-col items-center justify-center pt-12 pb-6 bg-gradient-to-b from-primary/10 to-white print:bg-white print:pt-6 print:pb-2">
              <img
                src="/squl-logo.svg"
                alt="School Logo"
                className="w-20 h-20 mb-2 print:w-16 print:h-16"
              />
              <div className="text-2xl md:text-3xl font-extrabold text-primary print:text-black tracking-wide uppercase text-center">
                Official Marksheet
              </div>
              <div className="flex flex-col md:flex-row md:justify-center gap-2 mt-2 text-base text-muted-foreground print:text-black text-center">
                <span>
                  Exam:{" "}
                  <span className="font-semibold text-foreground print:text-black">
                    {marksheetAssessment.tenantSubject?.subject?.name}
                  </span>
                </span>
                <span>|</span>
                <span>
                  Class:{" "}
                  <span className="font-semibold text-foreground print:text-black">
                    {marksheetAssessment.tenantGradeLevel?.gradeLevel?.name}
                  </span>
                </span>
                <span>|</span>
                <span>
                  Date:{" "}
                  <span className="font-semibold text-foreground print:text-black">
                    {marksheetAssessment.date
                      ? new Date(marksheetAssessment.date).toLocaleDateString()
                      : "—"}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex-1 w-full flex flex-col items-center justify-center px-0 md:px-12 print:px-0">
              <table className="w-full max-w-4xl mx-auto text-base border border-primary/20 rounded-2xl overflow-hidden shadow print:border-black print:max-w-full print:text-base mt-8 print:mt-4 bg-white">
                <thead>
                  <tr className="bg-primary/10 print:bg-gray-200 rounded-t-2xl">
                    <th className="text-left font-semibold px-4 py-3 border-b border-primary/20 print:border-black">
                      #
                    </th>
                    <th className="text-left font-semibold px-4 py-3 border-b border-primary/20 print:border-black">
                      Student Name
                    </th>
                    <th className="text-left font-semibold px-4 py-3 border-b border-primary/20 print:border-black">
                      Marks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => (
                    <tr
                      key={student.id}
                      className={
                        idx % 2 === 0
                          ? "bg-white print:bg-white"
                          : "bg-primary/5 print:bg-gray-100"
                      }
                      style={{ boxShadow: "0 1px 4px 0 rgba(36,106,89,0.04)" }}
                    >
                      <td className="px-4 py-3 border-b border-primary/10 print:border-black text-muted-foreground print:text-black">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 border-b border-primary/10 print:border-black font-medium text-foreground print:text-black">
                        {student.user.name}
                      </td>
                      <td className="px-4 py-3 border-b border-primary/10 print:border-black text-foreground print:text-black">
                        {marks[student.id] ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Footer */}
            <div className="flex flex-col md:flex-row justify-between items-end mt-12 mb-8 px-0 md:px-12 print:mt-8 print:mb-4 print:px-0 gap-6 print:gap-2 w-full max-w-4xl mx-auto print:max-w-full">
              <div className="text-base text-muted-foreground print:text-black">
                Generated on:{" "}
                <span className="font-medium text-foreground print:text-black">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-base text-muted-foreground print:text-black mb-2">
                  Teacher&apos;s Signature:
                </div>
                <div className="w-56 h-8 border-b-2 border-primary/40 print:border-black" />
              </div>
            </div>
            <div className="flex gap-2 mt-6 print:hidden justify-center w-full">
              <button
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary-dark transition"
                onClick={() => handleDownloadCSV(marksheetAssessment)}
              >
                Download CSV
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-primary/10 text-primary font-semibold shadow hover:bg-primary/20 border border-primary/20 transition"
                onClick={handlePrint}
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
