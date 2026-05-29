"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useTimetableStore } from "@/lib/stores/useTimetableStoreNew";
import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { useToast } from "@/components/ui/use-toast";
import { SCHOOL_DAYS } from "@/lib/constants/breakTypes";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  Copy,
} from "lucide-react";
import type { CreateEntryRequest } from "@/lib/types/timetable";
import { useKnownRoomNumbers } from "../hooks/useKnownRoomNumbers";
import {
  resolveGradeForSchoolConfig,
  subjectsForTimetableGrade,
} from "../utils/resolveGradeForSchoolConfig";
import { useTimetableWeekDays } from "../hooks/useTimetableWeekDays";
import { sanitizeTimetableUserMessage } from "@/lib/utils/timetable-user-messages";
import { normalizeRoomNumber } from "../utils/normalizeRoomNumber";

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

const WEEK_DAYS = [
  ...SCHOOL_DAYS.map((name, i) => ({ value: i + 1, name })),
  { value: 6, name: "Saturday" },
  { value: 7, name: "Sunday" },
];

function blankRow(): LessonEntry {
  return {
    id: crypto.randomUUID(),
    timeSlotId: "",
    subjectId: "",
    teacherId: "",
    roomNumber: "",
  };
}

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
    entries: timetableEntries,
    selectedGradeId,
    bulkCreateEntries,
    loadTeachers,
    loadSubjects,
  } = useTimetableStore();
  const { selectedTerm } = useSelectedTerm();
  const { getSubjectsByLevelId, getGradeById } = useSchoolConfigStore();
  const { toast } = useToast();
  const knownRooms = useKnownRoomNumbers();

  const [gradeIdState, setGradeIdState] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([1]);
  const [copySourceDay, setCopySourceDay] = useState<string>("");
  const [duplicateSourceDay, setDuplicateSourceDay] = useState<string>("");
  const [duplicateTargetDays, setDuplicateTargetDays] = useState<number[]>([]);
  const [entries, setEntries] = useState<LessonEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const { daysPerWeek } = useTimetableWeekDays();
  const weekDays = useMemo(
    () => WEEK_DAYS.filter((d) => d.value <= daysPerWeek),
    [daysPerWeek],
  );

  const termId = selectedTerm?.id || "";
  const effectiveGradeId =
    gradeIdState || initialGradeId || selectedGradeId || "";

  useEffect(() => {
    if (!open) return;
    const gradeToLoad = initialGradeId || selectedGradeId || "";
    setGradeIdState(gradeToLoad);
    setSelectedDays([1]);
    setCopySourceDay("");
    setDuplicateSourceDay("");
    setDuplicateTargetDays([]);
    setEntries([blankRow()]);
    void loadSubjects(gradeToLoad || undefined).catch(() => {});
    void loadTeachers().catch(() => {});
  }, [open, initialGradeId, selectedGradeId, loadSubjects, loadTeachers]);

  const schoolConfigGetters = useMemo(
    () => ({ getGradeById, getSubjectsByLevelId }),
    [getGradeById, getSubjectsByLevelId],
  );

  const availableSubjects = useMemo(() => {
    return subjectsForTimetableGrade(
      effectiveGradeId,
      grades,
      subjects,
      schoolConfigGetters,
    );
  }, [effectiveGradeId, grades, subjects, schoolConfigGetters]);

  const availableTeachers = useMemo(() => {
    if (!effectiveGradeId) return teachers;
    const grade = grades.find((g) => g.id === effectiveGradeId);
    if (!grade?.name) return teachers;
    return teachers.filter(
      (t) =>
        !t.gradeLevels?.length || t.gradeLevels.includes(grade.name),
    );
  }, [teachers, grades, effectiveGradeId]);

  const selectedGrade = grades.find((g) => g.id === effectiveGradeId);

  const usedSlotIds = useMemo(
    () => new Set(entries.map((e) => e.timeSlotId).filter(Boolean)),
    [entries],
  );

  const toggleDay = (dayValue: number) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayValue)) {
        const next = prev.filter((d) => d !== dayValue);
        return next.length > 0 ? next : prev;
      }
      return [...prev, dayValue].sort((a, b) => a - b);
    });
  };

  const toggleDuplicateTarget = (dayValue: number) => {
    setDuplicateTargetDays((prev) => {
      if (prev.includes(dayValue)) {
        return prev.filter((d) => d !== dayValue);
      }
      return [...prev, dayValue].sort((a, b) => a - b);
    });
  };

  const addBlankEntry = () => setEntries((prev) => [...prev, blankRow()]);

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

  const handleCopyFromDay = () => {
    const sourceDay = Number(copySourceDay);
    if (!effectiveGradeId || !sourceDay) return;

    const sourceEntries = timetableEntries.filter(
      (e) => e.gradeId === effectiveGradeId && e.dayOfWeek === sourceDay,
    );

    if (sourceEntries.length === 0) {
      toast({
        title: "Nothing to copy",
        description: `No lessons found for ${weekDays.find((d) => d.value === sourceDay)?.name ?? "that day"}.`,
        variant: "destructive",
      });
      return;
    }

    setEntries(
      sourceEntries.map((e) => ({
        id: crypto.randomUUID(),
        timeSlotId: e.timeSlotId,
        subjectId: e.subjectId,
        teacherId: e.teacherId,
        roomNumber: e.roomNumber || "",
      })),
    );

    toast({
      title: "Copied lessons",
      description: `${sourceEntries.length} row(s) loaded — pick target days above, then save.`,
    });
  };

  const handleDuplicateDayToTargets = async () => {
    const sourceDay = Number(duplicateSourceDay);
    if (!effectiveGradeId || !termId || !sourceDay) return;
    if (duplicateTargetDays.length === 0) {
      toast({
        title: "Pick target days",
        description: "Select at least one day to copy lessons onto.",
        variant: "destructive",
      });
      return;
    }

    const sourceEntries = timetableEntries.filter(
      (e) => e.gradeId === effectiveGradeId && e.dayOfWeek === sourceDay,
    );

    if (sourceEntries.length === 0) {
      toast({
        title: "Nothing to duplicate",
        description: `${
          weekDays.find((d) => d.value === sourceDay)?.name ?? "That day"
        } has no lessons for this class yet.`,
        variant: "destructive",
      });
      return;
    }

    const occupiedOnTargets = new Set(
      timetableEntries
        .filter(
          (e) =>
            e.gradeId === effectiveGradeId &&
            duplicateTargetDays.includes(e.dayOfWeek),
        )
        .map((e) => `${e.dayOfWeek}:${e.timeSlotId}`),
    );

    const requests: CreateEntryRequest[] = duplicateTargetDays.flatMap((day) =>
      sourceEntries
        .filter((e) => !occupiedOnTargets.has(`${day}:${e.timeSlotId}`))
        .map((e) => ({
          gradeId: effectiveGradeId,
          subjectId: e.subjectId,
          teacherId: e.teacherId,
          timeSlotId: e.timeSlotId,
          dayOfWeek: day,
          roomNumber:
            normalizeRoomNumber(e.roomNumber ?? "", knownRooms) || undefined,
        })),
    );

    if (requests.length === 0) {
      toast({
        title: "All slots already filled",
        description:
          "Every period on the target days already has a lesson. Remove or edit those first.",
        variant: "destructive",
      });
      return;
    }

    const skipped =
      sourceEntries.length * duplicateTargetDays.length - requests.length;

    setIsDuplicating(true);
    try {
      await bulkCreateEntries(termId, effectiveGradeId, requests);
      const sourceName =
        weekDays.find((d) => d.value === sourceDay)?.name ?? "day";
      const targetNames = duplicateTargetDays
        .map((d) => weekDays.find((w) => w.value === d)?.name)
        .filter(Boolean)
        .join(", ");
      toast({
        title: `${requests.length} lesson${requests.length !== 1 ? "s" : ""} copied`,
        description: `From ${sourceName} to ${targetNames}${
          skipped > 0 ? ` (${skipped} slot${skipped !== 1 ? "s" : ""} skipped — already filled)` : ""
        }`,
      });
      onClose();
    } catch (err) {
      toast({
        title: "Could not duplicate day",
        description: sanitizeTimetableUserMessage(err),
        variant: "destructive",
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleSave = async () => {
    if (!effectiveGradeId) {
      toast({ title: "Select a class first", variant: "destructive" });
      return;
    }
    if (!termId) {
      toast({ title: "No term selected", variant: "destructive" });
      return;
    }
    if (selectedDays.length === 0) {
      toast({ title: "Pick at least one day", variant: "destructive" });
      return;
    }

    const incomplete = entries.filter(
      (e) => !e.timeSlotId || !e.subjectId || !e.teacherId,
    );
    if (incomplete.length > 0) {
      toast({
        title: "Incomplete entries",
        description: `Fill in period, subject, and teacher for ${incomplete.length} row(s).`,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const requests: CreateEntryRequest[] = selectedDays.flatMap((day) =>
        entries.map((e) => ({
          gradeId: effectiveGradeId,
          subjectId: e.subjectId,
          teacherId: e.teacherId,
          timeSlotId: e.timeSlotId,
          dayOfWeek: day,
          roomNumber:
            normalizeRoomNumber(e.roomNumber ?? "", knownRooms) || undefined,
        })),
      );

      await bulkCreateEntries(termId, effectiveGradeId, requests);
      const dayLabels = selectedDays
        .map((d) => weekDays.find((w) => w.value === d)?.name)
        .filter(Boolean)
        .join(", ");
      toast({
        title: `${requests.length} lesson${requests.length !== 1 ? "s" : ""} created`,
        description: dayLabels,
      });
      onClose();
    } catch (err) {
      toast({
        title: "Could not save lessons",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedDayLabels = selectedDays
    .map((d) => weekDays.find((w) => w.value === d)?.name)
    .filter(Boolean);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-3">
          <SheetTitle className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Add multiple lessons
          </SheetTitle>
          <SheetDescription className="text-sm">
            Add the same lessons to one or more days at once, or copy from a day
            that is already filled in.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-xs font-medium mb-1 block">Class</Label>
            <Select value={effectiveGradeId} onValueChange={setGradeIdState}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select class" />
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
            <Label className="text-xs font-medium mb-2 block">
              Apply to days
            </Label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((d) => (
                <label
                  key={d.value}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Checkbox
                    checked={selectedDays.includes(d.value)}
                    onCheckedChange={() => toggleDay(d.value)}
                  />
                  {d.name}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 dark:bg-primary/10 p-3 space-y-3">
            <div>
              <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Duplicate a filled day
              </Label>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Copy every lesson from one day onto other days in one step (e.g.
                Monday → Tuesday & Wednesday).
              </p>
            </div>
            <Select
              value={duplicateSourceDay}
              onValueChange={(v) => {
                setDuplicateSourceDay(v);
                const src = Number(v);
                setDuplicateTargetDays((prev) =>
                  prev.filter((d) => d !== src),
                );
              }}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Copy from which day?" />
              </SelectTrigger>
              <SelectContent>
                {weekDays.map((d) => (
                  <SelectItem key={d.value} value={String(d.value)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <Label className="text-[11px] text-slate-500 mb-1.5 block">
                Onto these days
              </Label>
              <div className="flex flex-wrap gap-2">
                {weekDays
                  .filter(
                    (d) =>
                      !duplicateSourceDay ||
                      d.value !== Number(duplicateSourceDay),
                  )
                  .map((d) => (
                    <label
                      key={d.value}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs cursor-pointer hover:bg-white/80 dark:hover:bg-slate-800"
                    >
                      <Checkbox
                        checked={duplicateTargetDays.includes(d.value)}
                        onCheckedChange={() => toggleDuplicateTarget(d.value)}
                      />
                      {d.name}
                    </label>
                  ))}
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              className="w-full h-9 gap-1.5"
              disabled={
                !duplicateSourceDay ||
                duplicateTargetDays.length === 0 ||
                !effectiveGradeId ||
                isDuplicating
              }
              onClick={handleDuplicateDayToTargets}
            >
              {isDuplicating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              Duplicate to selected days
            </Button>
          </div>

          <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 p-3 space-y-2">
            <Label className="text-xs font-medium">
              Or load into the form below
            </Label>
            <p className="text-[11px] text-slate-500">
              Copy a day&apos;s lessons into the rows below, edit if needed, then
              save to your chosen days.
            </p>
            <div className="flex gap-2">
              <Select value={copySourceDay} onValueChange={setCopySourceDay}>
                <SelectTrigger className="h-9 text-sm flex-1">
                  <SelectValue placeholder="Pick a day to copy from" />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map((d) => (
                    <SelectItem key={d.value} value={String(d.value)}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0 gap-1"
                disabled={!copySourceDay || !effectiveGradeId}
                onClick={handleCopyFromDay}
              >
                <Copy className="h-3.5 w-3.5" />
                Load
              </Button>
            </div>
          </div>

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
                Add row
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
                  Add first lesson
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

                        <div className="relative">
                          <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                          <Input
                            list="bulk-known-rooms"
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
                          type="button"
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

          <datalist id="bulk-known-rooms">
            {knownRooms.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>

          {entries.length > 0 && selectedGrade && (
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20 text-sm">
              <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
              <span>
                <strong>{entries.length}</strong> row
                {entries.length !== 1 ? "s" : ""} ×{" "}
                <strong>{selectedDays.length}</strong> day
                {selectedDays.length !== 1 ? "s" : ""} ={" "}
                <strong>{entries.length * selectedDays.length}</strong> lessons
                for{" "}
                <strong>
                  {selectedGrade.displayName || selectedGrade.name}
                </strong>
                {selectedDayLabels.length > 0 && (
                  <> ({selectedDayLabels.join(", ")})</>
                )}
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
              : `Create ${entries.length * selectedDays.length || ""} lesson${entries.length * selectedDays.length !== 1 ? "s" : ""}`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
