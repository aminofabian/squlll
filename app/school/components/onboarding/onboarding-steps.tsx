"use client";

import { useMemo, useState, useEffect } from "react";
import {
  CalendarRange,
  CheckCircle2,
  Landmark,
  Loader2,
  Plus,
  School,
  Smartphone,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { TermDraft } from "@/lib/utils/school-calendar-presets";
import { useMpesaCustody } from "@/app/school/[subdomain]/(pages)/fees/hooks/useMpesaCustody";
import { useTenantFeeLetterSettings } from "@/app/school/[subdomain]/(pages)/fees/hooks/useTenantFeeLetterSettings";
import {
  DateField,
  FieldGroup,
  PresetOption,
  StepBody,
  StepIntro,
  onboardingInputClass,
} from "./onboarding-ui";

export function DoneBanner({
  label,
  detail,
}: {
  label: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3 border border-emerald-600/25 bg-emerald-50/90 dark:bg-emerald-950/40 dark:border-emerald-700/40 p-5 shadow-[3px_3px_0_0_rgba(5,150,105,0.15)]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-emerald-600/30 bg-emerald-100 dark:bg-emerald-900/50">
        <CheckCircle2 className="h-5 w-5 text-emerald-700" />
      </div>
      <div>
        <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
          {label}
        </p>
        <p className="text-sm text-emerald-800/85 dark:text-emerald-300/90 mt-1">
          {detail}
        </p>
      </div>
    </div>
  );
}

export function formatDisplayDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

type AcademicYearStepProps = {
  hasAcademicYear: boolean;
  activeYearLabel?: string;
  activeYearRange?: string;
  form: { name: string; startDate: string; endDate: string };
  onFormChange: (
    field: "name" | "startDate" | "endDate",
    value: string,
  ) => void;
  onSuggestCurrentYear: () => void;
  onSuggestMoe: () => void;
  suggestedYearLabel: string;
  moeYear: number;
  isCreating: boolean;
  onCreate: () => void;
};

type YearPreset = "standard" | "moe" | "custom";

export function AcademicYearStepContent({
  hasAcademicYear,
  activeYearLabel,
  activeYearRange,
  form,
  onFormChange,
  onSuggestCurrentYear,
  onSuggestMoe,
  suggestedYearLabel,
  moeYear,
  isCreating,
  onCreate,
}: AcademicYearStepProps) {
  const [activePreset, setActivePreset] = useState<YearPreset | null>(
    "standard",
  );

  const preview = useMemo(() => {
    if (!form.startDate || !form.endDate) return null;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start >= end
    )
      return null;
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return {
      days,
      range: `${formatDisplayDate(form.startDate)} – ${formatDisplayDate(form.endDate)}`,
    };
  }, [form.startDate, form.endDate]);

  const isValid =
    form.name.trim() &&
    form.startDate &&
    form.endDate &&
    new Date(form.startDate) < new Date(form.endDate);

  if (hasAcademicYear && activeYearLabel && activeYearRange) {
    return (
      <>
        <StepIntro
          icon={CalendarRange}
          title="Academic year"
          description="Your school calendar is ready for terms and classes."
        />
        <StepBody>
          <DoneBanner
            label={`${activeYearLabel} is ready`}
            detail={activeYearRange}
          />
        </StepBody>
      </>
    );
  }

  const selectStandard = () => {
    setActivePreset("standard");
    onSuggestCurrentYear();
  };

  const selectMoe = () => {
    setActivePreset("moe");
    onSuggestMoe();
  };

  return (
    <>
      <StepIntro
        icon={CalendarRange}
        title="Academic year"
        description="Choose a quick template or enter your own dates. You can edit everything before saving."
      />
      <StepBody className="space-y-7">
        <section>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-3">
            Quick fill
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PresetOption
              selected={activePreset === "standard"}
              onClick={selectStandard}
              icon={School}
              title={`${suggestedYearLabel} school year`}
              subtitle={`1 Jan – 31 Dec ${suggestedYearLabel}`}
              badge="Common"
            />
            <PresetOption
              selected={activePreset === "moe"}
              onClick={selectMoe}
              icon={Sparkles}
              title={`Kenya MoE ${moeYear}`}
              subtitle="Official ministry term calendar dates"
            />
          </div>
        </section>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <div className="w-full border-t border-[#1a4d42]/12 dark:border-white/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-[#0c1a17] px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1a4d42]/45">
              or customize
            </span>
          </div>
        </div>

        <section className="space-y-4">
          <FieldGroup
            label="Year name"
            htmlFor="year-name"
            hint="Shown across fees, reports, and timetables"
          >
            <Input
              id="year-name"
              placeholder={`e.g. ${suggestedYearLabel}`}
              value={form.name}
              onChange={(e) => {
                setActivePreset("custom");
                onFormChange("name", e.target.value);
              }}
              className={onboardingInputClass}
            />
          </FieldGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="Starts" htmlFor="year-start">
              <DateField
                id="year-start"
                value={form.startDate}
                max={form.endDate || undefined}
                onChange={(v) => {
                  setActivePreset("custom");
                  onFormChange("startDate", v);
                }}
              />
            </FieldGroup>
            <FieldGroup label="Ends" htmlFor="year-end">
              <DateField
                id="year-end"
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={(v) => {
                  setActivePreset("custom");
                  onFormChange("endDate", v);
                }}
              />
            </FieldGroup>
          </div>
        </section>

        {preview && (
          <div className="border border-[#246a59]/25 bg-[#246a59]/[0.06] px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[#0a1f1a] dark:text-white">
                {form.name || "Untitled year"}
              </p>
              <p className="text-xs text-[#1a4d42]/65 mt-0.5">{preview.range}</p>
            </div>
            <span className="text-xs font-semibold tabular-nums text-[#246a59] bg-white dark:bg-[#0a1f1a] px-2.5 py-1 border border-[#246a59]/20">
              {preview.days} days
            </span>
          </div>
        )}

        <Button
          onClick={onCreate}
          disabled={isCreating || !isValid}
          className="w-full h-12 rounded-none text-base font-medium bg-[#0a1f1a] hover:bg-[#246a59] shadow-[3px_3px_0_0_rgba(36,106,89,0.35)]"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating…
            </>
          ) : (
            "Create academic year"
          )}
        </Button>
      </StepBody>
    </>
  );
}

type TermsStepProps = {
  hasAcademicYear: boolean;
  hasTerms: boolean;
  academicYearName?: string;
  existingTermNames?: string;
  termDrafts: TermDraft[];
  onTermDraftsChange: (drafts: TermDraft[]) => void;
  termMode: "suggested" | "moe" | "custom";
  onTermModeChange: (mode: "suggested" | "moe" | "custom") => void;
  suggestedTermCount: number;
  onSuggestedTermCountChange: (n: number) => void;
  onApplySuggested: () => void;
  onApplyMoe: () => void;
  moeYear: number;
  customTerm: TermDraft;
  onCustomTermChange: (t: TermDraft) => void;
  onAddCustomTerm: () => void;
};

export function TermsStepContent({
  hasAcademicYear,
  hasTerms,
  academicYearName,
  existingTermNames,
  termDrafts,
  onTermDraftsChange,
  termMode,
  onTermModeChange,
  suggestedTermCount,
  onSuggestedTermCountChange,
  onApplySuggested,
  onApplyMoe,
  moeYear,
  customTerm,
  onCustomTermChange,
  onAddCustomTerm,
}: TermsStepProps) {
  const [activeTerm, setActiveTerm] = useState<number>(0);

  // Sync activeTerm to termDrafts so the wizard picks up the correct isActive
  useEffect(() => {
    const next = termDrafts.map((t, i) => ({
      ...t,
      active: i === activeTerm,
    }));
    onTermDraftsChange(next);
  }, [activeTerm]);

  if (!hasAcademicYear) {
    return (
      <p className="text-sm text-[#1a4d42]/70 border border-[#1a4d42]/12 bg-[#f3f7f5] dark:bg-white/5 dark:text-white/60 p-4">
        Go back and create an academic year first.
      </p>
    );
  }

  if (hasTerms && existingTermNames) {
    return <DoneBanner label="Terms are set up" detail={existingTermNames} />;
  }

  const updateDraft = (
    index: number,
    field: keyof TermDraft,
    value: string | boolean,
  ) => {
    const next = [...termDrafts];
    next[index] = { ...next[index], [field]: value };
    // If the active term gets unchecked, clear the active selection
    if (field === "included" && value === false && index === activeTerm) {
      setActiveTerm(-1);
    }
    onTermDraftsChange(next);
  };

  const includedCount = termDrafts.filter((t) => t.included !== false).length;

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-[#1a4d42]/75 dark:text-white/60">
        A school year is usually split into teaching terms. Choose how you&apos;d
        like to set up{" "}
        <strong className="text-[#0a1f1a] dark:text-white">
          {academicYearName}
        </strong>{" "}
        — you can fine-tune every date afterwards.
      </p>

      {/* How do you want to set up your terms? */}
      <div className="grid gap-2 sm:grid-cols-3">
        <PresetOption
          selected={termMode === "suggested"}
          onClick={() => onTermModeChange("suggested")}
          title="Split it for me"
          subtitle="We space the terms evenly across the year"
        />
        <PresetOption
          selected={termMode === "moe"}
          onClick={() => onTermModeChange("moe")}
          title={`Kenya MoE ${moeYear}`}
          subtitle="Use the Ministry's official term dates"
        />
        <PresetOption
          selected={termMode === "custom"}
          onClick={() => onTermModeChange("custom")}
          title="I'll enter my own"
          subtitle="Type the name and dates for each term"
        />
      </div>

      {termMode === "suggested" && (
        <div className="space-y-4 border border-[#1a4d42]/12 bg-[#f8fbfa] p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#0a1f1a] dark:text-white">
                How many terms?
              </p>
              <p className="mt-0.5 text-xs text-[#1a4d42]/60 dark:text-white/50">
                Most Kenyan schools use three.
              </p>
            </div>
            <div className="flex items-center border border-[#1a4d42]/15 bg-white p-0.5 dark:border-white/15 dark:bg-[#0a1f1a]">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onSuggestedTermCountChange(n)}
                  aria-pressed={suggestedTermCount === n}
                  className={cn(
                    "h-9 w-11 text-sm font-semibold transition-colors",
                    suggestedTermCount === n
                      ? "bg-[#0a1f1a] text-white dark:bg-emerald-400 dark:text-[#0a1f1a]"
                      : "text-[#1a4d42]/60 hover:text-[#0a1f1a] dark:text-white/50 dark:hover:text-white",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onApplySuggested}
            className="inline-flex w-full items-center justify-center gap-2 border border-[#246a59]/40 bg-white px-4 py-2.5 text-sm font-semibold text-[#246a59] transition-colors hover:bg-[#246a59]/[0.06] dark:bg-[#0a1f1a] sm:w-auto"
          >
            <Sparkles className="h-4 w-4" />
            Fill in the dates
          </button>
          <p className="text-xs text-[#1a4d42]/55 dark:text-white/45">
            We&apos;ll spread the dates evenly — tweak any of them below.
          </p>
        </div>
      )}

      {termMode === "moe" && (
        <div className="space-y-4 border border-[#1a4d42]/12 bg-[#f8fbfa] p-4 dark:border-white/10 dark:bg-white/5">
          <p className="text-sm leading-relaxed text-[#1a4d42]/75 dark:text-white/60">
            For Kenyan public schools — we&apos;ll fill in the Ministry of
            Education&apos;s official term names and dates for {moeYear}.
          </p>
          <button
            type="button"
            onClick={onApplyMoe}
            className="inline-flex w-full items-center justify-center gap-2 border border-[#246a59]/40 bg-white px-4 py-2.5 text-sm font-semibold text-[#246a59] transition-colors hover:bg-[#246a59]/[0.06] dark:bg-[#0a1f1a] sm:w-auto"
          >
            <Sparkles className="h-4 w-4" />
            Use official MoE dates
          </button>
        </div>
      )}

      {termMode === "custom" && (
        <div className="space-y-4 border border-[#1a4d42]/12 bg-[#f8fbfa] p-4 dark:border-white/10 dark:bg-white/5">
          <div className="grid gap-3 sm:grid-cols-3">
            <FieldGroup label="Term name">
              <Input
                placeholder="e.g. First Term"
                value={customTerm.name}
                onChange={(e) =>
                  onCustomTermChange({ ...customTerm, name: e.target.value })
                }
                className={onboardingInputClass}
              />
            </FieldGroup>
            <FieldGroup label="Starts">
              <DateField
                compact
                showHint={false}
                value={customTerm.startDate}
                onChange={(v) =>
                  onCustomTermChange({ ...customTerm, startDate: v })
                }
              />
            </FieldGroup>
            <FieldGroup label="Ends">
              <DateField
                compact
                showHint={false}
                value={customTerm.endDate}
                min={customTerm.startDate || undefined}
                onChange={(v) =>
                  onCustomTermChange({ ...customTerm, endDate: v })
                }
              />
            </FieldGroup>
          </div>
          <button
            type="button"
            onClick={onAddCustomTerm}
            className="inline-flex w-full items-center justify-center gap-2 border border-[#246a59]/40 bg-white px-4 py-2.5 text-sm font-semibold text-[#246a59] transition-colors hover:bg-[#246a59]/[0.06] dark:bg-[#0a1f1a] sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add this term
          </button>
        </div>
      )}

      {termDrafts.length > 0 ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/50 dark:text-white/40">
              {includedCount} term{includedCount === 1 ? "" : "s"} ready to save
            </p>
            <p className="text-xs text-[#1a4d42]/45 dark:text-white/35">
              Mark the term you&apos;re in right now
            </p>
          </div>
          <ul className="space-y-2">
            {termDrafts.map((term, i) => {
              const included = term.included !== false;
              const isActive = activeTerm === i;
              return (
                <li
                  key={`${term.name}-${i}`}
                  className={cn(
                    "border p-3 transition-colors",
                    included
                      ? "border-[#1a4d42]/15 bg-white dark:border-white/10 dark:bg-[#0c1a17]"
                      : "border-dashed border-[#1a4d42]/20 bg-[#f8fbfa] dark:bg-white/5",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`include-term-${i}`}
                      checked={included}
                      onCheckedChange={(checked) =>
                        updateDraft(i, "included", checked === true)
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <Label
                        htmlFor={`include-term-${i}`}
                        className={cn(
                          "cursor-pointer text-sm font-semibold",
                          included
                            ? "text-[#0a1f1a] dark:text-white"
                            : "text-[#1a4d42]/45 line-through",
                        )}
                      >
                        {term.name || "Unnamed term"}
                      </Label>
                      {included && (
                        <p className="mt-0.5 text-xs text-[#1a4d42]/50 dark:text-white/40">
                          {formatDisplayDate(term.startDate)} →{" "}
                          {formatDisplayDate(term.endDate)}
                        </p>
                      )}
                    </div>
                    {included && (
                      <button
                        type="button"
                        onClick={() => setActiveTerm(isActive ? -1 : i)}
                        title="Mark the term your school is currently in"
                        className={cn(
                          "shrink-0 border px-2.5 py-1.5 text-xs font-semibold transition-colors",
                          isActive
                            ? "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                            : "border-[#1a4d42]/15 bg-[#f3f7f5] text-[#1a4d42]/60 hover:border-emerald-300 hover:text-emerald-700 dark:border-white/15 dark:bg-white/5 dark:text-white/50",
                        )}
                      >
                        {isActive ? "Current term" : "Set as current"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        onTermDraftsChange(termDrafts.filter((_, j) => j !== i))
                      }
                      aria-label={`Remove ${term.name || "term"}`}
                      title="Remove this term"
                      className="flex h-8 w-8 shrink-0 items-center justify-center border border-transparent text-[#1a4d42]/40 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {included && (
                    <div className="mt-3 grid gap-3 pl-7 sm:grid-cols-2">
                      <FieldGroup label="Starts">
                        <DateField
                          compact
                          showHint={false}
                          value={term.startDate}
                          aria-label={`${term.name} start date`}
                          onChange={(v) => updateDraft(i, "startDate", v)}
                        />
                      </FieldGroup>
                      <FieldGroup label="Ends">
                        <DateField
                          compact
                          showHint={false}
                          value={term.endDate}
                          min={term.startDate || undefined}
                          aria-label={`${term.name} end date`}
                          onChange={(v) => updateDraft(i, "endDate", v)}
                        />
                      </FieldGroup>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="border border-dashed border-[#1a4d42]/20 bg-[#f8fbfa] p-6 text-center dark:border-white/10 dark:bg-white/5">
          <p className="text-sm text-[#1a4d42]/60 dark:text-white/50">
            No terms yet — pick an option above and we&apos;ll add them here.
          </p>
        </div>
      )}
    </div>
  );
}

export type StreamDraft = { id: string; name: string; capacity: string };

export type GradeStreamPlans = Record<string, StreamDraft[]>;

type GradeRow = {
  gradeId: string;
  gradeName: string;
  levelName: string;
  existingStreams: string[];
};

type StreamsStepProps = {
  gradeRows: GradeRow[];
  gradeStreamPlans: GradeStreamPlans;
  onGradeStreamPlansChange: (plans: GradeStreamPlans) => void;
};

const LETTER_PRESETS = ["A", "B", "C", "D"] as const;
const BULK_PRESETS: { label: string; names: string[]; hint: string }[] = [
  { label: "One class", names: ["A"], hint: "Good for small schools" },
  { label: "Two classes", names: ["A", "B"], hint: "Most schools pick this" },
  { label: "Three classes", names: ["A", "B", "C"], hint: "Larger intakes, split three ways" },
];

function newStreamDraft(name = "", capacity = "30"): StreamDraft {
  return {
    id: `stream-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    capacity,
  };
}

function nextLetterName(used: Set<string>): string {
  for (const letter of LETTER_PRESETS) {
    if (!used.has(letter.toLowerCase())) return letter;
  }
  let n = 1;
  while (used.has(`stream ${n}`)) n++;
  return `Stream ${n}`;
}

export function countPlannedStreamCreates(
  gradeRows: GradeRow[],
  plans: GradeStreamPlans,
): number {
  let total = 0;
  for (const grade of gradeRows) {
    for (const draft of plans[grade.gradeId] || []) {
      const name = draft.name.trim();
      if (!name) continue;
      if (
        grade.existingStreams.some(
          (s) => s.toLowerCase() === name.toLowerCase(),
        )
      )
        continue;
      total++;
    }
  }
  return total;
}

function gradePendingNames(
  grade: GradeRow,
  drafts: StreamDraft[],
): string[] {
  return drafts
    .map((d) => d.name.trim())
    .filter(
      (name) =>
        name &&
        !grade.existingStreams.some(
          (s) => s.toLowerCase() === name.toLowerCase(),
        ),
    );
}

export function StreamsStepContent({
  gradeRows,
  gradeStreamPlans,
  onGradeStreamPlansChange,
}: StreamsStepProps) {
  if (gradeRows.length === 0) {
    return (
      <p className="text-sm text-[#1a4d42]/70 border border-[#1a4d42]/12 bg-[#f3f7f5] dark:bg-white/5 dark:text-white/60 p-4">
        No grades found from your curriculum setup. Finish setup first or add
        levels on the Classes page.
      </p>
    );
  }

  const plannedCreates = countPlannedStreamCreates(gradeRows, gradeStreamPlans);
  const gradesWithPlans = gradeRows.filter(
    (g) => gradePendingNames(g, gradeStreamPlans[g.gradeId] || []).length > 0,
  ).length;

  const setGradePlans = (gradeId: string, drafts: StreamDraft[]) => {
    onGradeStreamPlansChange({ ...gradeStreamPlans, [gradeId]: drafts });
  };

  const applyBulkToAll = (names: string[]) => {
    const next: GradeStreamPlans = { ...gradeStreamPlans };
    for (const g of gradeRows) {
      const existing = new Set(g.existingStreams.map((s) => s.toLowerCase()));
      next[g.gradeId] = names
        .filter((n) => !existing.has(n.toLowerCase()))
        .map((n) => newStreamDraft(n, "30"));
    }
    onGradeStreamPlansChange(next);
  };

  const addStreamToGrade = (gradeId: string, grade: GradeRow) => {
    const current = gradeStreamPlans[gradeId] || [];
    const used = new Set([
      ...grade.existingStreams.map((s) => s.toLowerCase()),
      ...current.map((d) => d.name.trim().toLowerCase()).filter(Boolean),
    ]);
    setGradePlans(gradeId, [
      ...current,
      newStreamDraft(nextLetterName(used), "30"),
    ]);
  };

  const updateGradeDraft = (
    gradeId: string,
    draftId: string,
    field: "name" | "capacity",
    value: string,
  ) => {
    const current = gradeStreamPlans[gradeId] || [];
    setGradePlans(
      gradeId,
      current.map((d) => (d.id === draftId ? { ...d, [field]: value } : d)),
    );
  };

  const removeGradeDraft = (gradeId: string, draftId: string) => {
    const current = gradeStreamPlans[gradeId] || [];
    setGradePlans(
      gradeId,
      current.filter((d) => d.id !== draftId),
    );
  };

  const sampleGrade = gradeRows[0]?.gradeName ?? "Grade 4";

  return (
    <div className="space-y-4">
      {/* What is a stream? */}
      <div className="border border-[#1a4d42]/12 bg-[#f8fbfa] dark:bg-white/[0.03] dark:border-white/10 p-3 sm:p-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#246a59] mb-2">
          What&apos;s a stream?
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm text-[#0a1f1a] dark:text-white">
          <span className="font-medium">{sampleGrade}</span>
          <span className="text-[#1a4d42]/35" aria-hidden>
            →
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="border border-[#246a59]/30 bg-[#246a59]/10 px-2 py-0.5 text-xs font-semibold text-[#246a59]">
              {sampleGrade}A
            </span>
            <span className="border border-[#246a59]/30 bg-[#246a59]/10 px-2 py-0.5 text-xs font-semibold text-[#246a59]">
              {sampleGrade}B
            </span>
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#1a4d42]/60 dark:text-white/45">
          A stream is a class section students join — like 4A or 4B. Most schools
          keep one to three per grade. We&apos;ll set the same pattern for every
          grade, and you can adjust any grade below.
        </p>
      </div>

      {/* Bulk apply */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45 mb-2">
          Quick start — all {gradeRows.length} grades
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {BULK_PRESETS.map((preset) => {
            const active =
              gradeRows.length > 0 &&
              gradeRows.every((g) => {
                const pending = gradePendingNames(
                  g,
                  gradeStreamPlans[g.gradeId] || [],
                );
                return (
                  pending.length === preset.names.length &&
                  preset.names.every((n) =>
                    pending.some((p) => p.toLowerCase() === n.toLowerCase()),
                  )
                );
              });
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyBulkToAll(preset.names)}
                title={preset.hint}
                className={`border px-2 py-2.5 text-center transition-colors ${
                  active
                    ? "border-[#246a59] bg-[#246a59] text-white"
                    : "border-[#1a4d42]/12 bg-white hover:border-[#246a59]/40 dark:bg-[#0c1a17] dark:border-white/10"
                }`}
              >
                <span className="block text-xs font-semibold">{preset.label}</span>
                <span
                  className={`block text-[10px] mt-0.5 tabular-nums font-medium ${
                    active ? "text-white/80" : "text-[#246a59]/75"
                  }`}
                >
                  {preset.names.join(" · ")}
                </span>
                <span
                  className={`hidden sm:block text-[10px] mt-0.5 leading-snug ${
                    active ? "text-white/60" : "text-[#1a4d42]/45"
                  }`}
                >
                  {preset.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact grade roster */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
            Per grade
          </p>
          <p className="text-[10px] text-[#1a4d42]/40">
            Seats = max learners · edit anytime
          </p>
        </div>

        <ul className="border border-[#1a4d42]/12 dark:border-white/10 divide-y divide-[#1a4d42]/10 max-h-[min(22rem,50vh)] overflow-y-auto">
          {gradeRows.map((grade) => {
            const drafts = gradeStreamPlans[grade.gradeId] || [];
            const pending = gradePendingNames(grade, drafts);

            return (
              <li
                key={grade.gradeId}
                className="bg-white dark:bg-[#0c1a17] px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="min-w-0 flex items-baseline gap-2">
                    <p className="text-sm font-semibold text-[#0a1f1a] dark:text-white truncate">
                      {grade.gradeName}
                    </p>
                    <p className="text-[10px] text-[#1a4d42]/45 truncate hidden sm:block">
                      {grade.levelName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {grade.existingStreams.length > 0 && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5">
                        has {grade.existingStreams.join(", ")}
                      </span>
                    )}
                    {pending.length > 0 && (
                      <span className="text-[10px] font-semibold tabular-nums text-[#246a59] bg-[#246a59]/10 px-1.5 py-0.5">
                        +{pending.length} new
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {drafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="inline-flex items-center border border-[#246a59]/25 bg-[#f3f7f5] transition-all duration-150 hover:border-[#246a59]/45 hover:shadow-sm dark:bg-[#071411] dark:border-[#246a59]/35"
                    >
                      <span className="pl-2 pr-1 text-[10px] font-semibold uppercase tracking-wide text-[#246a59]/70">
                        Stream
                      </span>
                      <Input
                        value={draft.name}
                        onChange={(e) =>
                          updateGradeDraft(
                            grade.gradeId,
                            draft.id,
                            "name",
                            e.target.value,
                          )
                        }
                        aria-label={`${grade.gradeName} stream name`}
                        className="h-8 w-10 rounded-none border-0 bg-transparent px-0 text-center text-sm font-bold text-[#0a1f1a] shadow-none focus-visible:ring-0 focus:bg-[#246a59]/[0.06] dark:text-white"
                        placeholder="?"
                      />
                      <span className="h-5 w-px bg-[#1a4d42]/15" aria-hidden />
                      <span
                        className="pl-1.5 pr-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#1a4d42]/45"
                        title="Max learners per stream"
                      >
                        Seats
                      </span>
                      <Input
                        type="number"
                        min={1}
                        value={draft.capacity}
                        onChange={(e) =>
                          updateGradeDraft(
                            grade.gradeId,
                            draft.id,
                            "capacity",
                            e.target.value,
                          )
                        }
                        aria-label={`${grade.gradeName} ${draft.name || "stream"} seats (max learners)`}
                        className="h-8 w-11 rounded-none border-0 bg-transparent px-1 text-center text-xs tabular-nums text-[#1a4d42]/70 shadow-none focus-visible:ring-0 focus:bg-[#246a59]/[0.06]"
                        title="Seats (max learners)"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          removeGradeDraft(grade.gradeId, draft.id)
                        }
                        className="mr-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-transparent text-[#1a4d42]/35 transition-all duration-150 hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
                        aria-label={`Remove stream ${draft.name || ""} from ${grade.gradeName}`}
                        title="Remove stream"
                      >
                        <X className="h-3 w-3" strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addStreamToGrade(grade.gradeId, grade)}
                    className="inline-flex h-8 items-center gap-1 border border-dashed border-[#1a4d42]/25 px-2 text-[11px] font-medium text-[#1a4d42]/55 transition-colors hover:border-[#246a59]/50 hover:bg-[#246a59]/[0.04] hover:text-[#246a59]"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Creation ticket */}
      <div
        className={`border px-3 py-2.5 ${
          plannedCreates > 0
            ? "border-[#0a1f1a] bg-[#0a1f1a] text-white"
            : "border-[#1a4d42]/12 bg-[#f3f7f5] dark:bg-white/[0.03]"
        }`}
      >
        {plannedCreates > 0 ? (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300/90">
                Creating on Continue
              </p>
              <p className="mt-1 text-sm font-medium leading-snug">
                <span className="tabular-nums">{plannedCreates}</span> stream
                {plannedCreates === 1 ? "" : "s"} across{" "}
                <span className="tabular-nums">{gradesWithPlans}</span> grade
                {gradesWithPlans === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-[11px] text-white/55 truncate">
                {gradeRows
                  .map((g) => {
                    const names = gradePendingNames(
                      g,
                      gradeStreamPlans[g.gradeId] || [],
                    );
                    if (names.length === 0) return null;
                    return `${g.gradeName} ${names.join("/")}`;
                  })
                  .filter(Boolean)
                  .slice(0, 6)
                  .join(" · ")}
                {gradesWithPlans > 6 ? "…" : ""}
              </p>
            </div>
            <span className="shrink-0 font-display text-2xl tabular-nums text-emerald-300">
              {String(plannedCreates).padStart(2, "0")}
            </span>
          </div>
        ) : (
          <p className="text-sm text-[#1a4d42]/65 dark:text-white/50 leading-snug">
            Pick a quick start above to create streams, or continue and add them
            later from Classes.
          </p>
        )}
      </div>
    </div>
  );
}

type PaymentsStepContentProps = {
  subdomain: string
  onConfigureMpesa: () => void
  onConfigureBank: () => void
}

export function PaymentsStepContent({
  subdomain,
  onConfigureMpesa,
  onConfigureBank,
}: PaymentsStepContentProps) {
  const { destination, custodyLine, loading: mpesaLoading } = useMpesaCustody()
  const { details, loading: bankLoading } =
    useTenantFeeLetterSettings(subdomain)

  const banksReady = details.paymentModes.bankAccounts.some(
    (b) => b.bankName.trim() && b.accountNumber.trim(),
  )
  const tillReady = Boolean(
    destination?.tillNumber || destination?.businessNumber,
  )

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[#1a4d42]/70 dark:text-white/55">
        Configure M-Pesa Express (till) and at least one bank paybill. Skip if
        you want to finish this from the dashboard later.
      </p>

      <div className="space-y-3">
        <PaymentSetupCard
          icon={Smartphone}
          title="M-Pesa Express"
          description="Buy Goods till or HO paybill — parents get a PIN prompt; money lands on your till."
          ready={tillReady}
          loading={mpesaLoading}
          readyLabel={custodyLine ?? 'Till saved'}
          waitingLabel="Till not set yet"
          actionLabel={tillReady ? 'Edit till' : 'Set till / paybill'}
          onAction={onConfigureMpesa}
        />
        <PaymentSetupCard
          icon={Landmark}
          title="Bank accounts"
          description="Pick a bank — we fill the Lipa Na M-Pesa business number. You add the account number."
          ready={banksReady}
          loading={bankLoading}
          readyLabel={`${details.paymentModes.bankAccounts.filter((b) => b.bankName.trim()).length} bank(s) saved`}
          waitingLabel="No bank details yet"
          actionLabel={banksReady ? 'Edit banks' : 'Add bank account'}
          onAction={onConfigureBank}
        />
      </div>

      <p className="text-xs leading-relaxed text-[#1a4d42]/55 dark:text-white/45">
        Tip: till setup only works after SQUL ops turn on the platform custody
        rail. Bank details always save and print on fee letters.
      </p>
    </div>
  )
}

function PaymentSetupCard({
  icon: Icon,
  title,
  description,
  ready,
  loading,
  readyLabel,
  waitingLabel,
  actionLabel,
  onAction,
}: {
  icon: typeof Smartphone
  title: string
  description: string
  ready: boolean
  loading: boolean
  readyLabel: string
  waitingLabel: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <div
      className={cn(
        'border bg-[#f8fbfa] p-4 dark:bg-white/[0.03]',
        ready
          ? 'border-emerald-600/30 shadow-[3px_3px_0_0_rgba(5,150,105,0.12)]'
          : 'border-[#1a4d42]/12 dark:border-white/10',
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#246a59] bg-[#0a1f1a] text-emerald-300">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[#0a1f1a] dark:text-white">
              {title}
            </p>
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1a4d42]/40" />
            ) : ready ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Ready
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[#1a4d42]/60 dark:text-white/50">
            {description}
          </p>
          <p className="mt-2 truncate text-[11px] font-medium text-[#1a4d42]/70 dark:text-white/55">
            {loading ? 'Checking…' : ready ? readyLabel : waitingLabel}
          </p>
        </div>
      </div>
      <Button
        type="button"
        className="mt-3 h-9 w-full rounded-none bg-[#0a1f1a] text-white hover:bg-[#246a59]"
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </div>
  )
}
