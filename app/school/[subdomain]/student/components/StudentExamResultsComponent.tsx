"use client";

import { useState } from "react";
import {
  Award,
  BookOpen,
  Calendar,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  EmptyState,
  PageHeader,
  Section,
  StateMessage,
  type PillTone,
} from "../_ui";
import { useStudentExamResults } from "@/lib/student/useStudentExamResults";

interface StudentExamResultsComponentProps {
  subdomain: string;
  onBack: () => void;
}

function getSessionGrade(percentage: number): { grade: string; tone: PillTone } {
  if (percentage >= 80) return { grade: "A", tone: "success" };
  if (percentage >= 70) return { grade: "B", tone: "info" };
  if (percentage >= 60) return { grade: "C", tone: "warning" };
  if (percentage >= 50) return { grade: "D", tone: "neutral" };
  return { grade: "E", tone: "danger" };
}

function Metric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "danger";
}) {
  return (
    <div className="flex min-w-[48px] flex-col items-center">
      <span
        className={cn(
          "text-sm font-semibold",
          tone === "danger" ? "text-red-600 dark:text-red-400" : "text-foreground",
        )}
      >
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export default function StudentExamResultsComponent({
  subdomain,
  onBack,
}: StudentExamResultsComponentProps) {
  const { student, sessions, loading, error, refetch } =
    useStudentExamResults(subdomain);

  const [expanded, setExpanded] = useState<string | null>(null);

  const examSessions = sessions;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Results"
        subtitle={student?.name}
        onBack={onBack}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        }
      />

      {error ? (
        <Section padded={false}>
          <StateMessage
            variant="error"
            title="Couldn't load exam results"
            description={error}
            onRetry={() => void refetch()}
          />
        </Section>
      ) : loading && examSessions.length === 0 ? (
        <Section padded={false}>
          <StateMessage variant="loading" title="Loading exam results…" />
        </Section>
      ) : examSessions.length === 0 ? (
        <Section padded={false}>
          <EmptyState
            icon={Award}
            title="No exam results yet"
            description="Your results will appear here once teachers publish them."
          />
        </Section>
      ) : (
        <Section
          title="Exam Sessions"
          description={`${examSessions.length} session${examSessions.length === 1 ? "" : "s"}`}
          icon={Award}
        >
          <div className="space-y-4">
            {examSessions.map((session) => {
              const isOpen = expanded === session.sessionKey;
              const avgScore = Math.round(
                session.results.reduce((sum, r) => sum + r.percentage, 0) /
                  session.results.length,
              );
              const bestScore = Math.max(
                ...session.results.map((r) => r.percentage),
              );
              const worstScore = Math.min(
                ...session.results.map((r) => r.percentage),
              );
              const sessionGrade = getSessionGrade(avgScore);

              return (
                <div
                  key={session.sessionKey}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded(isOpen ? null : session.sessionKey)
                    }
                    aria-expanded={isOpen}
                    className="flex w-full flex-col gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Award className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-foreground">
                          {session.sessionName}
                        </h3>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Term {session.term}, {session.academicYear}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {session.results.length} subjects
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-lg font-semibold",
                          sessionGrade.tone === "success" &&
                            "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
                          sessionGrade.tone === "info" &&
                            "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
                          sessionGrade.tone === "warning" &&
                            "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
                          sessionGrade.tone === "neutral" &&
                            "bg-muted text-muted-foreground",
                          sessionGrade.tone === "danger" &&
                            "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
                        )}
                      >
                        {sessionGrade.grade}
                      </span>
                      <div className="flex items-center gap-3">
                        <Metric label="Avg" value={`${avgScore}%`} />
                        <Metric label="Best" value={`${bestScore}%`} />
                        <Metric label="Lowest" value={`${worstScore}%`} tone="danger" />
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-border bg-muted/20 p-3 sm:p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[420px] text-sm">
                          <thead>
                            <tr className="bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              <th className="px-3 py-2 text-left font-medium">
                                Subject
                              </th>
                              <th className="px-3 py-2 text-center font-medium">
                                Score
                              </th>
                              <th className="hidden px-3 py-2 text-center font-medium sm:table-cell">
                                Type
                              </th>
                              <th className="hidden px-3 py-2 text-center font-medium sm:table-cell">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {session.results.map((result) => (
                              <tr
                                key={result.id}
                                className="transition-colors hover:bg-muted/40"
                              >
                                <td className="px-3 py-3">
                                  <div className="font-medium text-foreground">
                                    {result.subject}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {result.title}
                                  </div>
                                </td>
                                <td className="px-3 py-3">
                                  <div className="flex items-center justify-center gap-2">
                                    <span className="font-semibold text-foreground">
                                      {result.percentage}%
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {result.marksScored}/{result.totalMarks}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {result.grade}
                                    </Badge>
                                  </div>
                                </td>
                                <td className="hidden px-3 py-3 text-center text-muted-foreground sm:table-cell">
                                  {result.type}
                                </td>
                                <td className="hidden px-3 py-3 text-center text-muted-foreground sm:table-cell">
                                  {result.gradedAt
                                    ? new Date(result.gradedAt).toLocaleDateString()
                                    : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}
