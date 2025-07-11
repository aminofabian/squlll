"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, BookOpen, Award, Eye, Download, BarChart3, Calendar
} from "lucide-react";
import { mockStudentResults, mockExams } from "@/lib/data/mockExams";

// Placeholder for current student id (replace with real auth)
const studentId = "student-1";

export default function StudentExamResultsComponent({ onBack }: { onBack: () => void }) {
  const studentResults = mockStudentResults.filter(r => r.studentId === studentId);

  // Helper for performance grade
  const getPerformanceGrade = (percentage: number) => {
    if (percentage >= 80) return { grade: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 70) return { grade: 'Very Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percentage >= 60) return { grade: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (percentage >= 50) return { grade: 'Average', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { grade: 'Below Average', color: 'text-red-600', bg: 'bg-red-50' };
  };

  // Exam sessions (grouped)
  const examSessions = useMemo(() => {
    const sessionsMap = new Map();
    studentResults.forEach(result => {
      const exam = mockExams.find(e => e.id === result.examId);
      if (!exam) return;
      const sessionKey = `${exam.examType}-${exam.term}-${exam.academicYear}`;
      if (!sessionsMap.has(sessionKey)) {
        sessionsMap.set(sessionKey, {
          sessionKey,
          sessionName: `${exam.term} ${exam.examType} Exams`,
          examType: exam.examType,
          term: exam.term,
          academicYear: exam.academicYear,
          dateRange: { start: new Date(exam.dateAdministered), end: new Date(exam.dateAdministered) },
          results: [],
        });
      }
      const session = sessionsMap.get(sessionKey);
      session.results.push({ ...result, exam });
      const examDate = new Date(exam.dateAdministered);
      if (examDate < session.dateRange.start) session.dateRange.start = examDate;
      if (examDate > session.dateRange.end) session.dateRange.end = examDate;
    });
    return Array.from(sessionsMap.values()).sort((a, b) => b.dateRange.start - a.dateRange.start);
  }, [studentResults]);

  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <h2 className="text-2xl font-bold text-foreground">Exam Results</h2>
      </div>
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Exam Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {examSessions.length === 0 && (
              <div className="text-center text-muted-foreground py-8">No exam results found.</div>
            )}
            {examSessions.map(session => {
              const isOpen = expanded === session.sessionKey;
              const avgScore = Math.round(session.results.reduce((sum: any, r: any) => sum + r.percentage, 0) / session.results.length);
              const bestScore = Math.max(...session.results.map((r: any) => r.percentage));
              const worstScore = Math.min(...session.results.map((r: any) => r.percentage));
              
              // Calculate overall grade for the session
              const getSessionGrade = (percentage: number) => {
                if (percentage >= 80) return { grade: 'A', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' };
                if (percentage >= 70) return { grade: 'B', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' };
                if (percentage >= 60) return { grade: 'C', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' };
                if (percentage >= 50) return { grade: 'D', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' };
                return { grade: 'E', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' };
              };
              
              const sessionGrade = getSessionGrade(avgScore);
              
              // Mock: Assume every session has a report card except the last one
              const hasReportCard = session !== examSessions[examSessions.length - 1];
              
              return (
                <div key={session.sessionKey} className="border border-primary/20 bg-white hover:shadow-md transition-all duration-200">
                  <button
                    className="w-full flex flex-col sm:flex-row sm:items-center justify-between min-h-[72px] sm:min-h-[80px] px-3 sm:px-6 py-3 sm:py-4 hover:bg-primary/5 transition-colors relative overflow-hidden group"
                    onClick={() => setExpanded(isOpen ? null : session.sessionKey)}
                  >
                    {/* Mobile-only decorative element */}
                    <div className="sm:hidden absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
                    <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0 mb-3 sm:mb-0 relative z-10">
                      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 flex items-center justify-center shadow-sm">
                          <Award className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-foreground truncate max-w-[120px] sm:max-w-[200px]">{session.sessionName}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                              {session.term}, {session.academicYear}
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
                      {/* Creative Grade Display */}
                      <div className={`relative ${sessionGrade.bg} ${sessionGrade.border} border-2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg`}>
                        <div className={`text-lg sm:text-xl font-bold ${sessionGrade.color}`}>{sessionGrade.grade}</div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-white border-2 border-primary/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{avgScore}%</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-1 min-w-[48px]">
                        <div className="text-xs sm:text-sm font-bold text-primary leading-none">{avgScore}%</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground leading-none">Avg</div>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-1 min-w-[48px]">
                        <div className="text-xs sm:text-sm font-bold text-primary leading-none">{bestScore}%</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground leading-none">Best</div>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-1 min-w-[48px]">
                        <div className="text-xs sm:text-sm font-bold text-orange-600 leading-none">{worstScore}%</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground leading-none">Lowest</div>
                      </div>
                      {/* Download Report Card Button */}
                      {hasReportCard && (
                        <button
                          className="flex items-center justify-center gap-1 w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors text-xs sm:text-sm font-semibold"
                          title="Download Report Card"
                        >
                          <Download className="h-4 w-4" />
                          <span className="hidden sm:inline">Report Card</span>
                        </button>
                      )}
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                        <span className="text-primary font-bold text-base sm:text-lg">{isOpen ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {/* Mobile-only performance indicator */}
                    <div className="sm:hidden mt-3 w-full bg-primary/5 rounded-lg p-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Performance</span>
                        <span className="font-semibold text-primary">{avgScore}%</span>
                      </div>
                      <div className="w-full bg-primary/10 h-1.5 mt-1 rounded-full overflow-hidden">
                        <div 
                          className="h-1.5 bg-primary transition-all duration-300"
                          style={{ width: `${avgScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="p-3 sm:p-6 border-t border-primary/10 bg-gray-50">
                      <div className="border border-primary/20 bg-white overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-4 bg-primary/10 border-b border-primary/20 font-semibold text-xs sm:text-sm text-primary">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Subject</span>
                            <span className="sm:hidden">Subj</span>
                          </div>
                          <div className="text-center">Score</div>
                          <div className="text-center hidden sm:block">Position</div>
                          <div className="text-center hidden sm:block">Actions</div>
                        </div>
                        {/* Table Rows */}
                        {session.results.map((result: any, index: number) => {
                          const resultGrade = getPerformanceGrade(result.percentage);
                          return (
                            <div key={result.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-primary/5'} hover:bg-primary/10 transition-colors`}>
                              {/* First row - Main data */}
                              <div className="grid grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-4 items-center border-b border-primary/10">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-foreground text-sm sm:text-base truncate">{result.exam.subject.name}</div>
                                    <div className="text-xs text-muted-foreground">Code: {result.exam.subject.code}</div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-center gap-2 sm:gap-3">
                                  <div className="text-center">
                                    <div className="text-lg sm:text-xl font-bold text-foreground">{result.percentage}%</div>
                                    <div className="text-xs text-muted-foreground">{result.marksScored}/{result.totalMarks}</div>
                                  </div>
                                  <Badge variant={result.grade.startsWith('A') ? 'default' : 'outline'} className="text-xs">
                                    {result.grade}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-center gap-1 sm:gap-2 hidden sm:flex">
                                  <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                                  <span className="font-semibold text-foreground text-sm">#{result.positionInClass}</span>
                                </div>
                                <div className="flex items-center justify-center gap-1 hidden sm:flex">
                                  <Button size="sm" variant="ghost" className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-primary/20">
                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-primary/20">
                                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </div>
                              </div>
                              {/* Second row - Details */}
                              <div className="p-3 sm:p-4 bg-primary/5">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-3 sm:mb-4">
                                  <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground font-medium">Performance</div>
                                    <div className={`text-sm font-semibold ${resultGrade.color}`}>{resultGrade.grade}</div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground font-medium">Status</div>
                                    <div className="text-sm font-semibold text-primary flex items-center gap-1">
                                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                                      Completed
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground font-medium">Graded By</div>
                                    <div className="text-sm font-semibold text-foreground truncate">{result.gradedBy?.name || 'N/A'}</div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground font-medium">Date</div>
                                    <div className="text-sm font-semibold text-foreground">
                                      {result.gradedAt ? new Date(result.gradedAt).toLocaleDateString() : 'N/A'}
                                    </div>
                                  </div>
                                </div>
                                {/* Progress bar */}
                                <div className="mb-3 sm:mb-4">
                                  <div className="flex justify-between text-xs text-muted-foreground mb-2 font-medium">
                                    <span>Performance Level</span>
                                    <span>{result.percentage}%</span>
                                  </div>
                                  <div className="w-full bg-primary/20 h-2 sm:h-3 relative">
                                    <div 
                                      className={`h-2 sm:h-3 ${
                                        result.percentage >= 80 ? 'bg-primary' :
                                        result.percentage >= 70 ? 'bg-primary/80' :
                                        result.percentage >= 60 ? 'bg-primary/60' :
                                        result.percentage >= 50 ? 'bg-primary/40' :
                                        'bg-primary/20'
                                      } transition-all duration-300`}
                                      style={{ width: `${result.percentage}%` }}
                                    ></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-xs font-bold text-white drop-shadow-sm">
                                        {result.percentage >= 80 ? 'Excellent' :
                                         result.percentage >= 70 ? 'Very Good' :
                                         result.percentage >= 60 ? 'Good' :
                                         result.percentage >= 50 ? 'Average' :
                                         'Below Average'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {/* Teacher comment */}
                                {result.teacherComment && (
                                  <div className="p-3 sm:p-4 bg-white border border-primary/20">
                                    <div className="flex items-start gap-2 sm:gap-3">
                                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-primary">T</span>
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-xs text-muted-foreground font-medium mb-1">Teacher's Comment</div>
                                        <p className="text-sm text-foreground italic">"{result.teacherComment}"</p>
                                        {result.gradedBy && (
                                          <p className="text-xs text-primary mt-2 font-medium">- {result.gradedBy.name}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {/* Mobile-specific creative styling */}
                                <div className="sm:hidden mt-4 p-3 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-primary">Quick Stats</span>
                                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                      <BarChart3 className="h-4 w-4 text-primary" />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center p-2 bg-white/50 rounded">
                                      <div className="text-lg font-bold text-primary">{result.percentage}%</div>
                                      <div className="text-xs text-muted-foreground">Score</div>
                                    </div>
                                    <div className="text-center p-2 bg-white/50 rounded">
                                      <div className="text-lg font-bold text-primary">#{result.positionInClass}</div>
                                      <div className="text-xs text-muted-foreground">Rank</div>
                                    </div>
                                    <div className="text-center p-2 bg-white/50 rounded">
                                      <div className="text-lg font-bold text-primary">{result.grade}</div>
                                      <div className="text-xs text-muted-foreground">Grade</div>
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