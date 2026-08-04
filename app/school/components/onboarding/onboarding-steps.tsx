"use client";

import { useMemo, useState, useEffect } from "react";
import {
  CalendarRange,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  School,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import type { TermDraft } from "@/lib/utils/school-calendar-presets";
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
  isCreating: boolean;
  onCreateDrafts: () => void;
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
  isCreating,
  onCreateDrafts,
  onAddCustomTerm,
}: TermsStepProps) {
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

  const [activeTerm, setActiveTerm] = useState<number>(0);

  // Sync activeTerm to termDrafts so the wizard picks up the correct isActive
  useEffect(() => {
    const next = termDrafts.map((t, i) => ({
      ...t,
      active: i === activeTerm,
    }));
    onTermDraftsChange(next);
  }, [activeTerm]);

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

  const modeOptions = [
    { id: "suggested" as const, label: "Auto-split" },
    { id: "moe" as const, label: `MoE ${moeYear}` },
    { id: "custom" as const, label: "Add manually" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Divide{" "}
        <strong className="text-slate-800 dark:text-slate-200">
          {academicYearName}
        </strong>{" "}
        into teaching periods. Pick a template, edit the list, then save.
      </p>

      <div className="flex p-1 bg-[#eef3f1] dark:bg-white/5 gap-1 border border-[#1a4d42]/10">
        {modeOptions.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onTermModeChange(id)}
            className={`flex-1 text-xs sm:text-sm font-medium py-2.5 px-2 transition-all ${
              termMode === id
                ? "bg-[#0a1f1a] text-white dark:bg-emerald-400 dark:text-[#0a1f1a]"
                : "text-[#1a4d42]/55 hover:text-[#0a1f1a] dark:text-white/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {termMode === "suggested" && (
        <Card className="rounded-none shadow-none">
          <CardContent className="pt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Label className="text-sm">Number of terms</Label>
              {[2, 3, 4].map((n) => (
                <Button
                  key={n}
                  type="button"
                  size="sm"
                  variant={suggestedTermCount === n ? "secondary" : "ghost"}
                  className="rounded-none"
                  onClick={() => onSuggestedTermCountChange(n)}
                >
                  {n}
                </Button>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-none"
                onClick={onApplySuggested}
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Generate dates
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              We&apos;ll spread dates evenly across your academic year. You can
              edit each row below.
            </p>
          </CardContent>
        </Card>
      )}

      {termMode === "moe" && (
        <Card className="border-dashed rounded-none shadow-none">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Optional shortcut for Kenyan public schools — official {moeYear}{" "}
              term dates from the Ministry of Education.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-none"
              onClick={onApplyMoe}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Load MoE term dates
            </Button>
          </CardContent>
        </Card>
      )}

      {termMode === "custom" && (
        <Card className="rounded-none shadow-none">
          <CardContent className="pt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input
                  placeholder="Term 1"
                  value={customTerm.name}
                  onChange={(e) =>
                    onCustomTermChange({ ...customTerm, name: e.target.value })
                  }
                  className="rounded-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Start</Label>
                <DateField
                  compact
                  showHint={false}
                  value={customTerm.startDate}
                  onChange={(v) =>
                    onCustomTermChange({ ...customTerm, startDate: v })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End</Label>
                <DateField
                  compact
                  showHint={false}
                  value={customTerm.endDate}
                  min={customTerm.startDate || undefined}
                  onChange={(v) =>
                    onCustomTermChange({ ...customTerm, endDate: v })
                  }
                />
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="rounded-none"
              onClick={onAddCustomTerm}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add to list
            </Button>
          </CardContent>
        </Card>
      )}

      {termDrafts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Terms to create ({termDrafts.filter((t) => t.included).length})
            </Label>
          </div>
          <ul className="border border-[#1a4d42]/15 dark:border-white/10 divide-y divide-[#1a4d42]/10">
            {termDrafts.map((term, i) => (
              <li
                key={`${term.name}-${i}`}
                className="p-3 bg-white dark:bg-[#0c1a17]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Checkbox
                    id={`include-term-${i}`}
                    checked={term.included ?? true}
                    onCheckedChange={(checked) => {
                      updateDraft(i, "included", checked === true);
                    }}
                  />
                  <Label
                    htmlFor={`include-term-${i}`}
                    className="flex-1 text-sm font-medium text-[#0a1f1a] dark:text-white cursor-pointer"
                  >
                    {term.name || "Unnamed term"}
                  </Label>
                  {term.included !== false && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTerm(activeTerm === i ? -1 : i);
                      }}
                      className={`text-xs font-medium px-2.5 py-1 border transition-colors ${
                        activeTerm === i
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-[#f3f7f5] text-[#1a4d42]/55 border-[#1a4d42]/12 hover:border-emerald-300 hover:text-emerald-700"
                      }`}
                    >
                      {activeTerm === i ? "Active term" : "Set as active"}
                    </button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-none"
                    onClick={() =>
                      onTermDraftsChange(termDrafts.filter((_, j) => j !== i))
                    }
                    aria-label="Remove term"
                  >
                    <Trash2 className="h-4 w-4 text-[#1a4d42]/40" />
                  </Button>
                </div>
                <div className="ml-8 grid gap-2 sm:grid-cols-2">
                  <DateField
                    compact
                    showHint={false}
                    value={term.startDate}
                    disabled={term.included === false}
                    aria-label={`${term.name} start date`}
                    onChange={(v) => updateDraft(i, "startDate", v)}
                  />
                  <DateField
                    compact
                    showHint={false}
                    value={term.endDate}
                    min={term.startDate || undefined}
                    disabled={term.included === false}
                    aria-label={`${term.name} end date`}
                    onChange={(v) => updateDraft(i, "endDate", v)}
                  />
                </div>
              </li>
            ))}
          </ul>
          <Button
            onClick={onCreateDrafts}
            disabled={
              isCreating || termDrafts.filter((t) => t.included).length === 0
            }
            className="w-full h-12 rounded-none bg-[#0a1f1a] hover:bg-[#246a59] shadow-[3px_3px_0_0_rgba(36,106,89,0.35)]"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving terms...
              </>
            ) : (
              `Save ${termDrafts.filter((t) => t.included).length} selected term${termDrafts.filter((t) => t.included).length === 1 ? "" : "s"}`
            )}
          </Button>
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
  { label: "1 stream", names: ["A"], hint: "One class per grade" },
  { label: "2 streams", names: ["A", "B"], hint: "Common split" },
  { label: "3 streams", names: ["A", "B", "C"], hint: "Larger school" },
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
          What you&apos;re creating
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
        <p className="mt-2 text-xs text-[#1a4d42]/60 dark:text-white/45 leading-relaxed">
          Each stream is a class section students join. Pick a quick pattern for
          every grade, then tweak any row.
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
                className={`border px-2 py-2.5 text-center transition-colors ${
                  active
                    ? "border-[#246a59] bg-[#246a59] text-white"
                    : "border-[#1a4d42]/12 bg-white hover:border-[#246a59]/40 dark:bg-[#0c1a17] dark:border-white/10"
                }`}
              >
                <span className="block text-xs font-semibold">{preset.label}</span>
                <span
                  className={`block text-[10px] mt-0.5 ${
                    active ? "text-white/75" : "text-[#1a4d42]/45"
                  }`}
                >
                  {preset.names.join(" · ")}
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
          <p className="text-[10px] text-[#1a4d42]/40 tabular-nums">
            Cap. = max learners
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
                      className="inline-flex items-center border border-[#246a59]/25 bg-[#f3f7f5] dark:bg-[#071411] dark:border-[#246a59]/35"
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
                        className="h-8 w-10 rounded-none border-0 bg-transparent px-0 text-center text-sm font-bold text-[#0a1f1a] shadow-none focus-visible:ring-0 dark:text-white"
                        placeholder="?"
                      />
                      <span className="h-5 w-px bg-[#1a4d42]/15" aria-hidden />
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
                        aria-label={`${grade.gradeName} ${draft.name || "stream"} capacity`}
                        className="h-8 w-11 rounded-none border-0 bg-transparent px-1 text-center text-xs tabular-nums text-[#1a4d42]/70 shadow-none focus-visible:ring-0"
                        title="Capacity"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          removeGradeDraft(grade.gradeId, draft.id)
                        }
                        className="flex h-8 w-7 items-center justify-center text-[#1a4d42]/35 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove stream ${draft.name || ""} from ${grade.gradeName}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addStreamToGrade(grade.gradeId, grade)}
                    className="inline-flex h-8 items-center gap-1 border border-dashed border-[#1a4d42]/25 px-2 text-[11px] font-medium text-[#1a4d42]/55 hover:border-[#246a59]/50 hover:text-[#246a59]"
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
