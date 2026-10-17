"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Activity,
  Clock,
  Coffee,
  GraduationCap,
  CheckCircle2,
  Pencil,
  Plus,
  Trash2,
  Users,
  Utensils,
} from "lucide-react";
import { useGradeLevelsForSchoolType } from "@/lib/hooks/useGradeLevelsForSchoolType";
import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { getGradeSortOrder } from "@/lib/utils/grade-display";
import { tt } from "../utils/timetableTheme";

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

/** Alternate day shapes — only shown when the user says the default doesn't fit. */
const QUICK_PRESET_OPTIONS: BreakOption[] = [
  {
    mode: "full-day",
    title: "Typical day",
    subtitle: "Assembly, short break, lunch",
    emoji: "📋",
    badge: "Most common",
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
    title: "No breaks",
    subtitle: "Lessons only — add breaks later",
    emoji: "📚",
  },
  {
    mode: "custom",
    title: "Build my own",
    subtitle: "Start with lunch, add more",
    emoji: "✏️",
  },
];

type BreaksPanel = "review" | "edit" | "patterns";

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

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 8 * 60;
  return h * 60 + m;
}

function minutesToTime(totalMinutes: number): string {
  const mins = Math.max(0, totalMinutes);
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

type TimedFields = {
  startMinutes: number;
  endMinutes: number;
  startLabel: string;
  endLabel: string;
  durationMinutes: number;
};

type TimedDayRow =
  | ({ kind: "period"; period: number; start: string; end: string } & TimedFields)
  | ({
      kind: "break";
      id?: string;
      label: string;
      afterPeriod: number;
      icon?: string;
    } & TimedFields);

function breakIconForLabel(label: string) {
  const l = label.toLowerCase();
  if (l.includes("lunch") || l.includes("dinner")) return Utensils;
  if (l.includes("assembly")) return Users;
  if (l.includes("game") || l.includes("recess") || l.includes("sport"))
    return Activity;
  return Coffee;
}

function wizardChipClass(selected: boolean) {
  return cn(
    "shrink-0 rounded-none border px-2.5 py-1.5 transition-colors",
    tt.text.title,
    tt.numeral,
    tt.focus,
    selected
      ? "border-[#0a1f1a] bg-[#0a1f1a] text-white dark:border-[#246a59] dark:bg-[#246a59]"
      : cn(
          "border-[#1a4d42]/12 bg-white hover:border-[#1a4d42]/30 dark:border-white/10 dark:bg-[#0c1a17]",
          tt.ink.base,
        ),
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
      className={cn(tt.panel, "p-3 sm:p-4")}
    >
      <div className="mb-3 flex items-start gap-2.5">
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-none bg-[#e8f2ef] font-semibold dark:bg-white/10",
            tt.text.caption,
            tt.ink.base,
          )}
          aria-hidden
        >
          {number}
        </span>
        <div className="min-w-0">
          <h3
            id={`wizard-q-${number}-title`}
            className={cn(tt.text.title, tt.ink.strong)}
          >
            {title}
          </h3>
          {hint ? (
            <p className={cn("mt-0.5", tt.text.small, tt.ink.faint)}>
              {hint}
            </p>
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
      <p className={cn(tt.text.small, "font-medium", tt.ink.muted)}>
        {label}
      </p>
      {children}
    </div>
  );
}

function DaySummary({
  startFriendly,
  endFriendly,
  periodCountNum,
  periodDurationNum,
  weekLabel,
  breakCount,
  breakMinutes,
  selectedCount,
  totalCount,
}: {
  startFriendly: string;
  endFriendly: string;
  periodCountNum: number;
  periodDurationNum: number;
  weekLabel: string;
  breakCount?: number | null;
  breakMinutes?: number;
  selectedCount?: number;
  totalCount?: number;
}) {
  const details = [
    `${periodCountNum} lesson${periodCountNum === 1 ? "" : "s"}`,
    periodDurationNum > 0 ? `${periodDurationNum} min each` : null,
    breakCount == null
      ? null
      : breakCount > 0
        ? `${breakCount} break${breakCount === 1 ? "" : "s"} · ${breakMinutes ?? 0} min`
        : "No breaks yet",
    weekLabel,
    selectedCount != null && totalCount != null
      ? `${selectedCount}/${totalCount} classes`
      : null,
  ].filter(Boolean);

  return (
    <div
      className={cn(
        "border-b bg-[#f8fbfa] px-6 py-2.5 dark:bg-white/[0.02] sm:px-8",
        tt.border.hair,
      )}
    >
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className={cn("font-medium tabular-nums", tt.text.title, tt.ink.base)}>
          {startFriendly} → {endFriendly}
        </span>
        <span className={cn(tt.text.small, tt.ink.faint)}>
          · {details.join(" · ")}
        </span>
      </p>
    </div>
  );
}

function BreakTimeline({
  rows,
  title,
  subtitle,
  onEditBreaks,
  onAddBreak,
  onChangeShape,
}: {
  rows: TimedDayRow[];
  title: string;
  subtitle?: string;
  onEditBreaks: () => void;
  onAddBreak: () => void;
  onChangeShape: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className={cn(tt.panel, "overflow-hidden")}>
        <div className="border-b border-[#1a4d42]/10 px-3 py-2.5 dark:border-white/10">
          <p className={cn(tt.text.title, tt.ink.strong)}>{title}</p>
          {subtitle ? (
            <p className={cn("mt-0.5", tt.text.small, tt.ink.faint)}>
              {subtitle}
            </p>
          ) : null}
        </div>

        <ol className="divide-y divide-[#1a4d42]/8 dark:divide-white/8">
          {rows.map((row) => {
            const isBreak = row.kind === "break";
            const BreakIcon = isBreak ? breakIconForLabel(row.label) : Coffee;
            return (
              <li
                key={
                  isBreak
                    ? `break-${row.id ?? row.startMinutes}`
                    : `period-${row.period}`
                }
                className={cn(
                  "grid grid-cols-[4.4rem_1fr_auto] items-center gap-2 px-3 py-2",
                  isBreak &&
                    "bg-amber-50/70 dark:bg-amber-950/15",
                )}
              >
                <span
                  className={cn(
                    "tabular-nums",
                    tt.text.small,
                    isBreak
                      ? "font-medium text-amber-800 dark:text-amber-300"
                      : tt.ink.muted,
                  )}
                >
                  {formatTimeFriendly(row.startLabel)}
                </span>

                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center border",
                      isBreak
                        ? "border-amber-300/80 bg-amber-100 text-amber-800 dark:border-amber-800/60 dark:bg-amber-900/30 dark:text-amber-300"
                        : "border-[#1a4d42]/12 bg-[#f8fbfa] text-[#246a59] dark:border-white/10 dark:bg-white/5 dark:text-emerald-300",
                    )}
                  >
                    {isBreak ? (
                      <BreakIcon className="h-3 w-3" strokeWidth={2} />
                    ) : (
                      <span className="text-[9px] font-semibold tabular-nums">
                        {row.period}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "truncate",
                      tt.text.title,
                      isBreak ? "font-medium" : tt.ink.base,
                    )}
                  >
                    {isBreak ? row.label : `Lesson ${row.period}`}
                  </span>
                  {isBreak ? (
                    <span className="hidden shrink-0 border border-amber-200/80 bg-white/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-amber-800 sm:inline dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-300">
                      break
                    </span>
                  ) : null}
                </span>

                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "tabular-nums",
                      tt.text.small,
                      tt.ink.faint,
                    )}
                  >
                    {isBreak
                      ? `${row.durationMinutes} min`
                      : formatTimeFriendly(row.endLabel)}
                  </span>
                  {isBreak ? (
                    <button
                      type="button"
                      onClick={onEditBreaks}
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center text-amber-800/55 transition-colors hover:bg-amber-100 hover:text-amber-900 dark:text-amber-300/60 dark:hover:bg-amber-900/30 dark:hover:text-amber-200",
                        tt.focus,
                      )}
                      aria-label={`Edit ${row.label}`}
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1a4d42]/10 px-3 py-2 dark:border-white/10">
          <button
            type="button"
            onClick={onAddBreak}
            className={cn(
              "inline-flex items-center gap-1.5 text-[#246a59] transition-colors hover:text-[#0a1f1a] hover:underline dark:text-[#7eb8a8] dark:hover:text-white",
              tt.text.title,
              tt.focus,
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            Add break
          </button>
          <button
            type="button"
            onClick={onChangeShape}
            className={cn(
              "text-[#1a4d42]/55 transition-colors hover:text-[#246a59] hover:underline dark:text-white/45 dark:hover:text-[#7eb8a8]",
              tt.text.title,
              tt.focus,
            )}
          >
            Change day shape
          </button>
        </div>
      </div>

      <p className={cn("px-0.5", tt.text.small, tt.ink.faint)}>
        Breaks sit between lessons and extend the end of the school day. Tap the
        pencil on a break to edit it.
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

const WIZARD_DRAFT_STORAGE_PREFIX = "squl_timetable_wizard_draft_";

type WizardDraft = {
  step: number;
  startTime: string;
  periodDuration: string;
  periodCount: string;
  breakMode: BreakMode;
  selectedPreset: BreakMode;
  breaks: TimetableBreakDraft[];
  selectedScopeKeys: string[];
  activeWeekdays: number[];
};

/** Reads the in-progress wizard answers for one school (keyed by subdomain). */
function readWizardDraft(subdomain: string): WizardDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(
      `${WIZARD_DRAFT_STORAGE_PREFIX}${subdomain}`,
    );
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const draft = parsed as Partial<WizardDraft>;
    if (
      typeof draft.step !== "number" ||
      typeof draft.startTime !== "string" ||
      typeof draft.periodDuration !== "string" ||
      typeof draft.periodCount !== "string" ||
      typeof draft.breakMode !== "string" ||
      typeof draft.selectedPreset !== "string" ||
      !Array.isArray(draft.breaks) ||
      !Array.isArray(draft.selectedScopeKeys) ||
      !Array.isArray(draft.activeWeekdays)
    ) {
      return null;
    }
    return {
      step: draft.step,
      startTime: draft.startTime,
      periodDuration: draft.periodDuration,
      periodCount: draft.periodCount,
      breakMode: draft.breakMode as BreakMode,
      selectedPreset: draft.selectedPreset as BreakMode,
      breaks: draft.breaks as TimetableBreakDraft[],
      selectedScopeKeys: draft.selectedScopeKeys as string[],
      activeWeekdays: draft.activeWeekdays as number[],
    };
  } catch {
    return null;
  }
}

function writeWizardDraft(subdomain: string, draft: WizardDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `${WIZARD_DRAFT_STORAGE_PREFIX}${subdomain}`,
      JSON.stringify(draft),
    );
  } catch {
    // Storage can be unavailable (e.g. private browsing) — never block setup.
  }
}

function clearWizardDraft(subdomain: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(
      `${WIZARD_DRAFT_STORAGE_PREFIX}${subdomain}`,
    );
  } catch {
    // Ignore storage failures.
  }
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
  /** Which card the user chose — stays put even if they tweak times (which flips breakMode to custom). */
  const [selectedPreset, setSelectedPreset] = useState<BreakMode>("full-day");
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
  const [breaksPanel, setBreaksPanel] = useState<BreaksPanel>("review");
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  /** Avoids writing the defaults back over a stored draft before we hydrate it. */
  const [draftHydrated, setDraftHydrated] = useState(false);
  const breaksListEndRef = useRef<HTMLDivElement>(null);

  const isCustomLessonLength = !PRESET_LESSON_LENGTH_VALUES.has(periodDuration);
  const isCustomPeriodCount = !PRESET_LESSONS_PER_DAY_VALUES.has(periodCount);

  const gradeLevelsWithStreams = useMemo(
    () => mapGradeLevelsForSchoolType(gradeLevelsRaw),
    [gradeLevelsRaw],
  );

  /** School order: Baby Class, PP1, PP2, Grade 1 … Grade 12. */
  const sortedGradeLevels = useMemo(
    () =>
      [...gradeLevelsWithStreams].sort(
        (a, b) =>
          getGradeSortOrder(a.displayName || a.name) -
          getGradeSortOrder(b.displayName || b.name),
      ),
    [gradeLevelsWithStreams],
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
    if (breakMode === "none") {
      return buildDayTimelinePreview(
        startTime,
        periodCountNum,
        periodDurationNum,
        [],
      );
    }
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

  const timedDayPreview = useMemo<TimedDayRow[]>(() => {
    let cursor = timeToMinutes(startTime);
    return dayPreview.map((row) => {
      const duration =
        row.kind === "period"
          ? periodDurationNum
          : (parsePositiveInt(String(row.durationMinutes)) ?? 15);
      const startMinutes = cursor;
      cursor += duration;
      return {
        ...row,
        startMinutes,
        endMinutes: cursor,
        startLabel: minutesToTime(startMinutes),
        endLabel: minutesToTime(cursor),
        durationMinutes: duration,
      };
    });
  }, [dayPreview, startTime, periodDurationNum]);

  const breakRows = timedDayPreview.filter((row) => row.kind === "break");
  const breakCount = breakRows.length;
  const breakMinutes = breakRows.reduce(
    (sum, row) => sum + row.durationMinutes,
    0,
  );
  const lastTimedRow = timedDayPreview[timedDayPreview.length - 1];
  const schoolDayEndFriendly = formatTimeFriendly(
    minutesToTime(lastTimedRow?.endMinutes ?? timeToMinutes(dayEndTime)),
  );

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

  // Resume an in-progress setup so reopening the wizard doesn't lose answers.
  useEffect(() => {
    const draft = readWizardDraft(subdomain);
    if (draft) {
      if (draft.step >= 1 && draft.step <= TOTAL_STEPS) setStep(draft.step);
      setStartTime(draft.startTime);
      setPeriodDuration(draft.periodDuration);
      setPeriodCount(draft.periodCount);
      setBreakMode(draft.breakMode);
      setSelectedPreset(draft.selectedPreset);
      setBreaks(draft.breaks);
      setSelectedScopeKeys(new Set(draft.selectedScopeKeys));
      if (draft.activeWeekdays.length > 0) {
        setActiveWeekdays(new Set(draft.activeWeekdays));
      }
      setBreaksPanel(draft.breakMode === "custom" ? "edit" : "review");
    }
    setDraftHydrated(true);
  }, [subdomain]);

  // Persist answers so they survive a page reload or a later return.
  useEffect(() => {
    if (!draftHydrated) return;
    writeWizardDraft(subdomain, {
      step,
      startTime,
      periodDuration,
      periodCount,
      breakMode,
      selectedPreset,
      breaks,
      selectedScopeKeys: Array.from(selectedScopeKeys),
      activeWeekdays: Array.from(activeWeekdays),
    });
  }, [
    draftHydrated,
    subdomain,
    step,
    startTime,
    periodDuration,
    periodCount,
    breakMode,
    selectedPreset,
    breaks,
    selectedScopeKeys,
    activeWeekdays,
  ]);

  const selectBreakMode = (mode: BreakMode) => {
    setSelectedPreset(mode);
    if (mode === "custom") {
      setBreakMode("custom");
      setBreaksPanel("edit");
      setBreaks([
        newBreakDraft({
          type: "LUNCH",
          label: "Lunch",
          icon: "🍽️",
          color: "#F59E0B",
          afterPeriod: lunchAfterPeriod(periodCountNum),
          durationMinutes: "40",
        }),
      ]);
      return;
    }
    setBreakMode(mode);
    setBreaksPanel("review");
  };

  const updateBreakDraft = (
    id: string,
    patch: Partial<TimetableBreakDraft>,
  ) => {
    setBreakMode("custom");
    setBreaksPanel("edit");
    setBreaks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    );
  };

  const addAnotherBreak = () => {
    setBreakMode("custom");
    setBreaksPanel("edit");
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
    setBreakMode("custom");
    setBreaksPanel("edit");
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

  const performSkip = () => {
    const tenantId = getTenantIdFromCookies();
    if (tenantId) markTimetableWizardComplete(tenantId);
    onSkip();
  };

  const handleSkip = () => {
    // Past step 1 the user has entered real answers — confirm before leaving.
    if (step > 1) {
      setShowSkipConfirm(true);
      return;
    }
    performSkip();
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
      clearWizardDraft(subdomain);

      toast({
        title:
          created === 1
            ? "Your timetable is ready"
            : `${created} class timetables are ready`,
        description:
          "Next: tell SQUL who teaches what and let it build the timetable — or fill the grid by hand.",
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

  const renderBreakRow = (b: TimetableBreakDraft) => {
    const isCustomType = b.type === TIMETABLE_BREAK_TYPE_CUSTOM;
    const displayName =
      b.label.trim() ||
      getWizardBreakTypeOption(b.type)?.label ||
      "Break";

    return (
      <li key={b.id} className={cn(tt.panelMuted, "p-2.5")}>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={b.type}
            onChange={(e) => onCustomBreakTypeChange(b.id, e.target.value)}
            className={cn(onboardingInputClass, "h-9 min-w-[8.5rem] flex-1", tt.text.title)}
            aria-label={`${displayName} type`}
          >
            {BREAK_TYPE_CHIPS.map((typeValue) => {
              const opt = getWizardBreakTypeOption(typeValue);
              if (!opt) return null;
              const shortLabel =
                typeValue === TIMETABLE_BREAK_TYPE_CUSTOM
                  ? "Other"
                  : opt.label;
              return (
                <option key={typeValue} value={typeValue}>
                  {shortLabel}
                </option>
              );
            })}
          </select>

          <label
            className={cn(
              "inline-flex items-center gap-1.5",
              tt.text.small,
              tt.ink.muted,
            )}
          >
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
              className={cn(onboardingInputClass, "h-9 w-14 px-2", tt.text.title)}
              aria-label={`${displayName} duration in minutes`}
            />
            min
          </label>

          <select
            value={b.afterPeriod}
            onChange={(e) =>
              updateBreakDraft(b.id, {
                afterPeriod: Number(e.target.value),
              })
            }
            className={cn(onboardingInputClass, "h-9 min-w-[9rem] flex-1", tt.text.title)}
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

          {breaks.length > 1 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 w-9 shrink-0 rounded-none p-0 text-[#1a4d42]/40 hover:bg-red-50 hover:text-red-600"
              onClick={() => removeCustomBreakRow(b.id)}
              aria-label={`Remove ${displayName}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        {isCustomType ? (
          <Input
            id={`break-custom-name-${b.id}`}
            value={b.label}
            onChange={(e) =>
              updateBreakDraft(b.id, { label: e.target.value })
            }
            placeholder="Name this break"
            className={cn(onboardingInputClass, "mt-2 h-9")}
          />
        ) : null}
      </li>
    );
  };

  const renderBreaksStep = () => {
    const presetLabel =
      QUICK_PRESET_OPTIONS.find((o) => o.mode === selectedPreset)?.title ??
      "Custom";
    const isCustomized =
      breakMode === "custom" || selectedPreset === "custom";

    if (breaksPanel === "patterns") {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className={cn(tt.text.title, tt.ink.strong)}>
              Pick a different day shape
            </p>
            <button
              type="button"
              onClick={() => setBreaksPanel("review")}
              className={cn(
                "font-medium text-[#246a59] hover:underline dark:text-[#7eb8a8]",
                tt.text.small,
                tt.focus,
              )}
            >
              Cancel
            </button>
          </div>
          <ul className="space-y-1.5">
            {QUICK_PRESET_OPTIONS.map((opt) => {
              const selected = selectedPreset === opt.mode;
              return (
                <li key={opt.mode}>
                  <button
                    type="button"
                    onClick={() => selectBreakMode(opt.mode)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-none border px-3 py-2.5 text-left transition-colors",
                      tt.focus,
                      selected
                        ? "border-[#0a1f1a] bg-[#0a1f1a] text-white dark:border-[#246a59] dark:bg-[#246a59]"
                        : "border-[#1a4d42]/12 bg-white text-[#0a1f1a] hover:border-[#246a59]/35 dark:border-white/12 dark:bg-[#0c1a17] dark:text-white",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                        selected
                          ? "border-white bg-white"
                          : "border-[#1a4d42]/30 dark:border-white/30",
                      )}
                      aria-hidden
                    >
                      {selected ? (
                        <span className="h-2 w-2 rounded-full bg-[#0a1f1a]" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className={tt.text.title}>{opt.title}</span>
                        {opt.badge ? (
                          <span
                            className={cn(
                              "font-semibold uppercase tracking-wide",
                              tt.text.micro,
                              selected
                                ? "text-white/55"
                                : "text-[#246a59] dark:text-[#7eb8a8]",
                            )}
                          >
                            {opt.badge}
                          </span>
                        ) : null}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block",
                          tt.text.small,
                          selected ? "text-white/65" : tt.ink.muted,
                        )}
                      >
                        {opt.subtitle}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    if (breaksPanel === "edit") {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className={cn(tt.text.title, tt.ink.strong)}>
              Edit breaks
            </p>
            <button
              type="button"
              onClick={() => setBreaksPanel("review")}
              className={cn(
                "font-medium text-[#246a59] hover:underline dark:text-[#7eb8a8]",
                tt.text.small,
                tt.focus,
              )}
            >
              Done
            </button>
          </div>
          {breaks.length === 0 ? (
            <p className={cn(tt.panelMuted, "px-3 py-3", tt.text.title, tt.ink.muted)}>
              No breaks yet — add one below, or pick a day shape.
            </p>
          ) : (
            <ul className="space-y-2">{breaks.map(renderBreakRow)}</ul>
          )}
          <button
            type="button"
            onClick={addAnotherBreak}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-none border border-dashed border-[#1a4d42]/25 bg-transparent px-3 py-2 font-medium transition-colors hover:border-[#246a59]/40 hover:bg-[#f3f7f5]",
              tt.text.title,
              tt.ink.base,
              tt.focus,
            )}
          >
            <Plus className="h-4 w-4" />
            Add break
          </button>
          <button
            type="button"
            onClick={() => setBreaksPanel("patterns")}
            className={cn(
              "w-full text-center font-medium text-[#1a4d42]/45 hover:text-[#246a59] hover:underline dark:text-white/40 dark:hover:text-[#7eb8a8]",
              tt.text.small,
              tt.focus,
            )}
          >
            Or start from a different day shape
          </button>
          <div ref={breaksListEndRef} className="h-px" aria-hidden />
        </div>
      );
    }

    /* review — confirm-first: default is already applied */
    const timelineTitle =
      selectedPreset === "none"
        ? "Lessons only"
        : isCustomized
          ? "Your day"
          : presetLabel;
    const timelineSubtitle =
      selectedPreset === "none"
        ? "No breaks yet — you can add them now or later from the timetable."
        : !isCustomized
          ? "Pre-filled for you — continue if it matches your school."
          : "Customized breaks — check the times below.";

    return (
      <BreakTimeline
        rows={timedDayPreview}
        title={timelineTitle}
        subtitle={timelineSubtitle}
        onEditBreaks={() => setBreaksPanel("edit")}
        onAddBreak={addAnotherBreak}
        onChangeShape={() => setBreaksPanel("patterns")}
      />
    );
  };

  const renderClassesStep = () => {
    const allScopeKeys = buildDefaultScopeKeys(gradeLevelsWithStreams);
    const totalCount = allScopeKeys.length;
    const selectedCount = selectedScopeKeys.size;
    const allSelected =
      totalCount > 0 && allScopeKeys.every((key) => selectedScopeKeys.has(key));

    const setKeys = (keys: string[], checked: boolean) => {
      setSelectedScopeKeys((prev) => {
        const next = new Set(prev);
        for (const key of keys) {
          if (checked) next.add(key);
          else next.delete(key);
        }
        return next;
      });
    };

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={cn(tt.text.small, tt.ink.muted, tt.numeral)}>
            <span className="font-medium text-[#0a1f1a] dark:text-white">
              {selectedCount}
            </span>{" "}
            of {totalCount} selected
          </p>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={selectAllScopes}
              disabled={allSelected || totalCount === 0}
              className={cn(
                "font-medium text-[#246a59] transition-colors hover:text-[#0a1f1a] hover:underline disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#7eb8a8] dark:hover:text-white",
                tt.text.title,
                tt.focus,
              )}
            >
              Select all
            </button>
            <span aria-hidden className="h-3 w-px bg-[#1a4d42]/15 dark:bg-white/15" />
            <button
              type="button"
              onClick={() => setSelectedScopeKeys(new Set())}
              disabled={selectedCount === 0}
              className={cn(
                "font-medium text-[#1a4d42]/55 transition-colors hover:text-[#0a1f1a] hover:underline disabled:cursor-not-allowed disabled:opacity-40 dark:text-white/45 dark:hover:text-white",
                tt.text.title,
                tt.focus,
              )}
            >
              Clear
            </button>
          </div>
        </div>

        {gradeLevelsLoading ? (
          <p className={cn("py-6 text-center", tt.text.title, tt.ink.muted)}>
            Loading classes…
          </p>
        ) : gradeLevelsWithStreams.length === 0 ? (
          <p
            className={cn(
              "rounded-none border border-[#1a4d42]/12 bg-[#f8fbfa] px-3 py-4 text-center dark:border-white/10 dark:bg-white/[0.02]",
              tt.text.title,
              tt.ink.muted,
            )}
          >
            No classes yet — finish school setup first.
          </p>
        ) : (
          <div className="grid max-h-[min(46vh,360px)] sm:max-h-[min(58vh,560px)] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {sortedGradeLevels.map((gl) => {
              const gradeName = gl.displayName || gl.name;
              const streams = gl.streams;
              const keys =
                streams.length > 0
                  ? streams.map((s) => `${gl.gradeLevelId}:${s.tenantStreamId}`)
                  : [`${gl.gradeLevelId}:`];
              const checkedCount = keys.filter((key) =>
                selectedScopeKeys.has(key),
              ).length;
              const all = keys.length > 0 && checkedCount === keys.length;
              const some = checkedCount > 0 && !all;

              return (
                <div
                  key={gl.gradeLevelId}
                  className={cn(
                    "border p-2.5 transition-colors",
                    all || some
                      ? "border-[#246a59]/40 bg-[#246a59]/[0.05] dark:border-[#246a59]/60 dark:bg-[#246a59]/10"
                      : "border-[#1a4d42]/12 bg-white hover:border-[#1a4d42]/25 dark:border-white/10 dark:bg-[#0c1a17] dark:hover:border-white/20",
                  )}
                >
                  <label className="flex cursor-pointer items-center gap-2.5">
                    <Checkbox
                      checked={all ? true : some ? "indeterminate" : false}
                      onCheckedChange={(checked) =>
                        setKeys(keys, checked === true)
                      }
                      aria-label={`Select ${gradeName}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate",
                          tt.text.title,
                          tt.ink.strong,
                        )}
                      >
                        {gradeName}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block truncate",
                          tt.text.small,
                          tt.ink.faint,
                        )}
                      >
                        {streams.length === 0
                          ? "Whole class"
                          : `${streams.length} stream${streams.length === 1 ? "" : "s"}`}
                      </span>
                    </span>
                    {streams.length === 1 ? (
                      <span className="shrink-0 border border-[#1a4d42]/12 bg-[#f8fbfa] px-1.5 py-0.5 text-[10px] font-medium text-[#1a4d42]/60 dark:border-white/10 dark:bg-[#071411] dark:text-white/50">
                        Stream {streams[0].name}
                      </span>
                    ) : null}
                  </label>

                  {streams.length > 1 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5 pl-7">
                      {streams.map((stream) => {
                        const key = `${gl.gradeLevelId}:${stream.tenantStreamId}`;
                        const checked = selectedScopeKeys.has(key);
                        return (
                          <label
                            key={key}
                            className={cn(
                              "inline-flex cursor-pointer items-center gap-1.5 border px-2 py-1 text-[11px] transition-colors",
                              checked
                                ? "border-[#246a59] bg-[#246a59] text-white"
                                : "border-[#1a4d42]/12 bg-[#f8fbfa] text-[#1a4d42]/65 hover:bg-white dark:border-white/10 dark:bg-[#071411] dark:text-white/55 dark:hover:bg-white/5",
                            )}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) =>
                                setKeys([key], value === true)
                              }
                              className={
                                checked
                                  ? "border-white/70 data-[state=checked]:bg-white data-[state=checked]:text-[#0a1f1a]"
                                  : undefined
                              }
                              aria-label={`Select ${gradeName} stream ${stream.name}`}
                            />
                            {stream.name}
                          </label>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

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
            <DaySummary
              startFriendly={startFriendly}
              endFriendly={dayEndFriendly}
              periodCountNum={periodCountNum}
              periodDurationNum={periodDurationNum}
              weekLabel={weekLabel}
              breakCount={null}
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
                <label
                  className={cn(
                    "flex items-center gap-2.5",
                    tt.text.title,
                    tt.ink.muted,
                  )}
                >
                  Custom
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={cn(
                      onboardingInputClass,
                      "h-9 w-[7.5rem] px-2",
                      tt.text.title,
                      !START_OPTIONS.some((p) => p.value === startTime) &&
                        "border-[#0a1f1a] ring-1 ring-[#0a1f1a]/20 dark:border-[#246a59]",
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
                <label
                  className={cn(
                    "flex items-center gap-2.5",
                    tt.text.title,
                    tt.ink.muted,
                  )}
                >
                  Other
                  <Input
                    id="custom-lesson-length"
                    type="number"
                    min={1}
                    max={240}
                    inputMode="numeric"
                    value={isCustomLessonLength ? periodDuration : ""}
                    placeholder="e.g. 35"
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setPeriodDuration(raw);
                    }}
                    className={cn(
                      onboardingInputClass,
                      "h-9 w-24 px-2",
                      tt.text.title,
                      isCustomLessonLength &&
                        "border-[#0a1f1a] ring-1 ring-[#0a1f1a]/20 dark:border-[#246a59]",
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
                <label
                  className={cn(
                    "flex items-center gap-2.5",
                    tt.text.title,
                    tt.ink.muted,
                  )}
                >
                  Other
                  <Input
                    id="custom-lessons-per-day"
                    type="number"
                    min={1}
                    max={20}
                    inputMode="numeric"
                    value={isCustomPeriodCount ? periodCount : ""}
                    placeholder="e.g. 10"
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setPeriodCount(raw);
                    }}
                    className={cn(
                      onboardingInputClass,
                      "h-9 w-24 px-2",
                      tt.text.title,
                      isCustomPeriodCount &&
                        "border-[#0a1f1a] ring-1 ring-[#0a1f1a]/20 dark:border-[#246a59]",
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
                  <p className={cn(tt.text.small, tt.ink.faint)}>{weekLabel}</p>
                )}
              </WizardQuestion>
            </StepBody>
          </>
        );

      case 2:
        return (
          <>
            <StepIntro
              compact
              icon={Coffee}
              title="School breaks"
              description="We've set a typical day. Continue if it looks right — or tweak it."
            />
            <DaySummary
              startFriendly={startFriendly}
              endFriendly={schoolDayEndFriendly}
              periodCountNum={periodCountNum}
              periodDurationNum={periodDurationNum}
              weekLabel={weekLabel}
              breakCount={breakCount}
              breakMinutes={breakMinutes}
            />
            <StepBody className="space-y-3 py-4 sm:py-5">
              {renderBreaksStep()}
            </StepBody>
          </>
        );

      case 3:
        return (
          <>
            <StepIntro
              compact
              icon={GraduationCap}
              title="Choose classes"
              description="Each selected class gets its own weekly timetable. You can add the rest later."
            />
            <DaySummary
              startFriendly={startFriendly}
              endFriendly={schoolDayEndFriendly}
              periodCountNum={periodCountNum}
              periodDurationNum={periodDurationNum}
              weekLabel={weekLabel}
              breakCount={breakCount}
              breakMinutes={breakMinutes}
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
    <>
      <OnboardingShell
        subdomain={subdomain}
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        steps={[...WIZARD_STEPS]}
        onBack={handleBack}
        onSkip={handleSkip}
        skipLabel="Later"
        onContinue={() => void handleContinue()}
        continueLabel={
          step === TOTAL_STEPS
            ? isSubmitting
              ? "May take a few minutes…"
              : "Make timetables"
            : `Next: ${WIZARD_STEPS[step]?.name ?? "Continue"}`
        }
        showSkip={!isSubmitting}
        isContinueDisabled={isSubmitting}
        isLoading={isSubmitting}
      >
        {renderStepContent()}
      </OnboardingShell>

      <AlertDialog open={showSkipConfirm} onOpenChange={setShowSkipConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without finishing?</AlertDialogTitle>
            <AlertDialogDescription>
              {
                "Your timetable isn't set up yet. We'll keep your answers, so you can pick up where you left off."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep setting up</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowSkipConfirm(false);
                performSkip();
              }}
            >
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
