"use client";

import { useState, useMemo, useCallback } from "react";
import { useTimetableStore } from "@/lib/stores/useTimetableStoreNew";
import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  BookOpen,
  Calendar,
  MapPin,
  Loader2,
} from "lucide-react";
import type { CreateEntryRequest } from "@/lib/types/timetable";

interface BulkLessonEntryDrawerProps {
  open: boolean;
  onClose: () => void;
  gradeId?: string;
}

interface LessonEntry {
  id: string;
  timeSlotId: string;
  subjectId: string;
  teacherId: string;
  roomNumber: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function BulkLessonEntryDrawer({
  open,
  onClose,
  gradeId: initialGradeId,
}: BulkLessonEntryDrawerProps) {
  const {
    subjects,
    teachers,
    timeSlots,
    grades,
    selectedGradeId,
    bulkCreateEntries,
  } = useTimetableStore();
  const { selectedTerm } = useSelectedTerm();
  const { getSubjectsByLevelId, getGradeById } = useSchoolConfigStore();
  const { toast } = useToast();

  const [gradeIdState, setGradeIdState] = useState("");
  const [day, setDay] = useState(1);
  const [entries, setEntries] = useState<LessonEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const termId = selectedTerm?.id || "";
  const effectiveGradeId =
    gradeIdState || initialGradeId || selectedGradeId || "";

  // Reset on open/close
  useState(() => {
    if (open) {
      setGradeIdState(initialGradeId || selectedGradeId || "");
      if (entries.length === 0) addBlankEntry();
    }
  });

  // Available subjects for selected grade
  const availableSubjects = useMemo(() => {
    if (!effectiveGradeId) return [];
    const gradeInfo = getGradeById(effectiveGradeId);
    if (!gradeInfo) return [];
    return getSubjectsByLevelId(gradeInfo.levelId);
  }, [effectiveGradeId, getGradeById, getSubjectsByLevelId]);

  // Available teachers for this grade
  const availableTeachers = useMemo(() => {
    if (!effectiveGradeId) return teachers;
    const grade = grades.find((g) => g.id === effectiveGradeId);
    if (!grade?.name) return teachers;
    return teachers.filter(
      (t) => !t.gradeLevels || t.gradeLevels.includes(grade.name),
    );
  }, [teachers, grades, effectiveGradeId]);

  const selectedGrade = grades.find((g) => g.id === effectiveGradeId);

  // Track which time slots are already assigned to entries
  const usedSlotIds = useMemo(
    () => new Set(entries.map((e) => e.timeSlotId).filter(Boolean)),
    [entries],
  );

  function addBlankEntry() {
    setEntries((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timeSlotId: "",
        subjectId: "",
        teacherId: "",
        roomNumber: "",
      },
    ]);
  }

  const removeEntry = useCallback(
    (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id)),
    [],
  );
  const updateEntry = useCallback(
    (id: string, updates: Partial<LessonEntry>) =>
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      ),
    [],
  );

  const handleSave = async () => {
    if (!effectiveGradeId) {
      toast({ title: "Select a grade first", variant: "destructive" });
      return;
    }
    if (!termId) {
      toast({ title: "No term selected", variant: "destructive" });
      return;
    }

    const incomplete = entries.filter(
      (e) => !e.timeSlotId || !e.subjectId || !e.teacherId,
    );
    if (incomplete.length > 0) {
      toast({
        title: "Incomplete entries",
        description: `Fill in all required fields for ${incomplete.length} lesson(s).`,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const requests: CreateEntryRequest[] = entries.map((e) => ({
        gradeId: effectiveGradeId,
        subjectId: e.subjectId,
        teacherId: e.teacherId,
        timeSlotId: e.timeSlotId,
        dayOfWeek: day,
        roomNumber: e.roomNumber?.trim() || undefined,
      }));

      await bulkCreateEntries(termId, effectiveGradeId, requests);
      toast({
        title: `${requests.length} lesson${requests.length !== 1 ? "s" : ""} created for ${DAYS[day - 1]}`,
      });
      onClose();
    } catch (err) {
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-3">
          <SheetTitle className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Add Lessons
          </SheetTitle>
          <SheetDescription className="text-sm">
            Schedule multiple lessons at once for a single day and grade.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          {/* Configuration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium mb-1 block">Grade</Label>
              <Select value={effectiveGradeId} onValueChange={setGradeIdState}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.displayName || g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1 block">Day</Label>
              <Select
                value={String(day)}
                onValueChange={(v) => setDay(Number(v))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lesson entries */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium">
                Lessons ({entries.length})
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBlankEntry}
                className="h-7 text-xs gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Row
              </Button>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No lessons added yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addBlankEntry}
                  className="mt-3"
                >
                  Add First Lesson
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map((entry, idx) => (
                  <div
                    key={entry.id}
                    className="border rounded-lg p-3 bg-white dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="grid grid-cols-4 gap-2 flex-1">
                        {/* Time Slot */}
                        <Select
                          value={entry.timeSlotId || undefined}
                          onValueChange={(v) =>
                            updateEntry(entry.id, { timeSlotId: v })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Period" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((s) => (
                              <SelectItem
                                key={s.id}
                                value={s.id}
                                disabled={
                                  usedSlotIds.has(s.id) &&
                                  s.id !== entry.timeSlotId
                                }
                              >
                                P{s.periodNumber} — {s.time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Subject */}
                        <Select
                          value={entry.subjectId || undefined}
                          onValueChange={(v) =>
                            updateEntry(entry.id, { subjectId: v })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSubjects.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Teacher */}
                        <Select
                          value={entry.teacherId || undefined}
                          onValueChange={(v) =>
                            updateEntry(entry.id, { teacherId: v })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTeachers.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Room */}
                        <div className="relative">
                          <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                          <Input
                            value={entry.roomNumber}
                            onChange={(e) =>
                              updateEntry(entry.id, {
                                roomNumber: e.target.value,
                              })
                            }
                            placeholder="Room"
                            className="h-8 text-xs pl-7"
                          />
                        </div>
                      </div>
                      {entries.length > 1 && (
                        <button
                          onClick={() => removeEntry(entry.id)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded flex-shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          {entries.length > 0 && selectedGrade && (
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20 text-sm">
              <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
              <span>
                <strong>{entries.length}</strong> lesson
                {entries.length !== 1 ? "s" : ""} for{" "}
                <strong>{DAYS[day - 1]}</strong> in{" "}
                <strong>
                  {selectedGrade.displayName || selectedGrade.name}
                </strong>
              </span>
            </div>
          )}
        </div>

        <SheetFooter className="pt-4 gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isSaving || entries.length === 0 || !effectiveGradeId || !termId
            }
            className="flex-1 gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )}
            {isSaving
              ? "Creating..."
              : `Create ${entries.length || ""} Lesson${entries.length !== 1 ? "s" : ""}`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
