"use client";

import { useState, useMemo, useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useToast } from "@/components/ui/use-toast";
import { useTenantSubjects } from "@/lib/hooks/useTenantSubjects";
import { useGradeLevelsForSchoolType } from "@/lib/hooks/useGradeLevelsForSchoolType";
import { cn } from "@/lib/utils";
import { BookOpen, Loader2, Pencil, X } from "lucide-react";

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
}

const UPDATE_TEACHER_ASSIGNMENTS = `
  mutation UpdateTeacherAssignments($input: UpdateTeacherAssignmentsInput!) {
    updateTeacherAssignments(input: $input) {
      id
    }
  }
`;

function Section({
  title,
  count,
  children,
  muted,
}: {
  title: string;
  count?: number;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <section className={cn(muted && "opacity-50 pointer-events-none")}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </h3>
        {count !== undefined && (
          <span className="text-[10px] tabular-nums text-slate-400">{count}</span>
        )}
      </div>
      {children}
    </section>
  );
}

function SelectRow({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 transition-colors",
        checked
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-transparent hover:border-slate-200 hover:bg-slate-50",
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        className="h-3.5 w-3.5"
      />
      <span className="min-w-0 flex-1 text-xs leading-tight text-slate-700">
        {label}
        {hint && (
          <span className="ml-1 text-[10px] text-slate-400">({hint})</span>
        )}
      </span>
    </label>
  );
}

export function TeacherAcademicEditor({
  teacherId,
  teacherName,
  initialSubjectIds,
  initialGradeLevelIds,
  initialStreamIds,
  onSaved,
}: TeacherAcademicEditorProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedGradeIds, setSelectedGradeIds] = useState<string[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [selectedStreamIds, setSelectedStreamIds] = useState<string[]>([]);

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
      tenantSubjects.map((ts) => ({
        id: ts.id,
        name: ts.subject?.name || ts.customSubject?.name || "Unknown Subject",
        curriculum: ts.curriculum.name,
      })),
    [tenantSubjects],
  );

  const subjectsByCurriculum = useMemo(() => {
    const groups = new Map<string, typeof allSubjects>();
    for (const subject of allSubjects) {
      const list = groups.get(subject.curriculum) ?? [];
      list.push(subject);
      groups.set(subject.curriculum, list);
    }
    return Array.from(groups.entries());
  }, [allSubjects]);

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
  }, [open, initialGradeLevelIds, initialSubjectIds, initialStreamIds]);

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
    } else {
      setSelectedGradeIds((prev) => prev.filter((id) => id !== gradeId));
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
      return;
    }

    if (selectedSubjectIds.length === 0) {
      toast({
        title: "Select at least one subject",
        description: "Choose the subjects this teacher can teach.",
        variant: "destructive",
      });
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

  return (
    <>
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

      <Drawer open={open} onOpenChange={setOpen} direction="right">
        <DrawerContent
          className="ml-auto flex h-[100dvh] max-h-[100dvh] w-full flex-col bg-white dark:bg-slate-950 sm:max-w-xl lg:max-w-2xl"
          data-vaul-drawer-direction="right"
        >
          <DrawerHeader className="shrink-0 space-y-0 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 shrink-0 text-slate-400" />
              <div className="min-w-0 flex-1">
                <DrawerTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Assignments
                </DrawerTitle>
                <p className="truncate text-[11px] text-slate-500">{teacherName}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-slate-400"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            {!loading && (
              <p className="mt-2 text-[10px] text-slate-400">
                {selectedGradeIds.length} grades · {selectedSubjectIds.length}{" "}
                subjects · {selectedStreamIds.length} streams
              </p>
            )}
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </div>
            ) : (
              <div className="space-y-4">
                <Section title="Grades" count={selectedGradeIds.length}>
                  {flatGrades.length === 0 ? (
                    <p className="text-[11px] text-slate-400">No grades configured.</p>
                  ) : (
                    <div className="space-y-2">
                      {gradesByCurriculum.map(([curriculum, grades]) => (
                        <div key={curriculum}>
                          <p className="mb-1 px-1 text-[10px] font-medium text-slate-400">
                            {curriculum}
                          </p>
                          <div className="grid grid-cols-3 gap-x-2 gap-y-0.5">
                            {grades.map((grade) => (
                              <SelectRow
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
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                <Section
                  title="Subjects"
                  count={selectedSubjectIds.length}
                  muted={!gradesDone}
                >
                  {!gradesDone ? (
                    <p className="px-1 text-[11px] text-slate-400">
                      Select grades first.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {subjectsByCurriculum.map(([curriculum, subjects]) => (
                        <div key={curriculum}>
                          <p className="mb-1 px-1 text-[10px] font-medium text-slate-400">
                            {curriculum}
                          </p>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                            {subjects.map((subject) => (
                              <SelectRow
                                key={subject.id}
                                checked={selectedSubjectIds.includes(subject.id)}
                                onChange={() =>
                                  toggleId(
                                    subject.id,
                                    selectedSubjectIds,
                                    setSelectedSubjectIds,
                                  )
                                }
                                label={subject.name}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                <Section
                  title="Streams (optional)"
                  count={selectedStreamIds.length}
                  muted={!gradesDone || !subjectsDone}
                >
                  {!gradesDone || !subjectsDone ? (
                    <p className="px-1 text-[11px] text-slate-400">
                      Complete grades & subjects first.
                    </p>
                  ) : streamsForSelectedGrades.length === 0 ? (
                    <p className="px-1 text-[11px] text-slate-400">
                      No streams — all streams apply.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {streamsByGrade.map(([gradeName, streams]) => (
                        <div key={gradeName}>
                          <p className="mb-1 px-1 text-[10px] font-medium text-slate-400">
                            {gradeName}
                          </p>
                          <div className="grid grid-cols-3 gap-x-2 gap-y-0.5">
                            {streams.map((stream) => (
                              <SelectRow
                                key={stream.id}
                                checked={selectedStreamIds.includes(stream.id)}
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
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              </div>
            )}
          </div>

          <DrawerFooter className="shrink-0 border-t border-slate-100 px-3 py-2.5 dark:border-slate-800">
            <div className="flex w-full gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="h-8 flex-1 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!canSave}
                className="h-8 flex-[2] text-xs"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
