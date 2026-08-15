"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  Check,
  Copy,
  Loader2,
  Minus,
  Plus,
  Sparkles,
  Undo2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import type { Grade, Subject, Teacher } from "@/lib/types/timetable";
import type { TeacherLessonAllocation } from "@/lib/types/timetable-allocation";
import { sanitizeTimetableUserMessage } from "@/lib/utils/timetable-user-messages";
import { tt } from "../utils/timetableTheme";
import {
  isSameGrade,
  resolveTenantGradeLevelIdForApi,
  resolveTenantStreamIdForApi,
  subjectsForTimetableGrade,
} from "../utils/resolveGradeForSchoolConfig";
import {
  gradeBandFor,
  suggestWeeklyLessons,
} from "../utils/suggestedWeeklyLessons";
import { abbreviateGradeShort } from "@/lib/utils/grade-display";

interface PlannerRow {
  key: string;
  allocationId?: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  lessonsPerWeek: number;
  doubleLessons: number;
  streamId?: string | null;
  streamName?: string | null;
}

interface TimetableWeeklyLessonsPlannerProps {
  termId: string;
  grades: Grade[];
  subjects: Subject[];
  teachers: Teacher[];
  allocations: TeacherLessonAllocation[];
  availableSlotsPerClass: number;
  /** Currently focused class on the timetable grid — keeps the planner in sync. */
  focusedGradeId?: string | null;
  onFocusedGradeChange?: (gradeId: string) => void;
  onCreateAllocation: (input: {
    termId: string;
    teacherId: string;
    subjectId: string;
    gradeLevelId: string;
    streamId?: string;
    lessonsPerWeek: number;
    preferredDoubleLessons?: number;
  }) => Promise<void>;
  onUpdateAllocation: (input: {
    id: string;
    lessonsPerWeek?: number;
    preferredDoubleLessons?: number;
  }) => Promise<void>;
  onDeleteAllocation: (id: string) => Promise<void>;
}

/**
 * Lets a parent (the auto-generate drawer) persist the planner's unsaved
 * per-class edits — e.g. before leaving the step — instead of losing them
 * when the planner unmounts.
 */
export interface TimetableWeeklyLessonsPlannerHandle {
  /** Persists every class's unsaved lesson-count edits. */
  save: () => Promise<void>;
  /** True while any class has unsaved lesson-count edits. */
  hasUnsavedChanges: () => boolean;
}

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

function streamNameFor(grade: Grade | undefined, streamId?: string | null) {
  if (!grade || !streamId) return null;
  return (
    grade.streams?.find(
      (s) => s.tenantStreamId === streamId || s.streamId === streamId,
    )?.name ?? null
  );
}

/** Compact −/+ number control; friendlier than a bare number box on touch. */
function Stepper({
  value,
  onChange,
  max,
  ariaLabel,
  muted,
}: {
  value: number;
  onChange: (next: number) => void;
  max?: number;
  ariaLabel: string;
  muted?: boolean;
}) {
  const clamp = (n: number) => Math.max(0, Math.min(max ?? 40, n));
  return (
    <div
      className={cn(
        "inline-flex h-7 items-center overflow-hidden rounded-none border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950",
        muted && "opacity-60",
      )}
    >
      <button
        type="button"
        aria-label={`Fewer ${ariaLabel}`}
        disabled={value <= 0}
        onClick={() => onChange(clamp(value - 1))}
        className="flex h-full w-6 items-center justify-center text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-900"
      >
        <Minus className="h-2.5 w-2.5" />
      </button>
      <input
        aria-label={ariaLabel}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value.replace(/\D/g, "")) || 0))}
        className={cn(
          "h-full w-6 border-0 bg-transparent p-0 text-center text-[12px] font-semibold tabular-nums outline-none",
          value > 0
            ? "text-slate-900 dark:text-slate-100"
            : "text-slate-300 dark:text-slate-600",
        )}
      />
      <button
        type="button"
        aria-label={`More ${ariaLabel}`}
        disabled={max != null && value >= max}
        onClick={() => onChange(clamp(value + 1))}
        className="flex h-full w-6 items-center justify-center text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-900"
      >
        <Plus className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}

export const TimetableWeeklyLessonsPlanner = forwardRef<
  TimetableWeeklyLessonsPlannerHandle,
  TimetableWeeklyLessonsPlannerProps
>(function TimetableWeeklyLessonsPlanner(
  {
    termId,
    grades,
    subjects,
    teachers,
    allocations,
    availableSlotsPerClass,
    focusedGradeId,
    onFocusedGradeChange,
    onCreateAllocation,
    onUpdateAllocation,
    onDeleteAllocation,
  }: TimetableWeeklyLessonsPlannerProps,
  ref,
) {
  const { toast } = useToast();
  const { getGradeById, getSubjectsByLevelId } = useSchoolConfigStore();

  const firstGradeWithLessons = useMemo(
    () =>
      grades.find((g) =>
        allocations.some((a) => isSameGrade(a.gradeLevelId, g.id, grades)),
      )?.id,
    [grades, allocations],
  );

  const [activeGradeId, setActiveGradeId] = useState(
    () =>
      focusedGradeId ||
      firstGradeWithLessons ||
      grades[0]?.id ||
      "",
  );

  useEffect(() => {
    if (!focusedGradeId) return;
    const match = grades.find(
      (g) => g.id === focusedGradeId || g.tenantGradeLevelId === focusedGradeId,
    );
    if (match && match.id !== activeGradeId) setActiveGradeId(match.id);
  }, [focusedGradeId, grades, activeGradeId]);

  useEffect(() => {
    if (activeGradeId) return;
    const fallback = firstGradeWithLessons ?? grades[0]?.id;
    if (fallback) {
      setActiveGradeId(fallback);
      onFocusedGradeChange?.(fallback);
    }
  }, [activeGradeId, firstGradeWithLessons, grades, onFocusedGradeChange]);

  const selectGrade = (gradeId: string) => {
    if (gradeId === activeGradeId) {
      onFocusedGradeChange?.(gradeId);
      return;
    }
    setActiveGradeId(gradeId);
    onFocusedGradeChange?.(gradeId);
  };
  const [drafts, setDrafts] = useState<Record<string, PlannerRow[]>>({});
  /**
   * Lesson counts entered for subjects that have no teacher yet. They can't be
   * stored as allocations, so we hold on to them instead of losing the typing.
   */
  const [pending, setPending] = useState<
    Record<string, Record<string, { lessonsPerWeek: number; doubleLessons: number }>>
  >({});
  const [hideEmpty, setHideEmpty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copyTargets, setCopyTargets] = useState<string[]>([]);
  const [copyOpen, setCopyOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [subjectQuery, setSubjectQuery] = useState("");

  /** One entry per subject name — tenant lists often hold near-duplicates. */
  const dedupeByName = useCallback((list: Subject[]) => {
    const seen = new Set<string>();
    return list.filter((s) => {
      const key = normalize(s.name);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);

  const allSubjectsSorted = useMemo(
    () => dedupeByName([...subjects].sort((a, b) => a.name.localeCompare(b.name))),
    [subjects, dedupeByName],
  );

  const configGetters = useMemo(
    () => ({ getGradeById, getSubjectsByLevelId }),
    [getGradeById, getSubjectsByLevelId],
  );

  /**
   * Subjects this class actually learns. When the curriculum has no mapping for
   * the grade the helper hands back every subject in the school, which is far
   * too long to pre-list — in that case we start empty and let the user add.
   */
  const curriculumSubjectsFor = useCallback(
    (gradeId: string): Subject[] | null => {
      const scoped = subjectsForTimetableGrade(
        gradeId,
        grades,
        subjects,
        configGetters,
      ) as Subject[];
      if (scoped === subjects) return null;
      return dedupeByName(
        [...scoped].sort((a, b) => a.name.localeCompare(b.name)),
      );
    },
    [grades, subjects, configGetters, dedupeByName],
  );

  /** Rows from saved allocations, plus a blank row per curriculum subject. */
  const baseRowsFor = useCallback(
    (gradeId: string): PlannerRow[] => {
      const grade = grades.find((g) => g.id === gradeId);
      const saved = allocations.filter((a) =>
        isSameGrade(a.gradeLevelId, gradeId, grades),
      );
      const subjectName = (id: string) =>
        subjects.find((s) => s.id === id)?.name ?? "Subject";

      const fromSaved: PlannerRow[] = saved.map((a) => ({
        key: a.id,
        allocationId: a.id,
        subjectId: a.subjectId,
        subjectName: subjectName(a.subjectId),
        teacherId: a.teacherId,
        lessonsPerWeek: a.lessonsPerWeek,
        doubleLessons: a.preferredDoubleLessons ?? 0,
        streamId: a.streamId ?? null,
        streamName: streamNameFor(grade, a.streamId),
      }));

      const usedSubjects = new Set(saved.map((a) => a.subjectId));
      const usedNames = new Set(
        saved.map((a) => normalize(subjectName(a.subjectId))),
      );
      const blanks: PlannerRow[] = (curriculumSubjectsFor(gradeId) ?? [])
        .filter((s) => !usedSubjects.has(s.id) && !usedNames.has(normalize(s.name)))
        .map((s) => ({
          key: `new-${gradeId}-${s.id}`,
          subjectId: s.id,
          subjectName: s.name,
          teacherId: "",
          lessonsPerWeek: 0,
          doubleLessons: 0,
          streamId: null,
          streamName: null,
        }));

      return [...fromSaved, ...blanks].sort(
        (a, b) =>
          a.subjectName.localeCompare(b.subjectName) ||
          (a.streamName ?? "").localeCompare(b.streamName ?? ""),
      );
    },
    [allocations, grades, subjects, curriculumSubjectsFor],
  );

  const rowsFor = useCallback(
    (gradeId: string) => {
      const draft = drafts[gradeId];
      if (draft) return draft;

      const base = baseRowsFor(gradeId);
      const held = pending[gradeId];
      if (!held) return base;

      return base.map((row) => {
        const numbers = row.allocationId ? undefined : held[row.subjectId];
        return numbers ? { ...row, ...numbers } : row;
      });
    },
    [drafts, baseRowsFor, pending],
  );

  const activeGrade = grades.find((g) => g.id === activeGradeId);
  const rows = activeGradeId ? rowsFor(activeGradeId) : [];
  const dirtyGrades = Object.keys(drafts);

  const setRows = (gradeId: string, next: PlannerRow[]) =>
    setDrafts((prev) => ({ ...prev, [gradeId]: next }));

  const patchRow = (key: string, patch: Partial<PlannerRow>) => {
    if (!activeGradeId) return;
    setRows(
      activeGradeId,
      rows.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
  };

  const lessonsForGrade = (gradeId: string) =>
    rowsFor(gradeId).reduce((sum, r) => sum + r.lessonsPerWeek, 0);

  const activeTotal = rows.reduce((sum, r) => sum + r.lessonsPerWeek, 0);
  const missingTeachers = rows.filter(
    (r) => r.lessonsPerWeek > 0 && !r.teacherId,
  ).length;
  const overCapacity = activeTotal - availableSlotsPerClass;

  /** Teachers who list this subject first, everyone else after. */
  const teacherOptions = useCallback(
    (subjectName: string, gradeName?: string) => {
      const teaches = teachers.filter((t) =>
        (t.subjects ?? []).some((s) => normalize(s) === normalize(subjectName)),
      );
      const forGrade = teaches.filter(
        (t) =>
          !t.gradeLevels?.length ||
          !gradeName ||
          t.gradeLevels.some((g) => normalize(g) === normalize(gradeName)),
      );
      const preferred = forGrade.length ? forGrade : teaches;
      const preferredIds = new Set(preferred.map((t) => t.id));
      return {
        preferred,
        others: teachers.filter((t) => !preferredIds.has(t.id)),
      };
    },
    [teachers],
  );

  /**
   * Classes worth copying to: they must share most of this class's subjects,
   * so we don't offer to push Grade 4's numbers onto a pre-primary class that
   * happens to share one or two.
   */
  const copyCandidates = useMemo(() => {
    const source = new Set(
      rows.filter((r) => r.lessonsPerWeek > 0).map((r) => r.subjectId),
    );
    if (!source.size) return [];
    const threshold = Math.max(2, Math.ceil(source.size / 2));

    return grades
      .filter((g) => g.id !== activeGradeId)
      .map((g) => ({
        grade: g,
        shared: rowsFor(g.id).filter((r) => source.has(r.subjectId)).length,
      }))
      .filter((c) => c.shared >= threshold);
  }, [rows, grades, activeGradeId, rowsFor]);

  const addableSubjects = useMemo(() => {
    const present = new Set(rows.map((r) => normalize(r.subjectName)));
    const query = normalize(subjectQuery);
    return allSubjectsSorted.filter(
      (s) =>
        !present.has(normalize(s.name)) &&
        (!query || normalize(s.name).includes(query)),
    );
  }, [rows, allSubjectsSorted, subjectQuery]);

  const handleAddSubject = (subject: Subject) => {
    if (!activeGradeId || !activeGrade) return;
    const suggestion = suggestWeeklyLessons(
      subject.name,
      gradeBandFor(activeGrade),
    );
    setRows(activeGradeId, [
      ...rows,
      {
        key: `new-${activeGradeId}-${subject.id}`,
        subjectId: subject.id,
        subjectName: subject.name,
        teacherId: "",
        lessonsPerWeek: suggestion.lessonsPerWeek,
        doubleLessons: Math.min(
          suggestion.doubleLessons,
          Math.floor(suggestion.lessonsPerWeek / 2),
        ),
        streamId: null,
        streamName: null,
      },
    ]);
    setSubjectQuery("");
  };

  const handleSuggest = () => {
    if (!activeGradeId || !activeGrade) return;
    const band = gradeBandFor(activeGrade);
    let filled = 0;
    const next = rows.map((r) => {
      if (r.lessonsPerWeek > 0) return r;
      const suggestion = suggestWeeklyLessons(r.subjectName, band);
      filled += 1;
      return {
        ...r,
        lessonsPerWeek: suggestion.lessonsPerWeek,
        doubleLessons: Math.min(
          suggestion.doubleLessons,
          Math.floor(suggestion.lessonsPerWeek / 2),
        ),
      };
    });
    setRows(activeGradeId, next);
    toast({
      title: `Suggested values added for ${filled} ${filled === 1 ? "subject" : "subjects"}`,
      description: "Change anything that doesn't match your school, then save.",
    });
  };

  const handleClearGrade = () => {
    if (!activeGradeId) return;
    setRows(
      activeGradeId,
      rows.map((r) => ({ ...r, lessonsPerWeek: 0, doubleLessons: 0 })),
    );
  };

  const handleResetGrade = () => {
    if (!activeGradeId) return;
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[activeGradeId];
      return next;
    });
    setPending((prev) => {
      const next = { ...prev };
      delete next[activeGradeId];
      return next;
    });
  };

  /** Copy this class's lesson counts (not teachers) onto other classes. */
  const handleCopy = () => {
    if (!copyTargets.length) return;
    const bySubject = new Map(
      rows
        .filter((r) => !r.streamId)
        .map((r) => [r.subjectId, r] as const),
    );

    setDrafts((prev) => {
      const next = { ...prev };
      for (const gradeId of copyTargets) {
        next[gradeId] = rowsFor(gradeId).map((r) => {
          const source = bySubject.get(r.subjectId);
          if (!source || r.streamId) return r;
          return {
            ...r,
            lessonsPerWeek: source.lessonsPerWeek,
            doubleLessons: Math.min(
              source.doubleLessons,
              Math.floor(source.lessonsPerWeek / 2),
            ),
          };
        });
      }
      return next;
    });

    const names = copyTargets
      .map((id) => grades.find((g) => g.id === id)?.name)
      .filter(Boolean);
    toast({
      title: `Copied to ${names.length} ${names.length === 1 ? "class" : "classes"}`,
      description: `${names.join(", ")} now use the same lesson counts. Teachers stay as they were.`,
    });
    setCopyTargets([]);
    setCopyOpen(false);
  };

  const handleSave = useCallback(async () => {
    if (!dirtyGrades.length) return;
    setSaving(true);
    let created = 0;
    let updated = 0;
    let removed = 0;
    let skipped = 0;
    const stillNeedTeachers: Record<
      string,
      Record<string, { lessonsPerWeek: number; doubleLessons: number }>
    > = {};

    try {
      for (const gradeId of dirtyGrades) {
        for (const row of drafts[gradeId] ?? []) {
          const saved = row.allocationId
            ? allocations.find((a) => a.id === row.allocationId)
            : undefined;
          const wanted = row.lessonsPerWeek > 0 && Boolean(row.teacherId);

          if (!wanted) {
            if (saved) {
              await onDeleteAllocation(saved.id);
              removed += 1;
            } else if (row.lessonsPerWeek > 0) {
              skipped += 1;
              stillNeedTeachers[gradeId] ??= {};
              stillNeedTeachers[gradeId][row.subjectId] = {
                lessonsPerWeek: row.lessonsPerWeek,
                doubleLessons: row.doubleLessons,
              };
            }
            continue;
          }

          // The API keys allocations by tenant ids; the UI works in master ids.
          const payload = {
            termId,
            teacherId: row.teacherId,
            subjectId: row.subjectId,
            gradeLevelId:
              resolveTenantGradeLevelIdForApi(gradeId, grades) ?? gradeId,
            streamId:
              resolveTenantStreamIdForApi(row.streamId, gradeId, grades) ??
              undefined,
            lessonsPerWeek: row.lessonsPerWeek,
            preferredDoubleLessons: row.doubleLessons,
          };

          if (!saved) {
            await onCreateAllocation(payload);
            created += 1;
          } else if (saved.teacherId !== row.teacherId) {
            // Teacher is part of an allocation's identity, so swap it out.
            await onDeleteAllocation(saved.id);
            await onCreateAllocation(payload);
            updated += 1;
          } else if (
            saved.lessonsPerWeek !== row.lessonsPerWeek ||
            (saved.preferredDoubleLessons ?? 0) !== row.doubleLessons
          ) {
            await onUpdateAllocation({
              id: saved.id,
              lessonsPerWeek: row.lessonsPerWeek,
              preferredDoubleLessons: row.doubleLessons,
            });
            updated += 1;
          }
        }
      }

      setDrafts({});
      setPending((prev) => {
        const next = { ...prev };
        for (const gradeId of dirtyGrades) {
          if (stillNeedTeachers[gradeId]) {
            next[gradeId] = stillNeedTeachers[gradeId];
          } else {
            delete next[gradeId];
          }
        }
        return next;
      });

      const parts = [
        created ? `${created} added` : null,
        updated ? `${updated} updated` : null,
        removed ? `${removed} removed` : null,
      ].filter(Boolean);
      const waiting = skipped
        ? `${skipped} ${skipped === 1 ? "subject still needs" : "subjects still need"} a teacher — your numbers are kept, so just pick teachers and save again.`
        : null;

      toast({
        title: parts.length
          ? `Saved — ${parts.join(", ")}`
          : "Nothing to save yet",
        description:
          waiting ?? "Your weekly lessons are stored for this term.",
      });
    } catch (error) {
      toast({
        title: "We couldn't save everything",
        description: sanitizeTimetableUserMessage(error),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [
    dirtyGrades,
    drafts,
    allocations,
    grades,
    termId,
    onCreateAllocation,
    onUpdateAllocation,
    onDeleteAllocation,
    toast,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      save: () => handleSave(),
      hasUnsavedChanges: () => Object.keys(drafts).length > 0,
    }),
    [drafts, handleSave],
  );

  if (!grades.length) {
    return (
      <div className={cn(tt.panelMuted, "p-4")}>
        <p className={tt.caption}>
          Add your classes first, then come back to set how many lessons each
          subject needs.
        </p>
      </div>
    );
  }

  const visibleRows = hideEmpty
    ? rows.filter((r) => r.lessonsPerWeek > 0)
    : rows;

  return (
    <div className="space-y-2">
      {/* Class picker — one scrolling row */}
      <div className="-mx-0.5 flex gap-1 overflow-x-auto pb-0.5 [scrollbar-width:thin]">
        {grades.map((g) => {
          const total = lessonsForGrade(g.id);
          const active = isSameGrade(g.id, activeGradeId, grades);
          const isDirty = Boolean(drafts[g.id] || pending[g.id]);
          const short = abbreviateGradeShort(g.name) || g.name;
          return (
            <button
              key={g.id}
              type="button"
              title={`${g.name} · ${total} lessons`}
              onClick={() => selectGrade(g.id)}
              className={cn(
                "flex shrink-0 items-center gap-1 border px-1.5 py-1 text-[11px] font-medium transition",
                active
                  ? "border-[#246a59] bg-[#246a59] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300",
              )}
            >
              {short}
              <span
                className={cn(
                  "px-1 text-[9px] font-semibold tabular-nums leading-none",
                  active
                    ? "bg-white/20 text-white"
                    : total > 0
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800",
                )}
              >
                {total}
              </span>
              {isDirty && (
                <span
                  className={cn(
                    "h-1 w-1",
                    active ? "bg-white" : "bg-amber-500",
                  )}
                  aria-label="Unsaved changes"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Per-class toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        {rows.length > 0 && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-2 text-[11px]"
            onClick={handleSuggest}
          >
            <Sparkles className="mr-1 h-3 w-3" />
            Use suggested
          </Button>
        )}

        <Popover open={addOpen} onOpenChange={setAddOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[11px]"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-1.5">
            <Input
              autoFocus
              value={subjectQuery}
              onChange={(e) => setSubjectQuery(e.target.value)}
              placeholder="Search subjects…"
              className="h-7 text-[11px]"
            />
            <div className="mt-1.5 max-h-52 overflow-y-auto">
              {addableSubjects.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleAddSubject(s)}
                  className="flex w-full items-center justify-between gap-2 rounded-none px-1.5 py-1 text-left text-[11px] text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  {s.name}
                  <Plus className="h-3 w-3 shrink-0 text-slate-400" />
                </button>
              ))}
              {addableSubjects.length === 0 && (
                <p className={cn(tt.caption, "px-2 py-2 text-center text-[11px]")}>
                  {subjectQuery
                    ? "No subject matches that name."
                    : "Every subject is already listed."}
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={copyOpen} onOpenChange={setCopyOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[11px]"
              disabled={copyCandidates.length === 0}
            >
              <Copy className="mr-1 h-3 w-3" />
              Copy
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-60 p-2.5">
            <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-100">
              Copy {activeGrade?.name}&apos;s lesson counts to:
            </p>
            <p className={cn(tt.caption, "mt-0.5 text-[11px]")}>
              Teachers are left alone — only the numbers are copied.
            </p>
            <div className="mt-2 max-h-48 space-y-0.5 overflow-y-auto">
              {copyCandidates.map(({ grade, shared }) => (
                <label
                  key={grade.id}
                  className="flex cursor-pointer items-center gap-2 rounded-none px-1 py-0.5 text-[11px] text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <Checkbox
                    checked={copyTargets.includes(grade.id)}
                    onCheckedChange={(checked) =>
                      setCopyTargets((prev) =>
                        checked
                          ? [...prev, grade.id]
                          : prev.filter((id) => id !== grade.id),
                      )
                    }
                  />
                  <span className="min-w-0 flex-1 truncate">{grade.name}</span>
                  <span className="text-[9px] text-slate-400">
                    {shared} match
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                className="text-[10px] text-slate-500 hover:underline"
                onClick={() =>
                  setCopyTargets(
                    copyTargets.length
                      ? []
                      : copyCandidates.map((c) => c.grade.id),
                  )
                }
              >
                {copyTargets.length ? "Clear" : "Select all"}
              </button>
              <Button
                type="button"
                size="sm"
                className={cn("h-6 text-[11px]", tt.accentBtn)}
                disabled={!copyTargets.length}
                onClick={handleCopy}
              >
                Copy
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="ml-auto flex items-center gap-1.5">
          {rows.some((r) => r.lessonsPerWeek === 0) && (
            <button
              type="button"
              className="text-[10px] text-slate-500 hover:underline"
              onClick={() => setHideEmpty((v) => !v)}
            >
              {hideEmpty ? "Show all subjects" : "Hide unused subjects"}
            </button>
          )}
          {(drafts[activeGradeId] || pending[activeGradeId]) && (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:underline"
              onClick={handleResetGrade}
            >
              <Undo2 className="h-2.5 w-2.5" />
              Undo changes
            </button>
          )}
        </div>
      </div>

      {/* Column headings */}
      <div className="hidden items-center gap-1.5 px-2 sm:grid sm:grid-cols-[minmax(0,1fr)_4.75rem_4.75rem_8.5rem_1.25rem]">
        <span className={tt.eyebrow}>Subject</span>
        <span className={cn(tt.eyebrow, "text-center")}>Lessons</span>
        <span className={cn(tt.eyebrow, "text-center")}>Doubles</span>
        <span className={tt.eyebrow}>Teacher</span>
        <span />
      </div>

      <ul
        key={activeGradeId}
        className="divide-y divide-slate-100 overflow-hidden rounded-none border border-slate-200 dark:divide-slate-800 dark:border-slate-700"
      >
        {visibleRows.map((row) => {
          const { preferred, others } = teacherOptions(
            row.subjectName,
            activeGrade?.name,
          );
          const needsTeacher = row.lessonsPerWeek > 0 && !row.teacherId;
          const maxDoubles = Math.floor(row.lessonsPerWeek / 2);

          return (
            <li
              key={row.key}
              className={cn(
                "grid items-center gap-1.5 bg-white px-2 py-1.5 sm:grid-cols-[minmax(0,1fr)_4.75rem_4.75rem_8.5rem_1.25rem] dark:bg-slate-950",
                row.lessonsPerWeek === 0 && "bg-slate-50/60 dark:bg-slate-900/40",
              )}
            >
              <div className="min-w-0">
                <p
                  className={cn(
                    "truncate text-[12px] leading-tight",
                    row.lessonsPerWeek > 0
                      ? "font-medium text-slate-900 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400",
                  )}
                >
                  {row.subjectName}
                  {row.streamName && (
                    <span className="font-normal text-slate-400">
                      {" "}
                      · {row.streamName} only
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center justify-between gap-1.5 sm:justify-center">
                <span className={cn(tt.eyebrow, "sm:hidden")}>Lessons</span>
                <Stepper
                  ariaLabel={`${row.subjectName} lessons a week`}
                  value={row.lessonsPerWeek}
                  onChange={(n) =>
                    patchRow(row.key, {
                      lessonsPerWeek: n,
                      doubleLessons: Math.min(
                        row.doubleLessons,
                        Math.floor(n / 2),
                      ),
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-1.5 sm:justify-center">
                <span className={cn(tt.eyebrow, "sm:hidden")}>Doubles</span>
                <Stepper
                  ariaLabel={`${row.subjectName} double lessons`}
                  value={row.doubleLessons}
                  max={maxDoubles}
                  muted={maxDoubles === 0}
                  onChange={(n) => patchRow(row.key, { doubleLessons: n })}
                />
              </div>

              <Select
                value={row.teacherId || undefined}
                onValueChange={(v) => patchRow(row.key, { teacherId: v })}
              >
                <SelectTrigger
                  className={cn(
                    "h-7 text-[11px]",
                    needsTeacher && "border-amber-400",
                  )}
                >
                  <SelectValue placeholder="Assign teacher" />
                </SelectTrigger>
                <SelectContent>
                  {preferred.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-[10px]">
                        Teaches {row.subjectName}
                      </SelectLabel>
                      {preferred.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {others.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-[10px]">
                        Other teachers
                      </SelectLabel>
                      {others.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>

              <button
                type="button"
                aria-label={`Clear ${row.subjectName}`}
                onClick={() =>
                  patchRow(row.key, {
                    lessonsPerWeek: 0,
                    doubleLessons: 0,
                    teacherId: "",
                  })
                }
                className={cn(
                  "hidden h-6 w-6 items-center justify-center rounded-none text-slate-300 transition hover:bg-slate-100 hover:text-slate-600 sm:flex dark:hover:bg-slate-800",
                  row.lessonsPerWeek === 0 && !row.teacherId && "invisible",
                )}
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          );
        })}

        {visibleRows.length === 0 && (
          <li className="bg-white px-2 py-4 text-center dark:bg-slate-950">
            <p className={cn(tt.caption, "text-[11px]")}>
              {rows.length === 0
                ? `Use “Add a subject” to list what ${activeGrade?.name ?? "this class"} learns each week.`
                : `No lessons set for ${activeGrade?.name ?? "this class"} yet.`}
            </p>
          </li>
        )}
      </ul>

      {/* Capacity + save */}
      <div
        className={cn(
          tt.panelMuted,
          "flex flex-wrap items-center justify-between gap-2 px-2.5 py-2",
        )}
      >
        <div className="min-w-0">
          <p className="text-[12px] font-semibold leading-tight text-slate-900 dark:text-slate-100">
            {availableSlotsPerClass === 0
              ? activeTotal > 0
                ? `${activeTotal} lessons set — no periods on the school day yet`
                : "No lesson periods on the school day yet"
              : `${activeTotal}/${availableSlotsPerClass} this week`}
          </p>
          <p className={cn(tt.caption, "mt-0.5 text-[11px]")}>
            {availableSlotsPerClass === 0 ? (
              <span className="text-red-600 dark:text-red-400">
                Set up lesson times first — until the school day has periods,
                there&apos;s nowhere to place these lessons.
              </span>
            ) : overCapacity > 0 ? (
              <span className="text-red-600 dark:text-red-400">
                That&apos;s {overCapacity} more than this class has room for —
                lower some subjects or add periods to your school day.
              </span>
            ) : missingTeachers > 0 ? (
              <span className="text-amber-600 dark:text-amber-400">
                {missingTeachers}{" "}
                {missingTeachers === 1 ? "subject needs" : "subjects need"} a
                teacher before we can timetable {missingTeachers === 1 ? "it" : "them"}.
              </span>
            ) : activeTotal === 0 ? (
              "Assign all weekly lessons before continuing."
            ) : (
              `${availableSlotsPerClass - activeTotal} slots free`
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTotal > 0 && (
            <button
              type="button"
              className="text-[10px] text-slate-500 hover:underline"
              onClick={handleClearGrade}
            >
              Start over
            </button>
          )}
          <Button
            type="button"
            size="sm"
            className={cn("h-7 text-[11px]", tt.accentBtn)}
            disabled={!dirtyGrades.length || saving}
            onClick={() => void handleSave()}
          >
            {saving ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Check className="mr-1 h-3 w-3" />
                Save
                {dirtyGrades.length > 1 ? ` (${dirtyGrades.length})` : ""}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});
