"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useTimetableStore } from "@/lib/stores/useTimetableStoreNew";
import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { useToast } from "@/components/ui/use-toast";
import { SCHOOL_DAYS } from "@/lib/constants/breakTypes";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";
import {
  TeacherSelect,
  SubjectSelect,
  lessonSelectTriggerClass,
  lessonSelectTriggerCompactClass,
} from "./TimetableLessonSelects";
import type { CreateEntryRequest } from "@/lib/types/timetable";
import { useKnownRoomNumbers } from "../hooks/useKnownRoomNumbers";
import {
  resolveGradeForSchoolConfig,
  subjectsForTimetableGrade,
} from "../utils/resolveGradeForSchoolConfig";
import { useTimetableWeekDays } from "../hooks/useTimetableWeekDays";
import { sanitizeTimetableUserMessage } from "@/lib/utils/timetable-user-messages";
import { normalizeRoomNumber } from "../utils/normalizeRoomNumber";

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div>
        <h3 className={tt.label}>{title}</h3>
        {hint ? <p className={cn(tt.caption, "mt-0.5")}>{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

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

  const sortedTimeSlots = useMemo(
    () => [...timeSlots].sort((a, b) => a.periodNumber - b.periodNumber),
    [timeSlots],
  );

  const sortedEntryRows = useMemo(() => {
    return [...entries].sort((a, b) => {
      const periodA =
        sortedTimeSlots.find((s) => s.id === a.timeSlotId)?.periodNumber ?? 999;
      const periodB =
        sortedTimeSlots.find((s) => s.id === b.timeSlotId)?.periodNumber ?? 999;
      return periodA - periodB;
    });
  }, [entries, sortedTimeSlots]);

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
    <Drawer open={open} onOpenChange={onClose} direction="right">
      <DrawerContent
        className="ml-auto flex h-[100dvh] max-h-[100dvh] w-full flex-col bg-white dark:bg-slate-950 sm:max-w-xl"
        data-vaul-drawer-direction="right"
      >
        <DrawerHeader className="shrink-0 space-y-0 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <div className="flex items-start gap-2">
            <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1">
              <DrawerTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Bulk add lessons
              </DrawerTitle>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Add the same lessons to one or more days, or duplicate a filled
                day.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-slate-400"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <Section title="Class">
            <Select value={effectiveGradeId} onValueChange={setGradeIdState}>
              <SelectTrigger className={lessonSelectTriggerClass}>
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
          </Section>

          <Section title="Apply to days">
            <div className="flex flex-wrap gap-1.5">
              {weekDays.map((d) => {
                const active = selectedDays.includes(d.value);
                return (
                  <label
                    key={d.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                      active
                        ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
                    )}
                  >
                    <Checkbox
                      checked={active}
                      onCheckedChange={() => toggleDay(d.value)}
                      className={cn(
                        "h-3.5 w-3.5",
                        active && "border-white data-[state=checked]:bg-white data-[state=checked]:text-slate-900",
                      )}
                    />
                    {d.name}
                  </label>
                );
              })}
            </div>
          </Section>

          <div className={cn(tt.panelMuted, "space-y-3 p-3")}>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Duplicate a filled day
              </p>
              <p className={cn(tt.caption, "mt-0.5")}>
                Copy every lesson from one day onto others in one step.
              </p>
            </div>
            <Select
              value={duplicateSourceDay}
              onValueChange={(v) => {
                setDuplicateSourceDay(v);
                const src = Number(v);
                setDuplicateTargetDays((prev) => prev.filter((d) => d !== src));
              }}
            >
              <SelectTrigger className={lessonSelectTriggerClass}>
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
              <p className={cn(tt.label, "mb-1.5")}>Onto these days</p>
              <div className="flex flex-wrap gap-1.5">
                {weekDays
                  .filter(
                    (d) =>
                      !duplicateSourceDay ||
                      d.value !== Number(duplicateSourceDay),
                  )
                  .map((d) => {
                    const active = duplicateTargetDays.includes(d.value);
                    return (
                      <label
                        key={d.value}
                        className={cn(
                          "flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors",
                          active
                            ? "border-slate-700 bg-slate-100 text-slate-800 dark:border-slate-400 dark:bg-slate-800 dark:text-slate-100"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900",
                        )}
                      >
                        <Checkbox
                          checked={active}
                          onCheckedChange={() => toggleDuplicateTarget(d.value)}
                          className="h-3.5 w-3.5"
                        />
                        {d.name}
                      </label>
                    );
                  })}
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              className="h-9 w-full gap-1.5 bg-zinc-900 text-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
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

          <div className="rounded-lg border border-dashed border-slate-200 p-3 dark:border-slate-700">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Or load into the form
            </p>
            <p className={cn(tt.caption, "mt-0.5 mb-2")}>
              Copy a day&apos;s lessons into the rows below, edit, then save.
            </p>
            <div className="flex gap-2">
              <Select value={copySourceDay} onValueChange={setCopySourceDay}>
                <SelectTrigger className={cn(lessonSelectTriggerClass, "flex-1")}>
                  <SelectValue placeholder="Pick a day" />
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
                className="h-9 shrink-0 gap-1 text-xs"
                disabled={!copySourceDay || !effectiveGradeId}
                onClick={handleCopyFromDay}
              >
                <Copy className="h-3.5 w-3.5" />
                Load
              </Button>
            </div>
          </div>

          <Section
            title={`Lessons (${entries.length})`}
            hint="One row per period"
          >
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBlankEntry}
                className="h-7 gap-1 text-xs"
              >
                <Plus className="h-3 w-3" />
                Add row
              </Button>
            </div>

            {entries.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center dark:border-slate-700">
                <BookOpen className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                <p className="text-xs text-slate-500">No lessons added yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addBlankEntry}
                  className="mt-3 h-8 text-xs"
                >
                  Add first row
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedEntryRows.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 dark:border-slate-700 dark:bg-slate-900/40"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className={tt.label}>
                        P
                        {sortedTimeSlots.find((s) => s.id === entry.timeSlotId)
                          ?.periodNumber ?? "—"}
                      </span>
                      {entries.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeEntry(entry.id)}
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Remove lesson row"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className={tt.label}>Period</Label>
                        <Select
                          value={entry.timeSlotId || undefined}
                          onValueChange={(v) =>
                            updateEntry(entry.id, { timeSlotId: v })
                          }
                        >
                          <SelectTrigger className={lessonSelectTriggerCompactClass}>
                            <SelectValue placeholder="Period" />
                          </SelectTrigger>
                          <SelectContent>
                            {sortedTimeSlots.map((s) => (
                              <SelectItem
                                key={s.id}
                                value={s.id}
                                disabled={
                                  usedSlotIds.has(s.id) &&
                                  s.id !== entry.timeSlotId
                                }
                              >
                                P{s.periodNumber} · {s.time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className={tt.label}>Subject</Label>
                        <SubjectSelect
                          value={entry.subjectId || undefined}
                          onValueChange={(v) =>
                            updateEntry(entry.id, { subjectId: v })
                          }
                          subjects={availableSubjects}
                          compact
                          placeholder="Subject"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className={tt.label}>Teacher</Label>
                        <TeacherSelect
                          value={entry.teacherId || undefined}
                          onValueChange={(v) =>
                            updateEntry(entry.id, { teacherId: v })
                          }
                          teachers={availableTeachers}
                          compact
                          placeholder="Teacher"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className={tt.label}>Room</Label>
                        <div className="relative">
                          <MapPin className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                          <Input
                            list="bulk-known-rooms"
                            value={entry.roomNumber}
                            onChange={(e) =>
                              updateEntry(entry.id, {
                                roomNumber: e.target.value,
                              })
                            }
                            placeholder="Optional"
                            className="h-8 pl-7 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <datalist id="bulk-known-rooms">
            {knownRooms.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>

          {entries.length > 0 && selectedGrade ? (
            <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
              <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>
                <strong className="font-semibold text-slate-800 dark:text-slate-100">
                  {entries.length * selectedDays.length}
                </strong>{" "}
                lesson{entries.length * selectedDays.length !== 1 ? "s" : ""}{" "}
                for{" "}
                <strong className="font-semibold text-slate-800 dark:text-slate-100">
                  {selectedGrade.displayName || selectedGrade.name}
                </strong>
                {selectedDayLabels.length > 0
                  ? ` · ${selectedDayLabels.join(", ")}`
                  : ""}
              </span>
            </div>
          ) : null}
        </div>

        <DrawerFooter className="shrink-0 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
              className="h-9 flex-1 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={
                isSaving || entries.length === 0 || !effectiveGradeId || !termId
              }
              className="h-9 flex-1 gap-1.5 bg-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              {isSaving
                ? "Creating…"
                : `Create ${entries.length * selectedDays.length || ""} lesson${entries.length * selectedDays.length !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
