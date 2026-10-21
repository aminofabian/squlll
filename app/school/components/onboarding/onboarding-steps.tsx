"use client";

import { useMemo, useState, useEffect } from "react";
import {
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  Landmark,
  Loader2,
  Plus,
  School,
  Smartphone,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
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
    <div className="flex items-start gap-4 rounded-xl border border-[#1c3d32]/15 bg-[#1c3d32]/[0.045] p-4 sm:p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1c3d32] text-[#f7f4ec]">
        <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#14201b]">{label}</p>
        <p className="mt-1 text-sm leading-relaxed text-[#4d574f]">{detail}</p>
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

  if (hasAcademicYear && activeYearLabel && activeYearRange) {
    return (
      <>
        <StepIntro
          icon={CalendarRange}
          title="Academic year"
          description="Your school calendar is ready for terms and classes."
        />
        <StepBody className="space-y-5">
          <DoneBanner
            label={`${activeYearLabel} is ready`}
            detail={activeYearRange}
          />
          <p className="text-sm leading-relaxed text-[#4d574f]">
            Terms and classes will follow this calendar. You can edit the
            academic year later in <strong className="font-medium text-[#14201b]">Dashboard → School years</strong>.
          </p>
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
        description="Pick the calendar your school runs on. You can fine-tune every date."
      />
      <StepBody className="space-y-7">
        <section>
          <p className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#4d574f]">
            Start with a template
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
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
              subtitle="Official ministry term calendar"
            />
          </div>
        </section>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <div className="w-full border-t border-[#14201b]/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#fffdf7] px-3 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[#7c857d]">
              or set your own dates
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
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#1c3d32]/15 bg-[#1c3d32]/[0.045] px-4 py-3.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#14201b]">
                {form.name || "Untitled year"}
              </p>
              <p className="mt-0.5 text-xs text-[#4d574f]">{preview.range}</p>
            </div>
            <span className="shrink-0 rounded-full border border-[#1c3d32]/20 bg-white/70 px-2.5 py-1 text-[0.6875rem] font-semibold tabular-nums text-[#1c3d32]">
              {preview.days} days
            </span>
          </div>
        )}

        <p className="text-xs leading-relaxed text-[#7c857d]">
          {preview ? (
            <>
              Press{" "}
              <strong className="font-medium text-[#4d574f]">
                Create academic year
              </strong>{" "}
              below to save this calendar.
            </>
          ) : (
            "Add a name, start date, and end date to continue."
          )}
        </p>
      </StepBody>
    </>
  );
}

type TermsStepProps = {
  hasAcademicYear: boolean;
  hasTerms: boolean;
  academicYearName?: string;
  existingTermNames?: string;
  /** Drafts that still need saving (names already stored are filtered out). */
  pendingTermCount?: number;
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
  pendingTermCount,
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
      <p className="text-sm text-[#1c3d32]/70 border border-[#1c3d32]/12 bg-[#efeadd] dark:bg-white/5 dark:text-white/60 p-4">
        Go back and create an academic year first.
      </p>
    );
  }

  const shownPendingCount =
    pendingTermCount ??
    termDrafts.filter((t) => t.included !== false).length;

  // Fully configured year: nothing left to save. If some drafts still need
  // saving (e.g. a previous run saved Term 1 only), keep the form visible so
  // they can be completed instead of being silently dropped.
  if (hasTerms && existingTermNames && shownPendingCount === 0) {
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
      {hasTerms && existingTermNames ? (
        <DoneBanner
          label="Terms already saved"
          detail={`${existingTermNames} — ${shownPendingCount} more still to add`}
        />
      ) : null}
      <p className="text-sm leading-relaxed text-[#4d574f]">
        A school year is usually split into teaching terms. Choose how you&apos;d
        like to set up{" "}
        <strong className="font-semibold text-[#14201b]">
          {academicYearName}
        </strong>{" "}
        — you can fine-tune every date afterwards.
      </p>

      {!hasTerms ? (
        <>
      {/* How do you want to set up your terms? */}
      <div className="grid gap-2.5 sm:grid-cols-3">
        <PresetOption
          selected={termMode === "suggested"}
          onClick={() => {
            onTermModeChange("suggested");
            onApplySuggested();
          }}
          icon={Sparkles}
          title="Split it evenly"
          subtitle="Terms spread across the year"
        />
        <PresetOption
          selected={termMode === "moe"}
          onClick={() => {
            onTermModeChange("moe");
            onApplyMoe();
          }}
          icon={CalendarRange}
          title={`MoE ${moeYear}`}
          subtitle="Official ministry dates"
        />
        <PresetOption
          selected={termMode === "custom"}
          onClick={() => onTermModeChange("custom")}
          icon={Plus}
          title="My own dates"
          subtitle="Type each term yourself"
        />
      </div>

      {termMode === "suggested" && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#1c3d32]/12 bg-[#f7f4ec]/80 px-4 py-3.5">
          <div>
            <p className="text-sm font-semibold text-[#14201b]">
              How many teaching terms?
            </p>
            <p className="mt-0.5 text-xs text-[#4d574f]">
              Most Kenyan schools use three.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-[#14201b]/10 bg-white/80 p-1">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onSuggestedTermCountChange(n)}
                aria-pressed={suggestedTermCount === n}
                className={cn(
                  "flex h-11 w-12 items-center justify-center rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c3d32]/25",
                  suggestedTermCount === n
                    ? "bg-[#14201b] text-white"
                    : "text-[#4d574f] hover:bg-[#14201b]/[0.05] hover:text-[#14201b]",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {termMode === "moe" && (
        <div className="rounded-xl border border-[#1c3d32]/12 bg-[#f7f4ec]/80 px-4 py-3.5">
          <p className="text-sm leading-relaxed text-[#4d574f]">
            We loaded the Ministry of Education&apos;s official term names and
            dates for {moeYear}. Tweak any date below.
          </p>
        </div>
      )}

      {termMode === "custom" && (
        <div className="rounded-xl border border-[#1c3d32]/12 bg-[#f7f4ec]/80 p-4">
          <p className="mb-3 text-sm font-semibold text-[#14201b]">
            Add a term
          </p>
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
            className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#1c3d32]/25 bg-white/80 px-4 text-sm font-semibold text-[#1c3d32] transition-colors hover:border-[#1c3d32]/45 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c3d32]/25"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add this term
          </button>
        </div>
      )}
        </>
      ) : null}

      {termDrafts.length > 0 ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#4d574f]">
              {includedCount} term{includedCount === 1 ? "" : "s"} ready
            </p>
            <p className="text-xs text-[#7c857d]">
              Mark the term your school is in right now
            </p>
          </div>
          <ul className="space-y-2.5">
            {termDrafts.map((term, i) => {
              const included = term.included !== false;
              const isActive = activeTerm === i;
              return (
                <li
                  key={`${term.name}-${i}`}
                  className={cn(
                    "rounded-xl border transition-colors",
                    included
                      ? "border-[#14201b]/10 bg-white/85"
                      : "border-dashed border-[#14201b]/15 bg-[#f7f4ec]/70",
                  )}
                >
                  <div className="flex items-start gap-3 p-4">
                    <Checkbox
                      id={`include-term-${i}`}
                      checked={included}
                      onCheckedChange={(checked) =>
                        updateDraft(i, "included", checked === true)
                      }
                      className="mt-0.5 h-5 w-5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <Label
                          htmlFor={`include-term-${i}`}
                          className={cn(
                            "cursor-pointer text-[0.9375rem] font-semibold",
                            included
                              ? "text-[#14201b]"
                              : "text-[#7c857d] line-through",
                          )}
                        >
                          {term.name || "Unnamed term"}
                        </Label>
                        {included && (
                          <p className="text-xs text-[#7c857d]">
                            {formatDisplayDate(term.startDate)} →{" "}
                            {formatDisplayDate(term.endDate)}
                          </p>
                        )}
                      </div>
                    </div>
                    {included && (
                      <button
                        type="button"
                        onClick={() => setActiveTerm(isActive ? -1 : i)}
                        title="Mark the term your school is currently in"
                        aria-pressed={isActive}
                        className={cn(
                          "inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full border px-3 text-[0.6875rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c3d32]/25",
                          isActive
                            ? "border-[#1c3d32] bg-[#1c3d32] text-white"
                            : "border-[#1c3d32]/20 bg-white/70 text-[#4d574f] hover:border-[#1c3d32]/40 hover:text-[#14201b]",
                        )}
                      >
                        {isActive ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" aria-hidden />
                            Current
                          </>
                        ) : (
                          "Set current"
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        onTermDraftsChange(termDrafts.filter((_, j) => j !== i))
                      }
                      aria-label={`Remove ${term.name || "term"}`}
                      title="Remove this term"
                      className="-mr-1 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#1c3d32]/35 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  {included && (
                    <div className="grid gap-3 px-4 pb-4 pl-12 sm:grid-cols-2">
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
        <div className="rounded-xl border border-dashed border-[#14201b]/15 bg-[#f7f4ec]/70 px-6 py-8 text-center">
          <p className="text-sm font-medium text-[#14201b]">No terms yet</p>
          <p className="mt-1 text-xs text-[#7c857d]">
            Pick an option above and we&apos;ll add them here.
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
      <p className="text-sm text-[#1c3d32]/70 border border-[#1c3d32]/12 bg-[#efeadd] dark:bg-white/5 dark:text-white/60 p-4">
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
    <div className="space-y-5">
      {/* What is a stream? */}
      <div className="rounded-xl border border-[#1c3d32]/12 bg-[#f7f4ec]/80 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[#14201b]">
            {sampleGrade}
          </span>
          <span className="text-[#7c857d]" aria-hidden>
            →
          </span>
          <span className="rounded-full border border-[#1c3d32]/20 bg-[#1c3d32]/[0.07] px-2.5 py-1 text-xs font-semibold text-[#1c3d32]">
            {sampleGrade}A
          </span>
          <span className="rounded-full border border-[#1c3d32]/20 bg-[#1c3d32]/[0.07] px-2.5 py-1 text-xs font-semibold text-[#1c3d32]">
            {sampleGrade}B
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#4d574f]">
          A stream is a class section students join — like 4A or 4B. Most schools
          keep one to three per grade. Pick a pattern for every grade, then
          adjust any grade below.
        </p>
      </div>

      {/* Bulk apply */}
      <div>
        <div className="mb-2.5 flex items-baseline justify-between gap-2">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#4d574f]">
            Quick start · all {gradeRows.length} grades
          </p>
          <p className="text-xs text-[#7c857d]">Tap to apply</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
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
                aria-pressed={active}
                className={cn(
                  "flex min-h-[5.5rem] flex-col items-start justify-between rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c3d32]/25",
                  active
                    ? "border-[#1c3d32] bg-[#1c3d32] text-white"
                    : "border-[#14201b]/12 bg-white/70 hover:border-[#14201b]/25 hover:bg-white",
                )}
              >
                <span className="flex w-full items-start justify-between gap-2">
                  <span className="text-xs font-semibold leading-tight">
                    {preset.label}
                  </span>
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                      active
                        ? "border-white/60 bg-white text-[#1c3d32]"
                        : "border-[#14201b]/20",
                    )}
                    aria-hidden
                  >
                    {active ? <CheckCircle2 className="h-2.5 w-2.5" /> : null}
                  </span>
                </span>
                <span
                  className={cn(
                    "mt-2 block text-[0.625rem] font-medium tabular-nums",
                    active ? "text-white/75" : "text-[#7c857d]",
                  )}
                >
                  {preset.names.join(" · ")}
                </span>
                <span
                  className={cn(
                    "mt-0.5 hidden text-[0.625rem] leading-snug sm:block",
                    active ? "text-white/50" : "text-[#7c857d]/80",
                  )}
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
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#4d574f]">
            Per grade
          </p>
          <p className="text-xs text-[#7c857d]">Seats = max learners</p>
        </div>

        <ul className="max-h-[min(22rem,46vh)] space-y-2 overflow-y-auto pr-1">
          {gradeRows.map((grade) => {
            const drafts = gradeStreamPlans[grade.gradeId] || [];
            const pending = gradePendingNames(grade, drafts);

            return (
              <li
                key={grade.gradeId}
                className="rounded-xl border border-[#14201b]/10 bg-white/80 p-3.5"
              >
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#14201b]">
                      {grade.gradeName}
                    </p>
                    <p className="truncate text-[0.625rem] uppercase tracking-[0.08em] text-[#7c857d]">
                      {grade.levelName}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {grade.existingStreams.length > 0 && (
                      <span className="rounded-full bg-[#efeadd] px-2 py-0.5 text-[0.625rem] font-medium text-[#4d574f]">
                        Has {grade.existingStreams.join(", ")}
                      </span>
                    )}
                    {pending.length > 0 && (
                      <span className="rounded-full bg-[#1c3d32]/10 px-2 py-0.5 text-[0.625rem] font-semibold tabular-nums text-[#1c3d32]">
                        +{pending.length}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {drafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="inline-flex items-center rounded-lg border border-[#1c3d32]/20 bg-[#f7f4ec] transition-colors hover:border-[#1c3d32]/35"
                    >
                      <span className="pl-2.5 pr-1 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-[#7c857d]">
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
                        className="h-10 w-12 rounded-lg border-0 bg-transparent px-0 text-center text-sm font-bold text-[#14201b] shadow-none focus-visible:bg-[#1c3d32]/[0.06] focus-visible:ring-0"
                        placeholder="?"
                      />
                      <span className="h-6 w-px bg-[#14201b]/10" aria-hidden />
                      <span
                        className="px-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-[#7c857d]"
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
                        className="h-10 w-14 rounded-lg border-0 bg-transparent px-1 text-center text-xs tabular-nums text-[#4d574f] shadow-none focus-visible:bg-[#1c3d32]/[0.06] focus-visible:ring-0"
                        title="Seats (max learners)"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          removeGradeDraft(grade.gradeId, draft.id)
                        }
                        className="mr-1 flex h-10 w-10 items-center justify-center rounded-full text-[#1c3d32]/35 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                        aria-label={`Remove stream ${draft.name || ""} from ${grade.gradeName}`}
                        title="Remove stream"
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addStreamToGrade(grade.gradeId, grade)}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-dashed border-[#1c3d32]/25 px-3 text-xs font-semibold text-[#1c3d32]/70 transition-colors hover:border-[#1c3d32]/50 hover:bg-[#1c3d32]/[0.04] hover:text-[#1c3d32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c3d32]/20"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                    Add stream
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Summary — informational, not an action */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#1c3d32]/12 bg-[#efeadd]/60 px-4 py-3.5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#14201b]">
            {plannedCreates > 0
              ? `${plannedCreates} stream${plannedCreates === 1 ? "" : "s"} will be created`
              : "No new streams planned"}
          </p>
          <p className="mt-0.5 truncate text-xs text-[#4d574f]">
            {plannedCreates > 0
              ? `${gradesWithPlans} grade${gradesWithPlans === 1 ? "" : "s"} · you can rename or remove them later`
              : "Continue and add them later from Classes."}
          </p>
        </div>
        <span className="shrink-0 font-display text-xl tabular-nums text-[#1c3d32]">
          {String(plannedCreates).padStart(2, "0")}
        </span>
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
      <p className="text-sm leading-relaxed text-[#4d574f]">
        Add how parents pay. You can finish this later from the dashboard — it
        never blocks day-to-day use.
      </p>

      <div className="space-y-2.5">
        <PaymentSetupCard
          icon={Smartphone}
          title="M-Pesa Express"
          description="Buy Goods till or HO paybill — parents get a PIN prompt; money lands on your till."
          ready={tillReady}
          loading={mpesaLoading}
          readyLabel={custodyLine ?? "Till saved"}
          waitingLabel="Till not set yet"
          actionLabel={tillReady ? "Edit" : "Set up"}
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
          actionLabel={banksReady ? "Edit" : "Add"}
          onAction={onConfigureBank}
        />
      </div>

      <div className="rounded-xl border border-[#1c3d32]/12 bg-[#efeadd]/60 px-4 py-3">
        <p className="text-xs leading-relaxed text-[#4d574f]">
          <strong className="font-semibold text-[#14201b]">Tip:</strong> till
          setup only works after SQUL ops turn on the platform custody rail.
          Bank details always save and print on fee letters.
        </p>
      </div>
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
    <button
      type="button"
      onClick={onAction}
      className="group flex w-full items-start gap-4 rounded-xl border border-[#14201b]/10 bg-white/80 p-4 text-left transition-colors hover:border-[#1c3d32]/25 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c3d32]/20"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#1c3d32]/12 bg-[#1c3d32]/[0.05] text-[#1c3d32]">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[#14201b]">{title}</span>
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin text-[#7c857d]" />
          ) : ready ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#1c3d32]/10 px-2 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-[#1c3d32]">
              <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={2.25} />
              Ready
            </span>
          ) : (
            <span className="rounded-full bg-[#efeadd] px-2 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-[#7c857d]">
              Not set
            </span>
          )}
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-[#4d574f]">
          {description}
        </span>
        <span className="mt-2 block text-[0.6875rem] font-medium text-[#1c3d32]">
          {loading ? "Checking…" : ready ? readyLabel : waitingLabel}
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-1 self-center text-[0.75rem] font-semibold text-[#1c3d32]">
        {actionLabel}
        <ChevronRight
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </button>
  )
}
