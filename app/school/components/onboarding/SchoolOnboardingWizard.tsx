"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  Loader2,
  Rocket,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useAcademicYears,
  type AcademicYear,
} from "@/lib/hooks/useAcademicYears";
import { useSchoolConfig } from "@/lib/hooks/useSchoolConfig";
import {
  getMoeAcademicYearPreset,
  getMoeTermPresets,
  moeCalendarYear,
  suggestAcademicYearDates,
  suggestAcademicYearName,
  suggestTermsForYear,
  type TermDraft,
} from "@/lib/utils/school-calendar-presets";
import {
  getTenantIdFromCookies,
  isSchoolOnboardingComplete,
  markSchoolOnboardingComplete,
} from "@/lib/utils/school-onboarding";
import { OnboardingShell, OnboardingStep } from "./onboarding-ui";
import {
  AcademicYearStepContent,
  formatDisplayDate,
  StreamsStepContent,
  TermsStepContent,
} from "./onboarding-steps";

const ONBOARDING_STEPS = [
  { id: 1, name: "Academic Year", description: "When does your year run?" },
  { id: 2, name: "Terms", description: "Teaching periods" },
  { id: 3, name: "Classes", description: "Streams per grade" },
  { id: 4, name: "Next Steps", description: "Optional setup" },
  { id: 5, name: "Done", description: "Open your dashboard" },
];

function buildInitialYearForm() {
  const name = suggestAcademicYearName();
  const { startDate, endDate } = suggestAcademicYearDates(name);
  return { name, startDate, endDate };
}

export function SchoolOnboardingWizard() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [tenantId, setTenantId] = useState<string | null>(null);

  const {
    academicYears,
    loading: yearsLoading,
    refetch: refetchYears,
  } = useAcademicYears();
  const { data: schoolConfig, refetch: refetchConfig } = useSchoolConfig();

  const [academicYearForm, setAcademicYearForm] =
    useState(buildInitialYearForm);
  const [createdAcademicYear, setCreatedAcademicYear] =
    useState<AcademicYear | null>(null);
  const [isCreatingYear, setIsCreatingYear] = useState(false);

  const [termMode, setTermMode] = useState<"suggested" | "moe" | "custom">(
    "suggested",
  );
  const [suggestedTermCount, setSuggestedTermCount] = useState(3);
  const [termDrafts, setTermDrafts] = useState<TermDraft[]>([]);
  const [customTerm, setCustomTerm] = useState<TermDraft>({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [isCreatingTerms, setIsCreatingTerms] = useState(false);

  const [gradeStreamPlans, setGradeStreamPlans] = useState<
    Record<string, { id: string; name: string; capacity: string }[]>
  >({});
  const [isCreatingStreams, setIsCreatingStreams] = useState(false);

  useEffect(() => {
    const id = getTenantIdFromCookies();
    setTenantId(id);
    if (id && isSchoolOnboardingComplete(id)) {
      router.replace("/dashboard");
    }
  }, [router]);

  const activeAcademicYear = useMemo(() => {
    if (createdAcademicYear) return createdAcademicYear;
    return academicYears.find((y) => y.isActive) || academicYears[0] || null;
  }, [academicYears, createdAcademicYear]);

  const termsForYear = useMemo(() => {
    if (!activeAcademicYear) return [];
    return (
      academicYears.find((y) => y.id === activeAcademicYear.id)?.terms || []
    );
  }, [activeAcademicYear, academicYears]);

  const gradeRows = useMemo(() => {
    if (!schoolConfig?.selectedLevels) return [];
    return schoolConfig.selectedLevels.flatMap((level) =>
      (level.gradeLevels || []).map((grade) => ({
        gradeId: grade.id,
        gradeName: grade.name,
        levelName: level.name,
        existingStreams: (grade.streams || []).map((s) => s.name),
      })),
    );
  }, [schoolConfig]);

  const gradesWithoutStreams = useMemo(
    () => gradeRows.filter((g) => g.existingStreams.length === 0),
    [gradeRows],
  );

  useEffect(() => {
    if (gradeRows.length === 0) return;
    setGradeStreamPlans((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const g of gradeRows) {
        if (!(g.gradeId in next)) {
          next[g.gradeId] =
            g.existingStreams.length === 0
              ? [{ id: `stream-${g.gradeId}-0`, name: "A", capacity: "30" }]
              : [];
          changed = true;
          continue;
        }
        const filtered = next[g.gradeId].filter(
          (d) =>
            !d.name.trim() ||
            !g.existingStreams.some(
              (s) => s.toLowerCase() === d.name.trim().toLowerCase(),
            ),
        );
        if (filtered.length !== next[g.gradeId].length) {
          next[g.gradeId] = filtered;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [gradeRows]);

  useEffect(() => {
    if (!activeAcademicYear || termDrafts.length > 0) return;
    const start = activeAcademicYear.startDate.split("T")[0];
    const end = activeAcademicYear.endDate.split("T")[0];
    setTermDrafts(suggestTermsForYear(start, end, suggestedTermCount));
    setCustomTerm({ name: "Term 1", startDate: start, endDate: "" });
  }, [activeAcademicYear, suggestedTermCount]);

  const hasAcademicYear = Boolean(activeAcademicYear);
  const hasTerms = termsForYear.length > 0;
  const hasAnyStream =
    gradesWithoutStreams.length === 0 ||
    (schoolConfig?.selectedLevels?.some((level) =>
      level.gradeLevels?.some((g) => g.streams && g.streams.length > 0),
    ) ??
      false);

  useEffect(() => {
    if (yearsLoading || !schoolConfig) return;
    const id = getTenantIdFromCookies();
    if (!id || isSchoolOnboardingComplete(id)) return;
    if (hasAcademicYear && hasTerms && gradesWithoutStreams.length === 0) {
      markSchoolOnboardingComplete(id);
      router.replace("/dashboard");
    }
  }, [
    yearsLoading,
    schoolConfig,
    hasAcademicYear,
    hasTerms,
    gradesWithoutStreams.length,
    router,
  ]);

  const setYearField = (
    field: "name" | "startDate" | "endDate",
    value: string,
  ) => {
    setAcademicYearForm((f) => ({ ...f, [field]: value }));
  };

  const applySuggestedYear = () => {
    const name = suggestAcademicYearName();
    const dates = suggestAcademicYearDates(name);
    setAcademicYearForm({ name, ...dates });
    toast.message("Suggested dates applied — adjust if needed");
  };

  const applyMoeYear = () => {
    const moe = getMoeAcademicYearPreset();
    if (!moe) {
      toast.error("MoE calendar data is unavailable");
      return;
    }
    setAcademicYearForm({
      name: moe.name,
      startDate: moe.startDate,
      endDate: moe.endDate,
    });
    toast.message(
      `Loaded ${moe.year} MoE calendar — you can still edit the dates`,
    );
  };

  const handleCreateAcademicYear = async () => {
    if (
      !academicYearForm.name.trim() ||
      !academicYearForm.startDate ||
      !academicYearForm.endDate
    ) {
      toast.error("Enter a year name and start/end dates");
      return;
    }
    if (
      new Date(academicYearForm.startDate) >= new Date(academicYearForm.endDate)
    ) {
      toast.error("End date must be after start date");
      return;
    }

    setIsCreatingYear(true);
    try {
      const response = await fetch("/api/school/create-academic-year", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          input: {
            name: academicYearForm.name.trim(),
            startDate: academicYearForm.startDate,
            endDate: academicYearForm.endDate,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to create academic year");

      setCreatedAcademicYear({
        id: result.id,
        name: result.name,
        startDate: result.startDate,
        endDate: result.endDate,
        isActive: true,
        terms: [],
      });
      setTermDrafts([]);
      toast.success(`Academic year "${result.name}" created`);
      await refetchYears();
      setCurrentStep(2);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create academic year",
      );
    } finally {
      setIsCreatingYear(false);
    }
  };

  const applySuggestedTerms = () => {
    if (!activeAcademicYear) return;
    const start = activeAcademicYear.startDate.split("T")[0];
    const end = activeAcademicYear.endDate.split("T")[0];
    setTermDrafts(suggestTermsForYear(start, end, suggestedTermCount));
    toast.message(
      `Generated ${suggestedTermCount} terms — edit names or dates below`,
    );
  };

  const applyMoeTerms = () => {
    const presets = getMoeTermPresets();
    if (presets.length === 0) {
      toast.error("MoE term data is unavailable");
      return;
    }
    setTermDrafts(presets);
    toast.message("MoE term dates loaded — review before saving");
  };

  const handleAddCustomTerm = () => {
    if (
      !customTerm.name.trim() ||
      !customTerm.startDate ||
      !customTerm.endDate
    ) {
      toast.error("Enter term name, start date, and end date");
      return;
    }
    setTermDrafts((prev) => [
      ...prev,
      { ...customTerm, name: customTerm.name.trim() },
    ]);
    setCustomTerm((t) => ({ ...t, name: "", endDate: "" }));
    toast.success("Term added to list");
  };

  const handleCreateTermDrafts = async () => {
    if (!activeAcademicYear) return;
    if (termDrafts.length === 0) {
      toast.error("Add at least one term");
      return;
    }

    setIsCreatingTerms(true);
    let created = 0;
    const errors: string[] = [];

    for (const draft of termDrafts) {
      if (draft.included === false) continue;
      try {
        const response = await fetch("/api/school/create-term", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            input: {
              name: draft.name.trim(),
              startDate: draft.startDate,
              endDate: draft.endDate,
              academicYearId: activeAcademicYear.id,
              isActive: draft.active === true,
            },
          }),
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || `Failed to create ${draft.name}`);
        created++;
      } catch (err) {
        errors.push(err instanceof Error ? err.message : draft.name);
      }
    }

    if (created > 0) {
      toast.success(`Created ${created} term${created === 1 ? "" : "s"}`);
      setTermDrafts([]);
      await refetchYears();
      if (errors.length === 0) setCurrentStep(3);
    }
    if (errors.length > 0) {
      toast.error(errors[0] || "Some terms could not be created");
    } else if (created === 0) {
      toast.error("No terms were created");
    }

    setIsCreatingTerms(false);
  };

  const handleCreateStreams = async () => {
    const jobs: {
      gradeId: string;
      gradeName: string;
      name: string;
      capacity: string;
    }[] = [];

    for (const grade of gradeRows) {
      const plans = gradeStreamPlans[grade.gradeId] || [];
      const namesInGrade = new Set<string>();

      for (const draft of plans) {
        const name = draft.name.trim();
        const capacity = draft.capacity.trim();
        if (!name) continue;

        const key = name.toLowerCase();
        if (namesInGrade.has(key)) {
          toast.error(`Duplicate stream "${name}" on ${grade.gradeName}`);
          return;
        }
        namesInGrade.add(key);

        if (grade.existingStreams.some((s) => s.toLowerCase() === key)) {
          continue;
        }

        if (!capacity || Number(capacity) < 1) {
          toast.error(
            `Capacity for "${name}" on ${grade.gradeName} must be at least 1`,
          );
          return;
        }

        jobs.push({
          gradeId: grade.gradeId,
          gradeName: grade.gradeName,
          name,
          capacity,
        });
      }
    }

    if (jobs.length === 0) {
      toast.error("Add at least one new stream to a grade");
      return;
    }

    setIsCreatingStreams(true);
    let created = 0;

    for (const job of jobs) {
      try {
        const response = await fetch("/api/school/create-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: job.name,
            capacity: job.capacity,
            gradeId: job.gradeId,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed");
        created++;
      } catch (err) {
        console.warn(`${job.gradeName} / ${job.name}:`, err);
      }
    }

    if (created > 0) {
      toast.success(`Created ${created} stream${created === 1 ? "" : "s"}`);
      await refetchConfig();
    } else {
      toast.error("No streams were created. Check names and try again.");
    }

    setIsCreatingStreams(false);
  };

  const finishOnboarding = useCallback(() => {
    const id = tenantId || getTenantIdFromCookies();
    if (id) markSchoolOnboardingComplete(id);
    router.push("/dashboard");
  }, [router, tenantId]);

  const goNext = () => {
    if (currentStep < 5) setCurrentStep((s) => s + 1);
    else finishOnboarding();
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <AcademicYearStepContent
            hasAcademicYear={hasAcademicYear}
            activeYearLabel={activeAcademicYear?.name}
            activeYearRange={
              activeAcademicYear
                ? `${formatDisplayDate(activeAcademicYear.startDate)} – ${formatDisplayDate(activeAcademicYear.endDate)}`
                : undefined
            }
            form={academicYearForm}
            onFormChange={setYearField}
            onSuggestCurrentYear={applySuggestedYear}
            onSuggestMoe={applyMoeYear}
            suggestedYearLabel={suggestAcademicYearName()}
            moeYear={moeCalendarYear}
            isCreating={isCreatingYear}
            onCreate={handleCreateAcademicYear}
          />
        );

      case 2:
        return (
          <OnboardingStep
            icon={BookOpen}
            title="Terms"
            description="Split the year into teaching periods."
          >
            <TermsStepContent
              hasAcademicYear={hasAcademicYear}
              hasTerms={hasTerms}
              academicYearName={activeAcademicYear?.name}
              existingTermNames={termsForYear.map((t) => t.name).join(", ")}
              termDrafts={termDrafts}
              onTermDraftsChange={setTermDrafts}
              termMode={termMode}
              onTermModeChange={setTermMode}
              suggestedTermCount={suggestedTermCount}
              onSuggestedTermCountChange={(n) => {
                setSuggestedTermCount(n);
                if (activeAcademicYear) {
                  const start = activeAcademicYear.startDate.split("T")[0];
                  const end = activeAcademicYear.endDate.split("T")[0];
                  setTermDrafts(suggestTermsForYear(start, end, n));
                }
              }}
              onApplySuggested={applySuggestedTerms}
              onApplyMoe={applyMoeTerms}
              moeYear={moeCalendarYear}
              customTerm={customTerm}
              onCustomTermChange={setCustomTerm}
              isCreating={isCreatingTerms}
              onCreateDrafts={handleCreateTermDrafts}
              onAddCustomTerm={handleAddCustomTerm}
            />
          </OnboardingStep>
        );

      case 3:
        return (
          <OnboardingStep
            icon={GraduationCap}
            title="Class streams"
            description="Add streams per grade — each class can have different sections."
          >
            <StreamsStepContent
              gradeRows={gradeRows}
              gradeStreamPlans={gradeStreamPlans}
              onGradeStreamPlansChange={setGradeStreamPlans}
              isCreating={isCreatingStreams}
              onCreateSelected={handleCreateStreams}
            />
          </OnboardingStep>
        );

      case 4:
        return (
          <OnboardingStep
            icon={UserPlus}
            title="What to set up next"
            description="Nothing here is required — open these when you are ready."
          >
            <ul className="space-y-3">
              <ChecklistItem
                title="Teachers"
                description="Staff who teach or manage classes."
                href="/teachers"
              />
              <ChecklistItem
                title="Students"
                description="Enroll learners and assign streams."
                href="/students"
              />
              <ChecklistItem
                title="Fees"
                description="Fee structures for the active term."
                href="/fees"
              />
              <ChecklistItem
                title="Timetable"
                description="Periods, breaks, and lessons."
                href="/timetable"
              />
            </ul>
          </OnboardingStep>
        );

      case 5:
        return (
          <OnboardingStep
            icon={Rocket}
            title="All set"
            description="Your school is ready for day-to-day use."
          >
            <div className="space-y-2 mb-4">
              <SummaryRow done={hasAcademicYear} label="Academic year" />
              <SummaryRow done={hasTerms} label="Terms" />
              <SummaryRow
                done={hasAnyStream}
                label="Class streams"
                hint={
                  hasAnyStream ? undefined : "You can add these from Classes"
                }
              />
              <SummaryRow done label="Curriculum levels" />
            </div>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Your dashboard is where you manage daily operations. You can
                  return to any skipped step from the sidebar.
                </p>
              </CardContent>
            </Card>
          </OnboardingStep>
        );

      default:
        return null;
    }
  };

  if (yearsLoading && currentStep === 1 && !hasAcademicYear) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#f4f7f6] dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-[#246a59]" />
        <p className="text-sm text-slate-500">Loading your school…</p>
      </div>
    );
  }

  const skipLabel =
    currentStep === 3 && gradeRows.length > 0 ? "Skip streams" : "Skip";

  const continueDisabled =
    (currentStep === 1 && !hasAcademicYear) || (currentStep === 2 && !hasTerms);

  return (
    <OnboardingShell
      subdomain={subdomain}
      currentStep={currentStep}
      totalSteps={5}
      steps={ONBOARDING_STEPS}
      onBack={goBack}
      onSkip={currentStep < 5 ? goNext : undefined}
      skipLabel={skipLabel}
      showSkip={currentStep < 5}
      onContinue={currentStep === 5 ? finishOnboarding : goNext}
      continueLabel={currentStep === 5 ? "Open dashboard" : "Continue"}
      isContinueDisabled={continueDisabled}
    >
      {renderStepContent()}
    </OnboardingShell>
  );
}

function SummaryRow({
  done,
  label,
  hint,
}: {
  done: boolean;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span
        className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${done ? "bg-emerald-500" : "bg-slate-300"}`}
      />
      <span>
        <span className={done ? "text-foreground" : "text-muted-foreground"}>
          {label}
        </span>
        {hint && (
          <span className="block text-xs text-muted-foreground">{hint}</span>
        )}
      </span>
    </div>
  );
}

function ChecklistItem({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  const router = useRouter();
  return (
    <li className="flex items-start justify-between gap-4 border p-3 bg-slate-50 dark:bg-slate-800/50">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 rounded-none"
        onClick={() => router.push(href)}
      >
        Open
      </Button>
    </li>
  );
}
