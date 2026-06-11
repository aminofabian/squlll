"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { fetchAssessments, type AssessmentRecord } from "@/lib/exams/assessments";
import {
  fetchTermAssessmentsWithStudents,
  enterStudentMarks,
  updateStudentMarks,
  type TeacherMarkStudent,
  type AssessmentMark,
} from "@/lib/teacher/teacherMarks";
import { toast } from "sonner";

interface MarkEntry {
  [studentId: string]: number | undefined;
}

interface UseTeacherMarkEntryReturn {
  // Data
  assessments: AssessmentRecord[];
  students: TeacherMarkStudent[];
  marks: MarkEntry;
  selectedAssessment: AssessmentRecord | null;

  // Loading states
  isLoadingAssessments: boolean;
  isLoadingStudents: boolean;
  isSaving: boolean;

  // Actions
  selectAssessment: (assessment: AssessmentRecord | null) => void;
  setMark: (studentId: string, score: number | undefined) => void;
  saveMarks: () => Promise<void>;
  clearMarks: () => void;

  // Stats
  enteredCount: number;
  mean: string;
  highest: number | null;
  lowest: number | null;
}

function useDebounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  const timer = useRef<NodeJS.Timeout | null>(null);
  return useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}

export function useTeacherMarkEntry(): UseTeacherMarkEntryReturn {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const queryClient = useQueryClient();

  const [selectedAssessment, setSelectedAssessment] =
    useState<AssessmentRecord | null>(null);
  const [students, setStudents] = useState<TeacherMarkStudent[]>([]);
  const [marks, setMarks] = useState<MarkEntry>({});
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Fetch assessments
  const assessmentsQuery = useQuery({
    queryKey: ["teacherAssessments", subdomain],
    queryFn: async () => {
      const records = await fetchAssessments(subdomain);
      return records;
    },
    enabled: Boolean(subdomain),
    staleTime: 30_000,
  });

  const assessments = assessmentsQuery.data ?? [];

  // Fetch students when assessment is selected
  const selectAssessment = useCallback(
    async (assessment: AssessmentRecord | null) => {
      setSelectedAssessment(assessment);
      setMarks({});
      setStudents([]);

      if (!assessment || !subdomain) return;

      const gradeLevelId = assessment.tenantGradeLevel?.id;
      const academicYear = assessment.academicYear;
      const term = assessment.term;

      if (!gradeLevelId || !academicYear || !term) {
        toast.error("Assessment is missing required details (grade, year, or term)");
        return;
      }

      setIsLoadingStudents(true);
      try {
        const data = await fetchTermAssessmentsWithStudents(
          subdomain,
          term,
          gradeLevelId,
          academicYear
        );
        setStudents(data.students);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load students"
        );
      } finally {
        setIsLoadingStudents(false);
      }
    },
    [subdomain]
  );

  const setMark = useCallback((studentId: string, score: number | undefined) => {
    setMarks((prev) => {
      const next = { ...prev };
      if (score === undefined || isNaN(score)) {
        delete next[studentId];
      } else {
        next[studentId] = score;
      }
      return next;
    });
  }, []);

  const clearMarks = useCallback(() => {
    setMarks({});
  }, []);

  // Save marks mutation
  const saveMutation = useMutation({
    mutationFn: async ({
      assessmentId,
      marksMap,
    }: {
      assessmentId: string;
      marksMap: MarkEntry;
    }): Promise<AssessmentMark[]> => {
      const entries = Object.entries(marksMap).filter(
        ([, score]) => score !== undefined && !isNaN(score)
      ) as [string, number][];

      if (entries.length === 0) return [];

      const inputs = entries.map(([studentId, score]) => ({
        studentId,
        marks: [{ assessmentId, score }],
      }));

      return enterStudentMarks(subdomain, inputs);
    },
    onSuccess: () => {
      toast.success("Marks saved successfully");
      queryClient.invalidateQueries({ queryKey: ["teacherAssessments"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save marks");
    },
  });

  const saveMarks = useCallback(async () => {
    if (!selectedAssessment) return;
    await saveMutation.mutateAsync({
      assessmentId: selectedAssessment.id,
      marksMap: marks,
    });
  }, [selectedAssessment, marks, saveMutation]);

  // Auto-save debounced
  const debouncedSave = useDebounce(() => {
    if (!selectedAssessment) return;
    const hasMarks = Object.values(marks).some(
      (s) => s !== undefined && !isNaN(s)
    );
    if (hasMarks) {
      saveMutation.mutate({
        assessmentId: selectedAssessment.id,
        marksMap: marks,
      });
    }
  }, 2000);

  useEffect(() => {
    if (selectedAssessment && Object.keys(marks).length > 0) {
      debouncedSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marks, selectedAssessment]);

  // Calculate stats
  const enteredScores = Object.values(marks).filter(
    (s): s is number => s !== undefined && !isNaN(s)
  );
  const enteredCount = enteredScores.length;
  const mean =
    enteredCount > 0
      ? (enteredScores.reduce((a, b) => a + b, 0) / enteredCount).toFixed(2)
      : "-";
  const highest = enteredCount > 0 ? Math.max(...enteredScores) : null;
  const lowest = enteredCount > 0 ? Math.min(...enteredScores) : null;

  return {
    assessments,
    students,
    marks,
    selectedAssessment,
    isLoadingAssessments: assessmentsQuery.isLoading,
    isLoadingStudents,
    isSaving: saveMutation.isPending,
    selectAssessment,
    setMark,
    saveMarks,
    clearMarks,
    enteredCount,
    mean,
    highest,
    lowest,
  };
}
