"use client";

import { useState, useMemo, useEffect, useRef, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useToast } from "@/components/ui/use-toast";
import { useTenantSubjects } from "@/lib/hooks/useTenantSubjects";
import { useGradeLevelsForSchoolType } from "@/lib/hooks/useGradeLevelsForSchoolType";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  GraduationCap,
  Loader2,
  Lock,
  Pencil,
  School,
  Search,
  X,
  Check,
} from "lucide-react";
import { teachersPanel } from "./teachers-ui";

type TeacherSubject = { id: string; name: string };
type TeacherGrade = {
  id: string;
  gradeLevel?: { name: string };
};
type TeacherStream = {
  id: string;
  stream?: { name: string };
  tenantGradeLevel?: { id: string; gradeLevel?: { name: string } };
};

interface TeacherAcademicEditorProps {
  teacherId: string;
  teacherName: string;
  initialSubjectIds: string[];
  initialGradeLevelIds: string[];
  initialStreamIds: string[];
  tenantSubjects: TeacherSubject[];
  tenantGradeLevels: TeacherGrade[];
  tenantStreams: TeacherStream[];
  onSaved: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

const UPDATE_TEACHER_ASSIGNMENTS = `
  mutation UpdateTeacherAssignments($input: UpdateTeacherAssignmentsInput!) {
    updateTeacherAssignments(input: $input) {
      id
    }
  }
`;

type StepId = "grades" | "subjects" | "streams";

const STEPS: { id: StepId; label: string; icon: typeof GraduationCap }[] = [
  { id: "grades", label: "Grades", icon: GraduationCap },
  { id: "subjects", label: "Subjects", icon: BookOpen },
  { id: "streams", label: "Streams", icon: School },
];

function StepPill({
  step,
  index,
  active,
  done,
  onClick,
}: {
  step: (typeof STEPS)[number];
  index: number;
  active: boolean;
  done: boolean;
  onClick: () => void;
}) {
  const Icon = step.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border px-2 py-1.5 text-[11px] font-medium transition-all",
        active
          ? "border-primary bg-primary text-white shadow-sm shadow-primary/20"
          : done
            ? "border-primary/30 bg-primary/10 text-primary-dark dark:text-primary-light"
            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400",
      )}
    >
      {done && !active ? (
        <Check className="h-3 w-3 shrink-0" />
      ) : (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-black/10 text-[9px] font-bold">
          {index + 1}
        </span>
      )}
      <span className="truncate">{step.label}</span>
    </button>
  );
}

function SelectChip({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-all",
        checked
          ? "border-primary bg-primary/10 text-primary-dark ring-1 ring-primary/25 dark:text-primary-light"
          : "border-slate-200/80 bg-white text-slate-600 hover:border-primary/30 hover:bg-primary/[0.04] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
      )}
    >
      {label}
    </button>
  );
}

function StepCard({
  step,
  stepNumber,
  title,
  description,
  count,
  locked,
  lockMessage,
  previousStepLabel,
  onGoToPrevious,
  children,
}: {
  step: StepId;
  stepNumber: number;
  title: string;
  description: string;
  count: number;
  locked?: boolean;
  lockMessage?: string;
  previousStepLabel?: string;
  onGoToPrevious?: () => void;
  children: ReactNode;
}) {
  const Icon = STEPS.find((s) => s.id === step)?.icon ?? BookOpen;

  return (
    <section
      className={cn(
        teachersPanel,
        locked && "opacity-95",
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex min-w-0 items-start gap-2.5">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              locked
                ? "bg-slate-100 text-slate-400 dark:bg-slate-800"
                : "bg-primary/10 text-primary",
            )}
          >
            {locked ? <Lock className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {stepNumber}. {title}
              </h3>
              {count > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-primary">
                  {count} selected
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {locked ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-5 text-center dark:border-slate-700 dark:bg-slate-800/30">
            <Lock className="mx-auto mb-2 h-5 w-5 text-slate-300" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {lockMessage}
            </p>
            {onGoToPrevious && previousStepLabel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onGoToPrevious}
                className="mt-3 h-8 rounded-full border-primary/25 text-xs text-primary hover:bg-primary/5"
              >
                Go back to {previousStepLabel}
              </Button>
            )}
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

function CurriculumGroup({
  title,
  selectedCount,
  totalCount,
  onSelectAll,
  onClear,
  children,
}: {
  title: string;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClear: () => void;
  children: ReactNode;
}) {
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {title}
        </p>
        <button
          type="button"
          onClick={allSelected ? onClear : onSelectAll}
          className="rounded-md px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/5"
        >
          {allSelected ? "Clear" : "Select all"}
        </button>
      </div>
      {children}
    </div>
  );
}

function GradeGroupHeader({
  gradeNames,
  levelName,
  selectedCount,
  totalCount,
  onSelectAll,
  onClear,
  isComplete,
}: {
  gradeNames: string[];
  levelName: string;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClear: () => void;
  isComplete: boolean;
}) {
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {gradeNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary-dark dark:text-primary-light"
            >
              {name}
            </span>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-slate-400">{levelName}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums",
            isComplete
              ? "bg-primary/10 text-primary"
              : selectedCount > 0
                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800",
          )}
        >
          {selectedCount}/{totalCount}
        </span>
        {totalCount > 0 && (
          <button
            type="button"
            onClick={allSelected ? onClear : onSelectAll}
            className="text-[10px] font-medium text-primary hover:underline"
          >
            {allSelected ? "Clear all" : "Select all"}
          </button>
        )}
      </div>
    </div>
  );
}

function SelectedGradesBar({
  grades,
  activeGradeId,
  onGradeClick,
}: {
  grades: Array<{
    id: string;
    name: string;
    totalSubjects: number;
    selectedCount: number;
  }>;
  activeGradeId: string | null;
  onGradeClick: (gradeId: string) => void;
}) {
  if (grades.length === 0) return null;

  return (
    <div className="mb-4 rounded-xl border border-slate-200/80 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Your grades
      </p>
      <div className="flex flex-wrap gap-1.5">
        {grades.map((grade) => {
          const done =
            grade.totalSubjects > 0 &&
            grade.selectedCount === grade.totalSubjects;
          const started = grade.selectedCount > 0;

          return (
            <button
              key={grade.id}
              type="button"
              onClick={() => onGradeClick(grade.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all",
                activeGradeId === grade.id
                  ? "border-primary bg-primary text-white shadow-sm"
                  : done
                    ? "border-primary/30 bg-primary/5 text-primary-dark dark:text-primary-light"
                    : started
                      ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-primary/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
              )}
            >
              {done && activeGradeId !== grade.id && (
                <Check className="h-3 w-3 shrink-0" />
              )}
              {grade.name}
              <span
                className={cn(
                  "tabular-nums opacity-70",
                  activeGradeId === grade.id && "opacity-90",
                )}
              >
                {grade.selectedCount}/{grade.totalSubjects}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TeacherAcademicEditor({
  teacherId,
  teacherName,
  initialSubjectIds,
  initialGradeLevelIds,
  initialStreamIds,
  onSaved,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: TeacherAcademicEditorProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { config } = useSchoolConfigStore();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState<StepId>("grades");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [activeGradeId, setActiveGradeId] = useState<string | null>(null);
  const [selectedGradeIds, setSelectedGradeIds] = useState<string[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [selectedStreamIds, setSelectedStreamIds] = useState<string[]>([]);

  const gradesRef = useRef<HTMLElement>(null);
  const subjectsRef = useRef<HTMLElement>(null);
  const streamsRef = useRef<HTMLElement>(null);
  const gradeSectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const { data: tenantSubjects = [], isLoading: subjectsLoading } =
    useTenantSubjects();
  const { data: gradeLevelsData = [], isLoading: gradesLoading } =
    useGradeLevelsForSchoolType(open);

  const flatGrades = useMemo(
    () =>
      gradeLevelsData.map((gl) => ({
        id: gl.id,
        name: gl.gradeLevel.name,
        curriculum: gl.curriculum.name,
      })),
    [gradeLevelsData],
  );

  const gradesByCurriculum = useMemo(() => {
    const groups = new Map<string, typeof flatGrades>();
    for (const grade of flatGrades) {
      const list = groups.get(grade.curriculum) ?? [];
      list.push(grade);
      groups.set(grade.curriculum, list);
    }
    return Array.from(groups.entries());
  }, [flatGrades]);

  const allSubjects = useMemo(
    () =>
      tenantSubjects
        .filter((ts) => ts.isActive !== false)
        .map((ts) => ({
          id: ts.id,
          name: ts.subject?.name || ts.customSubject?.name || "Unknown Subject",
          code: ts.subject?.code || ts.customSubject?.code || "",
          curriculum: ts.curriculum.name,
          curriculumId: ts.curriculum.id,
        })),
    [tenantSubjects],
  );

  const prevGradesDone = useRef(false);

  const subjectsByGradeId = useMemo(() => {
    const map = new Map<
      string,
      Array<{
        id: string;
        name: string;
        code: string;
        curriculumId: string;
      }>
    >();

    for (const gradeId of selectedGradeIds) {
      const level = config?.selectedLevels.find((l) =>
        l.gradeLevels?.some((g) => g.id === gradeId),
      );
      const glData = gradeLevelsData.find((g) => g.id === gradeId);

      if (level) {
        const allowedNames = new Set(
          level.subjects.map((s) => s.name.toLowerCase().trim()),
        );
        const allowedCodes = new Set(
          level.subjects
            .map((s) => s.code?.toLowerCase().trim())
            .filter(Boolean) as string[],
        );

        map.set(
          gradeId,
          allSubjects.filter((subject) => {
            if (subject.curriculumId !== level.id) return false;
            const name = subject.name.toLowerCase().trim();
            const code = subject.code.toLowerCase().trim();
            return (
              allowedNames.has(name) ||
              (code.length > 0 && allowedCodes.has(code))
            );
          }),
        );
        continue;
      }

      if (glData) {
        map.set(
          gradeId,
          allSubjects.filter(
            (subject) => subject.curriculumId === glData.curriculum.id,
          ),
        );
        continue;
      }

      map.set(gradeId, []);
    }

    return map;
  }, [allSubjects, selectedGradeIds, config?.selectedLevels, gradeLevelsData]);

  const subjectSectionsByGrade = useMemo(() => {
    const sortedGradeIds = [...selectedGradeIds].sort((a, b) => {
      const aOrder = gradeLevelsData.find((g) => g.id === a)?.sortOrder ?? 0;
      const bOrder = gradeLevelsData.find((g) => g.id === b)?.sortOrder ?? 0;
      return aOrder - bOrder;
    });

    const q = subjectSearch.trim().toLowerCase();

    return sortedGradeIds.map((gradeId) => {
      const gradeMeta = flatGrades.find((g) => g.id === gradeId);
      const level = config?.selectedLevels.find((l) =>
        l.gradeLevels?.some((g) => g.id === gradeId),
      );
      const allForGrade = subjectsByGradeId.get(gradeId) ?? [];
      const subjects = q
        ? allForGrade.filter((s) => s.name.toLowerCase().includes(q))
        : allForGrade;
      const selectedCount = allForGrade.filter((s) =>
        selectedSubjectIds.includes(s.id),
      ).length;

      return {
        gradeId,
        gradeName: gradeMeta?.name ?? "Unknown grade",
        levelName: level?.name ?? gradeMeta?.curriculum ?? "",
        subjects,
        selectedCount,
        totalSubjects: allForGrade.length,
        isComplete:
          allForGrade.length > 0 && selectedCount === allForGrade.length,
      };
    });
  }, [
    selectedGradeIds,
    gradeLevelsData,
    flatGrades,
    config?.selectedLevels,
    subjectsByGradeId,
    subjectSearch,
    selectedSubjectIds,
  ]);

  const subjectsForSelectedGrades = useMemo(() => {
    const seen = new Set<string>();
    const merged: Array<{ id: string; name: string }> = [];
    for (const subjects of subjectsByGradeId.values()) {
      for (const subject of subjects) {
        if (!seen.has(subject.id)) {
          seen.add(subject.id);
          merged.push(subject);
        }
      }
    }
    return merged;
  }, [subjectsByGradeId]);

  const gradeNavItems = useMemo(
    () =>
      subjectSectionsByGrade.map((section) => ({
        id: section.gradeId,
        name: section.gradeName,
        totalSubjects: section.totalSubjects,
        selectedCount: section.selectedCount,
      })),
    [subjectSectionsByGrade],
  );

  const availableStreams = useMemo(
    () =>
      gradeLevelsData.flatMap((gl) =>
        gl.tenantStreams.map((ts) => ({
          id: ts.id,
          name: ts.stream.name,
          gradeId: gl.id,
          gradeName: gl.gradeLevel.name,
        })),
      ),
    [gradeLevelsData],
  );

  const streamsForSelectedGrades = useMemo(
    () =>
      availableStreams.filter((s) => selectedGradeIds.includes(s.gradeId)),
    [availableStreams, selectedGradeIds],
  );

  const streamsByGrade = useMemo(() => {
    const groups = new Map<string, typeof streamsForSelectedGrades>();
    for (const stream of streamsForSelectedGrades) {
      const list = groups.get(stream.gradeName) ?? [];
      list.push(stream);
      groups.set(stream.gradeName, list);
    }
    return Array.from(groups.entries());
  }, [streamsForSelectedGrades]);

  useEffect(() => {
    if (!open) return;
    setSelectedGradeIds(initialGradeLevelIds);
    setSelectedSubjectIds(initialSubjectIds);
    setSelectedStreamIds(initialStreamIds);
    setSubjectSearch("");
    setActiveStep("grades");
    setActiveGradeId(initialGradeLevelIds[0] ?? null);
    prevGradesDone.current = initialGradeLevelIds.length > 0;
  }, [open, initialGradeLevelIds, initialSubjectIds, initialStreamIds]);

  useEffect(() => {
    if (!open || selectedGradeIds.length === 0) return;
    const allowedIds = new Set(subjectsForSelectedGrades.map((s) => s.id));
    setSelectedSubjectIds((prev) => {
      const next = prev.filter((id) => allowedIds.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [open, selectedGradeIds, subjectsForSelectedGrades]);

  const scrollToStep = (step: StepId) => {
    setActiveStep(step);
    const ref =
      step === "grades"
        ? gradesRef
        : step === "subjects"
          ? subjectsRef
          : streamsRef;
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToGradeSection = (gradeId: string) => {
    setActiveStep("subjects");
    setActiveGradeId(gradeId);
    gradeSectionRefs.current[gradeId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const toggleId = (
    id: string,
    current: string[],
    setter: (ids: string[]) => void,
  ) => {
    setter(
      current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id],
    );
  };

  const handleGradeToggle = (gradeId: string, checked: boolean) => {
    if (checked) {
      setSelectedGradeIds((prev) => [...prev, gradeId]);
      setActiveGradeId(gradeId);
    } else {
      setSelectedGradeIds((prev) => prev.filter((id) => id !== gradeId));
      if (activeGradeId === gradeId) {
        setActiveGradeId(null);
      }
      setSelectedStreamIds((prev) =>
        prev.filter(
          (id) =>
            !availableStreams.some(
              (s) => s.id === id && s.gradeId === gradeId,
            ),
        ),
      );
    }
  };

  const handleSave = async () => {
    if (selectedGradeIds.length === 0) {
      toast({
        title: "Select at least one grade",
        description: "Choose the grade levels this teacher can teach.",
        variant: "destructive",
      });
      scrollToStep("grades");
      return;
    }

    if (selectedSubjectIds.length === 0) {
      toast({
        title: "Select at least one subject",
        description: "Choose the subjects this teacher can teach.",
        variant: "destructive",
      });
      scrollToStep("subjects");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: UPDATE_TEACHER_ASSIGNMENTS,
          variables: {
            input: {
              teacherId,
              tenantSubjectIds: selectedSubjectIds,
              tenantGradeLevelIds: selectedGradeIds,
              tenantStreamIds: selectedStreamIds,
            },
          },
        }),
      });

      const result = await response.json();
      if (result.errors?.length) {
        throw new Error(result.errors[0]?.message || "Failed to save");
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["getTeachers"] }),
        queryClient.invalidateQueries({ queryKey: ["tenantSubjects"] }),
      ]);

      toast({
        title: "Assignments updated",
        description: `${teacherName}'s subjects and classes have been saved.`,
      });
      setOpen(false);
      onSaved();
    } catch (err) {
      toast({
        title: "Could not save assignments",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const loading = subjectsLoading || gradesLoading;
  const gradesDone = selectedGradeIds.length > 0;
  const subjectsDone = selectedSubjectIds.length > 0;
  const canSave = gradesDone && subjectsDone && !loading && !saving;

  useEffect(() => {
    if (gradesDone && !prevGradesDone.current) {
      setActiveStep("subjects");
      const firstGrade = [...selectedGradeIds].sort((a, b) => {
        const aOrder = gradeLevelsData.find((g) => g.id === a)?.sortOrder ?? 0;
        const bOrder = gradeLevelsData.find((g) => g.id === b)?.sortOrder ?? 0;
        return aOrder - bOrder;
      })[0];
      if (firstGrade) setActiveGradeId(firstGrade);
      setTimeout(() => {
        if (firstGrade) {
          gradeSectionRefs.current[firstGrade]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        } else {
          subjectsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    }
    prevGradesDone.current = gradesDone;
  }, [gradesDone, selectedGradeIds, gradeLevelsData]);

  const footerHint = !gradesDone
    ? "Start by selecting at least one grade level"
    : !subjectsDone
      ? "Pick subjects for each grade — tap a grade above to jump to it"
      : "Optional: narrow to specific streams, or save as-is";

  return (
    <>
      {!hideTrigger && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="h-7 gap-1 px-2.5 text-xs"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </Button>
      )}

      <Drawer open={open} onOpenChange={setOpen} direction="right">
        <DrawerContent
          className="ml-auto flex h-[100dvh] max-h-[100dvh] w-full flex-col border-l border-slate-200/80 bg-[#f5f6f8] dark:border-slate-800 dark:bg-slate-950 sm:max-w-[480px]"
          data-vaul-drawer-direction="right"
        >
          <DrawerHeader className="relative shrink-0 overflow-hidden border-0 px-0 pb-0 pt-0">
            <div className="relative border-b border-primary/10 bg-gradient-to-br from-primary/[0.08] via-white to-primary/[0.04] px-5 pb-4 pt-5 dark:from-primary/15 dark:via-slate-900 dark:to-primary/5">
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/15 blur-3xl"
                aria-hidden
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <DrawerTitle className="text-left text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    Teaching assignments
                  </DrawerTitle>
                  <DrawerDescription className="mt-0.5 truncate text-left text-sm text-slate-500 dark:text-slate-400">
                    {teacherName}
                  </DrawerDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 dark:hover:bg-slate-800"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {!loading && (
                <div className="relative mt-4 flex gap-1.5">
                  {STEPS.map((step, index) => (
                    <StepPill
                      key={step.id}
                      step={step}
                      index={index}
                      active={activeStep === step.id}
                      done={
                        step.id === "grades"
                          ? gradesDone
                          : step.id === "subjects"
                            ? subjectsDone
                            : selectedStreamIds.length > 0
                      }
                      onClick={() => scrollToStep(step.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <p className="text-sm text-slate-500">Loading school setup…</p>
              </div>
            ) : (
              <div className="space-y-4">
                <section ref={gradesRef}>
                  <StepCard
                    step="grades"
                    stepNumber={1}
                    title="Grade levels"
                    description="Which year groups can this teacher cover?"
                    count={selectedGradeIds.length}
                  >
                    {flatGrades.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No grades configured for this school yet.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {gradesByCurriculum.map(([curriculum, grades]) => {
                          const gradeIds = grades.map((g) => g.id);
                          const selectedInGroup = gradeIds.filter((id) =>
                            selectedGradeIds.includes(id),
                          ).length;

                          return (
                            <CurriculumGroup
                              key={curriculum}
                              title={curriculum}
                              selectedCount={selectedInGroup}
                              totalCount={grades.length}
                              onSelectAll={() =>
                                setSelectedGradeIds((prev) => [
                                  ...new Set([...prev, ...gradeIds]),
                                ])
                              }
                              onClear={() =>
                                setSelectedGradeIds((prev) =>
                                  prev.filter((id) => !gradeIds.includes(id)),
                                )
                              }
                            >
                              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                                {grades.map((grade) => (
                                  <SelectChip
                                    key={grade.id}
                                    checked={selectedGradeIds.includes(grade.id)}
                                    onChange={() =>
                                      handleGradeToggle(
                                        grade.id,
                                        !selectedGradeIds.includes(grade.id),
                                      )
                                    }
                                    label={grade.name}
                                  />
                                ))}
                              </div>
                            </CurriculumGroup>
                          );
                        })}
                        {selectedGradeIds.length > 0 && (
                          <div className="rounded-xl border border-primary/15 bg-primary/[0.04] px-3 py-3 dark:bg-primary/10">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              Selected ({selectedGradeIds.length})
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {[...selectedGradeIds]
                                .sort((a, b) => {
                                  const aOrder =
                                    gradeLevelsData.find((g) => g.id === a)
                                      ?.sortOrder ?? 0;
                                  const bOrder =
                                    gradeLevelsData.find((g) => g.id === b)
                                      ?.sortOrder ?? 0;
                                  return aOrder - bOrder;
                                })
                                .map((gradeId) => {
                                  const name =
                                    flatGrades.find((g) => g.id === gradeId)
                                      ?.name ?? "Grade";
                                  return (
                                    <span
                                      key={gradeId}
                                      className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary-dark dark:text-primary-light"
                                    >
                                      {name}
                                    </span>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </StepCard>
                </section>

                <section ref={subjectsRef}>
                  <StepCard
                    step="subjects"
                    stepNumber={2}
                    title="Subjects by grade"
                    description={
                      gradesDone
                        ? "Choose what this teacher teaches in each selected grade"
                        : "Pick grades first, then assign subjects per grade"
                    }
                    count={selectedSubjectIds.length}
                    locked={!gradesDone}
                    lockMessage="Select at least one grade level first."
                    previousStepLabel="grades"
                    onGoToPrevious={
                      !gradesDone ? () => scrollToStep("grades") : undefined
                    }
                  >
                    {gradesDone && gradeNavItems.length > 0 && (
                      <SelectedGradesBar
                        grades={gradeNavItems}
                        activeGradeId={activeGradeId}
                        onGradeClick={scrollToGradeSection}
                      />
                    )}

                    {subjectsForSelectedGrades.length > 6 && (
                      <div className="relative mb-4">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <Input
                          value={subjectSearch}
                          onChange={(e) => setSubjectSearch(e.target.value)}
                          placeholder="Search across all grades…"
                          className="h-9 rounded-xl border-slate-200/80 bg-white pl-9 text-sm dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>
                    )}

                    {subjectSectionsByGrade.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        {gradesDone
                          ? "No subjects are set up for the selected grades yet."
                          : "No subjects configured for this school yet."}
                      </p>
                    ) : subjectSectionsByGrade.every(
                        (section) => section.subjects.length === 0,
                      ) ? (
                      <p className="text-sm text-slate-500">
                        No subjects match your search.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {subjectSectionsByGrade.map((section) => {
                          if (section.subjects.length === 0) return null;

                          return (
                            <article
                              key={section.gradeId}
                              ref={(el) => {
                                gradeSectionRefs.current[section.gradeId] = el;
                              }}
                              className={cn(
                                "overflow-hidden rounded-xl border transition-shadow",
                                activeGradeId === section.gradeId
                                  ? "border-primary/40 bg-white shadow-sm shadow-primary/5 ring-1 ring-primary/15 dark:bg-slate-900"
                                  : "border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-900/60",
                              )}
                            >
                              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                                <GradeGroupHeader
                                  gradeNames={[section.gradeName]}
                                  levelName={section.levelName}
                                  selectedCount={section.selectedCount}
                                  totalCount={section.totalSubjects}
                                  isComplete={section.isComplete}
                                  onSelectAll={() =>
                                    setSelectedSubjectIds((prev) => [
                                      ...new Set([
                                        ...prev,
                                        ...subjectsByGradeId
                                          .get(section.gradeId)!
                                          .map((s) => s.id),
                                      ]),
                                    ])
                                  }
                                  onClear={() =>
                                    setSelectedSubjectIds((prev) =>
                                      prev.filter(
                                        (id) =>
                                          !subjectsByGradeId
                                            .get(section.gradeId)!
                                            .map((s) => s.id)
                                            .includes(id),
                                      ),
                                    )
                                  }
                                />
                              </div>
                              <div className="grid grid-cols-1 gap-1.5 p-3 sm:grid-cols-2">
                                {section.subjects.map((subject) => (
                                  <SelectChip
                                    key={`${section.gradeId}-${subject.id}`}
                                    checked={selectedSubjectIds.includes(
                                      subject.id,
                                    )}
                                    onChange={() => {
                                      setActiveGradeId(section.gradeId);
                                      toggleId(
                                        subject.id,
                                        selectedSubjectIds,
                                        setSelectedSubjectIds,
                                      );
                                    }}
                                    label={subject.name}
                                  />
                                ))}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </StepCard>
                </section>

                <section ref={streamsRef}>
                  <StepCard
                    step="streams"
                    stepNumber={3}
                    title="Streams"
                    description="Optional — leave blank to cover all streams in selected grades."
                    count={selectedStreamIds.length}
                    locked={!gradesDone || !subjectsDone}
                    lockMessage={
                      !gradesDone
                        ? "Complete grades first."
                        : "Pick subjects before choosing streams."
                    }
                    previousStepLabel={!gradesDone ? "grades" : "subjects"}
                    onGoToPrevious={
                      !gradesDone
                        ? () => scrollToStep("grades")
                        : !subjectsDone
                          ? () => scrollToStep("subjects")
                          : undefined
                    }
                  >
                    {streamsForSelectedGrades.length === 0 ? (
                      <div className="rounded-xl border border-primary/15 bg-primary/[0.04] px-4 py-4 text-center dark:bg-primary/10">
                        <School className="mx-auto mb-2 h-5 w-5 text-primary/60" />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          All streams apply
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          No separate streams for the grades you picked — you can save now.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {streamsByGrade.map(([gradeName, streams]) => {
                          const streamIds = streams.map((s) => s.id);
                          const selectedInGroup = streamIds.filter((id) =>
                            selectedStreamIds.includes(id),
                          ).length;

                          return (
                            <CurriculumGroup
                              key={gradeName}
                              title={gradeName}
                              selectedCount={selectedInGroup}
                              totalCount={streams.length}
                              onSelectAll={() =>
                                setSelectedStreamIds((prev) => [
                                  ...new Set([...prev, ...streamIds]),
                                ])
                              }
                              onClear={() =>
                                setSelectedStreamIds((prev) =>
                                  prev.filter((id) => !streamIds.includes(id)),
                                )
                              }
                            >
                              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                                {streams.map((stream) => (
                                  <SelectChip
                                    key={stream.id}
                                    checked={selectedStreamIds.includes(
                                      stream.id,
                                    )}
                                    onChange={() =>
                                      toggleId(
                                        stream.id,
                                        selectedStreamIds,
                                        setSelectedStreamIds,
                                      )
                                    }
                                    label={stream.name}
                                  />
                                ))}
                              </div>
                            </CurriculumGroup>
                          );
                        })}
                      </div>
                    )}
                  </StepCard>
                </section>
              </div>
            )}
          </div>

          <DrawerFooter className="shrink-0 border-t border-slate-200/80 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="mb-3 text-center text-[11px] text-slate-500">{footerHint}</p>
            <div className="flex w-full gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="h-11 flex-1 rounded-full text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!canSave}
                className="h-11 flex-[2] rounded-full bg-primary text-sm text-white shadow-md shadow-primary/20 hover:bg-primary-dark"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save assignments"
                )}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
