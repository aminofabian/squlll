"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, CalendarDays, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DAY_NAMES } from "@/lib/timetable/constants";
import type { TimetableLesson, TimetableSlot } from "@/lib/timetable/types";

type SwapLessonOption = {
  entryId: string;
  subjectName: string;
  className: string;
  dayOfWeek: number;
  dayName: string;
  periodNumber: number;
  timeLabel: string;
};

type SwapTeacherOption = {
  teacherId: string;
  teacherName: string;
  email: string;
  lessons: SwapLessonOption[];
};

const OPTIONS_QUERY = `
  query LessonSwapOptions($input: LessonSwapOptionsInput!) {
    lessonSwapOptions(input: $input) {
      teacherId teacherName email
      lessons { entryId subjectName className dayOfWeek dayName periodNumber timeLabel }
    }
  }
`;

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ query, variables }),
  });
  const body = await response.json();
  if (body.errors?.length) throw new Error(body.errors[0].message);
  return body.data as T;
}

function nextOccurrence(dayOfWeek: number): string {
  const now = new Date();
  const delta = (dayOfWeek - now.getDay() + 7) % 7;
  const date = new Date(now);
  date.setDate(now.getDate() + delta);
  return date.toISOString().slice(0, 10);
}

export function LessonSwapDialog({
  lesson,
  slot,
  open,
  onOpenChange,
  onCreated,
}: {
  lesson: TimetableLesson | null;
  slot?: TimetableSlot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [options, setOptions] = useState<SwapTeacherOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [swapType, setSwapType] = useState<"TEMPORARY" | "PERMANENT">("TEMPORARY");
  const [teacherId, setTeacherId] = useState("");
  const [otherLessonId, setOtherLessonId] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !lesson) return;
    setSwapType("TEMPORARY");
    setTeacherId("");
    setOtherLessonId("");
    setNote("");
    setError(null);
    setEffectiveDate(nextOccurrence(lesson.dayOfWeek));
    setLoading(true);
    gql<{ lessonSwapOptions: SwapTeacherOption[] }>(OPTIONS_QUERY, {
      input: { lessonId: lesson.id },
    })
      .then((data) => setOptions(data.lessonSwapOptions ?? []))
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : "Could not load swap options"),
      )
      .finally(() => setLoading(false));
  }, [lesson, open]);

  const selectedTeacher = options.find((item) => item.teacherId === teacherId);
  const eligibleLessons = useMemo(() => {
    if (!selectedTeacher) return [];
    if (swapType === "TEMPORARY" && lesson) {
      return selectedTeacher.lessons.filter((item) => item.dayOfWeek === lesson.dayOfWeek);
    }
    return selectedTeacher.lessons;
  }, [lesson, selectedTeacher, swapType]);

  const submit = useCallback(async () => {
    if (!lesson || !teacherId || !otherLessonId || !effectiveDate) return;
    setSubmitting(true);
    setError(null);
    try {
      await gql(
        `mutation RequestSwap($input: CreateLessonSwapInput!) {
          requestLessonSwap(input: $input) { id status }
        }`,
        {
          input: {
            lessonId: lesson.id,
            otherTeacherId: teacherId,
            otherLessonId,
            swapType,
            effectiveDate,
            ...(note.trim() ? { note: note.trim() } : {}),
          },
        },
      );
      toast.success(
        swapType === "TEMPORARY"
          ? "Temporary swap sent to the other teacher"
          : "Permanent swap sent for teacher consent",
      );
      onCreated();
      onOpenChange(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not request swap");
    } finally {
      setSubmitting(false);
    }
  }, [effectiveDate, lesson, note, onCreated, onOpenChange, otherLessonId, swapType, teacherId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] gap-0 overflow-y-auto rounded-[24px] border-[#1a4d42]/12 bg-[#fffdf8] p-0 dark:border-white/10 dark:bg-[#0c1a17] sm:max-w-xl">
        <DialogHeader className="border-b border-[#1a4d42]/10 px-5 py-4 text-left dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0a2620] text-[#d9c49a]">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle className="font-display text-[21px] leading-tight text-[#0a1f1a] dark:text-white">
                Request a lesson swap
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[11px] text-[#1a4d42]/50 dark:text-white/40">
                Pick another teacher and the lesson they will exchange with you.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <div className="rounded-2xl border border-[#1a4d42]/10 bg-white p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#a07a3a]">
              Your selected lesson
            </p>
            <p className="mt-1 text-[14px] font-semibold text-[#0a1f1a] dark:text-white">
              {lesson?.subject.name}
            </p>
            <p className="mt-0.5 text-[11px] text-[#1a4d42]/55 dark:text-white/40">
              {lesson?.grade.displayName || lesson?.grade.name}
              {lesson?.stream ? ` · ${lesson.stream}` : ""} ·{" "}
              {lesson ? DAY_NAMES[lesson.dayOfWeek] : ""} · {slot?.displayTime}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(["TEMPORARY", "PERMANENT"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setSwapType(type);
                  setOtherLessonId("");
                }}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left transition-colors",
                  swapType === type
                    ? "border-[#0a2620] bg-[#0a2620] text-white"
                    : "border-[#1a4d42]/10 bg-white text-[#0a1f1a] hover:border-[#246a59]/30 dark:border-white/10 dark:bg-white/[0.03] dark:text-white",
                )}
              >
                <p className="text-[11px] font-semibold">
                  {type === "TEMPORARY" ? "One lesson only" : "Permanent"}
                </p>
                <p className={cn("mt-0.5 text-[9.5px]", swapType === type ? "text-white/55" : "text-[#1a4d42]/45 dark:text-white/35")}>
                  {type === "TEMPORARY"
                    ? "Auto-applies after both teachers agree"
                    : "Needs admin approval before it applies"}
                </p>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-[12px] text-[#1a4d42]/45">
              <Loader2 className="h-4 w-4 animate-spin" /> Finding eligible teachers…
            </div>
          ) : options.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#1a4d42]/15 px-4 py-6 text-center text-[11px] text-[#1a4d42]/45 dark:border-white/15 dark:text-white/35">
              No eligible teacher-swap options for this lesson right now.
            </p>
          ) : (
            <>
              <div>
                <Label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
                  Swap with
                </Label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {options.map((option) => (
                    <button
                      key={option.teacherId}
                      type="button"
                      onClick={() => {
                        setTeacherId(option.teacherId);
                        setOtherLessonId("");
                      }}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
                        teacherId === option.teacherId
                          ? "border-[#246a59] bg-[#246a59] text-white"
                          : "border-[#1a4d42]/12 bg-white text-[#1a4d42]/70 hover:border-[#246a59]/35 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/55",
                      )}
                    >
                      {option.teacherName}
                    </button>
                  ))}
                </div>
              </div>

              {selectedTeacher ? (
                <div>
                  <Label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
                    Lesson to exchange
                  </Label>
                  <div className="mt-2 space-y-1.5">
                    {eligibleLessons.length === 0 ? (
                      <p className="text-[11px] text-[#1a4d42]/45">
                        This teacher has no eligible lesson on that day. Try permanent or another teacher.
                      </p>
                    ) : (
                      eligibleLessons.map((item) => (
                        <button
                          key={item.entryId}
                          type="button"
                          onClick={() => setOtherLessonId(item.entryId)}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                            otherLessonId === item.entryId
                              ? "border-[#c49a52] bg-[#fff8e9] dark:bg-[#c49a52]/10"
                              : "border-[#1a4d42]/8 bg-white hover:border-[#246a59]/25 dark:border-white/8 dark:bg-white/[0.03]",
                          )}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-[11.5px] font-semibold text-[#0a1f1a] dark:text-white">
                              {item.subjectName}
                            </span>
                            <span className="mt-0.5 block truncate text-[10px] text-[#1a4d42]/45 dark:text-white/35">
                              {item.className} · {item.dayName} · {item.timeLabel}
                            </span>
                          </span>
                          <span className="shrink-0 text-[9px] font-medium text-[#1a4d42]/40">
                            P{item.periodNumber}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </>
          )}

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <Label htmlFor="swap-date" className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
                {swapType === "TEMPORARY" ? "Lesson date" : "Effective from"}
              </Label>
              <div className="relative mt-1.5">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#1a4d42]/35" />
                <Input
                  id="swap-date"
                  type="date"
                  value={effectiveDate}
                  onChange={(event) => setEffectiveDate(event.target.value)}
                  className="h-10 rounded-xl border-[#1a4d42]/12 bg-white pl-9 text-[12px] dark:border-white/10 dark:bg-[#071411]"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="swap-note" className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
                Note (optional)
              </Label>
              <Input
                id="swap-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Reason for the swap"
                className="mt-1.5 h-10 rounded-xl border-[#1a4d42]/12 bg-white text-[12px] dark:border-white/10 dark:bg-[#071411] sm:w-52"
              />
            </div>
          </div>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#1a4d42]/10 bg-white px-5 py-3 dark:border-white/10 dark:bg-[#071411]">
          <p className="text-[9.5px] text-[#1a4d42]/40 dark:text-white/30">
            <Users className="mr-1 inline h-3 w-3" />
            Both teachers and the timetable are checked before applying.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9 rounded-xl text-[11px]" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!teacherId || !otherLessonId || !effectiveDate || submitting}
              onClick={() => void submit()}
              className="h-9 rounded-xl bg-[#0a2620] text-[11px] text-white hover:bg-[#246a59]"
            >
              {submitting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />}
              Send swap request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
