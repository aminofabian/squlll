"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { BookOpen, GraduationCap, Loader2, Pencil, School } from "lucide-react";

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

export function TeacherAcademicEditor({
  teacherId,
  teacherName,
  initialSubjectIds,
  initialGradeLevelIds,
  initialStreamIds,
  onSaved,
}: TeacherAcademicEditorProps) {
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

  const allSubjects = useMemo(
    () =>
      tenantSubjects.map((ts) => ({
        id: ts.id,
        name: ts.subject?.name || ts.customSubject?.name || "Unknown Subject",
        curriculum: ts.curriculum.name,
      })),
    [tenantSubjects],
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

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 font-mono text-xs border-[var(--color-border)]"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit subjects & classes
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="border-b border-slate-200 dark:border-slate-700">
            <DrawerTitle className="font-mono">
              Teaching assignments
            </DrawerTitle>
            <DrawerDescription>
              Set subjects, grade levels, and streams for {teacherName}.
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto px-6 py-5 space-y-8">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading school data…
              </div>
            ) : (
              <>
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-semibold">Grade levels</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {flatGrades.map((grade) => (
                      <label
                        key={grade.id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
                      >
                        <Checkbox
                          checked={selectedGradeIds.includes(grade.id)}
                          onCheckedChange={(checked) =>
                            handleGradeToggle(grade.id, checked === true)
                          }
                        />
                        <span>{grade.name}</span>
                      </label>
                    ))}
                  </div>
                </section>

                {selectedGradeIds.length > 0 && (
                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Subjects</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {allSubjects.map((subject) => (
                        <label
                          key={subject.id}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
                        >
                          <Checkbox
                            checked={selectedSubjectIds.includes(subject.id)}
                            onCheckedChange={() =>
                              toggleId(
                                subject.id,
                                selectedSubjectIds,
                                setSelectedSubjectIds,
                              )
                            }
                          />
                          <span>{subject.name}</span>
                        </label>
                      ))}
                    </div>
                  </section>
                )}

                {selectedGradeIds.length > 0 && (
                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <School className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">
                        Streams / classes
                      </Label>
                    </div>
                    {streamsForSelectedGrades.length === 0 ? (
                      <p className="text-sm text-slate-500 rounded-lg border border-dashed border-slate-200 p-4">
                        No streams configured for the selected grades. Leave
                        empty to include all streams when grades are saved.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {streamsForSelectedGrades.map((stream) => (
                          <label
                            key={stream.id}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
                          >
                            <Checkbox
                              checked={selectedStreamIds.includes(stream.id)}
                              onCheckedChange={() =>
                                toggleId(
                                  stream.id,
                                  selectedStreamIds,
                                  setSelectedStreamIds,
                                )
                              }
                            />
                            <span>
                              {stream.name}{" "}
                              <span className="text-slate-400">
                                ({stream.gradeName})
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </>
            )}
          </div>

          <DrawerFooter className="border-t border-slate-200 dark:border-slate-700">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || loading}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save assignments"
              )}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
