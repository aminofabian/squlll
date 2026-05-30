"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Clock,
  Coffee,
  GraduationCap,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import { useGradeLevelsForSchoolType } from "@/lib/hooks/useGradeLevelsForSchoolType";
import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  OnboardingShell,
  StepIntro,
  StepBody,
  onboardingInputClass,
} from "@/app/school/components/onboarding/onboarding-ui";
import { getTenantIdFromCookies } from "@/lib/utils/school-onboarding";
import {
  type TimetableBreakDraft,
  calculateDayEndTime,
  buildDefaultScopeKeys,
  buildTimetableScopeTargets,
  humanizeWeekTemplateError,
  createTimetablesForScopes,
  mapGradeLevelsForSchoolType,
  markTimetableWizardComplete,
  scopeSummaryLabel,
  newBreakDraft,
  parsePositiveInt,
  suggestBreaksForPeriodCount,
  defaultLabelForBreakType,
  buildDayTimelinePreview,
  getWizardBreakTypeOption,
  TIMETABLE_BREAK_TYPE_CUSTOM,
  TIMETABLE_WIZARD_BREAK_TYPE_OPTIONS,
} from "@/lib/utils/timetable-setup";
import { cn } from "@/lib/utils";

const WIZARD_STEPS = [
  { id: 1, name: "Times", description: "When school runs" },
  { id: 2, name: "Breaks", description: "Lunch & rest" },
  { id: 3, name: "Classes", description: "Make timetables" },
] as const;

const TOTAL_STEPS = WIZARD_STEPS.length;

const START_OPTIONS = [
  { value: "07:30", label: "7:30 AM" },
  { value: "08:00", label: "8:00 AM" },
  { value: "08:30", label: "8:30 AM" },
] as const;

const LESSON_LENGTH_OPTIONS = [
  { value: "30", label: "30 minutes", subtitle: "Shorter lessons" },
  { value: "40", label: "40 minutes", subtitle: "Most schools" },
  { value: "45", label: "45 minutes", subtitle: "Longer lessons" },
  { value: "60", label: "60 minutes", subtitle: "Double period / block" },
] as const;

const PRESET_LESSON_LENGTH_VALUES = new Set<string>(
  LESSON_LENGTH_OPTIONS.map((o) => o.value),
);

const LESSONS_PER_DAY_OPTIONS = [
  { value: "6", label: "6 lessons", subtitle: "Shorter day" },
  { value: "7", label: "7 lessons", subtitle: "Medium day" },
  { value: "8", label: "8 lessons", subtitle: "Normal day" },
  { value: "9", label: "9 lessons", subtitle: "Long day" },
] as const;

const PRESET_LESSONS_PER_DAY_VALUES = new Set<string>(
  LESSONS_PER_DAY_OPTIONS.map((o) => o.value),
);

const WEEKDAY_OPTIONS = [
  { n: 1, short: "Mon", full: "Monday" },
  { n: 2, short: "Tue", full: "Tuesday" },
  { n: 3, short: "Wed", full: "Wednesday" },
  { n: 4, short: "Thu", full: "Thursday" },
  { n: 5, short: "Fri", full: "Friday" },
  { n: 6, short: "Sat", full: "Saturday" },
  { n: 7, short: "Sun", full: "Sunday" },
] as const;

type BreakMode =
  | "full-day"
  | "full-with-games"
  | "lunch-short"
  | "lunch"
  | "long-lunch"
  | "tea-and-lunch"
  | "recess-and-lunch"
  | "long-morning"
  | "assembly-lunch"
  | "games-only"
  | "games-long"
  | "lunch-games"
  | "short-only"
  | "none"
  | "custom";

type BreakOption = {
  mode: BreakMode;
  title: string;
  subtitle: string;
  emoji: string;
  badge?: string;
};

/** Shown inside collapsed “preset” section — not the main flow. */
const QUICK_PRESET_OPTIONS: BreakOption[] = [
  {
    mode: "full-day",
    title: "Typical day",
    subtitle: "Assembly, short break, lunch",
    emoji: "📋",
  },
  {
    mode: "assembly-lunch",
    title: "Assembly + lunch",
    subtitle: "Morning assembly, then lunch",
    emoji: "🏫",
  },
  {
    mode: "lunch-short",
    title: "Break + lunch",
    subtitle: "Short break, then lunch",
    emoji: "☕",
  },
  {
    mode: "none",
    title: "No breaks yet",
    subtitle: "Add lessons only for now",
    emoji: "📚",
  },
  {
    mode: "custom",
    title: "Build my own",
    subtitle: "Add and place each break yourself",
    emoji: "✏️",
  },
];

const BREAK_TYPE_CHIPS = [
  "ASSEMBLY",
  "SHORT_BREAK",
  "LUNCH",
  "GAMES_BREAK",
  TIMETABLE_BREAK_TYPE_CUSTOM,
] as const;

function formatTimeFriendly(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
}

function wizardChipClass(selected: boolean) {
  return cn(
    "shrink-0 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-colors",
    selected
      ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
  );
}

function WizardQuestion({
  number,
  title,
  hint,
  children,
}: {
  number: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={`wizard-q-${number}-title`}
      className="rounded-xl border border-slate-200/70 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/40 sm:p-4"
    >
      <div className="mb-3 flex items-start gap-2.5">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          aria-hidden
        >
          {number}
        </span>
        <div className="min-w-0">
          <h3
            id={`wizard-q-${number}-title`}
            className="text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            {title}
          </h3>
          {hint ? (
            <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      {children}
    </div>
  );
}

function SchoolDayPreview({
  startFriendly,
  dayEndFriendly,
  periodCountNum,
  periodDurationNum,
  weekLabel,
}: {
  startFriendly: string;
  dayEndFriendly: string;
  periodCountNum: number;
  periodDurationNum: number;
  weekLabel: string;
}) {
  return (
    <div className="border-b border-slate-200/80 bg-slate-50/80 px-6 py-2.5 dark:border-slate-800 dark:bg-slate-900/50 sm:px-8">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        <span className="font-medium">{startFriendly} → {dayEndFriendly}</span>
        <span className="text-slate-400 dark:text-slate-500">
          {" "}
          · {periodCountNum}×{periodDurationNum} min · {weekLabel}
        </span>
      </p>
    </div>
  );
}

function BreakDayPreview({
  dayPreview,
}: {
  dayPreview: ReturnType<typeof buildDayTimelinePreview>;
}) {
  return (
    <div className="border-b border-slate-200/80 bg-slate-50/80 px-6 py-2.5 dark:border-slate-800 dark:bg-slate-900/50 sm:px-8">
      {dayPreview.length === 0 ? (
        <p className="text-sm text-slate-500">Lessons only</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {dayPreview.map((row, i) =>
            row.kind === "period" ? (
              <span
                key={`p-${i}`}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                Lesson {row.period}
              </span>
            ) : (
              <span
                key={`b-${i}`}
                className="rounded-md border border-amber-200/80 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900 dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-100"
                title={`${row.durationMinutes} min`}
              >
                {row.icon} {row.label}
              </span>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function ClassesSummaryPreview({
  startFriendly,
  dayEndFriendly,
  periodCountNum,
  periodDurationNum,
  weekLabel,
  selectedCount,
  totalCount,
}: {
  startFriendly: string;
  dayEndFriendly: string;
  periodCountNum: number;
  periodDurationNum: number;
  weekLabel: string;
  selectedCount: number;
  totalCount: number;
}) {
  return (
    <div className="border-b border-slate-200/80 bg-slate-50/80 px-6 py-2.5 dark:border-slate-800 dark:bg-slate-900/50 sm:px-8">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        <span className="font-medium">{startFriendly} → {dayEndFriendly}</span>
        <span className="text-slate-400 dark:text-slate-500">
          {" "}
          · {periodCountNum}×{periodDurationNum} min · {weekLabel}
        </span>
        <span className="text-slate-400 dark:text-slate-500">
          {" "}
          · {selectedCount}/{totalCount} selected
        </span>
      </p>
    </div>
  );
}

function lunchAfterPeriod(periodCount: number): number {
  return Math.min(Math.max(2, Math.floor(periodCount / 2)), periodCount);
}

function gamesAfterPeriod(periodCount: number, offset = 1): number {
  return Math.min(periodCount, lunchAfterPeriod(periodCount) + offset);
}

function draftLunch(periodCount: number, durationMinutes = "40") {
  return newBreakDraft({
    type: "LUNCH",
    label: "Lunch",
    afterPeriod: lunchAfterPeriod(periodCount),
    durationMinutes,
  });
}

function draftLongLunch(periodCount: number) {
  return newBreakDraft({
    type: "LONG_BREAK",
    label: "Long lunch",
    icon: "🍱",
    color: "#F59E0B",
    afterPeriod: lunchAfterPeriod(periodCount),
    durationMinutes: "60",
  });
}

function draftShortBreak(periodCount: number) {
  return newBreakDraft({
    type: "SHORT_BREAK",
    label: "Short break",
    afterPeriod: Math.min(2, periodCount),
    durationMinutes: "15",
  });
}

function draftAssembly() {
  return newBreakDraft({
    type: "ASSEMBLY",
    label: "Assembly",
    icon: "🏫",
    color: "#8B5CF6",
    afterPeriod: 0,
    durationMinutes: "15",
  });
}

function draftTeaBreak(periodCount: number) {
  return newBreakDraft({
    type: "TEA_BREAK",
    label: "Tea break",
    icon: "🫖",
    color: "#3B82F6",
    afterPeriod: Math.min(2, periodCount),
    durationMinutes: "20",
  });
}

function draftRecess(periodCount: number) {
  return newBreakDraft({
    type: "RECESS",
    label: "Recess",
    icon: "🌳",
    color: "#22C55E",
    afterPeriod: Math.min(2, periodCount),
    durationMinutes: "25",
  });
}

function draftLongMorning(periodCount: number) {
  return newBreakDraft({
    type: "LONG_BREAK",
    label: "Long break",
    icon: "⏳",
    color: "#0EA5E9",
    afterPeriod: Math.min(2, periodCount),
    durationMinutes: "30",
  });
}

function draftGames(periodCount: number, durationMinutes: string) {
  return newBreakDraft({
    type: "GAMES_BREAK",
    label: "Games / sports",
    icon: "🎮",
    color: "#EF4444",
    afterPeriod: gamesAfterPeriod(periodCount),
    durationMinutes,
  });
}

function breaksForMode(
  mode: BreakMode,
  periodCount: number,
): TimetableBreakDraft[] {
  if (mode === "none") return [];
  if (mode === "full-day") return suggestBreaksForPeriodCount(periodCount);
  if (mode === "full-with-games") {
    return [
      ...suggestBreaksForPeriodCount(periodCount),
      draftGames(periodCount, "40"),
    ];
  }

  const lunch = draftLunch(periodCount);
  const shortBreak = draftShortBreak(periodCount);

  switch (mode) {
    case "lunch":
      return [lunch];
    case "long-lunch":
      return [draftLongLunch(periodCount)];
    case "lunch-short":
      return [shortBreak, lunch];
    case "tea-and-lunch":
      return [draftTeaBreak(periodCount), lunch];
    case "recess-and-lunch":
      return [draftRecess(periodCount), lunch];
    case "long-morning":
      return [draftLongMorning(periodCount)];
    case "short-only":
      return [shortBreak];
    case "assembly-lunch":
      return [draftAssembly(), lunch];
    case "games-only":
      return [draftGames(periodCount, "45")];
    case "games-long":
      return [
        newBreakDraft({
          type: "GAMES_BREAK",
          label: "Games / sports",
          icon: "🏃",
          color: "#EF4444",
          afterPeriod: gamesAfterPeriod(periodCount),
          durationMinutes: "60",
        }),
      ];
    case "lunch-games":
      return [lunch, draftGames(periodCount, "40")];
    default:
      return [];
  }
}

function weekdaySummary(days: Set<number>): string {
  const sorted = Array.from(days).sort((a, b) => a - b);
  if (sorted.length === 0) return "No days picked";
  if (
    sorted.length === 5 &&
    sorted.every((d, i) => d === i + 1)
  ) {
    return "Monday to Friday";
  }
  return sorted
    .map((d) => WEEKDAY_OPTIONS.find((w) => w.n === d)?.full ?? `Day ${d}`)
    .join(", ");
}

export interface TimetableSetupWizardProps {
  onComplete: () => void | Promise<void>;
  onFailed?: (message: string) => void | Promise<void>;
  onSkip: () => void;
}

export function TimetableSetupWizard({
  onComplete,
  onFailed,
  onSkip,
}: TimetableSetupWizardProps) {
  const params = useParams();
  const subdomain = (params?.subdomain as string) || "school";
  const { toast } = useToast();
  const { selectedTerm } = useSelectedTerm();

  const { data: gradeLevelsRaw = [], isLoading: gradeLevelsLoading } =
    useGradeLevelsForSchoolType(true);

  const defaultTemplateName = "School Timetable";

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [startTime, setStartTime] = useState("08:00");
  const [periodDuration, setPeriodDuration] = useState("40");
  const [periodCount, setPeriodCount] = useState("8");
  const [breakMode, setBreakMode] = useState<BreakMode>("full-day");
  const [breaks, setBreaks] = useState<TimetableBreakDraft[]>(() =>
    breaksForMode("full-day", 8),
  );
  const [selectedScopeKeys, setSelectedScopeKeys] = useState<Set<string>>(
    new Set(),
  );
  const [activeWeekdays, setActiveWeekdays] = useState<Set<number>>(
    () => new Set([1, 2, 3, 4, 5]),
  );
  const [showPickDays, setShowPickDays] = useState(false);
  const breaksListEndRef = useRef<HTMLDivElement>(null);

  const isCustomLessonLength = !PRESET_LESSON_LENGTH_VALUES.has(periodDuration);
  const isCustomPeriodCount = !PRESET_LESSONS_PER_DAY_VALUES.has(periodCount);

  const gradeLevelsWithStreams = useMemo(
    () => mapGradeLevelsForSchoolType(gradeLevelsRaw),
    [gradeLevelsRaw],
  );

  const scopeTargets = useMemo(
    () => buildTimetableScopeTargets(selectedScopeKeys, gradeLevelsWithStreams),
    [selectedScopeKeys, gradeLevelsWithStreams],
  );

  useEffect(() => {
    if (gradeLevelsWithStreams.length > 0 && selectedScopeKeys.size === 0) {
      setSelectedScopeKeys(
        new Set(buildDefaultScopeKeys(gradeLevelsWithStreams)),
      );
    }
  }, [gradeLevelsWithStreams, selectedScopeKeys.size]);

  const toggleScopeKey = (key: string, checked: boolean) => {
    setSelectedScopeKeys((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const selectAllScopes = () => {
    setSelectedScopeKeys(
      new Set(buildDefaultScopeKeys(gradeLevelsWithStreams)),
    );
  };

  const periodCountNum = parsePositiveInt(periodCount) ?? 8;
  const periodDurationNum = parsePositiveInt(periodDuration) ?? 40;
  const dayEndTime = calculateDayEndTime(
    startTime,
    periodCountNum,
    periodDurationNum,
  );
  const dayEndFriendly = formatTimeFriendly(dayEndTime);
  const startFriendly = formatTimeFriendly(startTime);
  const weekLabel = weekdaySummary(activeWeekdays);

  const dayPreview = useMemo(() => {
    if (breakMode === "none" || breaks.length === 0) return [];
    return buildDayTimelinePreview(
      startTime,
      periodCountNum,
      periodDurationNum,
      breaks,
    );
  }, [
    breakMode,
    breaks,
    startTime,
    periodCountNum,
    periodDurationNum,
  ]);

  useEffect(() => {
    if (breakMode === "custom") return;
    setBreaks(breaksForMode(breakMode, periodCountNum));
  }, [breakMode, periodCountNum]);

  useEffect(() => {
    if (breakMode !== "custom") return;
    setBreaks((prev) =>
      prev.map((b) => ({
        ...b,
        afterPeriod: Math.min(Math.max(0, b.afterPeriod), periodCountNum),
      })),
    );
  }, [breakMode, periodCountNum]);

  const selectBreakMode = (mode: BreakMode) => {
    if (mode === "custom") {
      setBreakMode("custom");
      setBreaks((prev) =>
        prev.length > 0
          ? prev
          : [
              newBreakDraft({
                type: "LUNCH",
                label: "Lunch",
                icon: "🍽️",
                color: "#F59E0B",
                afterPeriod: lunchAfterPeriod(periodCountNum),
                durationMinutes: "40",
              }),
            ],
      );
      return;
    }
    setBreakMode(mode);
  };

  const updateBreakDraft = (
    id: string,
    patch: Partial<TimetableBreakDraft>,
  ) => {
    setBreakMode("custom");
    setBreaks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    );
  };

  const addAnotherBreak = () => {
    setBreakMode("custom");
    const lastAfter = breaks[breaks.length - 1]?.afterPeriod ?? 0;
    const nextAfter = Math.min(periodCountNum, Math.max(0, lastAfter + 1));
    setBreaks((prev) => [
      ...prev,
      newBreakDraft({
        type: "SHORT_BREAK",
        label: "Short break",
        icon: "☕",
        color: "#3B82F6",
        afterPeriod: nextAfter,
        durationMinutes: "15",
      }),
    ]);
    requestAnimationFrame(() => {
      breaksListEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  };

  const removeCustomBreakRow = (id: string) => {
    setBreaks((prev) => prev.filter((b) => b.id !== id));
  };

  const onCustomBreakTypeChange = (id: string, type: string) => {
    const preset = getWizardBreakTypeOption(type);
    if (!preset) return;
    updateBreakDraft(id, {
      type,
      icon: preset.icon,
      color: preset.color,
      label:
        type === TIMETABLE_BREAK_TYPE_CUSTOM ? "" : preset.label,
    });
  };

  const applyWeekPreset = (days: number[]) => {
    setActiveWeekdays(new Set(days));
    setShowPickDays(false);
  };

  const toggleWeekday = (dayNum: number) => {
    setActiveWeekdays((prev) => {
      const next = new Set(prev);
      if (next.has(dayNum)) {
        if (next.size <= 1) return prev;
        next.delete(dayNum);
      } else {
        next.add(dayNum);
      }
      return new Set(Array.from(next).sort((a, b) => a - b));
    });
  };

  const handleSkip = () => {
    const tenantId = getTenantIdFromCookies();
    if (tenantId) markTimetableWizardComplete(tenantId);
    onSkip();
  };

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!parsePositiveInt(periodCount) || parsePositiveInt(periodCount)! > 20)
        return "Pick how many lessons fit in one day";
      if (
        !parsePositiveInt(periodDuration) ||
        parsePositiveInt(periodDuration)! > 240
      )
        return "Pick how long one lesson is";
      if (!startTime.match(/^\d{2}:\d{2}$/))
        return "Pick when the first lesson starts";
      if (activeWeekdays.size < 1) return "Pick at least one school day";
      return null;
    }
    if (step === 2 && breakMode === "custom") {
      for (const b of breaks) {
        const dur = parsePositiveInt(b.durationMinutes);
        if (!dur || dur > 240) {
          return "Each break needs a length between 1 and 240 minutes";
        }
        if (b.afterPeriod < 0 || b.afterPeriod > periodCountNum) {
          return "Check when each break happens (before or after which lesson)";
        }
        if (
          b.type === TIMETABLE_BREAK_TYPE_CUSTOM &&
          !b.label.trim()
        ) {
          return "Give each custom break a name";
        }
      }
      return null;
    }
    if (step === 3) {
      if (scopeTargets.length === 0) return "Tick at least one class";
      return null;
    }
    return null;
  };

  const handleContinue = async () => {
    const err = validateStep();
    if (err) {
      toast({ title: err, variant: "destructive" });
      return;
    }

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }

    const termId = selectedTerm?.id;
    if (!termId) {
      toast({
        title: "Pick a term in the top bar first",
        variant: "destructive",
      });
      return;
    }

    const pCount = parsePositiveInt(periodCount)!;
    const pDuration = parsePositiveInt(periodDuration)!;
    const schoolDayNumbers = Array.from(activeWeekdays).sort((a, b) => a - b);
    const nDays = schoolDayNumbers.length;
    setIsSubmitting(true);
    try {
      const { created } = await createTimetablesForScopes({
        baseName: defaultTemplateName.trim(),
        startTime,
        periodCount: pCount,
        periodDuration: pDuration,
        numberOfDays: nDays,
        schoolDayNumbers,
        termId,
        targets: scopeTargets,
        breaks,
        replaceExisting: false,
      });

      const tenantId = getTenantIdFromCookies();
      if (tenantId) markTimetableWizardComplete(tenantId);

      toast({
        title:
          created === 1
            ? "Your timetable is ready"
            : `${created} class timetables are ready`,
        description:
          "Now tap a class and add subjects to each lesson slot.",
      });

      await onComplete();
    } catch (e) {
      const raw =
        e instanceof Error ? e.message : "Something went wrong. Please try again.";
      const message = humanizeWeekTemplateError(raw);
      toast({
        title: "Could not create timetable",
        description: message,
        variant: "destructive",
      });
      try {
        await onFailed?.(message);
      } catch {
        /* parent redirect must not block resetting submit state */
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (isSubmitting) return;
    if (step > 1) setStep((s) => s - 1);
  };

  const renderBreakCard = (b: TimetableBreakDraft, index: number) => {
    const isCustomType = b.type === TIMETABLE_BREAK_TYPE_CUSTOM;
    const displayName =
      b.label.trim() ||
      getWizardBreakTypeOption(b.type)?.label ||
      "Break";

    return (
      <li
        key={b.id}
        className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-3 dark:border-slate-700/80 dark:bg-slate-900/30"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Break {index + 1}
            <span className="font-normal text-slate-400"> · {displayName}</span>
          </p>
          {breaks.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
              onClick={() => removeCustomBreakRow(b.id)}
              aria-label={`Remove ${displayName}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <FieldRow label="Type">
            <div className="flex flex-wrap gap-2">
              {BREAK_TYPE_CHIPS.map((typeValue) => {
                const opt = getWizardBreakTypeOption(typeValue);
                if (!opt) return null;
                const shortLabel =
                  typeValue === TIMETABLE_BREAK_TYPE_CUSTOM
                    ? "Other"
                    : opt.label.replace(" break", "").replace(" / sports", "");
                return (
                  <button
                    key={typeValue}
                    type="button"
                    onClick={() => onCustomBreakTypeChange(b.id, typeValue)}
                    className={wizardChipClass(b.type === typeValue)}
                  >
                    {opt.icon} {shortLabel}
                  </button>
                );
              })}
            </div>
            {isCustomType && (
              <Input
                id={`break-custom-name-${b.id}`}
                value={b.label}
                onChange={(e) =>
                  updateBreakDraft(b.id, { label: e.target.value })
                }
                placeholder="Name this break"
                className={cn(onboardingInputClass, "mt-2 h-9 max-w-xs")}
              />
            )}
          </FieldRow>

          <div className="grid gap-3 sm:grid-cols-2">
            <FieldRow label="Duration">
              <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Input
                  type="number"
                  min={1}
                  max={240}
                  inputMode="numeric"
                  value={b.durationMinutes}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    updateBreakDraft(b.id, { durationMinutes: raw });
                  }}
                  className={cn(onboardingInputClass, "h-9 w-16 px-2 text-sm")}
                  aria-label={`${displayName} duration in minutes`}
                />
                minutes
              </label>
            </FieldRow>

            <FieldRow label="When">
              <select
                value={b.afterPeriod}
                onChange={(e) =>
                  updateBreakDraft(b.id, {
                    afterPeriod: Number(e.target.value),
                  })
                }
                className={cn(onboardingInputClass, "h-9 w-full max-w-xs text-sm")}
                aria-label={`When ${displayName} happens`}
              >
                <option value={0}>Before lesson 1</option>
                {Array.from({ length: periodCountNum }, (_, i) => i + 1).map(
                  (lesson) => (
                    <option key={lesson} value={lesson}>
                      After lesson {lesson}
                    </option>
                  ),
                )}
              </select>
            </FieldRow>
          </div>
        </div>
      </li>
    );
  };

  const renderBreaksStep = () => (
    <div className="space-y-3">
      <WizardQuestion
        number={1}
        title="Break pattern"
      >
        <div className="flex flex-wrap gap-2">
          {QUICK_PRESET_OPTIONS.map((opt) => (
            <button
              key={opt.mode}
              type="button"
              onClick={() => selectBreakMode(opt.mode)}
              className={wizardChipClass(breakMode === opt.mode)}
              title={opt.subtitle}
            >
              {opt.title}
            </button>
          ))}
        </div>
      </WizardQuestion>

      {breakMode === "none" ? (
        <p className="rounded-xl border border-slate-200/70 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/30">
          No breaks — add them later from the timetable.
        </p>
      ) : (
        <WizardQuestion
          number={2}
          title="Adjust breaks"
        >
          <ul className="space-y-2.5">{breaks.map(renderBreakCard)}</ul>
          <button
            type="button"
            onClick={addAnotherBreak}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
          >
            <Plus className="h-4 w-4" />
            Add another break
          </button>
          <div ref={breaksListEndRef} className="h-px" aria-hidden />
        </WizardQuestion>
      )}
    </div>
  );

  const renderClassesStep = () => {
    const allScopeKeys = buildDefaultScopeKeys(gradeLevelsWithStreams);
    const allSelected =
      allScopeKeys.length > 0 &&
      allScopeKeys.every((key) => selectedScopeKeys.has(key));
    const noneSelected = selectedScopeKeys.size === 0;

    return (
      <div className="space-y-3">
        <WizardQuestion
          number={1}
          title="Select classes"
        >
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={selectAllScopes}
              className={wizardChipClass(allSelected)}
            >
              All classes
            </button>
            <button
              type="button"
              onClick={() => setSelectedScopeKeys(new Set())}
              className={wizardChipClass(noneSelected)}
            >
              None
            </button>
          </div>

          {gradeLevelsLoading ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Loading classes…
            </p>
          ) : gradeLevelsWithStreams.length === 0 ? (
            <p className="rounded-xl border border-slate-200/70 bg-slate-50/50 px-3 py-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/30">
              No classes yet — finish school setup first.
            </p>
          ) : (
            <div className="max-h-[min(44vh,380px)] space-y-3 overflow-y-auto pr-1">
              {gradeLevelsWithStreams.map((gl) => {
                const gradeName = gl.displayName || gl.name;
                const items =
                  gl.streams.length > 0
                    ? gl.streams.map((s) => ({
                        key: `${gl.gradeLevelId}:${s.tenantStreamId}`,
                        label: s.name,
                      }))
                    : [{ key: `${gl.gradeLevelId}:`, label: gradeName }];

                return (
                  <div key={gl.gradeLevelId}>
                    {gl.streams.length > 0 && (
                      <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {gradeName}
                      </p>
                    )}
                    <ul className="space-y-1.5">
                      {items.map(({ key, label }) => {
                        const checked = selectedScopeKeys.has(key);
                        return (
                          <li key={key}>
                            <label
                              className={cn(
                                "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors",
                                checked
                                  ? "border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-800/60"
                                  : "border-slate-200/70 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/30",
                              )}
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(c) =>
                                  toggleScopeKey(key, c === true)
                                }
                              />
                              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                {gl.streams.length > 0
                                  ? label
                                  : gradeName}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {scopeTargets.length > 0 && (
            <p className="text-xs text-slate-500">
              {scopeTargets.length} timetable{scopeTargets.length === 1 ? "" : "s"}:{" "}
              {scopeSummaryLabel(scopeTargets)}
            </p>
          )}
        </WizardQuestion>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <StepIntro
              compact
              icon={Clock}
              title="When does school run?"
            />
            <SchoolDayPreview
              startFriendly={startFriendly}
              dayEndFriendly={dayEndFriendly}
              periodCountNum={periodCountNum}
              periodDurationNum={periodDurationNum}
              weekLabel={weekLabel}
            />
            <StepBody className="space-y-3 py-4 sm:py-5">
              <WizardQuestion
                number={1}
                title="First lesson starts at"
              >
                <div className="flex flex-wrap gap-2">
                  {START_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setStartTime(p.value)}
                      className={wizardChipClass(startTime === p.value)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2.5 text-sm text-slate-500">
                  Custom
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={cn(
                      onboardingInputClass,
                      "h-9 w-[7.5rem] px-2 text-sm",
                      !START_OPTIONS.some((p) => p.value === startTime) &&
                        "border-slate-900 ring-1 ring-slate-900/20 dark:border-slate-100",
                    )}
                    aria-label="Custom start time"
                  />
                </label>
              </WizardQuestion>

              <WizardQuestion
                number={2}
                title="How long is one lesson?"
              >
                <div className="flex flex-wrap gap-2">
                  {LESSON_LENGTH_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPeriodDuration(p.value)}
                      className={wizardChipClass(periodDuration === p.value)}
                      title={p.subtitle}
                    >
                      {p.value} min
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2.5 text-sm text-slate-500">
                  Other
                  <Input
                    id="custom-lesson-length"
                    type="number"
                    min={1}
                    max={240}
                    inputMode="numeric"
                    value={isCustomLessonLength ? periodDuration : ""}
                    placeholder="35"
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setPeriodDuration(raw);
                    }}
                    onFocus={() => {
                      if (PRESET_LESSON_LENGTH_VALUES.has(periodDuration)) {
                        setPeriodDuration("");
                      }
                    }}
                    className={cn(
                      onboardingInputClass,
                      "h-9 w-16 px-2 text-sm",
                      isCustomLessonLength &&
                        "border-slate-900 ring-1 ring-slate-900/20 dark:border-slate-100",
                    )}
                    aria-label="Custom lesson length in minutes"
                  />
                  <span>min</span>
                </label>
              </WizardQuestion>

              <WizardQuestion
                number={3}
                title="How many lessons in one day?"
              >
                <div className="flex flex-wrap gap-2">
                  {LESSONS_PER_DAY_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPeriodCount(p.value)}
                      className={wizardChipClass(periodCount === p.value)}
                      title={p.subtitle}
                    >
                      {p.value}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2.5 text-sm text-slate-500">
                  Other
                  <Input
                    id="custom-lessons-per-day"
                    type="number"
                    min={1}
                    max={20}
                    inputMode="numeric"
                    value={isCustomPeriodCount ? periodCount : ""}
                    placeholder="10"
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setPeriodCount(raw);
                    }}
                    onFocus={() => {
                      if (PRESET_LESSONS_PER_DAY_VALUES.has(periodCount)) {
                        setPeriodCount("");
                      }
                    }}
                    className={cn(
                      onboardingInputClass,
                      "h-9 w-16 px-2 text-sm",
                      isCustomPeriodCount &&
                        "border-slate-900 ring-1 ring-slate-900/20 dark:border-slate-100",
                    )}
                    aria-label="Custom number of lessons per day"
                  />
                  <span>lessons</span>
                </label>
              </WizardQuestion>

              <WizardQuestion
                number={4}
                title="Which days is school open?"
              >
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyWeekPreset([1, 2, 3, 4, 5])}
                    className={wizardChipClass(
                      activeWeekdays.size === 5 &&
                        [...activeWeekdays].every((d) => d <= 5) &&
                        !showPickDays,
                    )}
                  >
                    Mon–Fri
                  </button>
                  <button
                    type="button"
                    onClick={() => applyWeekPreset([1, 2, 3, 4, 5, 6])}
                    className={wizardChipClass(
                      activeWeekdays.size === 6 &&
                        [...activeWeekdays].every((d) => d <= 6) &&
                        !showPickDays,
                    )}
                  >
                    Mon–Sat
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPickDays(true)}
                    className={wizardChipClass(showPickDays)}
                  >
                    Custom
                  </button>
                </div>
                {showPickDays && (
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAY_OPTIONS.map(({ n, short }) => {
                      const checked = activeWeekdays.has(n);
                      return (
                        <button
                          key={n}
                          type="button"
                          aria-pressed={checked}
                          onClick={() => toggleWeekday(n)}
                          className={wizardChipClass(checked)}
                        >
                          {short}
                        </button>
                      );
                    })}
                  </div>
                )}
                {!showPickDays && (
                  <p className="text-xs text-slate-400">{weekLabel}</p>
                )}
              </WizardQuestion>
            </StepBody>
          </>
        );

      case 2:
        return (
          <>
            <StepIntro compact icon={Coffee} title="School breaks" />
            <BreakDayPreview dayPreview={dayPreview} />
            <StepBody className="space-y-3 py-4 sm:py-5">
              {renderBreaksStep()}
            </StepBody>
          </>
        );

      case 3:
        return (
          <>
            <StepIntro compact icon={GraduationCap} title="Select classes" />
            <ClassesSummaryPreview
              startFriendly={startFriendly}
              dayEndFriendly={dayEndFriendly}
              periodCountNum={periodCountNum}
              periodDurationNum={periodDurationNum}
              weekLabel={weekLabel}
              selectedCount={scopeTargets.length}
              totalCount={buildDefaultScopeKeys(gradeLevelsWithStreams).length}
            />
            <StepBody className="space-y-3 py-4 sm:py-5">
              {renderClassesStep()}
            </StepBody>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <OnboardingShell
      subdomain={subdomain}
      currentStep={step}
      totalSteps={TOTAL_STEPS}
      steps={[...WIZARD_STEPS]}
      onBack={handleBack}
      onSkip={handleSkip}
      skipLabel="I'll do this later"
      onContinue={() => void handleContinue()}
      continueLabel={
        step === TOTAL_STEPS
          ? isSubmitting
            ? "May take a few minutes…"
            : "Make my timetables"
          : `Next: ${WIZARD_STEPS[step]?.name ?? "Continue"}`
      }
      showSkip={!isSubmitting}
      isContinueDisabled={isSubmitting}
      isLoading={isSubmitting}
    >
      {renderStepContent()}
    </OnboardingShell>
  );
}
