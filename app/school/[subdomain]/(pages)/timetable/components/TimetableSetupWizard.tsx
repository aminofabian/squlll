"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Calendar,
  Clock,
  Coffee,
  GraduationCap,
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react";
import { useGradeLevelsForSchoolType } from "@/lib/hooks/useGradeLevelsForSchoolType";
import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";
import { useCurrentAcademicYear } from "@/lib/hooks/useAcademicYears";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OnboardingShell,
  StepIntro,
  StepBody,
  PresetOption,
  FieldGroup,
  onboardingInputClass,
} from "@/app/school/components/onboarding/onboarding-ui";
import { getTenantIdFromCookies } from "@/lib/utils/school-onboarding";
import {
  type TimetableBreakDraft,
  calculateDayEndTime,
  buildDefaultScopeKeys,
  buildTimetableScopeTargets,
  createTimetablesForScopes,
  mapGradeLevelsForSchoolType,
  markTimetableWizardComplete,
  scopeSummaryLabel,
  newBreakDraft,
  parsePositiveInt,
  suggestBreaksForPeriodCount,
  defaultLabelForBreakType,
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
  { value: "07:30", label: "7:30 in the morning" },
  { value: "08:00", label: "8:00 in the morning" },
  { value: "08:30", label: "8:30 in the morning" },
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
  { value: "8", label: "8 lessons", subtitle: "Normal day" },
  { value: "9", label: "9 lessons", subtitle: "Long day" },
] as const;

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

const BREAK_MODE_LABELS: Record<BreakMode, string> = {
  "full-day": "Assembly, short break, and lunch",
  "full-with-games": "Assembly, breaks, lunch, and games",
  "lunch-short": "Short break and lunch",
  lunch: "Lunch (40 minutes)",
  "long-lunch": "Long lunch (60 minutes)",
  "tea-and-lunch": "Tea break and lunch",
  "recess-and-lunch": "Recess and lunch",
  "long-morning": "Long morning break (no lunch)",
  "assembly-lunch": "Assembly and lunch",
  "games-only": "Games / sports block only",
  "games-long": "Long games / sports session",
  "lunch-games": "Lunch and games",
  "short-only": "Short break only (no lunch)",
  none: "No breaks yet",
  custom: "Custom breaks",
};

const BREAK_SECTIONS: { title: string; options: BreakOption[] }[] = [
  {
    title: "Everyday patterns",
    options: [
      {
        mode: "full-day",
        title: "Full school day",
        subtitle: "Assembly, short break, then lunch",
        emoji: "📋",
        badge: "Most schools",
      },
      {
        mode: "lunch-short",
        title: "Short break and lunch",
        subtitle: "Quick break, then lunch (40 min)",
        emoji: "☕",
      },
      {
        mode: "assembly-lunch",
        title: "Assembly and lunch",
        subtitle: "Morning assembly, lunch later",
        emoji: "🏫",
      },
      {
        mode: "full-with-games",
        title: "Full day + games",
        subtitle: "Assembly, breaks, lunch, then games / PE",
        emoji: "⚽",
      },
    ],
  },
  {
    title: "Longer stops & lunch",
    options: [
      {
        mode: "lunch",
        title: "Lunch (40 min)",
        subtitle: "Standard lunch in the middle of the day",
        emoji: "🍽️",
      },
      {
        mode: "long-lunch",
        title: "Long lunch (60 min)",
        subtitle: "Extra-long lunch break",
        emoji: "🍱",
      },
      {
        mode: "tea-and-lunch",
        title: "Tea break and lunch",
        subtitle: "Morning tea (20 min) plus lunch",
        emoji: "🫖",
      },
      {
        mode: "recess-and-lunch",
        title: "Recess and lunch",
        subtitle: "Outdoor recess (25 min) plus lunch",
        emoji: "🌳",
      },
      {
        mode: "long-morning",
        title: "Long morning break",
        subtitle: "30 min stop mid-morning — no lunch block",
        emoji: "⏳",
      },
    ],
  },
  {
    title: "Games & sports",
    options: [
      {
        mode: "games-only",
        title: "Games / PE block",
        subtitle: "45 min sports or games (afternoon)",
        emoji: "🎮",
      },
      {
        mode: "games-long",
        title: "Long games session",
        subtitle: "60 min — sports day or double PE",
        emoji: "🏃",
      },
      {
        mode: "lunch-games",
        title: "Lunch and games",
        subtitle: "Lunch, then 40 min games / sports",
        emoji: "⚽",
      },
    ],
  },
  {
    title: "Other",
    options: [
      {
        mode: "short-only",
        title: "Short break only",
        subtitle: "15 min break, no lunch (half day)",
        emoji: "⏱️",
      },
      {
        mode: "none",
        title: "Not now",
        subtitle: "Only lessons — add breaks later",
        emoji: "📚",
      },
      {
        mode: "custom",
        title: "Build your own",
        subtitle: "Add any breaks — lunch, tea, assembly, your own names",
        emoji: "✏️",
        badge: "Custom",
      },
    ],
  },
];

function afterPeriodOptions(periodCount: number): { value: string; label: string }[] {
  const opts = [
    { value: "0", label: "Before lesson 1" },
  ];
  for (let p = 1; p <= periodCount; p++) {
    opts.push({ value: String(p), label: `After lesson ${p}` });
  }
  return opts;
}

function formatCustomBreaksSummary(breaks: TimetableBreakDraft[]): string {
  if (breaks.length === 0) return "No breaks";
  return breaks
    .map((b) => {
      const name = b.label.trim() || defaultLabelForBreakType(b.type);
      const when =
        b.afterPeriod === 0
          ? "before lesson 1"
          : `after lesson ${b.afterPeriod}`;
      return `${name} (${b.durationMinutes} min, ${when})`;
    })
    .join("; ");
}

function formatTimeFriendly(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
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
  onOpenAcademicYear: () => void;
  onOpenCreateTerm: () => void;
}

export function TimetableSetupWizard({
  onComplete,
  onFailed,
  onSkip,
  onOpenAcademicYear,
  onOpenCreateTerm,
}: TimetableSetupWizardProps) {
  const params = useParams();
  const subdomain = (params?.subdomain as string) || "school";
  const { toast } = useToast();
  const { selectedTerm, hasTerms, termsLoading } = useSelectedTerm();
  const { academicYears, loading: academicYearsLoading, getActiveAcademicYear } =
    useCurrentAcademicYear();

  const activeYear = getActiveAcademicYear() ?? academicYears[0] ?? null;
  const hasAcademicYear = !!activeYear;
  const hasTerm = !!selectedTerm;
  const canProceed = hasAcademicYear && hasTerm;

  const { data: gradeLevelsRaw = [], isLoading: gradeLevelsLoading } =
    useGradeLevelsForSchoolType(canProceed);

  const defaultTemplateName = useMemo(() => {
    if (!selectedTerm || !activeYear) return "School Timetable";
    const yearMatch = activeYear.name.match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : "";
    const termName = selectedTerm.name
      .split(" ")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    return `${termName} Timetable ${year}`.trim();
  }, [selectedTerm, activeYear]);

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
  const [showOtherStartTime, setShowOtherStartTime] = useState(false);
  const [showPickDays, setShowPickDays] = useState(false);

  const isCustomLessonLength = !PRESET_LESSON_LENGTH_VALUES.has(periodDuration);

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
    setBreaks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    );
  };

  const addCustomBreakRow = () => {
    setBreakMode("custom");
    setBreaks((prev) => [
      ...prev,
      newBreakDraft({
        afterPeriod: Math.min(2, periodCountNum),
        durationMinutes: "15",
      }),
    ]);
  };

  const removeCustomBreakRow = (id: string) => {
    setBreaks((prev) => prev.filter((b) => b.id !== id));
  };

  const onCustomBreakTypeChange = (id: string, type: string) => {
    const preset = TIMETABLE_WIZARD_BREAK_TYPE_OPTIONS.find(
      (t) => t.value === type,
    );
    if (!preset) return;
    updateBreakDraft(id, {
      type,
      icon: preset.icon,
      color: preset.color,
      label:
        type === TIMETABLE_BREAK_TYPE_CUSTOM
          ? ""
          : preset.label,
    });
  };

  const applyWeekPreset = (days: number[]) => {
    setActiveWeekdays(new Set(days));
    if (days.length === 5 && days[0] === 1) setShowPickDays(false);
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
    if (!canProceed) return "Add your school year and term first";
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
      toast({ title: "Pick a term first", variant: "destructive" });
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
      const message =
        e instanceof Error ? e.message : "Something went wrong. Please try again.";
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

  const breakModeLabel =
    breakMode === "custom"
      ? formatCustomBreaksSummary(breaks)
      : BREAK_MODE_LABELS[breakMode];

  const renderPrerequisites = () => (
    <div className="px-6 sm:px-8 py-8 space-y-6">
      <div className="text-center max-w-md mx-auto">
        <div className="h-14 w-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-7 w-7 text-amber-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          One quick thing first
        </h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          We need to know which term this timetable is for. It only takes a
          minute.
        </p>
      </div>
      <div className="space-y-3">
        <div
          className={cn(
            "flex items-center justify-between gap-4 rounded-xl border p-4",
            hasAcademicYear
              ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20"
              : "border-slate-200 bg-slate-50/80 dark:border-slate-700",
          )}
        >
          <div className="flex items-center gap-3">
            {hasAcademicYear ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <Calendar className="h-5 w-5 text-[#246a59] shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium">School year</p>
              <p className="text-xs text-slate-500">
                {hasAcademicYear
                  ? activeYear?.name || "Done"
                  : "Like 2025–2026"}
              </p>
            </div>
          </div>
          {!hasAcademicYear && (
            <Button size="sm" onClick={onOpenAcademicYear}>
              Add year
            </Button>
          )}
        </div>
        <div
          className={cn(
            "flex items-center justify-between gap-4 rounded-xl border p-4",
            hasTerm
              ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20"
              : "border-slate-200 bg-slate-50/80 dark:border-slate-700",
          )}
        >
          <div className="flex items-center gap-3">
            {hasTerm ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <Calendar className="h-5 w-5 text-[#246a59] shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium">Term</p>
              <p className="text-xs text-slate-500">
                {hasTerm
                  ? selectedTerm?.name
                  : hasAcademicYear
                    ? "Like Term 1"
                    : "Add school year first"}
              </p>
            </div>
          </div>
          {hasAcademicYear && !hasTerm && termsLoading && (
            <span className="text-xs text-slate-500 shrink-0">Loading terms…</span>
          )}
          {hasAcademicYear && !hasTerm && !termsLoading && !hasTerms && (
            <Button size="sm" onClick={onOpenCreateTerm}>
              Add term
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    if (!canProceed) return renderPrerequisites();

    switch (step) {
      case 1:
        return (
          <>
            <StepIntro
              icon={Clock}
              title="When does school run?"
              description="Tap the answers that match your school. You can change them later."
            />
            <StepBody className="space-y-7">
              <FieldGroup label="First lesson starts at">
                <div className="grid gap-2">
                  {START_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => {
                        setStartTime(p.value);
                        setShowOtherStartTime(false);
                      }}
                      className={cn(
                        "w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                        startTime === p.value && !showOtherStartTime
                          ? "border-[#246a59] bg-[#246a59]/10 text-[#246a59]"
                          : "border-slate-200 text-slate-700 hover:border-[#246a59]/40 dark:border-slate-700",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowOtherStartTime((v) => !v)}
                  className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[#246a59]"
                >
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      showOtherStartTime && "rotate-180",
                    )}
                  />
                  Different time
                </button>
                {showOtherStartTime && (
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={cn(onboardingInputClass, "mt-2 max-w-[160px]")}
                  />
                )}
              </FieldGroup>

              <FieldGroup label="How long is one lesson?">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LESSON_LENGTH_OPTIONS.map((p) => (
                    <PresetOption
                      key={p.value}
                      selected={periodDuration === p.value}
                      onClick={() => setPeriodDuration(p.value)}
                      title={p.label}
                      subtitle={p.subtitle}
                      icon={Clock}
                    />
                  ))}
                </div>
                <div
                  className={cn(
                    "mt-2 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                    isCustomLessonLength
                      ? "border-[#246a59] bg-[#246a59]/10"
                      : "border-slate-200 bg-slate-50/80 dark:border-slate-700",
                  )}
                >
                  <label
                    htmlFor="custom-lesson-length"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Other length
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="custom-lesson-length"
                      type="number"
                      min={1}
                      max={240}
                      inputMode="numeric"
                      value={isCustomLessonLength ? periodDuration : ""}
                      placeholder="e.g. 35 or 50"
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setPeriodDuration(raw);
                      }}
                      onFocus={() => {
                        if (PRESET_LESSON_LENGTH_VALUES.has(periodDuration)) {
                          setPeriodDuration("");
                        }
                      }}
                      className={cn(onboardingInputClass, "w-24")}
                      aria-label="Custom lesson length in minutes"
                    />
                    <span className="text-sm text-slate-500">minutes</span>
                  </div>
                </div>
              </FieldGroup>

              <FieldGroup label="How many lessons in one day?">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {LESSONS_PER_DAY_OPTIONS.map((p) => (
                    <PresetOption
                      key={p.value}
                      selected={periodCount === p.value}
                      onClick={() => setPeriodCount(p.value)}
                      title={p.label}
                      subtitle={p.subtitle}
                      icon={LayoutGrid}
                    />
                  ))}
                </div>
              </FieldGroup>

              <FieldGroup label="Which days is school open?">
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => applyWeekPreset([1, 2, 3, 4, 5])}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                      activeWeekdays.size === 5 &&
                        [...activeWeekdays].every((d) => d <= 5) &&
                        !showPickDays
                        ? "border-[#246a59] bg-[#246a59]/10"
                        : "border-slate-200 hover:border-[#246a59]/40 dark:border-slate-700",
                    )}
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      Monday to Friday
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Most schools use this
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPickDays(true);
                      applyWeekPreset([1, 2, 3, 4, 5, 6]);
                    }}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                      activeWeekdays.size === 6 &&
                        [...activeWeekdays].every((d) => d <= 6)
                        ? "border-[#246a59] bg-[#246a59]/10"
                        : "border-slate-200 hover:border-[#246a59]/40 dark:border-slate-700",
                    )}
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      Monday to Saturday
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Six days a week</p>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPickDays((v) => !v)}
                  className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[#246a59]"
                >
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      showPickDays && "rotate-180",
                    )}
                  />
                  Pick days myself
                </button>
                {showPickDays && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {WEEKDAY_OPTIONS.map(({ n, short }) => {
                      const checked = activeWeekdays.has(n);
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => toggleWeekday(n)}
                          className={cn(
                            "min-w-[3.25rem] rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                            checked
                              ? "border-[#246a59] bg-[#246a59] text-white"
                              : "border-slate-200 text-slate-600 hover:border-[#246a59]/40 dark:border-slate-700",
                          )}
                        >
                          {short}
                        </button>
                      );
                    })}
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-2">{weekLabel}</p>
              </FieldGroup>

              <div className="rounded-xl border border-[#246a59]/20 bg-[#246a59]/5 px-4 py-3 text-sm leading-relaxed">
                <p className="text-slate-600 dark:text-slate-400">
                  Lessons start at{" "}
                  <strong className="text-[#246a59]">{startFriendly}</strong> and
                  finish around{" "}
                  <strong className="text-[#246a59]">{dayEndFriendly}</strong>{" "}
                  (before lunch and other breaks).
                </p>
              </div>
            </StepBody>
          </>
        );

      case 2:
        return (
          <>
            <StepIntro
              icon={Coffee}
              title="Do you stop for breaks?"
              description="Pick the day that looks most like your school. You can change breaks later."
            />
            <StepBody className="space-y-4 max-h-[min(62vh,560px)] overflow-y-auto pr-0.5">
              {BREAK_SECTIONS.map((section) => (
                <div key={section.title} className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 pt-1 first:pt-0">
                    {section.title}
                  </p>
                  {section.options.map((opt) => (
                    <button
                      key={opt.mode}
                      type="button"
                      onClick={() => selectBreakMode(opt.mode)}
                      className={cn(
                        "w-full rounded-xl border px-4 py-3.5 text-left transition-colors flex items-start gap-3",
                        breakMode === opt.mode
                          ? "border-[#246a59] bg-[#246a59]/10 ring-2 ring-[#246a59]/20"
                          : "border-slate-200 hover:border-[#246a59]/40 dark:border-slate-700",
                      )}
                    >
                      <span
                        className="text-2xl leading-none shrink-0"
                        aria-hidden
                      >
                        {opt.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                            {opt.title}
                          </p>
                          {opt.badge && (
                            <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#246a59]/15 text-[#246a59]">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {opt.subtitle}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ))}

              {breakMode === "custom" && (
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      Your breaks
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={addCustomBreakRow}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add break
                    </Button>
                  </div>
                  {breaks.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No breaks yet — tap Add break, or pick a preset above.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {breaks.map((b, index) => (
                        <div
                          key={b.id}
                          className="rounded-xl border border-[#246a59]/30 bg-[#246a59]/5 p-3 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-[#246a59]">
                              Break {index + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-red-600"
                              onClick={() => removeCustomBreakRow(b.id)}
                              aria-label="Remove break"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5 sm:col-span-2">
                              <Label className="text-xs">Type</Label>
                              <Select
                                value={b.type}
                                onValueChange={(v) =>
                                  onCustomBreakTypeChange(b.id, v)
                                }
                              >
                                <SelectTrigger
                                  className={cn(onboardingInputClass, "h-10")}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIMETABLE_WIZARD_BREAK_TYPE_OPTIONS.map(
                                    (t) => (
                                      <SelectItem
                                        key={t.value}
                                        value={t.value}
                                      >
                                        {t.icon} {t.label}
                                      </SelectItem>
                                    ),
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            {b.type === TIMETABLE_BREAK_TYPE_CUSTOM && (
                              <div className="space-y-1.5 sm:col-span-2">
                                <Label className="text-xs">Name</Label>
                                <Input
                                  value={b.label}
                                  onChange={(e) =>
                                    updateBreakDraft(b.id, {
                                      label: e.target.value,
                                    })
                                  }
                                  placeholder="e.g. Prayer time, Staff meeting"
                                  className={onboardingInputClass}
                                />
                              </div>
                            )}
                            <div className="space-y-1.5">
                              <Label className="text-xs">When</Label>
                              <Select
                                value={String(b.afterPeriod)}
                                onValueChange={(v) =>
                                  updateBreakDraft(b.id, {
                                    afterPeriod: parseInt(v, 10),
                                  })
                                }
                              >
                                <SelectTrigger
                                  className={cn(onboardingInputClass, "h-10")}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {afterPeriodOptions(periodCountNum).map(
                                    (opt) => (
                                      <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                      >
                                        {opt.label}
                                      </SelectItem>
                                    ),
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">How long</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min={1}
                                  max={240}
                                  inputMode="numeric"
                                  value={b.durationMinutes}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(
                                      /\D/g,
                                      "",
                                    );
                                    updateBreakDraft(b.id, {
                                      durationMinutes: raw,
                                    });
                                  }}
                                  className={cn(
                                    onboardingInputClass,
                                    "w-20",
                                  )}
                                  aria-label="Break length in minutes"
                                />
                                <span className="text-xs text-slate-500">
                                  minutes
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </StepBody>
          </>
        );

      case 3:
        return (
          <>
            <StepIntro
              icon={GraduationCap}
              title="Which classes get a timetable?"
              description="Each ticked class gets the same lesson times. After this, you add subjects to the grid."
            />
            <StepBody className="space-y-5">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 px-4 py-3 text-sm space-y-1.5">
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  You chose:
                </p>
                <ul className="text-slate-600 dark:text-slate-400 space-y-0.5 list-disc pl-4">
                  <li>
                    {periodCountNum} lessons × {periodDurationNum} minutes, starting{" "}
                    {startFriendly}
                  </li>
                  <li>{weekLabel}</li>
                  <li>{breakModeLabel}</li>
                  <li>
                    School ends around {dayEndFriendly} (lessons only)
                  </li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAllScopes}
                >
                  Tick all
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedScopeKeys(new Set())}
                >
                  Untick all
                </Button>
              </div>

              {gradeLevelsLoading ? (
                <p className="text-sm text-slate-500 py-4 text-center">
                  Loading classes…
                </p>
              ) : gradeLevelsWithStreams.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center leading-relaxed">
                  No classes found yet. Finish school setup, then come back.
                </p>
              ) : (
                <ul className="space-y-2 max-h-[min(50vh,420px)] overflow-y-auto pr-1">
                  {gradeLevelsWithStreams.flatMap((gl) => {
                    const gradeName = gl.displayName || gl.name;
                    if (gl.streams.length > 0) {
                      return gl.streams.map((s) => {
                        const key = `${gl.gradeLevelId}:${s.tenantStreamId}`;
                        const checked = selectedScopeKeys.has(key);
                        return (
                          <li key={key}>
                            <label
                              className={cn(
                                "flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors",
                                checked
                                  ? "border-[#246a59] bg-[#246a59]/5"
                                  : "border-slate-200 hover:border-slate-300 dark:border-slate-700",
                              )}
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(c) =>
                                  toggleScopeKey(key, c === true)
                                }
                              />
                              <span className="text-sm font-medium">
                                {gradeName} — {s.name}
                              </span>
                            </label>
                          </li>
                        );
                      });
                    }
                    const gradeOnlyKey = `${gl.gradeLevelId}:`;
                    const checked = selectedScopeKeys.has(gradeOnlyKey);
                    return (
                      <li key={gradeOnlyKey}>
                        <label
                          className={cn(
                            "flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors",
                            checked
                              ? "border-[#246a59] bg-[#246a59]/5"
                              : "border-slate-200 hover:border-slate-300 dark:border-slate-700",
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(c) =>
                              toggleScopeKey(gradeOnlyKey, c === true)
                            }
                          />
                          <span className="text-sm font-medium">{gradeName}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}

              {scopeTargets.length > 0 && (
                <p className="text-sm text-center text-slate-600 dark:text-slate-400">
                  We will make{" "}
                  <strong className="text-[#246a59]">{scopeTargets.length}</strong>{" "}
                  timetable
                  {scopeTargets.length === 1 ? "" : "s"}:{" "}
                  {scopeSummaryLabel(scopeTargets)}
                </p>
              )}
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
      currentStep={canProceed ? step : 1}
      totalSteps={TOTAL_STEPS}
      steps={[...WIZARD_STEPS]}
      onBack={handleBack}
      onSkip={handleSkip}
      skipLabel="I'll do this later"
      onContinue={() => void handleContinue()}
      continueLabel={
        !canProceed
          ? "Next"
          : step === TOTAL_STEPS
            ? isSubmitting
              ? "May take a few minutes…"
              : "Make my timetables"
            : "Next"
      }
      showSkip={!isSubmitting}
      isContinueDisabled={!canProceed || isSubmitting}
      isLoading={isSubmitting}
    >
      {renderStepContent()}
    </OnboardingShell>
  );
}
