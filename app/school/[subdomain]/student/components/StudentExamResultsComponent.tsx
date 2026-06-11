"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, Award, Calendar, RefreshCw
} from "lucide-react";
import { useStudentExamResults } from "@/lib/student/useStudentExamResults";

interface StudentExamResultsComponentProps {
  subdomain: string;
  onBack: () => void;
}

export default function StudentExamResultsComponent({
  subdomain,
  onBack,
}: StudentExamResultsComponentProps) {
  const { student, sessions, loading, error, refetch } =
    useStudentExamResults(subdomain);

  const [expanded, setExpanded] = useState<string | null>(null);

  const examSessions = useMemo(() => sessions, [sessions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <h2 className="text-2xl font-bold text-foreground">Exam Results</h2>
        {student ? (
          <span className="text-sm text-muted-foreground">{student.name}</span>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => void refetch()}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Exam Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading && examSessions.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Loading exam results…
              </div>
            )}
            {!loading && examSessions.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No exam results found yet.
              </div>
            )}
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

              const getSessionGrade = (percentage: number) => {
                if (percentage >= 80)
                  return {
                    grade: "A",
                    color: "text-green-700",
                    bg: "bg-green-100",
                    border: "border-green-300",
                  };
                if (percentage >= 70)
                  return {
                    grade: "B",
                    color: "text-blue-700",
                    bg: "bg-blue-100",
                    border: "border-blue-300",
                  };
                if (percentage >= 60)
                  return {
                    grade: "C",
                    color: "text-amber-700",
                    bg: "bg-amber-100",
                    border: "border-amber-300",
                  };
                if (percentage >= 50)
                  return {
                    grade: "D",
                    color: "text-orange-700",
                    bg: "bg-orange-100",
                    border: "border-orange-300",
                  };
                return {
                  grade: "E",
                  color: "text-red-700",
                  bg: "bg-red-100",
                  border: "border-red-300",
                };
              };

              const sessionGrade = getSessionGrade(avgScore);

              return (
                <div
                  key={session.sessionKey}
                  className="border border-primary/20 bg-white hover:shadow-md transition-all duration-200"
                >
                  <button
                    className="w-full flex flex-col sm:flex-row sm:items-center justify-between min-h-[72px] sm:min-h-[80px] px-3 sm:px-6 py-3 sm:py-4 hover:bg-primary/5 transition-colors relative overflow-hidden group"
                    onClick={() =>
                      setExpanded(isOpen ? null : session.sessionKey)
                    }
                  >
                    <div className="sm:hidden absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300" />
                    <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0 mb-3 sm:mb-0 relative z-10">
                      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 flex items-center justify-center shadow-sm">
                          <Award className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-foreground truncate max-w-[120px] sm:max-w-[200px]">
                            {session.sessionName}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                              Term {session.term}, {session.academicYear}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                              {session.results.length} subjects
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0 relative z-10">
                      <div
                        className={`relative ${sessionGrade.bg} ${sessionGrade.border} border-2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg`}
                      >
                        <div
                          className={`text-lg sm:text-xl font-bold ${sessionGrade.color}`}
                        >
                          {sessionGrade.grade}
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-white border-2 border-primary/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {avgScore}%
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-1 min-w-[48px]">
                        <div className="text-xs sm:text-sm font-bold text-primary leading-none">
                          {avgScore}%
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground leading-none">
                          Avg
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-1 min-w-[48px]">
                        <div className="text-xs sm:text-sm font-bold text-primary leading-none">
                          {bestScore}%
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground leading-none">
                          Best
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-1 min-w-[48px]">
                        <div className="text-xs sm:text-sm font-bold text-orange-600 leading-none">
                          {worstScore}%
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground leading-none">
                          Lowest
                        </div>
                      </div>
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-transform ${isOpen ? "rotate-180" : ""}`}
                      >
                        <span className="text-primary font-bold text-base sm:text-lg">
                          {isOpen ? "▲" : "▼"}
                        </span>
                      </div>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="p-3 sm:p-6 border-t border-primary/10 bg-gray-50">
                      <div className="border border-primary/20 bg-white overflow-hidden">
                        <div className="grid grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-4 bg-primary/10 border-b border-primary/20 font-semibold text-xs sm:text-sm text-primary">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Subject</span>
                            <span className="sm:hidden">Subj</span>
                          </div>
                          <div className="text-center">Score</div>
                          <div className="text-center hidden sm:block">Type</div>
                          <div className="text-center hidden sm:block">Date</div>
                        </div>
                        {session.results.map((result, index) => {
                          return (
                            <div
                              key={result.id}
                              className={`${index % 2 === 0 ? "bg-white" : "bg-primary/5"} hover:bg-primary/10 transition-colors`}
                            >
                              <div className="grid grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-4 items-center border-b border-primary/10">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-foreground text-sm sm:text-base truncate">
                                      {result.subject}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {result.title}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-center gap-2 sm:gap-3">
                                  <div className="text-center">
                                    <div className="text-lg sm:text-xl font-bold text-foreground">
                                      {result.percentage}%
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {result.marksScored}/{result.totalMarks}
                                    </div>
                                  </div>
                                  <Badge
                                    variant={
                                      result.grade.startsWith("A")
                                        ? "default"
                                        : "outline"
                                    }
                                    className="text-xs"
                                  >
                                    {result.grade}
                                  </Badge>
                                </div>
                                <div className="hidden sm:flex items-center justify-center text-sm font-medium text-foreground">
                                  {result.type}
                                </div>
                                <div className="hidden sm:flex items-center justify-center text-sm text-muted-foreground">
                                  {result.gradedAt
                                    ? new Date(result.gradedAt).toLocaleDateString()
                                    : "—"}
                                </div>
                              </div>
                              <div className="p-3 sm:p-4 bg-primary/5">
                                <div className="mb-3 sm:mb-4">
                                  <div className="flex justify-between text-xs text-muted-foreground mb-2 font-medium">
                                    <span>Performance Level</span>
                                    <span>{result.percentage}%</span>
                                  </div>
                                  <div className="w-full bg-primary/20 h-2 sm:h-3 relative">
                                    <div
                                      className="h-2 sm:h-3 bg-primary transition-all duration-300"
                                      style={{ width: `${result.percentage}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="sm:hidden mt-4 p-3 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center p-2 bg-white/50 rounded">
                                      <div className="text-lg font-bold text-primary">
                                        {result.percentage}%
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Score
                                      </div>
                                    </div>
                                    <div className="text-center p-2 bg-white/50 rounded">
                                      <div className="text-lg font-bold text-primary">
                                        {result.grade}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Grade
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
