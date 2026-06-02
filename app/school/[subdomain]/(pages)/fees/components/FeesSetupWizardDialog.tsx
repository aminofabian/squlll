"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAcademicYears } from "@/lib/hooks/useAcademicYears";
import { useGradeLevelsForSchoolType } from "@/lib/hooks/useGradeLevelsForSchoolType";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Layers,
  Percent,
  Wallet,
  ClipboardCheck,
  Plus,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { sortTermsForLetter } from "../lib/sortTermsForLetter";
import { formatAcademicYearDisplay } from "../lib/feePlanStats";
import { FEES_BRAND } from "../lib/fees-ui";
import {
  ALL_PRESET_FEE_CATEGORIES,
  PRESET_FEE_CATEGORY_GROUPS,
  titleCaseCategory,
  isDuplicateCategory,
  getCategoryColor,
} from "../lib/feeCategories";
import { CategorySplitEditor } from "./CategorySplitEditor";
import { KesAmount } from "./KesAmount";
import {
  initSplitsForCategories,
  splitsAreValid,
} from "../lib/categorySplits";
import {
  loadFeesSetupDraft,
  splitTotalAcrossCategories,
} from "../lib/feesSetupDraft";
import type { FeePlanSetupIntent } from "../lib/feePlanCreationFlow";
import { FeePlanLinkedFlowBanner } from "./FeePlanLinkedFlowBanner";
import { roundToNearestTen } from "../lib/feesAmounts";
import {
  WIZARD,
  WizardAlert,
  WizardLoading,
  WizardPanel,
  WizardReviewRow,
  WizardSection,
  WizardStepIntro,
  WizardSummaryBand,
  WizardToolbar,
  type WizardChip,
} from "./FeesSetupWizardShell";

const REQUIRED_FEE_CATEGORY = "Tuition";
const DEFAULT_SELECTED_CATEGORIES = [REQUIRED_FEE_CATEGORY] as const;

const STEP_META = [
  { title: "Academic year", icon: Calendar },
  { title: "Fee categories", icon: Layers },
  { title: "Split by category", icon: Percent },
  { title: "Amounts per grade", icon: Wallet },
  { title: "Review", icon: ClipboardCheck },
] as const;

export interface FeesSetupWizardResult {
  academicYearId?: string;
  academicYearName?: string;
  termCount: number;
  categories: string[];
  /** Percentages per category; must sum to 100 */
  categorySplits: Record<string, number>;
  gradeAmounts: Record<string, number>;
}

interface FeesSetupWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (result: FeesSetupWizardResult) => void;
  /** First-time configure vs return from fee plan drawer */
  setupIntent?: FeePlanSetupIntent;
}

export function FeesSetupWizardDialog({
  open,
  onOpenChange,
  onComplete,
  setupIntent = "initial",
}: FeesSetupWizardDialogProps) {
  const [step, setStep] = useState(1);
  const [selectedYearId, setSelectedYearId] = useState("");
  const {
    academicYears,
    loading: yearsLoading,
    getActiveAcademicYear,
  } = useAcademicYears();
  const [categories, setCategories] = useState<string[]>([
    ...DEFAULT_SELECTED_CATEGORIES,
  ]);
  const [categorySplits, setCategorySplits] = useState<Record<string, number>>(
    () => initSplitsForCategories([...DEFAULT_SELECTED_CATEGORIES]),
  );
  const [gradeAmounts, setGradeAmounts] = useState<Record<string, number>>({});
  /** Grades included in this fee plan — pick once here, not again in the plan wizard */
  const [setupGrades, setSetupGrades] = useState<string[]>([]);
  const [bulkAmount, setBulkAmount] = useState("");
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [customCategoryNames, setCustomCategoryNames] = useState<string[]>([]);
  const [categoryError, setCategoryError] = useState("");

  const { data: gradeLevels = [], isLoading: gradesLoading } =
    useGradeLevelsForSchoolType();

  const gradeNames = useMemo(
    () =>
      gradeLevels
        .map((gl) => gl.gradeLevel?.name || gl.shortName || "")
        .filter(Boolean),
    [gradeLevels],
  );

  const totalSteps = STEP_META.length;

  const yearDefaultApplied = useRef(false);

  useEffect(() => {
    if (!open) {
      yearDefaultApplied.current = false;
      return;
    }
    setStep(1);
    setCustomCategoryInput("");
    setCategoryError("");

    const draft = loadFeesSetupDraft();
    if (draft?.categories?.length) {
      if (draft.academicYearId) {
        setSelectedYearId(draft.academicYearId);
        yearDefaultApplied.current = true;
      }
      setCategories(draft.categories);
      setCategorySplits(
        initSplitsForCategories(draft.categories, draft.categorySplits),
      );
      const gradesWithAmounts = Object.entries(draft.gradeAmounts)
        .filter(([, amount]) => amount > 0)
        .map(([grade]) => grade);
      setSetupGrades(gradesWithAmounts);
      setGradeAmounts(draft.gradeAmounts);
      const presetSet = new Set<string>(ALL_PRESET_FEE_CATEGORIES);
      setCustomCategoryNames(
        draft.categories.filter((c) => !presetSet.has(c)),
      );
      return;
    }

    setCategories([...DEFAULT_SELECTED_CATEGORIES]);
    setCategorySplits(
      initSplitsForCategories([...DEFAULT_SELECTED_CATEGORIES]),
    );
    setCustomCategoryNames([]);
    setSetupGrades([]);
    setGradeAmounts({});
  }, [open]);

  useEffect(() => {
    if (
      !open ||
      yearsLoading ||
      academicYears.length === 0 ||
      yearDefaultApplied.current
    ) {
      return;
    }
    yearDefaultApplied.current = true;
    const active = getActiveAcademicYear();
    setSelectedYearId(active?.id ?? academicYears[0].id);
  }, [open, yearsLoading, academicYears, getActiveAcademicYear]);

  useEffect(() => {
    if (gradeNames.length === 0) return;
    setGradeAmounts((prev) => {
      const next = { ...prev };
      for (const name of gradeNames) {
        if (next[name] == null) next[name] = 0;
      }
      return next;
    });
    setSetupGrades((prev) =>
      prev.length > 0
        ? prev.filter((g) => gradeNames.includes(g))
        : [...gradeNames],
    );
  }, [gradeNames]);

  const toggleSetupGrade = (grade: string) => {
    setSetupGrades((prev) =>
      prev.includes(grade)
        ? prev.filter((g) => g !== grade)
        : [...prev, grade],
    );
  };

  const selectAllSetupGrades = () => setSetupGrades([...gradeNames]);

  useEffect(() => {
    setCategorySplits((prev) => initSplitsForCategories(categories, prev));
  }, [categories]);

  const selectedYear = academicYears.find((y) => y.id === selectedYearId);
  const sortedTerms = useMemo(
    () => sortTermsForLetter(selectedYear?.terms ?? []),
    [selectedYear],
  );
  const termCount = sortedTerms.length;

  const previewGrade =
    gradeNames.find((g) => (gradeAmounts[g] ?? 0) > 0) ?? gradeNames[0];
  const previewTotal = previewGrade ? gradeAmounts[previewGrade] ?? 0 : 0;

  const previewBreakdown = useMemo(() => {
    if (previewTotal <= 0 || categories.length === 0) return [];
    const amounts = splitTotalAcrossCategories(
      previewTotal,
      categories,
      categorySplits,
    );
    return categories.map((c) => ({
      category: c,
      pct: categorySplits[c] ?? 0,
      amount: amounts[c] ?? 0,
    }));
  }, [previewTotal, categories, categorySplits]);

  const toggleCategory = (cat: string) => {
    if (cat === REQUIRED_FEE_CATEGORY) return;
    setCategoryError("");
    setCategories((prev) => {
      const base = prev.includes(REQUIRED_FEE_CATEGORY)
        ? prev
        : [REQUIRED_FEE_CATEGORY, ...prev];
      return base.includes(cat)
        ? base.filter((c) => c !== cat)
        : [...base, cat];
    });
  };

  const addCustomCategory = () => {
    const name = titleCaseCategory(customCategoryInput);
    if (!name) {
      setCategoryError("Enter a category name.");
      return;
    }
    const allKnown = [
      ...categories,
      ...customCategoryNames,
      ...ALL_PRESET_FEE_CATEGORIES,
    ];
    if (isDuplicateCategory(name, allKnown)) {
      setCategoryError("This category already exists.");
      return;
    }
    setCategoryError("");
    setCustomCategoryNames((prev) => [...prev, name]);
    setCategories((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setCustomCategoryInput("");
  };

  const removeCustomCategory = (name: string) => {
    setCustomCategoryNames((prev) => prev.filter((c) => c !== name));
    setCategories((prev) => prev.filter((c) => c !== name));
  };

  const setGradeAmount = (grade: string, raw: number) => {
    setGradeAmounts((prev) => ({
      ...prev,
      [grade]: roundToNearestTen(raw),
    }));
  };

  const applySameToAll = (amount: number) => {
    const rounded = roundToNearestTen(amount);
    setGradeAmounts((prev) => {
      const next = { ...prev };
      for (const g of setupGrades) next[g] = rounded;
      return next;
    });
  };

  const handleFinish = () => {
    const roundedGradeAmounts = Object.fromEntries(
      setupGrades.map((g) => [g, roundToNearestTen(gradeAmounts[g] ?? 0)]),
    );
    onComplete({
      academicYearId: selectedYearId,
      academicYearName: selectedYear?.name,
      termCount,
      categories,
      categorySplits,
      gradeAmounts: roundedGradeAmounts,
    });
    onOpenChange(false);
  };

  const canContinue =
    step === 1
      ? !!selectedYearId && termCount > 0 && !yearsLoading
      : step === 2
        ? categories.includes(REQUIRED_FEE_CATEGORY) && categories.length > 0
        : step === 3
          ? splitsAreValid(categories, categorySplits)
          : step === 4
            ? setupGrades.length > 0 &&
              setupGrades.some((g) => (gradeAmounts[g] ?? 0) > 0)
            : true;

  const currentStep = STEP_META[step - 1];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="z-[60] flex h-full w-full flex-col gap-0 border-l border-slate-200 p-0 sm:max-w-xl [&>button]:top-4 [&>button]:right-4"
      >
        <SheetHeader
          className="shrink-0 space-y-2.5 border-b border-slate-200/80 px-5 pb-3 pt-5 text-left"
          style={{ backgroundColor: FEES_BRAND.primaryLight }}
        >
          <div className="flex items-center gap-3 pr-8">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
              style={{ backgroundColor: FEES_BRAND.primary }}
            >
              <Wallet className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-base text-slate-900">
                {setupIntent === "revise"
                  ? "Update fee setup"
                  : "Set up school fees"}
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-600">
                Step {step} of {totalSteps} · {currentStep?.title}
              </SheetDescription>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex gap-1" aria-hidden>
              {STEP_META.map((meta, i) => (
                <div
                  key={meta.title}
                  className="h-1 flex-1 overflow-hidden rounded-full bg-slate-300/70"
                  title={meta.title}
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      i + 1 <= step ? "w-full" : "w-0",
                    )}
                    style={{ backgroundColor: FEES_BRAND.primary }}
                  />
                </div>
              ))}
            </div>
            <div className="hidden gap-0.5 sm:flex">
              {STEP_META.map((meta, i) => (
                <span
                  key={meta.title}
                  className={cn(
                    "flex-1 truncate text-center text-[10px] leading-tight",
                    i + 1 === step
                      ? "font-semibold text-slate-800"
                      : i + 1 < step
                        ? "text-slate-500"
                        : "text-slate-400",
                  )}
                >
                  {meta.title}
                </span>
              ))}
            </div>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/50 px-5 py-4">
          <FeePlanLinkedFlowBanner
            phase={setupIntent === "revise" ? "setup-revise" : "setup"}
            setupIntent={setupIntent}
            className="mb-4"
          />
          {step === 1 && (
            <div className={WIZARD.body}>
              <WizardStepIntro>
                {termCount === 3
                  ? "Choose the academic year for this fee plan. Most schools bill in three terms per year."
                  : termCount > 0
                    ? `This year has ${termCount} terms — fees you set up apply to each one.`
                    : "Choose the academic year. Add terms in school settings if none appear below."}
              </WizardStepIntro>

              {yearsLoading ? (
                <WizardLoading message="Loading academic years…" />
              ) : academicYears.length === 0 ? (
                <WizardAlert title="No academic year yet">
                  Create an academic year and terms in school settings before
                  setting up fees.
                </WizardAlert>
              ) : (
                <WizardPanel
                  summary={
                    <WizardSummaryBand
                      label="Year"
                      chips={
                        selectedYear
                          ? [
                              {
                                key: selectedYear.id,
                                label: formatAcademicYearDisplay(
                                  selectedYear.name,
                                ),
                                meta:
                                  termCount > 0
                                    ? `· ${termCount} term${termCount === 1 ? "" : "s"}`
                                    : undefined,
                              },
                            ]
                          : []
                      }
                      emptyText="Select a year below"
                    />
                  }
                >
                  <WizardSection label="Academic year" bordered={false}>
                    <Select
                      value={selectedYearId || undefined}
                      onValueChange={setSelectedYearId}
                    >
                      <SelectTrigger
                        id="fees-setup-year"
                        className="h-9 border-slate-200 bg-white text-sm"
                      >
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map((y) => {
                          const label = formatAcademicYearDisplay(y.name);
                          const count = y.terms?.length ?? 0;
                          return (
                            <SelectItem key={y.id} value={y.id}>
                              {label}
                              {count > 0
                                ? ` · ${count} term${count === 1 ? "" : "s"}`
                                : ""}
                              {y.isActive ? " · current" : ""}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </WizardSection>

                  {selectedYear ? (
                    <WizardSection
                      label="Terms in this year"
                      bordered={false}
                      className="pt-0"
                    >
                      {sortedTerms.length > 0 ? (
                        <ol className="flex flex-wrap gap-1.5">
                          {sortedTerms.map((t, index) => (
                            <li key={t.id}>
                              <span className="inline-flex items-center gap-1 rounded-md border border-slate-200/80 bg-white px-2 py-1 text-xs font-medium text-slate-800">
                                <span
                                  className="flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold text-white"
                                  style={{
                                    backgroundColor: FEES_BRAND.primary,
                                  }}
                                >
                                  {index + 1}
                                </span>
                                {t.name}
                              </span>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="flex items-center gap-1.5 text-xs text-amber-800">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          Add at least one term in school settings to continue.
                        </p>
                      )}
                    </WizardSection>
                  ) : null}
                </WizardPanel>
              )}
            </div>
          )}

          {step === 2 && (
            <div className={WIZARD.body}>
              <WizardStepIntro>
                Add fee types for your fee letter.{" "}
                <span className="font-medium text-slate-800">
                  {REQUIRED_FEE_CATEGORY}
                </span>{" "}
                is required — pick others only if you charge them.
              </WizardStepIntro>

              <WizardPanel
                error={categoryError || null}
                summary={
                  <WizardSummaryBand
                    label="Selected"
                    count={categories.length}
                    chips={categories.map(
                      (cat): WizardChip => ({
                        key: cat,
                        label: cat,
                        required: cat === REQUIRED_FEE_CATEGORY,
                        onRemove:
                          cat === REQUIRED_FEE_CATEGORY
                            ? undefined
                            : () => toggleCategory(cat),
                      }),
                    )}
                  />
                }
                footer={
                  <WizardToolbar>
                    <Input
                      id="custom-fee-category"
                      className="h-8 flex-1 border-slate-200 bg-white text-xs"
                      placeholder="Add category…"
                      value={customCategoryInput}
                      onChange={(e) => {
                        setCustomCategoryInput(e.target.value);
                        setCategoryError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomCategory();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 shrink-0 gap-1 border-slate-200 bg-white px-2.5 text-xs"
                      onClick={addCustomCategory}
                      disabled={!customCategoryInput.trim()}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </Button>
                  </WizardToolbar>
                }
              >
                <div className="max-h-[min(220px,36vh)] space-y-3 overflow-y-auto px-3 py-3">
                  {customCategoryNames.length > 0 ? (
                    <WizardSection label="Custom" bordered={false} className="p-0">
                      <div className="flex flex-wrap gap-1.5">
                        {customCategoryNames.map((cat) => {
                          const on = categories.includes(cat);
                          return (
                            <span
                              key={`custom-${cat}`}
                              className={cn(
                                "inline-flex items-center rounded-md border text-xs font-medium",
                                on
                                  ? "border-transparent text-white"
                                  : "border-dashed border-slate-300 text-slate-600",
                              )}
                              style={
                                on
                                  ? { backgroundColor: FEES_BRAND.primary }
                                  : undefined
                              }
                            >
                              <button
                                type="button"
                                onClick={() => toggleCategory(cat)}
                                className="inline-flex items-center gap-1 px-2 py-1"
                              >
                                {on ? (
                                  <Check className="h-3 w-3 shrink-0" />
                                ) : null}
                                {cat}
                              </button>
                              <button
                                type="button"
                                aria-label={`Delete ${cat}`}
                                onClick={() => removeCustomCategory(cat)}
                                className={cn(
                                  "rounded-r-md border-l border-white/20 px-1 py-1",
                                  on ? "hover:bg-white/15" : "hover:bg-slate-200",
                                )}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </WizardSection>
                  ) : null}

                  {PRESET_FEE_CATEGORY_GROUPS.map((group) => (
                    <WizardSection
                      key={group.label}
                      label={group.label}
                      bordered={false}
                      className="p-0"
                    >
                      <div className="flex flex-wrap gap-1.5">
                        {group.items.map((cat) => {
                          const on = categories.includes(cat);
                          const isRequired = cat === REQUIRED_FEE_CATEGORY;
                          return (
                            <button
                              key={cat}
                              type="button"
                              disabled={isRequired}
                              aria-pressed={on}
                              onClick={() => toggleCategory(cat)}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                                isRequired &&
                                  "cursor-default border-transparent text-white",
                                !isRequired &&
                                  on &&
                                  "border-transparent text-white",
                                !isRequired &&
                                  !on &&
                                  "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                              )}
                              style={
                                on
                                  ? { backgroundColor: FEES_BRAND.primary }
                                  : undefined
                              }
                            >
                              {!isRequired && on ? (
                                <Check className="h-3 w-3 shrink-0" />
                              ) : null}
                              {cat}
                              {isRequired ? (
                                <span className="rounded bg-white/20 px-1 text-[9px] font-bold uppercase">
                                  Req
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </WizardSection>
                  ))}
                </div>
              </WizardPanel>
            </div>
          )}

          {step === 3 && (
            <div className={WIZARD.body}>
              <WizardStepIntro>
                Split each term&apos;s total across your {categories.length}{" "}
                {categories.length === 1 ? "category" : "categories"}. Percentages
                must add up to 100%.
              </WizardStepIntro>

              <WizardPanel
                summary={
                  <WizardSummaryBand
                    label="Splitting"
                    chips={categories.map(
                      (cat): WizardChip => ({
                        key: cat,
                        label: cat,
                        meta: `${categorySplits[cat] ?? 0}%`,
                        dotClassName: getCategoryColor(cat),
                      }),
                    )}
                  />
                }
              >
                <WizardSection bordered={false} className="py-3">
                  <CategorySplitEditor
                    compact
                    categories={categories}
                    splits={categorySplits}
                    onChange={setCategorySplits}
                    previewTotalKes={
                      previewTotal > 0 ? previewTotal : 45000
                    }
                  />
                </WizardSection>
              </WizardPanel>
            </div>
          )}

          {step === 4 && (
            <div className={WIZARD.body}>
              <WizardStepIntro>
                Choose grades and enter each{" "}
                <span className="font-medium text-slate-800">term total</span>.
                You won&apos;t enter these again in the fee plan wizard.
              </WizardStepIntro>

              {gradesLoading ? (
                <WizardLoading message="Loading grades…" />
              ) : gradeNames.length === 0 ? (
                <WizardAlert title="No grades found">
                  Add grade levels in school settings first.
                </WizardAlert>
              ) : (
                <WizardPanel
                  summary={
                    <WizardSummaryBand
                      label="Selected"
                      count={setupGrades.length}
                      emptyText="Pick grades below"
                      action={
                        <button
                          type="button"
                          className="shrink-0 text-[11px] font-semibold hover:underline"
                          style={{ color: FEES_BRAND.primary }}
                          onClick={selectAllSetupGrades}
                        >
                          Select all
                        </button>
                      }
                      chips={setupGrades.map(
                        (grade): WizardChip => ({
                          key: grade,
                          label: grade,
                          meta:
                            (gradeAmounts[grade] ?? 0) > 0
                              ? `· ${(gradeAmounts[grade] ?? 0).toLocaleString("en-KE")}`
                              : undefined,
                          onRemove: () => toggleSetupGrade(grade),
                        }),
                      )}
                    />
                  }
                  footer={
                    <WizardToolbar>
                      <Input
                        type="number"
                        className="h-8 flex-1 border-slate-200 bg-white text-xs"
                        placeholder="Same amount for all selected…"
                        value={bulkAmount}
                        onChange={(e) => setBulkAmount(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const v = Number(bulkAmount);
                            if (v > 0) applySameToAll(v);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 shrink-0 border-slate-200 bg-white px-2.5 text-xs"
                        disabled={setupGrades.length === 0}
                        onClick={() => {
                          const v = Number(bulkAmount);
                          if (v > 0) applySameToAll(v);
                        }}
                      >
                        Apply to all
                      </Button>
                    </WizardToolbar>
                  }
                >
                  <WizardSection label="Grades">
                    <div className="flex max-h-[72px] flex-wrap gap-1.5 overflow-y-auto">
                      {gradeNames.map((grade) => {
                        const on = setupGrades.includes(grade);
                        return (
                          <button
                            key={grade}
                            type="button"
                            onClick={() => toggleSetupGrade(grade)}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                              on
                                ? "border-transparent text-white"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                            )}
                            style={
                              on
                                ? { backgroundColor: FEES_BRAND.primary }
                                : undefined
                            }
                          >
                            {on ? (
                              <Check className="h-3 w-3 shrink-0" />
                            ) : null}
                            {grade}
                          </button>
                        );
                      })}
                    </div>
                  </WizardSection>

                  {setupGrades.length === 0 ? (
                    <p className="px-3 pb-3 text-xs text-rose-600">
                      Select at least one grade to enter amounts.
                    </p>
                  ) : (
                    <div className="border-t border-slate-100">
                      <div
                        className={cn(
                          WIZARD.tableHeader,
                          "grid grid-cols-[1fr_6.5rem] gap-2",
                        )}
                      >
                        <span>Grade</span>
                        <span className="text-right">Term total</span>
                      </div>
                      <ul className="max-h-[min(160px,30vh)] divide-y divide-slate-100 overflow-y-auto">
                        {setupGrades.map((grade) => (
                          <li
                            key={grade}
                            className="grid grid-cols-[1fr_6.5rem] items-center gap-2 px-2.5 py-1.5"
                          >
                            <span className="truncate text-xs font-medium text-slate-800">
                              {grade}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400">
                                KES
                              </span>
                              <Input
                                type="number"
                                className="h-7 w-full px-1.5 text-right text-xs tabular-nums"
                                value={gradeAmounts[grade] || ""}
                                onChange={(e) =>
                                  setGradeAmounts((prev) => ({
                                    ...prev,
                                    [grade]: Number(e.target.value) || 0,
                                  }))
                                }
                                onBlur={(e) =>
                                  setGradeAmount(
                                    grade,
                                    Number(e.target.value) || 0,
                                  )
                                }
                                placeholder="0"
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {previewBreakdown.length > 0 && previewTotal > 0 ? (
                    <WizardSection
                      label={`Split preview · ${previewGrade}`}
                      bordered={false}
                      className="border-t border-emerald-100 bg-emerald-50/50 py-2.5"
                    >
                      <p className="mb-2 text-xs text-emerald-800">
                        <KesAmount amount={previewTotal} size="sm" /> per term
                      </p>
                      <ul className="space-y-0.5">
                        {previewBreakdown.map((row) => (
                          <li
                            key={row.category}
                            className="flex items-center justify-between gap-2 text-xs text-slate-700"
                          >
                            <span className="flex min-w-0 items-center gap-1 truncate">
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 shrink-0 rounded-full",
                                  getCategoryColor(row.category),
                                )}
                              />
                              {row.category}
                              <span className="text-slate-400">{row.pct}%</span>
                            </span>
                            <KesAmount amount={row.amount} />
                          </li>
                        ))}
                      </ul>
                    </WizardSection>
                  ) : null}
                </WizardPanel>
              )}
            </div>
          )}

          {step === 5 && (
            <div className={WIZARD.body}>
              <WizardStepIntro>
                Review your setup. The fee plan wizard opens next — you
                won&apos;t re-enter grades or amounts there.
              </WizardStepIntro>

              <WizardPanel
                summary={
                  <WizardSummaryBand
                    label="Summary"
                    chips={[
                      {
                        key: "year",
                        label: selectedYear?.name
                          ? formatAcademicYearDisplay(selectedYear.name)
                          : "Year",
                      },
                      {
                        key: "terms",
                        label: `${termCount} terms`,
                      },
                      {
                        key: "grades",
                        label: `${setupGrades.filter((g) => (gradeAmounts[g] ?? 0) > 0).length} grades with fees`,
                      },
                    ]}
                  />
                }
              >
                <dl className="divide-y divide-slate-100">
                  <WizardReviewRow
                    label="Academic year"
                    value={
                      selectedYear?.name
                        ? formatAcademicYearDisplay(selectedYear.name)
                        : "—"
                    }
                  />
                  <WizardReviewRow
                    label="Terms"
                    value={
                      sortedTerms.length > 0
                        ? sortedTerms.map((t) => t.name).join(", ")
                        : "—"
                    }
                  />
                  <WizardReviewRow
                    label="Fee categories"
                    value={
                      <span className="flex flex-wrap justify-end gap-1">
                        {categories.map((c) => (
                          <span
                            key={c}
                            className={cn(
                              "inline-flex items-center gap-1 rounded border border-slate-200/80 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium",
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                getCategoryColor(c),
                              )}
                            />
                            {c} {categorySplits[c] ?? 0}%
                          </span>
                        ))}
                      </span>
                    }
                  />
                  <WizardReviewRow
                    label="Grades"
                    value={`${setupGrades.filter((g) => (gradeAmounts[g] ?? 0) > 0).length} of ${setupGrades.length} with amounts`}
                  />
                </dl>

                {setupGrades.some((g) => (gradeAmounts[g] ?? 0) > 0) ? (
                  <WizardSection
                    label="Term totals"
                    bordered={false}
                    className="border-t border-slate-100 bg-slate-50/40 py-2"
                  >
                    <ul className="space-y-0.5">
                      {setupGrades
                        .filter((g) => (gradeAmounts[g] ?? 0) > 0)
                        .map((grade) => (
                          <li
                            key={grade}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <span className="text-slate-700">{grade}</span>
                            <KesAmount amount={gradeAmounts[grade] ?? 0} />
                          </li>
                        ))}
                    </ul>
                  </WizardSection>
                ) : null}

                <p className="border-t border-slate-100 px-3 py-2.5 text-[11px] leading-relaxed text-slate-500">
                  Next: fine-tune the fee letter, link classes, then bill
                  students from Overview.
                </p>
              </WizardPanel>
            </div>
          )}
        </div>

        <div className="shrink-0 flex items-center justify-between gap-2 border-t border-slate-200/80 bg-white px-5 py-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 text-slate-600"
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 text-slate-500"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            {step < totalSteps ? (
              <Button
                type="button"
                size="sm"
                disabled={!canContinue}
                className="h-9 text-white"
                style={{ backgroundColor: FEES_BRAND.primary }}
                onClick={() => setStep((s) => s + 1)}
              >
                Continue
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                className="h-9 text-white"
                style={{ backgroundColor: FEES_BRAND.primary }}
              onClick={handleFinish}
            >
              {setupIntent === "revise"
                ? "Apply to fee plan"
                : "Continue to fee plan"}
            </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
